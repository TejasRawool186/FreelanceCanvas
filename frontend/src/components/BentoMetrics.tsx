import React from 'react';
import { Opportunity, Proposal, FreelancerProfile } from '../types';
import { DollarSign, Inbox, FileCheck, Layers } from 'lucide-react';

interface BentoMetricsProps {
  opportunities: Opportunity[];
  proposals: Proposal[];
  profile: FreelancerProfile | null;
  caseStudyCount: number;
}

export const BentoMetrics: React.FC<BentoMetricsProps> = ({ opportunities, proposals, profile, caseStudyCount }) => {
  const cards = [
    {
      title: 'Active Briefs',
      value: opportunities.length,
      sub: opportunities.length > 0 
        ? `${opportunities.filter(o => o.status === 'completed').length} analyzed & scoped`
        : 'Ready to ingest RFP briefs',
      bg: '#FEF08A',
      border: '#000000',
      text: '#854D0E',
      icon: Inbox
    },
    {
      title: 'Generated Proposals',
      value: proposals.length,
      sub: proposals.length > 0
        ? `${proposals.filter(p => p.status === 'ready').length} client proposals ready`
        : 'Synthesized after analysis',
      bg: '#FBCFE8',
      border: '#000000',
      text: '#9D174D',
      icon: FileCheck
    },
    {
      title: 'Billable Rate Card',
      value: profile?.hourly_rate ? `$${profile.hourly_rate}/hr` : 'Set Rate',
      sub: profile?.title || 'Independent Consultant',
      bg: '#BBF7D0',
      border: '#000000',
      text: '#166534',
      icon: DollarSign
    },
    {
      title: 'Vector Knowledge Base',
      value: `${caseStudyCount} ${caseStudyCount === 1 ? 'Case Study' : 'Case Studies'}`,
      sub: caseStudyCount > 0 ? 'Indexed in local Qdrant memory' : 'Add past work in Portfolio tab',
      bg: '#BAE6FD',
      border: '#000000',
      text: '#0369A1',
      icon: Layers
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    }}>
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="sticky-note"
            style={{
              backgroundColor: c.bg,
              border: '2px solid #000000',
              boxShadow: '4px 4px 0px #000000',
              padding: '24px 22px 18px 22px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '130px',
              position: 'relative'
            }}
          >
            {/* Mini Scotch Tape */}
            <div className="scotch-tape" style={{ width: '48px', height: '18px', top: '-11px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-fredoka" style={{ fontSize: '13px', fontWeight: 800, color: c.text }}>{c.title}</span>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.6)',
                border: '1.5px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={16} color="#000000" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="font-chewy" style={{ fontSize: '36px', color: '#000000', letterSpacing: '0.02em', lineHeight: 1.1 }}>
                {c.value}
              </div>
              <div className="font-fredoka" style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)', marginTop: '4px', fontWeight: 600 }}>
                {c.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
