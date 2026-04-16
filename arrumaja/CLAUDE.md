# CLAUDE.md — ArrumaJá v5 (Master)

## Sobre o projeto
ArrumaJá é um marketplace de serviços domésticos com foco em confiança e poder de escolha. Cliente pede serviço, até 3 profissionais enviam propostas com estimativa de valor, cliente compara e escolhe o melhor. Diferencial: pilar de confiança (filtro "só mulheres", background check/KYC, selos de verificação) + Wallet do profissional. Monetização via assinatura B2C (Clube Casa Segura) + destaque pago B2B. Domínio: usearrumaja.com.br

## Stack
- **Frontend**: React + Vite + Tailwind CSS (TypeScript)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions)
- **Deploy**: Vercel
- **E-mail**: Resend (remetente: contato@usearrumaja.com.br)
- **Analytics**: PostHog
- **KYC**: idwall ou Truora (API)
- **Pagamento**: Stripe ou Mercado Pago (Fase 2)

## Estrutura do projeto
```
arrumaja/
├── CLAUDE.md
├── ARRUMAJA_BLUEPRINT.md  ← SEMPRE consultar para regras de negócio, tabelas, endpoints, RLS
├── .env.example
├── src/
│   ├── components/
│   │   ├── ui/            ← Button, Input, Card, Modal, Badge, StarRating
│   │   ├── layout/        ← Shell, Navbar, Sidebar, Footer, MobileNav
│   │   ├── orders/        ← OrderCard, OrderTimeline, GenderFilterToggle, PetsIndicator
│   │   ├── proposals/     ← ProposalCard, ProposalComparison, ProposalForm
│   │   ├── professionals/ ← ProfessionalCard, SeloBadge, KycStatusBanner
│   │   └── common/        ← CampaignBanner, NotificationBell, WalletBalance
│   ├── pages/             ← ver seção Rotas abaixo
│   ├── hooks/             ← useAuth, useOrders, useProposals, useWallet, useSubscription, useNotifications
│   ├── lib/               ← supabase.ts, constants.ts, utils.ts
│   ├── types/             ← TypeScript types/interfaces
│   └── styles/            ← globals.css
├── supabase/
│   ├── migrations/        ← SQL (001_users.sql, 002_services.sql, 003_orders.sql, 004_proposals.sql, ...)
│   ├── seed.sql           ← categorias + admin inicial
│   └── functions/         ← Edge Functions (cron-expiracao, wallet-credito, kyc-webhook, proposal-limit-check)
├── public/
└── package.json
```

## Variáveis de ambiente (.env.example)
```bash
# Supabase
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# E-mail (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=contato@usearrumaja.com.br

# KYC (Fase 1)
KYC_API_KEY=your-kyc-api-key
KYC_API_URL=https://api.idwall.co

# Pagamento (Fase 2)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Analytics
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com

# App
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
- Storage de KYC: bucket Supabase **estritamente privado** com RLS. Admin acessa via signed URLs com expiração curta.

## Regras de negócio críticas
Consultar `ARRUMAJA_BLUEPRINT.md` para detalhes completos (tabelas, endpoints, RLS, índices, seed). Resumo:

### Fluxo do Pedido — Múltiplas Propostas
O cliente tem poder de escolha. Até 3 profissionais enviam propostas simultaneamente.

1. Cliente cria pedido (inclui flag `animais_no_local`) → `aguardando_profissional`
2. Profissionais veem pedido (incluindo indicador de animais) → clicam "Tenho Interesse"
3. Profissional preenche: estimativa min-max OU flag "necessita visita técnica" + mensagem opcional
4. Proposta criada na tabela `proposals` (status `pendente`)
5. Cliente recebe notificação a cada nova proposta
6. Com 3 propostas pendentes → pedido trava para novas
7. Cliente vê propostas lado a lado: foto, nome, selo, nota, estimativa, mensagem
8. Cliente escolhe 1 → proposta `aceita`, demais `recusada`, pedido → `aceito`, profissional_id preenchido
9. Se recusar todas → slots reabrem
10. Valor final combinado via chat/presencial → `orders.valor_final`

### Status do Pedido
```
criado → aguardando_profissional → aceito → em_andamento → concluido
                                 ↘ cancelado                ↘ cancelado
                                 ↘ expirado (48h sem proposta)
