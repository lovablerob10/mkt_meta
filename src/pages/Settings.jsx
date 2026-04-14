import { useState, useEffect, useCallback } from 'react';
import {
  Share2, Camera, MessageCircle, Link2, Check, AlertTriangle, RefreshCw,
  UserPlus, Shield, Users, Briefcase, Trash2, Edit3, X, Eye, EyeOff, Loader,
  Mail, Phone, Lock, ChevronRight, Copy, Send,
} from 'lucide-react';
import { useAuth, ROLES } from '../contexts/AuthContext';
import * as adminService from '../lib/adminService';
import { MOCK_CLIENTS } from '../data/mockData';

// ────────────────────────────────────────────────────────
// TABS CONFIG
// ────────────────────────────────────────────────────────
const TABS = [
  { key: 'users', label: 'Usuários', icon: Users },
  { key: 'clients', label: 'Clientes', icon: Briefcase },
  { key: 'integrations', label: 'Integrações', icon: Share2 },
];

const ROLE_CONFIG = {
  MASTER: { label: 'Master', color: '#FF7A2E', icon: Shield },
  GESTOR: { label: 'Gestor', color: '#3B6BB5', icon: Users },
  CLIENTE: { label: 'Cliente', color: '#10b981', icon: Briefcase },
};

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

// ────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="page-content">
      <div className="page-heading animate-in">
        <h1>Configura<span className="accent">ções</span></h1>
        <p className="page-description">
          Gerencie usuários, clientes e integrações do Z/MKT.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-24)',
        background: 'var(--brand-surface-01)',
        padding: '4px',
        borderRadius: 'var(--radius-lg)',
        border: 'var(--border-subtle)',
      }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--font-body-sm)',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              background: activeTab === key
                ? 'linear-gradient(135deg, rgba(255,122,46,0.15), rgba(255,122,46,0.05))'
                : 'transparent',
              color: activeTab === key ? '#FF7A2E' : 'var(--brand-muted)',
              boxShadow: activeTab === key
                ? 'inset 0 0 0 1px rgba(255,122,46,0.3)' : 'none',
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'clients' && <ClientsTab />}
      {activeTab === 'integrations' && <IntegrationsTab />}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// TAB 1: USERS
