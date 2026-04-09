import { Bell, Search, Menu } from 'lucide-react';
import { useAuth, ROLE_PERMISSIONS } from '../contexts/AuthContext';

export default function Header({ title, subtitle, onMenuToggle, hideMenu }) {
  const { user } = useAuth();

  const displayName = user?.name || 'Usuário';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const roleBadge = user ? ROLE_PERMISSIONS[user.role] : null;

  return (
    <header className="header">
      <div className="header-left">
        {!hideMenu && (
          <button className="mobile-menu-btn" onClick={onMenuToggle}>
            <Menu size={24} />
          </button>
        )}
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
          <div className="header-avatar" style={{
            background: roleBadge ? `${roleBadge.color}25` : undefined,
            color: roleBadge?.color || undefined,
            border: roleBadge ? `1px solid ${roleBadge.color}40` : undefined,
          }}>
            {initials}
          </div>
          <div>
            <div className="header-username">{displayName}</div>
            <div className="header-role">{roleBadge?.label || 'Usuário'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
