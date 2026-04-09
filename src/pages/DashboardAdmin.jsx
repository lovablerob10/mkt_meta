import { useState } from 'react';
import {
  DollarSign, Users, Eye, MousePointer,
  MessageCircle, FileText, Zap, TrendingUp,
  ArrowUpRight, Activity, Target, RefreshCw
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { DonutChart, BarChart, LineChart } from '../components/Charts';
import {
  MOCK_GLOBAL_METRICS as metrics,
  MOCK_ACCOUNTS,
  MOCK_CAMPAIGNS,
  MOCK_DEMOGRAPHICS,
  MOCK_WEEKLY_LEADS,
  MOCK_DAILY_PERFORMANCE,
  DATE_PRESETS,
} from '../data/mockData';

const fmt = (n) => n.toLocaleString('pt-BR');
const fmtCurrency = (n) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export default function DashboardAdmin() {
  const [dateRange, setDateRange] = useState('last_30d');

  return (
    <div className="page-content">
      {/* Top Warning Strip */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(250,204,21,0.15)',
            color: '#FACC15',
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(250,204,21,0.3)'
          }}>
            <span style={{ fontSize: '14px' }}>⚠️</span> 4 contas sem vínculo
          </div>
          <button className="btn btn-secondary btn-sm" style={{ padding: '4px 16px' }}>
            Sair
          </button>
        </div>
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
            Painel da <span style={{ color: 'var(--brand-accent)' }}>Zara MKT</span>
          </h2>
          <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)' }}>
            Bem-vindo, Zara MKT • 8 contas • 5 clientes
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-24)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
            <Target size={16} color="var(--brand-accent)" />
            <span style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)', fontWeight: 600 }}>Conta:</span>
            <select className="form-select" style={{ width: 'auto', minWidth: '180px', padding: '6px 32px 6px 12px', background: 'var(--brand-surface-02)' }}>
              <option>Todas as Contas</option>
              {MOCK_ACCOUNTS.map(a => <option key={a.id}>{a.name}</option>)}
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

      {/* Account balances */}
      <div className="panel animate-in">
        <div className="panel-header" style={{ alignItems: 'center', borderBottom: '1px solid rgba(80,90,107,0.3)', paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="panel-subtitle" style={{ color: 'var(--brand-muted)', fontWeight: 800 }}>
              SALDO DAS CONTAS DE ANÚNCIO <span style={{ fontWeight: 500 }}>({MOCK_ACCOUNTS.length} CONTAS)</span>
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
          <button className="btn btn-ghost btn-sm" style={{ gap: '6px', padding: '4px 12px' }}>
             <RefreshCw size={12} /> Atualizar 
          </button>
        </div>
        <div className="billing-grid">
          {MOCK_ACCOUNTS.map((acc) => (
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
              {MOCK_CAMPAIGNS.map((c) => (
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
