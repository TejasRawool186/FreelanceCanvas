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
      sub: `${opportunities.filter(o => o.status === 'completed').length} analyzed`,
      bg: 'var(--pastel-yellow)',
      text: 'var(--pastel-yellow-dark)',
      icon: Inbox
    },
    {
      title: 'Generated Proposals',
      value: proposals.length,
      sub: `${proposals.filter(p => p.status === 'ready').length} ready for client`,
      bg: 'var(--pastel-pink)',
      text: 'var(--pastel-pink-dark)',
      icon: FileCheck
    },
    {
      title: 'Billable Rate Card',
      value: `$${profile?.hourly_rate || 140}/hr`,
      sub: profile?.title || 'Senior Consultant',
      bg: 'var(--pastel-green)',
      text: 'var(--pastel-green-dark)',
      icon: DollarSign
    },
    {
      title: 'Matched Vector Portfolio',
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
      gap: '16px',
      marginBottom: '28px'
    }}>
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            style={{
              backgroundColor: c.bg,
              padding: '20px 24px',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '110px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: c.text }}>{c.title}</span>
              <Icon size={18} color={c.text} />
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                {c.value}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.5)', marginTop: '2px', fontWeight: 500 }}>
                {c.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
