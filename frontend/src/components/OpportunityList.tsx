import React from 'react';
import { Opportunity } from '../types';
import { Clock, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface OpportunityListProps {
  opportunities: Opportunity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const OpportunityList: React.FC<OpportunityListProps> = ({ opportunities, selectedId, onSelect }) => {
  const getStatusBadge = (status: Opportunity['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#166534', background: '#DCFCE7', padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
            <CheckCircle2 size={12} /> Ready
          </span>
        );
      case 'analyzing':
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#854D0E', background: '#FEF08A', padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
            <Loader2 size={12} className="pulse-dot" /> Analyzing
          </span>
        );
      case 'failed':
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#991B1B', background: '#FEE2E2', padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
            <AlertCircle size={12} /> Error
          </span>
        );
      default:
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4B5563', background: '#F3F4F6', padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  return (
    <div style={{ backgroundColor: '#FFF', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800 }}>Client Briefs Pipeline</h2>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opportunities.length} Total</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {opportunities.map((opp) => {
          const isSelected = selectedId === opp.id;
          return (
            <div
              key={opp.id}
              onClick={() => onSelect(opp.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isSelected ? 'var(--pastel-blue)' : '#F9FAFB',
                border: isSelected ? '1px solid #BAE6FD' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ flex: 1, paddingRight: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{opp.title}</h3>
                  {getStatusBadge(opp.status)}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {opp.budget_range && <span>💰 {opp.budget_range}</span>}
                  {opp.deadline && <span>⏳ {opp.deadline}</span>}
                  <span>📝 {opp.source_type}</span>
                </div>
              </div>

              <ArrowRight size={16} color={isSelected ? 'var(--accent-indigo)' : '#9CA3AF'} />
            </div>
          );
        })}

        {opportunities.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
            No briefs ingested yet. Click "+ Ingest Client Brief" to start!
          </div>
        )}
      </div>
    </div>
  );
};
