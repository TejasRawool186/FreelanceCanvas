import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BentoMetrics } from './components/BentoMetrics';
import { OpportunityList } from './components/OpportunityList';
import { ProposalDetail } from './components/ProposalDetail';
import { NewBriefModal } from './components/NewBriefModal';
import { OpportunityEditModal } from './components/OpportunityEditModal';
import { OpportunityIntelligenceView } from './components/OpportunityIntelligenceView';
import { ScopingStudio } from './components/ScopingStudio';
import { PortfolioManager } from './components/PortfolioManager';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { FinancialsHub } from './components/FinancialsHub';
import { AudioPlayerWidget } from './components/AudioPlayerWidget';
import { TimelineRail } from './components/TimelineRail';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { CanvasBoard } from './components/CanvasBoard';
import { OnboardingModal } from './components/OnboardingModal';
import { SettingsView } from './components/SettingsView';
import { SystemHealthModal } from './components/SystemHealthModal';
import { Opportunity, Proposal, FreelancerProfile, OpportunityIntelligence, Project } from './types';
import { Users, Headphones, Play, Sparkles, Building2, Plus, Volume2, ShieldCheck, Inbox, Target, FileText, Calculator, FolderKanban } from 'lucide-react';

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
  const [oppViewMode, setOppViewMode] = useState<'intelligence' | 'scoping' | 'proposal'>('intelligence');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [opportunityIntelligence, setOpportunityIntelligence] = useState<OpportunityIntelligence | null>(null);
  const [isRescoring, setIsRescoring] = useState<boolean>(false);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [caseStudyCount, setCaseStudyCount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [activeAudioProposalId, setActiveAudioProposalId] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [engineStatus, setEngineStatus] = useState<'healthy' | 'degraded' | 'offline'>('healthy');
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0 && !activeProjectId) {
          setActiveProjectId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    } finally {
      setLoadingProjects(false);
    }
  };

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

  const fetchIntelligence = async (oppId: string) => {
    try {
      const res = await fetch(`/api/opportunities/${oppId}/intelligence`);
      if (res.ok) {
        const data = await res.json();
        setOpportunityIntelligence(data);
      } else {
        setOpportunityIntelligence(null);
      }
    } catch (e) {
      console.error('Failed to fetch intelligence:', e);
      setOpportunityIntelligence(null);
    }
  };

  const handleRescoreOpportunity = async (oppId: string) => {
    setIsRescoring(true);
    try {
      const res = await fetch(`/api/opportunities/${oppId}/score`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOpportunityIntelligence(data);
        fetchOpportunities();
      }
    } catch (e) {
      console.error('Failed to rescore opportunity:', e);
    } finally {
      setIsRescoring(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (!data.onboarding_completed) {
          setIsOnboardingOpen(true);
        }
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

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setOnline(data.status !== 'unhealthy');
        setEngineStatus(data.status as 'healthy' | 'degraded' | 'offline');
      } else {
        setOnline(false);
        setEngineStatus('offline');
      }
    } catch {
      setOnline(false);
      setEngineStatus('offline');
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchProfile();
    fetchPortfolioCount();
    fetchProjects();
    checkHealth();
    const interval = setInterval(() => {
      fetchOpportunities();
      checkHealth();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedOppId) {
      fetchProposal(selectedOppId);
      fetchIntelligence(selectedOppId);
    }
  }, [selectedOppId]);

  const handleCreateBriefText = async (data: {
    title: string;
    company?: string;
    raw_content: string;
    budget_range?: string;
    deadline?: string;
    tech_stack?: string;
    source_url?: string;
    notes?: string;
    tags?: string;
    auto_analyze: boolean;
  }) => {
    const res = await fetch('/api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create brief');
    }
    const newOpp = await res.json();
    setOpportunities(prev => [newOpp, ...prev]);
    setSelectedOppId(newOpp.id);
    setActiveTab('briefs');
  };

  const handleCreateBriefFile = async (formData: FormData) => {
    const res = await fetch('/api/opportunities/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to upload document');
    }
    const newOpp = await res.json();
    setOpportunities(prev => [newOpp, ...prev]);
    setSelectedOppId(newOpp.id);
    setActiveTab('briefs');
  };

  const handleUpdateOpportunity = async (id: string, updatedData: Partial<Opportunity>) => {
    const res = await fetch(`/api/opportunities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update opportunity');
    }
    const updated = await res.json();
    setOpportunities(prev => prev.map(o => o.id === id ? updated : o));
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this opportunity? Any linked proposal will also be removed.')) {
      return;
    }
    try {
      const res = await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOpportunities(prev => prev.filter(o => o.id !== id));
        if (selectedOppId === id) {
          const remaining = opportunities.filter(o => o.id !== id);
          setSelectedOppId(remaining.length > 0 ? remaining[0].id : null);
          setProposal(null);
        }
      }
    } catch (e) {
      console.error('Failed to delete opportunity:', e);
    }
  };

  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  const handleGenerateProposal = async (oppId: string) => {
    setIsGeneratingProposal(true);
    try {
      const res = await fetch(`/api/proposals/generate/${oppId}`, { method: 'POST' });
      if (res.ok) {
        const propData = await res.json();
        setProposal(propData);
        fetchOpportunities();
      }
    } catch (e) {
      console.error('Failed to generate proposal:', e);
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const handleAnalyzeOpportunity = async (id: string) => {
    try {
      const res = await fetch(`/api/opportunities/${id}/analyze`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setOpportunities(prev => prev.map(o => o.id === id ? updated : o));
      }
    } catch (e) {
      console.error('Failed to trigger analysis:', e);
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
          bio: data.bio,
          onboarding_completed: true
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

  // Active Opportunity
  const activeOpp = opportunities.find(o => o.id === selectedOppId);

  // Derive unique real clients from ingested opportunities
  const uniqueClients = opportunities.reduce((acc: { company: string; count: number; opps: Opportunity[] }[], opp) => {
    const comp = opp.company || 'Direct Client';
    const existing = acc.find(c => c.company.toLowerCase() === comp.toLowerCase());
    if (existing) {
      existing.count += 1;
      existing.opps.push(opp);
    } else {
      acc.push({ company: comp, count: 1, opps: [opp] });
    }
    return acc;
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGoToLanding={() => setView('landing')}
        onSignOut={handleSignOut}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          onOpenNewBrief={() => setIsModalOpen(true)}
          online={online}
          engineStatus={engineStatus}
          onOpenDiagnostics={() => setIsHealthModalOpen(true)}
        />

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
                  onEdit={(opp) => setEditingOpp(opp)}
                  onDelete={handleDeleteOpportunity}
                  onAnalyze={handleAnalyzeOpportunity}
                />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {activeOpp && (
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      padding: '4px',
                      borderRadius: '10px',
                      border: '2px solid #000000',
                      boxShadow: '2px 2px 0px #000000',
                      width: 'fit-content'
                    }}>
                      <button
                        onClick={() => setOppViewMode('intelligence')}
                        style={{
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 800,
                          borderRadius: '6px',
                          border: oppViewMode === 'intelligence' ? '1.5px solid #000000' : 'none',
                          backgroundColor: oppViewMode === 'intelligence' ? '#BAE6FD' : 'transparent',
                          color: oppViewMode === 'intelligence' ? '#0369A1' : '#64748B',
                          boxShadow: oppViewMode === 'intelligence' ? '1.5px 1.5px 0px #000000' : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Target size={14} color="#0099FF" />
                        <span>AI Intelligence & Fit Scorecard</span>
                      </button>

                      <button
                        onClick={() => setOppViewMode('scoping')}
                        style={{
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 800,
                          borderRadius: '6px',
                          border: oppViewMode === 'scoping' ? '1.5px solid #000000' : 'none',
                          backgroundColor: oppViewMode === 'scoping' ? '#FEF08A' : 'transparent',
                          color: oppViewMode === 'scoping' ? '#854D0E' : '#64748B',
                          boxShadow: oppViewMode === 'scoping' ? '1.5px 1.5px 0px #000000' : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Calculator size={14} color="#D97706" />
                        <span>Scope, Estimation & WBS</span>
                      </button>

                      <button
                        onClick={() => setOppViewMode('proposal')}
                        style={{
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 800,
                          borderRadius: '6px',
                          border: oppViewMode === 'proposal' ? '1.5px solid #000000' : 'none',
                          backgroundColor: oppViewMode === 'proposal' ? '#DCFCE7' : 'transparent',
                          color: oppViewMode === 'proposal' ? '#15803D' : '#64748B',
                          boxShadow: oppViewMode === 'proposal' ? '1.5px 1.5px 0px #000000' : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FileText size={14} color="#16A34A" />
                        <span>Client Proposal & Milestones</span>
                      </button>
                    </div>
                  )}

                  {oppViewMode === 'intelligence' && activeOpp ? (
                    <OpportunityIntelligenceView
                      opportunity={activeOpp}
                      intelligence={opportunityIntelligence}
                      onRescore={() => handleRescoreOpportunity(activeOpp.id)}
                      isRescoring={isRescoring}
                    />
                  ) : oppViewMode === 'scoping' && activeOpp ? (
                    <ScopingStudio
                      opportunity={activeOpp}
                      profile={profile}
                      onEstimationUpdated={() => {
                        fetchOpportunities();
                        fetchProposal(activeOpp.id);
                      }}
                    />
                  ) : (
                    <ProposalDetail 
                      proposal={proposal} 
                      activeOpportunity={activeOpp}
                      onGenerateProposal={handleGenerateProposal}
                      isGeneratingProposal={isGeneratingProposal}
                      onPlayAudio={(propId) => setActiveAudioProposalId(propId)} 
                      onNavigateScoping={() => setOppViewMode('scoping')}
                      onLaunchProject={(pId) => {
                        fetchProjects();
                        setActiveProjectId(pId);
                        setActiveTab('projects');
                      }}
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'proposals' && (
            <ProposalDetail 
              proposal={proposal} 
              activeOpportunity={activeOpp}
              onGenerateProposal={handleGenerateProposal}
              isGeneratingProposal={isGeneratingProposal}
              onPlayAudio={(propId) => setActiveAudioProposalId(propId)} 
              onLaunchProject={(pId) => {
                fetchProjects();
                setActiveProjectId(pId);
                setActiveTab('projects');
              }}
            />
          )}

          {activeTab === 'projects' && (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {projects.length > 0 ? (
                <div>
                  {/* Project Selector Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 24px',
                    backgroundColor: '#FFFFFF',
                    borderBottom: '2px solid #000000',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FolderKanban size={18} color="#4F46E5" />
                      <span style={{ fontWeight: 800, fontSize: '13px' }}>Current Project:</span>
                      <select
                        value={activeProjectId || ''}
                        onChange={(e) => setActiveProjectId(e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '2px solid #000000',
                          fontWeight: 700,
                          fontSize: '13px',
                          backgroundColor: '#F8FAFC',
                          cursor: 'pointer'
                        }}
                      >
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.progress_percent}% done)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        const name = prompt('Enter project title:');
                        if (name) {
                          fetch('/api/projects', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: name })
                          }).then(res => res.json()).then(p => {
                            fetchProjects();
                            setActiveProjectId(p.id);
                          });
                        }
                      }}
                      className="btn-collab-primary"
                      style={{ fontSize: '12px', padding: '6px 14px' }}
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      <span>New Project</span>
                    </button>
                  </div>

                  {activeProjectId && (
                    <ProjectWorkspace 
                      projectId={activeProjectId} 
                      onBackToOpportunities={() => setActiveTab('briefs')}
                    />
                  )}
                </div>
              ) : (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <FolderKanban size={48} color="#94A3B8" style={{ margin: '0 auto 16px auto' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>No Active Projects Yet</h3>
                  <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '440px', margin: '8px auto 20px auto' }}>
                    Convert an accepted client proposal into an active execution workspace, or create a standalone Kanban board.
                  </p>
                  <button
                    onClick={() => {
                      const name = prompt('Enter project title:');
                      if (name) {
                        fetch('/api/projects', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ title: name })
                        }).then(res => res.json()).then(p => {
                          fetchProjects();
                          setActiveProjectId(p.id);
                        });
                      }
                    }}
                    className="btn-collab-primary"
                    style={{ fontSize: '13px', padding: '10px 20px' }}
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Create First Project</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'invoicing' && (
            <FinancialsHub 
              onNavigateToProjects={(pId) => {
                if (pId) setActiveProjectId(pId);
                setActiveTab('projects');
              }}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioManager
              profile={profile}
              onUpdateRate={handleUpdateRate}
              onAddCaseStudy={handleAddCaseStudy}
            />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsView
              profile={profile}
              onProfileUpdated={(updated) => setProfile(updated)}
              onRefreshOpportunities={fetchOpportunities}
            />
          )}

          {/* Client Intel Tab: Real Ingested Clients */}
          {activeTab === 'clients' && (
            <div className="card-collab" style={{ padding: '32px', position: 'relative' }}>
              <div className="scotch-tape" style={{ width: '60px', height: '20px', top: '-11px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 className="font-chewy" style={{ fontSize: '26px', margin: 0, letterSpacing: '0.02em' }}>
                    Client Directory & Ingested Prospects
                  </h2>
                  <p style={{ color: '#64748B', marginTop: '4px', fontSize: '13px' }}>
                    Authentic client records linked directly to your active proposals and briefs.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-collab-primary"
                  style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> New Client Brief
                </button>
              </div>

              {uniqueClients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                  <Inbox size={40} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                    No Clients Ingested Yet
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '380px', margin: '0 auto 16px auto' }}>
                    Add your first client RFP brief or load the sample demo dataset from Settings to explore.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-collab-primary"
                    style={{ fontSize: '13px', padding: '8px 18px' }}
                  >
                    Add First Client RFP
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {uniqueClients.map((client, idx) => (
                    <div
                      key={idx}
                      className="sticky-note"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #000',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '3px 3px 0px #000'
                      }}
                    >
                      <div className="scotch-tape" style={{ width: '40px', height: '14px', top: '-8px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Building2 size={18} color="#0099FF" />
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#000', margin: 0 }}>
                          {client.company}
                        </h3>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#0284C7', textTransform: 'uppercase', marginBottom: '10px' }}>
                        {client.count} Opportunity Brief{client.count > 1 ? 's' : ''} Ingested
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {client.opps.slice(0, 3).map((opp, i) => (
                          <div
                            key={i}
                            onClick={() => { setSelectedOppId(opp.id); setActiveTab('briefs'); }}
                            style={{
                              fontSize: '12px',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              cursor: 'pointer',
                              color: '#1E293B'
                            }}
                          >
                            <strong>{opp.title}</strong>
                            {opp.budget_range && <span style={{ color: '#16A34A', display: 'block', fontSize: '11px' }}>{opp.budget_range}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Audio Tab: Real Proposals with Audio */}
          {activeTab === 'audio' && (
            <div className="card-collab" style={{ padding: '32px', position: 'relative' }}>
              <div className="scotch-tape" style={{ width: '60px', height: '20px', top: '-11px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 className="font-chewy" style={{ fontSize: '26px', margin: 0, letterSpacing: '0.02em' }}>
                    Executive Audio Briefings Library
                  </h2>
                  <p style={{ color: '#64748B', marginTop: '4px', fontSize: '13px' }}>
                    Audio summaries synthesized via ElevenLabs for listening on the go.
                  </p>
                </div>
                <span className="tag-pill-popular">
                  <Headphones size={14} /> Audio Briefings
                </span>
              </div>

              {proposal && proposal.audio_path && proposal.audio_path.endsWith('.mp3') ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: '2px solid #000',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '2px 2px 0px #000'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button
                        onClick={() => setActiveAudioProposalId(proposal.id)}
                        className="btn-collab-primary"
                        style={{ width: '42px', height: '42px', padding: 0, borderRadius: '50%' }}
                        title="Play Executive Brief"
                      >
                        <Play size={18} fill="#000" />
                      </button>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                          {proposal.title}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                          {proposal.audio_path ? 'ElevenLabs Studio Stream Ready' : 'Browser Web Speech Synthesis Available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                  <Volume2 size={40} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                    No Active Proposal Selected
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '0 auto' }}>
                    Select an opportunity in the pipeline to listen to its executive audio brief with offline browser voice synthesis or ElevenLabs.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* New Opportunity Modal */}
      <NewBriefModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitText={handleCreateBriefText}
        onSubmitFile={handleCreateBriefFile}
      />

      {/* Opportunity Edit Modal */}
      <OpportunityEditModal
        isOpen={Boolean(editingOpp)}
        opportunity={editingOpp}
        onClose={() => setEditingOpp(null)}
        onSave={handleUpdateOpportunity}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(updated) => {
          setProfile(updated);
          setIsOnboardingOpen(false);
        }}
        initialProfile={profile}
      />

      {/* Audio Player Widget */}
      {activeAudioProposalId && (
        <AudioPlayerWidget
          proposalId={activeAudioProposalId}
          initialScript={proposal?.id === activeAudioProposalId ? proposal.audio_script : undefined}
          onClose={() => setActiveAudioProposalId(null)}
        />
      )}

      {/* System Diagnostics & Telemetry Modal */}
      <SystemHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
      />
    </div>
  );
};

export default App;
