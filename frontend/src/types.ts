export type OpportunityStatus = 
  | 'draft' 
  | 'ready_for_analysis' 
  | 'analyzing' 
  | 'completed' 
  | 'failed' 
  | 'archived' 
  | 'won' 
  | 'lost'
  | 'pending';

export interface DeliveryRisk {
  risk: string;
  severity: string;
  mitigation: string;
}

export interface ExtractedRequirements {
  client_objectives: string[];
  functional_requirements: string[];
  non_functional_requirements: string[];
  deliverables: string[];
  constraints: string[];
  detected_tech_stack: string[];
  unknowns: string[];
  assumptions: string[];
  delivery_risks: DeliveryRisk[];
}

export interface ScoringFactor {
  name: string;
  weight: number;
  raw_score: number;
  weighted_score: number;
  explanation: string;
  status: 'positive' | 'neutral' | 'warning' | 'critical';
}

export interface OpportunityScore {
  composite_score: number;
  recommendation: 'Pursue' | 'Request Clarification' | 'Renegotiate' | 'Skip';
  summary: string;
  factors: ScoringFactor[];
  risk_penalty: number;
  reasons_to_pursue: string[];
  reasons_to_caution: string[];
}

export interface ClarificationQuestion {
  category: string;
  question: string;
  importance: 'High' | 'Medium' | 'Low';
  rationale: string;
}

export interface DiscoveryQuestionsReport {
  questions: ClarificationQuestion[];
  client_email_draft: string;
  questionnaire_markdown: string;
}

export interface OpportunityIntelligence {
  opportunity_id?: string;
  title: string;
  requirements: ExtractedRequirements;
  scoring: OpportunityScore;
  discovery: DiscoveryQuestionsReport;
}

