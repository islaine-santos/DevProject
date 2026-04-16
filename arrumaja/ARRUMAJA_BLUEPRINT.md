# ArrumaJá — Blueprint Técnico v2

## 1. Visão Geral
ArrumaJá é um marketplace de serviços domésticos com foco em **confiança e segurança**. Cliente pede serviço, profissional envia proposta com estimativa de valor, cliente aprova, serviço é executado. Diferencial: pilar de confiança com filtro "só mulheres", background check (KYC), selos de verificação, e Wallet do profissional.

## 2. Modelo de Negócio
- **B2C**: Clube Casa Segura R$ 14,90/mês (visita grátis após 3 meses, cashback 10%, WhatsApp prioritário)
- **B2B**: Boost R$ 29,90/mês, Pro Boost R$ 59,90/mês (destaque na busca)
- **Doações**: Campanhas sazonais (Outubro Rosa, Novembro Azul, Setembro Amarelo)
- **Wallet**: Profissional recebe R$ 40 por visita gratuita concluída, pode usar para Boost ou sacar (mín. R$ 100)

## 3. Fluxo do Pedido
1. Cliente cria pedido → `aguardando_profissional`
2. Profissional clica "Tenho Interesse" → preenche estimativa (min-max) OU flag "necessita visita técnica"
3. Pedido → `proposta_enviada`, profissional_id preenchido
4. Cliente aprova → `aceito`, chat liberado
5. Cliente recusa → volta para `aguardando_profissional`
6. Profissional inicia → `em_andamento`
7. Profissional conclui → `concluido`
8. Valor final combinado via chat/presencial → campo `valor_final`

### Status do Pedido
`criado` → `aguardando_profissional` → `proposta_enviada` → `aceito` → `em_andamento` → `concluido`
Extras: `cancelado`, `expirado`

## 4. Entidades Principais

### 4.1 Users
- id, email, nome, telefone, tipo (cliente|profissional|admin), genero, avatar_url, created_at

### 4.2 Professionals (extends users)
- id, user_id, bio, cidade, estado, regiao_atuacao, plano (free|boost|pro_boost), avaliacao_media, total_avaliacoes, disponivel, kyc_status (pendente|em_analise|aprovado|reprovado|suspenso), kyc_tier (0|1|2|3), selo (novo|verificado|premium|suspenso), ativo, created_at

### 4.3 Services (categorias)
- id, nome, slug, icone, descricao, ativa

### 4.4 Professional_Services (N:N)
- professional_id, service_id

### 4.5 Orders
- id, cliente_id, profissional_id (nullable), service_id, titulo, descricao, endereco, cidade, estado, genero_preferencia (qualquer|feminino), valor_estimado_min, valor_estimado_max, valor_final, necessita_visita_tecnica, status, criado_em, proposta_em, aceito_em, concluido_em, expira_em

### 4.6 Reviews
- id, order_id, avaliador_id, avaliado_id, nota (1-5), comentario, doacao_valor, doacao_campanha_id, created_at

### 4.7 Wallet
- id, professional_id, saldo

### 4.8 Wallet_Transactions
- id, wallet_id, tipo (credito|debito|saque), valor, descricao, referencia_id, created_at

### 4.9 Subscriptions_B2B (profissional)
- id, professional_id, plano (boost|pro_boost), status (ativo|cancelado|expirado), inicio, fim, pagamento_via (stripe|wallet)

### 4.10 Subscriptions_B2C (cliente)
- id, user_id, status (ativo|cancelado|expirado), inicio, fim, meses_ativos, visita_gratuita_disponivel, cashback_acumulado

### 4.11 Campaigns
- id, nome, slug, descricao, ong_nome, ong_url, ativa, inicio, fim

### 4.12 Donations
- id, review_id, campanha_id, user_id, valor, created_at

### 4.13 Security_Incidents
- id, order_id, reporter_id, reported_id, tipo, descricao, status (aberto|em_analise|resolvido|arquivado), created_at

### 4.14 Notifications
- id, user_id, tipo, titulo, mensagem, lida, referencia_id, referencia_tipo, created_at

### 4.15 Messages
- id, order_id, sender_id, conteudo, lida, created_at

### 4.16 Disputes
- id, order_id, iniciado_por, motivo, status (aberto|mediacao|resolvido|encerrado), resolucao, created_at

## 5. Match e Busca de Profissionais
- Filtro: categoria + região + gênero (se ativo)
- Ordem: pro_boost → boost → free, depois avaliacao_media DESC
- Somente kyc_status = 'aprovado' e ativo = true
- selo = 'suspenso' NUNCA aparece

## 6. Filtro "Só Mulheres"
- Toggle visível apenas para contas femininas (genero = 'feminino')
- Sem match feminino em 2h → fallback: ver profissionais verificados OU continuar aguardando

## 7. KYC (Know Your Customer)
- **Tier 1**: CPF/CNPJ + antecedentes (API idwall/Truora) — automático
- **Tier 2**: selfie + documento + comprovante de residência — revisão manual (SLA 24h)
- **Tier 3**: selo "verificado" — 5 serviços concluídos, média ≥ 4.8, 0 incidentes

## 8. Wallet
- Profissional recebe R$ 40 na Wallet por visita gratuita concluída (de membro Clube)
- Pode usar para pagar Boost/Pro Boost
- Saque: mínimo R$ 100 (Fase 2)
- Toda transação registrada em wallet_transactions

## 9. Monetização
- **Clube Casa Segura** R$ 14,90/mês: visita grátis após 3 meses ativo, cashback 10%, WhatsApp prioritário
- **Boost** R$ 29,90/mês: aparece antes dos free
- **Pro Boost** R$ 59,90/mês: topo + badge + destaque homepage
- **Doações**: checkbox na avaliação, valor vai para campanha ativa

## 10. Proteção anti-churn
- Visita gratuita só desbloqueada no 3º mês ativo
- Plano vendido como anual com pagamento mensal

## 11. Segurança / RLS
- Users: leitura/escrita própria; admin lê tudo
- Professionals: leitura pública (se ativo e aprovado); escrita própria
- Orders: cliente vê seus; profissional vê disponíveis na região + seus aceitos; admin vê tudo
- Wallet: somente profissional dono; admin lê
- Messages: somente participantes do pedido
- Admin: tipo = 'admin' para acessar tudo
