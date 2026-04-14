# ArrumaJá — Blueprint Técnico

## 1. Visão Geral
ArrumaJá é um marketplace que conecta clientes a profissionais de serviços domésticos (eletricista, encanador, faxineira, pintor, etc.). A plataforma facilita a solicitação, aceite e acompanhamento de serviços.

## 2. Modelo de Negócio
- **Sem taxa obrigatória**: profissionais não pagam comissão por serviço
- **Monetização**: planos de destaque pagos (boost, pro_boost) que dão prioridade na listagem
- **Planos**:
  - `free`: listagem padrão, sem destaque
  - `boost`: aparece antes dos profissionais free
  - `pro_boost`: aparece antes de todos, badge de destaque

## 3. Entidades Principais

### 3.1 Usuários (users)
- Campos: id, email, nome, telefone, tipo (cliente | profissional), avatar_url, created_at
- Autenticação via Supabase Auth (email/senha)
- Perfil público para profissionais

### 3.2 Perfil Profissional (professional_profiles)
- Campos: id, user_id, bio, categorias (array), cidade, estado, plano (free | boost | pro_boost), avaliacao_media, total_avaliacoes, disponivel, created_at
- Relacionamento 1:1 com users (onde tipo = profissional)

### 3.3 Categorias de Serviço (service_categories)
- Campos: id, nome, slug, icone, descricao, ativa
- Dados iniciais via seed.sql
- Categorias: eletricista, encanador, faxineira, pintor, jardineiro, marceneiro, pedreiro, serralheiro, ar_condicionado, mudanca

### 3.4 Pedidos (orders)
- Campos: id, cliente_id, profissional_id (nullable), categoria_id, titulo, descricao, endereco, cidade, estado, valor_estimado, status, criado_em, aceito_em, concluido_em, expira_em
- **Status flow**: criado → aguardando → aceito → em_andamento → concluido
- Status extras: cancelado, expirado
- Expiração automática: 48h após criação sem aceite

### 3.5 Avaliações (reviews)
- Campos: id, order_id, avaliador_id, avaliado_id, nota (1-5), comentario, created_at
- Apenas após pedido com status "concluido"
- Uma avaliação por pedido por parte (cliente avalia profissional e vice-versa)

### 3.6 Mensagens (messages)
- Campos: id, order_id, sender_id, conteudo, lida, created_at
- Chat entre cliente e profissional vinculado a um pedido
- Realtime via Supabase Realtime

## 4. Regras de Negócio

### 4.1 Criação de Pedido
- Apenas usuários tipo "cliente" podem criar pedidos
- Campos obrigatórios: categoria, titulo, descricao, endereco, cidade, estado
- Status inicial: "aguardando"
- Campo expira_em = created_at + 48 horas

### 4.2 Aceite de Pedido
- Apenas 1 profissional pode aceitar (first-come, first-served)
- Profissional deve ter a categoria do pedido em seu perfil
- Profissional deve estar disponível (disponivel = true)
- Ao aceitar: status → "aceito", profissional_id preenchido, aceito_em registrado

### 4.3 Listagem de Profissionais
- Ordenação primária: plano (pro_boost > boost > free)
- Ordenação secundária: avaliacao_media DESC
- Filtros: categoria, cidade, estado, disponibilidade

### 4.4 Avaliação
- Só permitida quando pedido status = "concluido"
- Nota de 1 a 5 (inteiro)
- Atualiza avaliacao_media e total_avaliacoes do profissional automaticamente

### 4.5 Expiração
- Pedidos sem aceite após 48h: status → "expirado"
- Implementar via cron job ou Edge Function agendada

## 5. Páginas da Aplicação

### 5.1 Públicas
- **Home** (`/`): landing page com busca por categoria e CTA
- **Login** (`/login`): formulário de login
- **Cadastro** (`/cadastro`): registro com escolha de tipo (cliente/profissional)
- **Categorias** (`/categorias`): listagem de todas as categorias

### 5.2 Área do Cliente
- **Dashboard** (`/cliente`): pedidos do cliente, status
- **Novo Pedido** (`/cliente/novo-pedido`): formulário de criação
- **Detalhes do Pedido** (`/cliente/pedido/:id`): status, chat, avaliação

### 5.3 Área do Profissional
- **Dashboard** (`/profissional`): pedidos disponíveis e aceitos
- **Meu Perfil** (`/profissional/perfil`): edição de perfil e categorias
- **Detalhes do Pedido** (`/profissional/pedido/:id`): detalhes, chat, ações

## 6. Políticas de Segurança (RLS)
- Usuários só podem ver/editar seus próprios dados
- Pedidos visíveis: para o cliente dono OU para profissionais da categoria (quando status = aguardando)
- Mensagens visíveis apenas para participantes do pedido
- Avaliações: leitura pública, escrita apenas por participantes do pedido concluído

## 7. API / Edge Functions
- `expire-orders`: cron job para expirar pedidos com mais de 48h
- `update-rating`: trigger para recalcular avaliacao_media após nova avaliação
- `send-notification`: enviar email via Resend quando pedido aceito/concluído
