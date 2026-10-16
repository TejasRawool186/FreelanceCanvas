import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface TimelineRailProps {
  status: string;
}

export const TimelineRail: React.FC<TimelineRailProps> = ({ status }) => {
  const steps = [
    { id: 'ingest', label: 'Brief Ingested' },
    { id: 'recon', label: 'Client Recon' },
    { id: 'rag', label: 'Vector Match' },
    { id: 'synth', label: 'Proposal Ready' }
  ];

  const getStepActive = (idx: number) => {
    if (status === 'completed') return true;
    if (status === 'analyzing') return idx <= 2;
    return idx === 0;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 24px',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '2px solid #000000',
      boxShadow: '3px 3px 0px #000000',
      marginBottom: '24px',
      fontFamily: "'Fredoka', sans-serif"
    }}>
      {steps.map((s, i) => {
        const active = getStepActive(i);
        return (
          <React.Fragment key={s.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: active ? '#DCFCE7' : '#F1F5F9',
                border: '1.5px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: active ? '#166534' : '#94A3B8'
              }}>
                {active ? (
                  <CheckCircle2 size={14} strokeWidth={2.5} />
                ) : (
                  <Circle size={10} />
                )}
              </div>
              <span style={{ fontSize: '13px', fontWeight: active ? 800 : 600, color: active ? '#0F172A' : '#64748B' }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: '3px',
                backgroundColor: active ? '#0099FF' : '#E2E8F0',
                borderRadius: '2px',
                margin: '0 12px'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
