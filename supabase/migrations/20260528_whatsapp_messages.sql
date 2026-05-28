-- ================================================================
-- ZMKT Dashboard — WhatsApp Messages (Histórico completo)
-- Armazena TODAS as mensagens de cada lead, não só a primeira
-- 
-- COMO RODAR:
-- 1. Abra https://supabase.com/dashboard/project/nlgwoetmyqbdqdhgeidh/sql
-- 2. Cole este SQL inteiro
-- 3. Clique "Run"
-- ================================================================

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.whatsapp_leads(id) ON DELETE CASCADE,
  wa_id TEXT NOT NULL,
  direction TEXT DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT DEFAULT 'text',   -- text, image, video, audio, document, location, sticker
  content TEXT,                        -- Texto da mensagem ou descrição do tipo
  media_url TEXT,                      -- URL da mídia (se aplicável)
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  raw_payload JSONB                    -- Payload bruto da Meta (para debug)
);

-- RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read whatsapp_messages"
  ON public.whatsapp_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert whatsapp_messages"
  ON public.whatsapp_messages FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_lead_id ON public.whatsapp_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_wa_id ON public.whatsapp_messages(wa_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp DESC);

-- Adicionar contador de mensagens na tabela de leads (se não existir)
-- A coluna messages_count já existe no schema original
