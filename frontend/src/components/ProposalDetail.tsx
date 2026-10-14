import React, { useRef } from 'react';
import { Proposal, Milestone, RiskItem } from '../types';
import { Headphones, Download, FileText, CheckCircle, ShieldAlert } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ProposalDetailProps {
  proposal: Proposal | null;
  onPlayAudio: (audioPath: string) => void;
}

export const ProposalDetail: React.FC<ProposalDetailProps> = ({ proposal, onPlayAudio }) => {
  const proposalRef = useRef<HTMLDivElement>(null);

  if (!proposal) {
    return (
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: 'var(--radius-xl)',
        padding: '48px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '14px'
      }}>
        Select a brief from the pipeline to review the synthesized proposal.
      </div>
    );
  }

  let milestones: Milestone[] = [];
  try {
    if (proposal.milestones_json) {
      milestones = JSON.parse(proposal.milestones_json);
    }
  } catch (e) {}

  let risks: RiskItem[] = [];
  try {
    if (proposal.risk_register_json) {
      risks = JSON.parse(proposal.risk_register_json);
    }
  } catch (e) {}

  const exportPDF = async () => {
    if (!proposalRef.current) return;
    const canvas = await html2canvas(proposalRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${proposal.title.replace(/\s+/g, '_')}_proposal.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-pink)', textTransform: 'uppercase' }}>
            Ready Proposal
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{proposal.title}</h2>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Estimated Total: <strong style={{ color: 'var(--text-main)' }}>
              {proposal.price_estimate 
                ? `$${proposal.price_estimate.toLocaleString()}` 
                : (milestones.length > 0 ? `$${milestones.reduce((acc, m) => acc + (m.cost || 0), 0).toLocaleString()}` : 'Custom Scope')}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {proposal.audio_path && (
            <button
              onClick={() => onPlayAudio(proposal.audio_path!)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--pastel-yellow)',
                color: 'var(--pastel-yellow-dark)',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              <Headphones size={16} />
              <span>Listen to Brief</span>
            </button>
          )}

          <button
            onClick={exportPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--accent-black)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '13px'
            }}
          >
            <Download size={16} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div
        ref={proposalRef}
        style={{
          backgroundColor: '#FFF',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {milestones.length > 0 && (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} color="var(--pastel-green-dark)" /> Phased Milestones & Scope Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {milestones.map((m, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: 'var(--radius-lg)', backgroundColor: '#F9FAFB', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-indigo)' }}>{m.phase}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>{m.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    {m.est_hours} hrs • ${m.cost.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {risks.length > 0 && (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="#D97706" /> Risk Register & Mitigation Strategy
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {risks.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', fontSize: '13px' }}>
                  <strong style={{ color: '#92400E' }}>{r.risk} ({r.severity})</strong>
                  <span style={{ color: '#78350F' }}>{r.mitigation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--accent-pink)" /> Synthesized Proposal Document
          </h3>
          <div style={{
            padding: '24px',
            backgroundColor: '#FAFAFA',
            borderRadius: 'var(--radius-lg)',
            fontSize: '13px',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-mono)'
          }}>
            {proposal.content_markdown}
          </div>
        </div>
      </div>
    </div>
  );
};
