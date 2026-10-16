import React, { useState } from 'react';
import { FreelancerProfile } from '../types';
import { Layers, Plus, Save, Sparkles, Database } from 'lucide-react';

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      
      {/* Rate Card & Bio Panel */}
      <div className="card-collab" style={{ padding: '28px', position: 'relative' }}>
        <div className="scotch-tape" style={{ width: '50px', height: '18px', top: '-10px' }} />
        
        <h2 className="font-chewy" style={{ fontSize: '22px', margin: '0 0 16px 0', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="#0099FF" /> Freelancer Rate Card & Bio
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Target Hourly Rate ($/hr)
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="input-collab"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Executive Bio & Philosophy
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-collab"
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            onClick={handleSaveRate}
            className="btn-collab-primary"
            style={{ width: '100%', marginTop: '4px' }}
          >
            <Save size={16} strokeWidth={2.5} />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </div>

      {/* Index Case Study Panel */}
      <div className="card-collab" style={{ padding: '28px', position: 'relative' }}>
        <div className="scotch-tape" style={{ width: '50px', height: '18px', top: '-10px' }} />

        <h2 className="font-chewy" style={{ fontSize: '22px', margin: '0 0 16px 0', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={20} color="#10B981" /> Index New Case Study into Qdrant
        </h2>

        <form onSubmit={handleAddCase} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Case Study Title
            </label>
            <input
              type="text"
              required
              value={csTitle}
              onChange={(e) => setCsTitle(e.target.value)}
              placeholder="e.g. Edge IoT Telemetry Pipeline"
              className="input-collab"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Tech Stack (comma-separated)
            </label>
            <input
              type="text"
              value={csTech}
              onChange={(e) => setCsTech(e.target.value)}
              placeholder="FastAPI, Python, Docker, Qdrant"
              className="input-collab"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Project Scope & Results
            </label>
            <textarea
              required
              rows={3}
              value={csContent}
              onChange={(e) => setCsContent(e.target.value)}
              placeholder="Describe what you built and outcomes..."
              className="input-collab"
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            className="btn-collab-dark"
            style={{ width: '100%', marginTop: '4px' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Index Vector Embedding</span>
          </button>
        </form>
      </div>
    </div>
  );
};
