// Mock data para desenvolvimento do dashboard Z/MKT
// Simula dados reais da Meta Ads API

export const MOCK_ACCOUNTS = [
  { id: 'act_001', name: 'M&C Cortinas', balance: 1250.00, currency: 'BRL', status: 'active' },
  { id: 'act_002', name: 'M Politano Imóveis', balance: 340.50, currency: 'BRL', status: 'active' },
  { id: 'act_003', name: 'Jardim Barzan', balance: 0, currency: 'BRL', status: 'empty' },
  { id: 'act_004', name: 'VEG Logistica', balance: 89.20, currency: 'BRL', status: 'low' },
  { id: 'act_005', name: 'ARO Transportes', balance: 520.00, currency: 'BRL', status: 'active' },
];

export const MOCK_CAMPAIGNS = [
  {
    id: 'camp_001',
    name: 'Campanha de Branding',
    account: 'M&C Cortinas',
    objective: 'BRANDING',
    status: 'good',
    statusLabel: 'Ativa',
    spend: 0, 
    impressions: 26626,
    reach: 32360,
    clicks: 599,
    cpc: 0.15,
    leads: 12, // conversas
    leadType: 'whatsapp',
    customMetrics: { profileVisits: 2198, newFollowers: 623 }
  },
  {
    id: 'camp_002',
    name: 'Saint Paul | Vila Botanique | One Home',
    account: 'M Politano Imóveis',
    objective: 'LEAD_GENERATION',
    status: 'good',
    statusLabel: 'Ativa',
    spend: 4500.00,
    impressions: 113947,
    reach: 49149,
    clicks: 1374,
    cpc: 3.27,
    leads: 102,
    leadType: 'form',
    customMetrics: { 
      subCampaigns: [
        { name: 'Saint Paul', leads: 17, reach: 12452, clicks: 173 },
        { name: 'Vila Botanique', leads: 34, reach: 17354, clicks: 534 },
        { name: 'One Home', leads: 51, reach: 19343, clicks: 667 }
      ]
    }
  },
  {
    id: 'camp_003',
    name: 'Geração de Mensagens',
    account: 'Jardim Barzan',
    objective: 'MESSAGES',
    status: 'warning',
    statusLabel: 'Ativa',
    spend: 1517.92,
    impressions: 105129,
    reach: 43489,
    clicks: 822, // totais
    cpc: 14.88, // custo por resultado
    leads: 102, // conversas iniciadas
    leadType: 'whatsapp',
    customMetrics: { linkClicks: 373 }
  },
  {
    id: 'camp_004',
    name: 'Geração de B2B',
    account: 'VEG Logistica',
    objective: 'MESSAGES',
    status: 'good',
    statusLabel: 'Ativa',
    spend: 756.03,
    impressions: 83133,
    reach: 15329,
    clicks: 1050, 
    cpc: 5.95, 
    leads: 127,
    leadType: 'whatsapp',
    customMetrics: { linkClicks: 291 }
  },
  {
    id: 'camp_005',
    name: 'Campanha de Branding',
    account: 'ARO Transportes',
    objective: 'BRANDING',
    status: 'good',
    statusLabel: 'Ativa',
    spend: 775.42,
    impressions: 165991,
    reach: 116462,
    clicks: 0,
    cpc: 0.18, 
    leads: 0,
    leadType: null,
    customMetrics: { profileVisits: 4234, newFollowers: 98, audience: 'Varejo e Eletronicos - Decisores de Logistica' }
  },
];

export const MOCK_CLIENTS = [
  {
    id: 'cli_001',
    name: 'M&C Cortinas',
    email: 'contato@mccortinas.com.br',
    phone: '5519999860001',
    accounts: ['act_001'],
    dashboardConfig: {
      type: 'branding',
      showMetrics: ['reach', 'impressions', 'clicks', 'cpc', 'profileVisits', 'newFollowers', 'messages'],
      dateRange: 'last_30d',
    },
    createdAt: '2026-03-15',
  },
  {
    id: 'cli_002',
    name: 'M Politano Imóveis',
    email: 'marketing@mpolitano.com.br',
    phone: '5519999860002',
    accounts: ['act_002'],
    dashboardConfig: {
      type: 'real_estate',
      showMetrics: ['leads', 'reach', 'impressions', 'clicks', 'subCampaignBreakdown'],
      dateRange: 'last_30d',
    },
    createdAt: '2026-03-20',
  },
  {
    id: 'cli_003',
    name: 'Jardim Barzan',
    email: 'mkt@jardimbarzan.com.br',
    phone: '5519999860003',
    accounts: ['act_003'],
    dashboardConfig: {
      type: 'messages',
      showMetrics: ['messages', 'impressions', 'reach', 'cpr', 'spend', 'linkClicks', 'totalClicks'],
      dateRange: 'last_30d',
    },
    createdAt: '2026-04-01',
  },
  {
    id: 'cli_004',
    name: 'VEG Logistica',
    email: 't@veglog.com.br',
    phone: '5519999860004',
    accounts: ['act_004'],
    dashboardConfig: {
      type: 'messages',
      showMetrics: ['messages', 'reach', 'impressions', 'linkClicks', 'totalClicks', 'spend', 'cpr'],
      dateRange: 'last_30d',
    },
    createdAt: '2026-04-01',
  },
  {
    id: 'cli_005',
    name: 'ARO Transportes',
    email: 'marketing@arotransportes.com.br',
    phone: '5519999860005',
    accounts: ['act_005'],
    dashboardConfig: {
      type: 'branding',
      showMetrics: ['newFollowers', 'reach', 'impressions', 'profileVisits', 'cpr', 'spend', 'audience'],
      dateRange: 'last_30d',
    },
    createdAt: '2026-04-01',
  },
];

