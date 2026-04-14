-- ================================================================
-- ZMKT Dashboard — Schema Inicial
-- Conforme SPEC.md §3 (RBAC + Isolamento de Dados)
-- ================================================================

-- 1. ENUM de roles
CREATE TYPE user_role AS ENUM ('MASTER', 'GESTOR', 'CLIENTE');

-- 2. Tabela de perfis (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'CLIENTE',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de clientes
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  logo_url TEXT,
  dashboard_config JSONB DEFAULT '{"type": "branding", "showMetrics": [], "dateRange": "last_30d"}'::jsonb,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vínculo gestor ↔ cliente (muitos para muitos)
CREATE TABLE public.gestor_clients (
  gestor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (gestor_id, client_id)
);

-- 5. Vínculo cliente (usuário) ↔ client record
-- Um usuário CLIENTE acessa apenas o client_id vinculado
ALTER TABLE public.profiles ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- 6. Tabela de contas de anúncio
CREATE TABLE public.ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT DEFAULT 'meta', -- meta, google, tiktok
  account_id TEXT, -- ID na plataforma (ex: act_123456)
  balance NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, low, empty, paused
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT, -- ex: "Formulário GT House"
  campaign TEXT,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'new', -- new, contacted, converted
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestor_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Helper: pegar o role do usuário logado
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper: pegar o client_id do usuário CLIENTE
CREATE OR REPLACE FUNCTION public.get_user_client_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ========================
-- PROFILES
-- ========================

-- Qualquer um pode ver seu próprio perfil
CREATE POLICY "Perfil próprio" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Master vê todos
CREATE POLICY "Master vê todos os perfis" ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'MASTER');

-- Master pode inserir/atualizar
CREATE POLICY "Master gerencia perfis" ON public.profiles
  FOR ALL USING (public.get_user_role() = 'MASTER');

-- ========================
-- CLIENTS
-- ========================

-- Master vê todos os clientes
CREATE POLICY "Master vê todos os clientes" ON public.clients
  FOR SELECT USING (public.get_user_role() = 'MASTER');

-- Master gerencia clientes
CREATE POLICY "Master gerencia clientes" ON public.clients
  FOR ALL USING (public.get_user_role() = 'MASTER');

-- Gestor vê apenas clientes atribuídos
CREATE POLICY "Gestor vê clientes atribuídos" ON public.clients
  FOR SELECT USING (
    public.get_user_role() = 'GESTOR'
    AND id IN (
      SELECT client_id FROM public.gestor_clients
      WHERE gestor_id = auth.uid()
    )
  );

-- Cliente vê apenas seu próprio registro
CREATE POLICY "Cliente vê seu registro" ON public.clients
  FOR SELECT USING (
    public.get_user_role() = 'CLIENTE'
    AND id = public.get_user_client_id()
  );

-- ========================
-- GESTOR_CLIENTS
-- ========================

-- Master vê e gerencia todos os vínculos
CREATE POLICY "Master gerencia vínculos" ON public.gestor_clients
  FOR ALL USING (public.get_user_role() = 'MASTER');

-- Gestor vê seus próprios vínculos
CREATE POLICY "Gestor vê seus vínculos" ON public.gestor_clients
  FOR SELECT USING (gestor_id = auth.uid());

-- ========================
-- AD_ACCOUNTS
-- ========================

-- Master vê todas
CREATE POLICY "Master vê todas contas" ON public.ad_accounts
  FOR SELECT USING (public.get_user_role() = 'MASTER');

-- Gestor vê contas dos clientes atribuídos
CREATE POLICY "Gestor vê contas dos clientes" ON public.ad_accounts
  FOR SELECT USING (
    public.get_user_role() = 'GESTOR'
    AND client_id IN (
      SELECT client_id FROM public.gestor_clients
      WHERE gestor_id = auth.uid()
    )
  );

-- Cliente vê suas contas
CREATE POLICY "Cliente vê suas contas" ON public.ad_accounts
  FOR SELECT USING (
    public.get_user_role() = 'CLIENTE'
    AND client_id = public.get_user_client_id()
  );

-- ========================
-- LEADS
-- ========================

-- Master vê todos os leads
CREATE POLICY "Master vê todos os leads" ON public.leads
  FOR SELECT USING (public.get_user_role() = 'MASTER');

-- Gestor vê leads dos clientes atribuídos
CREATE POLICY "Gestor vê leads dos clientes" ON public.leads
  FOR SELECT USING (
    public.get_user_role() = 'GESTOR'
    AND client_id IN (
      SELECT client_id FROM public.gestor_clients
      WHERE gestor_id = auth.uid()
    )
  );

-- Cliente vê seus leads
CREATE POLICY "Cliente vê seus leads" ON public.leads
  FOR SELECT USING (
    public.get_user_role() = 'CLIENTE'
    AND client_id = public.get_user_client_id()
  );

-- ================================================================
-- TRIGGER: criar perfil automaticamente ao cadastrar user
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CLIENTE')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- INDEXES
-- ================================================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_client_id ON public.profiles(client_id);
CREATE INDEX idx_leads_client_id ON public.leads(client_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_ad_accounts_client_id ON public.ad_accounts(client_id);
CREATE INDEX idx_gestor_clients_gestor ON public.gestor_clients(gestor_id);
CREATE INDEX idx_gestor_clients_client ON public.gestor_clients(client_id);
