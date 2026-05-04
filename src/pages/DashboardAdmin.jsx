import { useState, useEffect } from 'react';
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
  const activeBmName = localStorage.getItem('zmkt_active_bm_name');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nlgwoetmyqbdqdhgeidh.supabase.co';

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // ── Tentativa 1: Meta API via Edge Function ──
      let metaConnected = false;
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/meta-graph`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ action: 'get_bms' })
        });
        const data = await res.json();

        if (data.success && data.personalAdAccounts && data.personalAdAccounts.length > 0) {
          metaConnected = true;
          setDataSource('meta');
          setAccounts(data.personalAdAccounts.map(acc => ({
            id: acc.id,
            name: acc.name,
            balance: 0,
            status: acc.account_status === 1 ? 'good' : 'warning'
          })));

          // Buscar insights para cada conta
          let totalSpend = 0, totalReach = 0, totalClicks = 0, totalImpressions = 0, avgCPC = 0;
          for (const acc of data.personalAdAccounts.slice(0, 5)) {
            try {
              const insRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-graph`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ action: 'get_insights', adAccountId: acc.id })
              });
              const insData = await insRes.json();
              if (insData.success && insData.insights) {
                totalSpend += parseFloat(insData.insights.spend || 0);
                totalReach += parseInt(insData.insights.reach || 0);
                totalClicks += parseInt(insData.insights.clicks || 0);
                totalImpressions += parseInt(insData.insights.impressions || 0);
              }
            } catch (e) { /* skip individual account errors */ }
          }
          avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
          setMetrics(prev => ({
            ...prev,
            totalSpend,
            totalReach,
            totalClicks,
            totalImpressions,
            avgCPC,
          }));
        }
      } catch (e) {
        console.warn('[ZMKT] Edge Function não disponível, tentando banco...', e.message);
      }

      // ── Tentativa 2: Dados do Banco Supabase ──
      if (!metaConnected) {
        try {
          // Carregar clientes
          const { data: dbClients } = await supabase.from('clients').select('*');
          if (dbClients && dbClients.length > 0) {
            setAccounts(dbClients.map(c => ({
              id: c.id,
              name: c.name,
              balance: 0,
              status: 'active'
            })));
          }

          // Carregar campanhas do banco
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

            // Agregar métricas
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
      const { count: leadCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
      if (leadCount != null) {
        setMetrics(prev => ({
          ...prev,
          totalLeads: { ...prev.totalLeads, total: leadCount },
        }));
      }

    } catch (err) {
      console.error('[ZMKT] loadData error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

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
            Painel da <span style={{ color: 'var(--brand-accent)' }}>{activeBmName || 'Zara MKT'}</span>
          </h2>
          <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)' }}>
            Bem-vindo, {activeBmName || 'Zara MKT'} • {accounts.length} contas
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
          value={fmtCurrency(metrics.totalSpend)}
          label="Investimento total"
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          icon={Users}
          value={fmt(metrics.totalLeads.total)}
          label="Leads gerados"
          highlight
          trend="up"
          trendValue="+23%"
        />
        <MetricCard
          icon={MessageCircle}
          value={fmt(metrics.totalLeads.whatsapp)}
          label="WhatsApp"
          abbr="MSG"
          abbrFull="Mensagens iniciadas"
          trend="up"
          trendValue="+18%"
        />
        <MetricCard
          icon={FileText}
          value={fmt(metrics.totalLeads.form)}
          label="Formulários"
          abbr="FORM"
          abbrFull="Leads por formulário"
        />
        <MetricCard
          icon={Eye}
          value={fmt(metrics.totalReach)}
          label="Alcance total"
          abbr="REACH"
          abbrFull="Pessoas únicas alcançadas"
        />
        <MetricCard
          icon={MousePointer}
          value={fmtCurrency(metrics.avgCPC)}
          label="CPC médio"
          abbr="CPC"
          abbrFull="Custo por Clique"
          trend="down"
          trendValue="-8%"
        />
        <MetricCard
          icon={Zap}
          value={fmt(metrics.totalClicks)}
          label="Cliques totais"
        />
        <MetricCard
          icon={Activity}
          value={fmt(metrics.totalImpressions)}
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
                <Target size={10} /> 3 sem crédito
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
                  acc.balance === 0 ? 'empty' :
                  acc.balance < 100 ? 'low' : 'positive'
                }`}>
                  {fmtCurrency(acc.balance)}
                </div>
                <div className={`status-badge ${
                  acc.status === 'empty' ? 'bad' :
                  acc.status === 'low' ? 'warning' : 'good'
                }`}>
                  <span className="status-dot" />
                  {acc.status === 'empty' ? 'Sem crédito' :
                   acc.status === 'low' ? 'Crédito baixo' : 'Ativo'}
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
                   const accObj = accounts.find(a => a.id === selectedAccount);
                   return accObj && c.account === accObj.name;
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
