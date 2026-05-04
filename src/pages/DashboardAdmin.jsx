import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign, Users, Eye, MousePointer,
  MessageCircle, FileText, Zap, TrendingUp,
  ArrowUpRight, Activity, Target, RefreshCw,
  ChevronDown, ChevronUp
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { DonutChart, BarChart, LineChart } from '../components/Charts';
import {
  MOCK_GLOBAL_METRICS,
  MOCK_ACCOUNTS,
  MOCK_CAMPAIGNS,
  MOCK_DEMOGRAPHICS,
  MOCK_WEEKLY_LEADS,
  MOCK_DAILY_PERFORMANCE,
  DATE_PRESETS,
} from '../data/mockData';
import { supabase } from '../lib/supabase';

const fmt = (n) => n.toLocaleString('pt-BR');
const fmtCurrency = (n) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export default function DashboardAdmin() {
  const [dateRange, setDateRange] = useState('last_30d');
  const [metrics, setMetrics] = useState(MOCK_GLOBAL_METRICS);
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('mock'); // 'meta' | 'db' | 'mock'
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [insightsByAccount, setInsightsByAccount] = useState({}); // { accId: { spend, reach, clicks, impressions, leadsWA, leadsForms } }
  
  let activeBmNames = [];
  try {
    const stored = localStorage.getItem('zmkt_active_bm_names');
    if (stored) activeBmNames = JSON.parse(stored);
    else if (localStorage.getItem('zmkt_active_bm_name')) activeBmNames = [localStorage.getItem('zmkt_active_bm_name')];
  } catch(e) {}
  
  const displayTitle = activeBmNames.length === 0 ? 'Zara MKT' : activeBmNames.length === 1 ? activeBmNames[0] : 'Múltiplas BMs';

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nlgwoetmyqbdqdhgeidh.supabase.co';

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      // ── Tentativa 1: Meta API via Edge Function ──
      let metaConnected = false;
      try {
        let activeBmIds = [];
        try {
          const stored = localStorage.getItem('zmkt_active_bm_ids');
          if (stored) activeBmIds = JSON.parse(stored);
          else if (localStorage.getItem('zmkt_active_bm_id')) activeBmIds = [localStorage.getItem('zmkt_active_bm_id')];
        } catch(e) {}

        console.log('[ZMKT] Buscando contas... bmIds=', activeBmIds);
        const res = await fetch(`${supabaseUrl}/functions/v1/meta-graph`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ action: 'get_bms', bmIds: activeBmIds })
        });
        const data = await res.json();
        console.log('[ZMKT] get_bms response:', data.success, 'contas:', data.personalAdAccounts?.length);

        if (data.success && data.personalAdAccounts && data.personalAdAccounts.length > 0) {
          metaConnected = true;
          setDataSource('meta');
          
          const metaAccounts = data.personalAdAccounts.map(acc => ({
            id: acc.id,
            name: acc.name,
            balance: parseFloat(acc.balance || 0) / 100,
            amountSpent: parseFloat(acc.amount_spent || 0) / 100,
            spendCap: parseFloat(acc.spend_cap || 0) / 100,
            status: acc.account_status === 1 ? 'good' : 'warning'
          }));
          setAccounts(metaAccounts);

          // Buscar insights + campanhas para TODAS as contas (em paralelo, max 10)
          let totalSpend = 0, totalReach = 0, totalClicks = 0, totalImpressions = 0;
          let totalLeadsWA = 0, totalLeadsForms = 0;
          const allCampaigns = [];
          const perAccountMap = {};

          const fetchPromises = data.personalAdAccounts.slice(0, 10).map(async (acc) => {
            try {
              const insRes = await fetch(`${supabaseUrl}/functions/v1/meta-graph`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ action: 'get_insights', adAccountId: acc.id })
              });
              const insData = await insRes.json();
              console.log(`[ZMKT] insights ${acc.name} (${acc.id}):`, insData.success ? 'OK' : 'FAIL', insData.insights?.spend || 0);
              
              let accSpend = 0, accReach = 0, accClicks = 0, accImpressions = 0, accLeadsWA = 0, accLeadsForms = 0;

              if (insData.success && insData.insights) {
                accSpend = parseFloat(insData.insights.spend || 0);
                accReach = parseInt(insData.insights.reach || 0);
                accClicks = parseInt(insData.insights.clicks || 0);
                accImpressions = parseInt(insData.insights.impressions || 0);
                totalSpend += accSpend;
                totalReach += accReach;
                totalClicks += accClicks;
                totalImpressions += accImpressions;

                // Contar leads das actions
                if (insData.insights.actions) {
                  for (const act of insData.insights.actions) {
                    if (act.action_type === 'onsite_conversion.messaging_conversation_started_7d' || 
                        act.action_type === 'onsite_conversion.messaging_first_reply') {
                      const v = parseInt(act.value || 0);
                      accLeadsWA += v;
                      totalLeadsWA += v;
                    }
                    if (act.action_type === 'lead' || act.action_type === 'offsite_conversion.fb_pixel_lead') {
                      const v = parseInt(act.value || 0);
                      accLeadsForms += v;
                      totalLeadsForms += v;
                    }
                  }
                }
              }

              // Salvar métricas por conta
              perAccountMap[acc.id] = { spend: accSpend, reach: accReach, clicks: accClicks, impressions: accImpressions, leadsWA: accLeadsWA, leadsForms: accLeadsForms };

              // Campanhas
              if (insData.success && insData.campaigns && insData.campaigns.length > 0) {
                for (const camp of insData.campaigns) {
                  allCampaigns.push({
                    id: camp.id,
                    name: camp.name,
                    account: acc.name,
                    accountId: acc.id,
                    objective: camp.objective || '',
                    status: camp.status === 'ACTIVE' ? 'good' : 'warning',
                    statusLabel: camp.status === 'ACTIVE' ? 'Ativa' : 'Pausada',
                    spend: accSpend,
                    clicks: accClicks,
                    cpc: accClicks > 0 ? accSpend / accClicks : 0,
                    leads: accLeadsWA + accLeadsForms,
                    leadType: camp.objective === 'MESSAGES' ? 'whatsapp' : 'form',
                    impressions: accImpressions,
                    reach: accReach,
                  });
                }
              }
            } catch (e) {
              console.error(`[ZMKT] Erro insights conta ${acc.id}:`, e.message);
            }
          });

          await Promise.all(fetchPromises);

          // Salvar mapa de insights por conta
          setInsightsByAccount(perAccountMap);

          const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
          const totalLeads = totalLeadsWA + totalLeadsForms;

          setMetrics({
            totalSpend,
            totalReach,
            totalClicks,
            totalImpressions,
            avgCPC,
            totalLeads: { total: totalLeads || 0, whatsapp: totalLeadsWA, form: totalLeadsForms },
            totalAccounts: metaAccounts.length,
          });

          if (allCampaigns.length > 0) {
            setCampaigns(allCampaigns);
          }

          console.log('[ZMKT] Métricas finais:', { totalSpend, totalReach, totalClicks, totalImpressions, totalLeads, campaigns: allCampaigns.length });
        }
      } catch (e) {
        console.warn('[ZMKT] Edge Function não disponível, tentando banco...', e.message);
      }

      // ── Tentativa 2: Dados do Banco Supabase ──
      if (!metaConnected) {
        try {
          const { data: dbClients } = await supabase.from('clients').select('*');
          if (dbClients && dbClients.length > 0) {
            setAccounts(dbClients.map(c => ({
              id: c.id,
              name: c.name,
              balance: 0,
              status: 'active'
            })));
          }

          const { data: dbCampaigns } = await supabase.from('campaigns').select('*');
          if (dbCampaigns && dbCampaigns.length > 0) {
            setDataSource('db');
            setCampaigns(dbCampaigns.map(c => ({
              id: c.id,
              name: c.name,
              account: dbClients?.find(cl => cl.id === c.client_id)?.name || 'N/A',
              objective: c.objective,
              status: c.status === 'active' ? 'good' : 'warning',
              statusLabel: c.status === 'active' ? 'Ativa' : 'Pausada',
              spend: parseFloat(c.spend || 0),
              impressions: c.impressions || 0,
              reach: c.reach || 0,
              clicks: c.clicks || 0,
              cpc: parseFloat(c.cpc || 0),
              leads: c.leads || 0,
              leadType: c.lead_type,
              customMetrics: c.custom_metrics || {},
            })));

            const totalSpend = dbCampaigns.reduce((s, c) => s + parseFloat(c.spend || 0), 0);
            const totalReach = dbCampaigns.reduce((s, c) => s + (c.reach || 0), 0);
            const totalClicks = dbCampaigns.reduce((s, c) => s + (c.clicks || 0), 0);
            const totalImpressions = dbCampaigns.reduce((s, c) => s + (c.impressions || 0), 0);
            const totalLeads = dbCampaigns.reduce((s, c) => s + (c.leads || 0), 0);

            setMetrics(prev => ({
              ...prev,
              totalSpend,
              totalReach,
              totalClicks,
              totalImpressions,
              avgCPC: totalClicks > 0 ? totalSpend / totalClicks : 0,
              totalLeads: { total: totalLeads, whatsapp: 0, form: 0 },
              totalAccounts: dbClients?.length || prev.totalAccounts,
            }));
          } else {
            setDataSource('mock');
          }
        } catch (e) {
          console.warn('[ZMKT] Banco não retornou dados, usando mocks');
          setDataSource('mock');
        }
      }

      // Carregar contagem de leads do banco
      try {
        const { count: leadCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        if (leadCount != null && leadCount > 0) {
          setMetrics(prev => ({
            ...prev,
            totalLeads: { ...prev.totalLeads, total: Math.max(prev.totalLeads.total, leadCount) },
          }));
        }
      } catch(e) {}

    } catch (err) {
      console.error('[ZMKT] loadData error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  // Recalcular métricas exibidas com base na conta selecionada
  const displayMetrics = useMemo(() => {
    if (selectedAccount === 'all' || !insightsByAccount || Object.keys(insightsByAccount).length === 0) {
      return metrics;
    }
    const acc = insightsByAccount[selectedAccount];
    if (!acc) return metrics;
    const totalLeads = (acc.leadsWA || 0) + (acc.leadsForms || 0);
    return {
      totalSpend: acc.spend || 0,
      totalReach: acc.reach || 0,
      totalClicks: acc.clicks || 0,
      totalImpressions: acc.impressions || 0,
      avgCPC: acc.clicks > 0 ? acc.spend / acc.clicks : 0,
      totalLeads: { total: totalLeads, whatsapp: acc.leadsWA || 0, form: acc.leadsForms || 0 },
      totalAccounts: 1,
    };
  }, [selectedAccount, metrics, insightsByAccount]);

  return (
    <div className="page-content">
      {/* Top Bar */}
      <div className="animate-in" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--brand-territory-90)',
        padding: '12px 24px',
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        border: 'var(--border-subtle)',
        borderBottom: 'none',
        marginBottom: '-1px'
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--brand-offwhite)' }}>Visão Geral</div>
      </div>

      {/* Main Control Bar */}
      <div className="animate-in" style={{
        background: 'var(--brand-surface-01)',
        padding: 'var(--space-24)',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        border: 'var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-16)',
        marginBottom: 'var(--space-32)',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--brand-offwhite)' }}>
            Painel da <span style={{ color: 'var(--brand-accent)' }}>{displayTitle}</span>
          </h2>
          <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)' }}>
            Bem-vindo, {displayTitle} • {accounts.length} contas
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-24)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
            <Target size={16} color="var(--brand-accent)" />
            <span style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)', fontWeight: 600 }}>Conta:</span>
            <select
              className="form-select"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              style={{ width: 'auto', minWidth: '180px', padding: '6px 32px 6px 12px', background: 'var(--brand-surface-02)' }}
            >
              <option value="all">Todas as Contas</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
            <Activity size={16} color="var(--brand-accent)" />
            <span style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)', fontWeight: 600 }}>Período:</span>
            <select className="form-select" style={{ width: 'auto', minWidth: '180px', padding: '6px 32px 6px 12px', background: 'var(--brand-surface-02)' }} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              {DATE_PRESETS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="metrics-grid">
        <MetricCard
          icon={DollarSign}
          value={fmtCurrency(displayMetrics.totalSpend)}
          label="Investimento total"
          trend={displayMetrics.totalSpend > 0 ? "up" : undefined}
          trendValue={displayMetrics.totalSpend > 0 ? "" : ""}
        />
        <MetricCard
          icon={Users}
          value={fmt(displayMetrics.totalLeads.total)}
          label="Leads gerados"
          highlight
          trend={displayMetrics.totalLeads.total > 0 ? "up" : undefined}
          trendValue=""
        />
        <MetricCard
          icon={MessageCircle}
          value={fmt(displayMetrics.totalLeads.whatsapp)}
          label="WhatsApp"
          abbr="MSG"
          abbrFull="Mensagens iniciadas"
          trend={displayMetrics.totalLeads.whatsapp > 0 ? "up" : undefined}
          trendValue=""
        />
        <MetricCard
          icon={FileText}
          value={fmt(displayMetrics.totalLeads.form)}
          label="Formulários"
          abbr="FORM"
          abbrFull="Leads por formulário"
        />
        <MetricCard
          icon={Eye}
          value={fmt(displayMetrics.totalReach)}
          label="Alcance total"
          abbr="REACH"
          abbrFull="Pessoas únicas alcançadas"
        />
        <MetricCard
          icon={MousePointer}
          value={fmtCurrency(displayMetrics.avgCPC)}
          label="CPC médio"
          abbr="CPC"
          abbrFull="Custo por Clique"
          trend={displayMetrics.avgCPC > 0 ? "down" : undefined}
          trendValue=""
        />
        <MetricCard
          icon={Zap}
          value={fmt(displayMetrics.totalClicks)}
          label="Cliques totais"
        />
        <MetricCard
          icon={Activity}
          value={fmt(displayMetrics.totalImpressions)}
          label="Impressões"
          abbr="IMP"
          abbrFull="Número total de exibições"
        />
      </div>

      {/* Bento Grid: Saldos + Alertas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-24)', marginBottom: 'var(--space-24)' }}>
        {/* Account balances */}
        <div className="panel animate-in" style={{ marginBottom: 0 }}>
          <div
            className="panel-header"
            onClick={() => setCreditsOpen(prev => !prev)}
            style={{
              alignItems: 'center',
              borderBottom: creditsOpen ? '1px solid rgba(80,90,107,0.3)' : 'none',
              paddingBottom: creditsOpen ? '16px' : '0',
              marginBottom: creditsOpen ? '24px' : '0',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div className="panel-subtitle" style={{ color: 'var(--brand-muted)', fontWeight: 800 }}>
                SALDO DAS CONTAS DE ANÚNCIO <span style={{ fontWeight: 500 }}>({accounts.length} CONTAS)</span>
              </div>
              
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '2px 10px',
                borderRadius: '100px',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Target size={10} /> {accounts.filter(a => a.balance <= 0).length} sem crédito
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); }} style={{ gap: '6px', padding: '4px 12px' }}>
                <RefreshCw size={12} /> Atualizar
              </button>
              {creditsOpen ? <ChevronUp size={18} color="var(--brand-muted)" /> : <ChevronDown size={18} color="var(--brand-muted)" />}
            </div>
          </div>
          <div style={{
            maxHeight: creditsOpen ? '2000px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.4s ease, opacity 0.3s ease',
            opacity: creditsOpen ? 1 : 0,
          }}>
          <div className="billing-grid">
            {accounts
              .filter(acc => selectedAccount === 'all' || acc.id === selectedAccount)
              .map((acc) => (
              <div key={acc.id} className="billing-card">
                <div className="billing-card-name">{acc.name}</div>
                <div className={`billing-card-balance ${
                  acc.balance <= 0 ? 'empty' :
                  acc.balance < 100 ? 'low' : 'positive'
                }`}>
                  {fmtCurrency(acc.balance)}
                </div>
                <div className={`status-badge ${
                  acc.balance <= 0 ? 'bad' :
                  acc.balance < 100 ? 'warning' : 'good'
                }`}>
                  <span className="status-dot" />
                  {acc.balance <= 0 ? 'Sem crédito' :
                   acc.balance < 100 ? 'Crédito baixo' : 'Ativo'}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* Alertas Prioritários */}
        <div className="alerts-panel animate-in">
          <div className="alerts-panel-title">Alertas Prioritários</div>

          <div className="alert-item">
            <div className="alert-icon error">
              <TrendingUp size={14} />
            </div>
            <div>
              <div className="alert-title">Fadiga Criativa: MC Cortinas</div>
              <div className="alert-desc">CTR caiu 45% nas últimas 24h. Ação sugerida: rotacionar criativos.</div>
            </div>
          </div>

          <div className="alert-item">
            <div className="alert-icon success">
              <ArrowUpRight size={14} />
            </div>
            <div>
              <div className="alert-title">Oportunidade: M Politano</div>
              <div className="alert-desc">ROAS 5.2x acima da meta. Recomendação: aumentar budget diário em 20%.</div>
            </div>
          </div>

          <div className="alert-item">
            <div className="alert-icon warning">
              <Zap size={14} />
            </div>
            <div>
              <div className="alert-title">Saldo Crítico: VEG Logística</div>
              <div className="alert-desc">Saldo restante R$ 48,00. Campanha pode pausar em ~12h.</div>
            </div>
          </div>
        </div>
      </div>


      {/* Charts row */}
      <div className="panels-grid">
        <div className="panel animate-in">
          <div className="panel-header">
            <div>
              <div className="panel-subtitle">Comparativo</div>
              <div className="panel-title">Leads por Semana</div>
            </div>
          </div>
          <BarChart
            labels={MOCK_WEEKLY_LEADS.map(w => w.week)}
            datasets={[
              {
                label: 'WhatsApp',
                data: MOCK_WEEKLY_LEADS.map(w => w.whatsapp),
                backgroundColor: 'rgba(255,122,46,0.6)',
                borderColor: '#FF7A2E',
                borderWidth: 1,
                borderRadius: 4,
              },
              {
                label: 'Formulário',
                data: MOCK_WEEKLY_LEADS.map(w => w.form),
                backgroundColor: 'rgba(59,107,181,0.6)',
                borderColor: '#3B6BB5',
                borderWidth: 1,
                borderRadius: 4,
              },
            ]}
          />
        </div>

        <div className="panel animate-in">
          <div className="panel-header">
            <div>
              <div className="panel-subtitle">Performance</div>
              <div className="panel-title">Cliques & Impressões</div>
            </div>
          </div>
          <LineChart
            labels={MOCK_DAILY_PERFORMANCE.map(d => d.day)}
            datasets={[
              {
                label: 'Cliques',
                data: MOCK_DAILY_PERFORMANCE.map(d => d.clicks),
                borderColor: '#FF7A2E',
                backgroundColor: 'rgba(255,122,46,0.1)',
                fill: true,
              },
              {
                label: 'Impressões (÷100)',
                data: MOCK_DAILY_PERFORMANCE.map(d => Math.round(d.impressions / 100)),
                borderColor: '#3B6BB5',
                backgroundColor: 'rgba(59,107,181,0.1)',
                fill: true,
              },
            ]}
          />
        </div>
      </div>

      {/* Demographics + Campaigns */}
      <div className="panels-grid">
        <div className="panel animate-in">
          <div className="panel-header">
            <div>
              <div className="panel-subtitle">Demográfico</div>
              <div className="panel-title">Gênero dos Leads</div>
            </div>
          </div>
          <DonutChart data={MOCK_DEMOGRAPHICS.gender} />
        </div>

        <div className="panel animate-in">
          <div className="panel-header">
            <div>
              <div className="panel-subtitle">Demográfico</div>
              <div className="panel-title">Faixa Etária</div>
            </div>
          </div>
          <DonutChart data={MOCK_DEMOGRAPHICS.age} />
        </div>
      </div>

      {/* Campaign table */}
      <div className="panel animate-in">
        <div className="panel-header">
          <div>
            <div className="panel-subtitle">Todas as contas</div>
            <div className="panel-title">Campanhas Ativas</div>
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-caption)',
            color: 'var(--brand-muted)',
          }}>
            {MOCK_CAMPAIGNS.length} campanhas
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="campaign-table">
            <thead>
              <tr>
                <th>Campanha</th>
                <th>Conta</th>
                <th>Status</th>
                <th>Gasto</th>
                <th>Cliques</th>
                <th>CPC</th>
                <th>Leads</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {campaigns
                .filter(c => {
                   if (selectedAccount === 'all') return true;
                   return c.accountId === selectedAccount || c.account === accounts.find(a => a.id === selectedAccount)?.name;
                })
                .map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="campaign-name">
                      <Target size={14} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
                      {c.name}
                    </div>
                  </td>
                  <td>{c.account}</td>
                  <td>
                    <span className={`status-badge ${c.status}`}>
                      <span className="status-dot" />
                      {c.statusLabel}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {fmtCurrency(c.spend)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {fmt(c.clicks)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {fmtCurrency(c.cpc)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700 }}>
                    {c.leads}
                  </td>
                  <td>
                    {c.leadType && (
                      <span className="status-badge good" style={{
                        background: c.leadType === 'whatsapp'
                          ? 'rgba(34,197,94,0.12)' : 'rgba(59,107,181,0.12)',
                        color: c.leadType === 'whatsapp' ? '#22C55E' : '#3B6BB5',
                      }}>
                        {c.leadType === 'whatsapp' ? '💬 WhatsApp' : '📝 Formulário'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