export interface Opportunity {
  id: string;
  client_id?: string;
  company?: string;
  title: string;
  raw_content: string;
  source_type: string;
  source_url?: string;
  budget_range?: string;
  deadline?: string;
  tech_stack?: string;
  notes?: string;
  tags?: string;
  requirements_json?: string;
  scoring_json?: string;
  clarification_questions_json?: string;
  estimation_json?: string;
  fit_score?: number;
  recommendation?: string;
  status: OpportunityStatus;
  is_demo?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Proposal {
  id: string;
  opportunity_id: string;
  title: string;
  content_markdown: string;
  milestones_json?: string;
  risk_register_json?: string;
  price_estimate?: number;
  audio_path?: string;
  audio_script?: string;
  status: 'draft' | 'ready' | 'sent' | 'accepted';
  is_demo?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AudioBriefMetadata {
  proposal_id: string;
  proposal_title: string;
  has_audio_file: boolean;
  audio_url?: string | null;
  script: string;
  elevenlabs_configured: boolean;
  voice_id?: string;
  recommended_engine: 'stream' | 'browser_speech_synthesis';
}

export interface MilestoneItem {
  id: string;
  phase: string;
  title: string;
  description?: string;
  deliverables: string[];
  est_hours: number;
  rate: number;
  contingency_percent: number;
  subtotal: number;
  contingency_cost: number;
  total_cost: number;
  duration_weeks: number;
}

export interface RiskAssessmentItem {
  id: string;
  category: string;
  risk: string;
  severity: 'High' | 'Medium' | 'Low';
  probability: 'High' | 'Medium' | 'Low';
  impact: string;
  mitigation: string;
  contractual_assumption?: string;
}

export interface PaymentMilestone {
  name: string;
  percentage: number;
  amount: number;
  trigger: string;
}

export interface PricingTierFixed {
  subtotal: number;
  contingency_buffer_percent: number;
  contingency_buffer_cost: number;
  total_price: number;
  effective_hourly_rate: number;
  min_project_floor: number;
  payment_schedule: PaymentMilestone[];
}

export interface PricingTierTimeMaterials {
  hourly_rate: number;
  estimated_hours_min: number;
  estimated_hours_max: number;
  estimated_cost_min: number;
  estimated_cost_max: number;
  not_to_exceed_cap: number;
  billing_cycle: string;
}

export interface PricingTierRetainer {
  estimated_duration_weeks: number;
  weekly_rate: number;
  monthly_rate: number;
  committed_hours_per_week: number;
  includes_support_maintenance: boolean;
}

export interface PricingTiersSummary {
  fixed_price: PricingTierFixed;
  time_and_materials: PricingTierTimeMaterials;
  retainer: PricingTierRetainer;
  recommended_model: 'fixed_price' | 'time_and_materials' | 'retainer';
  currency: string;
}

export interface ProjectEstimation {
  opportunity_id: string;
  currency: string;
  hourly_rate: number;
  contingency_percent: number;
  total_hours: number;
  estimated_duration_weeks: number;
  pricing_model: 'fixed_price' | 'time_and_materials' | 'retainer';
  milestones: MilestoneItem[];
  pricing_tiers: PricingTiersSummary;
  risks: RiskAssessmentItem[];
  assumptions: string[];
  generated_at: string;
}

export interface EstimationRecalculateRequest {
  hourly_rate?: number;
  contingency_percent?: number;
  pricing_model?: 'fixed_price' | 'time_and_materials' | 'retainer';
  milestones?: MilestoneItem[];
  risks?: RiskAssessmentItem[];
  assumptions?: string[];
}

export interface ProposalUpdateRequest {
  title?: string;
  content_markdown?: string;
  milestones?: MilestoneItem[];
  risks?: RiskAssessmentItem[];
  price_estimate?: number;
  status?: 'draft' | 'ready' | 'sent' | 'accepted';
}

export interface FreelancerProfile {
  id: string;
  full_name: string;
  title: string;
  bio?: string;
  hourly_rate: number;
  currency?: string;
  timezone?: string;
  availability_hours_per_week?: number;
  skills?: string;
  experience_years?: number;
  preferred_categories?: string;
  preferred_ai_provider?: string;
  preferred_ai_model?: string;
  onboarding_completed: boolean;
  updated_at: string;
}

export interface Milestone {
  phase: string;
  title: string;
  est_hours: number;
  cost: number;
}

export interface RiskItem {
  risk: string;
  severity: string;
  mitigation: string;
}

export interface IntegrationStatus {
  ollama: {
    name: string;
    connected: boolean;
    model: string;
    url: string;
  };
  serpapi: {
    name: string;
    configured: boolean;
  };
  elevenlabs: {
    name: string;
    configured: boolean;
  };
}

export interface CaseStudy {
  id: string;
  title: string;
  client_industry?: string;
  role?: string;
  tech_stack: string[];
  summary: string;
  content?: string;
  outcomes: string[];
  metrics: Record<string, string>;
  testimonial_quote?: string;
  link_url?: string;
  is_demo?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CaseStudySearchResult {
  case_study: CaseStudy;
  relevance_score: number;
  matched_terms: string[];
  citation_preview: string;
}

export interface PortfolioListResponse {
  count: number;
  items: CaseStudy[];
  industries: string[];
  technologies: string[];
}

// --- Phase 7 Project Execution & Scope Guard Types ---

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectTask {
  id: string;
  project_id: string;
  milestone_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_hours: number;
  actual_hours: number;
  assignee?: string;
  due_date?: string;
  notes?: string;
  is_scope_change?: boolean;
  order_index?: number;
  created_at: string;
  updated_at?: string;
}

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPricingModel = 'fixed' | 'time_and_materials' | 'retainer';

export interface Project {
  id: string;
  title: string;
  description?: string;
  client_id?: string;
  opportunity_id?: string;
  proposal_id?: string;
  status: ProjectStatus;
  pricing_model: ProjectPricingModel;
  total_budget: number;
  hourly_rate: number;
  estimated_hours: number;
  actual_hours: number;
  milestones_baseline_json?: string;
  tasks_count: number;
  tasks_completed_count: number;
  progress_percent: number;
  tasks: ProjectTask[];
  is_demo?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ScopeCheckRequest {
  new_request_text: string;
  client_name?: string;
}

export interface ScopeCheckResponse {
  is_scope_creep: boolean;
  confidence_score: number;
  scope_status: 'in_scope' | 'probable_scope_creep' | 'definitive_scope_creep';
  analysis_summary: string;
  matched_milestones: string[];
  out_of_scope_items: string[];
  estimated_impact_hours: number;
  suggested_change_order_cost: number;
  suggested_client_response: string;
}

// --- Phase 8 Client Communications & Status Reporting Hub Types ---

export interface ClientReportRequest {
  report_type: 'weekly_update' | 'milestone_signoff' | 'blocker_alert';
  milestone_id?: string;
  custom_notes?: string;
  client_name?: string;
  include_time_breakdown?: boolean;
}

export interface ClientReportResponse {
  project_id: string;
  project_title: string;
  report_type: string;
  report_title: string;
  executive_summary: string;
  completed_deliverables: string[];
  in_progress_deliverables: string[];
  upcoming_deliverables: string[];
  blockers: string[];
  total_estimated_hours: number;
  total_actual_hours: number;
  total_budget: number;
  budget_burned: number;
  budget_burn_percent: number;
  email_subject: string;
  email_body_markdown: string;
  generated_at: string;
}

// --- Phase 9 Invoicing, Retainers & Financial Health Hub Types ---

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface InvoiceCreate {
  title: string;
  client_id?: string;
  client_name?: string;
  project_id?: string;
  billing_model?: 'fixed' | 'time_and_materials' | 'retainer';
  invoice_number?: string;
  issue_date?: string;
  due_date?: string;
  currency?: string;
  tax_rate?: number;
  line_items?: InvoiceLineItem[];
  notes?: string;
  payment_terms?: string;
  payment_instructions?: string;
  generate_from_milestone_id?: string;
  generate_from_unbilled_hours?: boolean;
}

export interface InvoiceResponse {
  id: string;
  invoice_number: string;
  client_id?: string;
  client_name?: string;
  project_id?: string;
  project_title?: string;
  title: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  billing_model: string;
  issue_date?: string;
  due_date?: string;
  paid_at?: string;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  line_items: InvoiceLineItem[];
  notes?: string;
  payment_terms?: string;
  payment_instructions?: string;
  created_at: string;
  updated_at?: string;
}

export interface FinancialHealthMetrics {
  total_invoiced: number;
  total_collected: number;
  outstanding_receivables: number;
  overdue_amount: number;
  draft_invoices_amount: number;
  active_projects_count: number;
  total_hours_logged: number;
  average_realized_hourly_rate: number;
  currency: string;
  recent_invoices: InvoiceResponse[];
}

