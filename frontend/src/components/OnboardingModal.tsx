import React, { useState } from 'react';
import { FreelancerProfile } from '../types';
import { Sparkles, User, DollarSign, Cpu, CheckCircle2, ArrowRight, ArrowLeft, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: FreelancerProfile) => void;
  initialProfile?: FreelancerProfile | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialProfile
}) => {
  const [step, setStep] = useState<number>(1);
  const [fullName, setFullName] = useState(initialProfile?.full_name || '');
  const [title, setTitle] = useState(initialProfile?.title || '');
  const [experienceYears, setExperienceYears] = useState<string>(
    initialProfile?.experience_years ? String(initialProfile.experience_years) : ''
  );
  const [skills, setSkills] = useState(initialProfile?.skills || '');
  const [categories, setCategories] = useState(
    initialProfile?.preferred_categories || 'Full-Stack Web, AI Agents, APIs & Microservices'
  );
  const [hourlyRate, setHourlyRate] = useState<string>(
    initialProfile?.hourly_rate ? String(initialProfile.hourly_rate) : '85'
  );
  const [currency, setCurrency] = useState(initialProfile?.currency || 'USD');
  const [timezone, setTimezone] = useState(
    initialProfile?.timezone || (Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || 'UTC')
  );
  const [hoursPerWeek, setHoursPerWeek] = useState<string>(
    initialProfile?.availability_hours_per_week ? String(initialProfile.availability_hours_per_week) : '40'
  );
  const [aiProvider, setAiProvider] = useState(initialProfile?.preferred_ai_provider || 'ollama');
  const [aiModel, setAiModel] = useState(initialProfile?.preferred_ai_model || 'gemma3:1b');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (isSkip = false) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        full_name: isSkip ? (fullName || 'Independent Consultant') : (fullName.trim() || 'Independent Consultant'),
        title: isSkip ? (title || 'Software Engineer') : (title.trim() || 'Software Engineer'),
        skills: skills.trim(),
        experience_years: experienceYears ? parseFloat(experienceYears) : null,
        preferred_categories: categories.trim(),
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : 0.0,
        currency: currency || 'USD',
        timezone: timezone || 'UTC',
        availability_hours_per_week: hoursPerWeek ? parseFloat(hoursPerWeek) : 40.0,
        preferred_ai_provider: aiProvider,
        preferred_ai_model: aiModel
      };

      const res = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Failed to save onboarding: ${res.statusText}`);
      }

      const updated = await res.json();
      onComplete(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving onboarding profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
    >
      <div
        className="card-collab"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '2px solid #0F172A',
          boxShadow: '6px 6px 0px #0F172A',
          padding: '32px',
          position: 'relative'
        }}
      >
        {/* Top Close / Skip */}
        <button
          onClick={() => handleSubmit(true)}
          title="Skip for now"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          Skip for now <X size={16} />
        </button>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '999px',
                backgroundColor: step >= s ? '#0099FF' : '#E2E8F0',
                transition: 'background-color 0.2s ease'
              }}
            />
          ))}
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px'
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Step 1: Identity & Role */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0099FF'
                }}
              >
                <User size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                  Welcome to FreelanceCanvas
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Step 1 of 3: Set up your freelancer or agency identity
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                  Full Name or Business Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan or Apex AI Studio"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-collab"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                  Professional Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full-Stack & AI Systems Architect"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-collab"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                  Years of Professional Experience (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  placeholder="e.g. 8"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="input-collab"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setStep(2)}
                disabled={!fullName.trim() && !title.trim()}
                className="btn-collab-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Next: Skills & Scope</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Skills & Project Types */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D97706'
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                  Core Skills & Project Focus
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Step 2 of 3: Used to score RFPs and match relevant portfolio experience
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                  Technical Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, FastAPI, TypeScript, React, Docker, PostgreSQL"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="input-collab"
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  We do not invent skills for you. Only listed technologies are matched against client requirements.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                  Preferred Project Categories
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack Web, AI Integrations, Microservices, Cloud Architecture"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  className="input-collab"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setStep(1)}
                className="btn-collab-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-collab-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Next: Pricing & Model</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pricing & AI Model */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16A34A'
                }}
              >
                <DollarSign size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                  Pricing & AI Settings
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Step 3 of 3: Deterministic proposal estimates rely on your hourly rate
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                  Hourly Rate *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', fontWeight: 800, color: '#64748B' }}>
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="95"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="input-collab"
                    style={{ width: '100%', paddingLeft: '28px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                  Currency
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                  Timezone
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                  Weekly Availability (Hrs)
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

            <div style={{ marginTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                Local AI Provider Engine
              </label>
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    Ollama Local Inference ({aiModel})
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Runs locally on http://localhost:11434 with zero data leak to third parties.
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    padding: '3px 8px',
                    borderRadius: '999px'
                  }}
                >
                  Offline Supported
                </span>
              </div>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setStep(2)}
                className="btn-collab-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="btn-collab-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0099FF',
                  color: '#FFFFFF'
                }}
              >
                <CheckCircle2 size={16} />
                <span>{isSubmitting ? 'Saving Profile...' : 'Complete & Launch Workspace'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
