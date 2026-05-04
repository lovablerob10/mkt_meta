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
  const [clients, setClients] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('03-2026');
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewReady, setPreviewReady] = useState(false); // Default to false until data loads
  const [insightText, setInsightText] = useState('As campanhas apresentaram uma estabilidade excelente durante o mês. Recomendamos uma nova injeção de criativos para o próximo ciclo baseando-se no comportamento atual do público de Alta Intenção.');
  
  const [agencyLogoBase64, setAgencyLogoBase64] = useState(null);
  const [clientLogoBase64, setClientLogoBase64] = useState(null);

  const pdfRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: dbClients } = await supabase.from('clients').select('*');
        const { data: dbCampaigns } = await supabase.from('campaigns').select('*');
        
        if (dbClients) {
          setClients(dbClients);
          if (dbClients.length > 0) setSelectedClient(dbClients[0].id);
        }
        if (dbCampaigns) setCampaigns(dbCampaigns);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setPreviewReady(true);
      }
    }
    loadData();
  }, []);

  const client = clients.find(c => c.id === selectedClient) || { name: 'Selecione um Cliente' };
  
  // Aggregate campaigns for the selected client
  const clientCampaigns = campaigns.filter(c => c.client_id === selectedClient);
  
  const activeCampaign = clientCampaigns.length > 0 ? {
    reach: clientCampaigns.reduce((acc, curr) => acc + (curr.reach || 0), 0),
    impressions: clientCampaigns.reduce((acc, curr) => acc + (curr.impressions || 0), 0),
    clicks: clientCampaigns.reduce((acc, curr) => acc + (curr.clicks || 0), 0),
    cpc: clientCampaigns.reduce((acc, curr) => acc + (curr.cpc || 0), 0) / clientCampaigns.length || 0,
    leads: clientCampaigns.reduce((acc, curr) => acc + (curr.leads || 0), 0),
    spend: clientCampaigns.reduce((acc, curr) => acc + (curr.spend || 0), 0),
    customMetrics: clientCampaigns[0]?.custom_metrics || {}
  } : null;

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
      pdf.save(`Relatorio_${client.name.replace(/\s+/g, '_')}_${selectedMonth}.pdf`);
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
              <label className="form-label">Cliente</label>
              <select 
                className="form-select" 
                value={selectedClient} 
                onChange={(e) => setSelectedClient(e.target.value)}
                style={{ width: '100%', background: 'var(--brand-surface-01)' }}
              >
                {clients.map((c) => (
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
                  period={selectedMonth === '03-2026' ? 'Março de 2026' : (selectedMonth === '04-2026' ? 'Abril de 2026' : 'Fevereiro 2026')}
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
