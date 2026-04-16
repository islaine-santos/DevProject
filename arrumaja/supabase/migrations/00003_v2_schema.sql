-- ArrumaJá v2: Extended schema for trust, wallet, subscriptions, KYC, campaigns

-- ============================================================
-- 1. Alter users table: add genero column
-- ============================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS genero TEXT DEFAULT 'nao_informado';

-- ============================================================
-- 2. Professionals table (replaces professional_profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  estado TEXT DEFAULT '',
  regiao_atuacao TEXT DEFAULT '',
  plano TEXT DEFAULT 'free' CHECK (plano IN ('free', 'boost', 'pro_boost')),
  avaliacao_media NUMERIC(3,2) DEFAULT 0,
  total_avaliacoes INTEGER DEFAULT 0,
  disponivel BOOLEAN DEFAULT true,
  kyc_status TEXT DEFAULT 'pendente' CHECK (kyc_status IN ('pendente', 'em_analise', 'aprovado', 'reprovado', 'suspenso')),
  kyc_tier INTEGER DEFAULT 0 CHECK (kyc_tier IN (0, 1, 2, 3)),
  kyc_docs JSONB DEFAULT '{}',
  selo TEXT DEFAULT 'novo' CHECK (selo IN ('novo', 'verificado', 'premium', 'suspenso')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals public read" ON public.professionals
  FOR SELECT USING (ativo = true AND kyc_status = 'aprovado');

CREATE POLICY "Own professional read" ON public.professionals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Professional update own" ON public.professionals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Professional insert own" ON public.professionals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can read all
CREATE POLICY "Admin read all professionals" ON public.professionals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo = 'admin')
  );

CREATE POLICY "Admin update professionals" ON public.professionals
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo = 'admin')
  );

-- ============================================================
-- 3. Services table (replaces service_categories)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icone TEXT DEFAULT '',
  descricao TEXT DEFAULT '',
  ativa BOOLEAN DEFAULT true
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services public read" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Admin manage services" ON public.services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo = 'admin')
  );

-- ============================================================
-- 4. Professional_Services (N:N)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.professional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  UNIQUE(professional_id, service_id)
);

ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professional_services public read" ON public.professional_services
  FOR SELECT USING (true);

CREATE POLICY "Professional manage own services" ON public.professional_services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_services.professional_id AND user_id = auth.uid())
  );

-- ============================================================
-- 5. Alter orders table for v2 flow
-- ============================================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS genero_preferencia TEXT DEFAULT 'qualquer';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS valor_estimado_min NUMERIC(10,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS valor_estimado_max NUMERIC(10,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS valor_final NUMERIC(10,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS necessita_visita_tecnica BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS proposta_em TIMESTAMPTZ;

-- Update status check to include new statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('criado', 'aguardando_profissional', 'proposta_enviada', 'aceito', 'em_andamento', 'concluido', 'cancelado', 'expirado'));

-- Rename categoria_id to service_id if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'categoria_id') THEN
    ALTER TABLE public.orders RENAME COLUMN categoria_id TO service_id;
  END IF;
END $$;

-- ============================================================
-- 6. Wallet
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL UNIQUE REFERENCES public.professionals(id) ON DELETE CASCADE,
  saldo NUMERIC(10,2) DEFAULT 0 CHECK (saldo >= 0)
);

ALTER TABLE public.wallet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professional read own wallet" ON public.wallet
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.professionals WHERE id = wallet.professional_id AND user_id = auth.uid())
  );

CREATE POLICY "Admin read wallets" ON public.wallet
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo = 'admin')
  );

-- ============================================================
-- 7. Wallet Transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallet(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('credito', 'debito', 'saque')),
  valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT DEFAULT '',
  referencia_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professional read own transactions" ON public.wallet_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.wallet w
      JOIN public.professionals p ON p.id = w.professional_id
      WHERE w.id = wallet_transactions.wallet_id AND p.user_id = auth.uid()
    )
  );

-- ============================================================
-- 8. Subscriptions B2B (profissional)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions_b2b (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id),
  plano TEXT NOT NULL CHECK (plano IN ('boost', 'pro_boost')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado', 'expirado')),
  inicio TIMESTAMPTZ DEFAULT now(),
  fim TIMESTAMPTZ,
  pagamento_via TEXT DEFAULT 'stripe' CHECK (pagamento_via IN ('stripe', 'wallet')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions_b2b ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professional read own b2b sub" ON public.subscriptions_b2b
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.professionals WHERE id = subscriptions_b2b.professional_id AND user_id = auth.uid())
  );

-- ============================================================
-- 9. Subscriptions B2C (Clube Casa Segura)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions_b2c (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado', 'expirado')),
  inicio TIMESTAMPTZ DEFAULT now(),
  fim TIMESTAMPTZ,
  meses_ativos INTEGER DEFAULT 0,
  visita_gratuita_disponivel BOOLEAN DEFAULT false,
  cashback_acumulado NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions_b2c ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User read own b2c sub" ON public.subscriptions_b2c
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 10. Campaigns
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT DEFAULT '',
  ong_nome TEXT DEFAULT '',
  ong_url TEXT DEFAULT '',
  ativa BOOLEAN DEFAULT false,
  inicio TIMESTAMPTZ,
  fim TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaigns public read" ON public.campaigns
  FOR SELECT USING (true);

CREATE POLICY "Admin manage campaigns" ON public.campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo = 'admin')
  );

-- ============================================================
-- 11. Donations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.reviews(id),
  campanha_id UUID NOT NULL REFERENCES public.campaigns(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User read own donations" ON public.donations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User create donation" ON public.donations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 12. Security Incidents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  reporter_id UUID NOT NULL REFERENCES public.users(id),
  reported_id UUID NOT NULL REFERENCES public.users(id),
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_analise', 'resolvido', 'arquivado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User read own incidents" ON public.security_incidents
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admin manage incidents" ON public.security_incidents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo = 'admin')
  );

-- ============================================================
-- 13. Notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT DEFAULT '',
  lida BOOLEAN DEFAULT false,
  referencia_id UUID,
  referencia_tipo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================
-- 14. Disputes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  iniciado_por UUID NOT NULL REFERENCES public.users(id),
  motivo TEXT NOT NULL,
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'mediacao', 'resolvido', 'encerrado')),
  resolucao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dispute participants can read" ON public.disputes
  FOR SELECT USING (
    auth.uid() = iniciado_por
    OR EXISTS (
      SELECT 1 FROM public.orders WHERE orders.id = disputes.order_id
        AND (orders.cliente_id = auth.uid() OR orders.profissional_id = auth.uid())
    )
  );

CREATE POLICY "Admin manage disputes" ON public.disputes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND tipo = 'admin')
  );

-- ============================================================
-- 15. Auto-create wallet when professional is created
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_professional()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallet (professional_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_professional_created ON public.professionals;
CREATE TRIGGER on_professional_created
  AFTER INSERT ON public.professionals
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_professional();

-- ============================================================
-- 16. Update users trigger to handle 'admin' type
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, tipo, genero)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'cliente'),
    COALESCE(NEW.raw_user_meta_data->>'genero', 'nao_informado')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
