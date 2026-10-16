import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BentoMetrics } from './components/BentoMetrics';
import { OpportunityList } from './components/OpportunityList';
import { ProposalDetail } from './components/ProposalDetail';
import { NewBriefModal } from './components/NewBriefModal';
import { PortfolioManager } from './components/PortfolioManager';
import { AudioPlayerWidget } from './components/AudioPlayerWidget';
import { TimelineRail } from './components/TimelineRail';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { CanvasBoard } from './components/CanvasBoard';
import { Opportunity, Proposal, FreelancerProfile } from './types';
import { Users, Headphones, Play, Sparkles, Building2, Globe, ShieldCheck } from 'lucide-react';

type ViewMode = 'landing' | 'login' | 'register' | 'workspace';

export const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(() => {
    const savedUser = localStorage.getItem('freelancecanvas_user') || localStorage.getItem('autonomiq_user');
    return savedUser ? 'workspace' : 'landing';
  });
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('freelancecanvas_user') || localStorage.getItem('autonomiq_user');
  });

  const [activeTab, setActiveTab] = useState('canvas');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [caseStudyCount, setCaseStudyCount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  const fetchOpportunities = async () => {
    try {
      const res = await fetch('/api/opportunities');
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data);
        if (data.length > 0 && !selectedOppId) {
          setSelectedOppId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch opportunities:', e);
    }
  };

  const fetchProposal = async (oppId: string) => {
    try {
      const res = await fetch(`/api/proposals/opportunity/${oppId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setProposal(data[0]);
        } else {
          setProposal(null);
        }
      }
    } catch (e) {
      console.error('Failed to fetch proposal:', e);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        setProfile(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch profile:', e);
    }
  };

  const fetchPortfolioCount = async () => {
    try {
      const res = await fetch('/api/profile/portfolio');
      if (res.ok) {
        const data = await res.json();
        setCaseStudyCount(data.count ?? (data.items ? data.items.length : 0));
      }
    } catch (e) {
      console.error('Failed to fetch portfolio count:', e);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchProfile();
    fetchPortfolioCount();
    const interval = setInterval(fetchOpportunities, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedOppId) {
      fetchProposal(selectedOppId);
    }
  }, [selectedOppId]);

  const handleCreateBrief = async (title: string, company: string, raw_content: string) => {
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, raw_content })
      });
      if (res.ok) {
        const newOpp = await res.json();
        setOpportunities(prev => [newOpp, ...prev]);
        setSelectedOppId(newOpp.id);
        setActiveTab('briefs');
      }
    } catch (e) {
      console.error('Failed to create brief:', e);
    }
  };

  const handleUpdateRate = async (rate: number, bio: string) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourly_rate: rate, bio })
      });
      if (res.ok) {
        setProfile(await res.json());
      }
    } catch (e) {
      console.error('Failed to update rate:', e);
    }
  };

  const handleAddCaseStudy = async (title: string, content: string, tech_stack: string[]) => {
    try {
      const res = await fetch('/api/profile/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tech_stack })
      });
      if (res.ok) {
        fetchPortfolioCount();
      }
    } catch (e) {
      console.error('Failed to index case study:', e);
    }
  };

  const handleLoginSuccess = (email: string) => {
    localStorage.setItem('freelancecanvas_user', email);
    setCurrentUser(email);
    setView('workspace');
  };

  const handleRegisterSuccess = async (data: {
    fullName: string;
    title: string;
    hourlyRate: number;
    email: string;
    skills: string;
    bio: string;
  }) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.fullName,
          title: data.title,
          hourly_rate: data.hourlyRate,
          skills: data.skills,
          bio: data.bio
        })
      });
      if (res.ok) {
        setProfile(await res.json());
      }
    } catch (e) {
      console.error('Error updating profile on registration:', e);
    }

    localStorage.setItem('freelancecanvas_user', data.email);
    setCurrentUser(data.email);
    setView('workspace');
  };

  const handleSignOut = () => {
    localStorage.removeItem('freelancecanvas_user');
    localStorage.removeItem('autonomiq_user');
    setCurrentUser(null);
    setView('landing');
  };

  // Render Public Landing Page
  if (view === 'landing') {
    return (
      <LandingPage
        onNavigateLogin={() => setView('login')}
        onNavigateRegister={() => setView('register')}
        onLaunchWorkspace={() => setView('workspace')}
        isLoggedIn={Boolean(currentUser)}
        freelancerName={profile?.full_name}
      />
    );
  }

  // Render Login Page
  if (view === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateRegister={() => setView('register')}
        onNavigateHome={() => setView('landing')}
      />
    );
  }

  // Render Register Page
  if (view === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={handleRegisterSuccess}
        onNavigateLogin={() => setView('login')}
        onNavigateHome={() => setView('landing')}
      />
    );
  }

  // Render Authenticated Consultant Workspace
  const activeOpp = opportunities.find(o => o.id === selectedOppId);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGoToLanding={() => setView('landing')}
        onSignOut={handleSignOut}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header onOpenNewBrief={() => setIsModalOpen(true)} online={online} />

        <div style={{ padding: '32px', flex: 1 }}>
          <BentoMetrics
            opportunities={opportunities}
            proposals={proposal ? [proposal] : []}
            profile={profile}
            caseStudyCount={caseStudyCount}
          />

          {activeTab === 'canvas' && (
            <CanvasBoard />
          )}

          {activeTab === 'briefs' && (
            <>
              {activeOpp && <TimelineRail status={activeOpp.status} />}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
                <OpportunityList
                  opportunities={opportunities}
                  selectedId={selectedOppId}
                  onSelect={(id) => setSelectedOppId(id)}
                />
                <ProposalDetail proposal={proposal} onPlayAudio={(path) => setActiveAudio(path)} />
              </div>
            </>
          )}

          {activeTab === 'proposals' && (
            <ProposalDetail proposal={proposal} onPlayAudio={(path) => setActiveAudio(path)} />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioManager
              profile={profile}
              onUpdateRate={handleUpdateRate}
              onAddCaseStudy={handleAddCaseStudy}
            />
          )}

          {activeTab === 'clients' && (
            <div className="card-collab" style={{ padding: '32px', position: 'relative' }}>
              <div className="scotch-tape" style={{ width: '60px', height: '20px', top: '-11px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 className="font-chewy" style={{ fontSize: '26px', margin: 0, letterSpacing: '0.02em' }}>
                    Client Contacts & Autonomous Recon
                  </h2>
                  <p style={{ color: '#64748B', marginTop: '4px', fontSize: '13px' }}>
                    Background intelligence gathered via autonomous SerpApi reconnaissance & public signals.
                  </p>
                </div>
                <span className="tag-pill-free">
                  <ShieldCheck size={14} /> Autonomous Recon Active
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {[
                  {
                    company: 'FleetPulse Global',
                    type: 'Logistics SaaS',
                    status: 'High Budget RFP ($45k+)',
                    intel: 'Migrating legacy monolith to FastAPI microservices. CTO values automated test coverage and sub-50ms latency.',
                    bg: '#BBF7D0',
                    text: '#166534'
                  },
                  {
                    company: 'DataStream Cloud',
                    type: 'Fintech Analytics',
                    status: 'Active RFP Review',
                    intel: 'Requires real-time streaming telemetry and SOC2 compliant audit logging.',
                    bg: '#BAE6FD',
                    text: '#0369A1'
                  },
                  {
                    company: 'HealthGrid Solutions',
                    type: 'Digital Health',
                    status: 'Follow-up Scheduled',
                    intel: 'Looking for senior architect to guide HIPAA-compliant vector search for medical records.',
                    bg: '#FEF08A',
                    text: '#854D0E'
                  }
                ].map((client, idx) => (
                  <div key={idx} className="sticky-note" style={{
                    backgroundColor: client.bg,
                    border: '2px solid #000',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '3px 3px 0px #000'
                  }}>
                    <div className="scotch-tape" style={{ width: '40px', height: '14px', top: '-8px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Building2 size={18} color="#000" />
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#000', margin: 0 }}>{client.company}</h3>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: client.text, textTransform: 'uppercase', marginBottom: '8px' }}>
                      {client.type} • {client.status}
                    </div>
                    <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#1E293B', margin: 0 }}>
                      {client.intel}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="card-collab" style={{ padding: '32px', position: 'relative' }}>
              <div className="scotch-tape" style={{ width: '60px', height: '20px', top: '-11px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 className="font-chewy" style={{ fontSize: '26px', margin: 0, letterSpacing: '0.02em' }}>
                    Executive Audio Briefings Library
                  </h2>
                  <p style={{ color: '#64748B', marginTop: '4px', fontSize: '13px' }}>
                    Autonomous Edge-TTS summaries ready for away-mode mobile listening.
                  </p>
                </div>
                <span className="tag-pill-popular">
                  <Headphones size={14} /> Touch Grass Mode
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  {
                    title: 'FleetPulse Global: Microservices Scope & Timeline',
                    duration: '4 min 12 sec',
                    date: 'Today, 10:45 AM',
                    desc: 'High-level synthesis covering milestone breakdown, estimated 160 billable hours, and risk register.'
                  },
                  {
                    title: 'HealthGrid: HIPAA Vector Retrieval Proposal Briefing',
                    duration: '3 min 20 sec',
                    date: 'Yesterday',
                    desc: 'Executive summary detailing Qdrant self-hosted deployment and role-based access control.'
                  }
                ].map((brief, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '2px solid #000',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '2px 2px 0px #000'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button
                        onClick={() => setActiveAudio('demo_audio.mp3')}
                        className="btn-collab-primary"
                        style={{ width: '42px', height: '42px', padding: 0, borderRadius: '50%' }}
                      >
                        <Play size={18} fill="#000" />
                      </button>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>{brief.title}</h4>
                        <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{brief.desc}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0099FF' }}>{brief.duration}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{brief.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <NewBriefModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBrief}
      />

      <AudioPlayerWidget
        audioPath={activeAudio}
        onClose={() => setActiveAudio(null)}
      />
    </div>
  );
};

export default App;
