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
import { Opportunity, Proposal, FreelancerProfile } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('briefs');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
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
      console.error(e);
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
      console.error(e);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        setProfile(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchProfile();
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
      }
    } catch (e) {
      console.error(e);
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
      console.error(e);
    }
  };

  const handleAddCaseStudy = async (title: string, content: string, tech_stack: string[]) => {
    try {
      await fetch('/api/profile/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tech_stack })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const activeOpp = opportunities.find(o => o.id === selectedOppId);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header onOpenNewBrief={() => setIsModalOpen(true)} online={online} />

        <div style={{ padding: '32px', flex: 1 }}>
          <BentoMetrics opportunities={opportunities} proposals={proposal ? [proposal] : []} profile={profile} />

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
            <div style={{ backgroundColor: '#FFF', padding: '32px', borderRadius: 'var(--radius-xl)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Client Contacts & Intel</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '13px' }}>
                Client background intelligence gathered via autonomous SerpApi reconnaissance.
              </p>
            </div>
          )}

          {activeTab === 'audio' && (
            <div style={{ backgroundColor: '#FFF', padding: '32px', borderRadius: 'var(--radius-xl)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Executive Audio Briefings</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '13px' }}>
                Generated audio executive summaries ready for offline review.
              </p>
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

// Decoupled modal state triggers

// Smooth tab transitions

// Disconnection recovery handler
