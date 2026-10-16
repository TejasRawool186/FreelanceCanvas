import React, { useState } from 'react';
import { Lock, Mail, User, Briefcase, DollarSign, ArrowRight, ArrowLeft, Code, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onRegisterSuccess: (profileData: {
    fullName: string;
    title: string;
    hourlyRate: number;
    email: string;
    skills: string;
    bio: string;
  }) => void;
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateLogin,
  onNavigateHome
}) => {
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(140);
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please provide your full name, work email, and password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      onRegisterSuccess({
        fullName,
        title: title || 'Senior Autonomous Consultant',
        hourlyRate: Number(hourlyRate) || 140,
        email,
        skills: skills || 'Python, FastAPI, TypeScript, React, Docker, Qdrant, Ollama',
        bio: bio || 'Specialized in autonomous AI agents and scalable backend engineering.'
      });
    }, 450);
  };

  return (
    <div className="bg-canvas-dots font-fredoka" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px 24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Sticky Notes on Canvas */}
      <div className="sticky-note anim-float" style={{
        position: 'absolute',
        top: '40px',
        right: '8%',
        backgroundColor: '#FED7AA',
        padding: '14px 20px',
        width: '160px',
        '--rot': '3deg',
        transform: 'rotate(3deg)',
        zIndex: 10
      } as React.CSSProperties}>
        <div className="scotch-tape" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#9A3412' }}>
          💡 Vector Profile
        </span>
      </div>

      <div className="sticky-note anim-float-delayed" style={{
        position: 'absolute',
        bottom: '40px',
        left: '8%',
        backgroundColor: '#BAE6FD',
        padding: '14px 20px',
        width: '170px',
        '--rot': '-3deg',
        transform: 'rotate(-3deg)',
        zIndex: 10
      } as React.CSSProperties}>
        <div className="scotch-tape" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0369A1' }}>
          🎯 High-Rate Bidding
        </span>
      </div>

      {/* Back button */}
      <button
        id="register-back-home-btn"
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

      {/* Main Registration Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '2px solid #000000',
        padding: '40px 36px',
        boxShadow: '5px 5px 0px #000000',
        zIndex: 20
      }}>
        {/* Scotch Tape on top of card */}
        <div className="scotch-tape" style={{ width: '80px', height: '24px', top: '-14px' }} />

        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
            Set Up Your Desk
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
            Configure your consultant bio and rates for autonomous RFPs
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
          {/* Row 1: Full Name & Title */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Full Name *
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
                <User size={16} color="#64748B" />
                <input
                  id="register-name-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  style={{
                    width: '100%',
                    padding: '10px 8px',
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
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Professional Title
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
                <Briefcase size={16} color="#64748B" />
                <input
                  id="register-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Lead AI Architect"
                  style={{
                    width: '100%',
                    padding: '10px 8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#0F172A',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Email & Hourly Rate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Work Email *
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
                  id="register-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@freelancecanvas.dev"
                  style={{
                    width: '100%',
                    padding: '10px 8px',
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
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Target Rate ($/hr)
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
                <DollarSign size={16} color="#166534" />
                <input
                  id="register-rate-input"
                  type="number"
                  min="20"
                  max="1000"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#0F172A',
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Passwords */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Password *
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
                <Lock size={16} color="#64748B" />
                <input
                  id="register-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 8px',
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

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Confirm Password *
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
                <Lock size={16} color="#64748B" />
                <input
                  id="register-confirm-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#0F172A',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Skills for RAG */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Core Skills & Tech Stack (Indexed in Qdrant)
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
              <Code size={16} color="#64748B" />
              <input
                id="register-skills-input"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, FastAPI, React, Qdrant, Ollama, Docker, LLM Fine-tuning"
                style={{
                  width: '100%',
                  padding: '10px 8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#0F172A',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-collab-primary"
            style={{ width: '100%', padding: '12px 0', marginTop: '10px' }}
          >
            <span>{loading ? 'Initializing Agent Vault...' : 'Launch Consultant Desk'}</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </form>

        {/* Footer Navigation */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
          Already have an account?{' '}
          <button
            id="register-login-link"
            onClick={onNavigateLogin}
            style={{ color: '#0099FF', fontWeight: 800, cursor: 'pointer', border: 'none', background: 'none' }}
          >
            Sign in here →
          </button>
        </div>
      </div>
    </div>
  );
};