export const MOCK_LEADS = [
  { id: 'lead_001', name: 'João Silva', email: 'joao@email.com', phone: '5519998761234', source: 'Formulário GT House', campaign: 'GT House - Formulário Imóveis', status: 'new', createdAt: '2026-04-08T14:30:00' },
  { id: 'lead_002', name: 'Maria Santos', email: 'maria@email.com', phone: '5519998765432', source: 'Formulário GT House', campaign: 'GT House - Formulário Imóveis', status: 'contacted', createdAt: '2026-04-08T10:15:00' },
  { id: 'lead_003', name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '5519998769876', source: 'WhatsApp Famoso', campaign: 'Famoso - WhatsApp Leads', status: 'converted', createdAt: '2026-04-07T16:45:00' },
  { id: 'lead_004', name: 'Ana Costa', email: 'ana@email.com', phone: '5519998763210', source: 'Formulário Metropolitano', campaign: 'Metropolitano - WhatsApp Vendas', status: 'new', createdAt: '2026-04-07T09:20:00' },
  { id: 'lead_005', name: 'Carlos Ferreira', email: 'carlos@email.com', phone: '5519998764567', source: 'WhatsApp Famoso', campaign: 'Famoso - WhatsApp Leads', status: 'contacted', createdAt: '2026-04-06T11:30:00' },
  { id: 'lead_006', name: 'Juliana Lima', email: 'juliana@email.com', phone: '5519998767890', source: 'Formulário GT House', campaign: 'GT House - Formulário Imóveis', status: 'new', createdAt: '2026-04-06T08:00:00' },
];

export const MOCK_DEMOGRAPHICS = {
  gender: [
    { name: 'Masculino', value: 58, color: '#3B6BB5' },
    { name: 'Feminino', value: 42, color: '#FF7A2E' },
  ],
  age: [
    { name: '18-24', value: 12, color: '#FF7A2E' },
    { name: '25-34', value: 35, color: '#3B6BB5' },
    { name: '35-44', value: 28, color: '#22C55E' },
    { name: '45-54', value: 15, color: '#FACC15' },
    { name: '55+', value: 10, color: '#d97bff' },
  ],
};

export const MOCK_WEEKLY_LEADS = [
  { week: 'Sem 1', whatsapp: 42, form: 8 },
  { week: 'Sem 2', whatsapp: 56, form: 12 },
  { week: 'Sem 3', whatsapp: 38, form: 6 },
  { week: 'Sem 4', whatsapp: 68, form: 15 },
];

export const MOCK_DAILY_PERFORMANCE = [
  { day: '01/04', clicks: 120, impressions: 4500 },
  { day: '02/04', clicks: 145, impressions: 5200 },
  { day: '03/04', clicks: 98, impressions: 3800 },
  { day: '04/04', clicks: 167, impressions: 6100 },
  { day: '05/04', clicks: 189, impressions: 7200 },
  { day: '06/04', clicks: 134, impressions: 5000 },
  { day: '07/04', clicks: 210, impressions: 8100 },
  { day: '08/04', clicks: 178, impressions: 6800 },
];

// Global aggregated metrics
export const MOCK_GLOBAL_METRICS = {
  totalAccounts: 5,
  totalLeads: { whatsapp: 368, form: 19, total: 387 },
  totalSpend: 5005.30,
  totalImpressions: 281576,
  totalReach: 203100,
  totalClicks: 6369,
  avgCPC: 0.79,
  estimatedProfit: 18500,
  brandViews: 281576,
  opportunities: 387,
  newFollowers: 1240,
  profileVisits: 3890,
};

export const DATE_PRESETS = [
  { label: 'Últimos 7 dias', value: 'last_7d' },
  { label: 'Últimos 30 dias', value: 'last_30d' },
  { label: 'Este mês', value: 'this_month' },
  { label: 'Máximo', value: 'maximum' },
];
