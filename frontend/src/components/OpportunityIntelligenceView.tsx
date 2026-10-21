import React, { useState } from 'react';
import { Opportunity, OpportunityIntelligence, ScoringFactor, ClarificationQuestion, DeliveryRisk } from '../types';
import { 
  Sparkles, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Copy, 
  Check, 
  Mail, 
  RefreshCw, 
  Layers, 
  ShieldAlert, 
  Clock, 
  DollarSign, 
  Cpu, 
  FileCheck 
} from 'lucide-react';

interface OpportunityIntelligenceViewProps {
  opportunity: Opportunity;
  intelligence: OpportunityIntelligence | null;
  onRescore: () => Promise<void>;
  isRescoring: boolean;
}

export const OpportunityIntelligenceView: React.FC<OpportunityIntelligenceViewProps> = ({
  opportunity,
  intelligence,
  onRescore,
  isRescoring
}) => {
  const [activeSection, setActiveSection] = useState<'scorecard' | 'requirements' | 'discovery'>('scorecard');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);

  // Parse from intelligence prop or opportunity json
  let intel: OpportunityIntelligence | null = intelligence;
  if (!intel && opportunity.requirements_json && opportunity.scoring_json) {
    try {
      intel = {
        opportunity_id: opportunity.id,
        title: opportunity.title,
        requirements: JSON.parse(opportunity.requirements_json),
        scoring: JSON.parse(opportunity.scoring_json),
        discovery: opportunity.clarification_questions_json ? JSON.parse(opportunity.clarification_questions_json) : {
          questions: [],
          client_email_draft: '',
          questionnaire_markdown: ''
        }
      };
    } catch (e) {
      console.error('Failed to parse opportunity intelligence JSON:', e);
    }
  }

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'Pursue':
        return (
          <span style={{
            fontSize: '13px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            border: '1.5px solid #166534',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <CheckCircle size={14} /> Pursue Proposal
          </span>
        );
      case 'Request Clarification':
        return (
          <span style={{
            fontSize: '13px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: '#E0F2FE',
            color: '#0369A1',
            border: '1.5px solid #0284C7',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <HelpCircle size={14} /> Request Clarification
          </span>
        );
      case 'Renegotiate':
        return (
          <span style={{
            fontSize: '13px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: '#FEF3C7',
            color: '#B45309',
            border: '1.5px solid #D97706',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <AlertTriangle size={14} /> Renegotiate Scope/Rate
          </span>
        );
      default:
        return (
          <span style={{
            fontSize: '13px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: '#FFE4E6',
            color: '#BE123C',
            border: '1.5px solid #E11D48',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <ShieldAlert size={14} /> Skip / High Risk
          </span>
        );
    }
  };

  const getFactorStatusColor = (status: string) => {
    switch (status) {
      case 'positive': return '#16A34A';
      case 'neutral': return '#0284C7';
      case 'warning': return '#D97706';
      case 'critical': return '#DC2626';
      default: return '#64748B';
    }
  };

  if (!intel) {
    return (
      <div className="card-collab" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <Sparkles size={36} color="#0099FF" style={{ margin: '0 auto 16px' }} />
        <h3 className="font-chewy" style={{ fontSize: '20px', margin: '0 0 8px 0' }}>
          Computing Opportunity Intelligence...
        </h3>
        <p style={{ color: '#64748B', fontSize: '13px', maxWidth: '400px', margin: '0 auto 16px' }}>
          Extracting structured requirements and calculating explainable fit scores against your profile.
        </p>
        <button
          onClick={onRescore}
          disabled={isRescoring}
          className="btn-collab-primary"
          style={{ fontSize: '13px', padding: '8px 18px', margin: '0 auto' }}
        >
          <RefreshCw size={14} className={isRescoring ? 'spin-anim' : ''} />
          <span>{isRescoring ? 'Analyzing...' : 'Generate Intelligence'}</span>
        </button>
      </div>
    );
  }

  const { requirements, scoring, discovery } = intel;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Header Card */}
      <div className="card-collab" style={{ padding: '24px', position: 'relative' }}>
        <div className="scotch-tape" style={{ width: '60px', height: '18px', top: '-9px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="tag-pill-popular" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Target size={12} strokeWidth={2.5} /> Opportunity Intelligence
              </span>
              {getRecommendationBadge(scoring.recommendation)}
            </div>
            <h2 className="font-chewy" style={{ fontSize: '22px', margin: '0 0 6px 0', letterSpacing: '0.02em', color: '#0F172A' }}>
              {opportunity.title}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontWeight: 600, maxWidth: '600px' }}>
              {scoring.summary}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              borderRadius: '12px',
              padding: '10px 18px',
              border: '2px solid #000000',
              boxShadow: '2px 2px 0px #000000'
            }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', fontWeight: 700 }}>
                Fit Score
              </span>
              <span style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>
                {Math.round(scoring.composite_score)}
                <span style={{ fontSize: '14px', color: '#64748B' }}>/100</span>
              </span>
            </div>

            <button
              onClick={onRescore}
              disabled={isRescoring}
              className="btn-collab-light"
              style={{ fontSize: '12px', padding: '9px 14px' }}
              title="Recalculate fit score against current profile rates and skills"
            >
              <RefreshCw size={14} className={isRescoring ? 'spin-anim' : ''} />
              <span>{isRescoring ? 'Re-scoring...' : 'Re-Score'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1.5px dashed #CBD5E1',
          paddingTop: '18px',
          marginTop: '16px'
        }}>
          <button
            onClick={() => setActiveSection('scorecard')}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 800,
              border: 'none',
              borderBottom: activeSection === 'scorecard' ? '3px solid #0099FF' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeSection === 'scorecard' ? '#0099FF' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Target size={15} />
            <span>Scorecard & Factors</span>
          </button>

          <button
            onClick={() => setActiveSection('requirements')}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 800,
              border: 'none',
              borderBottom: activeSection === 'requirements' ? '3px solid #0099FF' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeSection === 'requirements' ? '#0099FF' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={15} />
            <span>Extracted Specs ({requirements.functional_requirements.length + requirements.deliverables.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('discovery')}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 800,
              border: 'none',
              borderBottom: activeSection === 'discovery' ? '3px solid #0099FF' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeSection === 'discovery' ? '#0099FF' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Mail size={15} />
            <span>Client Discovery ({discovery.questions.length})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: SCORECARD & FACTORS */}
      {activeSection === 'scorecard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Factor Breakdown Bars */}
          <div className="card-collab" style={{ padding: '24px' }}>
            <h3 className="font-chewy" style={{ fontSize: '18px', margin: '0 0 16px 0', letterSpacing: '0.02em', color: '#0F172A' }}>
              Explainable Scoring Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {scoring.factors.map((factor, idx) => (
                <div key={idx} style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1.5px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                        {factor.name}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#E2E8F0',
                        color: '#475569',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {Math.round(factor.weight * 100)}% Weight
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 900,
                        color: getFactorStatusColor(factor.status)
                      }}>
                        {Math.round(factor.raw_score)} / 100
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                        (+{factor.weighted_score.toFixed(1)} pts)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#E2E8F0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: `${factor.raw_score}%`,
                      height: '100%',
                      backgroundColor: getFactorStatusColor(factor.status),
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                    {factor.explanation}
                  </p>
                </div>
              ))}
            </div>

            {scoring.risk_penalty > 0 && (
              <div style={{
                marginTop: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FECACA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={16} color="#DC2626" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B' }}>
                    Delivery Risk Deduction Applied
                  </span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#DC2626' }}>
                  -{scoring.risk_penalty} pts
                </span>
              </div>
            )}
          </div>

          {/* Reasons to Pursue vs Reasons to Caution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            <div className="card-collab" style={{ padding: '20px', backgroundColor: '#F0FDF4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <CheckCircle size={16} color="#16A34A" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#166534' }}>
                  Strategic Strengths
                </h4>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#14532D' }}>
                {scoring.reasons_to_pursue.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="card-collab" style={{ padding: '20px', backgroundColor: '#FFFBEB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <AlertTriangle size={16} color="#D97706" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#92400E' }}>
                  Points of Caution
                </h4>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#78350F' }}>
                {scoring.reasons_to_caution.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* SECTION 2: EXTRACTED REQUIREMENTS */}
      {activeSection === 'requirements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Detected Tech Stack */}
          {requirements.detected_tech_stack.length > 0 && (
            <div className="card-collab" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Cpu size={16} color="#0099FF" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                  Detected Technologies in RFP
                </h4>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {requirements.detected_tech_stack.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      backgroundColor: '#E0F2FE',
                      color: '#0369A1',
                      border: '1.5px solid #000000',
                      boxShadow: '1.5px 1.5px 0px #000000',
                      padding: '3px 10px',
                      borderRadius: '999px'
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Objectives & Deliverables Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            <div className="card-collab" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Target size={16} color="#0099FF" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                  Client Objectives
                </h4>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#334155' }}>
                {requirements.client_objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>

            <div className="card-collab" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <FileCheck size={16} color="#16A34A" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                  Key Deliverables
                </h4>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#334155' }}>
                {requirements.deliverables.map((del, idx) => (
                  <li key={idx}>{del}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* Functional & Non-Functional */}
          <div className="card-collab" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
              Functional & Architectural Requirements
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {requirements.functional_requirements.map((req, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#334155' }}>
                  <span style={{ color: '#0099FF', fontWeight: 900 }}>•</span>
                  <span>{req}</span>
                </div>
              ))}
            </div>

            {requirements.non_functional_requirements.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #CBD5E1' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B' }}>
                  Non-Functional Standards:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  {requirements.non_functional_requirements.map((nfr, idx) => (
                    <span key={idx} style={{ fontSize: '12px', color: '#475569' }}>
                      ⚡ {nfr}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Explicit Unknowns Alert Panel */}
          {requirements.unknowns.length > 0 && (
            <div className="card-collab" style={{
              padding: '20px',
              backgroundColor: '#FEF3C7',
              border: '2px solid #000000',
              boxShadow: '3px 3px 0px #000000'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <HelpCircle size={18} color="#D97706" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#92400E' }}>
                  Identified Unknowns & Ambiguities in RFP ({requirements.unknowns.length})
                </h4>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#78350F' }}>
                These critical specifications were omitted in the client brief. Resolving these via discovery questions prevents scope creep.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {requirements.unknowns.map((u, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#78350F', fontWeight: 600 }}>
                    <span>❓</span>
                    <span>{u}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Risk Register */}
          {requirements.delivery_risks.length > 0 && (
            <div className="card-collab" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <ShieldAlert size={16} color="#DC2626" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                  Delivery Risk Register
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {requirements.delivery_risks.map((risk, idx) => (
                  <div key={idx} style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                        {risk.risk}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        backgroundColor: risk.severity === 'High' ? '#FEE2E2' : '#FEF3C7',
                        color: risk.severity === 'High' ? '#DC2626' : '#D97706',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {risk.severity} Severity
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      <strong>Mitigation:</strong> {risk.mitigation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SECTION 3: CLIENT DISCOVERY ASSISTANT */}
      {activeSection === 'discovery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="card-collab" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 className="font-chewy" style={{ fontSize: '18px', margin: '0 0 4px 0', letterSpacing: '0.02em', color: '#0F172A' }}>
                  Targeted Clarification Questions
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                  Organized by category to establish scope boundaries before signing a binding contract.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => copyToClipboard(
                    discovery.questions.map(q => `[${q.category}] ${q.question}`).join('\n\n'),
                    setCopiedQuestions
                  )}
                  className="btn-collab-light"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  {copiedQuestions ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                  <span>{copiedQuestions ? 'Copied Questions!' : 'Copy Questions'}</span>
                </button>

                <button
                  onClick={() => copyToClipboard(discovery.client_email_draft, setCopiedEmail)}
                  className="btn-collab-primary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  {copiedEmail ? <Check size={14} /> : <Mail size={14} />}
                  <span>{copiedEmail ? 'Copied Email Draft!' : 'Copy Client Email'}</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {discovery.questions.map((q, idx) => (
                <div key={idx} style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0px #000000'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: '#E0F2FE',
                      color: '#0369A1',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {q.category}
                    </span>

                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: q.importance === 'High' ? '#DC2626' : '#64748B'
                    }}>
                      {q.importance} Priority
                    </span>
                  </div>

                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    {q.question}
                  </p>

                  <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>
                    <strong>Why it matters:</strong> {q.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Email Draft Preview */}
          <div className="card-collab" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={16} color="#0099FF" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                  Ready-to-Send Client Clarification Email Draft
                </h4>
              </div>

              <button
                onClick={() => copyToClipboard(discovery.client_email_draft, setCopiedEmail)}
                className="btn-collab-light"
                style={{ fontSize: '11px', padding: '5px 10px' }}
              >
                {copiedEmail ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
                <span>{copiedEmail ? 'Copied!' : 'Copy Draft'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={discovery.client_email_draft}
              style={{
                width: '100%',
                minHeight: '260px',
                padding: '16px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '12px',
                lineHeight: 1.5,
                color: '#0F172A',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

        </div>
      )}

    </div>
  );
};
