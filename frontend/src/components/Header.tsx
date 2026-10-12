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
          width: '36px',
          height: '36px',
          borderRadius: '12px',
          background: 'var(--accent-black)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF'
        }}>
          <Sparkles size={18} color="var(--accent-pink)" />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Autonomiq <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Freelance Desk</span>
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-pill)',
          background: online ? 'var(--pastel-green)' : '#FEE2E2',
          fontSize: '12px',
          fontWeight: 600,
          color: online ? 'var(--pastel-green-dark)' : '#991B1B'
        }}>
          <Radio size={14} className={online ? 'pulse-dot' : ''} />
          <span>{online ? 'Ollama & Qdrant Live' : 'Connecting Engine...'}</span>
        </div>

        <button
          onClick={onOpenNewBrief}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--accent-pink)',
            color: '#FFF',
            padding: '10px 20px',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 700,
            fontSize: '13px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Ingest Client Brief</span>
        </button>
      </div>
    </header>
  );
};
