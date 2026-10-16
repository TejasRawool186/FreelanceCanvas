import React from 'react';
import { Sparkles, Plus, Radio } from 'lucide-react';

interface HeaderProps {
  onOpenNewBrief: () => void;
  online: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewBrief, online }) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      backgroundColor: '#FFFFFF',
      borderBottom: '2px solid #000000',
      fontFamily: "'Fredoka', sans-serif"
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: '2px solid #000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '2px 2px 0px #000000'
        }}>
          <span className="font-chewy" style={{ fontSize: '20px', lineHeight: 1 }}>FC</span>
        </div>
        <div>
          <h1 className="font-chewy" style={{ fontSize: '24px', color: '#000000', margin: 0, letterSpacing: '0.02em' }}>
            FreelanceCanvas <span className="font-fredoka" style={{ fontSize: '15px', fontWeight: 600, color: '#64748B' }}>Visual Desk</span>
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '999px',
          border: '1.5px solid #000000',
          backgroundColor: online ? '#DCFCE7' : '#FEE2E2',
          fontSize: '12px',
          fontWeight: 800,
          color: online ? '#166534' : '#991B1B',
          boxShadow: '1.5px 1.5px 0px #000000'
        }}>
          <Radio size={14} className={online ? 'pulse-dot' : ''} />
          <span>{online ? 'Ollama & Qdrant Live' : 'Connecting Engine...'}</span>
        </div>

        <button
          id="header-ingest-btn"
          onClick={onOpenNewBrief}
          className="btn-collab-primary"
          style={{ padding: '9px 20px', fontSize: '13px' }}
        >
          <Plus size={16} strokeWidth={3} />
          <span>Ingest Client Brief</span>
        </button>
      </div>
    </header>
  );
};
