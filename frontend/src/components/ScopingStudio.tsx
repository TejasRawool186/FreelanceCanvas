import React, { useState, useEffect } from 'react';
import { 
  ProjectEstimation, 
  MilestoneItem, 
  RiskAssessmentItem, 
  PaymentMilestone, 
  Opportunity, 
  FreelancerProfile 
} from '../types';
import { 
  Calculator, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Sliders, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  Layers, 
  Calendar, 
  AlertTriangle,
  FileCheck,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface ScopingStudioProps {
  opportunity: Opportunity;
  profile: FreelancerProfile | null;
  onEstimationUpdated?: (estimation: ProjectEstimation) => void;
}

export const ScopingStudio: React.FC<ScopingStudioProps> = ({
  opportunity,
  profile,
  onEstimationUpdated
}) => {
  const [estimation, setEstimation] = useState<ProjectEstimation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable local state
  const [selectedModel, setSelectedModel] = useState<'fixed_price' | 'time_and_materials' | 'retainer'>('fixed_price');
  const [hourlyRate, setHourlyRate] = useState<number>(profile?.hourly_rate || 75);
  const [contingencyPercent, setContingencyPercent] = useState<number>(15);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [risks, setRisks] = useState<RiskAssessmentItem[]>([]);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [newAssumption, setNewAssumption] = useState('');

  // Fetch or initialize estimation
  useEffect(() => {
    fetchEstimation();
  }, [opportunity.id]);

  const fetchEstimation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/opportunities/${opportunity.id}/estimation`);
      if (!res.ok) throw new Error('Failed to load project estimation');
      const data: ProjectEstimation = await res.json();
      applyEstimationData(data);
    } catch (err: any) {
      setError(err.message || 'Error loading estimation');
    } finally {
      setIsLoading(false);
    }
  };

  const applyEstimationData = (data: ProjectEstimation) => {
    setEstimation(data);
    setSelectedModel(data.pricing_model || 'fixed_price');
    setHourlyRate(data.hourly_rate);
    setContingencyPercent(data.contingency_percent);
    setMilestones(data.milestones || []);
    setRisks(data.risks || []);
    setAssumptions(data.assumptions || []);
  };

  // Pure deterministic client-side recalculation
  const recalculateClientSide = (
    newRate: number,
    newContingency: number,
    updatedMilestones: MilestoneItem[],
    model: 'fixed_price' | 'time_and_materials' | 'retainer'
  ) => {
    const weeklyCapacity = profile?.availability_hours_per_week || 30;
    const recalculated = updatedMilestones.map(m => {
      const subtotal = Math.round(m.est_hours * newRate * 100) / 100;
      const contingencyCost = Math.round(subtotal * (newContingency / 100) * 100) / 100;
      const totalCost = Math.round((subtotal + contingencyCost) * 100) / 100;
      const durationWeeks = Math.max(0.5, Math.round((m.est_hours / (weeklyCapacity * 0.75)) * 10) / 10);
      return {
        ...m,
        rate: newRate,
        contingency_percent: newContingency,
        subtotal,
        contingency_cost: contingencyCost,
        total_cost: totalCost,
        duration_weeks: durationWeeks
      };
    });

    const totalHours = recalculated.reduce((acc, m) => acc + m.est_hours, 0);
    const rawSubtotal = recalculated.reduce((acc, m) => acc + m.subtotal, 0);
    const contingencyCost = Math.round(rawSubtotal * (newContingency / 100) * 100) / 100;
    const calcTotal = Math.round((rawSubtotal + contingencyCost) * 100) / 100;
    const fixedTotal = Math.max(1200, calcTotal);
    const totalWeeks = Math.max(1, Math.ceil(totalHours / (weeklyCapacity * 0.75)));

    const deposit = Math.round(fixedTotal * 0.3 * 100) / 100;
    const interim = Math.round(fixedTotal * 0.4 * 100) / 100;
    const finalAmt = Math.round((fixedTotal - deposit - interim) * 100) / 100;

    const paymentSchedule: PaymentMilestone[] = [
      { name: 'Kickoff Deposit', percentage: 30, amount: deposit, trigger: 'Due upon contract signing prior to Phase 1' },
      { name: 'Core Milestone Delivery', percentage: 40, amount: interim, trigger: 'Due upon staging walkthrough of Phase 2' },
      { name: 'Final Launch & Sign-off', percentage: 30, amount: finalAmt, trigger: 'Due upon production deploy and code handover' }
    ];

    const hoursMin = Math.round(Math.max(10, totalHours * 0.85) * 10) / 10;
    const hoursMax = Math.round(totalHours * 1.25 * 10) / 10;
    const costMin = Math.round(hoursMin * newRate * 100) / 100;
    const costMax = Math.round(hoursMax * newRate * 100) / 100;
    const notToExceed = Math.round(costMax * (1 + newContingency / 100) * 100) / 100;

    const avgWeeklyHours = Math.round((totalHours / totalWeeks) * 10) / 10;
    const weeklyRate = Math.round(avgWeeklyHours * newRate * 100) / 100;
    const monthlyRate = Math.round(weeklyRate * 4.2 * 100) / 100;

    setMilestones(recalculated);

    if (estimation) {
      setEstimation({
        ...estimation,
        hourly_rate: newRate,
        contingency_percent: newContingency,
        total_hours: totalHours,
        estimated_duration_weeks: totalWeeks,
        pricing_model: model,
        milestones: recalculated,
        pricing_tiers: {
          ...estimation.pricing_tiers,
          recommended_model: model,
          fixed_price: {
            ...estimation.pricing_tiers.fixed_price,
            subtotal: rawSubtotal,
            contingency_buffer_percent: newContingency,
            contingency_buffer_cost: contingencyCost,
            total_price: fixedTotal,
            effective_hourly_rate: totalHours > 0 ? Math.round((fixedTotal / totalHours) * 100) / 100 : newRate,
            payment_schedule: paymentSchedule
          },
          time_and_materials: {
            ...estimation.pricing_tiers.time_and_materials,
            hourly_rate: newRate,
            estimated_hours_min: hoursMin,
            estimated_hours_max: hoursMax,
            estimated_cost_min: costMin,
            estimated_cost_max: costMax,
            not_to_exceed_cap: notToExceed
          },
          retainer: {
            ...estimation.pricing_tiers.retainer,
            estimated_duration_weeks: totalWeeks,
            weekly_rate: weeklyRate,
            monthly_rate: monthlyRate,
            committed_hours_per_week: avgWeeklyHours
          }
        }
      });
    }
  };

  const handleRateChange = (newRate: number) => {
    setHourlyRate(newRate);
    recalculateClientSide(newRate, contingencyPercent, milestones, selectedModel);
  };

  const handleContingencyChange = (newContingency: number) => {
    setContingencyPercent(newContingency);
    recalculateClientSide(hourlyRate, newContingency, milestones, selectedModel);
  };

  const handleModelChange = (model: 'fixed_price' | 'time_and_materials' | 'retainer') => {
    setSelectedModel(model);
    recalculateClientSide(hourlyRate, contingencyPercent, milestones, model);
  };

  const handleMilestoneHoursChange = (id: string, hours: number) => {
    const updated = milestones.map(m => m.id === id ? { ...m, est_hours: Math.max(1, hours) } : m);
    recalculateClientSide(hourlyRate, contingencyPercent, updated, selectedModel);
  };

  const handleMilestoneTitleChange = (id: string, title: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, title } : m));
  };

  const handleAddMilestone = () => {
    const newId = `m_custom_${Date.now()}`;
    const nextPhaseNum = milestones.length + 1;
    const newM: MilestoneItem = {
      id: newId,
      phase: `Phase ${nextPhaseNum}`,
      title: 'Custom Milestone Deliverable',
      description: 'Defined scope deliverable',
      deliverables: ['Custom milestone implementation'],
      est_hours: 15,
      rate: hourlyRate,
      contingency_percent: contingencyPercent,
      subtotal: 15 * hourlyRate,
      contingency_cost: Math.round(15 * hourlyRate * (contingencyPercent / 100) * 100) / 100,
      total_cost: Math.round(15 * hourlyRate * (1 + contingencyPercent / 100) * 100) / 100,
      duration_weeks: 1.0
    };
    const updated = [...milestones, newM];
    recalculateClientSide(hourlyRate, contingencyPercent, updated, selectedModel);
  };

  const handleDeleteMilestone = (id: string) => {
    if (milestones.length <= 1) return;
    const updated = milestones.filter(m => m.id !== id);
    recalculateClientSide(hourlyRate, contingencyPercent, updated, selectedModel);
  };

  const handleAddAssumption = () => {
    if (!newAssumption.trim()) return;
    setAssumptions(prev => [...prev, newAssumption.trim()]);
    setNewAssumption('');
  };

  const handleDeleteAssumption = (index: number) => {
    setAssumptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveEstimation = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const payload = {
        hourly_rate: hourlyRate,
        contingency_percent: contingencyPercent,
        pricing_model: selectedModel,
        milestones: milestones,
        risks: risks,
        assumptions: assumptions
      };

      const res = await fetch(`/api/opportunities/${opportunity.id}/estimation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save estimation');
      const updated: ProjectEstimation = await res.json();
      applyEstimationData(updated);
      setSaveSuccess(true);
      if (onEstimationUpdated) {
        onEstimationUpdated(updated);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error saving estimation');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card-collab" style={{ padding: '48px', textAlign: 'center' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#0099FF' }} />
        <h4 className="font-chewy" style={{ fontSize: '18px', margin: 0 }}>Calculating Work Breakdown Structure & Pricing Math...</h4>
        <p style={{ color: '#64748B', fontSize: '13px', marginTop: '6px' }}>Analyzing extracted deliverables against developer hourly rate and risk buffer.</p>
      </div>
    );
  }

  if (error && !estimation) {
    return (
      <div className="card-collab" style={{ padding: '36px', textAlign: 'center' }}>
        <AlertTriangle size={32} color="#EF4444" style={{ margin: '0 auto 12px auto' }} />
        <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800 }}>Estimation Error</h4>
        <p style={{ color: '#64748B', fontSize: '13px' }}>{error}</p>
        <button onClick={fetchEstimation} className="btn-collab-primary" style={{ marginTop: '12px', fontSize: '13px' }}>
          Retry Estimation Calculation
        </button>
      </div>
    );
  }

  const fixedTier = estimation?.pricing_tiers.fixed_price;
  const tmTier = estimation?.pricing_tiers.time_and_materials;
  const retainerTier = estimation?.pricing_tiers.retainer;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Studio Header & Save Bar */}
      <div className="card-collab" style={{
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        backgroundColor: '#FFFFFF',
        position: 'relative'
      }}>
        <div className="scotch-tape" style={{ width: '60px', height: '20px', top: '-11px' }} />
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="tag-pill-popular" style={{ backgroundColor: '#EDE9FE', color: '#6D28D9', borderColor: '#000' }}>
              <Calculator size={12} strokeWidth={2.5} /> Phase 5 Scope & Pricing Engine
            </span>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              Deterministic • Zero Pseudo-Math
            </span>
          </div>
          <h2 className="font-chewy" style={{ fontSize: '24px', margin: 0, letterSpacing: '0.02em', color: '#0F172A' }}>
            Work Breakdown Structure & Commercial Pricing
          </h2>
          <p style={{ color: '#475569', fontSize: '13px', margin: '4px 0 0 0' }}>
            Customized for <strong>{opportunity.title}</strong> • Currency: <strong>{estimation?.currency || 'USD'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {saveSuccess && (
            <span style={{ fontSize: '13px', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={16} color="#166534" /> Saved & Synced with Proposal!
            </span>
          )}
          <button
            onClick={handleSaveEstimation}
            disabled={isSaving}
            className="btn-collab-primary"
            style={{ fontSize: '13px', padding: '10px 20px', backgroundColor: '#A7F3D0' }}
          >
            <Save size={16} strokeWidth={2.5} />
            <span>{isSaving ? 'Saving...' : 'Save Scope & Sync Proposal'}</span>
          </button>
        </div>
      </div>

      {/* Global Scoping Parameters Slider Bar */}
      <div className="card-collab" style={{
        padding: '20px 28px',
        backgroundColor: '#F8FAFC',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* Hourly Rate Control */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={15} color="#0099FF" /> Base Hourly Rate
            </label>
            <strong style={{ fontSize: '15px', color: '#0F172A', fontFamily: "'JetBrains Mono', monospace" }}>
              ${hourlyRate}/hr
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="range"
              min="30"
              max="300"
              step="5"
              value={hourlyRate}
              onChange={e => handleRateChange(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#0099FF', cursor: 'pointer' }}
            />
            <input
              type="number"
              min="10"
              max="1000"
              value={hourlyRate}
              onChange={e => handleRateChange(Number(e.target.value))}
              style={{
                width: '70px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '2px solid #000',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace"
              }}
            />
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            Profile rate: ${profile?.hourly_rate || 75}/hr • Applied to all milestone hours
          </div>
        </div>

        {/* Contingency Buffer Control */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={15} color="#D97706" /> Contingency Risk Buffer
            </label>
            <strong style={{ fontSize: '15px', color: '#0F172A', fontFamily: "'JetBrains Mono', monospace" }}>
              +{contingencyPercent}%
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={contingencyPercent}
              onChange={e => handleContingencyChange(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#D97706', cursor: 'pointer' }}
            />
            <span style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: '#FEF3C7',
              border: '2px solid #000',
              fontSize: '12px',
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              +{contingencyPercent}%
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            Buffers unknown scope risks, client turnaround delays, and integration variances
          </div>
        </div>

        {/* Project Summary Stats */}
        <div style={{
          display: 'flex',
          gap: '16px',
          padding: '12px 18px',
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          border: '2px solid #000',
          boxShadow: '2px 2px 0px #000'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Total Hours</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', fontFamily: "'JetBrains Mono', monospace" }}>
              {estimation?.total_hours || 0} hrs
            </div>
          </div>
          <div style={{ width: '1px', backgroundColor: '#E2E8F0' }} />
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Timeline</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', fontFamily: "'JetBrains Mono', monospace" }}>
              {estimation?.estimated_duration_weeks || 1} wks
            </div>
          </div>
          <div style={{ width: '1px', backgroundColor: '#E2E8F0' }} />
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Fixed Fee</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#166534', fontFamily: "'JetBrains Mono', monospace" }}>
              ${fixedTier?.total_price.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Models Comparison Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Model 1: Fixed Price */}
        <div
          onClick={() => handleModelChange('fixed_price')}
          style={{
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: selectedModel === 'fixed_price' ? '#FEF08A' : '#FFFFFF',
            border: selectedModel === 'fixed_price' ? '3px solid #000000' : '2px solid #CBD5E1',
            boxShadow: selectedModel === 'fixed_price' ? '4px 4px 0px #000000' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          {selectedModel === 'fixed_price' && (
            <span style={{
              position: 'absolute',
              top: '-10px',
              right: '16px',
              padding: '2px 8px',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              borderRadius: '6px',
              textTransform: 'uppercase'
            }}>
              Active Selection
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle2 size={18} color="#000" strokeWidth={2.5} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 900 }}>Fixed Milestone Pricing</h4>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', fontFamily: "'JetBrains Mono', monospace", marginBottom: '6px' }}>
            ${fixedTier?.total_price.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
            <div>Base Work Subtotal: <strong>${fixedTier?.subtotal.toLocaleString()}</strong></div>
            <div>Risk Buffer (+{contingencyPercent}%): <strong>+${fixedTier?.contingency_buffer_cost.toLocaleString()}</strong></div>
            <div>Min Project Floor: <strong>${fixedTier?.min_project_floor.toLocaleString()}</strong></div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #000', fontSize: '11px', color: '#475569' }}>
            Recommended for clear scopes with defined deliverables and low ambiguity.
          </div>
        </div>

        {/* Model 2: Time & Materials */}
        <div
          onClick={() => handleModelChange('time_and_materials')}
          style={{
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: selectedModel === 'time_and_materials' ? '#E0F2FE' : '#FFFFFF',
            border: selectedModel === 'time_and_materials' ? '3px solid #000000' : '2px solid #CBD5E1',
            boxShadow: selectedModel === 'time_and_materials' ? '4px 4px 0px #000000' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          {selectedModel === 'time_and_materials' && (
            <span style={{
              position: 'absolute',
              top: '-10px',
              right: '16px',
              padding: '2px 8px',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              borderRadius: '6px',
              textTransform: 'uppercase'
            }}>
              Active Selection
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={18} color="#0099FF" strokeWidth={2.5} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 900 }}>Time & Materials (T&M)</h4>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', fontFamily: "'JetBrains Mono', monospace", marginBottom: '6px' }}>
            ${tmTier?.estimated_cost_min.toLocaleString()} – ${tmTier?.estimated_cost_max.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
            <div>Rate: <strong>${hourlyRate}/hr</strong></div>
            <div>Hours Range: <strong>{tmTier?.estimated_hours_min}h – {tmTier?.estimated_hours_max}h</strong></div>
            <div>Not-to-Exceed Cap: <strong style={{ color: '#B91C1C' }}>${tmTier?.not_to_exceed_cap.toLocaleString()}</strong></div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #000', fontSize: '11px', color: '#475569' }}>
            Recommended when requirements are evolving or third-party APIs are unconfirmed.
          </div>
        </div>

        {/* Model 3: Weekly Retainer */}
        <div
          onClick={() => handleModelChange('retainer')}
          style={{
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: selectedModel === 'retainer' ? '#EDE9FE' : '#FFFFFF',
            border: selectedModel === 'retainer' ? '3px solid #000000' : '2px solid #CBD5E1',
            boxShadow: selectedModel === 'retainer' ? '4px 4px 0px #000000' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          {selectedModel === 'retainer' && (
            <span style={{
              position: 'absolute',
              top: '-10px',
              right: '16px',
              padding: '2px 8px',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              borderRadius: '6px',
              textTransform: 'uppercase'
            }}>
              Active Selection
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Calendar size={18} color="#6D28D9" strokeWidth={2.5} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 900 }}>Sprint Velocity Retainer</h4>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', fontFamily: "'JetBrains Mono', monospace", marginBottom: '6px' }}>
            ${retainerTier?.weekly_rate.toLocaleString()} / wk
          </div>
          <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
            <div>Monthly Equivalent: <strong>${retainerTier?.monthly_rate.toLocaleString()}/mo</strong></div>
            <div>Committed Velocity: <strong>{retainerTier?.committed_hours_per_week}h/week</strong></div>
            <div>Estimated Duration: <strong>{retainerTier?.estimated_duration_weeks} weeks</strong></div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #000', fontSize: '11px', color: '#475569' }}>
            Guaranteed developer allocation and prioritized sprint delivery with support.
          </div>
        </div>

      </div>

      {/* Work Breakdown Structure (WBS) Table */}
      <div className="card-collab" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="font-chewy" style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#0099FF" /> Work Breakdown Structure (WBS)
            </h3>
            <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0 0' }}>
              Detailed milestones, deliverable checklists, and calculated cost allocations.
            </p>
          </div>

          <button
            onClick={handleAddMilestone}
            className="btn-collab-primary"
            style={{ fontSize: '12px', padding: '6px 14px', backgroundColor: '#FEF08A' }}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add Custom Milestone</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {milestones.map((m, idx) => (
            <div
              key={m.id || idx}
              style={{
                padding: '18px 20px',
                borderRadius: '12px',
                backgroundColor: idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF',
                border: '2px solid #000000',
                boxShadow: '3px 3px 0px #000000',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Milestone Top Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {m.phase}
                  </span>
                  <input
                    type="text"
                    value={m.title}
                    onChange={e => handleMilestoneTitleChange(m.id, e.target.value)}
                    style={{
                      flex: 1,
                      fontWeight: 800,
                      fontSize: '15px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Est. Hours:</label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={m.est_hours}
                      onChange={e => handleMilestoneHoursChange(m.id, Number(e.target.value))}
                      style={{
                        width: '64px',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        border: '2px solid #000',
                        fontSize: '13px',
                        fontWeight: 800,
                        fontFamily: "'JetBrains Mono', monospace",
                        textAlign: 'center'
                      }}
                    />
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#166534', fontFamily: "'JetBrains Mono', monospace" }}>
                      ${m.total_cost.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>
                      ${m.subtotal.toLocaleString()} + ${m.contingency_cost.toLocaleString()} buf
                    </div>
                  </div>

                  {milestones.length > 1 && (
                    <button
                      onClick={() => handleDeleteMilestone(m.id)}
                      title="Remove milestone"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Deliverables Checklist */}
              {m.deliverables && m.deliverables.length > 0 && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#334155'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Included Deliverables
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '6px' }}>
                    {m.deliverables.map((del, dIdx) => (
                      <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#166534" strokeWidth={2.5} />
                        <span>{del}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Schedule Breakdown */}
      {fixedTier?.payment_schedule && fixedTier.payment_schedule.length > 0 && (
        <div className="card-collab" style={{ padding: '24px 28px', backgroundColor: '#FFFFFF' }}>
          <h3 className="font-chewy" style={{ fontSize: '18px', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={18} color="#166534" /> Milestone Payment Schedule
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {fixedTier.payment_schedule.map((p, pIdx) => (
              <div key={pIdx} style={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: '#F0FDF4',
                border: '2px solid #000000',
                boxShadow: '2px 2px 0px #000000'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534' }}>{p.name}</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 6px', backgroundColor: '#DCFCE7', borderRadius: '4px', border: '1px solid #166534' }}>
                    {p.percentage}%
                  </span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', fontFamily: "'JetBrains Mono', monospace", marginBottom: '6px' }}>
                  ${p.amount.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                  {p.trigger}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Register & Contractual Assumptions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Risk Register */}
        <div className="card-collab" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
          <h3 className="font-chewy" style={{ fontSize: '18px', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="#D97706" /> Technical Risk Register
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {risks.map((r, rIdx) => (
              <div key={r.id || rIdx} style={{
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: '#FEF3C7',
                border: '2px solid #000000',
                boxShadow: '2px 2px 0px #000000',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#92400E', fontSize: '13px' }}>{r.risk}</strong>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: r.severity === 'High' ? '#FEE2E2' : '#FEF3C7',
                    color: r.severity === 'High' ? '#991B1B' : '#92400E',
                    border: '1px solid currentColor'
                  }}>
                    {r.severity}
                  </span>
                </div>
                <div style={{ color: '#78350F', marginTop: '4px' }}>
                  <strong>Mitigation:</strong> {r.mitigation}
                </div>
                {r.contractual_assumption && (
                  <div style={{ color: '#451A03', marginTop: '4px', fontStyle: 'italic', fontSize: '11px' }}>
                    Contractual Clause: "{r.contractual_assumption}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contractual Assumptions (Scope Creep Protection) */}
        <div className="card-collab" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
          <h3 className="font-chewy" style={{ fontSize: '18px', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#166534" /> Contractual Assumptions
          </h3>
          <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 12px 0' }}>
            Standard commercial assumptions protecting developer velocity against unmanaged scope creep:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {assumptions.map((assump, aIdx) => (
              <div key={aIdx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
                color: '#1E293B'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: 800, color: '#0099FF' }}>•</span>
                  <span>{assump}</span>
                </div>
                <button
                  onClick={() => handleDeleteAssumption(aIdx)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0 4px' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Custom Assumption */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <input
              type="text"
              placeholder="Add contractual clause..."
              value={newAssumption}
              onChange={e => setNewAssumption(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddAssumption()}
              style={{
                flex: 1,
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12px'
              }}
            />
            <button
              onClick={handleAddAssumption}
              className="btn-collab-dark"
              style={{ fontSize: '12px', padding: '7px 12px' }}
            >
              Add Clause
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
