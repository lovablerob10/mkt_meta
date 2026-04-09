import { useState } from 'react';
import {
  FileText, Check, Download, Send, RefreshCw, Eye, Calendar, Printer, Smartphone
} from 'lucide-react';
import { MOCK_CLIENTS, MOCK_CAMPAIGNS } from '../data/mockData';

const fmt = (n) => n ? n.toLocaleString('pt-BR') : '0';
const fmtCurrency = (n) => n ? `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00';

export default function Reports() {
  const [selectedClient, setSelectedClient] = useState(MOCK_CLIENTS[0].id);
  const [selectedMonth, setSelectedMonth] = useState('03-2026');
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewReady, setPreviewReady] = useState(true); // Default has preview

  const client = MOCK_CLIENTS.find(c => c.id === selectedClient) || MOCK_CLIENTS[0];
  const activeCampaign = MOCK_CAMPAIGNS.find(c => c.account === client.name);

  const handleGenerate = () => {
    setIsGenerating(true);
    setPreviewReady(false);
    setTimeout(() => {
      setIsGenerating(false);
      setPreviewReady(true);
    }, 1500);
  };

  return (
    <div className="page-content">
      <div className="page-heading animate-in">
        <h1>Exportação de <span className="accent">Relatórios</span></h1>
        <p className="page-description">
          Gere relatórios PDF automatizados com base nos resultados das campanhas do Meta Ads.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 'var(--space-24)' }}>
        {/* Left Column: Settings */}
        <div className="panel animate-in" style={{ height: 'fit-content' }}>
          <div className="panel-header">
            <div>
              <div className="panel-subtitle">Configurações</div>
              <div className="panel-title">Parâmetros do Report</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            <div className="form-group">
              <label className="form-label">Cliente</label>
              <select 
                className="form-select" 
                value={selectedClient} 
                onChange={(e) => setSelectedClient(e.target.value)}
                style={{ width: '100%', background: 'var(--brand-surface-01)' }}
              >
                {MOCK_CLIENTS.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Período de Análise</label>
              <select 
                className="form-select" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ width: '100%', background: 'var(--brand-surface-01)' }}
              >
                <option value="04-2026">Abril 2026 (Parcial)</option>
                <option value="03-2026">Março 2026</option>
                <option value="02-2026">Fevereiro 2026</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Visual do PDF (Estética)</label>
              <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                <button 
                  className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'} btn-sm`} 
                  style={{ flex: 1 }}
                  onClick={() => setTheme('dark')}
                >
                  Modo Escuro
                </button>
                <button 
                  className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ flex: 1 }}
                  onClick={() => setTheme('light')}
                >
                  Modo Claro
                </button>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 'var(--space-8)' }}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <><RefreshCw size={16} className="spin" /> Processando Dados...</>
              ) : (
                <><Printer size={16} /> Gerar PDF Final</>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Preview Area */}
        <div className="panel animate-in" style={{ background: 'var(--brand-surface-02)', border: '1px dashed var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
            <div>
              <h3 style={{ fontSize: '1rem' }}><Eye size={18} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--brand-accent)' }}/>Pré-visualização</h3>
              <div style={{ fontSize: '12px', color: 'var(--brand-muted)' }}>Proporção nativa 16:9 (Apresentação Desktop/Mobile)</div>
            </div>
            {previewReady && (
              <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                <button className="btn btn-secondary btn-sm" title="Baixar PDF">
                  <Download size={14} /> PDF
                </button>
                <button className="btn btn-primary btn-sm" style={{ background: '#25D366', border: 'none' }}>
                  <Send size={14} /> WhatsApp
                </button>
              </div>
            )}
          </div>

          <div style={{
            width: '100%',
            aspectRatio: '16/9',
            background: theme === 'dark' ? '#0d111a' : '#f9fafb',
            borderRadius: '12px',
            border: theme === 'dark' ? '1px solid #1f2937' : '1px solid #e5e7eb',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!previewReady ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--brand-muted-deep)' }}>
                <RefreshCw size={32} className="spin" style={{ marginBottom: 16 }} />
                <span>Renderizando layout...</span>
              </div>
            ) : (
              // The Actual PDF Slide Mockup Rendering
              <div style={{ width: '100%', height: '100%', padding: '32px', display: 'flex', flexDirection: 'column', color: theme === 'dark' ? '#fff' : '#111827' }}>
                {/* PDF Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
                   <div>
                     <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
                       {client.name}
                     </div>
                     <div style={{ fontSize: '14px', color: theme === 'dark' ? '#9ca3af' : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                       <Calendar size={14} /> Relatório de Performance — {selectedMonth === '03-2026' ? 'Março de 2026' : (selectedMonth === '04-2026' ? 'Abril de 2026' : 'Fevereiro 2026')}
                     </div>
                   </div>
                   <div style={{ background: theme === 'dark' ? '#FF7A2E' : '#FF7A2E', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                     Z/MKT Assessoria
                   </div>
                </div>

                {/* PDF Body Data Matrix */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  marginTop: '40px',
                  marginBottom: 'auto'
                }}>
                  <div style={{ background: theme === 'dark' ? '#1f2937' : '#ffffff', padding: '20px', borderRadius: '12px', border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb' }}>
                     <div style={{ fontSize: '12px', color: theme === 'dark' ? '#9ca3af' : '#6b7280', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Pessoas Alcançadas</div>
                     <div style={{ fontSize: '32px', fontWeight: 800, color: theme === 'dark' ? '#f3f4f6' : '#111827' }}>{fmt(activeCampaign?.reach)}</div>
                  </div>
                  <div style={{ background: theme === 'dark' ? '#1f2937' : '#ffffff', padding: '20px', borderRadius: '12px', border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb' }}>
                     <div style={{ fontSize: '12px', color: theme === 'dark' ? '#9ca3af' : '#6b7280', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Custo por Resultado</div>
                     <div style={{ fontSize: '32px', fontWeight: 800, color: '#FF7A2E' }}>{fmtCurrency(activeCampaign?.cpc)}</div>
                  </div>
                  <div style={{ background: theme === 'dark' ? '#1f2937' : '#ffffff', padding: '20px', borderRadius: '12px', border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb' }}>
                     <div style={{ fontSize: '12px', color: theme === 'dark' ? '#9ca3af' : '#6b7280', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Métrica Principal</div>
                     <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981' }}>{fmt(activeCampaign?.leads ?? activeCampaign?.customMetrics?.newFollowers)}</div>
                  </div>
                </div>

                {/* PDF Footer insights */}
                <div style={{ marginTop: '24px', padding: '16px', background: theme === 'dark' ? 'rgba(255,122,46,0.1)' : 'rgba(255,122,46,0.05)', borderRadius: '12px', borderLeft: '4px solid #FF7A2E', display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ background: '#FF7A2E', padding: '12px', borderRadius: '50%', color: '#fff' }}>
                     <Smartphone size={24} />
                   </div>
                   <div>
                     <div style={{ fontSize: '12px', fontWeight: 700, color: '#FF7A2E', marginBottom: '2px' }}>INSIGHT DA AGÊNCIA</div>
                     <div style={{ fontSize: '14px', color: theme === 'dark' ? '#d1d5db' : '#4b5563', lineHeight: 1.4 }}>
                       As campanhas apresentaram uma estabilidade excelente durante o mês de {selectedMonth.split('-')[0]}. Recomendamos uma nova injeção de criativos para o próximo ciclo baseando-se no comportamento atual do público de {activeCampaign?.customMetrics?.audience || 'Alta Intenção'}.
                     </div>
                   </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