// ════════════════════════════════════════════════════════
function UsersTab() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.listProfiles();
      setProfiles(data || []);
    } catch (err) {
      console.error('[ZMKT] Erro ao carregar perfis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  return (
    <>
      <div className="panel animate-in">
        <div className="panel-header">
          <div>
            <div className="panel-subtitle">Administração</div>
            <div className="panel-title">Gestão de Usuários</div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
            <button className="btn btn-ghost btn-sm" onClick={loadProfiles}>
              <RefreshCw size={14} /> Atualizar
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <UserPlus size={14} /> Novo Usuário
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: 'var(--space-12)',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-md)',
            color: '#fca5a5',
            fontSize: 'var(--font-body-sm)',
            marginBottom: 'var(--space-16)',
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-32)', color: 'var(--brand-muted)' }}>
            <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 'var(--space-8)' }}>Carregando usuários...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-32)', color: 'var(--brand-muted)' }}>
            <Users size={40} style={{ opacity: 0.3, marginBottom: 'var(--space-8)' }} />
            <p>Nenhum usuário cadastrado</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr 120px 120px',
              gap: 'var(--space-16)',
              padding: 'var(--space-8) var(--space-16)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--brand-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              <span>Nome</span>
              <span>Email</span>
              <span>Role</span>
              <span>Desde</span>
            </div>

            {/* Rows */}
            {profiles.map((profile) => {
              const roleConf = ROLE_CONFIG[profile.role] || ROLE_CONFIG.CLIENTE;
              const RoleIcon = roleConf.icon;
              return (
                <div
                  key={profile.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.5fr 120px 120px',
                    gap: 'var(--space-16)',
                    padding: 'var(--space-12) var(--space-16)',
                    background: 'var(--brand-surface-02)',
                    borderRadius: 'var(--radius-md)',
                    alignItems: 'center',
                    border: 'var(--border-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = `${roleConf.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--brand-surface-02)';
                    e.currentTarget.style.borderColor = '';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-10)' }}>
                    <div style={{
                      width: 32, height: 32,
                      borderRadius: 'var(--radius-md)',
                      background: `${roleConf.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <RoleIcon size={14} style={{ color: roleConf.color }} />
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--brand-offwhite)', fontSize: 'var(--font-body-sm)' }}>
                      {profile.name}
                    </span>
                  </div>

                  <span style={{ color: 'var(--brand-offwhite-80)', fontSize: 'var(--font-body-sm)' }}>
                    {profile.email}
                  </span>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: `${roleConf.color}15`,
                    color: roleConf.color,
                    fontSize: '11px',
                    fontWeight: 700,
                    width: 'fit-content',
                  }}>
                    {roleConf.label}
                  </span>

                  <span style={{ color: 'var(--brand-muted)', fontSize: 'var(--font-caption)' }}>
                    {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            loadProfiles();
          }}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────
// CREATE USER MODAL
// ────────────────────────────────────────────────────────
function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'GESTOR',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isValid = form.name.trim() && form.email.includes('@') && form.password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError('');
    try {
      await adminService.createUser(form);
      setSuccess(true);
      setTimeout(() => onCreated(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <ModalOverlay onClose={onClose}>
        <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-16)',
          }}>
            <Check size={32} style={{ color: '#10b981' }} />
          </div>
          <h3 style={{ marginBottom: 'var(--space-8)' }}>Usuário Criado!</h3>
          <p style={{ color: 'var(--brand-muted)', fontSize: 'var(--font-body-sm)' }}>
            <strong style={{ color: 'var(--brand-offwhite)' }}>{form.name}</strong> foi adicionado como{' '}
            <span style={{ color: ROLE_CONFIG[form.role].color }}>{ROLE_CONFIG[form.role].label}</span>.
          </p>
        </div>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h3 style={{ marginBottom: 'var(--space-24)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        <UserPlus size={20} style={{ color: 'var(--brand-accent)' }} />
        Novo Usuário
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nome completo</label>
          <div style={{ position: 'relative' }}>
            <Users size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 36 }}
              placeholder="Ex: Ana Silva"
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">E-mail</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-muted)' }} />
            <input
              className="form-input"
              type="email"
              style={{ paddingLeft: 36 }}
              placeholder="email@empresa.com"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Senha</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-muted)' }} />
            <input
              className="form-input"
              type={showPwd ? 'text' : 'password'}
              style={{ paddingLeft: 36, paddingRight: 40 }}
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--brand-muted)', cursor: 'pointer',
              }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Tipo de acesso</label>
          <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
            {['GESTOR', 'CLIENTE'].map((role) => {
              const conf = ROLE_CONFIG[role];
              const Icon = conf.icon;
              const isActive = form.role === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, role }))}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isActive ? conf.color + '60' : 'rgba(255,255,255,0.08)'}`,
                    background: isActive ? `${conf.color}12` : 'var(--brand-surface-02)',
                    color: isActive ? conf.color : 'var(--brand-muted)',
                    cursor: 'pointer',
                    fontSize: 'var(--font-body-sm)',
                    fontWeight: isActive ? 700 : 400,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={16} />
                  {conf.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div style={{
            padding: 'var(--space-12)',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-md)',
            color: '#fca5a5',
            fontSize: 'var(--font-body-sm)',
            marginBottom: 'var(--space-16)',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-8)', justifyContent: 'flex-end', marginTop: 'var(--space-24)' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={!isValid || loading}
            style={{ opacity: (!isValid || loading) ? 0.5 : 1 }}
          >
            {loading ? (
              <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Criando...</>
            ) : (
              <><UserPlus size={14} /> Criar Usuário</>
            )}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ════════════════════════════════════════════════════════
// TAB 2: CLIENTS (mock por enquanto)
// ════════════════════════════════════════════════════════
function ClientsTab() {
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
    if (val.length > 2) masked = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    if (val.length > 7) masked = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
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
    <>
      <div className="panel animate-in">
        <div className="panel-header">
          <div>
            <div className="panel-subtitle">Cadastro</div>
            <div className="panel-title">Gestão de Clientes</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowWizard(true); setWizardStep(0); }}>
            <UserPlus size={14} /> Novo Cliente
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--space-12)',
        }}>
          {MOCK_CLIENTS.map((client) => (
            <div key={client.id} style={{
              background: 'var(--brand-surface-02)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-16)',
              border: 'var(--border-subtle)',
              transition: 'all 0.15s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,122,46,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-12)' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-offwhite)', fontSize: 'var(--font-body-sm)' }}>
                  {client.name}
                </div>
                <span className="status-badge good" style={{ fontSize: '10px' }}>
                  <span className="status-dot" /> Ativo
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--brand-offwhite-80)', marginBottom: 'var(--space-8)' }}>
                <div>📧 {client.email}</div>
                <div>📱 {client.phone}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: 'var(--space-12)' }}>
                {client.dashboardConfig.showMetrics.slice(0, 4).map((m) => (
                  <span key={m} style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--brand-accent-10)',
                    color: 'var(--brand-accent)',
                    fontSize: '10px',
                    fontWeight: 600,
                  }}>
                    {AVAILABLE_METRICS.find(am => am.key === m)?.label || m}
                  </span>
                ))}
                {client.dashboardConfig.showMetrics.length > 4 && (
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--brand-muted)',
                    fontSize: '10px',
                  }}>
                    +{client.dashboardConfig.showMetrics.length - 4}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '11px' }} onClick={() => handleCopy(`https://zmkt.app/d/${client.id}`)}>
                  <Link2 size={12} /> {copied ? 'Copiado!' : 'Copiar Link'}
                </button>
                <a
                  href={`https://wa.me/${client.phone}?text=${encodeURIComponent(
                    `Olá! Seu dashboard Z/MKT:\n\nhttps://zmkt.app/d/${client.id}\nSenha: zmkt2026\n\n📊 Acesse em tempo real!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ background: '#25D366', border: 'none', flex: 1, fontSize: '11px', textDecoration: 'none' }}
                >
                  <Send size={12} /> WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <ModalOverlay onClose={() => setShowWizard(false)}>
          {/* Progress */}
          <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-24)' }}>
            {[0, 1, 2].map((step) => (
              <div key={step} style={{
                flex: 1, height: 3,
                borderRadius: 'var(--radius-full)',
                background: wizardStep >= step ? 'var(--brand-accent)' : 'var(--brand-surface-02)',
                transition: 'background 0.2s ease',
              }} />
            ))}
          </div>

          {wizardStep === 0 && (
            <>
              <h3 style={{ marginBottom: 'var(--space-16)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={20} style={{ color: 'var(--brand-accent)' }} />
                Dados do Cliente
              </h3>
              <div className="form-group">
                <label className="form-label">Nome da empresa</label>
                <input className="form-input" placeholder="Ex: Famoso Salgadinhos" value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input className="form-input" type="email" placeholder="contato@empresa.com.br" value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  style={{ borderColor: formData.email.length > 0 && !isEmailValid ? 'var(--color-error)' : '' }} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select className="form-select" value={formData.countryCode}
                    onChange={e => setFormData(p => ({ ...p, countryCode: e.target.value }))}
                    style={{ width: 100, flexShrink: 0, paddingLeft: 8 }}>
                    <option value="+55">🇧🇷 +55</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+351">🇵🇹 +351</option>
                  </select>
                  <input className="form-input" style={{ flex: 1 }} placeholder="(19) 99999-9999"
                    value={formData.phone} onChange={handlePhoneChange} />
                </div>
              </div>
            </>
          )}

          {wizardStep === 1 && (
            <>
              <h3 style={{ marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={20} style={{ color: 'var(--brand-accent)' }} />
                Visão do Cliente
              </h3>
              <p style={{ fontSize: 'var(--font-body-sm)', color: 'var(--brand-muted)', marginBottom: 'var(--space-16)' }}>
                Escolha o template e as métricas visíveis.
              </p>
              <div className="form-group" style={{ marginBottom: 'var(--space-16)' }}>
                <label className="form-label">Modelo do Dashboard</label>
                <select className="form-select" value={formData.templateType}
                  onChange={e => setFormData(p => ({ ...p, templateType: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--brand-surface-02)', border: '1px solid var(--border-subtle)', color: 'var(--brand-offwhite)' }}>
                  <option value="branding">🚀 Branding e Reconhecimento</option>
                  <option value="messages">💬 Captação de Mensagens</option>
                  <option value="real_estate">🏢 Imobiliário</option>
                </select>
              </div>
              <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>Métricas visíveis</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxHeight: 280, overflowY: 'auto' }}>
                {AVAILABLE_METRICS.map(({ key, label }) => (
                  <label key={key} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-12)',
                    padding: 'var(--space-10) var(--space-12)',
                    borderRadius: 'var(--radius-md)',
                    background: formData.selectedMetrics.includes(key) ? 'var(--brand-accent-10)' : 'var(--brand-surface-02)',
                    border: formData.selectedMetrics.includes(key) ? '1px solid rgba(255,122,46,0.3)' : 'var(--border-subtle)',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}>
                    <input type="checkbox" checked={formData.selectedMetrics.includes(key)}
                      onChange={() => toggleMetric(key)} style={{ accentColor: 'var(--brand-accent)' }} />
                    <span style={{
                      fontSize: 'var(--font-body-sm)',
                      color: formData.selectedMetrics.includes(key) ? 'var(--brand-offwhite)' : 'var(--brand-muted)',
                    }}>
                      {label}
                    </span>
                    {formData.selectedMetrics.includes(key)
                      ? <Eye size={14} style={{ marginLeft: 'auto', color: 'var(--brand-accent)' }} />
                      : <EyeOff size={14} style={{ marginLeft: 'auto', color: 'var(--brand-muted-deep)' }} />}
                  </label>
                ))}
              </div>
            </>
          )}

          {wizardStep === 2 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-16)' }}>🎉</div>
              <h3 style={{ marginBottom: 'var(--space-8)' }}>Cliente Criado!</h3>
              <p style={{ fontSize: 'var(--font-body-sm)', color: 'var(--brand-muted)', marginBottom: 'var(--space-16)' }}>
                Envie o link para <strong style={{ color: 'var(--brand-offwhite)' }}>{formData.name || 'o cliente'}</strong>.
              </p>
              <div style={{
                background: 'var(--brand-surface-02)', borderRadius: 'var(--radius-md)',
                padding: 'var(--space-16)', marginBottom: 'var(--space-16)', textAlign: 'left',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-body-sm)',
              }}>
                <div style={{ color: 'var(--brand-muted)', marginBottom: 4 }}>Link:</div>
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
                  href={`https://wa.me/${formData.countryCode.replace('+', '')}${formData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Olá ${formData.name}! 👋\n\nSeu dashboard Z/MKT está pronto!\n\n🔗 Link: https://zmkt.app/d/demo\n🔑 Senha: zmkt2026`
                  )}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary btn-sm" style={{ background: '#25D366', border: 'none', textDecoration: 'none' }}
                >
                  <Send size={14} /> WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: wizardStep === 0 ? 'flex-end' : 'space-between',
            marginTop: 'var(--space-24)',
          }}>
            {wizardStep > 0 && wizardStep < 2 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setWizardStep(s => s - 1)}>Voltar</button>
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
        </ModalOverlay>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════
