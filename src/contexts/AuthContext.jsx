import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ────────────────────────────────────────────────────────
// RBAC Roles — conforme SPEC.md §3
// ────────────────────────────────────────────────────────
export const ROLES = {
  MASTER: 'MASTER',
  GESTOR: 'GESTOR',
  CLIENTE: 'CLIENTE',
};

// ────────────────────────────────────────────────────────
// Permissões por role
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
// Mock Users — fallback quando Supabase não está conectado
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

// Detecta se Supabase está configurado
const SUPABASE_CONFIGURED = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('undefined')
);

// ────────────────────────────────────────────────────────
// Context
// ────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar perfil do Supabase
  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !profile) {
        console.warn('[ZMKT] Perfil não encontrado para', authUser.email);
        setUser(null);
        return;
      }

      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar_url,
        clientId: profile.client_id,
        phone: profile.phone,
      });
    } catch (err) {
      console.error('[ZMKT] Erro ao carregar perfil:', err);
      setUser(null);
    }
  }, []);

  // Inicialização: verificar sessão ativa
  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      setIsLoading(false);
      return;
    }

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user);
      }
      setIsLoading(false);
    });

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // Login real via Supabase
  const login = useCallback(async (email, password) => {
    setIsLoading(true);

    if (!SUPABASE_CONFIGURED) {
      // Fallback: mock login
      await new Promise((r) => setTimeout(r, 600));
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
    }

    // Login real
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      // Carregar perfil ANTES de retornar sucesso (evita race condition)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        console.error('[ZMKT] Perfil não encontrado após login:', profileError);
        setIsLoading(false);
        return { success: false, error: 'Perfil não encontrado. Contate o administrador.' };
      }

      const userProfile = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar_url,
        clientId: profile.client_id,
        phone: profile.phone,
      };

      setUser(userProfile);
      setIsLoading(false);
      return { success: true, user: userProfile };
    } catch (err) {
      console.error('[ZMKT] Erro no login:', err);
      setIsLoading(false);
      return { success: false, error: 'Erro ao conectar. Tente novamente.' };
    }
  }, []);

  // Login rápido para desenvolvimento (Dev Mode)
  const loginAs = useCallback((roleKey) => {
    const mockUser = MOCK_USERS[roleKey];
    if (mockUser) {
      setUser(mockUser);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    if (SUPABASE_CONFIGURED) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }, []);

  // Helpers
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
    isSupabaseConnected: SUPABASE_CONFIGURED,
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
