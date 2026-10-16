import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle2, KeyRound, Sparkles } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your work email and password.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid work email address.');
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
    onLoginSuccess('consultant@freelancecanvas.dev');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) return;
    setForgotStatus('sending');
    setTimeout(() => {
      setForgotStatus('sent');
    }, 600);
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
        width: '170px',
        '--rot': '-4deg',
        transform: 'rotate(-4deg)',
        zIndex: 10
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
        width: '180px',
        '--rot': '3deg',
        transform: 'rotate(3deg)',
        zIndex: 10
      } as React.CSSProperties}>
        <div className="scotch-tape" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#854D0E' }}>
          🔒 Local Privacy & RAG
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
          color: '#000000',
          fontSize: '14px',
          fontWeight: 700,
          border: '2px solid #000000',
          backgroundColor: '#FFFFFF',
          padding: '8px 16px',
          borderRadius: '8px',
          boxShadow: '2px 2px 0px #000000',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Back to FreelanceCanvas
      </button>

      {/* Main Login Card with Scotch Tape & Neo-Brutal Border */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '2px solid #000000',
        padding: '40px 36px',
        boxShadow: '5px 5px 0px #000000',
        zIndex: 20
      }}>
        {/* Scotch Tape on top of card */}
        <div className="scotch-tape" style={{ width: '70px', height: '24px', top: '-14px' }} />

        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '2px 2px 0px #000000'
          }}>
            <span className="font-chewy" style={{ fontSize: '24px', color: '#000000', lineHeight: 1 }}>FC</span>
          </div>
          <h1 className="font-chewy" style={{ fontSize: '36px', fontWeight: 400, color: '#000000', margin: 0, letterSpacing: '0.02em' }}>
            Welcome Back!
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
            Log in to your visual freelance workspace
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '2px solid #EF4444',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#B91C1C',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Work Email
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: '10px',
              padding: '0 12px',
              boxShadow: '2px 2px 0px #000000'
            }}>
              <Mail size={16} color="#64748B" />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotStatus('idle');
                  setIsForgotModalOpen(true);
                }}
                style={{ fontSize: '12px', color: '#0099FF', fontWeight: 700, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: '10px',
              padding: '0 12px',
              boxShadow: '2px 2px 0px #000000'
            }}>
              <Lock size={16} color="#64748B" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: '#64748B', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: '#0099FF' }}
              />
              Remember workspace session
            </label>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-collab-primary"
            style={{ width: '100%', padding: '12px 0', marginTop: '8px' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </form>

        {/* 1-Click Fast Track Demo Login */}
        <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1.5px dashed #CBD5E1' }}>
          <button
            id="login-demo-btn"
            onClick={handleDemoLogin}
            style={{
              width: '100%',
              backgroundColor: '#DCFCE7',
              color: '#166534',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '2px 2px 0px #000000',
              cursor: 'pointer'
            }}
          >
            <span>⚡ Instant Demo Access (Pre-loaded RAG)</span>
          </button>
        </div>

        {/* Footer Navigation */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
          Don't have an account yet?{' '}
          <button
            id="login-register-link"
            onClick={onNavigateRegister}
            style={{ color: '#0099FF', fontWeight: 800, cursor: 'pointer', border: 'none', background: 'none' }}
          >
            Start for free →
          </button>
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      {isForgotModalOpen && (
        <div className="modal-backdrop-blur" style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: '16px',
            boxShadow: '5px 5px 0px #000000',
            width: '100%',
            maxWidth: '420px',
            padding: '32px',
            position: 'relative'
          }}>
            <div className="scotch-tape" />
            <h3 className="font-chewy" style={{ fontSize: '26px', color: '#0F172A', marginBottom: '8px' }}>
              Reset Your Password
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px', lineHeight: 1.5 }}>
              Enter your consultant email address and we'll send a secure password reset link.
            </p>

            {forgotStatus === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={42} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#065F46' }}>Check Your Inbox!</h4>
                <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                  A reset link has been dispatched to <strong>{forgotEmail}</strong>.
                </p>
                <button
                  onClick={() => setIsForgotModalOpen(false)}
                  className="btn-collab-primary"
                  style={{ marginTop: '20px', width: '100%' }}
                >
                  Return to Log In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Work Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="consultant@domain.com"
                    className="input-collab"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="btn-collab-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotStatus === 'sending'}
                    className="btn-collab-primary"
                    style={{ flex: 1 }}
                  >
                    {forgotStatus === 'sending' ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
