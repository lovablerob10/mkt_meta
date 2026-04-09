import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute — o guarda-costas das rotas.
 *
 * Props:
 *   - children:        O conteúdo da rota
 *   - allowedRoles:    Array de roles permitidas (ex: ['MASTER', 'GESTOR'])
 *   - redirectTo:      Para onde redirecionar se não autorizado (default: baseado no role)
 *
 * Comportamento:
 *   1. Não logado → redireciona para /login
 *   2. Logado mas sem permissão → redireciona para a home correta do role
 *   3. Logado e autorizado → renderiza normalmente
 */
export default function ProtectedRoute({ children, allowedRoles, redirectTo }) {
  const { user, isAuthenticated } = useAuth();

  // 1. Não logado → Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Se allowedRoles definido, checar permissão
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Cliente sempre cai no /client
    const fallback = redirectTo || (user.role === 'CLIENTE' ? '/client' : '/');
    return <Navigate to={fallback} replace />;
  }

  // 3. Autorizado
  return children;
}
