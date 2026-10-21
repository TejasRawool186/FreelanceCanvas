import React, { useState, useEffect } from 'react';
import { FreelancerProfile, IntegrationStatus } from '../types';
import { 
  User, 
  DollarSign, 
  Cpu, 
  Database, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

interface SettingsViewProps {
  profile: FreelancerProfile | null;
  onProfileUpdated: (updated: FreelancerProfile) => void;
  onRefreshOpportunities: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onProfileUpdated,
  onRefreshOpportunities
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'pricing' | 'integrations' | 'data'>('profile');

  // Form states
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [title, setTitle] = useState(profile?.title || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [skills, setSkills] = useState(profile?.skills || '');
  const [experienceYears, setExperienceYears] = useState(
    profile?.experience_years ? String(profile.experience_years) : ''
  );
  const [categories, setCategories] = useState(profile?.preferred_categories || '');

  // Pricing & Availability
  const [hourlyRate, setHourlyRate] = useState(profile?.hourly_rate ? String(profile.hourly_rate) : '0');
  const [currency, setCurrency] = useState(profile?.currency || 'USD');
  const [timezone, setTimezone] = useState(profile?.timezone || 'UTC');
  const [hoursPerWeek, setHoursPerWeek] = useState(
    profile?.availability_hours_per_week ? String(profile.availability_hours_per_week) : '40'
  );

  // Integrations state
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);

  // Status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [demoMessage, setDemoMessage] = useState('');

  // Sync profile when props update
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setTitle(profile.title || '');
      setBio(profile.bio || '');
      setSkills(profile.skills || '');
      setExperienceYears(profile.experience_years ? String(profile.experience_years) : '');
      setCategories(profile.preferred_categories || '');
      setHourlyRate(profile.hourly_rate ? String(profile.hourly_rate) : '0');
      setCurrency(profile.currency || 'USD');
      setTimezone(profile.timezone || 'UTC');
      setHoursPerWeek(profile.availability_hours_per_week ? String(profile.availability_hours_per_week) : '40');
    }
  }, [profile]);

  const fetchIntegrations = async () => {
    setLoadingIntegrations(true);
    try {
      const res = await fetch('/api/profile/integrations');
      if (res.ok) {
        setIntegrations(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch integrations:', e);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        full_name: fullName.trim(),
        title: title.trim(),
        bio: bio.trim(),
        skills: skills.trim(),
        experience_years: experienceYears ? parseFloat(experienceYears) : null,
        preferred_categories: categories.trim(),
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : 0.0,
        currency,
        timezone,
        availability_hours_per_week: hoursPerWeek ? parseFloat(hoursPerWeek) : 40.0
      };

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        onProfileUpdated(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDemo = async () => {
    try {
      const res = await fetch('/api/profile/demo/load', { method: 'POST' });
      const data = await res.json();
      setDemoMessage(data.message || 'Demo dataset loaded');
      onRefreshOpportunities();
      setTimeout(() => setDemoMessage(''), 4000);
    } catch (e) {
      console.error('Error loading demo:', e);
    }
  };

  const handleClearDemo = async () => {
    try {
      const res = await fetch('/api/profile/demo/clear', { method: 'POST' });
      const data = await res.json();
      setDemoMessage(data.message || 'Demo dataset removed');
      onRefreshOpportunities();
      setTimeout(() => setDemoMessage(''), 4000);
    } catch (e) {
      console.error('Error clearing demo:', e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Top Header Card */}
      <div
        className="card-collab"
        style={{
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          position: 'relative'
        }}
      >
        <div className="scotch-tape" style={{ width: '60px', height: '20px', top: '-11px' }} />
        <div>
          <h2 className="font-chewy" style={{ fontSize: '26px', margin: 0, letterSpacing: '0.02em', color: '#0F172A' }}>
            Consultant Workspace Settings
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
            Configure your professional profile, pricing baseline, local AI engines, and dataset preferences.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('profile')}
            className={activeTab === 'profile' ? 'btn-collab-primary' : 'btn-collab-secondary'}
            style={{ fontSize: '12px', padding: '7px 14px' }}
          >
            Profile & Skills
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={activeTab === 'pricing' ? 'btn-collab-primary' : 'btn-collab-secondary'}
            style={{ fontSize: '12px', padding: '7px 14px' }}
          >
            Pricing & Terms
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={activeTab === 'integrations' ? 'btn-collab-primary' : 'btn-collab-secondary'}
            style={{ fontSize: '12px', padding: '7px 14px' }}
          >
            AI Integrations
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={activeTab === 'data' ? 'btn-collab-primary' : 'btn-collab-secondary'}
            style={{ fontSize: '12px', padding: '7px 14px' }}
          >
            Demo & Storage
          </button>
        </div>
      </div>

      {/* Tab: Profile & Skills */}
      {activeTab === 'profile' && (
        <div className="card-collab" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={22} color="#0099FF" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Profile & Technical Brand</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                Full Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name or Agency Brand"
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                Professional Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
              Professional Bio & Executive Summary
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight your domain strengths, engineering methodology, and commercial track record..."
              className="input-collab"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
              Technical Skills & Tooling (Comma-separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Python, FastAPI, TypeScript, React, Docker, PostgreSQL, Qdrant"
              className="input-collab"
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
              Used by the AI intelligence pipeline to calculate skill compatibility score against incoming client briefs.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="e.g. 8"
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                Preferred Project Categories
              </label>
              <input
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder="e.g. Full-Stack Web, AI Agents, Microservices"
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            {saveSuccess && (
              <span style={{ color: '#16A34A', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={16} /> Profile saved successfully
              </span>
            )}
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="btn-collab-primary"
              style={{ padding: '9px 20px', fontSize: '13px' }}
            >
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Pricing & Terms */}
      {activeTab === 'pricing' && (
        <div className="card-collab" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={22} color="#16A34A" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Deterministic Commercial Pricing Engine</h3>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            FreelanceCanvas enforces deterministic arithmetic: all proposal estimates are mathematically calculated
            from estimated task hours multiplied by your configured hourly rate. No fabricated pricing.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                Default Hourly Billable Rate ($ / hr) *
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="input-collab"
                style={{ width: '100%', fontSize: '16px', fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                Billing Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-collab"
                style={{ width: '100%' }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                Operational Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                Weekly Capacity (Available Hours)
              </label>
              <input
                type="number"
                min="5"
                max="80"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            {saveSuccess && (
              <span style={{ color: '#16A34A', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={16} /> Pricing preferences saved
              </span>
            )}
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="btn-collab-primary"
              style={{ padding: '9px 20px', fontSize: '13px' }}
            >
              {isSaving ? 'Saving...' : 'Update Commercial Terms'}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Integrations & AI Engine */}
      {activeTab === 'integrations' && (
        <div className="card-collab" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={22} color="#8B5CF6" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>AI Engines & Integration Status</h3>
            </div>
            <button
              onClick={fetchIntegrations}
              disabled={loadingIntegrations}
              className="btn-collab-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={14} className={loadingIntegrations ? 'spin' : ''} /> Check Status
            </button>
          </div>

          {/* Ollama Status Card */}
          <div
            style={{
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #0F172A',
              backgroundColor: integrations?.ollama?.connected ? '#F0FDF4' : '#FEF2F2',
              boxShadow: '3px 3px 0px #0F172A'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '15px', color: '#0F172A' }}>
                  Local LLM Engine: Ollama ({integrations?.ollama?.model || 'gemma3:1b'})
                </strong>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  backgroundColor: integrations?.ollama?.connected ? '#DCFCE7' : '#FEE2E2',
                  color: integrations?.ollama?.connected ? '#166534' : '#991B1B'
                }}
              >
                {integrations?.ollama?.connected ? 'ONLINE & READY' : 'OFFLINE (DEGRADED)'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#334155', margin: '4px 0 10px 0', lineHeight: 1.5 }}>
              Endpoints: <code>{integrations?.ollama?.url || 'http://localhost:11434'}</code>. When Ollama is offline,
              FreelanceCanvas remains operational for manual brief evaluation and will not generate fabricated proposals.
            </p>
            {!integrations?.ollama?.connected && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #FECACA',
                  fontSize: '12px',
                  color: '#991B1B'
                }}
              >
                <strong>To start Ollama locally:</strong> Run <code>ollama run gemma3:1b</code> or launch Ollama Desktop.
              </div>
            )}
          </div>

          {/* External APIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>Client Web Recon (SerpApi)</strong>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: integrations?.serpapi?.configured ? '#DCFCE7' : '#F1F5F9',
                    color: integrations?.serpapi?.configured ? '#166534' : '#64748B'
                  }}
                >
                  {integrations?.serpapi?.configured ? 'CONFIGURED' : 'OPTIONAL (UNSET)'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                Used for autonomous client reconnaissance. When unset, research is omitted without faking company data.
              </p>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>Audio Briefings (ElevenLabs)</strong>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: integrations?.elevenlabs?.configured ? '#DCFCE7' : '#F1F5F9',
                    color: integrations?.elevenlabs?.configured ? '#166534' : '#64748B'
                  }}
                >
                  {integrations?.elevenlabs?.configured ? 'CONFIGURED' : 'OPTIONAL (UNSET)'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                Generates voice audio summaries for mobile listening. When unset, proposals are displayed in text.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Demo Data & Storage */}
      {activeTab === 'data' && (
        <div className="card-collab" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} color="#0099FF" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Data Storage & Demo Workspace</h3>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Manage sample data to test workflows, proposal generation, and export features without polluting your real client records.
          </p>

          {demoMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#E0F2FE',
                color: '#0369A1',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              {demoMessage}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #0F172A',
                backgroundColor: '#FFFFFF',
                boxShadow: '3px 3px 0px #0F172A',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={18} color="#D97706" />
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>Load Guided Demo Dataset</strong>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  Injects a clearly labeled <code>[DEMO]</code> opportunity, sample client brief, and ready-to-review technical proposal.
                </p>
              </div>
              <button
                onClick={handleLoadDemo}
                className="btn-collab-primary"
                style={{ fontSize: '12px', padding: '8px 16px' }}
              >
                Load Demo Dataset
              </button>
            </div>

            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #0F172A',
                backgroundColor: '#FFFFFF',
                boxShadow: '3px 3px 0px #0F172A',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Trash2 size={18} color="#DC2626" />
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>Remove Demo Records</strong>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  Permanently cleans all <code>[DEMO]</code> opportunities, proposals, and briefs while preserving your personal projects.
                </p>
              </div>
              <button
                onClick={handleClearDemo}
                className="btn-collab-dark"
                style={{ fontSize: '12px', padding: '8px 16px', backgroundColor: '#DC2626', borderColor: '#991B1B' }}
              >
                Clear Demo Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
