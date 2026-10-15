import React, { useState } from 'react';
import { Lock, Mail, User, Briefcase, DollarSign, ArrowRight, ArrowLeft, Code } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please provide your full name, email, and password.');
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
        transform: 'rotate(3deg)'
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
        width: '160px',
        '--rot': '-3deg',
        transform: 'rotate(-3deg)'
      } as React.CSSProperties}>
        <div className="scotch-tape" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0369A1' }}>
          🎯 RFP Matching
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

      {/* Main Registration Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '2px solid #E2E8F0',
        padding: '40px 36px',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.1)',
        zIndex: 20
      }}>
        {/* Scotch Tape on top */}
        <div className="scotch-tape" style={{ width: '80px', height: '24px', top: '-14px' }} />

        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: '#0F172A',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <span className="font-chewy" style={{ fontSize: '28px', color: '#FFFFFF', lineHeight: 1 }}>C</span>
          </div>
          <h1 className="font-chewy" style={{ fontSize: '36px', fontWeight: 400, color: '#0F172A', margin: 0 }}>
            Create Consultant Profile
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
            Set up your persistent profile, rates, and skills for autonomous RFP matching
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                border: '2px solid #E2E8F0',
                borderRadius: '10px',
                padding: '0 12px'
              }}>
                <User size={16} color="#94A3B8" />
                <input
                  id="register-fullname-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  style={{
                    width: '100%',
                    padding: '10px 8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#0F172A',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Hourly Rate ($/hr)
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                border: '2px solid #E2E8F0',
                borderRadius: '10px',
                padding: '0 12px'
              }}>
                <DollarSign size={16} color="#94A3B8" />
                <input
                  id="register-rate-input"
                  type="number"
                  required
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  placeholder="140"
                  style={{
                    width: '100%',
                    padding: '10px 8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#0F172A',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Professional Title / Specialty
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '2px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0 12px'
            }}>
              <Briefcase size={16} color="#94A3B8" />
              <input
                id="register-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Full-Stack AI Engineer & Cloud Architect"
                style={{
                  width: '100%',
                  padding: '10px 8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#0F172A',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

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
                id="register-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@mercer.dev"
                style={{
                  width: '100%',
                  padding: '10px 8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#0F172A',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Primary Technical Skills (Comma-separated)
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '2px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0 12px'
            }}>
              <Code size={16} color="#94A3B8" />
              <input
                id="register-skills-input"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, FastAPI, TypeScript, React, Docker, Qdrant, Ollama"
                style={{
                  width: '100%',
                  padding: '10px 8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#0F172A',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
                  id="register-password-input"
                  type="password"
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
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Confirm Password
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
                  id="register-confirm-password-input"
                  type="password"
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
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>

          <button
            id="register-submit-btn"
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
              marginTop: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'transform 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span>{loading ? 'Initializing Profile...' : 'COMPLETE PROFILE & OPEN DESK'}</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
          Already have an account?{' '}
          <button
            id="register-to-login-link"
            onClick={onNavigateLogin}
            style={{ color: '#00A3FF', fontWeight: 700, textDecoration: 'underline' }}
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
};
