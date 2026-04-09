import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIChatWidget from './components/AIChatWidget';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardClient from './pages/DashboardClient';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import SettingsPage from './pages/Settings';

// Placeholder pages
function CampaignsPage() {
  return (
    <div className="page-content">
      <div className="page-heading animate-in">
        <h1>Suas <span className="accent">Campanhas</span></h1>
        <p className="page-description">
          Listagem detalhada de todas as campanhas ativas e pausadas.
          <br /><em style={{ color: 'var(--brand-muted-deep)' }}>Em construção — acesse pelo Dashboard Admin.</em>
        </p>
      </div>
    </div>
  );
}

import Reports from './pages/Reports';

const ROUTE_TITLES = {
  '/': { title: 'Painel <span class="accent">Administrativo</span>', sub: 'Dashboard' },
  '/client': { title: 'Dashboard do <span class="accent">Cliente</span>', sub: 'Visão do cliente' },
  '/campaigns': { title: 'Suas <span class="accent">Campanhas</span>', sub: 'Campanhas' },
  '/leads': { title: 'Central de <span class="accent">Leads</span>', sub: 'Leads' },
  '/clients': { title: 'Gestão de <span class="accent">Clientes</span>', sub: 'Clientes' },
  '/reports': { title: 'Relat<span class="accent">órios</span>', sub: 'Relatórios' },
  '/settings': { title: 'Configura<span class="accent">ções</span>', sub: 'Configurações' },
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const path = window.location.pathname;
  const routeInfo = ROUTE_TITLES[path] || ROUTE_TITLES['/'];

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Header
          title={routeInfo.title}
          subtitle={routeInfo.sub}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <Routes>
          <Route path="/" element={<DashboardAdmin />} />
          <Route path="/client" element={<DashboardClient />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <AIChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
