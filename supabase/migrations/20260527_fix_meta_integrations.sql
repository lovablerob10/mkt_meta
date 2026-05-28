-- ================================================================
-- ZMKT Dashboard — Fix: Meta Integrations + Client columns
-- Corrige 3 gaps críticos no banco de dados
-- 
-- COMO RODAR:
-- 1. Abra https://supabase.com/dashboard/project/nlgwoetmyqbdqdhgeidh/sql
-- 2. Cole este SQL inteiro
-- 3. Clique "Run"
-- ================================================================

-- 1. Tabela meta_integrations (armazena token Meta do MASTER)
CREATE TABLE IF NOT EXISTS public.meta_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meta_user_id TEXT,
  access_token TEXT NOT NULL,
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- RLS para meta_integrations
ALTER TABLE public.meta_integrations ENABLE ROW LEVEL SECURITY;

-- Master pode ler/escrever suas integrações
CREATE POLICY "Master pode gerenciar integracoes" ON public.meta_integrations
  FOR ALL USING (public.get_user_role() = 'MASTER');

-- Service role (Edge Functions) acesso total
CREATE POLICY "Service role acesso total meta_integrations" ON public.meta_integrations
  FOR ALL TO service_role USING (true);

-- 2. Adicionar colunas de ativos Meta na tabela clients
-- bm_id: ID do Business Manager vinculado ao cliente
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS bm_id TEXT;

-- ad_account_id: ID da conta de anúncio Meta (ex: act_123456)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS ad_account_id TEXT;

-- whatsapp_phone_id: Phone Number ID do WhatsApp Business (usado pelo webhook)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS whatsapp_phone_id TEXT;

-- 3. Index para lookup rápido de cliente por whatsapp_phone_id
-- O webhook recebe mensagens e precisa identificar qual cliente é o dono do número
CREATE INDEX IF NOT EXISTS idx_clients_whatsapp_phone_id ON public.clients(whatsapp_phone_id);

-- ================================================================
-- VERIFICAÇÃO: Rode estas queries após a migração para confirmar
-- ================================================================
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'clients' AND column_name IN ('bm_id', 'ad_account_id', 'whatsapp_phone_id');
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'meta_integrations';
