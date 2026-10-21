import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NewBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitText: (data: {
    title: string;
    company?: string;
    raw_content: string;
    budget_range?: string;
    deadline?: string;
    tech_stack?: string;
    source_url?: string;
    notes?: string;
    tags?: string;
    auto_analyze: boolean;
  }) => Promise<void>;
  onSubmitFile: (formData: FormData) => Promise<void>;
}

export const NewBriefModal: React.FC<NewBriefModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmitText,
  onSubmitFile
}) => {
  const [tab, setTab] = useState<'text' | 'file'>('text');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [content, setContent] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [deadline, setDeadline] = useState('');
  const [techStack, setTechStack] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = ['.pdf', '.txt', '.md', '.json'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validExtensions.includes(fileExt)) {
        setErrorMsg(`Unsupported file type '${fileExt}'. Please upload .pdf, .txt, .md, or .json`);
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 10MB limit.`);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Project title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'file') {
        if (!selectedFile) {
          setErrorMsg('Please select a valid brief file to upload.');
          setIsSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append('title', title.trim());
        if (company) formData.append('company', company.trim());
        if (budgetRange) formData.append('budget_range', budgetRange.trim());
        if (deadline) formData.append('deadline', deadline.trim());
        if (notes) formData.append('notes', notes.trim());
        if (tags) formData.append('tags', tags.trim());
        formData.append('auto_analyze', String(autoAnalyze));
        formData.append('file', selectedFile);

        await onSubmitFile(formData);
      } else {
        if (!content.trim()) {
          setErrorMsg('Client brief requirements text is required.');
          setIsSubmitting(false);
          return;
        }

        await onSubmitText({
          title: title.trim(),
          company: company.trim() || undefined,
          raw_content: content.trim(),
          budget_range: budgetRange.trim() || undefined,
          deadline: deadline.trim() || undefined,
          tech_stack: techStack.trim() || undefined,
          source_url: sourceUrl.trim() || undefined,
          notes: notes.trim() || undefined,
          tags: tags.trim() || undefined,
          auto_analyze: autoAnalyze
        });
      }

      // Reset
      setTitle('');
      setCompany('');
      setContent('');
      setSelectedFile(null);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating opportunity brief.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }}
    >
      <div
        className="card-collab"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '2px solid #0F172A',
          boxShadow: '6px 6px 0px #0F172A',
          padding: '28px',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '16px' }}>
          <h2 className="font-chewy" style={{ fontSize: '24px', color: '#0F172A', margin: 0, letterSpacing: '0.02em' }}>
            Ingest Client Opportunity
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Capture client RFPs via text or document upload (.pdf, .txt, .md, .json).
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setTab('text')}
            className={tab === 'text' ? 'btn-collab-primary' : 'btn-collab-secondary'}
            style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={14} /> Paste Text Brief
          </button>
          <button
            type="button"
            onClick={() => setTab('file')}
            className={tab === 'file' ? 'btn-collab-primary' : 'btn-collab-secondary'}
            style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Upload size={14} /> Upload Document
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
              Project / Brief Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Real-Time Telematics & AI Fleet Dashboard"
              className="input-collab"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Client / Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. NextWave Logistics"
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Budget Range (Optional)
              </label>
              <input
                type="text"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                placeholder="e.g. $5,000 - $8,000"
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Target Deadline
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. 4 weeks or End of Q2"
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. mvp, telemetry, api"
                className="input-collab"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {tab === 'text' ? (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Brief Requirements / Scope Details *
              </label>
              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste client requirements, RFP text, or conversation transcripts..."
                className="input-collab"
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Upload Brief Document (Max 10MB) *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #0099FF',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#F0F9FF',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.md,.json"
                  style={{ display: 'none' }}
                />
                <Upload size={24} color="#0099FF" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {selectedFile ? selectedFile.name : 'Click to choose file or drag & drop here'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  Supported formats: PDF, Markdown (.md), Plain Text (.txt), JSON. Scanned image PDFs are flagged.
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis Trigger Toggle */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Run AI Intelligence Analysis Immediately
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Unchecked will save as Draft so you can review before analyzing.
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoAnalyze}
              onChange={(e) => setAutoAnalyze(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-collab-secondary"
              style={{ flex: 1, fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-collab-primary"
              style={{ flex: 1.5, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {autoAnalyze ? <Sparkles size={16} /> : <CheckCircle2 size={16} />}
              <span>{isSubmitting ? 'Saving...' : (autoAnalyze ? 'Save & Run AI Analysis' : 'Save Opportunity Draft')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
