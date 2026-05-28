-- ================================================================
-- ZMKT Dashboard — WhatsApp Leads (CTWA Integration)
-- Captura automática de leads do WhatsApp via anúncios CTWA
-- ================================================================

CREATE TABLE IF NOT EXISTS public.whatsapp_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  wa_id TEXT NOT NULL,
  display_name TEXT,
  first_message TEXT,
  ad_id TEXT,
  ad_title TEXT,
  campaign_id TEXT,
  campaign_name TEXT,
  client_id TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'lost')),
  score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  score_label TEXT DEFAULT 'Frio' CHECK (score_label IN ('Frio', 'Morno', 'Quente', 'Convertido')),
  score_reason TEXT,
  conversation_summary TEXT,
  messages_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wa_id)
);

-- RLS
ALTER TABLE public.whatsapp_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read whatsapp_leads"
  ON public.whatsapp_leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert whatsapp_leads"
  ON public.whatsapp_leads FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update whatsapp_leads"
  ON public.whatsapp_leads FOR UPDATE
  TO service_role
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_wa_id ON public.whatsapp_leads(wa_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_status ON public.whatsapp_leads(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_score_label ON public.whatsapp_leads(score_label);
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_created_at ON public.whatsapp_leads(created_at DESC);
