import { useState } from 'react';
import {
  DollarSign, Users, Eye, MousePointer,
  TrendingUp, Sparkles, MessageCircle,
  PenLine, Clock, Heart, MoveUpRight, Building
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { DonutChart, BarChart, LineChart } from '../components/Charts';
import {
  MOCK_GLOBAL_METRICS as metrics,
  MOCK_CAMPAIGNS,
  MOCK_CLIENTS,
  MOCK_DEMOGRAPHICS,
  MOCK_WEEKLY_LEADS,
  MOCK_DAILY_PERFORMANCE,
} from '../data/mockData';

const fmt = (n) => n ? n.toLocaleString('pt-BR') : '0';
const fmtCurrency = (n) => n ? `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00';

export default function DashboardClient() {
  const [selectedClientId, setSelectedClientId] = useState(MOCK_CLIENTS[0].id);
  const client = MOCK_CLIENTS.find(c => c.id === selectedClientId) || MOCK_CLIENTS[0];
  const activeCampaign = MOCK_CAMPAIGNS.find(c => c.account === client.name);
  return (
    <div className="page-content">
      {/* Dev Switcher - Só para visualizarmos os templates diferentes */}
      <div style={{ padding: '12px', background: 'var(--brand-surface-02)', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
         <span style={{ fontSize: '12px', color: 'var(--brand-accent)', fontWeight: 600 }}>AMBIENTE DEV:</span>
         <select 
           className="form-select" 
           value={selectedClientId} 
           onChange={e => setSelectedClientId(e.target.value)}
           style={{ width: '250px', background: 'var(--brand-surface-01)' }}
         >
           {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
         </select>
      </div>

      {/* Welcome banner */}
      <div className="page-heading animate-in">
        <h1>
          Olá, <span className="accent">{client.name}</span> 👋
        </h1>
        <p className="page-description">
          Aqui está o resumo em tempo real da sua performance de {client.dashboardConfig.type === 'branding' ? 'Marca e Reconhecimento' : 'Vendas e Captação'}.
        </p>
      </div>

      {/* Dynamic Hero KPIs based on Client Config */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        
        {/* TEMPLATE BRANDING (ex: M&C Cortinas, ARO) */}
        {client.dashboardConfig.type === 'branding' && activeCampaign && (
          <>
            <MetricCard
              icon={Eye}
              value={fmt(activeCampaign.customMetrics?.profileVisits)}
              label="Visitas ao perfil"
              highlight
            />
            <MetricCard
              icon={Heart}
              value={fmt(activeCampaign.customMetrics?.newFollowers)}
              label="Novos seguidores"
            />
            {activeCampaign.leads > 0 && (
              <MetricCard
                icon={MessageCircle}
                value={fmt(activeCampaign.leads)}
                label="Conversas iniciadas"
              />
            )}
            <MetricCard
              icon={DollarSign}
              value={fmtCurrency(activeCampaign.cpc)}
              label="Custo por resultado"
            />
            <MetricCard
              icon={Sparkles}
              value={fmt(activeCampaign.reach)}
              label="Pessoas Alcançadas"
            />
            <MetricCard
              icon={TrendingUp}
              value={fmt(activeCampaign.impressions)}
              label="Impressões"
            />
          </>
        )}

        {/* TEMPLATE IMOBILIÁRIO (ex: M Politano) */}
        {client.dashboardConfig.type === 'real_estate' && activeCampaign && (
          <>
            <MetricCard
              icon={Users}
              value={fmt(activeCampaign.leads)}
              label="Leads Totais"
              highlight
            />
            <MetricCard
              icon={Eye}
              value={fmt(activeCampaign.reach)}
              label="Pessoas Alcançadas"
            />
            <MetricCard
              icon={TrendingUp}
              value={fmt(activeCampaign.impressions)}
              label="Impressões"
            />
            <MetricCard
              icon={MousePointer}
              value={fmt(activeCampaign.clicks)}
              label="Cliques Totais"
            />
          </>
        )}

        {/* TEMPLATE MENSAGENS (ex: Jardim Barzan, VEG Logistica) */}
        {client.dashboardConfig.type === 'messages' && activeCampaign && (
           <>
             <MetricCard
               icon={MessageCircle}
               value={fmt(activeCampaign.leads)}
               label="Conversas iniciadas"
               highlight
             />
             <MetricCard
               icon={TrendingUp}
               value={fmt(activeCampaign.impressions)}
               label="Impressões"
             />
             <MetricCard
               icon={MousePointer}
               value={fmt(activeCampaign.customMetrics?.linkClicks)}
               label="Cliques no link"
             />
             <MetricCard
               icon={DollarSign}
               value={fmtCurrency(activeCampaign.cpc)}
               label="Custo por resultado"
             />
             <MetricCard
               icon={Eye}
               value={fmt(activeCampaign.reach)}
               label="Pessoas Alcançadas"
             />
             <MetricCard
               icon={DollarSign}
               value={fmtCurrency(activeCampaign.spend)}
               label="Valor Utilizado"
             />
           </>
        )}
      </div>

      {/* Dynamic secondary section based on client */}
      {client.name === 'M Politano Imóveis' && activeCampaign?.customMetrics?.subCampaigns && (
        <div className="panel animate-in">
          <div className="panel-header">
            <div>
              <div className="panel-subtitle">Desempenho por Empreendimento</div>
              <div className="panel-title">Distribuição de Resultados</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {activeCampaign.customMetrics.subCampaigns.map((sub, i) => (
              <div key={i} className="billing-card" style={{ borderLeft: '3px solid var(--brand-accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Building size={16} color="var(--brand-accent)" />
                  <div className="billing-card-name">{sub.name}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                   <div>
                     <div style={{ fontSize: '10px', color: 'var(--brand-muted)', textTransform: 'uppercase' }}>Leads</div>
                     <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{sub.leads}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '10px', color: 'var(--brand-muted)', textTransform: 'uppercase' }}>Alcance</div>
                     <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#8A919E' }}>{fmt(sub.reach)}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '10px', color: 'var(--brand-muted)', textTransform: 'uppercase' }}>Cliques</div>
                     <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#8A919E' }}>{fmt(sub.clicks)}</div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {client.name === 'ARO Transportes' && activeCampaign?.customMetrics?.audience && (
        <div className="panel animate-in">
          <div className="panel-header">
            <div>
              <div className="panel-subtitle">Foco Estratégico</div>
              <div className="panel-title">Público-Alvo Atingido</div>
            </div>
          </div>
          <div className="billing-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,122,46,0.05)', border: '1px solid rgba(255,122,46,0.2)' }}>
            <div style={{ background: 'var(--brand-accent)', padding: '12px', borderRadius: '8px', color: '#fff' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--brand-accent)', fontWeight: 600 }}>Nestas campanhas, atingimos predominantemente:</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{activeCampaign.customMetrics.audience}</div>
            </div>
          </div>
        </div>
      )}

      {/* Funnel */}
      <div className="panel animate-in">
        <div className="panel-header">
          <div>
            <div className="panel-subtitle">Funil de conversão</div>
            <div className="panel-title">Investimento → Leads → Vendas</div>
          </div>
        </div>
        <div className="funnel">
          <div className="funnel-stage">
            <div>
              <div className="funnel-label">💰 Investimento em Tráfego</div>
              <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)', marginTop: 4 }}>
                Total investido nas campanhas
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="funnel-value" style={{ color: 'var(--brand-blue-light)' }}>
                {fmtCurrency(metrics.totalSpend)}
              </span>
              <span className="funnel-pct">100%</span>
            </div>
          </div>
          <div className="funnel-stage">
            <div>
              <div className="funnel-label">🎯 Oportunidades (Leads)</div>
              <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)', marginTop: 4 }}>
                Pessoas que demonstraram interesse
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="funnel-value" style={{ color: 'var(--brand-accent)' }}>
                {fmt(metrics.totalLeads.total)}
              </span>
              <span className="funnel-pct">
                {((metrics.totalLeads.total / metrics.totalClicks) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="funnel-stage">
            <div>
              <div className="funnel-label">✅ Vendas Estimadas</div>
              <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)', marginTop: 4 }}>
                Retorno estimado sobre o investimento
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="funnel-value" style={{ color: 'var(--color-success)' }}>
                {fmtCurrency(metrics.estimatedProfit)}
              </span>
              <span className="funnel-pct">
                ROI {((metrics.estimatedProfit / metrics.totalSpend) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="panels-grid">
        <div className="panel animate-in">
          <div className="panel-header">
            <div>
              <div className="panel-subtitle">Comparativo semanal</div>
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
              <div className="panel-subtitle">Tendência diária</div>
              <div className="panel-title">Performance</div>
            </div>
          </div>
          <LineChart
            labels={MOCK_DAILY_PERFORMANCE.map(d => d.day)}
            datasets={[
              {
                label: 'Cliques',
                data: MOCK_DAILY_PERFORMANCE.map(d => d.clicks),
                borderColor: '#FF7A2E',
                backgroundColor: 'rgba(255,122,46,0.08)',
                fill: true,
              },
            ]}
          />
        </div>
      </div>

      {/* Demographics */}
      <div className="panels-grid">
        <div className="panel animate-in">
          <div className="panel-header">
            <div>
              <div className="panel-subtitle">Público</div>
              <div className="panel-title">Gênero</div>
            </div>
          </div>
          <DonutChart data={MOCK_DEMOGRAPHICS.gender} />
        </div>
        <div className="panel animate-in">
          <div className="panel-header">
            <div>
              <div className="panel-subtitle">Público</div>
              <div className="panel-title">Faixa Etária</div>
            </div>
          </div>
          <DonutChart data={MOCK_DEMOGRAPHICS.age} />
        </div>
      </div>

      {/* Observation from gestor */}
      <div className="observation-card animate-in">
        <div className="observation-header">
          <PenLine size={16} />
          Nota do Gestor
        </div>
        <div className="observation-text">
          Oi pessoal! 👋 As campanhas de WhatsApp estão performando muito bem este mês. O CPC médio caiu 8% em relação ao mês passado.

<strong style={{ color: 'var(--brand-offwhite)' }}>Destaque:</strong> A campanha de seguidores no Instagram alcançou 41 mil pessoas com um CPC de apenas R$ 0,18 — resultado excelente para branding.

<strong style={{ color: 'var(--brand-offwhite)' }}>Próximos passos:</strong> Vamos otimizar os criativos da campanha de WhatsApp na próxima semana para tentar reduzir ainda mais o custo por lead.

Qualquer dúvida, converse com nossa IA aqui no dashboard ou me chame! 🚀
        </div>
        <div className="observation-timestamp">
          <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Atualizado em 08/04/2026, 14:30
        </div>
      </div>
    </div>
  );
}
