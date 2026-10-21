import React, { useState, useEffect, useRef } from 'react';
import { Proposal, Milestone, RiskItem, Opportunity } from '../types';
import { 
  Headphones, 
  Download, 
  FileText, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles, 
  Calculator, 
  Edit3, 
  Eye, 
  Columns, 
  Save, 
  Printer, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  Archive, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  FolderKanban
} from 'lucide-react';

interface ProposalDetailProps {
  proposal: Proposal | null;
  activeOpportunity?: Opportunity | null;
  onGenerateProposal?: (oppId: string) => void;
  isGeneratingProposal?: boolean;
  onPlayAudio: (proposalId: string) => void;
  onNavigateScoping?: () => void;
  onProposalUpdated?: (updated: Proposal) => void;
  onLaunchProject?: (projectId: string) => void;
}

type EditorMode = 'preview' | 'split' | 'edit';

export const ProposalDetail: React.FC<ProposalDetailProps> = ({ 
  proposal, 
  activeOpportunity,
  onGenerateProposal,
  isGeneratingProposal = false,
  onPlayAudio, 
  onNavigateScoping,
  onProposalUpdated,
  onLaunchProject
}) => {
  const proposalRef = useRef<HTMLDivElement>(null);
  
  const [editorMode, setEditorMode] = useState<EditorMode>('preview');
  const [title, setTitle] = useState(proposal?.title || '');
  const [contentMarkdown, setContentMarkdown] = useState(proposal?.content_markdown || '');
  const [status, setStatus] = useState<string>(proposal?.status || 'draft');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Section Regeneration modal / popover
  const [isRegenOpen, setIsRegenOpen] = useState(false);
  const [regenSection, setRegenSection] = useState('executive_summary');
  const [regenInstructions, setRegenInstructions] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (proposal) {
      setTitle(proposal.title);
      setContentMarkdown(proposal.content_markdown);
      setStatus(proposal.status || 'draft');
    }
  }, [proposal?.id]);

  if (!proposal) {
    if (activeOpportunity) {
      return (
        <div className="card-collab" style={{
          padding: '48px 32px',
          textAlign: 'center',
          position: 'relative',
          backgroundColor: '#FFFFFF'
        }}>
          <div className="scotch-tape" style={{ width: '60px', height: '20px', top: '-11px' }} />
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#EEF2FF',
            border: '2px solid #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '3px 3px 0px #000'
          }}>
            <Sparkles size={32} color="#4F46E5" />
          </div>
          <span className="tag-pill-popular" style={{ backgroundColor: '#EDE9FE', color: '#6D28D9', borderColor: '#000', marginBottom: '8px' }}>
            Ready for Proposal Synthesis
          </span>
          <h3 className="font-chewy" style={{ fontSize: '26px', margin: '8px 0 6px 0', letterSpacing: '0.02em', color: '#0F172A' }}>
            Build Proposal for {activeOpportunity.title}
          </h3>
          <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
            Requirements and technical stack have been analyzed. Generate a comprehensive client-ready proposal complete with phased WBS deliverables, multi-tier pricing, and risk mitigations.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onGenerateProposal && onGenerateProposal(activeOpportunity.id)}
              disabled={isGeneratingProposal}
              className="btn-collab-primary"
              style={{
                fontSize: '14px',
                padding: '12px 24px',
                backgroundColor: '#A7F3D0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isGeneratingProposal ? 'not-allowed' : 'pointer'
              }}
            >
              {isGeneratingProposal ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Synthesizing Dynamic Proposal...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} strokeWidth={2.5} />
                  <span>⚡ Build Dynamic Proposal Now</span>
                </>
              )}
            </button>

            {onNavigateScoping && (
              <button
                onClick={onNavigateScoping}
                className="btn-collab-secondary"
                style={{
                  fontSize: '14px',
                  padding: '12px 20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Calculator size={16} strokeWidth={2.5} />
                <span>Open Scoping Studio & Pricing</span>
              </button>
            )}
          </div>
        </div>
      );
    }

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
          No Proposal Selected
        </h3>
        <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>
          Select a client brief from the pipeline on the left to review, customize, and export the proposal.
        </p>
      </div>
    );
  }

  let milestones: any[] = [];
  try {
    if (proposal.milestones_json) {
      milestones = JSON.parse(proposal.milestones_json);
    }
  } catch (e) {}

  let risks: any[] = [];
  try {
    if (proposal.risk_register_json) {
      risks = JSON.parse(proposal.risk_register_json);
    }
  } catch (e) {}

  const handleSaveProposal = async (statusOverride?: string) => {
    setIsSaving(true);
    setSaveStatusText(null);
    try {
      const payload: any = {
        title,
        content_markdown: contentMarkdown,
        status: statusOverride || status
      };

      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update proposal');
      const updated: Proposal = await res.json();
      if (onProposalUpdated) {
        onProposalUpdated(updated);
      }
      setSaveStatusText('Saved to server');
      setTimeout(() => setSaveStatusText(null), 3000);
    } catch (err: any) {
      setSaveStatusText('Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await handleSaveProposal(newStatus);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(contentMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintHTML = () => {
    window.open(`/api/proposals/${proposal.id}/export-html`, '_blank');
  };

  const handleRegenerateSection = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/regenerate-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_key: regenSection,
          custom_instructions: regenInstructions
        })
      });

      if (!res.ok) throw new Error('Failed to regenerate section');
      const updated: Proposal = await res.json();
      setContentMarkdown(updated.content_markdown);
      if (onProposalUpdated) {
        onProposalUpdated(updated);
      }
      setIsRegenOpen(false);
      setRegenInstructions('');
      setSaveStatusText(`Regenerated ${regenSection}`);
      setTimeout(() => setSaveStatusText(null), 3000);
    } catch (err: any) {
      alert(`Error regenerating section: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st.toLowerCase()) {
      case 'ready':
        return { bg: '#DBEAFE', color: '#1E40AF', text: 'Ready for Review' };
      case 'sent':
        return { bg: '#F3E8FF', color: '#6B21A8', text: 'Sent to Client' };
      case 'accepted':
        return { bg: '#DCFCE7', color: '#166534', text: 'Accepted & Won' };
      case 'archived':
        return { bg: '#F1F5F9', color: '#475569', text: 'Archived' };
      default:
        return { bg: '#FEF3C7', color: '#92400E', text: 'Draft Mode' };
    }
  };

  const [launchingProject, setLaunchingProject] = useState(false);

  const handleAcceptAndLaunchProject = async () => {
    if (!proposal) return;
    setLaunchingProject(true);
    try {
      const res = await fetch(`http://localhost:8000/api/proposals/${proposal.id}/accept-and-create-project`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to launch project workspace');
      const data = await res.json();
      setStatus('accepted');
      if (onLaunchProject) {
        onLaunchProject(data.project_id);
      } else {
        alert('Project workspace created successfully!');
      }
    } catch (err: any) {
      alert(`Error launching project: ${err.message}`);
    } finally {
      setLaunchingProject(false);
    }
  };

  const currentBadge = getStatusBadge(status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Studio Header Card */}
      <div className="card-collab" style={{
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'relative',
        backgroundColor: '#FFFFFF'
      }}>
        <div className="scotch-tape" style={{ width: '60px', height: '20px', top: '-11px' }} />

        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{
              padding: '3px 10px',
              borderRadius: '6px',
              backgroundColor: currentBadge.bg,
              color: currentBadge.color,
              fontSize: '11px',
              fontWeight: 800,
              border: '1.5px solid #000'
            }}>
              {currentBadge.text}
            </span>

            {/* Status Transition Selector */}
            <select
              value={status}
              onChange={e => handleStatusChange(e.target.value)}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1.5px solid #CBD5E1',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#FFFFFF',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <option value="draft">Status: Draft</option>
              <option value="ready">Status: Ready</option>
              <option value="sent">Status: Sent to Client</option>
              <option value="accepted">Status: Accepted</option>
              <option value="archived">Status: Archived</option>
            </select>

            {saveStatusText && (
              <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} color="#166534" /> {saveStatusText}
              </span>
            )}
          </div>

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => handleSaveProposal()}
            placeholder="Proposal Title..."
            style={{
              width: '100%',
              fontSize: '22px',
              fontWeight: 900,
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid transparent',
              color: '#0F172A',
              fontFamily: 'inherit'
            }}
            onFocus={e => e.target.style.borderColor = '#000'}
            onBlurCapture={e => e.target.style.borderColor = 'transparent'}
          />

          <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600, paddingLeft: '8px', marginTop: '2px' }}>
            Total Scope Investment: <strong style={{ color: '#166534', fontSize: '15px' }}>
              ${proposal.price_estimate ? proposal.price_estimate.toLocaleString() : '0.00'}
            </strong> • {milestones.length} Milestones
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* View Mode Toggle: Preview / Split / Edit */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            padding: '3px',
            borderRadius: '8px',
            border: '1.5px solid #000'
          }}>
            <button
              onClick={() => setEditorMode('preview')}
              title="Reader Preview"
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: editorMode === 'preview' ? '#FFFFFF' : 'transparent',
                boxShadow: editorMode === 'preview' ? '1px 1px 0px #000' : 'none',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setEditorMode('split')}
              title="Split Markdown & Preview"
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: editorMode === 'split' ? '#FFFFFF' : 'transparent',
                boxShadow: editorMode === 'split' ? '1px 1px 0px #000' : 'none',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Columns size={13} />
              <span>Split</span>
            </button>
            <button
              onClick={() => setEditorMode('edit')}
              title="Markdown Editor"
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: editorMode === 'edit' ? '#FFFFFF' : 'transparent',
                boxShadow: editorMode === 'edit' ? '1px 1px 0px #000' : 'none',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Edit3 size={13} />
              <span>Markdown</span>
            </button>
          </div>

          {/* Accept & Launch Project Execution Workspace */}
          <button
            onClick={handleAcceptAndLaunchProject}
            disabled={launchingProject}
            className="btn-collab-primary"
            style={{ 
              fontSize: '12px', 
              padding: '8px 14px', 
              backgroundColor: '#10B981', 
              color: '#FFFFFF' 
            }}
            title="Promote proposal into an active project workspace with decomposed tasks"
          >
            <FolderKanban size={14} strokeWidth={2.5} />
            <span>{launchingProject ? 'Launching...' : status === 'accepted' ? 'Project Board' : 'Launch Project'}</span>
          </button>

          {/* AI Section Regeneration Trigger */}
          <button
            onClick={() => setIsRegenOpen(true)}
            className="btn-collab-primary"
            style={{ fontSize: '12px', padding: '8px 14px', backgroundColor: '#EDE9FE', color: '#6D28D9' }}
          >
            <Sparkles size={14} strokeWidth={2.5} />
            <span>AI Section</span>
          </button>

          {/* WBS Scope Customizer Shortcut */}
          {onNavigateScoping && (
            <button
              onClick={onNavigateScoping}
              className="btn-collab-primary"
              style={{ fontSize: '12px', padding: '8px 14px', backgroundColor: '#FEF08A' }}
            >
              <Calculator size={14} strokeWidth={2.5} />
              <span>Edit WBS</span>
            </button>
          )}

          {/* Print / Selectable PDF Export */}
          <button
            onClick={handlePrintHTML}
            className="btn-collab-dark"
            style={{ fontSize: '12px', padding: '8px 14px' }}
          >
            <Printer size={14} strokeWidth={2.5} />
            <span>Print / PDF</span>
          </button>

          {/* Download Markdown */}
          <a
            href={`/api/proposals/${proposal.id}/download-markdown`}
            download
            className="btn-collab-dark"
            style={{ fontSize: '12px', padding: '8px 12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Download size={14} />
          </a>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            title="Copy Markdown"
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #000',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={14} color="#166534" /> : <Copy size={14} />}
          </button>

          <button
            onClick={() => onPlayAudio(proposal.id)}
            className="btn-collab-primary"
            style={{ fontSize: '12px', padding: '8px 12px', backgroundColor: '#FEF08A' }}
            title="Listen to Executive Audio Brief (ElevenLabs or Offline Web Speech)"
          >
            <Headphones size={14} />
            <span>Audio Brief</span>
          </button>

          {editorMode !== 'preview' && (
            <button
              onClick={() => handleSaveProposal()}
              disabled={isSaving}
              className="btn-collab-primary"
              style={{ fontSize: '12px', padding: '8px 16px', backgroundColor: '#A7F3D0' }}
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Section Regeneration Modal */}
      {isRegenOpen && (
        <div style={{
          padding: '20px 24px',
          borderRadius: '12px',
          backgroundColor: '#FFFFFF',
          border: '2px solid #000000',
          boxShadow: '4px 4px 0px #000000'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#6D28D9" /> Regenerate or Expand Proposal Section
            </h4>
            <button
              onClick={() => setIsRegenOpen(false)}
              style={{ background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', alignItems: 'flex-start' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Select Section:
              </label>
              <select
                value={regenSection}
                onChange={e => setRegenSection(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '2px solid #000',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                <option value="executive_summary">Executive Summary & Problem</option>
                <option value="architecture">Technical Architecture & Stack</option>
                <option value="milestones_wbs">Phased Milestones (WBS)</option>
                <option value="risk_mitigation">Risk Mitigation & QA</option>
                <option value="commercial_terms">Commercial Terms & SLAs</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Refinement Instructions (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Focus on high concurrency and Redis caching..."
                value={regenInstructions}
                onChange={e => setRegenInstructions(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <button
              onClick={() => setIsRegenOpen(false)}
              className="btn-collab-dark"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleRegenerateSection}
              disabled={isRegenerating}
              className="btn-collab-primary"
              style={{ fontSize: '12px', padding: '6px 16px', backgroundColor: '#EDE9FE', color: '#6D28D9' }}
            >
              <RefreshCw size={13} className={isRegenerating ? 'animate-spin' : ''} />
              <span>{isRegenerating ? 'Regenerating...' : 'Generate Section'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor & Document Body */}
      {editorMode === 'edit' ? (
        /* Markdown Editor Full */
        <div className="card-collab" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Markdown Document Editor
            </span>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
              Autosaves on blur or click Save
            </span>
          </div>
          <textarea
            value={contentMarkdown}
            onChange={e => setContentMarkdown(e.target.value)}
            onBlur={() => handleSaveProposal()}
            rows={22}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid #000',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#0F172A',
              backgroundColor: '#F8FAFC'
            }}
          />
        </div>
      ) : editorMode === 'split' ? (
        /* Split Screen: Editor Left, Live Preview Right */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card-collab" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
              Markdown Source
            </div>
            <textarea
              value={contentMarkdown}
              onChange={e => setContentMarkdown(e.target.value)}
              onBlur={() => handleSaveProposal()}
              rows={24}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '2px solid #000',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                lineHeight: 1.6,
                color: '#0F172A',
                backgroundColor: '#F8FAFC'
              }}
            />
          </div>

          <div className="card-collab" style={{ padding: '24px', backgroundColor: '#FFFFFF', maxHeight: '600px', overflowY: 'auto' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
              Live Document Preview
            </div>
            <div style={{
              fontSize: '13px',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              color: '#0F172A'
            }}>
              {contentMarkdown}
            </div>
          </div>
        </div>
      ) : (
        /* Full Document Reader View */
        <div
          ref={proposalRef}
          className="card-collab"
          style={{
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            backgroundColor: '#FFFFFF'
          }}
        >
          {/* Phased Milestones Breakdown Cards */}
          {milestones.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 className="font-chewy" style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', letterSpacing: '0.02em' }}>
                  <CheckCircle size={20} color="#166534" strokeWidth={2.5} /> Phased Milestones & Scope Breakdown
                </h3>
                {onNavigateScoping && (
                  <button
                    onClick={onNavigateScoping}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0099FF',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Calculator size={13} /> Customize Milestones
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {milestones.map((m: any, i) => (
                  <div key={i} style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: i % 2 === 0 ? '#E0F2FE' : '#FEF08A',
                    border: '2px solid #000000',
                    boxShadow: '2px 2px 0px #000000',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>{m.phase}</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#000000' }}>{m.title}</div>
                    <div style={{ fontSize: '13px', color: '#334155', fontWeight: 700, marginTop: '2px' }}>
                      {m.est_hours} hrs • ${Number(m.cost || m.total_cost || 0).toLocaleString()}
                    </div>
                    {m.deliverables && m.deliverables.length > 0 && (
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', borderTop: '1px dashed #94A3B8', paddingTop: '4px' }}>
                        {m.deliverables.slice(0, 2).map((d: string, di: number) => (
                          <div key={di}>• {d}</div>
                        ))}
                        {m.deliverables.length > 2 && <div style={{ fontStyle: 'italic' }}>+{m.deliverables.length - 2} more</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Mitigation Register */}
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
                    alignItems: 'center',
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

          {/* Proposal Document Body */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 className="font-chewy" style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', letterSpacing: '0.02em' }}>
                <FileText size={20} color="#0099FF" strokeWidth={2.5} /> Synthesized Proposal Document
              </h3>
              <button
                onClick={() => setEditorMode('edit')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0099FF',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Edit3 size={13} /> Edit Document Text
              </button>
            </div>
            
            <div style={{
              padding: '28px',
              backgroundColor: '#F8FAFC',
              border: '2px solid #000000',
              boxShadow: '3px 3px 0px #000000',
              borderRadius: '12px',
              fontSize: '13px',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#0F172A'
            }}>
              {contentMarkdown}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
