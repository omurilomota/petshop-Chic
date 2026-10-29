# ChicPets — Agent Guide

## Projeto

Site institucional + painel demo de um pet shop (ChicPets, Junqueirópolis-SP).
Stack: React 19 + Vite 7 + Tailwind 4 (singlefile build). Deploy: Vercel + Cloudflare Workers.

## Estrutura de pastas

```
src/
  components/        # Componentes da landing page
  demo/              # Painel demo (agenda, dashboard, clientes, etc.)
    components/      # Componentes compartilhados do demo
    hooks/           # Hooks customizados (useRetention)
  lib/               # Integrações externas (supabase, supabaseService)
sql/                 # Scripts SQL do Supabase
scripts/             # Scripts de setup/teste
workers/             # Cloudflare Workers (backend)
```

## Supabase

- **Projeto:** rfsgptqwkarsohhptsde
- **URL:** https://rfsgptqwkarsohhptsde.supabase.co
- **Frontend:** usa anon/publishable key (RLS ativo)
- **Backend/scripts:** usa secret/service role key

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| services | Catálogo de serviços (banho, tosa, consulta, taxi dog) |
| plans | Planos de assinatura (banho em dia, banho semanal, banho + tosa) |
| clients | Clientes |
| pets | Pets de cada cliente |
| appointments | Agendamentos |
| subscriptions | Assinaturas/recorrência |
| contacts | Histórico de follow-up por WhatsApp |
| feedbacks | Avaliações pós-atendimento |

### SQL

- `sql/000-complete-setup.sql` — tudo junto (tabelas + RLS + grants + seed)
- `sql/001-schema.sql` — apenas schema (tabelas + RLS + grants)
- `sql/002-seed-data.sql` — dados de exemplo

### RLS

Políticas permissivas para demo (permitir tudo para anon/authenticated/service_role).
Em produção, substituir por políticas mais restritivas.

### Grants

Necessário conceder permissões às roles:
```sql
GRANT ALL ON TABLE <table> TO anon, authenticated, service_role;
```

### Variáveis de ambiente

**`.env.local`** (nunca commitar):
```
VITE_SUPABASE_URL=https://rfsgptqwkarsohhptsde.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_URL=https://rfsgptqwkarsohhptsde.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
DATABASE_URL=postgresql://postgres:[SENHA]@db.rfsgptqwkarsohhptsde.supabase.co:5432/postgres
```

**Vercel** (configurar no painel ou via CLI):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- (apenas production, preview e development)

### Chaves

- Usar **New API keys** (publishable + secret), não as legacy (anon + service_role JWT)
- As legacy keys ainda funcionam em paralelo

### Scripts

- `npx tsx scripts/test-supabase.ts` — testa conexão e lista registros
- `npx tsx scripts/setup-supabase.ts` — guia de setup

### Serviço

- `src/lib/supabase.ts` — cliente Supabase (anon key, frontend)
- `src/lib/supabaseService.ts` — CRUD (clients, pets, appointments, subscriptions, contacts)
- `src/demo/SupabaseDemoContext.tsx` — context que busca do Supabase, fallback para mock data

## Retenção de clientes

- `src/demo/hooks/useRetention.ts` — calcula churn risk, stats de retenção
- `src/demo/components/RetentionPanel.tsx` — painel no Dashboard com métricas
- Planos de assinatura garantem recorrência
- Follow-up por WhatsApp (mensagens automáticas de confirmação/agradecimento/remarque)
- Contato rastreável (markContacted)


## Autenticação

- Supabase Auth (email/senha) para proteger o painel demo
- `src/lib/auth.ts` — signIn, signUp, signOut, getSession
- `src/demo/AuthContext.tsx` — provider de autenticação
- `src/demo/Login.tsx` — página de login
- Rotas `#/demo/*` exigem login; redireciona para `#/login`
- RLS restritivo: anon pode inserir (agendamento público), autenticado pode tudo


## Validação de formulários

- Schemas zod em `src/demo/validation.ts` (login, signup, reset password, booking)
- Validação client-side com mensagens por campo
- `zodErrorsToRecord()` converte erros zod para Record<string, string>

## Recuperação de senha

- Fluxo "Esqueci minha senha" no Login
- Página `src/demo/ResetPassword.tsx` com PKCE code exchange
- Supabase client usa `flowType: "pkce"`
- `src/lib/auth.ts`: `resetPasswordForEmail`, `updatePassword`, `exchangeCodeForSession`

## Tempo real (Realtime)

- Supabase Realtime subscriptions em `SupabaseDemoContext`
- Atualiza appointments, clients, subscriptions automaticamente
- Re-fetch debounced ao detectar mudanças

## Paginação

- Clientes: controles Anterior/Próxima, "Página X de Y"
- PAGE_SIZE = 20, reset de página ao filtrar/buscar
- Arquivo: `src/demo/Clients.tsx`

## Testes E2E (Playwright)

- Config: `playwright.config.ts`
- Testes: `e2e/navigation.spec.ts` (landing, booking, login)
- Comandos: `npm run test:e2e`, `npm run test:e2e:ui`, `npm run test:all`

## Agenda mensal

- Informações ampliadas: fontes maiores, padding maior, espaçamento entre cells
- Arquivo: `src/demo/Agenda.tsx`


## Monitoramento de erros (Sentry)

- `@sentry/react` integrado em `src/main.tsx`
- `ErrorBoundary` em `src/components/ErrorBoundary.tsx`
- DSN configurável via `VITE_SENTRY_DSN` (opcional)
- Sem DSN, o app funciona normalmente (Sentry desativado)

## Testes automatizados

- Framework: Vitest + Testing Library
- Rodar: `npm run test`
- Watch: `npm run test:watch`
- Arquivos: `*.test.ts` / `*.test.tsx` em `src/`
- Setup: `src/test/setup.ts`

## Deploy

- **Vercel:** `vercel --prod` (conectado ao projeto petshop-chic)
- **Cloudflare:** `wrangler deploy` (configurado em wrangler.jsonc)
- URL produção: https://petshop-chic.vercel.app

## Comandos úteis

```bash
npm run dev          # dev server
npm run build        # build singlefile
npm run typecheck    # tsc --noEmit
npm run deploy       # wrangler deploy (Cloudflare)
npm run test         # vitest run (testes automatizados)
npm run test:watch   # vitest (modo watch)
vercel --prod        # deploy Vercel
```

## Notas importantes

- `.env.local` está no `.gitignore` — nunca commitar
- Service role key NUNCA deve aparecer em variáveis `VITE_` ou no código do cliente
- O build usa `vite-plugin-singlefile` — todo o JS/CSS é inlined no HTML
- O app funciona offline com mock data se o Supabase estiver indisponível
