import React, { useState } from 'react';
import { Opportunity } from '../types';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  Search, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Archive 
} from 'lucide-react';

interface OpportunityListProps {
  opportunities: Opportunity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit?: (opp: Opportunity) => void;
  onDelete?: (id: string) => void;
  onAnalyze?: (id: string) => void;
}

export const OpportunityList: React.FC<OpportunityListProps> = ({ 
  opportunities, 
  selectedId, 
  onSelect,
  onEdit,
  onDelete,
  onAnalyze
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusBadge = (status: Opportunity['status'] | string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="tag-pill-free" style={{ gap: '4px', fontSize: '10px' }}>
            <CheckCircle2 size={11} strokeWidth={2.5} /> Analyzed
          </span>
        );
      case 'analyzing':
        return (
          <span className="tag-pill-used" style={{ gap: '4px', fontSize: '10px', backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <Loader2 size={11} className="spin" /> Analyzing...
          </span>
        );
      case 'failed':
        return (
          <span className="tag-pill-popular" style={{ gap: '4px', fontSize: '10px', backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            <AlertCircle size={11} strokeWidth={2.5} /> Failed
          </span>
        );
      case 'archived':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748B', background: '#F1F5F9', padding: '2px 6px', borderRadius: '999px', fontSize: '10px', fontWeight: 700 }}>
            <Archive size={11} /> Archived
          </span>
        );
      case 'ready_for_analysis':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#854D0E', background: '#FEF08A', padding: '2px 6px', borderRadius: '999px', fontSize: '10px', fontWeight: 700 }}>
            <Sparkles size={11} /> Ready
          </span>
        );
      case 'draft':
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#4B5563', background: '#F3F4F6', padding: '2px 6px', borderRadius: '999px', fontSize: '10px', fontWeight: 700 }}>
            <Clock size={11} /> Draft
          </span>
        );
    }
  };

  const getFitBadge = (score?: number, rec?: string) => {
    if (score == null) return null;
    let bg = '#DCFCE7';
    let text = '#15803D';
    if (rec === 'Renegotiate') {
      bg = '#FEF3C7';
      text = '#B45309';
    } else if (rec === 'Skip') {
      bg = '#FFE4E6';
      text = '#BE123C';
    } else if (rec === 'Request Clarification') {
      bg = '#E0F2FE';
      text = '#0369A1';
    }

    return (
      <span style={{
        fontSize: '9px',
        fontWeight: 800,
        backgroundColor: bg,
        color: text,
        padding: '1px 6px',
        borderRadius: '4px',
        border: '1px solid currentColor'
      }}>
        🎯 {Math.round(score)}% {rec || 'Fit'}
      </span>
    );
  };

  const filteredOpps = opportunities.filter(o => {
    const matchesSearch = 
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.company && o.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && o.status === statusFilter;
  });

  return (
    <div className="card-collab" style={{ padding: '24px', position: 'relative' }}>
      <div className="scotch-tape" style={{ width: '50px', height: '18px', top: '-10px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="font-chewy" style={{ fontSize: '22px', margin: 0, letterSpacing: '0.02em' }}>
          Opportunities Pipeline
        </h2>
        <span style={{
          fontSize: '11px',
          fontWeight: 800,
          backgroundColor: '#0F172A',
          color: '#FFF',
          padding: '2px 8px',
          borderRadius: '999px'
        }}>
          {filteredOpps.length} of {opportunities.length}
        </span>
      </div>

      {/* Filter and Search Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FFFFFF',
          border: '2px solid #000000',
          borderRadius: '8px',
          padding: '6px 12px',
          flex: 1,
          boxShadow: '2px 2px 0px #000000'
        }}>
          <Search size={14} color="#64748B" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search briefs or clients..."
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              fontFamily: 'inherit',
              width: '100%',
              backgroundColor: 'transparent'
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-collab"
          style={{ width: '120px', padding: '6px 8px', fontSize: '12px' }}
        >
          <option value="all">All Status</option>
          <option value="draft">Drafts</option>
          <option value="analyzing">Analyzing</option>
          <option value="completed">Analyzed</option>
          <option value="failed">Failed</option>
          <option value="archived">Archived</option>
        </select>
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
                flexDirection: 'column',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: isSelected ? '#BAE6FD' : '#FFFFFF',
                border: '2px solid #000000',
                boxShadow: isSelected ? '3px 3px 0px #000000' : '1.5px 1.5px 0px #000000',
                cursor: 'pointer',
                transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {opp.title}
                    </h3>
                    {getStatusBadge(opp.status)}
                    {getFitBadge(opp.fit_score, opp.recommendation)}
                    {opp.is_demo && (
                      <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: '#FEF08A', color: '#854D0E', padding: '1px 5px', borderRadius: '4px' }}>
                        DEMO
                      </span>
                    )}
                  </div>
                  {opp.company && (
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                      Client: {opp.company}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                    {opp.budget_range && <span>💰 {opp.budget_range}</span>}
                    {opp.deadline && <span>⏳ {opp.deadline}</span>}
                    <span>📝 {opp.source_type}</span>
                  </div>
                </div>

                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#0099FF' : '#F1F5F9',
                    border: '1.5px solid #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#FFFFFF' : '#0F172A',
                    flexShrink: 0
                  }}
                >
                  <ArrowRight size={13} strokeWidth={2.5} />
                </div>
              </div>

              {/* Action Toolbar on Opportunity Card */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '6px',
                  paddingTop: '6px',
                  borderTop: '1px dashed #E2E8F0'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {onAnalyze && (opp.status === 'draft' || opp.status === 'ready_for_analysis' || opp.status === 'failed') && (
                  <button
                    onClick={() => onAnalyze(opp.id)}
                    title="Analyze brief with AI"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #000',
                      backgroundColor: '#FEF08A',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={11} color="#000" /> Analyze
                  </button>
                )}

                {onEdit && (
                  <button
                    onClick={() => onEdit(opp)}
                    title="Edit brief details"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #000',
                      backgroundColor: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={11} /> Edit
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => onDelete(opp.id)}
                    title="Delete opportunity"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '3px 6px',
                      borderRadius: '6px',
                      border: '1.5px solid #DC2626',
                      backgroundColor: '#FFFFFF',
                      color: '#DC2626',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredOpps.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B', fontSize: '13px', fontWeight: 600 }}>
            No opportunities match your filter.
          </div>
        )}
      </div>
    </div>
  );
};
