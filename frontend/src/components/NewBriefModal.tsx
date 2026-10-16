import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles } from 'lucide-react';

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
    <div className="modal-backdrop-blur" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '2px solid #000000',
        boxShadow: '6px 6px 0px #000000',
        padding: '36px',
        width: '560px',
        maxWidth: '100%',
        position: 'relative',
        fontFamily: "'Fredoka', sans-serif"
      }}>
        {/* Scotch Tape on Modal */}
        <div className="scotch-tape" style={{ width: '70px', height: '22px', top: '-13px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 className="font-chewy" style={{ fontSize: '26px', color: '#0F172A', margin: 0, letterSpacing: '0.02em' }}>
              Ingest Client Brief / RFP
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
              Autonomous recon & vector synthesis will generate proposal draft
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1.5px solid #000000',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} color="#0F172A" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Project / Brief Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Real-Time Telematics & AI Fleet Dashboard"
              className="input-collab"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Client Company (for Autonomous Reconnaissance)
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. FleetPulse Global"
              className="input-collab"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Requirements / Upwork Post / RFP Text *
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste requirements, discovery transcripts, or RFP details..."
              className="input-collab"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-collab-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-collab-primary"
              style={{ flex: 1.5 }}
            >
              <Sparkles size={16} strokeWidth={2.5} />
              <span>Launch Synthesis Engine</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
