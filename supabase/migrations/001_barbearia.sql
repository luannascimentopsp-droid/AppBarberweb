-- Aplicar uma vez no SQL Editor de um projeto Supabase novo.
-- Uma barbearia por projeto. Todas as alterações passam pela função autenticada.
begin;
create schema if not exists barber;
revoke all on schema barber from public, anon, authenticated;

create table barber.profiles (
 id uuid primary key default gen_random_uuid(),
 auth_id uuid unique references auth.users(id),
 email text not null unique check (email = lower(trim(email)) and length(email) between 3 and 254),
 name text not null check (length(trim(name)) between 2 and 100),
 role text not null default 'barber' check (role in ('owner','barber')),
 commission_rate numeric(5,2) not null default 50 check (commission_rate between 0 and 100),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table barber.clients (
 id uuid primary key default gen_random_uuid(), name text not null check (length(trim(name)) between 2 and 100),
 phone text not null default '' check (length(phone) <= 20), notes text not null default '' check (length(notes) <= 2000),
 active boolean not null default true, created_by uuid not null references barber.profiles(id), created_at timestamptz not null default now()
);
create unique index client_identity on barber.clients(lower(trim(name)), phone);
create table barber.catalog (
 id uuid primary key default gen_random_uuid(), name text not null unique check (length(trim(name)) between 2 and 100),
 price numeric(12,2) not null check (price > 0 and price <= 1000000), active boolean not null default true
);
create table barber.services (
 id uuid primary key default gen_random_uuid(), request_id uuid unique not null,
 client_id uuid not null references barber.clients(id), barber_id uuid not null references barber.profiles(id),
 service_name text not null check (length(service_name) between 1 and 1000),
 amount numeric(12,2) not null check (amount > 0 and amount <= 1000000),
 commission numeric(12,2) not null check (commission >= 0 and commission <= amount),
 day date not null, payment text not null check (payment in ('Pix','Dinheiro','Cartão','Outro')),
 created_at timestamptz not null default now(), canceled boolean not null default false,
 cancel_reason text, legacy_key text unique
);
create index service_customer_day on barber.services(client_id,day desc);
create index service_barber_day on barber.services(barber_id,day desc);
create table barber.goals (
 profile_id uuid not null references barber.profiles(id), month date not null check (extract(day from month) = 1),
 daily numeric(12,2) not null check (daily > 0 and daily <= 1000000),
 weekly numeric(12,2) not null check (weekly > 0 and weekly <= 1000000),
 monthly numeric(12,2) not null check (monthly > 0 and monthly <= 1000000),
 updated_at timestamptz not null default now(), updated_by uuid not null references barber.profiles(id),
 primary key(profile_id,month)
);
create table barber.settings (id boolean primary key default true check(id), name text not null default 'Martins Barbearia', phone text not null default '', address text not null default '');
insert into barber.settings(id) values(true);
create table barber.audit (id bigint generated always as identity primary key, actor uuid not null references barber.profiles(id), action text not null, target text, created_at timestamptz not null default now());
insert into barber.catalog(name,price) values ('Corte',30),('Sobrancelha',10),('Barba',30),('Corte/Barba',55),('Corte/Barbaterapia',70),('Corte/Barba/Sobrancelha',65),('Corte/Barbaterapia/Sobrancelha',80),('Pezinho',10),('Corte Kids',35),('Corte Máquina',20),('Corte Navalhado',35);

alter table barber.profiles enable row level security;
alter table barber.clients enable row level security;
alter table barber.catalog enable row level security;
alter table barber.services enable row level security;
alter table barber.goals enable row level security;
alter table barber.settings enable row level security;
alter table barber.audit enable row level security;
revoke all on all tables in schema barber from public, anon, authenticated;

create or replace function public.barber_api(action text, payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 me barber.profiles%rowtype; target barber.profiles%rowtype;
 uid uuid := auth.uid(); verified_email text;
 today date := (now() at time zone 'America/Sao_Paulo')::date;
 month_start date := date_trunc('month', now() at time zone 'America/Sao_Paulo')::date;
 entity_id uuid; barber_id_value uuid; client_id_value uuid; item jsonb; source jsonb;
 result jsonb; amount_value numeric; commission_value numeric; count_value int;
 service_label text; date_value date; start_day date; end_day date; legacy_id text;
begin
 if uid is null then raise exception 'Entre na sua conta para continuar.'; end if;
 select lower(email) into verified_email from auth.users where id = uid and email_confirmed_at is not null;
 if verified_email is null then raise exception 'Confirme seu e-mail antes de entrar.'; end if;
 -- A conta só é vinculada a um e-mail previamente autorizado pelo dono.
 update barber.profiles set auth_id = uid where auth_id is null and email = verified_email and active;
 select * into me from barber.profiles where auth_id = uid and active;
 if me.id is null then raise exception 'Seu acesso ainda não foi liberado pelo responsável.'; end if;

 if action = 'state' then
   return jsonb_build_object(
     'me', to_jsonb(me) - 'auth_id', 'today', today, 'month', to_char(month_start,'YYYY-MM'),
     'profiles', coalesce((select jsonb_agg(case when me.role='owner' then to_jsonb(p)-'auth_id' else jsonb_build_object('id',p.id,'name',p.name,'role',p.role,'active',p.active) end order by p.name) from barber.profiles p), '[]'::jsonb),
     'clients', coalesce((select jsonb_agg(to_jsonb(c) || jsonb_build_object('last_day',(select max(s.day) from barber.services s where s.client_id=c.id and not s.canceled)) order by c.name) from barber.clients c), '[]'::jsonb),
     'catalog', coalesce((select jsonb_agg(to_jsonb(c) order by c.name) from barber.catalog c), '[]'::jsonb),
     'goals', coalesce((select jsonb_agg(to_jsonb(g)) from barber.goals g where g.month=month_start and (me.role='owner' or g.profile_id=me.id)), '[]'::jsonb),
     'services', coalesce((select jsonb_agg(to_jsonb(s) || jsonb_build_object('client_name',c.name,'barber_name',p.name) order by s.day desc,s.created_at desc) from barber.services s join barber.clients c on c.id=s.client_id join barber.profiles p on p.id=s.barber_id where s.day >= month_start-7 and (me.role='owner' or s.barber_id=me.id)), '[]'::jsonb),
     'shop',(select to_jsonb(s)-'id' from barber.settings s));
 elsif action='client_save' then
   entity_id := nullif(payload->>'id','')::uuid;
   if entity_id is null then
     insert into barber.clients(name,phone,notes,created_by) values(trim(payload->>'name'),regexp_replace(coalesce(payload->>'phone',''),'[^0-9+]','','g'),coalesce(payload->>'notes',''),me.id) returning id into entity_id;
   else
     update barber.clients set name=trim(payload->>'name'),phone=regexp_replace(coalesce(payload->>'phone',''),'[^0-9+]','','g'),notes=coalesce(payload->>'notes','') where id=entity_id and (me.role='owner' or created_by=me.id);
     if not found then raise exception 'Você não pode editar este cliente.'; end if;
   end if;
 elsif action='service_add' then
   entity_id := (payload->>'request_id')::uuid;
   if exists(select 1 from barber.services s where s.request_id=entity_id and (me.role='owner' or s.barber_id=me.id)) then return jsonb_build_object('ok',true); end if;
   barber_id_value := case when me.role='owner' then (payload->>'barber_id')::uuid else me.id end;
   select * into target from barber.profiles where id=barber_id_value and active;
   if target.id is null then raise exception 'Selecione um profissional ativo.'; end if;
   client_id_value := (payload->>'client_id')::uuid;
   if not exists(select 1 from barber.clients where id=client_id_value and active) then raise exception 'Selecione um cliente ativo.'; end if;
   date_value := (payload->>'day')::date;
   if date_value is null or date_value > today or (me.role <> 'owner' and date_value < today-7) then raise exception 'Data inválida. Barbeiros podem registrar até 7 dias anteriores.'; end if;
   if jsonb_typeof(payload->'catalog_ids') <> 'array' or jsonb_array_length(payload->'catalog_ids') not between 1 and 20 then raise exception 'Selecione de 1 a 20 serviços.'; end if;
   select count(*),sum(c.price),string_agg(c.name,' + ' order by c.name) into count_value,amount_value,service_label from barber.catalog c where c.active and c.id in (select value::uuid from jsonb_array_elements_text(payload->'catalog_ids'));
   if count_value <> jsonb_array_length(payload->'catalog_ids') then raise exception 'A seleção de serviços mudou. Atualize a página.'; end if;
   insert into barber.services(request_id,client_id,barber_id,service_name,amount,commission,day,payment)
     values(entity_id,client_id_value,barber_id_value,service_label,amount_value,round(amount_value*target.commission_rate/100,2),date_value,payload->>'payment');
 elsif action='goals_save' then
   barber_id_value := case when me.role='owner' then coalesce(nullif(payload->>'profile_id','')::uuid,me.id) else me.id end;
   -- O bloqueio é mensal para o conjunto diário/semanal/mensal, inclusive sob concorrência.
   perform pg_advisory_xact_lock(hashtextextended(barber_id_value::text || month_start::text,0));
   if me.role <> 'owner' and exists(select 1 from barber.goals where profile_id=me.id and month=month_start) then raise exception 'Metas já definidas. Você poderá definir novos valores no próximo mês.'; end if;
   insert into barber.goals(profile_id,month,daily,weekly,monthly,updated_by) values(barber_id_value,month_start,(payload->>'daily')::numeric,(payload->>'weekly')::numeric,(payload->>'monthly')::numeric,me.id)
     on conflict(profile_id,month) do update set daily=excluded.daily,weekly=excluded.weekly,monthly=excluded.monthly,updated_at=now(),updated_by=me.id;
   entity_id := barber_id_value;
 elsif action='history' then
   entity_id := (payload->>'client_id')::uuid;
   return coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'day',s.day,'service_name',s.service_name,'amount',s.amount,'payment',s.payment,'barber_name',p.name) order by s.day desc,s.created_at desc) from barber.services s join barber.profiles p on p.id=s.barber_id where s.client_id=entity_id and not s.canceled),'[]'::jsonb);
 elsif action='report' then
   start_day := (payload->>'start')::date; end_day := (payload->>'end')::date;
   if start_day is null or end_day is null or start_day > end_day or end_day-start_day > 3660 then raise exception 'Escolha um intervalo válido de até 10 anos.'; end if;
   barber_id_value := case when me.role='owner' then nullif(payload->>'barber_id','')::uuid else me.id end;
   return coalesce((select jsonb_agg(to_jsonb(s) || jsonb_build_object('client_name',c.name,'barber_name',p.name) order by s.day desc,s.created_at desc) from barber.services s join barber.clients c on c.id=s.client_id join barber.profiles p on p.id=s.barber_id where s.day between start_day and end_day and (barber_id_value is null or s.barber_id=barber_id_value)), '[]'::jsonb);
 else
   if me.role <> 'owner' then raise exception 'Somente o dono pode realizar esta ação.'; end if;
   if action='profile_save' then
     entity_id := nullif(payload->>'id','')::uuid;
     if entity_id is null then
       insert into barber.profiles(email,name,commission_rate) values(lower(trim(payload->>'email')),trim(payload->>'name'),(payload->>'commission_rate')::numeric) returning id into entity_id;
     else
       update barber.profiles set name=trim(payload->>'name'),commission_rate=(payload->>'commission_rate')::numeric where id=entity_id;
     end if;
   elsif action='profile_active' then
     entity_id := (payload->>'id')::uuid;
     if entity_id=me.id then raise exception 'Você não pode desativar sua própria conta.'; end if;
     update barber.profiles set active=(payload->>'active')::boolean where id=entity_id and role='barber';
   elsif action='client_active' then
     entity_id := (payload->>'id')::uuid;
     update barber.clients set active=(payload->>'active')::boolean where id=entity_id;
   elsif action='catalog_save' then
     entity_id := coalesce(nullif(payload->>'id','')::uuid,gen_random_uuid());
     insert into barber.catalog(id,name,price,active) values(entity_id,trim(payload->>'name'),(payload->>'price')::numeric,coalesce((payload->>'active')::boolean,true))
       on conflict(id) do update set name=excluded.name,price=excluded.price,active=excluded.active;
   elsif action='service_cancel' then
     entity_id := (payload->>'id')::uuid;
     if length(trim(coalesce(payload->>'reason',''))) not between 5 and 500 then raise exception 'Informe um motivo de 5 a 500 caracteres.'; end if;
     update barber.services set canceled=true,cancel_reason=trim(payload->>'reason') where id=entity_id and not canceled;
     if not found then raise exception 'Atendimento não encontrado ou já cancelado.'; end if;
   elsif action='settings_save' then
     if length(trim(coalesce(payload->>'name',''))) not between 2 and 100 or length(coalesce(payload->>'phone',''))>20 or length(coalesce(payload->>'address',''))>300 then raise exception 'Confira os dados da barbearia.'; end if;
     update barber.settings set name=trim(payload->>'name'),phone=coalesce(payload->>'phone',''),address=coalesce(payload->>'address','');
   elsif action='backup' then
     return jsonb_build_object('format','martins-cloud-v1','exported_at',now(),'profiles',(select jsonb_agg(to_jsonb(p)-'auth_id') from barber.profiles p),'clients',(select jsonb_agg(c) from barber.clients c),'services',(select jsonb_agg(s) from barber.services s),'catalog',(select jsonb_agg(c) from barber.catalog c),'goals',(select jsonb_agg(g) from barber.goals g),'shop',(select to_jsonb(s) from barber.settings s),'audit',(select jsonb_agg(a) from barber.audit a));
   elsif action='audit' then
     return coalesce((select jsonb_agg(to_jsonb(a)) from (select a.action,a.target,a.created_at,p.name as actor_name from barber.audit a join barber.profiles p on p.id=a.actor order by a.id desc limit 100) a),'[]'::jsonb);
   else raise exception 'Ação desconhecida.';
   end if;
 end if;
 insert into barber.audit(actor,action,target) values(me.id,action,entity_id::text);
 return jsonb_build_object('ok',true,'id',entity_id);
exception
 when unique_violation then raise exception 'Já existe um cadastro com esses dados. Atualize a página antes de tentar novamente.';
 when check_violation or not_null_violation or invalid_text_representation or datetime_field_overflow or numeric_value_out_of_range then raise exception 'Confira os campos obrigatórios, datas e valores informados.';
end;
$$;
revoke all on function public.barber_api(text,jsonb) from public, anon;
grant execute on function public.barber_api(text,jsonb) to authenticated;
commit;
