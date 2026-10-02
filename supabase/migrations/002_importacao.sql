begin;
create or replace function public.barber_import(payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 state jsonb; me uuid; item jsonb; client uuid; professional uuid; matches int;
 imported int:=0; legacy text; dt date; money_value numeric; commission_value numeric;
begin
 state:=public.barber_api('state');
 if state->'me'->>'role'<>'owner' then raise exception 'Somente o dono pode importar dados.'; end if;
 me:=(state->'me'->>'id')::uuid;
 if jsonb_typeof(payload->'clientes') is distinct from 'array' or jsonb_typeof(payload->'servicos') is distinct from 'array' then raise exception 'Arquivo antigo inválido.'; end if;
 if jsonb_array_length(payload->'clientes')>10000 or jsonb_array_length(payload->'servicos')>10000 then raise exception 'Importe no máximo 10.000 registros por vez.'; end if;
 perform pg_advisory_xact_lock(9471523);
 for item in select value from jsonb_array_elements(payload->'clientes') loop
   if not exists(select 1 from barber.clients c where lower(trim(c.name))=lower(trim(item->>'nome')) and c.phone=regexp_replace(coalesce(item->>'telefone',''),'[^0-9+]','','g')) then
     insert into barber.clients(name,phone,notes,created_by) values(trim(item->>'nome'),regexp_replace(coalesce(item->>'telefone',''),'[^0-9+]','','g'),coalesce(item->>'observacao',''),me);
   end if;
 end loop;
 for item in select value from jsonb_array_elements(payload->'servicos') loop
   legacy:=md5(item::text);
   if exists(select 1 from barber.services where legacy_key=legacy) then continue; end if;
   select count(*) into matches from barber.profiles where lower(trim(name))=lower(trim(item->>'barbeiro'));
   if matches<>1 then raise exception 'Cadastre um único profissional com o nome: %', item->>'barbeiro'; end if;
   select id into professional from barber.profiles where lower(trim(name))=lower(trim(item->>'barbeiro'));
   select count(*) into matches from barber.clients where lower(trim(name))=lower(trim(item->>'cliente'));
   if matches>1 then raise exception 'Há clientes com nomes iguais: %. Identifique-os no arquivo antes de importar.',item->>'cliente'; end if;
   if matches=0 then
     insert into barber.clients(name,created_by) values(trim(item->>'cliente'),me) returning id into client;
   else select id into client from barber.clients where lower(trim(name))=lower(trim(item->>'cliente')); end if;
   if item->>'data' ~ '^\d{2}/\d{2}/\d{4}$' then
     dt:=to_date(item->>'data','DD/MM/YYYY');
     if to_char(dt,'DD/MM/YYYY')<>item->>'data' then raise exception 'Data inválida no histórico.'; end if;
   else dt:=(item->>'data')::date; end if;
   if dt>(now() at time zone 'America/Sao_Paulo')::date then raise exception 'O histórico possui um atendimento com data futura.'; end if;
   money_value:=(item->>'valor')::numeric;commission_value:=coalesce((item->>'comissao')::numeric,money_value/2);
   insert into barber.services(request_id,client_id,barber_id,service_name,amount,commission,day,payment,legacy_key)
     values(gen_random_uuid(),client,professional,item->>'servico',money_value,commission_value,dt,case when item->>'pagamento' in ('Pix','Dinheiro','Cartão','Outro') then item->>'pagamento' else 'Outro' end,legacy);
   imported:=imported+1;
 end loop;
 insert into barber.audit(actor,action,target) values(me,'legacy_import',imported::text);
 return jsonb_build_object('ok',true,'imported',imported);
end;
$$;
revoke all on function public.barber_import(jsonb) from public,anon;
grant execute on function public.barber_import(jsonb) to authenticated;
commit;
