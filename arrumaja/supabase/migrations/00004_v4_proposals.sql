-- ArrumaJá v4: Multiple proposals model
-- Proposals are now a separate table. Up to 3 pending proposals per order.
-- Order no longer stores proposal-level fields.

-- ============================================================
-- 1. Create proposals table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  valor_estimado_min NUMERIC(10,2),
  valor_estimado_max NUMERIC(10,2),
  necessita_visita_tecnica BOOLEAN DEFAULT false,
  mensagem TEXT DEFAULT '',
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceita', 'recusada', 'expirada')),
  criado_em TIMESTAMPTZ DEFAULT now(),
  respondido_em TIMESTAMPTZ,
  UNIQUE (order_id, profissional_id)
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Professionals can read their own proposals
CREATE POLICY "Professional read own proposals" ON public.proposals
  FOR SELECT USING (auth.uid() = profissional_id);

-- Clients can read proposals on their orders
CREATE POLICY "Client read order proposals" ON public.proposals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = proposals.order_id
      AND orders.cliente_id = auth.uid()
    )
  );

-- Professionals can insert proposals
CREATE POLICY "Professional insert proposal" ON public.proposals
  FOR INSERT WITH CHECK (auth.uid() = profissional_id);

-- Admin full access
CREATE POLICY "Admin full proposals" ON public.proposals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo = 'admin')
  );

-- Client can update proposals on their orders (accept/reject)
CREATE POLICY "Client update order proposals" ON public.proposals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = proposals.order_id
      AND orders.cliente_id = auth.uid()
    )
  );

-- ============================================================
-- 2. Remove old proposal fields from orders (keep for backwards compat, just nullable)
-- ============================================================
-- Note: We keep these columns but they are no longer used by the app.
-- The proposals table is the source of truth for proposal data.
-- valor_estimado_min, valor_estimado_max, necessita_visita_tecnica, proposta_em
-- remain on orders but are deprecated.

-- ============================================================
-- 3. Update order status constraint to remove proposta_enviada
-- ============================================================
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('criado', 'aguardando_profissional', 'aceito', 'em_andamento', 'concluido', 'cancelado', 'expirado'));

-- ============================================================
-- 4. Function to enforce max 3 pending proposals per order
-- ============================================================
CREATE OR REPLACE FUNCTION check_proposal_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM public.proposals
    WHERE order_id = NEW.order_id AND status = 'pendente'
  ) >= 3 THEN
    RAISE EXCEPTION 'Máximo de 3 propostas pendentes por pedido atingido';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_proposal_limit
  BEFORE INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION check_proposal_limit();

-- ============================================================
-- 5. Function to reject other proposals when one is accepted
-- ============================================================
CREATE OR REPLACE FUNCTION reject_other_proposals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'aceita' AND OLD.status = 'pendente' THEN
    UPDATE public.proposals
    SET status = 'recusada', respondido_em = now()
    WHERE order_id = NEW.order_id
      AND id != NEW.id
      AND status = 'pendente';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_reject_other_proposals
  AFTER UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION reject_other_proposals();

-- ============================================================
-- 6. Index for fast lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_proposals_order_id ON public.proposals(order_id);
CREATE INDEX IF NOT EXISTS idx_proposals_profissional_id ON public.proposals(profissional_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
