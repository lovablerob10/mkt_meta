import { createContext, useContext, useState, useCallback } from 'react';

// ────────────────────────────────────────────────────────
// RBAC Roles — conforme SPEC.md §3
// ────────────────────────────────────────────────────────
export const ROLES = {
  MASTER: 'MASTER',
  GESTOR: 'GESTOR',
  CLIENTE: 'CLIENTE',
};

// ────────────────────────────────────────────────────────
// Permissões por role — quais rotas cada nível pode ver
// ────────────────────────────────────────────────────────
export const ROLE_PERMISSIONS = {
  [ROLES.MASTER]: {
    allowedRoutes: ['/', '/campaigns', '/leads', '/clients', '/reports', '/settings', '/client'],
    sidebarSections: ['principal', 'gestão', 'sistema'],
    label: 'Master (Proprietário)',
    color: '#FF7A2E',
  },
  [ROLES.GESTOR]: {
    allowedRoutes: ['/', '/campaigns', '/leads', '/clients', '/reports', '/client'],
    sidebarSections: ['principal', 'gestão'],
    label: 'Gestor (Analista)',
    color: '#3B6BB5',
  },
  [ROLES.CLIENTE]: {
    allowedRoutes: ['/client'],
    sidebarSections: [],
    label: 'Cliente Final',
    color: '#10b981',
  },
};

// ────────────────────────────────────────────────────────
// Mock Users — serão substituídos por Supabase Auth
// ────────────────────────────────────────────────────────
const MOCK_USERS = {
  master: {
    id: 'usr_master_001',
    name: 'Zara (Master)',
    email: 'zara@zmkt.com',
    role: ROLES.MASTER,
    avatar: null,
    clientId: null,
  },
  gestor: {
    id: 'usr_gestor_001',
    name: 'Ana Silva (Gestora)',
    email: 'ana@zmkt.com',
    role: ROLES.GESTOR,
    avatar: null,
    clientId: null,
    assignedClients: ['cli_001', 'cli_002', 'cli_003', 'cli_004', 'cli_005'],
  },
  cliente: {
    id: 'usr_cliente_001',
    name: 'M Politano',
    email: 'marketing@mpolitano.com.br',
    role: ROLES.CLIENTE,
    avatar: null,
    clientId: 'cli_002',
  },
};

// ────────────────────────────────────────────────────────
// Context
// ────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login mockado (será substituído por supabase.auth.signInWithPassword)
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    // Simula delay de rede
    await new Promise((r) => setTimeout(r, 600));

    // Para dev: aceita qualquer senha, identifica por email
    const found = Object.values(MOCK_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (found) {
      setUser(found);
      setIsLoading(false);
      return { success: true, user: found };
    }

    setIsLoading(false);
    return { success: false, error: 'Credenciais inválidas' };
  }, []);

  // Login rápido para desenvolvimento (Dev Mode)
  const loginAs = useCallback((roleKey) => {
    const mockUser = MOCK_USERS[roleKey];
    if (mockUser) {
      setUser(mockUser);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    // Futuro: supabase.auth.signOut()
  }, []);

  // Helpers de permissão
  const hasRole = useCallback((role) => user?.role === role, [user]);
  const canAccess = useCallback(
    (route) => {
      if (!user) return false;
      const perms = ROLE_PERMISSIONS[user.role];
      return perms?.allowedRoutes.includes(route) ?? false;
    },
    [user]
  );

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginAs,
    logout,
    hasRole,
    canAccess,
    permissions: user ? ROLE_PERMISSIONS[user.role] : null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

export default AuthContext;
