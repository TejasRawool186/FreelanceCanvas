import React, { useState, useEffect } from 'react';
import { FreelancerProfile, CaseStudy, CaseStudySearchResult, PortfolioListResponse } from '../types';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  Cpu, 
  Layers, 
  Database,
  Quote,
  X,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface PortfolioManagerProps {
  profile: FreelancerProfile | null;
  onUpdateRate?: (rate: number, bio: string) => void;
  onAddCaseStudy?: (title: string, content: string, tech: string[]) => void;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'case_studies' | 'rag_tester'>('case_studies');
  const [portfolioData, setPortfolioData] = useState<PortfolioListResponse>({
    count: 0,
    items: [],
    industries: [],
    technologies: []
  });
  const [loading, setLoading] = useState(false);

  // Search playground state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CaseStudySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedCitationIdx, setCopiedCitationIdx] = useState<number | null>(null);

  // Modal State (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formIndustry, setFormIndustry] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formTech, setFormTech] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formOutcomes, setFormOutcomes] = useState('');
  const [formMetrics, setFormMetrics] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [formLink, setFormLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile/portfolio');
      if (res.ok) {
        const data = await res.json();
        setPortfolioData(data);
      }
    } catch (e) {
      console.error('Failed to load portfolio:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormIndustry('');
    setFormRole(profile?.title || 'Senior Software Consultant');
    setFormTech(profile?.skills || '');
    setFormSummary('');
    setFormOutcomes('');
    setFormMetrics('');
    setFormQuote('');
    setFormLink('');
    setIsModalOpen(true);
  };

  const openEditModal = (cs: CaseStudy) => {
    setEditingId(cs.id);
    setFormTitle(cs.title);
    setFormIndustry(cs.client_industry || '');
    setFormRole(cs.role || '');
    setFormTech(cs.tech_stack ? cs.tech_stack.join(', ') : '');
    setFormSummary(cs.summary || cs.content || '');
    setFormOutcomes(cs.outcomes ? cs.outcomes.join('\n') : '');
    const metricStr = cs.metrics ? Object.entries(cs.metrics).map(([k, v]) => `${k}: ${v}`).join(', ') : '';
    setFormMetrics(metricStr);
    setFormQuote(cs.testimonial_quote || '');
    setFormLink(cs.link_url || '');
    setIsModalOpen(true);
  };

  const handleSaveCaseStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSummary) return;

    setIsSubmitting(true);
    try {
      const techList = formTech.split(',').map(s => s.trim()).filter(Boolean);
      const outcomesList = formOutcomes.split('\n').map(s => s.trim()).filter(Boolean);
      
      const metricsObj: Record<string, string> = {};
      if (formMetrics) {
        formMetrics.split(',').forEach(part => {
          const [k, ...v] = part.split(':');
          if (k && v.length) {
            metricsObj[k.trim()] = v.join(':').trim();
          }
        });
      }

      const payload = {
        title: formTitle,
        client_industry: formIndustry,
        role: formRole,
        tech_stack: techList,
        summary: formSummary,
        outcomes: outcomesList,
        metrics: metricsObj,
        testimonial_quote: formQuote,
        link_url: formLink
      };

      if (editingId) {
        const res = await fetch(`/api/profile/portfolio/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update case study');
      } else {
        const res = await fetch('/api/profile/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create case study');
      }

      setIsModalOpen(false);
      await fetchPortfolio();
    } catch (err) {
      console.error(err);
      alert('Error saving case study.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCaseStudy = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete case study "${title}"?`)) return;
    try {
      const res = await fetch(`/api/profile/portfolio/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPortfolio();
      }
    } catch (e) {
      console.error('Failed to delete case study:', e);
    }
  };

  const handleRunRAGSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/profile/portfolio/search?query=${encodeURIComponent(searchQuery)}&limit=4`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (e) {
      console.error('Failed to run RAG search:', e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner Card */}
      <div className="card-collab" style={{ padding: '28px', position: 'relative' }}>
        <div className="scotch-tape" style={{ width: '60px', height: '18px', top: '-9px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="tag-pill-popular" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Database size={12} strokeWidth={2.5} /> Grounded Evidence (RAG)
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid #166534'
              }}>
                Lexical & Semantic Retrieval
              </span>
            </div>
            <h2 className="font-chewy" style={{ fontSize: '24px', margin: '0 0 6px 0', letterSpacing: '0.02em', color: '#0F172A' }}>
              Portfolio Case Studies & Verified Evidence
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontWeight: 600, maxWidth: '620px' }}>
              Store your past technical wins with verified outcomes and key performance metrics.
              Our RAG retrieval engine matches client RFP briefs against these entries to cite authentic proof in proposals.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={openAddModal}
              className="btn-collab-primary"
              style={{ fontSize: '13px', padding: '9px 18px' }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Case Study</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1.5px dashed #CBD5E1'
        }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Indexed Case Studies</span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{portfolioData.count}</div>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Industries Covered</span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{portfolioData.industries.length}</div>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Technologies Stacked</span>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{portfolioData.technologies.length}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '16px'
        }}>
          <button
            onClick={() => setActiveTab('case_studies')}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 800,
              border: 'none',
              borderBottom: activeTab === 'case_studies' ? '3px solid #0099FF' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'case_studies' ? '#0099FF' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Briefcase size={15} />
            <span>Case Studies Catalog ({portfolioData.count})</span>
          </button>

          <button
            onClick={() => setActiveTab('rag_tester')}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 800,
              border: 'none',
              borderBottom: activeTab === 'rag_tester' ? '3px solid #0099FF' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'rag_tester' ? '#0099FF' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={15} />
            <span>Interactive RAG Playground</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CASE STUDIES LIST */}
      {activeTab === 'case_studies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {portfolioData.items.length === 0 ? (
            <div className="card-collab" style={{ padding: '40px', textAlign: 'center' }}>
              <Briefcase size={32} color="#64748B" style={{ margin: '0 auto 12px' }} />
              <h3 className="font-chewy" style={{ fontSize: '18px', margin: '0 0 6px 0' }}>No Case Studies Yet</h3>
              <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '360px', margin: '0 auto 16px' }}>
                Add your first past project to enable the proposal engine to cite authentic evidence.
              </p>
              <button onClick={openAddModal} className="btn-collab-primary" style={{ fontSize: '12px', padding: '8px 16px', margin: '0 auto' }}>
                <Plus size={14} /> Add First Case Study
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
              {portfolioData.items.map((cs) => (
                <div
                  key={cs.id}
                  className="card-collab"
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #000000',
                    boxShadow: '3px 3px 0px #000000'
                  }}
                >
                  <div>
                    {/* Header: Industry & Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: '#E0F2FE',
                        color: '#0369A1',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #BAE6FD'
                      }}>
                        {cs.client_industry || 'Software Engineering'}
                      </span>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => openEditModal(cs)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748B',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                          title="Edit case study"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCaseStudy(cs.id, cs.title)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#DC2626',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                          title="Delete case study"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                      {cs.title}
                    </h3>
                    
                    {cs.role && (
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Role: {cs.role}
                      </div>
                    )}

                    {/* Summary */}
                    <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                      {cs.summary || cs.content}
                    </p>

                    {/* Tech Stack Badges */}
                    {cs.tech_stack && cs.tech_stack.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
                        {cs.tech_stack.map((t, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              backgroundColor: '#F1F5F9',
                              color: '#334155',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #E2E8F0'
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Outcomes List */}
                    {cs.outcomes && cs.outcomes.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B' }}>
                          Verified Outcomes:
                        </span>
                        {cs.outcomes.map((out, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: '#166534' }}>
                            <CheckCircle size={12} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{out}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Key Metrics Badges */}
                    {cs.metrics && Object.keys(cs.metrics).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {Object.entries(cs.metrics).map(([k, v], idx) => (
                          <div key={idx} style={{
                            fontSize: '11px',
                            backgroundColor: '#FEF08A',
                            border: '1px solid #CA8A04',
                            color: '#854D0E',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {k}: <strong>{v}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Testimonial Quote */}
                    {cs.testimonial_quote && (
                      <div style={{
                        padding: '8px 10px',
                        backgroundColor: '#F8FAFC',
                        borderLeft: '3px solid #0099FF',
                        fontSize: '11px',
                        fontStyle: 'italic',
                        color: '#475569',
                        marginBottom: '8px'
                      }}>
                        "{cs.testimonial_quote}"
                      </div>
                    )}
                  </div>

                  {/* Footer link */}
                  {cs.link_url && (
                    <div style={{ paddingTop: '8px', borderTop: '1px dashed #E2E8F0' }}>
                      <a
                        href={cs.link_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '11px',
                          color: '#0099FF',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ExternalLink size={12} /> View Live Project / Repo
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE RAG RETRIEVAL PLAYGROUND */}
      {activeTab === 'rag_tester' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="card-collab" style={{ padding: '24px' }}>
            <h3 className="font-chewy" style={{ fontSize: '18px', margin: '0 0 6px 0', letterSpacing: '0.02em', color: '#0F172A' }}>
              Semantic & Lexical Retrieval Playground
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748B' }}>
              Test how the AI retrieves relevant case studies from your portfolio when analyzing incoming RFPs.
            </p>

            <form onSubmit={handleRunRAGSearch} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. FastAPI PostgreSQL real-time streaming telemetry dashboard..."
                className="input-collab"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="btn-collab-primary"
                style={{ fontSize: '13px', padding: '8px 18px' }}
              >
                <Search size={14} className={isSearching ? 'spin-anim' : ''} />
                <span>{isSearching ? 'Searching...' : 'Test Retrieval'}</span>
              </button>
            </form>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                Ranked Grounded Matches ({searchResults.length})
              </h4>

              {searchResults.map((hit, idx) => (
                <div
                  key={idx}
                  className="card-collab"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '2px solid #000000',
                    boxShadow: '2.5px 2.5px 0px #000000'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        padding: '2px 8px',
                        borderRadius: '999px'
                      }}>
                        Rank #{idx + 1}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                        {hit.case_study.title}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 900,
                        backgroundColor: hit.relevance_score > 0.5 ? '#DCFCE7' : '#FEF3C7',
                        color: hit.relevance_score > 0.5 ? '#15803D' : '#B45309',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid currentColor'
                      }}>
                        {Math.round(hit.relevance_score * 100)}% Match
                      </span>
                    </div>
                  </div>

                  {/* Matched terms */}
                  {hit.matched_terms.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Matched Terms:</span>
                      {hit.matched_terms.map((t, i) => (
                        <span key={i} style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#E0F2FE', color: '#0369A1', padding: '1px 6px', borderRadius: '4px' }}>
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.4 }}>
                    {hit.case_study.summary}
                  </p>

                  {/* Citation preview */}
                  <div style={{
                    padding: '10px 12px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>
                      <strong>Evidence Citation:</strong> {hit.citation_preview}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(hit.citation_preview);
                        setCopiedCitationIdx(idx);
                        setTimeout(() => setCopiedCitationIdx(null), 2000);
                      }}
                      className="btn-collab-light"
                      style={{ fontSize: '11px', padding: '4px 8px', flexShrink: 0 }}
                    >
                      {copiedCitationIdx === idx ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                      <span>{copiedCitationIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ADD / EDIT CASE STUDY MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="card-collab" style={{
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={20} />
            </button>

            <h3 className="font-chewy" style={{ fontSize: '20px', margin: '0 0 16px 0', letterSpacing: '0.02em', color: '#0F172A' }}>
              {editingId ? 'Edit Portfolio Case Study' : 'Index New Portfolio Case Study'}
            </h3>

            <form onSubmit={handleSaveCaseStudy} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Real-Time Telemetry & Fleet Tracking API"
                  className="input-collab"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                    Client Industry
                  </label>
                  <input
                    type="text"
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    placeholder="e.g. Fintech, Healthcare, Logistics"
                    className="input-collab"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                    Your Role
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Principal Backend Architect"
                    className="input-collab"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  Tech Stack (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={formTech}
                  onChange={(e) => setFormTech(e.target.value)}
                  placeholder="Python, FastAPI, Redis, Docker, PostgreSQL"
                  className="input-collab"
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  Summary / Problem & Solution *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Describe the client's challenge and the architectural solution you engineered..."
                  className="input-collab"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  Verified Outcomes (one per line)
                </label>
                <textarea
                  rows={2}
                  value={formOutcomes}
                  onChange={(e) => setFormOutcomes(e.target.value)}
                  placeholder="Achieved zero downtime migration&#10;Reduced sensor anomaly false-positives by 45%"
                  className="input-collab"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  Measurable Key Metrics (comma-separated key:value)
                </label>
                <input
                  type="text"
                  value={formMetrics}
                  onChange={(e) => setFormMetrics(e.target.value)}
                  placeholder="latency: <30ms, throughput: 10k/sec, test_coverage: 95%"
                  className="input-collab"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                    Client Testimonial Quote
                  </label>
                  <input
                    type="text"
                    value={formQuote}
                    onChange={(e) => setFormQuote(e.target.value)}
                    placeholder="Short quote from client..."
                    className="input-collab"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                    Project URL / Repository
                  </label>
                  <input
                    type="url"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="https://github.com/..."
                    className="input-collab"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-collab-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-collab-primary"
                >
                  {isSubmitting ? 'Indexing...' : (editingId ? 'Update Case Study' : 'Save & Index Case Study')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
