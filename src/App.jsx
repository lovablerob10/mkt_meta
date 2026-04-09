import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ROLES } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIChatWidget from './components/AIChatWidget';
import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardClient from './pages/DashboardClient';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import Reports from './pages/Reports';
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

const ROUTE_TITLES = {
  '/': { title: 'Painel <span class="accent">Administrativo</span>', sub: 'Dashboard' },
  '/client': { title: 'Dashboard do <span class="accent">Cliente</span>', sub: 'Visão do cliente' },
  '/campaigns': { title: 'Suas <span class="accent">Campanhas</span>', sub: 'Campanhas' },
  '/leads': { title: 'Central de <span class="accent">Leads</span>', sub: 'Leads' },
  '/clients': { title: 'Gestão de <span class="accent">Clientes</span>', sub: 'Clientes' },
  '/reports': { title: 'Relat<span class="accent">órios</span>', sub: 'Relatórios' },
  '/settings': { title: 'Configura<span class="accent">ções</span>', sub: 'Configurações' },
};

// ────────────────────────────────────────────────────────
// AppContent — Layout principal com sidebar e rotas protegidas
// ────────────────────────────────────────────────────────
function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const path = window.location.pathname;
  const routeInfo = ROUTE_TITLES[path] || ROUTE_TITLES['/'];

  // Se não está logado, qualquer rota protegida redireciona para /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Cliente não vê sidebar nem header admin
  const isClienteRole = user?.role === ROLES.CLIENTE;

  return (
    <div className="app-layout">
      {!isClienteRole && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div className="main-area" style={isClienteRole ? { marginLeft: 0 } : undefined}>
        <Header
          title={routeInfo.title}
          subtitle={routeInfo.sub}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          hideMenu={isClienteRole}
        />
        <Routes>
          {/* Rotas Admin/Gestor */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={[ROLES.MASTER, ROLES.GESTOR]}>
              <DashboardAdmin />
            </ProtectedRoute>
          } />
          <Route path="/campaigns" element={
            <ProtectedRoute allowedRoles={[ROLES.MASTER, ROLES.GESTOR]}>
              <CampaignsPage />
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute allowedRoles={[ROLES.MASTER, ROLES.GESTOR]}>
              <Leads />
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute allowedRoles={[ROLES.MASTER, ROLES.GESTOR]}>
              <Clients />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={[ROLES.MASTER, ROLES.GESTOR]}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={[ROLES.MASTER]}>
              <SettingsPage />
            </ProtectedRoute>
          } />

          {/* Rota do Cliente — acessível por todos */}
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={[ROLES.MASTER, ROLES.GESTOR, ROLES.CLIENTE]}>
              <DashboardClient />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={isClienteRole ? '/client' : '/'} replace />} />
        </Routes>
      </div>
      {!isClienteRole && <AIChatWidget />}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// App — Root com AuthProvider e Router
// ────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota pública: Login */}
          <Route path="/login" element={<LoginGuard />} />

          {/* Todas as outras rotas passam pelo AppContent */}
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Se já está logado e tenta ir no /login, redireciona p/ home
function LoginGuard() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === ROLES.CLIENTE ? '/client' : '/'} replace />;
  }
  return <Login />;
}
