import React, { useRef } from 'react';
import { Proposal, Milestone, RiskItem } from '../types';
import { Headphones, Download, FileText, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';
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
      <div className="card-collab" style={{
        padding: '60px 32px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div className="scotch-tape" style={{ width: '60px', height: '20px', top: '-11px' }} />
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#E0F2FE',
          border: '2px solid #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '2px 2px 0px #000'
        }}>
          <FileText size={28} color="#0099FF" />
        </div>
        <h3 className="font-chewy" style={{ fontSize: '24px', margin: '0 0 6px 0', letterSpacing: '0.02em' }}>
          No Brief Selected
        </h3>
        <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>
          Select a client RFP brief from the pipeline on the left to review the AI synthesized proposal.
        </p>
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
      
      {/* Proposal Action Header Card */}
      <div className="card-collab" style={{
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'relative'
      }}>
        <div className="scotch-tape" style={{ width: '60px', height: '20px', top: '-11px' }} />

        <div>
          <span className="tag-pill-popular" style={{ marginBottom: '6px' }}>
            <Sparkles size={12} strokeWidth={2.5} /> Ready Proposal
          </span>
          <h2 className="font-chewy" style={{ fontSize: '24px', margin: '4px 0 2px 0', letterSpacing: '0.02em' }}>
            {proposal.title}
          </h2>
          <div style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>
            Estimated Total: <strong style={{ color: '#0F172A', fontSize: '16px' }}>
              {proposal.price_estimate 
                ? `$${proposal.price_estimate.toLocaleString()}` 
                : (milestones.length > 0 ? `$${milestones.reduce((acc, m) => acc + (m.cost || 0), 0).toLocaleString()}` : 'Custom Scope')}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {proposal.audio_path && (
            <button
              onClick={() => onPlayAudio(proposal.audio_path!)}
              className="btn-collab-primary"
              style={{ fontSize: '13px', padding: '9px 18px', backgroundColor: '#FEF08A' }}
            >
              <Headphones size={16} strokeWidth={2.5} />
              <span>Listen to Brief</span>
            </button>
          )}

          <button
            onClick={exportPDF}
            className="btn-collab-dark"
            style={{ fontSize: '13px', padding: '9px 18px' }}
          >
            <Download size={16} strokeWidth={2.5} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Document Frame */}
      <div
        ref={proposalRef}
        className="card-collab"
        style={{
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {milestones.length > 0 && (
          <div>
            <h3 className="font-chewy" style={{ fontSize: '20px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', letterSpacing: '0.02em' }}>
              <CheckCircle size={20} color="#166534" strokeWidth={2.5} /> Phased Milestones & Scope Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {milestones.map((m, i) => (
                <div key={i} style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: i % 2 === 0 ? '#E0F2FE' : '#FEF08A',
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0px #000000'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>{m.phase}</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px', color: '#000000' }}>{m.title}</div>
                  <div style={{ fontSize: '13px', color: '#334155', marginTop: '8px', fontWeight: 700 }}>
                    {m.est_hours} hrs • ${m.cost.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {risks.length > 0 && (
          <div>
            <h3 className="font-chewy" style={{ fontSize: '20px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', letterSpacing: '0.02em' }}>
              <ShieldAlert size={20} color="#D97706" strokeWidth={2.5} /> Risk Register & Mitigation Strategy
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {risks.map((r, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF3C7',
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                  fontSize: '13px'
                }}>
                  <strong style={{ color: '#92400E' }}>{r.risk} ({r.severity})</strong>
                  <span style={{ color: '#78350F', fontWeight: 600 }}>{r.mitigation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-chewy" style={{ fontSize: '20px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', letterSpacing: '0.02em' }}>
            <FileText size={20} color="#0099FF" strokeWidth={2.5} /> Synthesized Proposal Document
          </h3>
          <div style={{
            padding: '24px',
            backgroundColor: '#F8FAFC',
            border: '2px solid #000000',
            boxShadow: '3px 3px 0px #000000',
            borderRadius: '12px',
            fontSize: '13px',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            fontFamily: "'JetBrains Mono', monospace",
            color: '#0F172A'
          }}>
            {proposal.content_markdown}
          </div>
        </div>
      </div>
    </div>
  );
};
