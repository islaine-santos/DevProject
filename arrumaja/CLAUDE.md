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
│   ├── migrations/        ← SQL migrations
│   ├── seed.sql           ← categorias de serviço + admin inicial
│   └── functions/         ← Edge Functions (cron-expiracao, wallet-credito, kyc-webhook, proposal-limit-check)
├── public/
└── package.json
```

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
Consultar `ARRUMAJA_BLUEPRINT.md` para detalhes completos. Resumo:

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

### Filtro "Só Mulheres"
- Toggle para contas femininas, fallback 2h

### KYC / Wallet / Monetização
- KYC: Tier 1 (API) → Tier 2 (manual) → Tier 3 (selo)
- Wallet: R$ 40/visita gratuita, pagar Boost ou sacar (mín R$ 100)
- Clube Casa Segura: R$ 14,90/mês, visita grátis após 3 meses, cashback 10%
- B2B: Boost R$ 29,90/mês, Pro Boost R$ 59,90/mês

## Tabelas (17)
users, professionals, services, professional_services, orders, **proposals**, reviews, subscriptions_b2b, subscriptions_b2c, wallet, wallet_transactions, donations, campaigns, security_incidents, notifications, messages, disputes

## Comandos
```bash
npm run dev          # servidor local
npm run build        # build de produção
npx supabase start   # Supabase local
npx supabase db push # aplicar migrations
```
