import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLES, ROLE_PERMISSIONS } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Target,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'principal' },
  { to: '/campaigns', icon: Target, label: 'Campanhas', section: 'principal' },
  { to: '/leads', icon: MessageSquare, label: 'Central de Leads', section: 'principal' },
  { to: '/clients', icon: Users, label: 'Clientes', section: 'gestão' },
  { to: '/reports', icon: BarChart3, label: 'Relatórios', section: 'gestão' },
  { to: '/settings', icon: Settings, label: 'Configurações', section: 'sistema' },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, permissions } = useAuth();

  // Filtra itens pelo role do usuário
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!permissions) return false;
    // Checa se a seção é permitida
    if (!permissions.sidebarSections.includes(item.section)) return false;
    // Checa se a rota é permitida
    if (!permissions.allowedRoutes.includes(item.to)) return false;
    return true;
  });

  const grouped = visibleItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const sectionLabels = {
    principal: 'Principal',
    gestão: 'Gestão',
    sistema: 'Sistema',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role badge
  const roleBadge = user ? ROLE_PERMISSIONS[user.role] : null;

  return (
    <>
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">
            Z<span className="slash">/</span>MKT
          </div>
        </div>

        {/* Role Badge */}
        {user && roleBadge && (
          <div style={{
            margin: '0 16px 16px',
            padding: '10px 14px',
            background: `${roleBadge.color}12`,
            border: `1px solid ${roleBadge.color}30`,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <Shield size={14} style={{ color: roleBadge.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: roleBadge.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {roleBadge.label}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                {user.name}
              </div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section}>
              <div className="sidebar-label">{sectionLabels[section]}</div>
              {items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? ' active' : ''}`
                  }
                  onClick={onClose}
                >
                  <Icon />
                  <span>{label}</span>
                  {location.pathname === to && (
                    <ChevronRight style={{ marginLeft: 'auto', width: 14, height: 14, opacity: 0.5 }} />
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          <button className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent' }} onClick={handleLogout}>
            <LogOut />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  );
}
