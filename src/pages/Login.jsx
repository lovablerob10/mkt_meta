import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES, ROLE_PERMISSIONS } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff, Zap, Shield, Users, BarChart3 } from 'lucide-react';

export default function Login() {
  const { login, loginAs, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate(result.user.role === ROLES.CLIENTE ? '/client' : '/');
    } else {
      setError(result.error);
    }
  };

  const handleDevLogin = (roleKey) => {
    loginAs(roleKey);
    const destinations = { master: '/', gestor: '/', cliente: '/client' };
    navigate(destinations[roleKey]);
  };

  const DEV_ROLES = [
    { key: 'master', icon: Shield, label: 'Master', desc: 'Acesso total', color: '#FF7A2E' },
    { key: 'gestor', icon: Users, label: 'Gestor', desc: 'Campanhas & Clientes', color: '#3B6BB5' },
    { key: 'cliente', icon: BarChart3, label: 'Cliente', desc: 'Dashboard isolado', color: '#10b981' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #05080f 0%, #0a1220 40%, #0f1a2e 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Glow Effects */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,122,46,0.08) 0%, transparent 70%)',
        top: '-200px',
        right: '-100px',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,107,181,0.06) 0%, transparent 70%)',
        bottom: '-100px',
        left: '-100px',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        animation: 'chat-slide-up 0.5s ease-out',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '48px',
            fontWeight: 900,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-2px',
            color: '#fff',
            marginBottom: '8px',
          }}>
            Z<span style={{ color: '#FF7A2E' }}>/</span>MKT
          </div>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}>
            Assessoria de Marketing Digital
          </div>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#f1f5f9',
            marginBottom: '4px',
          }}>
            Bem-vindo de volta
          </h2>
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '28px',
          }}>
            Acesse sua conta para gerenciar campanhas e resultados.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255,122,46,0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255,122,46,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255,122,46,0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255,122,46,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '10px',
                color: '#fca5a5',
                fontSize: '13px',
                marginBottom: '20px',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #FF7A2E 0%, #FF5722 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                opacity: (!email || isLoading) ? 0.6 : 1,
                boxShadow: '0 4px 15px rgba(255,122,46,0.3)',
              }}
            >
              <LogIn size={18} />
              {isLoading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* ──────── DEV MODE PANEL ──────── */}
        <div style={{
          marginTop: '24px',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px dashed rgba(255,122,46,0.25)',
          borderRadius: '16px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}>
            <Zap size={14} style={{ color: '#FF7A2E' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#FF7A2E',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Dev Mode — Acesso Rápido
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {DEV_ROLES.map(({ key, icon: Icon, label, desc, color }) => (
              <button
                key={key}
                onClick={() => handleDevLogin(key)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${color}30`,
                  borderRadius: '12px',
                  padding: '16px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${color}15`;
                  e.currentTarget.style.borderColor = `${color}60`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = `${color}30`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{label}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.2)',
        }}>
          © 2026 Z/MKT Assessoria · Todos os direitos reservados
        </div>
      </div>
    </div>
  );
}
