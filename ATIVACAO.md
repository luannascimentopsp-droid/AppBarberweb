# Ativar a Martins Barbearia

## 1. Criar o banco

Crie um projeto em https://supabase.com/dashboard, pertencente à sua conta. Guarde a senha do banco em um gerenciador de senhas; ela não é usada no site.

No SQL Editor do projeto novo, execute nesta ordem:

1. `supabase/migrations/001_barbearia.sql`
2. `supabase/migrations/002_importacao.sql`

A primeira migração é para instalação nova e não deve ser reaplicada sobre tabelas existentes.

## 2. Liberar o primeiro dono

No SQL Editor, substitua os exemplos pelo nome e pelo e-mail real do proprietário:

```sql
insert into barber.profiles (email, name, role)
values (lower('seu-email@exemplo.com'), 'Seu nome', 'owner');
```

Depois, o dono cria a própria senha em **Primeiro acesso** no site e confirma o e-mail. O banco associa a identidade verificada ao perfil. Somente alguém com administração do banco pode criar outro dono; não há escolha de papel na tela de login.

## 3. Configurar autenticação e e-mails

Em Authentication:

- Habilite e-mail/senha, cadastro de usuários e confirmação de e-mail.
- Configure a política de senha com pelo menos 10 caracteres.
- Configure SMTP próprio para confirmação e recuperação. O SMTP padrão do Supabase é restrito a endereços da equipe do projeto e não atende à operação normal com barbeiros. [Documentação oficial](https://supabase.com/docs/guides/auth/auth-smtp).
- Em URL Configuration, defina Site URL como o endereço final do sistema e inclua o mesmo endereço em Redirect URLs. Durante desenvolvimento, adicione `http://127.0.0.1:8766/`.

O dono libera cada barbeiro em **Profissionais** usando seu e-mail. Cada um define a própria senha em **Primeiro acesso**. Não é enviado convite automático ao cadastrar um profissional.

## 4. Conectar o site

Em `config.js`, preencha:

```js
window.BARBER_CONFIG = {
  supabaseUrl: "https://SEU-PROJETO.supabase.co",
  supabasePublishableKey: "sb_publishable_SUA_CHAVE_PUBLICAVEL"
};
```

Use a URL e a chave **publicável** do projeto. Não use `sb_secret_...`, senha de banco, token pessoal ou `service_role`. Se utilizar a chave legada, deve ser exclusivamente a `anon`. [Chaves do Supabase](https://supabase.com/docs/guides/api/api-keys).

Execute `npm run build` após alterar a configuração.

## 5. Hospedar

Publique apenas `dist/` em uma hospedagem de sites estáticos que aceite o uso comercial e a interface autenticada, como Cloudflare Pages. O repositório pode continuar no GitHub.

Configuração de build:

- Comando: `npm ci && npm run build`
- Diretório de saída: `dist`
- Node.js: 22 ou superior

Ative HTTPS e use a URL final na configuração de autenticação. Como as rotas são internas à aplicação, não há regra especial de redirecionamento para subcaminhos.

O GitHub Pages consegue servir os arquivos, mas não é a recomendação para operar este sistema: a documentação restringe hospedagem de operações comerciais e desaconselha o envio de senhas. [Limites do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## 6. Trazer os registros antigos

1. Mantenha uma cópia da versão antiga e dos dados antes da mudança.
2. Abra `exportar-antigo.html` no **mesmo endereço e navegador** da versão antiga. O armazenamento local é vinculado ao endereço: uma prévia localhost não enxerga os dados de um site publicado.
3. Baixe o JSON. Ele exclui senhas e sessões. Nenhum registro local é apagado.
4. No sistema online, cadastre os profissionais com os nomes usados no histórico.
5. Entre como dono e vá a Minha conta → Exportação e dados antigos → Importar.

A importação acrescenta clientes e atendimentos e ignora registros idênticos já importados. O lote é transacional: um erro não deixa importação parcial. Clientes ou profissionais homônimos precisam ser identificados antes da migração, porque a versão antiga usava o nome como vínculo. Até 10.000 clientes e 10.000 atendimentos por arquivo, limitado a 10 MB na interface.

As metas e dados de conta antigos ficam preservados no JSON original, mas não são importados automaticamente; configure-os novamente. Preços e comissões históricos dos atendimentos são preservados.

## 7. Operação

Faça a validação com duas contas e dados de demonstração antes do primeiro atendimento real. Configure backups do PostgreSQL e retenção conforme a necessidade do negócio. A exportação JSON pelo sistema é complementar e não recria usuários do Supabase Auth.

Para retirar o acesso de um funcionário, use **Desativar acesso** em Profissionais. Os registros financeiros ficam preservados e o banco recusa novas operações daquele perfil.