```
Nota: NÃO existe status `proposta_enviada` no pedido. Propostas têm status próprio.

### Tabela `proposals`
- Máx 3 `pendente` por pedido (trigger/Edge Function)
- UNIQUE (order_id, profissional_id)
- Quando cliente aceita 1: demais → `recusada`
- Quando pedido expira: pendentes → `expirada`

### Match e Busca
- Filtro: categoria + região + gênero (se ativo)
- Pedidos com 3 propostas pendentes: "Aguardando decisão" (sem botão)
- Na comparação: Boost/Pro Boost têm badge visual
- Somente kyc_status = 'aprovado' e ativo = true
- selo = 'suspenso' NUNCA aparece
- Profissional vê indicador de animais no local antes de enviar proposta

### Filtro "Só Mulheres"
- Toggle visível apenas para contas femininas
- Sem proposta feminina em 2h → fallback: ver profissionais verificados OU continuar aguardando

### Contexto do Local
- Campo `animais_no_local` (BOOLEAN) na tabela orders
- Checkbox "Há animais de estimação no local" na criação do pedido
- Indicador visível para o profissional no card e detalhe do pedido
- Reduz cancelamentos na porta da casa

### KYC
- Tier 1: CPF/CNPJ + antecedentes (API). Tier 2: selfie + doc + comprovante (manual, SLA 24h). Tier 3: selo novo → verificado (5 serviços, média ≥ 4.8, 0 incidentes)
- Storage Tier 2: bucket Supabase **estritamente privado**. RLS bloqueia acesso público. Apenas profissional faz upload; admin acessa via signed URLs com expiração curta. NUNCA URL pública permanente.

### Wallet
- R$ 40 na Wallet por visita gratuita concluída
- Usar para Boost/Pro Boost ou sacar (mínimo R$ 100, Fase 2)
- Toda transação em wallet_transactions

### Monetização
- B2C: Clube Casa Segura R$ 14,90/mês (visita grátis após 3 meses, cashback 10%, WhatsApp prioritário)
- B2B: Boost R$ 29,90/mês, Pro Boost R$ 59,90/mês (gateway ou Wallet)
- Doações: campanhas sazonais (Outubro Rosa, Novembro Azul, Setembro Amarelo)

### Proteção anti-churn
- Visita gratuita só desbloqueada no 3º mês ativo
- Plano vendido como anual com pagamento mensal

### Moderação de Chat — Anti-Bypass (Fase 2)
Quando o chat for implementado:
- Mensagens com padrões suspeitos (telefone, e-mail, "PIX", "WhatsApp", chaves PIX) disparam:
  - Aviso inline: "Para sua segurança, mantenha a negociação na plataforma"
  - Alerta silencioso no admin
  - Após 3 alertas no mesmo pedido: bloqueio temporário
- Edge Function `chat-moderation` + tabelas `chat_moderation_alerts` e `moderation_patterns`

## Rotas (React Router)

### Públicas
| Rota | Componente |
|------|-----------|
| `/` | LandingPage |
| `/login` | LoginPage |
| `/cadastro` | RegisterPage |
| `/cadastro/cliente` | RegisterClientPage |
| `/cadastro/profissional` | RegisterProfessionalPage |
| `/esqueci-senha` | ForgotPasswordPage |
| `/redefinir-senha` | ResetPasswordPage |
| `/profissional/:id` | ProfessionalPublicProfile |

### Cliente
| Rota | Componente |
|------|-----------|
| `/cliente` | ClientDashboard |
| `/cliente/pedido/novo` | NewOrderFlow (wizard multi-step, inclui checkbox animais) |
| `/cliente/pedido/:id` | OrderDetail (timeline + propostas lado a lado) |
| `/cliente/pedido/:id/avaliar` | ReviewPage |
| `/cliente/pedidos` | OrderHistory |
| `/cliente/clube` | ClubPage |
| `/cliente/conta` | AccountPage |
| `/cliente/notificacoes` | NotificationsPage |

### Profissional
| Rota | Componente |
|------|-----------|
| `/profissional` | ProDashboard (indicador animais no card) |
| `/profissional/pedido/:id` | ProOrderDetail (info + proposta + animais visível) |
| `/profissional/propostas` | ProMyProposals |
| `/profissional/meus-pedidos` | ProMyOrders |
| `/profissional/agenda` | ProAgenda |
| `/profissional/perfil` | ProProfile |
| `/profissional/verificacao` | ProKycPage |
| `/profissional/selo` | ProSeloPage |
| `/profissional/wallet` | ProWalletPage |
| `/profissional/planos` | ProPlansPage |
| `/profissional/notificacoes` | ProNotificationsPage |

### Admin
| Rota | Componente |
|------|-----------|
| `/admin` | AdminDashboard |
| `/admin/pedidos` | AdminOrders |
| `/admin/profissionais` | AdminProfessionals |
| `/admin/profissionais/:id/kyc` | AdminKycReview |
| `/admin/incidentes` | AdminIncidents |
| `/admin/servicos` | AdminServices |
| `/admin/campanhas` | AdminCampaigns |
| `/admin/wallets` | AdminWallets |
| `/admin/chat-alerts` | AdminChatAlerts (Fase 2) |

### Guardas de rota
- **ProtectedRoute** — redireciona `/login` se não autenticado
- **RoleGuard** — redireciona para dashboard correto se tipo errado
- **KycGuard** — profissional sem KYC aprovado → `/profissional/verificacao`

## Tabelas (19)
users, professionals, services, professional_services, orders, **proposals**, reviews, subscriptions_b2b, subscriptions_b2c, wallet, wallet_transactions, donations, campaigns, security_incidents, notifications, messages, disputes, **chat_moderation_alerts** (Fase 2), **moderation_patterns** (Fase 2)

## Comandos
```bash
npm run dev          # servidor local
npm run build        # build de produção
npx supabase start   # Supabase local
npx supabase db push # aplicar migrations
```
