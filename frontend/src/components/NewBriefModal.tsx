import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';

interface NewBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, company: string, raw_content: string) => void;
}

export const NewBriefModal: React.FC<NewBriefModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    onSubmit(title, company, content);
    setTitle('');
    setCompany('');
    setContent('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        width: '540px',
        maxWidth: '90vw'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Ingest Client Brief / RFP</h2>
          <button onClick={onClose}><X size={20} color="#6B7280" /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Project / Brief Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Real-Time Telematics & AI Fleet Dashboard"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginTop: '6px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Client Company (for Reconnaissance)</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. FleetPulse Global"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginTop: '6px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Requirements / Upwork Post / RFP Text</label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste requirements, discovery transcripts, or RFP details..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginTop: '6px'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--accent-pink)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '14px',
              marginTop: '8px'
            }}
          >
            Launch Autonomous Desk Pipeline
          </button>
        </form>
      </div>
    </div>
  );
};
