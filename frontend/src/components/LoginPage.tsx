import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateRegister,
  onNavigateHome
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email address and password.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(email);
    }, 400);
  };

  const handleDemoLogin = () => {
    onLoginSuccess('consultant@autonomiq.dev');
  };

  return (
    <div className="bg-canvas-dots font-fredoka" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Floating Sticky Notes */}
      <div className="sticky-note anim-float" style={{
        position: 'absolute',
        top: '60px',
        left: '8%',
        backgroundColor: '#BBF7D0',
        padding: '16px 20px',
        width: '160px',
        '--rot': '-4deg',
        transform: 'rotate(-4deg)'
      } as React.CSSProperties}>
        <div className="scotch-tape" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>
          ✨ Instant Access
        </span>
      </div>

      <div className="sticky-note anim-float-delayed" style={{
        position: 'absolute',
        bottom: '80px',
        right: '8%',
        backgroundColor: '#FEF08A',
        padding: '16px 20px',
        width: '170px',
        '--rot': '3deg',
        transform: 'rotate(3deg)'
      } as React.CSSProperties}>
        <div className="scotch-tape" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#854D0E' }}>
          🔒 Local Privacy
        </span>
      </div>

      {/* Back button */}
      <button
        id="login-back-home-btn"
        onClick={onNavigateHome}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#475569',
          fontSize: '14px',
          fontWeight: 700,
          border: 'none',
          backgroundColor: '#FFFFFF',
          padding: '8px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
      >
        <ArrowLeft size={16} /> Back to Canvas
      </button>

      {/* Main Login Card with Scotch Tape */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '2px solid #E2E8F0',
        padding: '40px 36px',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.1)',
        zIndex: 20
      }}>
        {/* Scotch Tape on top of card */}
        <div className="scotch-tape" style={{ width: '70px', height: '24px', top: '-14px' }} />

        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: '#0F172A',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <span className="font-chewy" style={{ fontSize: '28px', color: '#FFFFFF', lineHeight: 1 }}>C</span>
          </div>
          <h1 className="font-chewy" style={{ fontSize: '36px', fontWeight: 400, color: '#0F172A', margin: 0 }}>
            Welcome Back!
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
            Log in to your visual freelance workspace
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#B91C1C',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Work Email
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '2px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0 12px'
            }}>
              <Mail size={16} color="#94A3B8" />
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="consultant@domain.com"
                style={{
                  width: '100%',
                  padding: '12px 10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#0F172A',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '2px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0 12px'
            }}>
              <Lock size={16} color="#94A3B8" />
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '12px 10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#0F172A',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: '#00A3FF' }}
              />
              Remember workspace session
            </label>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '13px',
              borderRadius: '10px',
              backgroundColor: '#00A3FF',
              color: '#000000',
              fontWeight: 800,
              fontSize: '15px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 163, 255, 0.3)',
              marginTop: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'transform 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span>{loading ? 'Authenticating...' : 'LOG IN TO DESK'}</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0 16px 0', position: 'relative' }}>
          <div style={{ borderTop: '1px solid #E2E8F0', position: 'absolute', top: '50%', width: '100%' }} />
          <span style={{ backgroundColor: '#FFFFFF', position: 'relative', padding: '0 12px', fontSize: '12px', color: '#94A3B8', fontWeight: 700 }}>
            OR INSTANT DEMO
          </span>
        </div>

        <button
          id="login-guest-btn"
          onClick={handleDemoLogin}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: '#F1F5F9',
            border: '2px solid #E2E8F0',
            color: '#0F172A',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Continue as Solo Consultant Demo
        </button>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
          Don't have a profile yet?{' '}
          <button
            id="login-to-register-link"
            onClick={onNavigateRegister}
            style={{ color: '#00A3FF', fontWeight: 700, textDecoration: 'underline' }}
          >
            Create Profile
          </button>
        </div>
      </div>
    </div>
  );
};
