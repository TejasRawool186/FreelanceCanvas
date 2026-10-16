import React, { useState } from 'react';
import { 
  ArrowRight, 
  Home, 
  LayoutGrid, 
  FileCode, 
  Users, 
  Tag, 
  Mail, 
  Plus, 
  MousePointer, 
  Square, 
  Type, 
  StickyNote, 
  MoveUpRight, 
  MoreHorizontal, 
  Star, 
  CheckCircle2, 
  Share2, 
  CheckSquare, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  Monitor, 
  MessageSquare, 
  Presentation, 
  FolderKanban, 
  Compass, 
  Lightbulb, 
  Search, 
  Check, 
  Heart,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onLaunchWorkspace: () => void;
  isLoggedIn: boolean;
  freelancerName?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  onLaunchWorkspace,
  isLoggedIn,
  freelancerName
}) => {
  const [activeNav, setActiveNav] = useState('home');
  const [activeCanvasTool, setActiveCanvasTool] = useState('select');
  const [activeTemplateTab, setActiveTemplateTab] = useState('all');
  const [activePreviewTab, setActivePreviewTab] = useState<'templates' | 'comments' | 'tasks'>('templates');
  const [notes, setNotes] = useState([
    { id: '1', title: 'Improve onboarding', bg: '#BBF7D0', textDark: '#166534', x: 40, y: 50 },
    { id: '2', title: 'AI-powered search', bg: '#FEF08A', textDark: '#854D0E', x: 230, y: 35 },
    { id: '3', title: 'Team analytics', bg: '#BAE6FD', textDark: '#0369A1', x: 290, y: 155 }
  ]);

  return (
    <div className="font-fredoka" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#0F172A', overflowX: 'hidden' }}>
      
      {/* ============================================================
          SECTION 1: TOP NAVIGATION BAR (Exact Reference Styling)
         ============================================================ */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '2px solid #000000',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
        boxShadow: '0 2px 0px rgba(0,0,0,0.04)'
      }}>
        {/* Brand Logo */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 2px 0px #000000'
          }}>
            <span className="font-chewy" style={{ fontSize: '20px', color: '#000000', lineHeight: 1 }}>FC</span>
          </div>
          <span className="font-chewy" style={{ fontSize: '26px', letterSpacing: '0.02em', color: '#000000' }}>
            FreelanceCanvas
          </span>
        </div>

        {/* Center Nav Tabs */}
        <nav className="desktop-nav" style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: '2px solid #000000',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '2px 2px 0px #000000'
        }}>
          {[
            { id: 'home', label: 'HOME', icon: Home, href: '#' },
            { id: 'features', label: 'FEATURES', icon: LayoutGrid, href: '#features' },
            { id: 'templates', label: 'TEMPLATES', icon: FileCode, href: '#templates' },
            { id: 'usecases', label: 'USE CASES', icon: Users, href: '#how-it-works' },
            { id: 'pricing', label: 'PRICING', icon: Tag, href: '#preview' },
            { id: 'contact', label: 'CONTACT', icon: Mail, href: '#cta' }
          ].map((tab, idx, arr) => {
            const Icon = tab.icon;
            const active = activeNav === tab.id;
            return (
              <a
                key={tab.id}
                href={tab.href}
                onClick={() => setActiveNav(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  backgroundColor: active ? '#0099FF' : '#FFFFFF',
                  color: '#000000',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                  borderRight: idx < arr.length - 1 ? '1.5px solid #000000' : 'none',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Icon size={15} strokeWidth={2.5} />
                <span>{tab.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Right Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isLoggedIn ? (
            <button
              id="landing-workspace-btn"
              onClick={onLaunchWorkspace}
              className="btn-collab-primary"
            >
              <span>Open Desk ({freelancerName || 'Consultant'})</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          ) : (
            <>
              <button
                id="landing-login-btn"
                onClick={onNavigateLogin}
                style={{
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.04em',
                  padding: '8px 14px',
                  cursor: 'pointer'
                }}
              >
                LOG IN
              </button>

              <button
                id="landing-signup-btn"
                onClick={onNavigateRegister}
                className="btn-collab-primary"
              >
                <span>START FOR FREE</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* ============================================================
          SECTION 1.1: HERO VIEWPORT (Identical to Visual Collaborat Reference)
         ============================================================ */}
      <section style={{
        position: 'relative',
        minHeight: '84vh',
        backgroundColor: '#FFFFFF',
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px 80px 24px',
        overflow: 'hidden'
      }}>
        {/* Floating Left Vertical Toolbar */}
        <div className="floating-canvas-toolbar" style={{
          position: 'absolute',
          left: '40px',
          top: '32%',
          transform: 'translateY(-50%)',
          zIndex: 15
        }}>
          <button 
            className={activeCanvasTool === 'select' ? 'active' : ''}
            onClick={() => setActiveCanvasTool('select')}
            title="Selection pointer"
          >
            <MousePointer size={18} strokeWidth={2.5} />
          </button>
          <button 
            className={activeCanvasTool === 'square' ? 'active' : ''}
            onClick={() => setActiveCanvasTool('square')}
            title="Rectangle"
          >
            <Square size={18} strokeWidth={2.5} />
          </button>
          <button 
            className={activeCanvasTool === 'text' ? 'active' : ''}
            onClick={() => setActiveCanvasTool('text')}
            title="Text block"
          >
            <Type size={18} strokeWidth={2.5} />
          </button>
          <button 
            className={activeCanvasTool === 'note' ? 'active' : ''}
            onClick={() => setActiveCanvasTool('note')}
            title="Sticky Note"
          >
            <StickyNote size={18} strokeWidth={2.5} />
          </button>
          <button 
            className={activeCanvasTool === 'arrow' ? 'active' : ''}
            onClick={() => setActiveCanvasTool('arrow')}
            title="Connector Arrow"
          >
            <MoveUpRight size={18} strokeWidth={2.5} />
          </button>
          <button 
            className={activeCanvasTool === 'more' ? 'active' : ''}
            onClick={() => setActiveCanvasTool('more')}
            title="More tools"
          >
            <MoreHorizontal size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Floating Sticky Note: Mint Green (Real-time collaboration) */}
        <div className="sticky-note anim-float" style={{
          position: 'absolute',
          top: '12%',
          left: '12%',
          backgroundColor: '#BBF7D0',
          padding: '16px 20px',
          borderRadius: '4px',
          width: '180px',
          '--rot': '-3deg',
          transform: 'rotate(-3deg)',
          zIndex: 12
        } as React.CSSProperties}>
          <div className="scotch-tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#166534" strokeWidth={2.5} />
            <span className="font-fredoka" style={{ fontSize: '14px', fontWeight: 700, color: '#166534', lineHeight: 1.2 }}>
              Real-time collaboration
            </span>
          </div>
          {/* Blue Live Cursor Pointer pointing at this note */}
          <div style={{
            position: 'absolute',
            bottom: '-18px',
            right: '-16px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#0099FF" stroke="#000000" strokeWidth="2">
              <polygon points="3 3 10 21 14 14 21 10 3 3" />
            </svg>
          </div>
        </div>

        {/* Hand-drawn Arrow: Mint Note -> Canvas */}
        <div style={{ position: 'absolute', top: '27%', left: '17%', zIndex: 10, pointerEvents: 'none' }}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round">
            <path d="M10 10 Q 25 35 45 45" />
            <polyline points="35 45 45 45 45 35" />
          </svg>
        </div>

        {/* Floating Sticky Note: Pastel Yellow (Infinite boards) */}
        <div className="sticky-note anim-float-slow" style={{
          position: 'absolute',
          bottom: '12%',
          left: '10%',
          backgroundColor: '#FEF08A',
          padding: '16px 22px',
          borderRadius: '4px',
          width: '160px',
          '--rot': '2deg',
          transform: 'rotate(2deg)',
          zIndex: 12
        } as React.CSSProperties}>
          <div className="scotch-tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#854D0E', lineHeight: 1 }}>∞</span>
            <span className="font-fredoka" style={{ fontSize: '14px', fontWeight: 700, color: '#854D0E', lineHeight: 1.2 }}>
              Infinite boards
            </span>
          </div>
        </div>

        {/* Floating Sticky Note: Soft Peach (Templates) */}
        <div className="sticky-note anim-float-delayed" style={{
          position: 'absolute',
          top: '14%',
          right: '12%',
          backgroundColor: '#FED7AA',
          padding: '16px 22px',
          borderRadius: '4px',
          width: '170px',
          '--rot': '3deg',
          transform: 'rotate(3deg)',
          zIndex: 12
        } as React.CSSProperties}>
          <div className="scotch-tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutGrid size={18} color="#9A3412" strokeWidth={2.5} />
            <span className="font-fredoka" style={{ fontSize: '14px', fontWeight: 700, color: '#9A3412', lineHeight: 1.2 }}>
              Templates
            </span>
          </div>
        </div>

        {/* Hand-drawn Arrow: Right top down */}
        <div style={{ position: 'absolute', top: '28%', right: '15%', zIndex: 10, pointerEvents: 'none' }}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round">
            <path d="M45 10 Q 55 35 30 50" />
            <polyline points="40 50 30 50 32 40" />
          </svg>
        </div>

        {/* Floating Sticky Note: Sky Blue (Built for teams) */}
        <div className="sticky-note anim-float" style={{
          position: 'absolute',
          top: '48%',
          right: '10%',
          backgroundColor: '#BAE6FD',
          padding: '16px 20px',
          borderRadius: '4px',
          width: '165px',
          '--rot': '-2deg',
          transform: 'rotate(-2deg)',
          zIndex: 12
        } as React.CSSProperties}>
          <div className="scotch-tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#0369A1" strokeWidth={2.5} />
            <span className="font-fredoka" style={{ fontSize: '14px', fontWeight: 700, color: '#0369A1', lineHeight: 1.2 }}>
              Built for teams
            </span>
          </div>
        </div>

        {/* Floating Sticky Note: Pastel Pink (Present ideas visually) */}
        <div className="sticky-note anim-float-delayed" style={{
          position: 'absolute',
          bottom: '10%',
          right: '14%',
          backgroundColor: '#FBCFE8',
          padding: '16px 20px',
          borderRadius: '4px',
          width: '185px',
          '--rot': '4deg',
          transform: 'rotate(4deg)',
          zIndex: 12
        } as React.CSSProperties}>
          <div className="scotch-tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Presentation size={18} color="#9D174D" strokeWidth={2.5} />
            <span className="font-fredoka" style={{ fontSize: '14px', fontWeight: 700, color: '#9D174D', lineHeight: 1.2 }}>
              Present ideas visually
            </span>
          </div>
        </div>

        {/* Central Hero Content */}
        <div style={{ textAlign: 'center', maxWidth: '820px', position: 'relative', zIndex: 14 }}>
          {/* Tagline with hand-drawn blue underline */}
          <div style={{ display: 'inline-block', marginBottom: '8px' }}>
            <span className="font-fredoka" style={{
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0F172A'
            }}>
              VISUAL FREELANCE COLLABORATION TOOL
            </span>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#0099FF', borderRadius: '4px', marginTop: '4px' }} />
          </div>

          {/* Huge Bubbly Title: FREELANCE CANVAS */}
          <h1 className="font-chewy" style={{
            fontSize: 'clamp(52px, 8.5vw, 92px)',
            lineHeight: 0.95,
            color: '#000000',
            letterSpacing: '0.03em',
            margin: '12px 0 20px 0',
            userSelect: 'none'
          }}>
            FREELANCE CANVAS
          </h1>

          {/* Subtitle with underlined 'flexible' */}
          <p className="font-fredoka" style={{
            fontSize: 'clamp(20px, 3vw, 26px)',
            fontWeight: 500,
            color: '#0F172A',
            maxWidth: '680px',
            margin: '0 auto 36px auto',
            lineHeight: 1.35
          }}>
            Brainstorm, design, and organize ideas in one{' '}
            <span className="hand-underline" style={{ fontWeight: 700 }}>flexible</span> workspace.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <button
              id="hero-start-free-btn"
              onClick={isLoggedIn ? onLaunchWorkspace : onNavigateRegister}
              className="btn-collab-primary"
              style={{ fontSize: '15px', padding: '14px 32px' }}
            >
              <span>START FOR FREE</span>
              <ArrowRight size={18} strokeWidth={3} />
            </button>

            <a
              id="hero-view-templates-btn"
              href="#templates"
              className="btn-collab-secondary"
              style={{ fontSize: '15px', padding: '14px 28px', textDecoration: 'none' }}
            >
              <span>VIEW TEMPLATES</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: FEATURES ON DARK BLUEPRINT GRID
         ============================================================ */}
      <section id="features" style={{
        backgroundColor: '#070D1E',
        backgroundImage: `
          linear-gradient(to right, rgba(0, 153, 255, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 153, 255, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
        padding: '100px 24px',
        color: '#FFFFFF',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 60px auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#0099FF',
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '0.1em',
              marginBottom: '16px'
            }}>
              <span>▰</span>
              <span>FEATURES</span>
              <span>▰</span>
            </div>

            <h2 className="font-chewy" style={{
              fontSize: 'clamp(36px, 5vw, 54px)',
              lineHeight: 1.1,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              marginBottom: '18px'
            }}>
              Everything you need to turn ideas into action.
            </h2>

            <p className="font-fredoka" style={{
              fontSize: '18px',
              color: '#94A3B8',
              lineHeight: 1.5
            }}>
              Brainstorm freely, collaborate in real time, use powerful templates, and present your work with{' '}
              <span className="hand-underline" style={{ color: '#FFFFFF', fontWeight: 600 }}>clarity and impact</span>.
            </p>
          </div>

          {/* 6 Feature Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {/* Card 1: Infinite whiteboards */}
            <div className="card-whiteboard" style={{ padding: '28px', color: '#0F172A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#E0F2FE',
                  border: '1.5px solid #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284C7',
                  fontSize: '22px',
                  fontWeight: 900
                }}>
                  ∞
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Infinite whiteboards</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
                Start with a blank canvas and take your ideas anywhere. No limits, no boundaries.
              </p>
              {/* Mini Whiteboard Mockup */}
              <div style={{
                height: '140px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                position: 'relative',
                overflow: 'hidden',
                padding: '12px'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  display: 'flex',
                  gap: '4px',
                  backgroundColor: '#FFF',
                  padding: '4px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1'
                }}>
                  <div style={{ width: '18px', height: '18px', backgroundColor: '#0099FF', borderRadius: '4px' }} />
                  <div style={{ width: '18px', height: '18px', border: '1px solid #94A3B8', borderRadius: '4px' }} />
                </div>
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  left: '60px',
                  width: '120px',
                  height: '60px',
                  border: '2px solid #0F172A',
                  borderRadius: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  Idea Cluster
                </div>
              </div>
            </div>

            {/* Card 2: Real-time collaboration */}
            <div className="card-whiteboard" style={{ padding: '28px', color: '#0F172A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#DCFCE7',
                  border: '1.5px solid #BBF7D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#166534'
                }}>
                  <Users size={22} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Real-time collaboration</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
                Work together seamlessly with your team, wherever you are. Live cursors and instant sync.
              </p>
              {/* Mini Cursor Mockup */}
              <div style={{
                height: '140px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="anim-cursor-alex" style={{
                  position: 'absolute',
                  top: '30px',
                  left: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#10B981" stroke="#000" strokeWidth="1.5">
                    <polygon points="3 3 10 21 14 14 21 10 3 3" />
                  </svg>
                  <span style={{ backgroundColor: '#10B981', color: '#FFF', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                    Alex
                  </span>
                </div>
                <div className="anim-cursor-sam" style={{
                  position: 'absolute',
                  bottom: '30px',
                  right: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#8B5CF6" stroke="#000" strokeWidth="1.5">
                    <polygon points="3 3 10 21 14 14 21 10 3 3" />
                  </svg>
                  <span style={{ backgroundColor: '#8B5CF6', color: '#FFF', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                    Sam
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Ready-made templates */}
            <div className="card-whiteboard" style={{ padding: '28px', color: '#0F172A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#F3E8FF',
                  border: '1.5px solid #E9D5FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7E22CE'
                }}>
                  <LayoutGrid size={22} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Ready-made templates</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
                Jumpstart your projects with professionally designed templates for any use case.
              </p>
              {/* Mini Template Filter Buttons */}
              <div style={{
                height: '140px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ backgroundColor: '#0099FF', color: '#FFF', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>All</span>
                  <span style={{ backgroundColor: '#FFF', border: '1px solid #CBD5E1', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>Brainstorming</span>
                  <span style={{ backgroundColor: '#FFF', border: '1px solid #CBD5E1', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>Planning</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flex: 1 }}>
                  <div style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px' }}>
                    <div style={{ height: '6px', width: '60%', backgroundColor: '#0099FF', borderRadius: '3px' }} />
                  </div>
                  <div style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px' }}>
                    <div style={{ height: '6px', width: '80%', backgroundColor: '#10B981', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Present ideas beautifully */}
            <div className="card-whiteboard" style={{ padding: '28px', color: '#0F172A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FCE7F3',
                  border: '1.5px solid #FBCFE8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#BE185D'
                }}>
                  <Presentation size={22} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Present ideas beautifully</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
                Turn your boards into stunning presentations with one click. Clean, focused, and impactful.
              </p>
              {/* Mini Presentation Slide */}
              <div style={{
                height: '140px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '85%',
                  backgroundColor: '#FFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>Q1 Roadmap Overview</span>
                  <div style={{ height: '4px', width: '40px', backgroundColor: '#BE185D', borderRadius: '2px', margin: '6px 0 10px 0' }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '20px', height: '14px', backgroundColor: '#FCE7F3', borderRadius: '3px' }} />
                    <div style={{ width: '20px', height: '14px', backgroundColor: '#FEF08A', borderRadius: '3px' }} />
                    <div style={{ width: '20px', height: '14px', backgroundColor: '#BAE6FD', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: Comments and feedback */}
            <div className="card-whiteboard" style={{ padding: '28px', color: '#0F172A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#E0F2FE',
                  border: '1.5px solid #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0369A1'
                }}>
                  <MessageSquare size={22} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Comments and feedback</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
                Leave comments, mention teammates, and keep feedback in context right on the canvas.
              </p>
              {/* Mini Thread Preview */}
              <div style={{
                height: '140px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#F472B6', color: '#FFF', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>M</div>
                  <div style={{ fontSize: '12px', fontWeight: 700 }}>Great point!</div>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>2 min ago</span>
                </div>
                <div style={{
                  backgroundColor: '#E0F2FE',
                  border: '1px solid #BAE6FD',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#0369A1',
                  fontWeight: 600
                }}>
                  @Alex let's explore this further.
                </div>
              </div>
            </div>

            {/* Card 6: Organize notes and sections */}
            <div className="card-whiteboard" style={{ padding: '28px', color: '#0F172A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF08A',
                  border: '1.5px solid #FDE047',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#854D0E'
                }}>
                  <Layers size={22} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Organize notes and sections</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
                Keep everything structured with sections, frames, and color-coded sticky notes.
              </p>
              {/* Mini Structured Section Preview */}
              <div style={{
                height: '140px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                padding: '12px',
                position: 'relative'
              }}>
                <div style={{
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: '8px',
                  height: '100%',
                  padding: '8px'
                }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B' }}>Section: Ideation</span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <div style={{ width: '48px', height: '40px', backgroundColor: '#FEF08A', borderRadius: '4px', fontSize: '9px', padding: '4px', fontWeight: 700, color: '#854D0E' }}>Priority</div>
                    <div style={{ width: '56px', height: '40px', backgroundColor: '#BBF7D0', borderRadius: '4px', fontSize: '9px', padding: '4px', fontWeight: 700, color: '#166534' }}>Research notes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: PRODUCT PREVIEW / INTERACTIVE WORKSPACE DEMO
         ============================================================ */}
      <section id="preview" style={{
        backgroundColor: '#FFFFFF',
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        padding: '100px 24px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 50px auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#0099FF',
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '0.1em',
              marginBottom: '16px'
            }}>
              <span>\</span>
              <span>PRODUCT PREVIEW</span>
              <span>/</span>
            </div>

            <h2 className="font-chewy" style={{
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              lineHeight: 1.15,
              color: '#0F172A',
              letterSpacing: '0.02em',
              marginBottom: '18px'
            }}>
              Unleash your team's creativity with an infinite workspace
            </h2>
            <p className="font-fredoka" style={{ fontSize: '18px', color: '#64748B' }}>
              Designed for brainstorming, planning, and bringing ideas to life seamlessly.
            </p>
          </div>

          {/* Interactive Browser Frame */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: '16px',
            boxShadow: '6px 6px 0px #000000',
            overflow: 'hidden'
          }}>
            {/* Window Top Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: '2px solid #000000',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1.5px solid #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900
                }}>
                  C
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 700
                }}>
                  <span>Project Launch</span>
                  <span style={{ fontSize: '10px' }}>▼</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Avatars */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#86EFAC', border: '1.5px solid #FFF', marginLeft: '-6px' }} />
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#FDBA74', border: '1.5px solid #FFF', marginLeft: '-6px' }} />
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#93C5FD', border: '1.5px solid #FFF', marginLeft: '-6px' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, marginLeft: '6px', color: '#64748B' }}>+3</span>
                </div>

                <button style={{
                  backgroundColor: '#0099FF',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1.5px solid #000'
                }}>
                  Share
                </button>
              </div>
            </div>

            {/* Canvas Body Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 260px', minHeight: '520px' }}>
              
              {/* Left Nav in Frame */}
              <div style={{
                borderRight: '1.5px solid #E2E8F0',
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                backgroundColor: '#FAFAFA'
              }}>
                {[
                  { label: '# Canvas', active: true },
                  { label: '▦ Templates', active: false },
                  { label: '◫ Projects', active: false },
                  { label: '💬 Comments', active: false },
                  { label: '✓ Tasks', active: false },
                  { label: '▶ Present', active: false },
                  { label: '🗑 Trash', active: false }
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: item.active ? 800 : 500,
                      backgroundColor: item.active ? '#E0F2FE' : 'transparent',
                      color: item.active ? '#0369A1' : '#64748B',
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Center Canvas Area */}
              <div style={{
                position: 'relative',
                backgroundColor: '#FFFFFF',
                backgroundImage: 'linear-gradient(#F1F5F9 1px, transparent 1px), linear-gradient(90deg, #F1F5F9 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                padding: '30px',
                overflow: 'hidden'
              }}>
                {/* Hand-drawn Phase Titles */}
                <div style={{ position: 'absolute', top: '24px', left: '40px' }}>
                  <span className="font-chewy" style={{ fontSize: '20px', letterSpacing: '0.04em' }}>1. IDEAS</span>
                  <div style={{ width: '50px', height: '3px', backgroundColor: '#0099FF', borderRadius: '2px' }} />
                </div>

                <div style={{ position: 'absolute', top: '24px', left: '320px' }}>
                  <span className="font-chewy" style={{ fontSize: '20px', letterSpacing: '0.04em' }}>2. PLAN</span>
                  <div style={{ width: '45px', height: '3px', backgroundColor: '#0099FF', borderRadius: '2px' }} />
                </div>

                <div style={{ position: 'absolute', bottom: '60px', left: '40px' }}>
                  <span className="font-chewy" style={{ fontSize: '20px', letterSpacing: '0.04em' }}>3. NEXT STEPS</span>
                  <div style={{ width: '80px', height: '3px', backgroundColor: '#0099FF', borderRadius: '2px' }} />
                </div>

                <div style={{ position: 'absolute', bottom: '60px', left: '320px' }}>
                  <span className="font-chewy" style={{ fontSize: '20px', letterSpacing: '0.04em' }}>4. LAUNCH</span>
                  <div style={{ width: '60px', height: '3px', backgroundColor: '#0099FF', borderRadius: '2px' }} />
                </div>

                {/* Floating Interactive Sticky Notes */}
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="sticky-note"
                    style={{
                      position: 'absolute',
                      top: `${n.y}px`,
                      left: `${n.x}px`,
                      backgroundColor: n.bg,
                      color: n.textDark,
                      padding: '16px 20px',
                      borderRadius: '4px',
                      width: '150px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'grab'
                    }}
                  >
                    <div className="scotch-tape" />
                    <span>{n.title}</span>
                  </div>
                ))}

                {/* Connector Arrow between Note 2 and Plan */}
                <div style={{ position: 'absolute', top: '80px', left: '390px', pointerEvents: 'none' }}>
                  <svg width="100" height="40" viewBox="0 0 100 40" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 25 Q 45 5 90 20" />
                    <polyline points="80 16 90 20 85 28" />
                  </svg>
                </div>

                {/* Circle Bubble: "Let's ship this! 🎉" */}
                <div style={{
                  position: 'absolute',
                  bottom: '40px',
                  right: '40px',
                  width: '160px',
                  height: '75px',
                  borderRadius: '50%',
                  border: '2px solid #0099FF',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontSize: '15px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(0, 153, 255, 0.15)'
                }}>
                  Let's ship this! 🎉
                </div>

                {/* Live multi-cursors inside frame */}
                <div className="anim-cursor-taylor" style={{ position: 'absolute', top: '160px', left: '220px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#EAB308" stroke="#000" strokeWidth="1.5">
                    <polygon points="3 3 10 21 14 14 21 10 3 3" />
                  </svg>
                  <span style={{ backgroundColor: '#EAB308', color: '#000', fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>Taylor</span>
                </div>
              </div>

              {/* Right Panel in Frame */}
              <div style={{
                borderLeft: '1.5px solid #E2E8F0',
                padding: '16px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '8px', gap: '12px' }}>
                  <button 
                    onClick={() => setActivePreviewTab('templates')}
                    style={{ fontSize: '13px', fontWeight: activePreviewTab === 'templates' ? 800 : 600, color: activePreviewTab === 'templates' ? '#0099FF' : '#64748B' }}
                  >
                    Templates
                  </button>
                  <button 
                    onClick={() => setActivePreviewTab('comments')}
                    style={{ fontSize: '13px', fontWeight: activePreviewTab === 'comments' ? 800 : 600, color: activePreviewTab === 'comments' ? '#0099FF' : '#64748B' }}
                  >
                    Comments
                  </button>
                  <button 
                    onClick={() => setActivePreviewTab('tasks')}
                    style={{ fontSize: '13px', fontWeight: activePreviewTab === 'tasks' ? 800 : 600, color: activePreviewTab === 'tasks' ? '#0099FF' : '#64748B' }}
                  >
                    Tasks
                  </button>
                </div>

                {activePreviewTab === 'templates' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { title: 'Project plan', icon: FolderKanban },
                      { title: 'Brainstorm', icon: Lightbulb },
                      { title: 'Research plan', icon: CheckSquare },
                      { title: 'Design sprint', icon: Compass }
                    ].map((t, idx) => {
                      const Icon = t.icon;
                      return (
                        <div key={idx} style={{
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '12px',
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}>
                          <Icon size={20} color="#0F172A" style={{ margin: '0 auto 6px auto' }} />
                          <span style={{ fontSize: '11px', fontWeight: 700 }}>{t.title}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activePreviewTab === 'comments' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}>
                      <span style={{ fontWeight: 700 }}>Marcus:</span> Clean layout looks sharp!
                    </div>
                  </div>
                )}

                {activePreviewTab === 'tasks' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <Check size={14} color="#10B981" />
                      <span>Review client brief</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: HOW IT WORKS ON DARK BLUEPRINT GRID
         ============================================================ */}
      <section id="how-it-works" style={{
        backgroundColor: '#070D1E',
        backgroundImage: `
          linear-gradient(to right, rgba(0, 153, 255, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 153, 255, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
        padding: '100px 24px',
        color: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 60px auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#0099FF',
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '0.1em',
              marginBottom: '16px'
            }}>
              <span>\</span>
              <span>HOW IT WORKS</span>
              <span>/</span>
            </div>

            <h2 className="font-chewy" style={{
              fontSize: 'clamp(36px, 5vw, 54px)',
              lineHeight: 1.1,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              marginBottom: '18px'
            }}>
              Go from messy ideas to clear action.
            </h2>

            <p className="font-fredoka" style={{ fontSize: '18px', color: '#94A3B8' }}>
              Capture ideas, collaborate with your team, and turn every board into something actionable in{' '}
              <span className="hand-underline" style={{ color: '#FFFFFF', fontWeight: 600 }}>just a few steps</span>.
            </p>
          </div>

          {/* 3 Step Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {/* Step 1 */}
            <div className="card-whiteboard" style={{ padding: '32px', color: '#0F172A' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                fontSize: '22px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                01
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>Start with a canvas</h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
                Open a blank board, drop sticky notes, sketch flows, and collect ideas freely.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-whiteboard" style={{ padding: '32px', color: '#0F172A' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#EDE9FE',
                color: '#7C3AED',
                fontSize: '22px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                02
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>Collaborate in real time</h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
                Invite teammates, leave comments, move ideas around, and build together instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-whiteboard" style={{ padding: '32px', color: '#0F172A' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                fontSize: '22px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                03
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>Turn ideas into action</h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
                Use templates, organize sections, and turn your board into a presentation or plan.
              </p>
            </div>
          </div>

          {/* 3-Column Feature Pill Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            color: '#0F172A',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', flexShrink: 0 }}>
                <Lightbulb size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>Brainstorm</h4>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.4 }}>Capture every idea and see the big picture come to life.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', flexShrink: 0 }}>
                <Users size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>Align</h4>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.4 }}>Co-create with your team and stay on the same page.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF08A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#854D0E', flexShrink: 0 }}>
                <Presentation size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>Present</h4>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.4 }}>Turn your boards into polished plans and share with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: TEMPLATES GALLERY GRID
         ============================================================ */}
      <section id="templates" style={{
        backgroundColor: '#FFFFFF',
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        padding: '100px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 60px auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#0099FF',
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '0.1em',
              marginBottom: '16px'
            }}>
              <span>\</span>
              <span>TEMPLATES</span>
              <span>/</span>
            </div>

            <h2 className="font-chewy" style={{
              fontSize: 'clamp(36px, 5vw, 54px)',
              lineHeight: 1.1,
              color: '#0F172A',
              letterSpacing: '0.02em',
              marginBottom: '18px'
            }}>
              Browse templates your team will <span className="hand-underline">actually use</span>.
            </h2>

            <p className="font-fredoka" style={{ fontSize: '18px', color: '#64748B' }}>
              Explore ready-made boards for brainstorming, planning, research, workshops, and presentations.
            </p>
          </div>

          {/* 6 Template Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {[
              {
                title: 'BIG IDEA',
                color: '#10B981',
                desc: "What's the problem? What are the blockers?",
                tags: [{ label: 'Popular', class: 'tag-pill-popular' }, { label: 'Free', class: 'tag-pill-free' }],
                notes: ['#BBF7D0', '#FEF08A', '#FBCFE8']
              },
              {
                title: 'PROJECT ROADMAP',
                color: '#0099FF',
                desc: 'Milestones, Q1 - Q4 timelines, deliverables',
                tags: [{ label: 'Used by 3.1k teams', class: 'tag-pill-used' }],
                notes: ['#BAE6FD', '#EDE9FE']
              },
              {
                title: 'USER JOURNEY MAP',
                color: '#F59E0B',
                desc: 'Awareness, Consideration, Decision, Retention',
                tags: [{ label: 'Popular', class: 'tag-pill-popular' }, { label: 'Free', class: 'tag-pill-free' }],
                notes: ['#FEF08A', '#FED7AA']
              },
              {
                title: 'RETROSPECTIVE',
                color: '#10B981',
                desc: 'What went well? What to improve? Action items',
                tags: [{ label: 'Popular', class: 'tag-pill-popular' }, { label: 'Free', class: 'tag-pill-free' }],
                notes: ['#BBF7D0', '#FBCFE8']
              },
              {
                title: 'MARKETING PLAN',
                color: '#0099FF',
                desc: 'Web, Email, Social, Ads quarterly objectives',
                tags: [{ label: 'Used by 3.1k teams', class: 'tag-pill-used' }],
                notes: ['#BAE6FD', '#FEF08A']
              },
              {
                title: 'EMPATHY MAP',
                color: '#EF4444',
                desc: 'Says, Thinks, Does, Feels user research matrix',
                tags: [{ label: 'Popular', class: 'tag-pill-popular' }, { label: 'Free', class: 'tag-pill-free' }],
                notes: ['#FEE2E2', '#EDE9FE']
              }
            ].map((tmpl, idx) => (
              <div key={idx} className="card-whiteboard" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Template Canvas Preview */}
                  <div style={{
                    height: '160px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    padding: '16px',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <span className="font-chewy" style={{ fontSize: '18px', color: tmpl.color, letterSpacing: '0.04em', marginBottom: '8px' }}>
                      {tmpl.title}
                    </span>
                    <p style={{ fontSize: '12px', color: '#64748B', textAlign: 'center', maxWidth: '80%' }}>
                      {tmpl.desc}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      {tmpl.notes.map((bg, nIdx) => (
                        <div key={nIdx} style={{ width: '22px', height: '22px', backgroundColor: bg, borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {tmpl.tags.map((t, tIdx) => (
                      <span key={tIdx} className={t.class}>{t.label}</span>
                    ))}
                  </div>
                  <button 
                    onClick={isLoggedIn ? onLaunchWorkspace : onNavigateRegister}
                    style={{ fontSize: '12px', fontWeight: 800, color: '#0099FF' }}
                  >
                    Use Board →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => alert('All pre-built visual templates loaded in workspace!')}
              className="btn-collab-secondary"
              style={{ borderRadius: '999px', padding: '12px 32px' }}
            >
              <span>View More</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6: TESTIMONIALS ON DARK BLUEPRINT GRID
         ============================================================ */}
      <section style={{
        backgroundColor: '#070D1E',
        backgroundImage: `
          linear-gradient(to right, rgba(0, 153, 255, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 153, 255, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
        padding: '100px 24px',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating Customer Avatars */}
        <div style={{ position: 'absolute', top: '15%', left: '15%', width: '48px', height: '48px', borderRadius: '50%', border: '2.5px solid #FFF', backgroundColor: '#F472B6', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ position: 'absolute', top: '22%', right: '16%', width: '52px', height: '52px', borderRadius: '50%', border: '2.5px solid #FFF', backgroundColor: '#60A5FA', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '15%', left: '18%', width: '44px', height: '44px', borderRadius: '50%', border: '2.5px solid #FFF', backgroundColor: '#34D399', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '18%', right: '18%', width: '46px', height: '46px', borderRadius: '50%', border: '2.5px solid #FFF', backgroundColor: '#FBBF24', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#0099FF',
            fontWeight: 800,
            fontSize: '15px',
            letterSpacing: '0.1em',
            marginBottom: '16px'
          }}>
            <span>\</span>
            <span>TESTIMONIALS</span>
            <span>/</span>
          </div>

          <h2 className="font-chewy" style={{
            fontSize: 'clamp(36px, 5vw, 54px)',
            lineHeight: 1.1,
            color: '#FFFFFF',
            letterSpacing: '0.02em',
            marginBottom: '18px'
          }}>
            Teams love how ideas come <span className="hand-underline">together</span>.
          </h2>

          <p className="font-fredoka" style={{ fontSize: '18px', color: '#94A3B8', marginBottom: '50px' }}>
            From first brainstorm to final presentation, FreelanceCanvas helps teams collaborate faster, stay aligned, and move work forward.
          </p>

          {/* Testimonial Card */}
          <div className="card-whiteboard" style={{
            backgroundColor: '#FFFFFF',
            padding: '40px',
            color: '#0F172A',
            borderRadius: '24px',
            maxWidth: '680px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              margin: '0 auto 16px auto',
              overflow: 'hidden',
              border: '2px solid #000'
            }}>
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop" alt="Marcus Chen" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 2px 0' }}>Marcus Chen</h4>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>Lead Developer, Innovate Inc • London, UK</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '18px', color: '#F59E0B' }}>
              {'★★★★★'}
            </div>

            <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#334155', fontStyle: 'italic' }}>
              "I was skeptical at first, but the intuitive interface and seamless whiteboard integrations won me over in less than a week. It's now essential to our weekly engineering sprint planning."
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7: FINAL CTA (Ready to bring your ideas together?)
         ============================================================ */}
      <section id="cta" style={{
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        padding: '100px 24px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Blue sketch accents */}
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '-18px', left: '-20px', color: '#0099FF', fontSize: '24px', fontWeight: 900 }}>' '</span>
            <h2 className="font-chewy" style={{
              fontSize: 'clamp(40px, 6vw, 68px)',
              lineHeight: 1.05,
              color: '#000000',
              letterSpacing: '0.02em',
              marginBottom: '16px'
            }}>
              Ready to bring your ideas together?
            </h2>
            <span style={{ position: 'absolute', bottom: '-10px', right: '-24px', color: '#0099FF', fontSize: '26px' }}>⤻</span>
          </div>

          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '15px',
            color: '#475569',
            maxWidth: '560px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6
          }}>
            Brainstorm, collaborate, and turn ideas into action-together, all in FreelanceCanvas.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={isLoggedIn ? onLaunchWorkspace : onNavigateRegister}
              className="btn-collab-primary"
              style={{ padding: '14px 34px', fontSize: '15px' }}
            >
              <span>Start for free</span>
            </button>

            <button
              onClick={() => alert('Demo booking schedule ready!')}
              style={{
                background: 'none',
                border: 'none',
                color: '#000000',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                borderBottom: '3px solid #0099FF',
                paddingBottom: '2px'
              }}
            >
              Book demo
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 8: 4-COLUMN FOOTER WITH SKETCH HEART
         ============================================================ */}
      <footer style={{
        backgroundColor: '#FFFFFF',
        borderTop: '2px solid #000000',
        padding: '60px 24px 30px 24px',
        color: '#0F172A'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '2px solid #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '14px'
              }}>
                FC
              </div>
              <span className="font-chewy" style={{ fontSize: '24px' }}>FreelanceCanvas</span>
            </div>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              color: '#64748B',
              lineHeight: 1.6
            }}>
              A visual freelance collaboration workspace to brainstorm, quote, and deliver together.
            </p>
          </div>

          {/* Product Col */}
          <div>
            <h5 className="font-chewy" style={{ fontSize: '18px', marginBottom: '14px' }}>Product</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" }}>
              <li><a href="#features" style={{ textDecoration: 'none', color: '#475569' }}>Features</a></li>
              <li><a href="#templates" style={{ textDecoration: 'none', color: '#475569' }}>Templates</a></li>
              <li><a href="#how-it-works" style={{ textDecoration: 'none', color: '#475569' }}>Use Cases</a></li>
              <li><a href="#preview" style={{ textDecoration: 'none', color: '#475569' }}>Pricing</a></li>
            </ul>
          </div>

          {/* Resources Col */}
          <div>
            <h5 className="font-chewy" style={{ fontSize: '18px', marginBottom: '14px' }}>Resources</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" }}>
              <li><a href="#" style={{ textDecoration: 'none', color: '#475569' }}>Help Center</a></li>
              <li><a href="#" style={{ textDecoration: 'none', color: '#475569' }}>Blog</a></li>
              <li><a href="#" style={{ textDecoration: 'none', color: '#475569' }}>Community</a></li>
              <li><a href="#" style={{ textDecoration: 'none', color: '#475569' }}>Contact</a></li>
            </ul>
          </div>

          {/* Company Col */}
          <div>
            <h5 className="font-chewy" style={{ fontSize: '18px', marginBottom: '14px' }}>Company</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" }}>
              <li><a href="#" style={{ textDecoration: 'none', color: '#475569' }}>About</a></li>
              <li><a href="#" style={{ textDecoration: 'none', color: '#475569' }}>Careers</a></li>
              <li><a href="#" style={{ textDecoration: 'none', color: '#475569' }}>Privacy</a></li>
              <li><a href="#" style={{ textDecoration: 'none', color: '#475569' }}>Terms</a></li>
            </ul>
          </div>

          {/* Compare / Tools Col */}
          <div>
            <h5 className="font-chewy" style={{ fontSize: '18px', marginBottom: '14px' }}>Compare / Tools</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" }}>
              <li><a href="#" style={{ textDecoration: 'none', color: '#475569' }}>Whiteboards</a></li>
              <li><a href="#" style={{ textDecoration: 'none', color: '#475569' }}>Moodboards</a></li>
              <li><a href="#" style={{ textDecoration: 'none', color: '#475569' }}>Presentations</a></li>
              <li><a href="#" style={{ textDecoration: 'none', color: '#475569' }}>Team comments</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Sketch Heart */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '20px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#94A3B8'
        }}>
          <span>© 2026 FreelanceCanvas Visual Collaboration Desk. All rights reserved.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0099FF' }}>
            <span>Built with care</span>
            <Heart size={16} fill="#0099FF" />
            <Sparkles size={16} />
          </div>
        </div>
      </footer>
    </div>
  );
};
