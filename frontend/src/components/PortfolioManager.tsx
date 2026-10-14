import React, { useState } from 'react';
import { FreelancerProfile } from '../types';
import { Layers, Plus, Save } from 'lucide-react';

interface PortfolioManagerProps {
  profile: FreelancerProfile | null;
  onUpdateRate: (rate: number, bio: string) => void;
  onAddCaseStudy: (title: string, content: string, tech: string[]) => void;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({ profile, onUpdateRate, onAddCaseStudy }) => {
  const [rate, setRate] = useState(profile?.hourly_rate || 140);
  const [bio, setBio] = useState(profile?.bio || '');
  const [csTitle, setCsTitle] = useState('');
  const [csContent, setCsContent] = useState('');
  const [csTech, setCsTech] = useState('');

  const handleSaveRate = () => {
    onUpdateRate(rate, bio);
    alert('Profile rate and bio updated!');
  };

  const handleAddCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csTitle || !csContent) return;
    onAddCaseStudy(csTitle, csContent, csTech.split(',').map(s => s.trim()));
    setCsTitle('');
    setCsContent('');
    setCsTech('');
    alert('Case study added to local Qdrant Vector Store!');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div style={{ backgroundColor: '#FFF', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Freelancer Rate Card & Bio</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Target Hourly Rate ($)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '4px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Executive Bio & Philosophy</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '4px' }}
            />
          </div>
          <button
            onClick={handleSaveRate}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: 'var(--accent-black)', color: '#FFF', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
          >
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#FFF', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Index New Case Study into Qdrant</h2>
        <form onSubmit={handleAddCase} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Case Study Title</label>
            <input
              type="text"
              required
              value={csTitle}
              onChange={(e) => setCsTitle(e.target.value)}
              placeholder="e.g. Edge IoT Telemetry Pipeline"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '4px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Tech Stack (comma-separated)</label>
            <input
              type="text"
              value={csTech}
              onChange={(e) => setCsTech(e.target.value)}
              placeholder="FastAPI, Python, Docker, Qdrant"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '4px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Project Scope & Results</label>
            <textarea
              required
              rows={3}
              value={csContent}
              onChange={(e) => setCsContent(e.target.value)}
              placeholder="Describe what you built and outcomes..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginTop: '4px' }}
            />
          </div>
          <button
            type="submit"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: 'var(--accent-indigo)', color: '#FFF', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
          >
            <Plus size={16} /> Index Case Study
          </button>
        </form>
      </div>
    </div>
  );
};
