# Martins Barbearia

Sistema web de gestão com visual escuro e dourado, frontend estático e Supabase Auth/PostgreSQL. Uma barbearia por projeto Supabase.

## Estado desta entrega

O Supabase foi provisionado e as duas migrações foram aplicadas. A versão atual está preparada para testes no GitHub Pages, com publicação automática de `dist/` pelo GitHub Actions. A validação do login e dos fluxos autenticados ainda está pendente. A demonstração é identificada, somente leitura, com dados fictícios. Os dados antigos do navegador não são apagados.

## Executar a prévia

Requisito: Node.js 22 ou superior.

```sh
npm ci
npm run build
npm start
```

Abra http://127.0.0.1:8766. O build gera `dist/`. Não publique a raiz do repositório nem `node_modules`.

## Recursos

- Acesso por e-mail e senha, confirmação de e-mail e recuperação de senha via Supabase.
- E-mails previamente liberados pelo dono; criar uma conta pública não concede acesso aos dados.
- Dono: equipe, ativação de acesso, preços, comissões, clientes, relatórios, metas, cancelamento com motivo, exportação e auditoria.
- Barbeiro: cadastro de clientes, registro de seus serviços, seus relatórios e metas.
- As metas diária, semanal e mensal são definidas juntas, uma vez por mês pelo barbeiro. A verificação ocorre no banco, usando o mês de São Paulo, com bloqueio transacional. O dono pode ajustar metas, com auditoria.
- Histórico completo de cliente disponível à equipe, incluindo serviços de outros profissionais, total gasto e últimos 12 meses. A visão financeira geral e as comissões de outros profissionais são reservadas ao dono.
- Registros preservados ao arquivar clientes, desativar profissionais ou cancelar serviços.
- Preço e comissão calculados no banco. Alterações de preço/comissão não modificam atendimentos anteriores.
- Exportação CSV, impressão e exportação JSON dos registros. A exportação JSON não é uma restauração automática de todo o banco: mantenha também backups PostgreSQL.
- As telas consultam dados atuais ao navegar, após salvar e ao clicar em Atualizar. Não há atualização automática em tempo real nem gravação offline.

## Ativação online

Siga [ATIVACAO.md](ATIVACAO.md). Precisaremos de um projeto Supabase do proprietário, configuração de e-mail e hospedagem da pasta `dist/`. Somente URL e chave publicável entram no frontend. Nunca inclua senha de banco, token de administração ou chave `service_role` no GitHub.

## Organização

- `app.js`: entrada; `ui.js`: telas e navegação.
- `cloud.js`: cliente Supabase e chamadas autenticadas.
- `domain.js`: moeda, datas, períodos e CSV.
- `demo.js`: dados fictícios de apresentação, sem escrita.
- `supabase/migrations/`: estrutura e funções de banco.
- `exportar-antigo.html`: exportação no endereço onde a versão antiga era utilizada.
- `scripts/`: build e servidor local que expõe somente `dist/`.

## Modelo de acesso

As tabelas ficam no schema privado `barber`, com RLS habilitada e sem permissões diretas para `anon`/`authenticated`. O frontend usa apenas as funções `barber_api` e `barber_import`. São funções `SECURITY DEFINER` com `search_path` vazio, que verificam `auth.uid()`, e-mail confirmado, perfil ativo, papel e escopo antes de cada operação. Não adicione o schema `barber` aos schemas expostos da API.

As senhas são gerenciadas pelo Supabase Auth. A sessão é mantida pelo SDK; o servidor não confia em papel, nome ou senha antigos do localStorage. Não existe senha padrão de administrador.

## Antes do uso real

A ativação deve incluir uma verificação com contas separadas de dono e barbeiro: login/recuperação, restrições de acesso, gravação concorrente de metas, fechamento do mês, relatórios, cancelamento e importação em cópia de dados. O build não valida essas integrações. Não use dados reais na demonstração.
