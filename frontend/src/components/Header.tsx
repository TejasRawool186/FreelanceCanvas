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
      padding: '20px 32px',
      backgroundColor: 'var(--bg-canvas)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF'
        }}>
          <span className="font-chewy" style={{ fontSize: '24px', lineHeight: 1 }}>C</span>
        </div>
        <div>
          <h1 className="font-chewy" style={{ fontSize: '24px', color: '#0F172A', margin: 0, letterSpacing: '0.02em' }}>
            Autonomiq <span className="font-fredoka" style={{ fontSize: '16px', fontWeight: 600, color: '#64748B' }}>Freelance Desk</span>
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
          background: online ? '#DCFCE7' : '#FEE2E2',
          fontSize: '12px',
          fontWeight: 700,
          color: online ? '#15803D' : '#991B1B'
        }}>
          <Radio size={14} className={online ? 'pulse-dot' : ''} />
          <span>{online ? 'Ollama & Qdrant Live' : 'Connecting Engine...'}</span>
        </div>

        <button
          id="header-ingest-btn"
          onClick={onOpenNewBrief}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#00A3FF',
            color: '#000000',
            padding: '10px 22px',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '13px',
            boxShadow: '0 4px 12px rgba(0, 163, 255, 0.3)',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Ingest Client Brief</span>
        </button>
      </div>
    </header>
  );
};
