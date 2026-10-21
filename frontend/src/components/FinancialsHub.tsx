import React, { useState, useEffect } from 'react';
import {
  Receipt,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Printer,
  Trash2,
  ArrowUpRight,
  RefreshCw,
  FolderKanban,
  User,
  Calendar,
  X,
  Send,
  Check
} from 'lucide-react';
import {
  InvoiceResponse,
  FinancialHealthMetrics,
  InvoiceLineItem,
  Project
} from '../types';

interface FinancialsHubProps {
  onNavigateToProjects?: (projectId?: string) => void;
}

export const FinancialsHub: React.FC<FinancialsHubProps> = ({ onNavigateToProjects }) => {
  const [metrics, setMetrics] = useState<FinancialHealthMetrics | null>(null);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<InvoiceResponse | null>(null);

  // Form State for New Invoice
  const [modalMode, setModalMode] = useState<'custom' | 'milestone' | 'unbilled'>('milestone');
  const [formTitle, setFormTitle] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formBillingModel, setFormBillingModel] = useState<'fixed' | 'time_and_materials' | 'retainer'>('fixed');
  const [formDueDate, setFormDueDate] = useState('');
  const [formPaymentTerms, setFormPaymentTerms] = useState('Net 15');
  const [formTaxRate, setFormTaxRate] = useState(0.0);
  const [formNotes, setFormNotes] = useState('');
  const [formMilestoneId, setFormMilestoneId] = useState('');
  const [customLineItems, setCustomLineItems] = useState<InvoiceLineItem[]>([
    { description: 'Sprint 1 Development & Architecture', quantity: 1.0, unit_price: 2500.0, amount: 2500.0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, invoicesRes, projectsRes] = await Promise.all([
        fetch('/api/invoices/financial-health'),
        fetch('/api/invoices'),
        fetch('/api/projects')
      ]);

      if (metricsRes.ok) {
        setMetrics(await metricsRes.json());
      }
      if (invoicesRes.ok) {
        setInvoices(await invoicesRes.json());
      }
      if (projectsRes.ok) {
        setProjects(await projectsRes.json());
      }
    } catch (err) {
      console.error('Failed to load financial telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const handleStatusChange = async (invId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/invoices/${invId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchFinancialData();
        if (selectedInvoiceForView && selectedInvoiceForView.id === invId) {
          const updated = await res.json();
          setSelectedInvoiceForView(updated);
        }
      }
    } catch (err) {
      console.error('Failed to update invoice status:', err);
    }
  };

  const handleDeleteInvoice = async (invId: string) => {
    if (!window.confirm('Are you sure you want to delete this draft invoice?')) return;
    try {
      const res = await fetch(`/api/invoices/${invId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedInvoiceForView?.id === invId) setSelectedInvoiceForView(null);
        fetchFinancialData();
      }
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    }
  };

  const handleProjectSelect = (pId: string) => {
    setFormProjectId(pId);
    const p = projects.find(item => item.id === pId);
    if (p) {
      setFormTitle(`${p.title} — Invoice`);
      if (p.pricing_model === 'time_and_materials' || p.pricing_model === 'retainer') {
        setFormBillingModel(p.pricing_model);
        setModalMode(p.pricing_model === 'time_and_materials' ? 'unbilled' : 'custom');
      } else {
        setFormBillingModel('fixed');
        setModalMode('milestone');
      }
    }
  };

  const handleAddLineItem = () => {
    setCustomLineItems([
      ...customLineItems,
      { description: 'Consulting / Engineering Deliverable', quantity: 1.0, unit_price: 1000.0, amount: 1000.0 }
    ]);
  };

  const handleUpdateLineItem = (index: number, field: keyof InvoiceLineItem, val: string | number) => {
    const copy = [...customLineItems];
    const item = { ...copy[index] };
    if (field === 'description') {
      item.description = String(val);
    } else {
      const num = parseFloat(String(val)) || 0;
      if (field === 'quantity') item.quantity = num;
      if (field === 'unit_price') item.unit_price = num;
      item.amount = roundToTwo(item.quantity * item.unit_price);
    }
    copy[index] = item;
    setCustomLineItems(copy);
  };

  const handleRemoveLineItem = (index: number) => {
    if (customLineItems.length <= 1) return;
    setCustomLineItems(customLineItems.filter((_, idx) => idx !== index));
  };

  const roundToTwo = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please provide an invoice title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formTitle,
        project_id: formProjectId || undefined,
        client_name: formClientName || undefined,
        billing_model: formBillingModel,
        due_date: formDueDate || undefined,
        payment_terms: formPaymentTerms,
        tax_rate: formTaxRate,
        notes: formNotes || undefined
      };

      if (modalMode === 'milestone') {
        payload.generate_from_milestone_id = formMilestoneId || undefined;
      } else if (modalMode === 'unbilled') {
        payload.generate_from_unbilled_hours = true;
      } else {
        payload.line_items = customLineItems;
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        // Reset form
        setFormTitle('');
        setFormClientName('');
        setFormProjectId('');
        setFormMilestoneId('');
        fetchFinancialData();
      } else {
        const err = await res.json();
        alert(`Failed to create invoice: ${err.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error submitting invoice:', err);
      alert('Network error while saving invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (selectedProjectId !== 'all' && inv.project_id !== selectedProjectId) return false;
    return true;
  });

  const selectedProjectMilestones = React.useMemo(() => {
    if (!formProjectId) return [];
    const p = projects.find(item => item.id === formProjectId);
    if (!p || !p.milestones_baseline_json) return [];
    try {
      return JSON.parse(p.milestones_baseline_json);
    } catch {
      return [];
    }
  }, [formProjectId, projects]);

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: "'Fredoka', sans-serif" }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#FEF08A',
              border: '2px solid #000000',
              boxShadow: '2px 2px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Receipt size={22} color="#0F172A" />
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Financial Health & Invoicing Hub
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                Milestone releases, retainers, automated timesheets & realized hourly yield.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={fetchFinancialData}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '2px solid #000000',
              backgroundColor: '#FFFFFF',
              boxShadow: '2px 2px 0px #000000',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>Sync Telemetry</span>
          </button>

          <button
            onClick={() => {
              setIsCreateModalOpen(true);
              const defaultDueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
              setFormDueDate(defaultDueDate);
              if (projects.length > 0 && !formProjectId) {
                handleProjectSelect(projects[0].id);
              }
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '2px solid #000000',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              boxShadow: '3px 3px 0px #000000',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} strokeWidth={3} />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Health Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Metric 1: Total Invoiced */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid #000000',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '3px 3px 0px #000000',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total Invoiced</span>
            <DollarSign size={18} color="#6366F1" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>
            ${metrics?.total_invoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
            Across {invoices.length} issued & paid invoices
          </div>
        </div>

        {/* Metric 2: Total Collected */}
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '2px solid #000000',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '3px 3px 0px #000000',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>Collected Cash</span>
            <CheckCircle2 size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#065F46' }}>
            ${metrics?.total_collected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
          </div>
          <div style={{ fontSize: '11px', color: '#047857', marginTop: '4px', fontWeight: 700 }}>
            Realized cash in bank
          </div>
        </div>

        {/* Metric 3: Outstanding Receivables */}
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '2px solid #000000',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '3px 3px 0px #000000',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>Receivables</span>
            <Clock size={18} color="#D97706" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#92400E' }}>
            ${metrics?.outstanding_receivables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
          </div>
          <div style={{ fontSize: '11px', color: '#B45309', marginTop: '4px', fontWeight: 600 }}>
            Pending client settlement
          </div>
        </div>

        {/* Metric 4: Overdue Amount */}
        <div style={{
          backgroundColor: (metrics?.overdue_amount ?? 0) > 0 ? '#FEF2F2' : '#FFFFFF',
          border: '2px solid #000000',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '3px 3px 0px #000000',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Overdue</span>
            <AlertTriangle size={18} color="#EF4444" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: (metrics?.overdue_amount ?? 0) > 0 ? '#991B1B' : '#0F172A' }}>
            ${metrics?.overdue_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
            {(metrics?.overdue_amount ?? 0) > 0 ? 'Follow-up reminder required' : 'Zero overdue payments!'}
          </div>
        </div>

        {/* Metric 5: Realized Hourly Rate */}
        <div style={{
          backgroundColor: '#EEF2FF',
          border: '2px solid #000000',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '3px 3px 0px #000000',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#4338CA', textTransform: 'uppercase' }}>Realized Yield</span>
            <TrendingUp size={18} color="#4F46E5" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#312E81' }}>
            ${metrics?.average_realized_hourly_rate ?? 0.00} <span style={{ fontSize: '14px', fontWeight: 700 }}>/ hr</span>
          </div>
          <div style={{ fontSize: '11px', color: '#4338CA', marginTop: '4px', fontWeight: 600 }}>
            {metrics?.total_hours_logged ?? 0} hrs tracked across tasks
          </div>
        </div>
      </div>

      {/* Main Invoices Section */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '2px solid #000000',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '4px 4px 0px #000000'
      }}>
        {/* Filter and Search Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #F1F5F9',
          paddingBottom: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Status Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'draft', 'issued', 'paid', 'overdue'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1.5px solid #000000',
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === st ? '#0F172A' : '#F8FAFC',
                  color: statusFilter === st ? '#FFFFFF' : '#475569',
                  boxShadow: statusFilter === st ? '2px 2px 0px #000000' : 'none'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Project Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderKanban size={16} color="#64748B" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>Project:</span>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1.5px solid #000000',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#F8FAFC',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Invoices List / Table */}
        {filteredInvoices.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredInvoices.map(inv => {
              const statusColors = {
                paid: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
                issued: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
                overdue: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
                draft: { bg: '#FEF9C3', text: '#854D0E', border: '#FDE047' },
                cancelled: { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' }
              }[inv.status] || { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };

              return (
                <div
                  key={inv.id}
                  style={{
                    border: '2px solid #000000',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '2px 2px 0px #000000',
                    transition: 'transform 0.1s ease',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  {/* Left Column: Number, Title, Client */}
                  <div style={{ minWidth: '240px', flex: '1 1 280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        letterSpacing: '0.05em'
                      }}>
                        {inv.invoice_number}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                        border: `1px solid ${statusColors.border}`,
                        textTransform: 'uppercase'
                      }}>
                        {inv.status}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#64748B',
                        backgroundColor: '#F8FAFC',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {inv.billing_model.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
                      {inv.title}
                    </h4>

                    <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#64748B', alignItems: 'center' }}>
                      {inv.client_name && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={13} /> {inv.client_name}
                        </span>
                      )}
                      {inv.project_title && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4F46E5', fontWeight: 600 }}>
                          <FolderKanban size={13} /> {inv.project_title}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Dates & Line Items Preview */}
                  <div style={{ minWidth: '160px', fontSize: '12px' }}>
                    <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> Due: <strong style={{ color: '#0F172A' }}>{inv.due_date || 'Due on receipt'}</strong>
                    </div>
                    <div style={{ color: '#64748B', marginTop: '4px' }}>
                      {inv.line_items?.length || 0} line item{inv.line_items?.length === 1 ? '' : 's'}
                    </div>
                  </div>

                  {/* Right Column: Amount & Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>
                        ${inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {inv.currency}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {inv.status === 'draft' && (
                        <button
                          onClick={() => handleStatusChange(inv.id, 'issued')}
                          title="Mark Issued & Send"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1.5px solid #000000',
                            backgroundColor: '#3B82F6',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Send size={12} />
                          <span>Issue</span>
                        </button>
                      )}

                      {inv.status === 'issued' && (
                        <button
                          onClick={() => handleStatusChange(inv.id, 'paid')}
                          title="Record Payment Received"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1.5px solid #000000',
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={12} />
                          <span>Mark Paid</span>
                        </button>
                      )}

                      {/* Export / Print HTML button */}
                      <a
                        href={`/api/invoices/${inv.id}/export-html?print=true`}
                        target="_blank"
                        rel="noreferrer"
                        title="Print / PDF Vector Export"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1.5px solid #000000',
                          backgroundColor: '#F8FAFC',
                          color: '#0F172A',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none'
                        }}
                      >
                        <Printer size={12} />
                        <span>Print</span>
                      </a>

                      <button
                        onClick={() => setSelectedInvoiceForView(inv)}
                        title="View Details"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1.5px solid #000000',
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ArrowUpRight size={12} />
                        <span>Inspect</span>
                      </button>

                      {inv.status === 'draft' && (
                        <button
                          onClick={() => handleDeleteInvoice(inv.id)}
                          title="Delete Draft"
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1.5px solid #000000',
                            backgroundColor: '#FEE2E2',
                            color: '#991B1B',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Receipt size={48} color="#CBD5E1" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              No Invoices Found
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '0 auto 20px auto' }}>
              Generate an invoice from completed Kanban milestone deliverables, unbilled hourly tasks, or a custom retainer.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid #000000',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                boxShadow: '3px 3px 0px #000000',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              + Create First Invoice
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL 1: CREATE INVOICE --- */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '3px solid #000000',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '6px 6px 0px #000000'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={22} color="#10B981" />
                <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: '#0F172A' }}>
                  Generate New Invoice
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{
                  border: '1.5px solid #000000',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  padding: '4px',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              {/* Associated Project */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Link to Project (Optional)
                </label>
                <select
                  value={formProjectId}
                  onChange={e => handleProjectSelect(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '2px solid #000000',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: '#F8FAFC'
                  }}
                >
                  <option value="">Standalone Invoice (No project link)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.pricing_model.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Client */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    Invoice Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="e.g. Milestone 1 - API Deliverable"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '2px solid #000000',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formClientName}
                    onChange={e => setFormClientName(e.target.value)}
                    placeholder="Client or Company Name"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '2px solid #000000',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Strategy Selector Tabs */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                  Billing Source & Generation Mode
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setModalMode('milestone')}
                    disabled={!formProjectId || selectedProjectMilestones.length === 0}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '2px solid #000000',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: (!formProjectId || selectedProjectMilestones.length === 0) ? 'not-allowed' : 'pointer',
                      opacity: (!formProjectId || selectedProjectMilestones.length === 0) ? 0.5 : 1,
                      backgroundColor: modalMode === 'milestone' ? '#FEF08A' : '#F8FAFC',
                      boxShadow: modalMode === 'milestone' ? '2px 2px 0px #000000' : 'none'
                    }}
                  >
                    1. Milestone Release
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalMode('unbilled')}
                    disabled={!formProjectId}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '2px solid #000000',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: !formProjectId ? 'not-allowed' : 'pointer',
                      opacity: !formProjectId ? 0.5 : 1,
                      backgroundColor: modalMode === 'unbilled' ? '#FEF08A' : '#F8FAFC',
                      boxShadow: modalMode === 'unbilled' ? '2px 2px 0px #000000' : 'none'
                    }}
                  >
                    2. Unbilled Hours (T&M)
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalMode('custom')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '2px solid #000000',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      backgroundColor: modalMode === 'custom' ? '#FEF08A' : '#F8FAFC',
                      boxShadow: modalMode === 'custom' ? '2px 2px 0px #000000' : 'none'
                    }}
                  >
                    3. Custom Line Items
                  </button>
                </div>
              </div>

              {/* Mode 1: Milestone Selector */}
              {modalMode === 'milestone' && (
                <div style={{
                  padding: '14px',
                  backgroundColor: '#FFFBEB',
                  border: '1.5px solid #FCD34D',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#92400E', marginBottom: '6px' }}>
                    Select Milestone to Bill:
                  </label>
                  <select
                    value={formMilestoneId}
                    onChange={e => setFormMilestoneId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #000000',
                      fontSize: '13px',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="">Select a project milestone...</option>
                    {selectedProjectMilestones.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.title || m.milestone_name} (${m.cost || m.total_cost || 0})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mode 2: Unbilled Hours Banner */}
              {modalMode === 'unbilled' && (
                <div style={{
                  padding: '14px',
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #6EE7B7',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: '#065F46'
                }}>
                  <strong>Automated Timesheet Ingestion:</strong> All completed tasks in this project with recorded hours will be pulled into line items multiplied by the project's contract rate.
                </div>
              )}

              {/* Mode 3: Custom Line Items Table */}
              {modalMode === 'custom' && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>Line Items</span>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1.5px solid #000000',
                        backgroundColor: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      + Add Item
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {customLineItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => handleUpdateLineItem(idx, 'description', e.target.value)}
                          placeholder="Description"
                          style={{
                            flex: 3,
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1.5px solid #000000',
                            fontSize: '12px'
                          }}
                        />
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={item.quantity}
                          onChange={e => handleUpdateLineItem(idx, 'quantity', e.target.value)}
                          placeholder="Qty"
                          style={{
                            width: '60px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1.5px solid #000000',
                            fontSize: '12px',
                            textAlign: 'center'
                          }}
                        />
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={item.unit_price}
                          onChange={e => handleUpdateLineItem(idx, 'unit_price', e.target.value)}
                          placeholder="Rate"
                          style={{
                            width: '80px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1.5px solid #000000',
                            fontSize: '12px',
                            textAlign: 'right'
                          }}
                        />
                        <div style={{ width: '80px', fontSize: '12px', fontWeight: 800, textAlign: 'right', color: '#0F172A' }}>
                          ${item.amount.toFixed(2)}
                        </div>
                        {customLineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: '#EF4444'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates & Terms */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    Payment Terms
                  </label>
                  <select
                    value={formPaymentTerms}
                    onChange={e => setFormPaymentTerms(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #000000',
                      fontSize: '12px'
                    }}
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="50% Upfront, 50% on Delivery">50/50 Split</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={e => setFormDueDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #000000',
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formTaxRate}
                    onChange={e => setFormTaxRate(parseFloat(e.target.value) || 0.0)}
                    placeholder="0.0"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #000000',
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  Remittance Notes / Wire Instructions
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Please send wire transfers to Silicon Valley Bank / Mercury. Thank you!"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1.5px solid #000000',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1.5px solid #000000',
                    backgroundColor: '#F8FAFC',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: '2px solid #000000',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    boxShadow: '2px 2px 0px #000000',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: isSubmitting ? 'wait' : 'pointer'
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: INSPECT INVOICE DETAILS --- */}
      {selectedInvoiceForView && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '3px solid #000000',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '6px 6px 0px #000000'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  letterSpacing: '0.05em'
                }}>
                  {selectedInvoiceForView.invoice_number}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '8px 0 2px 0' }}>
                  {selectedInvoiceForView.title}
                </h3>
                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  Client: <strong>{selectedInvoiceForView.client_name || 'Direct Client'}</strong> {selectedInvoiceForView.project_title && `• Project: ${selectedInvoiceForView.project_title}`}
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoiceForView(null)}
                style={{
                  border: '1.5px solid #000000',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  padding: '4px',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Line items table */}
            <div style={{ border: '2px solid #000000', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #000000' }}>
                  <tr>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 800 }}>Description</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800 }}>Qty</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800 }}>Rate</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoiceForView.line_items?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{item.description}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>${item.unit_price.toFixed(2)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800 }}>${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <div style={{ width: '220px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748B' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>${selectedInvoiceForView.subtotal.toFixed(2)}</span>
                </div>
                {selectedInvoiceForView.tax_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748B' }}>
                    <span>Tax ({(selectedInvoiceForView.tax_rate * 100).toFixed(0)}%):</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>${selectedInvoiceForView.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderTop: '2px solid #000000',
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#0F172A'
                }}>
                  <span>Total Due:</span>
                  <span>${selectedInvoiceForView.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Remittance instructions */}
            {selectedInvoiceForView.payment_instructions && (
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1.5px dashed #CBD5E1',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '12px',
                color: '#475569',
                marginBottom: '24px',
                whiteSpace: 'pre-wrap'
              }}>
                <strong>Payment Instructions:</strong><br />
                {selectedInvoiceForView.payment_instructions}
              </div>
            )}

            {/* Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedInvoiceForView.status === 'draft' && (
                  <button
                    onClick={() => handleStatusChange(selectedInvoiceForView.id, 'issued')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #000000',
                      backgroundColor: '#3B82F6',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Mark as Issued
                  </button>
                )}
                {selectedInvoiceForView.status === 'issued' && (
                  <button
                    onClick={() => handleStatusChange(selectedInvoiceForView.id, 'paid')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #000000',
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Mark as Paid
                  </button>
                )}
              </div>

              <a
                href={`/api/invoices/${selectedInvoiceForView.id}/export-html?print=true`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '2px solid #000000',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  boxShadow: '2px 2px 0px #000000',
                  fontWeight: 800,
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={14} />
                <span>Print Official PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
