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
      bg: 'var(--pastel-yellow)',
      text: 'var(--pastel-yellow-dark)',
      icon: Inbox
    },
    {
      title: 'Generated Proposals',
      value: proposals.length,
      sub: proposals.length > 0
        ? `${proposals.filter(p => p.status === 'ready').length} client proposals ready`
        : 'Synthesized after analysis',
      bg: 'var(--pastel-pink)',
      text: 'var(--pastel-pink-dark)',
      icon: FileCheck
    },
    {
      title: 'Billable Rate Card',
      value: profile?.hourly_rate ? `$${profile.hourly_rate}/hr` : 'Set Rate',
      sub: profile?.title || 'Independent Consultant',
      bg: 'var(--pastel-green)',
      text: 'var(--pastel-green-dark)',
      icon: DollarSign
    },
    {
      title: 'Vector Knowledge Base',
      value: `${caseStudyCount} ${caseStudyCount === 1 ? 'Case Study' : 'Case Studies'}`,
      sub: caseStudyCount > 0 ? 'Indexed in local Qdrant memory' : 'Add past work in Portfolio tab',
      bg: 'var(--pastel-blue)',
      text: 'var(--pastel-blue-dark)',
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
              padding: '24px 22px 18px 22px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '120px',
              position: 'relative'
            }}
          >
            {/* Mini Scotch Tape */}
            <div className="scotch-tape" style={{ width: '44px', height: '16px', top: '-10px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-fredoka" style={{ fontSize: '13px', fontWeight: 700, color: c.text }}>{c.title}</span>
              <Icon size={18} color={c.text} />
            </div>
            <div>
              <div className="font-chewy" style={{ fontSize: '32px', color: 'var(--text-main)', letterSpacing: '0.02em', lineHeight: 1.1 }}>
                {c.value}
              </div>
              <div className="font-fredoka" style={{ fontSize: '12px', color: 'rgba(0,0,0,0.55)', marginTop: '4px', fontWeight: 600 }}>
                {c.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
