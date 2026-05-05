import { useState, useRef, useEffect } from 'react';
import {
  FileText, Check, Download, Send, RefreshCw, Eye, Calendar, Printer, Smartphone, UploadCloud, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PrintableReport from '../components/PrintableReport';

const fmt = (n) => n ? n.toLocaleString('pt-BR') : '0';
const fmtCurrency = (n) => n ? `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00';

export default function Reports() {
  const [manualData, setManualData] = useState({
    clientName: 'M&C Cortinas',
    period: 'Últimos 30 Dias',
    spend: 0,
    leads: 0,
    reach: 0,
    impressions: 0,
    clicks: 0
  });

  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewReady, setPreviewReady] = useState(true);
  const [insightText, setInsightText] = useState('As campanhas apresentaram uma estabilidade excelente durante o mês. Recomendamos uma nova injeção de criativos para o próximo ciclo baseando-se no comportamento atual do público de Alta Intenção.');
  
  const [agencyLogoBase64, setAgencyLogoBase64] = useState(null);
  const [clientLogoBase64, setClientLogoBase64] = useState(null);

  const pdfRef = useRef(null);

  const client = { name: manualData.clientName };
  
  const activeCampaign = {
    reach: manualData.reach,
    impressions: manualData.impressions,
    clicks: manualData.clicks,
    leads: manualData.leads,
    spend: manualData.spend
  };

  const handleGenerate = async () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);
    setPreviewReady(true);
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123] // A4 dimensions
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123);
      pdf.save(`Relatorio_${client.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogoUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
              <label className="form-label">Cliente (Ex: M&C Cortinas)</label>
              <input 
                type="text"
                className="form-input" 
                value={manualData.clientName} 
                onChange={(e) => setManualData({...manualData, clientName: e.target.value})}
                style={{ width: '100%', background: 'var(--brand-surface-01)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Período Customizado (Ex: Últimos 30 Dias)</label>
              <input 
                type="text"
                className="form-input" 
                value={manualData.period} 
                onChange={(e) => setManualData({...manualData, period: e.target.value})}
                style={{ width: '100%', background: 'var(--brand-surface-01)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
              <div className="form-group">
                <label className="form-label">Investimento (R$)</label>
                <input type="number" className="form-input" value={manualData.spend || ''} onChange={e => setManualData({...manualData, spend: parseFloat(e.target.value) || 0})} style={{ background: 'var(--brand-surface-01)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Leads</label>
                <input type="number" className="form-input" value={manualData.leads || ''} onChange={e => setManualData({...manualData, leads: parseInt(e.target.value) || 0})} style={{ background: 'var(--brand-surface-01)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Alcance</label>
                <input type="number" className="form-input" value={manualData.reach || ''} onChange={e => setManualData({...manualData, reach: parseInt(e.target.value) || 0})} style={{ background: 'var(--brand-surface-01)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Impressões</label>
                <input type="number" className="form-input" value={manualData.impressions || ''} onChange={e => setManualData({...manualData, impressions: parseInt(e.target.value) || 0})} style={{ background: 'var(--brand-surface-01)' }} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Cliques Totais</label>
                <input type="number" className="form-input" value={manualData.clicks || ''} onChange={e => setManualData({...manualData, clicks: parseInt(e.target.value) || 0})} style={{ background: 'var(--brand-surface-01)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Marcas (Logos para PDF)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
                <label className="btn btn-secondary btn-sm" style={{ padding: '8px', textAlign: 'center', cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <ImageIcon size={14} style={{ marginRight: 6 }}/> {agencyLogoBase64 ? 'Capa Agência (OK)' : 'Logo Z/MKT'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleLogoUpload(e, setAgencyLogoBase64)} />
                </label>
                <label className="btn btn-secondary btn-sm" style={{ padding: '8px', textAlign: 'center', cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <UploadCloud size={14} style={{ marginRight: 6 }}/> {clientLogoBase64 ? 'Capa Cliente (OK)' : 'Logo Cliente'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleLogoUpload(e, setClientLogoBase64)} />
                </label>
              </div>
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

            <div className="form-group">
              <label className="form-label">Insight da Agência (Texto do Rodapé)</label>
              <textarea 
                className="form-input" 
                rows="3"
                value={insightText}
                onChange={(e) => setInsightText(e.target.value)}
                style={{ width: '100%', background: 'var(--brand-surface-01)', resize: 'vertical', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
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
              <h3 style={{ fontSize: '1rem' }}><Eye size={18} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--brand-accent)' }}/>Pré-visualização do PDF</h3>
              <div style={{ fontSize: '12px', color: 'var(--brand-muted)' }}>Formato A4 (Retrato) para Impressão</div>
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
            height: '600px', // Fixed height for scrollable preview
            background: '#e5e7eb',
            borderRadius: '12px',
            border: '1px solid #d1d5db',
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
            position: 'relative',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '20px'
          }}>
            {!previewReady ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--brand-muted-deep)', marginTop: '100px' }}>
                <RefreshCw size={32} className="spin" style={{ marginBottom: 16 }} />
                <span>Renderizando layout...</span>
              </div>
            ) : (
              <div style={{ transformOrigin: 'top center', transform: 'scale(0.8)', marginBottom: '-20%' }}>
                <PrintableReport 
                  ref={pdfRef}
                  client={client}
                  period={manualData.period}
                  metrics={activeCampaign}
                  insightText={insightText}
                  agencyLogo={agencyLogoBase64}
                  clientLogo={clientLogoBase64}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
