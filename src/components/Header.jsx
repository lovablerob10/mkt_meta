import { Bell, Search, Menu } from 'lucide-react';

export default function Header({ title, subtitle, onMenuToggle }) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuToggle}>
          <Menu size={24} />
        </button>
        <div>
          <div className="header-breadcrumb">{subtitle}</div>
          <h2 className="header-title" dangerouslySetInnerHTML={{ __html: title }} />
        </div>
      </div>
      <div className="header-right">
        <button className="header-btn" title="Buscar">
          <Search size={18} />
        </button>
        <button className="header-btn" title="Notificações" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--brand-accent)',
          }} />
        </button>
        <div className="header-user">
          <div className="header-avatar">ZM</div>
          <div>
            <div className="header-username">Zara MKT</div>
            <div className="header-role">Administrador</div>
          </div>
        </div>
      </div>
    </header>
  );
}
