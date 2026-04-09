import { useState } from 'react';
import {
  UserPlus, Copy, Send, Check, ChevronRight,
  Eye, EyeOff, Link2,
} from 'lucide-react';
import { MOCK_CLIENTS } from '../data/mockData';

const AVAILABLE_METRICS = [
  { key: 'spend', label: 'Investimento Total' },
  { key: 'leads', label: 'Leads Gerados' },
  { key: 'reach', label: 'Alcance' },
  { key: 'impressions', label: 'Impressões' },
  { key: 'cpc', label: 'CPC (Custo por Clique)' },
  { key: 'profit', label: 'Lucro Estimado' },
  { key: 'brandViews', label: 'Visualizações da Marca' },
  { key: 'followers', label: 'Novos Seguidores' },
  { key: 'profileVisits', label: 'Visitas ao Perfil' },
];

export default function Clients() {
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    countryCode: '+55',
    templateType: 'messages',
    selectedMetrics: ['spend', 'leads', 'cpc', 'profit'],
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);
    
    let masked = val;
    if (val.length > 2) {
      masked = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    }
    if (val.length > 7) {
      masked = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
    }
    
    setFormData(p => ({ ...p, phone: masked }));
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPhoneValid = formData.phone.length >= 14; 
  const isStep0Valid = formData.name.trim() !== '' && isEmailValid && isPhoneValid;

  const toggleMetric = (key) => {
    setFormData(prev => ({
      ...prev,
      selectedMetrics: prev.selectedMetrics.includes(key)
        ? prev.selectedMetrics.filter(m => m !== key)
        : [...prev.selectedMetrics, key],
    }));
  };

  return (
    <div className="page-content">
      <div className="page-heading animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-16)' }}>
          <div>
            <h1>Gestão de <span className="accent">Clientes</span></h1>
            <p className="page-description">
              Cadastre clientes, configure seus dashboards e envie o acesso via WhatsApp.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowWizard(true); setWizardStep(0); }}>
            <UserPlus size={16} /> Novo Cliente
          </button>
        </div>
      </div>

      {/* Client list */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 'var(--space-16)',
        marginBottom: 'var(--space-32)',
      }}>
        {MOCK_CLIENTS.map((client) => (
          <div key={client.id} className="panel animate-in" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--brand-offwhite)' }}>{client.name}</div>
                  <a 
                    href={`/client?id=${client.id}`} 
                    className="btn btn-secondary btn-sm" 
                    style={{ padding: '2px 8px', fontSize: '10px', height: 'auto', background: 'var(--brand-surface-01)', border: '1px solid var(--brand-accent)'}}
                  >
                    Ver Dash <Eye size={10} style={{ marginLeft: 4 }}/>
                  </a>
                </div>
                <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)' }}>
                  Desde {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <span className="status-badge good">
                <span className="status-dot" /> Ativo
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-body-sm)', color: 'var(--brand-offwhite-80)', marginBottom: 'var(--space-12)' }}>
              <div>📧 {client.email}</div>
              <div>📱 {client.phone}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-16)' }}>
              {client.dashboardConfig.showMetrics.map((m) => (
                <span key={m} className="status-badge good" style={{
                  background: 'var(--brand-accent-10)',
                  color: 'var(--brand-accent)',
                  fontSize: '0.6rem',
                }}>
                  {AVAILABLE_METRICS.find(am => am.key === m)?.label || m}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(`https://zmkt.app/d/${client.id}`)}>
                <Link2 size={14} /> {copied ? 'Copiado!' : 'Copiar Link'}
              </button>
              <a
                href={`https://wa.me/${client.phone}?text=${encodeURIComponent(
                  `Olá! Aqui está o link do seu dashboard Z/MKT:\n\nhttps://zmkt.app/d/${client.id}\n\nSenha: zmkt2026\n\nAcesse a qualquer momento para ver suas campanhas em tempo real! 🚀`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ background: '#25D366', border: 'none' }}
              >
                <Send size={14} /> Enviar via WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Wizard modal */}
      {showWizard && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,18,32,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 'var(--space-16)',
        }}>
          <div style={{
            background: 'var(--brand-surface-01)',
            border: 'var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-32)',
            maxWidth: 500,
            width: '100%',
            animation: 'chat-slide-up 0.3s var(--ease-default)',
          }}>
            {/* Progress */}
            <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-32)' }}>
              {[0, 1, 2].map((step) => (
                <div key={step} style={{
                  flex: 1, height: 3,
                  borderRadius: 'var(--radius-full)',
                  background: wizardStep >= step ? 'var(--brand-accent)' : 'var(--brand-surface-02)',
                  transition: 'background var(--duration-base) var(--ease-default)',
                }} />
              ))}
            </div>

            {wizardStep === 0 && (
              <>
                <h3 style={{ marginBottom: 'var(--space-24)' }}>
                  <UserPlus size={20} style={{ color: 'var(--brand-accent)', verticalAlign: 'middle', marginRight: 8 }} />
                  Dados do Cliente
                </h3>
                <div className="form-group">
                  <label className="form-label">Nome da empresa</label>
                  <input
                    className="form-input"
                    placeholder="Ex: Famoso Salgadinhos"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="contato@empresa.com.br"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    style={{
                       borderColor: formData.email.length > 0 && !isEmailValid ? 'var(--color-error)' : 'var(--border-subtle)'
                    }}
                  />
                  {formData.email.length > 0 && !isEmailValid && (
                    <div style={{ fontSize: '11px', color: 'var(--color-error)', marginTop: '4px' }}>Digite um e-mail válido</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp (para relatórios)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                      className="form-select"
                      value={formData.countryCode}
                      onChange={e => setFormData(p => ({ ...p, countryCode: e.target.value }))}
                      style={{ width: '100px', flexShrink: 0, paddingLeft: '8px' }}
                    >
                      <option value="+55">🇧🇷 +55</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+351">🇵🇹 +351</option>
                    </select>
                    <input
                      className="form-input"
                      style={{ flex: 1 }}
                      placeholder="(19) 99999-9999"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                    />
                  </div>
                </div>
              </>
            )}

            {wizardStep === 1 && (
              <>
                <h3 style={{ marginBottom: 'var(--space-8)' }}>
                  <Eye size={20} style={{ color: 'var(--brand-accent)', verticalAlign: 'middle', marginRight: 8 }} />
                  Visão do Cliente
                </h3>
                <p style={{ fontSize: 'var(--font-body-sm)', color: 'var(--brand-muted)', marginBottom: 'var(--space-24)' }}>
                  Escolha o template ideal para este cliente e selecione as métricas visíveis.
                </p>

                <div className="form-group" style={{ marginBottom: 'var(--space-24)' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Modelo do Dashboard</label>
                  <select 
                    className="form-select"
                    value={formData.templateType}
                    onChange={e => setFormData(p => ({ ...p, templateType: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--brand-surface-02)', border: '1px solid var(--border-subtle)', color: 'var(--brand-offwhite)' }}
                  >
                    <option value="branding">🚀 Branding e Reconhecimento (Visualizações, Seguidores)</option>
                    <option value="messages">💬 Captação de Mensagens (WhatsApp, B2B)</option>
                    <option value="real_estate">🏢 Imobiliário e Lançamentos (Distribuição de Empreendimentos)</option>
                  </select>
                </div>

                <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Métricas secundárias visíveis</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                  {AVAILABLE_METRICS.map(({ key, label }) => (
                    <label key={key} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-12)',
                      padding: 'var(--space-12) var(--space-16)',
                      borderRadius: 'var(--radius-md)',
                      background: formData.selectedMetrics.includes(key)
                        ? 'var(--brand-accent-10)' : 'var(--brand-surface-02)',
                      border: formData.selectedMetrics.includes(key)
                        ? '1px solid rgba(255,122,46,0.3)' : 'var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all var(--duration-fast) var(--ease-default)',
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.selectedMetrics.includes(key)}
                        onChange={() => toggleMetric(key)}
                        style={{ accentColor: 'var(--brand-accent)' }}
                      />
                      <span style={{
                        fontSize: 'var(--font-body-sm)',
                        color: formData.selectedMetrics.includes(key)
                          ? 'var(--brand-offwhite)' : 'var(--brand-muted)',
                      }}>
                        {label}
                      </span>
                      {formData.selectedMetrics.includes(key) ? (
                        <Eye size={14} style={{ marginLeft: 'auto', color: 'var(--brand-accent)' }} />
                      ) : (
                        <EyeOff size={14} style={{ marginLeft: 'auto', color: 'var(--brand-muted-deep)' }} />
                      )}
                    </label>
                  ))}
                </div>
              </>
            )}

            {wizardStep === 2 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-16)' }}>🎉</div>
                <h3 style={{ marginBottom: 'var(--space-8)' }}>
                  Cliente Criado com Sucesso!
                </h3>
                <p style={{ fontSize: 'var(--font-body-sm)', color: 'var(--brand-muted)', marginBottom: 'var(--space-24)' }}>
                  Envie o link e a senha abaixo para <strong style={{ color: 'var(--brand-offwhite)' }}>{formData.name || 'o cliente'}</strong>.
                </p>
                <div style={{
                  background: 'var(--brand-surface-02)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-16)',
                  marginBottom: 'var(--space-16)',
                  textAlign: 'left',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-body-sm)',
                }}>
                  <div style={{ color: 'var(--brand-muted)', marginBottom: 8 }}>Link do dashboard:</div>
                  <div style={{ color: 'var(--brand-accent-light)', wordBreak: 'break-all' }}>
                    https://zmkt.app/d/cli_{Date.now().toString(36)}
                  </div>
                  <div style={{ color: 'var(--brand-muted)', marginTop: 12, marginBottom: 4 }}>Senha:</div>
                  <div style={{ color: 'var(--brand-offwhite)', fontWeight: 700 }}>zmkt2026</div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-8)', justifyContent: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCopy('https://zmkt.app/d/demo')}>
                    <Copy size={14} /> Copiar
                  </button>
                  <a
                    href={`https://wa.me/${formData.countryCode.replace('+','')}${formData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá ${formData.name}! 👋\n\nSeu dashboard Z/MKT está pronto!\n\n🔗 Link: https://zmkt.app/d/demo\n🔑 Senha: zmkt2026\n\nAcesse a qualquer momento para acompanhar suas campanhas em tempo real! 📊`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ background: '#25D366', border: 'none' }}
                  >
                    <Send size={14} /> Enviar via WhatsApp
                  </a>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{
              display: 'flex',
              justifyContent: wizardStep === 0 ? 'flex-end' : 'space-between',
              marginTop: 'var(--space-32)',
            }}>
              {wizardStep > 0 && wizardStep < 2 && (
                <button className="btn btn-ghost btn-sm" onClick={() => setWizardStep(s => s - 1)}>
                  Voltar
                </button>
              )}
              {wizardStep < 2 ? (
                <button 
                  className={`btn ${wizardStep === 0 && !isStep0Valid ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  disabled={wizardStep === 0 && !isStep0Valid}
                  style={wizardStep === 0 && !isStep0Valid ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  onClick={() => setWizardStep(s => s + 1)}
                >
                  {wizardStep === 1 ? 'Criar Cliente' : 'Próximo'} <ChevronRight size={14} />
                </button>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => setShowWizard(false)} style={{ marginLeft: 'auto' }}>
                  Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