// TAB 3: INTEGRATIONS (preserva conteúdo original)
// ════════════════════════════════════════════════════════
function IntegrationsTab() {
  const [connecting, setConnecting] = useState(false);

  const MOCK_BMS = [
    { id: 'bm_001', name: 'Zara MKT Principal', status: 'connected', accounts: 8, pages: 5, igAccounts: 5 },
    { id: 'bm_002', name: 'Famoso Salgadinhos BM', status: 'connected', accounts: 2, pages: 1, igAccounts: 1 },
    { id: 'bm_003', name: 'Metropolitano BM', status: 'pending', accounts: 3, pages: 2, igAccounts: 2 },
  ];

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => setConnecting(false), 2000);
  };

  return (
    <>
      {/* OAuth */}
      <div className="panel animate-in">
        <div className="panel-header">
          <div>
            <div className="panel-subtitle">Integração</div>
            <div className="panel-title">Conexão com Facebook</div>
          </div>
        </div>
        <p style={{ color: 'var(--brand-muted)', marginBottom: 'var(--space-24)', maxWidth: 600 }}>
          Conecte o perfil do Facebook da agência para acessar todas as BMs,
          contas de anúncio, páginas e perfis do Instagram.
        </p>
        <button className="btn btn-primary" onClick={handleConnect} disabled={connecting}
          style={{ gap: 'var(--space-12)' }}>
          <Share2 size={18} />
          {connecting ? 'Conectando...' : 'Conectar com Facebook'}
        </button>
        <div style={{
          marginTop: 'var(--space-24)', padding: 'var(--space-16)',
          background: 'var(--brand-accent-10)', border: '1px solid rgba(255,122,46,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 'var(--font-body-sm)',
          color: 'var(--brand-offwhite-80)', maxWidth: 600,
        }}>
          <strong style={{ color: 'var(--brand-accent-light)' }}>Como funciona:</strong><br />
          1. Clique em "Conectar com Facebook"<br />
          2. Faça login com a conta da agência<br />
          3. Autorize o acesso às BMs e contas de anúncio<br />
          4. Todas as contas serão importadas automaticamente
        </div>
      </div>

      {/* BMs */}
      <div className="panel animate-in">
        <div className="panel-header">
          <div>
            <div className="panel-subtitle">Business Managers</div>
            <div className="panel-title">BMs Conectadas</div>
          </div>
          <button className="btn btn-ghost btn-sm">
            <RefreshCw size={14} /> Sincronizar
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          {MOCK_BMS.map((bm) => (
            <div key={bm.id} style={{
              background: 'var(--brand-surface-02)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-16) var(--space-24)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 'var(--space-16)', border: 'var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: bm.status === 'connected' ? 'var(--color-success-10)' : 'var(--color-warning-10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {bm.status === 'connected'
                    ? <Check size={20} style={{ color: 'var(--color-success)' }} />
                    : <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--brand-offwhite)' }}>{bm.name}</div>
                  <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)' }}>
                    {bm.status === 'connected' ? 'Conectada' : 'Aguardando autorização'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
                {[
                  { value: bm.accounts, label: 'Contas', icon: null },
                  { value: bm.pages, label: 'Páginas', icon: <Share2 size={14} style={{ color: '#1877F2' }} /> },
                  { value: bm.igAccounts, label: 'Instagram', icon: <Camera size={14} style={{ color: '#E4405F' }} /> },
                ].map(({ value, label, icon }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                      {icon} {value}
                    </div>
                    <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* App Info */}
      <div className="panel animate-in">
        <div className="panel-header">
          <div>
            <div className="panel-subtitle">Meta App</div>
            <div className="panel-title">Informações do App</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-16)' }}>
          {[
            { label: 'App ID', value: '1209771084008116' },
            { label: 'Business ID', value: '26496637...' },
            { label: 'Status', value: 'Em desenvolvimento' },
            { label: 'Permissões', value: 'ads_read, ads_management, pages_read, instagram_basic' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'var(--brand-surface-02)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-12) var(--space-16)',
            }}>
              <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-body-sm)', color: 'var(--brand-offwhite-80)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════
// SHARED: Modal Overlay
// ════════════════════════════════════════════════════════
function ModalOverlay({ children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(10,18,32,0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 'var(--space-16)',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--brand-surface-01)',
        border: 'var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-32)',
        maxWidth: 480,
        width: '100%',
        animation: 'chat-slide-up 0.3s var(--ease-default)',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none',
            color: 'var(--brand-muted)', cursor: 'pointer',
            padding: 4,
          }}
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
