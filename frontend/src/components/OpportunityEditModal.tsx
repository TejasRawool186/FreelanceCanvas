import React, { useState, useEffect } from 'react';
import { Opportunity } from '../types';
import { X, Save, FileText, CheckCircle2 } from 'lucide-react';

interface OpportunityEditModalProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onSave: (id: string, updatedData: Partial<Opportunity>) => Promise<void>;
}

export const OpportunityEditModal: React.FC<OpportunityEditModalProps> = ({
  isOpen,
  opportunity,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [deadline, setDeadline] = useState('');
  const [techStack, setTechStack] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<Opportunity['status']>('draft');
  const [rawContent, setRawContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (opportunity) {
      setTitle(opportunity.title || '');
      setCompany(opportunity.company || '');
      setBudgetRange(opportunity.budget_range || '');
      setDeadline(opportunity.deadline || '');
      setTechStack(opportunity.tech_stack || '');
      setSourceUrl((opportunity as any).source_url || '');
      setNotes((opportunity as any).notes || '');
      setTags((opportunity as any).tags || '');
      setStatus(opportunity.status || 'draft');
      setRawContent(opportunity.raw_content || '');
    }
  }, [opportunity]);

  if (!isOpen || !opportunity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Opportunity title is required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      await onSave(opportunity.id, {
        title: title.trim(),
        company: company.trim() || undefined,
        budget_range: budgetRange.trim() || undefined,
        deadline: deadline.trim() || undefined,
        tech_stack: techStack.trim() || undefined,
        raw_content: rawContent.trim(),
        status
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update opportunity.');
    } finally {
      setIsSaving(false);
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
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '2px solid #0F172A',
          boxShadow: '6px 6px 0px #0F172A',
          padding: '28px',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText size={22} color="#0099FF" />
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
            Edit Opportunity Brief
          </h3>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
              Opportunity Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-collab"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Client / Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Telematics"
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="input-collab"
                style={{ width: '100%' }}
              >
                <option value="draft">Draft</option>
                <option value="ready_for_analysis">Ready for Analysis</option>
                <option value="analyzing">Analyzing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Budget Range
              </label>
              <input
                type="text"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                placeholder="e.g. $8,000 - $12,000"
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Target Deadline
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. 4 weeks or Q3"
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
              Required Technologies / Tech Stack
            </label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="e.g. Python, FastAPI, React, Docker"
              className="input-collab"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
              Full Client Brief / Requirements Text *
            </label>
            <textarea
              rows={6}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              className="input-collab"
              style={{ width: '100%', resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-collab-secondary"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-collab-primary"
              style={{ fontSize: '13px', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
