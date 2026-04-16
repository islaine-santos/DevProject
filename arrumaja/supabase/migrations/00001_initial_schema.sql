-- ArrumaJá: Initial database schema

-- ============================================================
-- 1. Users table (extends Supabase Auth)
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT DEFAULT '',
  tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'profissional')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, tipo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. Service Categories
-- ============================================================
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icone TEXT DEFAULT '',
  descricao TEXT DEFAULT '',
  ativa BOOLEAN DEFAULT true
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are public" ON public.service_categories
  FOR SELECT USING (true);

-- ============================================================
-- 3. Professional Profiles
-- ============================================================
CREATE TABLE public.professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT DEFAULT '',
  categorias TEXT[] DEFAULT '{}',
  cidade TEXT DEFAULT '',
  estado TEXT DEFAULT '',
  plano TEXT DEFAULT 'free' CHECK (plano IN ('free', 'boost', 'pro_boost')),
  avaliacao_media NUMERIC(3,2) DEFAULT 0,
  total_avaliacoes INTEGER DEFAULT 0,
  disponivel BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable" ON public.professional_profiles
  FOR SELECT USING (true);

CREATE POLICY "Professionals can update own profile" ON public.professional_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Professionals can insert own profile" ON public.professional_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. Orders
-- ============================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.users(id),
  profissional_id UUID REFERENCES public.users(id),
  categoria_id UUID NOT NULL REFERENCES public.service_categories(id),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  endereco TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  valor_estimado NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'aguardando'
    CHECK (status IN ('aguardando', 'aceito', 'em_andamento', 'concluido', 'cancelado', 'expirado')),
  criado_em TIMESTAMPTZ DEFAULT now(),
  aceito_em TIMESTAMPTZ,
  concluido_em TIMESTAMPTZ,
  expira_em TIMESTAMPTZ DEFAULT (now() + INTERVAL '48 hours')
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Clients can see their own orders
CREATE POLICY "Clients can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = cliente_id);

-- Professionals can see available orders (aguardando) and orders assigned to them
CREATE POLICY "Professionals can view available and own orders" ON public.orders
  FOR SELECT USING (
    status = 'aguardando'
    OR profissional_id = auth.uid()
  );

-- Clients can create orders
CREATE POLICY "Clients can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

-- Professionals can update orders (accept, status changes)
CREATE POLICY "Professionals can update orders" ON public.orders
  FOR UPDATE USING (
    status = 'aguardando'
    OR profissional_id = auth.uid()
  );

-- Clients can cancel their own orders
CREATE POLICY "Clients can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = cliente_id);

-- ============================================================
-- 5. Reviews
-- ============================================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  avaliador_id UUID NOT NULL REFERENCES public.users(id),
  avaliado_id UUID NOT NULL REFERENCES public.users(id),
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(order_id, avaliador_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Participants can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = avaliador_id);

-- Trigger to update professional's average rating
CREATE OR REPLACE FUNCTION public.update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.professional_profiles
  SET
    avaliacao_media = (
      SELECT COALESCE(AVG(nota), 0)
      FROM public.reviews
      WHERE avaliado_id = NEW.avaliado_id
    ),
    total_avaliacoes = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE avaliado_id = NEW.avaliado_id
    )
  WHERE user_id = NEW.avaliado_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_professional_rating();

-- ============================================================
-- 6. Messages (chat)
-- ============================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  sender_id UUID NOT NULL REFERENCES public.users(id),
  conteudo TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order participants can view messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = messages.order_id
        AND (orders.cliente_id = auth.uid() OR orders.profissional_id = auth.uid())
    )
  );

CREATE POLICY "Order participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_id
        AND (orders.cliente_id = auth.uid() OR orders.profissional_id = auth.uid())
    )
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
