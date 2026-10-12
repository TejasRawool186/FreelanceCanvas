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
      padding: '16px 24px',
      backgroundColor: '#FFF',
      borderRadius: 'var(--radius-xl)',
      marginBottom: '24px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {steps.map((s, i) => {
        const active = getStepActive(i);
        return (
          <React.Fragment key={s.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {active ? (
                <CheckCircle2 size={16} color="var(--pastel-green-dark)" />
              ) : (
                <Circle size={16} color="#9CA3AF" />
              )}
              <span style={{ fontSize: '12px', fontWeight: active ? 700 : 500, color: active ? 'var(--text-main)' : '#9CA3AF' }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', backgroundColor: active ? 'var(--pastel-green)' : 'var(--border-subtle)', margin: '0 12px' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
