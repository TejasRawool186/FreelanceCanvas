import React from 'react';
import { Volume2, X } from 'lucide-react';

interface AudioPlayerWidgetProps {
  audioPath: string | null;
  onClose: () => void;
}

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({ audioPath, onClose }) => {
  if (!audioPath) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: 'var(--bg-sidebar)',
      color: '#FFF',
      padding: '16px 20px',
      borderRadius: 'var(--radius-xl)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 1000,
      minWidth: '320px'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent-pink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Volume2 size={18} color="#FFF" />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', fontWeight: 700 }}>Executive Audio Brief</div>
        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Away Mode Synthesis</div>
      </div>

      <button onClick={onClose} style={{ color: '#9CA3AF' }}>
        <X size={16} />
      </button>
    </div>
  );
};
