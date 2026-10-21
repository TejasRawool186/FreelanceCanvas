import React from 'react';
import { Sparkles, Plus, Radio, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenNewBrief: () => void;
  online: boolean;
  engineStatus?: 'healthy' | 'degraded' | 'offline';
  onOpenDiagnostics?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewBrief,
  online,
  engineStatus = 'healthy',
  onOpenDiagnostics
}) => {
  const getBadgeStyle = () => {
    switch (engineStatus) {
      case 'healthy':
        return {
          bg: '#DCFCE7',
          color: '#166534',
          border: '#15803D',
          text: 'Engine: Healthy (AI Live)'
        };
      case 'degraded':
        return {
          bg: '#FEF3C7',
          color: '#92400E',
          border: '#D97706',
          text: 'Engine: Degraded (Fallbacks Active)'
        };
      default:
        return {
          bg: '#FEE2E2',
          color: '#991B1B',
          border: '#B91C1C',
          text: 'Backend Offline'
        };
    }
  };

  const badge = getBadgeStyle();

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
        <button
          type="button"
          onClick={onOpenDiagnostics}
          title="Click to view live subsystem telemetry and diagnostics"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            border: `1.5px solid #000000`,
            backgroundColor: badge.bg,
            fontSize: '12px',
            fontWeight: 800,
            color: badge.color,
            boxShadow: '1.5px 1.5px 0px #000000',
            cursor: 'pointer',
            transition: 'transform 0.1s ease'
          }}
          className="hover:scale-105 active:scale-95"
        >
          <Activity size={14} className={engineStatus === 'healthy' ? 'pulse-dot' : ''} />
          <span>{badge.text}</span>
        </button>

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
