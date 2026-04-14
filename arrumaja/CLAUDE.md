# CLAUDE.md — ArrumaJá

## Sobre o projeto
ArrumaJá é um marketplace de serviços domésticos. Cliente pede serviço, profissional aceita, plataforma facilita a conexão. Sem taxa obrigatória — monetização por destaque pago opcional.

## Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions)
- **Deploy**: Vercel
- **E-mail**: Resend
- **Analytics**: PostHog

## Estrutura do projeto
```
arrumaja/
├── CLAUDE.md              ← este arquivo
├── ARRUMAJA_BLUEPRINT.md  ← blueprint técnico completo (consultar para regras de negócio)
├── src/
│   ├── components/        ← componentes React reutilizáveis
│   ├── pages/             ← páginas/rotas
│   ├── hooks/             ← custom hooks (useAuth, useOrders, etc.)
│   ├── lib/               ← supabase client, utils, constants
│   ├── types/             ← TypeScript types/interfaces
│   └── styles/            ← globals, tokens Tailwind
├── supabase/
│   ├── migrations/        ← SQL migrations
│   ├── seed.sql           ← dados iniciais (categorias de serviço)
│   └── functions/         ← Edge Functions (se necessário)
├── public/
└── package.json
```

## Convenções
- TypeScript obrigatório
- Componentes funcionais com hooks
- Tailwind para estilização (sem CSS modules)
- Naming: PascalCase para componentes, camelCase para funções/variáveis
- Supabase client inicializado em `src/lib/supabase.ts`
- Todas as queries ao banco via Supabase JS client (não escrever SQL no frontend)
- Mobile-first: projetar todas as telas para mobile antes de desktop

## Regras de negócio críticas
Consultar `ARRUMAJA_BLUEPRINT.md` para detalhes, mas resumo:
- Pedido aceito por 1 profissional apenas (first-come, first-served)
- Profissionais com plano boost/pro_boost aparecem primeiro
- Ordenação secundária por avaliacao_media DESC
- Status do pedido: criado → aguardando → aceito → em_andamento → concluido
- Expiração automática após 48h sem aceite
- Avaliação apenas após status "concluido"

## Comandos
```bash
npm run dev          # servidor local
npm run build        # build de produção
npx supabase start   # Supabase local
npx supabase db push # aplicar migrations
```
