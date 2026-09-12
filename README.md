# Konnexy OS Auto

Sistema web de gestão para oficinas, centros automotivos e estética automotiva, com orçamento, aprovação pública, ordem de serviço, Kanban, acompanhamento do cliente, Pix, pós-venda e operação multi-tenant.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- React Router
- Supabase Auth + PostgreSQL + Row Level Security
- Supabase RPC para links públicos tokenizados
- Vercel para deploy do frontend

## Modos de execução

### Produção

Com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` configurados, autenticação, tenant e dados operacionais usam o Supabase. O `company_id` vem do perfil autenticado e o RLS garante isolamento entre oficinas.

### Demonstração

O botão **Oficina Modelo (Demo)** inicia um ambiente local isolado. Somente nesse modo os dados são persistidos em `localStorage`. O modo demo não concede privilégios de superadmin e não deve ser usado para dados reais.

## Configuração local

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Preencha `.env.local`:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Nunca coloque `service_role` ou qualquer chave privada em variáveis `VITE_*`.

## Banco de dados / Supabase

Para um projeto novo:

1. Execute `src/supabase/schema.sql` no SQL Editor do Supabase.
2. Em seguida execute `src/supabase/migrations/20260912_production_hardening.sql`.
3. Configure em **Authentication > URL Configuration** a URL de produção e as URLs de preview necessárias.
4. Confirme que o e-mail de recuperação redireciona para `/reset-password`.

Para um banco já existente, execute somente as migrations que ainda não foram aplicadas, começando por `20260912_production_hardening.sql`.

### O que a migration de hardening faz

- remove políticas RLS anônimas permissivas;
- bloqueia leitura/edição pública direta de `quotes`, `service_orders` e `additional_approvals`;
- cria RPCs públicas que validam token, expiração e revogação;
- cria automaticamente `company`, `profile` e `company_users` no cadastro;
- restringe atualização de campos críticos de `profiles` e `companies`;
- adiciona proteção de imutabilidade para orçamentos aprovados;
- adiciona expiração/revogação aos tokens de acompanhamento e aprovações adicionais.

## Links públicos

O frontend não consulta tabelas públicas diretamente. Os fluxos abaixo usam funções `SECURITY DEFINER` com retorno sanitizado:

- `get_public_quote(token)`
- `approve_public_quote(...)`
- `reject_public_quote(...)`
- `get_public_service_order(token)`
- `respond_public_additional_approval(...)`

O token funciona como credencial bearer e deve ser enviado apenas ao cliente correspondente.

## Autenticação

- login: Supabase Auth com senha real;
- cadastro: `signUp` com bootstrap transacional da oficina;
- recuperação: `resetPasswordForEmail`;
- redefinição: `/reset-password` + `updateUser`;
- logout: encerra sessão Supabase;
- roles são lidas do PostgreSQL, nunca inferidas pelo texto do e-mail.

## Validação

```bash
npm run lint
npm run build
npm run check
```

A pipeline `.github/workflows/ci.yml` executa lint e build em pull requests e branches principais de desenvolvimento.

> O arquivo `src/test/suite.ts` contém verificações funcionais internas, mas não substitui uma suíte de integração/e2e. Antes de ampliar o produto, a próxima evolução recomendada é adicionar testes reais de RLS/RPC e Playwright para os fluxos críticos.

## Checklist antes de liberar clientes reais

- [ ] Migration de hardening aplicada no Supabase
- [ ] `VITE_SUPABASE_URL` configurada na Vercel
- [ ] `VITE_SUPABASE_ANON_KEY` configurada na Vercel
- [ ] URL de produção configurada no Supabase Auth
- [ ] Cadastro de uma oficina real testado
- [ ] Login/logout testados
- [ ] Orçamento criado em um aparelho e aberto em outro
- [ ] Aprovação/rejeição pública testadas
- [ ] OS aberta pelo link de acompanhamento em outro aparelho
- [ ] RLS validado com duas oficinas distintas
- [ ] Backup/PITR do Supabase definido conforme o plano usado

## Segurança

Não use o frontend como barreira de autorização. Toda autorização de produção deve ser garantida pelo PostgreSQL/RLS/RPC. Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no navegador, Vercel client env ou repositório.
