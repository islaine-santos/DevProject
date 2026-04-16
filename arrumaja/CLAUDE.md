# CLAUDE.md — ArrumaJá

## Sobre o projeto
ArrumaJá é um marketplace de serviços domésticos com foco em confiança e poder de escolha. Cliente pede serviço, até 3 profissionais enviam propostas com estimativa de valor, cliente compara e escolhe o melhor. Diferencial: pilar de confiança (filtro "só mulheres", background check/KYC, selos de verificação) + Wallet do profissional. Monetização via assinatura B2C (Clube Casa Segura) + destaque pago B2B.

## Stack
- **Frontend**: React + Vite + Tailwind CSS (TypeScript)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions)
- **Deploy**: Vercel
- **E-mail**: Resend
- **Analytics**: PostHog
- **KYC**: idwall ou Truora (API)
- **Pagamento**: Stripe ou Mercado Pago (Fase 2)

## Estrutura do projeto
```
arrumaja/
├── CLAUDE.md
├── ARRUMAJA_BLUEPRINT.md  ← blueprint técnico completo (SEMPRE consultar para regras de negócio)
├── .env.example
├── src/
│   ├── components/
│   │   ├── ui/            ← Button, Input, Card, Modal, Badge, StarRating
│   │   ├── layout/        ← Shell, Navbar, Sidebar, Footer, MobileNav
│   │   ├── orders/        ← OrderCard, OrderTimeline, GenderFilterToggle
│   │   ├── proposals/     ← ProposalCard, ProposalComparison, ProposalForm
│   │   ├── professionals/ ← ProfessionalCard, SeloBadge, KycStatusBanner
│   │   └── common/        ← CampaignBanner, NotificationBell, WalletBalance
│   ├── pages/             ← ver seção Rotas abaixo
│   ├── hooks/             ← useAuth, useOrders, useProposals, useWallet, useSubscription, useNotifications
│   ├── lib/               ← supabase.ts, constants.ts, utils.ts
│   ├── types/             ← TypeScript types/interfaces
│   └── styles/            ← globals.css
├── supabase/
│   ├── migrations/        ← SQL (001_users, 002_services, 003_orders, 004_proposals, ...)
│   ├── seed.sql           ← categorias + admin inicial
│   └── functions/         ← Edge Functions (cron-expiracao, wallet-credito, kyc-webhook, proposal-limit-check)
├── public/
└── package.json
```

## Variáveis de ambiente (.env.example)
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=contato@usearrumaja.com.br
KYC_API_KEY=your-kyc-api-key
KYC_API_URL=https://api.idwall.co
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com
VITE_APP_URL=https://usearrumaja.com.br
VITE_APP_NAME=ArrumaJá
```
Prefixo `VITE_` = frontend. Sem prefixo = server-side only (NUNCA expor).

## Convenções
- TypeScript obrigatório
- Componentes funcionais com hooks
- Tailwind para estilização (sem CSS modules)
- Naming: PascalCase para componentes, camelCase para funções/variáveis
- Supabase client em `src/lib/supabase.ts`
- Queries via Supabase JS client (não SQL raw no frontend)
- Mobile-first: toda tela projetada para mobile antes de desktop
- Operações financeiras (wallet, cashback) devem usar transações no banco
- Limite de propostas (máx 3 pendentes por pedido) enforced via trigger ou Edge Function

## Regras de negócio críticas

### Fluxo do Pedido — Modelo de Múltiplas Propostas (v4)
1. Cliente cria pedido → `aguardando_profissional`
2. Até 3 profissionais enviam propostas (tabela `proposals`)
3. Cliente compara propostas lado a lado e escolhe 1
4. Proposta aceita → pedido `aceito`, demais `recusada`
5. Se recusar todas → slots reabrem para novas propostas

### Status do Pedido
```
criado → aguardando_profissional → aceito → em_andamento → concluido
                                 ↘ cancelado                ↘ cancelado
                                 ↘ expirado (48h sem proposta)
```
NÃO existe `proposta_enviada` no pedido. Propostas têm status próprio.

### Tabela `proposals`
- Máx 3 propostas `pendente` por pedido
- UNIQUE (order_id, profissional_id)
- Aceitar 1 → demais `recusada` automaticamente

### Contexto do Local
Campo `animais_no_local` em orders — cliente indica se há pets no ambiente.

### Filtro "Só Mulheres"
- Toggle para contas femininas, fallback 2h

### KYC / Wallet / Monetização
- KYC: Tier 1 (API) → Tier 2 (manual) → Tier 3 (selo)
- Wallet: R$ 40/visita gratuita, pagar Boost ou sacar (mín R$ 100)
- Clube Casa Segura: R$ 14,90/mês, visita grátis após 3 meses, cashback 10%
- B2B: Boost R$ 29,90/mês, Pro Boost R$ 59,90/mês

### Guardas de rota
- **ProtectedRoute** — redireciona `/login` se não autenticado
- **KycGuard** — profissional sem KYC aprovado → `/profissional/verificacao`

## Tabelas (19)
users, professionals, services, professional_services, orders, proposals, reviews, subscriptions_b2b, subscriptions_b2c, wallet, wallet_transactions, donations, campaigns, security_incidents, notifications, messages, disputes, chat_moderation_alerts (Fase 2), moderation_patterns (Fase 2)

## Comandos
```bash
npm run dev          # servidor local
npm run build        # build de produção
npx supabase start   # Supabase local
npx supabase db push # aplicar migrations
```
