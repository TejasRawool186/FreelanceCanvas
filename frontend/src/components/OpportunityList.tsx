import React, { useState } from 'react';
import { Opportunity } from '../types';
import { Clock, CheckCircle2, AlertCircle, Loader2, ArrowRight, Search } from 'lucide-react';

interface OpportunityListProps {
  opportunities: Opportunity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const OpportunityList: React.FC<OpportunityListProps> = ({ opportunities, selectedId, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: Opportunity['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="tag-pill-free" style={{ gap: '4px' }}>
            <CheckCircle2 size={12} strokeWidth={2.5} /> Ready
          </span>
        );
      case 'analyzing':
        return (
          <span className="tag-pill-used" style={{ gap: '4px' }}>
            <Loader2 size={12} className="pulse-dot" /> Analyzing
          </span>
        );
      case 'failed':
        return (
          <span className="tag-pill-popular" style={{ gap: '4px' }}>
            <AlertCircle size={12} strokeWidth={2.5} /> Error
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#4B5563', background: '#F3F4F6', padding: '3px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  const filteredOpps = opportunities.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.company && o.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="card-collab" style={{ padding: '24px', position: 'relative' }}>
      <div className="scotch-tape" style={{ width: '50px', height: '18px', top: '-10px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="font-chewy" style={{ fontSize: '22px', margin: 0, letterSpacing: '0.02em' }}>
          Client Briefs Pipeline
        </h2>
        <span style={{
          fontSize: '11px',
          fontWeight: 800,
          backgroundColor: '#0F172A',
          color: '#FFF',
          padding: '2px 8px',
          borderRadius: '999px'
        }}>
          {opportunities.length} Total
        </span>
      </div>

      {/* Search Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#FFFFFF',
        border: '2px solid #000000',
        borderRadius: '8px',
        padding: '6px 12px',
        marginBottom: '16px',
        boxShadow: '2px 2px 0px #000000'
      }}>
        <Search size={15} color="#64748B" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter briefs or companies..."
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            fontFamily: 'inherit',
            width: '100%',
            backgroundColor: 'transparent'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredOpps.map((opp) => {
          const isSelected = selectedId === opp.id;
          return (
            <div
              key={opp.id}
              onClick={() => onSelect(opp.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '12px',
                backgroundColor: isSelected ? '#BAE6FD' : '#FFFFFF',
                border: '2px solid #000000',
                boxShadow: isSelected ? '3px 3px 0px #000000' : '1.5px 1.5px 0px #000000',
                cursor: 'pointer',
                transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ flex: 1, paddingRight: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {opp.title}
                  </h3>
                  {getStatusBadge(opp.status)}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                  {opp.budget_range && <span>💰 {opp.budget_range}</span>}
                  {opp.deadline && <span>⏳ {opp.deadline}</span>}
                  <span>📝 {opp.source_type}</span>
                </div>
              </div>

              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isSelected ? '#0099FF' : '#F1F5F9',
                border: '1.5px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSelected ? '#FFFFFF' : '#0F172A'
              }}>
                <ArrowRight size={14} strokeWidth={2.5} />
              </div>
            </div>
          );
        })}

        {opportunities.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#64748B', fontSize: '13px', fontWeight: 600 }}>
            No briefs ingested yet. Click "+ Ingest Client Brief" to start!
          </div>
        )}
      </div>
    </div>
  );
};
