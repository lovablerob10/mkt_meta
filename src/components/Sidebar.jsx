import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Target,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
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

  const grouped = NAV_ITEMS.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const sectionLabels = {
    principal: 'Principal',
    gestão: 'Gestão',
    sistema: 'Sistema',
  };

  return (
    <>
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">
            Z<span className="slash">/</span>MKT
          </div>
        </div>

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
          <button className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent' }}>
            <LogOut />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  );
}
