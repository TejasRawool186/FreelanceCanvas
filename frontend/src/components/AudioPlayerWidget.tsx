import React, { useState } from 'react';
import { Volume2, X, Play, Pause, Sparkles } from 'lucide-react';

interface AudioPlayerWidgetProps {
  audioPath: string | null;
  onClose: () => void;
}

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({ audioPath, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);

  if (!audioPath) return null;

  return (
    <div className="card-collab" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: '#FEF08A',
      color: '#0F172A',
      padding: '16px 20px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      zIndex: 1000,
      minWidth: '340px',
      fontFamily: "'Fredoka', sans-serif"
    }}>
      {/* Mini Scotch Tape */}
      <div className="scotch-tape" style={{ width: '46px', height: '16px', top: '-9px' }} />

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#0099FF',
          border: '2px solid #000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '2px 2px 0px #000000',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        {isPlaying ? (
          <Pause size={18} color="#FFFFFF" strokeWidth={2.5} />
        ) : (
          <Play size={18} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: '2px' }} />
        )}
      </button>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
          Executive Audio Briefing
        </div>
        <div style={{ fontSize: '11px', color: '#854D0E', fontWeight: 600 }}>
          {isPlaying ? 'Playing • Away Mode AI Voice' : 'Paused • Click to resume'}
        </div>
        {/* Simple playback bar */}
        <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '2px', marginTop: '6px' }}>
          <div style={{ height: '100%', width: isPlaying ? '65%' : '40%', backgroundColor: '#0099FF', borderRadius: '2px' }} />
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '1.5px solid #000',
          backgroundColor: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <X size={14} color="#0F172A" strokeWidth={2.5} />
      </button>
    </div>
  );
};
