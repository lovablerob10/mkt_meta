import { useState } from 'react';
import { Share2, Camera, MessageCircle, Link2, Check, AlertTriangle, RefreshCw } from 'lucide-react';

const MOCK_BMS = [
  { id: 'bm_001', name: 'Zara MKT Principal', status: 'connected', accounts: 8, pages: 5, igAccounts: 5 },
  { id: 'bm_002', name: 'Famoso Salgadinhos BM', status: 'connected', accounts: 2, pages: 1, igAccounts: 1 },
  { id: 'bm_003', name: 'Metropolitano BM', status: 'pending', accounts: 3, pages: 2, igAccounts: 2 },
];

export default function SettingsPage() {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => setConnecting(false), 2000);
  };

  return (
    <div className="page-content">
      <div className="page-heading animate-in">
        <h1>Configura<span className="accent">ções</span></h1>
        <p className="page-description">
          Conecte suas contas do Facebook e gerencie as integrações.
        </p>
      </div>

      {/* OAuth Connection */}
      <div className="panel animate-in">
        <div className="panel-header">
          <div>
            <div className="panel-subtitle">Integração</div>
            <div className="panel-title">Conexão com Facebook</div>
          </div>
        </div>

        <p style={{ color: 'var(--brand-muted)', marginBottom: 'var(--space-24)', maxWidth: 600 }}>
          Conecte o perfil do Facebook da agência para acessar todas as BMs (Business Managers),
          contas de anúncio, páginas do Facebook, perfis do Instagram e contas do WhatsApp vinculadas.
        </p>

        <button
          className="btn btn-primary"
          onClick={handleConnect}
          style={{ gap: 'var(--space-12)' }}
          disabled={connecting}
        >
          <Share2 size={18} />
          {connecting ? 'Conectando...' : 'Conectar com Facebook'}
        </button>

        <div style={{
          marginTop: 'var(--space-24)',
          padding: 'var(--space-16)',
          background: 'var(--brand-accent-10)',
          border: '1px solid rgba(255,122,46,0.2)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-body-sm)',
          color: 'var(--brand-offwhite-80)',
          maxWidth: 600,
        }}>
          <strong style={{ color: 'var(--brand-accent-light)' }}>Como funciona:</strong><br />
          1. Clique em "Conectar com Facebook"<br />
          2. Faça login com a conta da agência (Zara MKT)<br />
          3. Autorize o acesso às BMs e contas de anúncio<br />
          4. Todas as contas com acesso de administrador serão importadas automaticamente
        </div>
      </div>

      {/* Connected BMs */}
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
              background: 'var(--brand-surface-02)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-16) var(--space-24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-16)',
              border: 'var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                <div style={{
                  width: 40, height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: bm.status === 'connected'
                    ? 'var(--color-success-10)' : 'var(--color-warning-10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {bm.status === 'connected' ? (
                    <Check size={20} style={{ color: 'var(--color-success)' }} />
                  ) : (
                    <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--brand-offwhite)' }}>{bm.name}</div>
                  <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)' }}>
                    {bm.status === 'connected' ? 'Conectada' : 'Aguardando autorização'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                    {bm.accounts}
                  </div>
                  <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)' }}>
                    Contas
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                    <Share2 size={14} style={{ color: '#1877F2' }} /> {bm.pages}
                  </div>
                  <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)' }}>
                    Páginas
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                    <Camera size={14} style={{ color: '#E4405F' }} /> {bm.igAccounts}
                  </div>
                  <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)' }}>
                    Instagram
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* App Meta Info */}
      <div className="panel animate-in">
        <div className="panel-header">
          <div>
            <div className="panel-subtitle">Meta App</div>
            <div className="panel-title">Informações do App</div>
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-16)',
        }}>
          {[
            { label: 'App ID', value: '1209771084008116' },
            { label: 'Business ID', value: '26496637...' },
            { label: 'Status', value: 'Em desenvolvimento' },
            { label: 'Permissões', value: 'ads_read, ads_management, pages_read, instagram_basic' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'var(--brand-surface-02)',
              borderRadius: 'var(--radius-md)',
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
    </div>
  );
}
