-- Tabelas Principais do Meta Ads Integration

DROP TABLE IF EXISTS public.meta_integrations CASCADE;
DROP TABLE IF EXISTS public.ad_accounts CASCADE;

CREATE TABLE public.meta_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meta_user_id TEXT,
  access_token TEXT NOT NULL,
  business_ids JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'connected',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

CREATE TABLE public.ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  currency TEXT DEFAULT 'BRL',
  timezone_name TEXT DEFAULT 'America/Sao_Paulo',
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  integration_id UUID REFERENCES public.meta_integrations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meta_account_id)
);

-- Habilitar RLS
ALTER TABLE public.meta_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;

-- Políticas para meta_integrations
CREATE POLICY "Admins podem ver meta integrations" 
  ON public.meta_integrations FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'MASTER');

CREATE POLICY "Admins podem inserir/atualizar meta integrations"
  ON public.meta_integrations FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'MASTER');

-- Políticas para ad_accounts
CREATE POLICY "Admins veem todas as ad_accounts"
  ON public.ad_accounts FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'MASTER');

CREATE POLICY "Clientes veem a sua ad_account vinculada"
  ON public.ad_accounts FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Gestores veem ad_accounts dos seus clientes"
  ON public.ad_accounts FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM public.gestor_clients WHERE gestor_id = auth.uid()
    )
  );

CREATE POLICY "Admins gerenciam ad_accounts"
  ON public.ad_accounts FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'MASTER');
