const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://nlgwoetmyqbdqdhgeidh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZ3dvZXRteXFiZHFkaGdlaWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTkwMCwiZXhwIjoyMDkxNzQ3OTAwfQ.WxeLRrwvnTgxHMWOD6ULl9d4KbXvRyWZs6nCiaOpUoc'
);

async function main() {
  // Get client IDs
  const { data: clients } = await supabase.from('clients').select('id, name');
  console.log('Clients found:', clients.length);
  
  const clientMap = {};
  clients.forEach(c => clientMap[c.name] = c.id);

  // Get ad account IDs
  const { data: accounts } = await supabase.from('ad_accounts').select('id, client_id, name');
  console.log('Ad accounts found:', accounts.length);
  
  const accountMap = {};
  accounts.forEach(a => accountMap[a.name] = { id: a.id, client_id: a.client_id });

  // Try creating campaigns table via SQL through REST
  const createSQL = `
    CREATE TABLE IF NOT EXISTS public.campaigns (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      client_id uuid REFERENCES public.clients(id),
      ad_account_id uuid REFERENCES public.ad_accounts(id),
      name text NOT NULL,
      objective text,
      status text DEFAULT 'active',
      spend numeric DEFAULT 0,
      impressions integer DEFAULT 0,
      reach integer DEFAULT 0,
      clicks integer DEFAULT 0,
      cpc numeric DEFAULT 0,
      leads integer DEFAULT 0,
      lead_type text,
      custom_metrics jsonb DEFAULT '{}'::jsonb,
      period text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role full access on campaigns" ON public.campaigns FOR ALL USING (true);
  `;
  
  // Use the REST API directly for DDL
  const response = await fetch('https://nlgwoetmyqbdqdhgeidh.supabase.co/rest/v1/rpc/exec_sql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZ3dvZXRteXFiZHFkaGdlaWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTkwMCwiZXhwIjoyMDkxNzQ3OTAwfQ.WxeLRrwvnTgxHMWOD6ULl9d4KbXvRyWZs6nCiaOpUoc',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZ3dvZXRteXFiZHFkaGdlaWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTkwMCwiZXhwIjoyMDkxNzQ3OTAwfQ.WxeLRrwvnTgxHMWOD6ULl9d4KbXvRyWZs6nCiaOpUoc'
    },
    body: JSON.stringify({ sql: createSQL })
  });
  
  if (!response.ok) {
    console.log('DDL via RPC failed (expected), will try inserting directly...');
    // The table might already exist or we may not have exec_sql function
    // Let's try inserting directly
  }

  // Insert campaign data
  const campaigns = [
    {
      client_id: clientMap['M&C Cortinas'],
      name: 'Campanha de Branding',
      objective: 'BRANDING',
      status: 'active',
      spend: 0,
      impressions: 26626,
      reach: 32360,
      clicks: 599,
      cpc: 0.15,
      leads: 12,
      lead_type: 'whatsapp',
      custom_metrics: { profileVisits: 2198, newFollowers: 623 },
      period: '2026-04'
    },
    {
      client_id: clientMap['M Politano Imóveis'],
      name: 'Saint Paul | Vila Botanique | One Home',
      objective: 'LEAD_GENERATION',
      status: 'active',
      spend: 4500.00,
      impressions: 113947,
      reach: 49149,
      clicks: 1374,
      cpc: 3.27,
      leads: 102,
      lead_type: 'form',
      custom_metrics: {
        subCampaigns: [
          { name: 'Saint Paul', leads: 17, reach: 12452, clicks: 173 },
          { name: 'Vila Botanique', leads: 34, reach: 17354, clicks: 534 },
          { name: 'One Home', leads: 51, reach: 19343, clicks: 667 }
        ]
      },
      period: '2026-04'
    },
    {
      client_id: clientMap['Jardim Barzan'],
      name: 'Geração de Mensagens',
      objective: 'MESSAGES',
      status: 'active',
      spend: 1517.92,
      impressions: 105129,
      reach: 43489,
      clicks: 822,
      cpc: 14.88,
      leads: 102,
      lead_type: 'whatsapp',
      custom_metrics: { linkClicks: 373 },
      period: '2026-04'
    },
    {
      client_id: clientMap['VEG Logistica'],
      name: 'Geração de B2B',
      objective: 'MESSAGES',
      status: 'active',
      spend: 756.03,
      impressions: 83133,
      reach: 15329,
      clicks: 1050,
      cpc: 5.95,
      leads: 127,
      lead_type: 'whatsapp',
      custom_metrics: { linkClicks: 291 },
      period: '2026-04'
    },
    {
      client_id: clientMap['ARO Transportes'],
      name: 'Campanha de Branding',
      objective: 'BRANDING',
      status: 'active',
      spend: 775.42,
      impressions: 165991,
      reach: 116462,
      clicks: 0,
      cpc: 0.18,
      leads: 0,
      lead_type: null,
      custom_metrics: { profileVisits: 4234, newFollowers: 98, audience: 'Varejo e Eletronicos - Decisores de Logistica' },
      period: '2026-04'
    },
  ];

  const { data: inserted, error } = await supabase.from('campaigns').insert(campaigns).select();
  if (error) {
    console.log('Campaign insert error:', error.message);
    console.log('Table may not exist. Please create via Supabase Dashboard SQL Editor.');
  } else {
    console.log('Campaigns inserted:', inserted.length);
    inserted.forEach(c => console.log('  -', c.name, '|', c.spend));
  }
}

main().catch(console.error);
