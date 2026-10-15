import React, { useState } from 'react';
import { 
  ArrowRight, 
  Bot, 
  Cpu, 
  Search, 
  Layers, 
  Headphones, 
  CheckCircle2, 
  Lock, 
  Terminal,
  Zap,
  Clock,
  Sparkles,
  MousePointer,
  Square,
  Type,
  StickyNote,
  MoveUpRight,
  MoreHorizontal,
  Home,
  LayoutGrid,
  FileCode,
  Users,
  Tag,
  Mail,
  Share2,
  CheckSquare,
  Compass,
  Star
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

  return (
    <div className="font-fredoka" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#18191D', overflowX: 'hidden' }}>
      
      {/* ============================================================
          TOP NAVIGATION BAR (Whiteboard Theme with Pill Tabs)
         ============================================================ */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '2px solid #E5E7EB',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px'
      }}>
        {/* Brand Logo */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <span className="font-chewy" style={{ fontSize: '26px', color: '#FFFFFF', lineHeight: 1 }}>C</span>
          </div>
          <span className="font-chewy" style={{ fontSize: '24px', letterSpacing: '0.02em', color: '#0F172A' }}>
            Autonomiq
          </span>
        </div>

        {/* Center Pill Nav Bar */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#F8FAFC',
          padding: '4px',
          borderRadius: '999px',
          border: '1px solid #E2E8F0'
        }}>
          {[
            { id: 'home', label: 'HOME', icon: Home },
            { id: 'features', label: 'FEATURES', icon: LayoutGrid, href: '#features' },
            { id: 'templates', label: 'CAPABILITIES', icon: FileCode, href: '#canvas-action' },
            { id: 'usecases', label: 'HOW IT WORKS', icon: Users, href: '#how-it-works' },
            { id: 'pricing', label: 'RATE CARDS', icon: Tag, href: '#features' },
            { id: 'contact', label: 'AWAY MODE', icon: Headphones, href: '#how-it-works' }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeNav === tab.id;
            return (
              <a
                key={tab.id}
                href={tab.href || '#'}
                onClick={() => setActiveNav(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '999px',
                  backgroundColor: active ? '#00A3FF' : 'transparent',
                  color: active ? '#FFFFFF' : '#475569',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isLoggedIn ? (
            <button
              id="nav-launch-desk-btn"
              onClick={onLaunchWorkspace}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '8px',
                backgroundColor: '#00A3FF',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 163, 255, 0.3)',
                cursor: 'pointer'
              }}
            >
              <span>OPEN WORKSPACE ({freelancerName?.split(' ')[0] || 'DESK'})</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                id="nav-login-btn"
                onClick={onNavigateLogin}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: '#0F172A',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                LOG IN
              </button>
              <button
                id="nav-signup-btn"
                onClick={onNavigateRegister}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  backgroundColor: '#00A3FF',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 163, 255, 0.3)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                START FOR FREE
              </button>
            </>
          )}
        </div>
      </header>

      {/* ============================================================
          SECTION 1: HERO CANVAS WITH STICKY NOTES, TAPE & CURSORS
         ============================================================ */}
      <section className="bg-canvas-dots" style={{
        position: 'relative',
        padding: '70px 24px 110px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        minHeight: '620px',
        overflow: 'hidden'
      }}>

        {/* Floating Left Vertical Tool Palette (Canvas Miro/Figma style) */}
        <div style={{
          position: 'absolute',
          left: '36px',
          top: '120px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '12px 8px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          zIndex: 30
        }}>
          <button style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: '#00A3FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <MousePointer size={18} />
          </button>
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
            <Square size={18} />
          </button>
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
            <Type size={18} />
          </button>
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
            <StickyNote size={18} />
          </button>
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
            <MoveUpRight size={18} />
          </button>
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* FLOATING STICKY NOTE: Top Left (Mint Green with Scotch Tape & Cursor) */}
        <div 
          className="sticky-note anim-float" 
          style={{
            position: 'absolute',
            top: '40px',
            left: '110px',
            backgroundColor: '#BBF7D0',
            padding: '18px 22px',
            width: '180px',
            '--rot': '-3deg',
            transform: 'rotate(-3deg)',
            zIndex: 15
          } as React.CSSProperties}
        >
          <div className="scotch-tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#14532D', lineHeight: 1.3 }}>
              Real-time RFP Recon
            </span>
          </div>

          {/* Animated User Cursor pointing to sticky note */}
          <div className="anim-cursor-alex" style={{
            position: 'absolute',
            bottom: '-28px',
            right: '-18px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 25,
            pointerEvents: 'none'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#00A3FF">
              <path d="M4 2L20 10L12 13L9 21L4 2Z" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <div style={{
              backgroundColor: '#00A3FF',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}>
              Alex
            </div>
          </div>
        </div>

        {/* FLOATING STICKY NOTE: Top Right (Peach with Tape) */}
        <div 
          className="sticky-note anim-float-delayed" 
          style={{
            position: 'absolute',
            top: '45px',
            right: '90px',
            backgroundColor: '#FED7AA',
            padding: '18px 24px',
            width: '170px',
            '--rot': '2.5deg',
            transform: 'rotate(2.5deg)',
            zIndex: 15
          } as React.CSSProperties}
        >
          <div className="scotch-tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutGrid size={18} color="#9A3412" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#9A3412' }}>
              Vector RAG Match
            </span>
          </div>
        </div>

        {/* FLOATING STICKY NOTE: Middle Right (Sky Blue with Tape) */}
        <div 
          className="sticky-note anim-float" 
          style={{
            position: 'absolute',
            top: '200px',
            right: '50px',
            backgroundColor: '#BAE6FD',
            padding: '18px 22px',
            width: '170px',
            '--rot': '1deg',
            transform: 'rotate(1deg)',
            zIndex: 15
          } as React.CSSProperties}
        >
          <div className="scotch-tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#0369A1" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0369A1' }}>
              Built for Solo Devs
            </span>
          </div>
        </div>

        {/* FLOATING STICKY NOTE: Bottom Left (Pastel Yellow with Tape) */}
        <div 
          className="sticky-note anim-float-slow" 
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '80px',
            backgroundColor: '#FEF08A',
            padding: '18px 22px',
            width: '165px',
            '--rot': '3deg',
            transform: 'rotate(3deg)',
            zIndex: 15
          } as React.CSSProperties}
        >
          <div className="scotch-tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#854D0E" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#854D0E' }}>
              Local-First LLMs
            </span>
          </div>
        </div>

        {/* FLOATING STICKY NOTE: Bottom Right (Pastel Pink with Tape) */}
        <div 
          className="sticky-note anim-float-delayed" 
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '110px',
            backgroundColor: '#FBCFE8',
            padding: '18px 24px',
            width: '180px',
            '--rot': '-2deg',
            transform: 'rotate(-2deg)',
            zIndex: 15
          } as React.CSSProperties}
        >
          <div className="scotch-tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Headphones size={18} color="#9D174D" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#9D174D' }}>
              Away Audio Digest
            </span>
          </div>
        </div>

        {/* Center Main Content Container */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 20 }}>
          
          {/* Hand-drawn Category Tag */}
          <div style={{ marginBottom: '16px' }}>
            <span className="font-chewy hand-underline" style={{
              fontSize: '24px',
              color: '#0F172A',
              letterSpacing: '0.04em'
            }}>
              AUTONOMOUS FREELANCE WORKSTATION
            </span>
          </div>

          {/* Giant Title Inside Blue Selection Bounding Box */}
          <div style={{
            position: 'relative',
            display: 'inline-block',
            padding: '12px 36px',
            margin: '0 auto 24px auto'
          }}>
            <div className="canvas-bounding-box" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
            
            <h1 className="font-chewy" style={{
              fontSize: 'clamp(56px, 9vw, 110px)',
              fontWeight: 400,
              color: '#0B0F19',
              lineHeight: 0.95,
              margin: 0,
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}>
              CANVAS
            </h1>
          </div>

          {/* Hand-drawn Curved Arrows (SVG) */}
          <svg style={{ position: 'absolute', top: '100px', left: '16%', width: '60px', height: '40px', pointerEvents: 'none' }}>
            <path d="M10,35 Q30,5 55,20" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="55,20 48,15 47,25" fill="#0F172A" />
          </svg>
          <svg style={{ position: 'absolute', top: '100px', right: '16%', width: '60px', height: '40px', pointerEvents: 'none' }}>
            <path d="M50,35 Q30,5 5,20" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="5,20 12,15 13,25" fill="#0F172A" />
          </svg>

          {/* Subtitle */}
          <p style={{
            fontSize: '22px',
            fontWeight: 600,
            color: '#1E293B',
            maxWidth: '620px',
            margin: '0 auto 36px auto',
            lineHeight: 1.45
          }}>
            Brainstorm, scope, and synthesize client proposals in one{' '}
            <span className="hand-underline" style={{ color: '#00A3FF' }}>flexible workspace</span>.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <button
              id="hero-start-free-btn"
              onClick={isLoggedIn ? onLaunchWorkspace : onNavigateRegister}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                borderRadius: '8px',
                backgroundColor: '#00A3FF',
                color: '#000000',
                fontWeight: 800,
                fontSize: '15px',
                border: 'none',
                boxShadow: '0 4px 14px rgba(0, 163, 255, 0.4)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>START FOR FREE</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>

            <a
              id="hero-view-templates-btn"
              href="#features"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '13px 28px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontWeight: 800,
                fontSize: '15px',
                border: '2px solid #0F172A',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              VIEW TEMPLATES
            </a>
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 2: DARK BLUEPRINT GRID WITH 6 WHITEBOARD CARDS
         ============================================================ */}
      <section id="features" className="bg-blueprint-grid" style={{
        padding: '90px 24px 110px 24px',
        color: '#FFFFFF',
        position: 'relative'
      }}>
        
        {/* Floating Pink Star Sticky on Right */}
        <div className="sticky-note anim-float" style={{
          position: 'absolute',
          top: '60px',
          right: '8%',
          backgroundColor: '#F472B6',
          padding: '16px',
          borderRadius: '4px',
          width: '74px',
          height: '74px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          '--rot': '4deg',
          transform: 'rotate(4deg)'
        } as React.CSSProperties}>
          <div className="scotch-tape-dark" />
          <Star size={34} color="#FFFFFF" strokeWidth={1.8} />
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Header Tag */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ color: '#00A3FF', fontWeight: 800, fontSize: '18px' }}>/</span>
            <span className="font-chewy" style={{ color: '#00A3FF', fontSize: '20px', letterSpacing: '0.08em' }}>
              FEATURES
            </span>
            <span style={{ color: '#00A3FF', fontWeight: 800, fontSize: '18px' }}>/</span>
          </div>

          {/* Section Title */}
          <h2 className="font-chewy" style={{
            fontSize: 'clamp(38px, 5.5vw, 68px)',
            fontWeight: 400,
            lineHeight: 1.1,
            maxWidth: '850px',
            margin: '0 auto 20px auto',
            color: '#FFFFFF',
            letterSpacing: '0.02em'
          }}>
            Everything you need to turn ideas into action.
          </h2>

          <p style={{
            fontSize: '17px',
            fontWeight: 500,
            color: '#CBD5E1',
            maxWidth: '680px',
            margin: '0 auto 60px auto',
            lineHeight: 1.6
          }}>
            Brainstorm freely, collaborate in real time, use powerful templates, and present your work with{' '}
            <span className="hand-underline" style={{ color: '#FFFFFF' }}>clarity and impact.</span>
          </p>

          {/* 6 Whiteboard Bento Cards (Exact 2x3 Grid from Image 2 & 3) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
            textAlign: 'left'
          }}>

            {/* CARD 1: Infinite Whiteboards */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px 24px 28px',
              color: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '20px', color: '#0284C7', fontWeight: 900 }}>∞</span>
                </div>
                <div>
                  <h3 className="font-fredoka" style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                    Infinite whiteboards
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
                Start with a blank canvas and take your ideas anywhere. No limits, no boundaries.
              </p>
              
              {/* Inner Mini Mockup */}
              <div style={{
                marginTop: 'auto',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                position: 'relative',
                minHeight: '140px',
                backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
                backgroundSize: '16px 16px'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: '#00A3FF',
                  color: '#FFFFFF',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MousePointer size={14} />
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '20px',
                  backgroundColor: '#BBF7D0',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#166534'
                }}>
                  RFP Ingestion Ready
                </div>
              </div>
            </div>

            {/* CARD 2: Real-time Collaboration (Animated Cursors) */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px 24px 28px',
              color: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={20} color="#16A34A" />
                </div>
                <div>
                  <h3 className="font-fredoka" style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                    Real-time collaboration
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
                Work together seamlessly with your team or autonomous agents, wherever you are.
              </p>
              
              {/* Inner Mini Mockup with Animated Cursors */}
              <div style={{
                marginTop: 'auto',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                position: 'relative',
                minHeight: '140px',
                backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
                backgroundSize: '16px 16px',
                overflow: 'hidden'
              }}>
                {/* Alex Cursor */}
                <div className="anim-cursor-alex" style={{ position: 'absolute', top: '24px', left: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ backgroundColor: '#10B981', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                    Alex
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#10B981">
                    <path d="M4 2L20 10L12 13L9 21L4 2Z" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>
                </div>

                {/* Sam Cursor */}
                <div className="anim-cursor-sam" style={{ position: 'absolute', bottom: '24px', left: '30px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ backgroundColor: '#A855F7', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                    Sam
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#A855F7">
                    <path d="M4 2L20 10L12 13L9 21L4 2Z" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>
                </div>

                {/* Taylor Cursor */}
                <div className="anim-cursor-taylor" style={{ position: 'absolute', bottom: '20px', right: '35px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                    Taylor
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B">
                    <path d="M4 2L20 10L12 13L9 21L4 2Z" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* CARD 3: Ready-made Templates */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px 24px 28px',
              color: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#F3E8FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LayoutGrid size={20} color="#9333EA" />
                </div>
                <div>
                  <h3 className="font-fredoka" style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                    Ready-made templates
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
                Jumpstart your projects with professionally designed templates for any use case.
              </p>
              
              {/* Inner Mini Mockup */}
              <div style={{
                marginTop: 'auto',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <span style={{ padding: '6px 14px', borderRadius: '999px', backgroundColor: '#00A3FF', color: '#FFFFFF', fontSize: '12px', fontWeight: 700 }}>All</span>
                <span style={{ padding: '6px 14px', borderRadius: '999px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 600 }}>Proposal WBS</span>
                <span style={{ padding: '6px 14px', borderRadius: '999px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 600 }}>Rate Card</span>
              </div>
            </div>

            {/* CARD 4: Present Ideas Beautifully */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px 24px 28px',
              color: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#FCE7F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={20} color="#DB2777" />
                </div>
                <div>
                  <h3 className="font-fredoka" style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                    Present ideas beautifully
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
                Turn your boards into stunning client presentations with one click. Clean, focused, and impactful.
              </p>
              
              {/* Inner Mini Mockup */}
              <div style={{
                marginTop: 'auto',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                minHeight: '110px'
              }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Q1 Milestone Roadmap</span>
                  <div style={{ height: '4px', backgroundColor: '#F43F5E', width: '60%', borderRadius: '2px', marginTop: '6px' }} />
                </div>
              </div>
            </div>

            {/* CARD 5: Comments and Feedback */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px 24px 28px',
              color: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mail size={20} color="#0284C7" />
                </div>
                <div>
                  <h3 className="font-fredoka" style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                    Comments and feedback
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
                Leave comments, tag autonomous agents, and keep feedback right inside the client proposal context.
              </p>
              
              {/* Inner Mini Mockup */}
              <div style={{
                marginTop: 'auto',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '16px'
              }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#F472B6', color: '#FFFFFF', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>M</div>
                  <span style={{ fontSize: '11px', color: '#1E293B', fontWeight: 600 }}>Great point! Fixed in Milestone 2</span>
                  <span style={{ marginLeft: 'auto', backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>Approved</span>
                </div>
              </div>
            </div>

            {/* CARD 6: Organize Notes and Sections */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px 24px 28px',
              color: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF08A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Layers size={20} color="#854D0E" />
                </div>
                <div>
                  <h3 className="font-fredoka" style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                    Organize notes and sections
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
                Keep everything structured with sections, frames, and color-coded sticky notes.
              </p>
              
              {/* Inner Mini Mockup */}
              <div style={{
                marginTop: 'auto',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                gap: '8px',
                justifyContent: 'center'
              }}>
                <span style={{ backgroundColor: '#FEF08A', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: '#854D0E' }}>Priority</span>
                <span style={{ backgroundColor: '#BBF7D0', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: '#166534' }}>Research</span>
                <span style={{ backgroundColor: '#BAE6FD', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: '#0369A1' }}>Architecture</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 3: "SEE CANVAS IN ACTION" (Interactive Whiteboard Mockup)
         ============================================================ */}
      <section id="canvas-action" style={{
        padding: '90px 24px',
        backgroundColor: '#FFFFFF',
        position: 'relative'
      }}>
        {/* Mint Tape Sticky on Left */}
        <div className="sticky-note anim-float" style={{
          position: 'absolute',
          top: '30px',
          left: '8%',
          backgroundColor: '#BBF7D0',
          padding: '12px 18px',
          borderRadius: '4px',
          '--rot': '-3deg',
          transform: 'rotate(-3deg)'
        } as React.CSSProperties}>
          <div className="scotch-tape" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#14532D' }}>
            Everything together ✨
          </span>
        </div>

        <div style={{ maxWidth: '1180px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ color: '#00A3FF', fontWeight: 800 }}>/</span>
            <span className="font-chewy" style={{ color: '#00A3FF', fontSize: '18px' }}>PRODUCT PREVIEW</span>
            <span style={{ color: '#00A3FF', fontWeight: 800 }}>/</span>
          </div>

          <h2 className="font-chewy" style={{
            fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: 400,
            color: '#0F172A',
            margin: '0 auto 16px auto',
            letterSpacing: '0.02em'
          }}>
            See Canvas in action.
          </h2>

          <p style={{
            fontSize: '17px',
            color: '#64748B',
            maxWidth: '680px',
            margin: '0 auto 48px auto',
            lineHeight: 1.5
          }}>
            Unleash your team's creativity with an infinite workspace designed for brainstorming, planning, and bringing ideas to life seamlessly.
          </p>

          {/* Full Browser / Canvas Window Container (Matches Image 4) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            textAlign: 'left'
          }}>
            {/* Window Top Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span className="font-chewy" style={{ fontSize: '22px', color: '#0F172A' }}>C</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Project Launch</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#6EE7B7', border: '2px solid #FFF' }} />
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#93C5FD', border: '2px solid #FFF', marginLeft: '-8px' }} />
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#FDE047', border: '2px solid #FFF', marginLeft: '-8px' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginLeft: '6px' }}>+3</span>
                </div>
                <button style={{
                  backgroundColor: '#00A3FF',
                  color: '#FFFFFF',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Share
                </button>
              </div>
            </div>

            {/* Window Canvas Body */}
            <div className="bg-canvas-dots" style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 240px',
              minHeight: '480px',
              position: 'relative'
            }}>
              {/* Left Canvas Nav */}
              <div style={{ borderRight: '1px solid #E2E8F0', padding: '16px 12px', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00A3FF', fontWeight: 700 }}>
                    <LayoutGrid size={15} /> Canvas
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Square size={15} /> Templates</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><StickyNote size={15} /> Projects</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={15} /> Comments</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={15} /> Tasks</div>
                </div>
              </div>

              {/* Main Whiteboard Canvas with Visual Cards & Wandering Cursors */}
              <div style={{ padding: '36px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  
                  {/* Step 1: Ideas */}
                  <div>
                    <span className="font-chewy" style={{ fontSize: '16px', color: '#00A3FF', display: 'block', marginBottom: '8px' }}>
                      1. IDEAS
                    </span>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <div className="sticky-note" style={{ backgroundColor: '#A7F3D0', padding: '10px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, color: '#065F46' }}>
                        Improve onboarding
                      </div>
                      <div className="sticky-note" style={{ backgroundColor: '#FEF08A', padding: '10px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, color: '#854D0E' }}>
                        AI-powered search
                      </div>
                      <div className="sticky-note" style={{ backgroundColor: '#BAE6FD', padding: '10px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, color: '#0369A1' }}>
                        Team analytics
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Plan */}
                  <div>
                    <span className="font-chewy" style={{ fontSize: '16px', color: '#00A3FF', display: 'block', marginBottom: '8px' }}>
                      2. PLAN
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '8px 14px', borderRadius: '6px', border: '2px solid #C084FC', backgroundColor: '#FAF5FF', fontSize: '12px', fontWeight: 700, color: '#6B21A8' }}>
                        Research
                      </div>
                      <span>→</span>
                      <div style={{ padding: '8px 14px', borderRadius: '6px', border: '2px solid #93C5FD', backgroundColor: '#EFF6FF', fontSize: '12px', fontWeight: 700, color: '#1E40AF' }}>
                        Design
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Next Steps */}
                  <div>
                    <span className="font-chewy" style={{ fontSize: '16px', color: '#00A3FF', display: 'block', marginBottom: '8px' }}>
                      3. NEXT STEPS
                    </span>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '8px', border: '1px solid #CBD5E1', width: 'fit-content', fontSize: '12px', fontWeight: 600 }}>
                      <div>☑ User interviews</div>
                      <div>☑ Wireframes</div>
                      <div>☐ Prototype</div>
                      <div>☐ Test with users</div>
                    </div>
                  </div>

                  {/* Step 4: Launch */}
                  <div>
                    <span className="font-chewy" style={{ fontSize: '16px', color: '#00A3FF', display: 'block', marginBottom: '8px' }}>
                      4. LAUNCH
                    </span>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '12px 20px',
                      borderRadius: '999px',
                      backgroundColor: '#E0F2FE',
                      border: '2px solid #0284C7',
                      color: '#0369A1',
                      fontSize: '14px',
                      fontWeight: 800
                    }}>
                      Let's ship this! 🚀
                    </div>
                  </div>

                </div>

                {/* Live Floating Cursor Mockup */}
                <div className="anim-cursor-taylor" style={{ position: 'absolute', bottom: '60px', right: '120px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B">
                    <path d="M4 2L20 10L12 13L9 21L4 2Z" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>
                  <div style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                    Taylor
                  </div>
                </div>
              </div>

              {/* Right Canvas Templates Rail */}
              <div style={{ borderLeft: '1px solid #E2E8F0', padding: '16px', backgroundColor: '#FFFFFF' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>Templates</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 600 }}>Project plan</div>
                  <div style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 600 }}>Brainstorm</div>
                  <div style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 600 }}>Design sprint</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 4: "HOW IT WORKS" (Image 5 - Dark Blueprint with 3 Steps)
         ============================================================ */}
      <section id="how-it-works" className="bg-blueprint-grid" style={{
        padding: '90px 24px 100px 24px',
        color: '#FFFFFF',
        position: 'relative'
      }}>
        {/* Pink Sticky on top right */}
        <div className="sticky-note anim-float" style={{
          position: 'absolute',
          top: '50px',
          right: '10%',
          backgroundColor: '#F472B6',
          padding: '16px',
          borderRadius: '4px',
          width: '68px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          '--rot': '3deg',
          transform: 'rotate(3deg)'
        } as React.CSSProperties}>
          <div className="scotch-tape-dark" />
          <Star size={30} color="#FFFFFF" />
        </div>

        <div style={{ maxWidth: '1180px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ color: '#00A3FF', fontWeight: 800 }}>/</span>
            <span className="font-chewy" style={{ color: '#00A3FF', fontSize: '18px' }}>HOW IT WORKS</span>
            <span style={{ color: '#00A3FF', fontWeight: 800 }}>/</span>
          </div>

          <h2 className="font-chewy" style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 400,
            color: '#FFFFFF',
            lineHeight: 1.1,
            margin: '0 auto 16px auto',
            letterSpacing: '0.02em'
          }}>
            Go from messy ideas to clear action.
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#94A3B8',
            maxWidth: '640px',
            margin: '0 auto 56px auto',
            lineHeight: 1.5
          }}>
            Capture ideas, collaborate with your team, and turn every board into something actionable in{' '}
            <span className="hand-underline" style={{ color: '#FFFFFF' }}>just a few steps.</span>
          </p>

          {/* 3 Step Whiteboard Cards (Exact Layout from Image 5) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            textAlign: 'left'
          }}>

            {/* STEP 01 */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px',
              color: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '2px solid #00A3FF',
                  backgroundColor: '#E0F2FE',
                  color: '#0284C7',
                  fontSize: '18px',
                  fontWeight: 900
                }}>
                  01
                </div>
                <div>
                  <h3 className="font-fredoka" style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>
                    Start with a canvas
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
                Open a blank board, drop sticky notes, sketch flows, and collect client ideas freely.
              </p>
              
              <div style={{
                marginTop: 'auto',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <div className="sticky-note" style={{ backgroundColor: '#BBF7D0', padding: '10px 14px', fontSize: '11px', fontWeight: 700, color: '#14532D' }}>
                  New idea
                </div>
                <span>→</span>
                <div className="sticky-note" style={{ backgroundColor: '#BAE6FD', padding: '10px 14px', fontSize: '11px', fontWeight: 700, color: '#0369A1' }}>
                  Next steps
                </div>
              </div>
            </div>

            {/* STEP 02 */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px',
              color: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '2px solid #C084FC',
                  backgroundColor: '#F3E8FF',
                  color: '#7E22CE',
                  fontSize: '18px',
                  fontWeight: 900
                }}>
                  02
                </div>
                <div>
                  <h3 className="font-fredoka" style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>
                    Collaborate in real time
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
                Invite teammates, leave comments, move ideas around, and build together instantly.
              </p>
              
              <div style={{
                marginTop: 'auto',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <div style={{ backgroundColor: '#10B981', color: '#FFFFFF', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>Alex</div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '11px', fontWeight: 600 }}>Let's build this!</div>
              </div>
            </div>

            {/* STEP 03 */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px',
              color: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '2px solid #38BDF8',
                  backgroundColor: '#E0F2FE',
                  color: '#0284C7',
                  fontSize: '18px',
                  fontWeight: 900
                }}>
                  03
                </div>
                <div>
                  <h3 className="font-fredoka" style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>
                    Turn ideas into action
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
                Use templates, organize sections, and turn your board into a presentation or client proposal.
              </p>
              
              <div style={{
                marginTop: 'auto',
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Scope</span>
                  <span style={{ backgroundColor: '#FEF08A', color: '#854D0E', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Plan</span>
                  <span style={{ backgroundColor: '#FCE7F3', color: '#9D174D', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Deliver</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Pill Bar (From Image 5) */}
          <div style={{
            marginTop: '48px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '24px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            color: '#0F172A',
            textAlign: 'left',
            boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>💡 Brainstorm</div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Capture every idea and see the big picture come to life.</p>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>👥 Align</div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Co-create with your team and stay on the same page.</p>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>📊 Present</div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Turn your boards into polished plans and share with confidence.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 5: FOOTER
         ============================================================ */}
      <footer style={{
        padding: '40px 24px',
        backgroundColor: '#FFFFFF',
        borderTop: '2px solid #E2E8F0',
        color: '#64748B',
        fontSize: '13px',
        fontWeight: 600
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-chewy" style={{ fontSize: '20px', color: '#0F172A' }}>Canvas</span>
            <span>&bull;</span>
            <span>Autonomiq Freelance Desk</span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={onLaunchWorkspace} style={{ color: '#00A3FF', fontWeight: 700 }}>
              Launch Workspace
            </button>
            <button onClick={onNavigateLogin} style={{ color: '#475569', fontWeight: 700 }}>
              Sign In
            </button>
            <button onClick={onNavigateRegister} style={{ color: '#475569', fontWeight: 700 }}>
              Get Started Free
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
