# CLAUDE.md — ArrumaJá

## Sobre o projeto
ArrumaJá é um marketplace de serviços domésticos com foco em confiança e segurança. Cliente pede serviço, profissional envia proposta com estimativa de valor, cliente aprova, serviço é executado. Diferencial: pilar de confiança com filtro "só mulheres", background check (KYC), selos de verificação, e Wallet do profissional. Monetização via assinatura B2C (Clube Casa Segura) + destaque pago B2B.

## Stack
- **Frontend**: React + Vite + Tailwind CSS (TypeScript)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions)
- **Deploy**: Vercel
- **E-mail**: Resend
- **Analytics**: PostHog
- **KYC**: idwall ou Truora (API)
- **Pagamento**: Stripe ou Mercado Pago (assinaturas + doações)

## Estrutura do projeto
```
arrumaja/
├── CLAUDE.md
├── ARRUMAJA_BLUEPRINT.md  ← blueprint técnico completo (SEMPRE consultar para regras de negócio)
├── .env.example           ← variáveis de ambiente (copiar para .env.local)
├── src/
│   ├── components/        ← componentes React reutilizáveis
│   │   ├── ui/            ← primitivos (Button, Input, Card, Modal, Badge, StarRating)
│   │   ├── layout/        ← Shell, Navbar, Sidebar, Footer, MobileNav
│   │   ├── orders/        ← OrderCard, OrderTimeline, ProposalCard, GenderFilterToggle
│   │   ├── professionals/ ← ProfessionalCard, SeloBadge, KycStatusBanner
│   │   └── common/        ← CampaignBanner, NotificationBell, WalletBalance
│   ├── pages/             ← páginas/rotas
│   ├── hooks/             ← useAuth, useOrders, useWallet, useSubscription, useNotifications
│   ├── lib/               ← supabase.ts, constants.ts, utils.ts
│   ├── types/             ← TypeScript types/interfaces
│   └── styles/            ← globals.css, tokens Tailwind
├── supabase/
│   ├── migrations/        ← SQL migrations
│   ├── seed.sql           ← categorias de serviço + admin inicial
│   └── functions/         ← Edge Functions
├── public/
└── package.json
```

## Convenções
- TypeScript obrigatório
- Componentes funcionais com hooks
- Tailwind para estilização (sem CSS modules)
- Naming: PascalCase para componentes, camelCase para funções/variáveis
- Supabase client em `src/lib/supabase.ts`
- Queries ao banco via Supabase JS client (não SQL no frontend)
- Mobile-first: projetar todas as telas para mobile antes de desktop
- Todas as operações financeiras (wallet, cashback) devem usar transações no banco

## Regras de negócio críticas
Consultar `ARRUMAJA_BLUEPRINT.md` para detalhes completos. Resumo:
- Profissional envia PROPOSTA (estimativa min-max), cliente aprova/recusa
- Status: criado → aguardando → proposta_enviada → aceito → em_andamento → concluido
- Filtro "Só Mulheres": toggle para contas femininas, fallback 2h
- KYC: Tier 1 (API) → Tier 2 (manual) → Tier 3 (selo verificado)
- Wallet: R$ 40/visita gratuita, pagar Boost ou sacar
- Clube Casa Segura: R$ 14,90/mês, visita grátis após 3 meses

## Comandos
```bash
npm run dev          # servidor local
npm run build        # build de produção
npx supabase start   # Supabase local
npx supabase db push # aplicar migrations
```
