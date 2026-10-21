from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class ClientBase(BaseModel):
    name: str
    company: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class OpportunityCreate(BaseModel):
    title: str
    raw_content: str
    client_name: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    source_type: Optional[str] = "text"
    source_url: Optional[str] = None
    budget_range: Optional[str] = None
    deadline: Optional[str] = None
    tech_stack: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[str] = "draft"
    auto_analyze: Optional[bool] = False

class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    raw_content: Optional[str] = None
    client_name: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    source_url: Optional[str] = None
    budget_range: Optional[str] = None
    deadline: Optional[str] = None
    tech_stack: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[str] = None

class DeliveryRisk(BaseModel):
    risk: str
    severity: str = "Medium"  # High, Medium, Low
    mitigation: str

class ExtractedRequirements(BaseModel):
    client_objectives: List[str] = Field(default_factory=list)
    functional_requirements: List[str] = Field(default_factory=list)
    non_functional_requirements: List[str] = Field(default_factory=list)
    deliverables: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)
    detected_tech_stack: List[str] = Field(default_factory=list)
    unknowns: List[str] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    delivery_risks: List[DeliveryRisk] = Field(default_factory=list)
    scope_clarity: str = "Medium"  # High, Medium, Low

class ScoringFactor(BaseModel):
    name: str
    weight: float
    raw_score: float
    weighted_score: float
    explanation: str
    status: str = "neutral"  # positive, neutral, warning, critical

class OpportunityScore(BaseModel):
    composite_score: float
    recommendation: str  # Pursue, Request Clarification, Renegotiate, Skip
    summary: str
    factors: List[ScoringFactor] = Field(default_factory=list)
    risk_penalty: float = 0.0
    reasons_to_pursue: List[str] = Field(default_factory=list)
    reasons_to_caution: List[str] = Field(default_factory=list)

class ClarificationQuestion(BaseModel):
    category: str
    question: str
    importance: str = "Medium"  # High, Medium, Low
    rationale: str

class DiscoveryQuestionsReport(BaseModel):
    questions: List[ClarificationQuestion] = Field(default_factory=list)
    client_email_draft: str = ""
    questionnaire_markdown: str = ""

class OpportunityIntelligence(BaseModel):
    opportunity_id: Optional[str] = None
    title: str
    requirements: ExtractedRequirements
    scoring: OpportunityScore
    discovery: DiscoveryQuestionsReport

class MilestoneItem(BaseModel):
    id: str
    phase: Any = "Phase 1"
    title: str
    description: str = ""
    deliverables: List[str] = Field(default_factory=list)
    est_hours: float
    rate: float
    contingency_percent: float = 15.0
    subtotal: float
    contingency_cost: float
    total_cost: float
    duration_weeks: float = 1.0

class RiskAssessmentItem(BaseModel):
    id: str
    category: str  # Technical, Scope, Integration, Client Dependency
    risk: str
    severity: str = "Medium"  # High, Medium, Low
    probability: str = "Medium"  # High, Medium, Low
    impact: str = ""
    mitigation: str = ""
    contractual_assumption: Optional[str] = ""

class PaymentMilestone(BaseModel):
    name: str
    percentage: float
    amount: float
    trigger: str

class PricingTierFixed(BaseModel):
    subtotal: float
    contingency_buffer_percent: float
    contingency_buffer_cost: float
    total_price: float
    effective_hourly_rate: float
    min_project_floor: float
    payment_schedule: List[PaymentMilestone] = Field(default_factory=list)

class PricingTierTimeMaterials(BaseModel):
    hourly_rate: float
    estimated_hours_min: float
    estimated_hours_max: float
    estimated_cost_min: float
    estimated_cost_max: float
    not_to_exceed_cap: float
    billing_cycle: str = "Weekly invoice against approved timesheet"

class PricingTierRetainer(BaseModel):
    estimated_duration_weeks: float
    weekly_rate: float
    monthly_rate: float
    committed_hours_per_week: float
    includes_support_maintenance: bool = True

class PricingTiersSummary(BaseModel):
    fixed_price: PricingTierFixed
    time_and_materials: PricingTierTimeMaterials
    retainer: PricingTierRetainer
    recommended_model: str = "fixed_price"
    currency: str = "USD"

class ProjectEstimation(BaseModel):
    opportunity_id: str
    currency: str = "USD"
    hourly_rate: float
    contingency_percent: float
    total_hours: float
    estimated_duration_weeks: float
    pricing_model: str = "fixed_price"
    milestones: List[MilestoneItem] = Field(default_factory=list)
    pricing_tiers: PricingTiersSummary
    risks: List[RiskAssessmentItem] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class EstimationRecalculateRequest(BaseModel):
    hourly_rate: Optional[float] = None
    contingency_percent: Optional[float] = None
    pricing_model: Optional[str] = None
    milestones: Optional[List[MilestoneItem]] = None
    risks: Optional[List[RiskAssessmentItem]] = None
    assumptions: Optional[List[str]] = None

class ProposalCreate(BaseModel):
    opportunity_id: str
    title: str
    content_markdown: Optional[str] = ""
    milestones: Optional[List[MilestoneItem]] = None
    risks: Optional[List[RiskAssessmentItem]] = None
    price_estimate: Optional[float] = None
    audio_script: Optional[str] = None
    status: Optional[str] = "draft"

class ProposalUpdateRequest(BaseModel):
    title: Optional[str] = None
    content_markdown: Optional[str] = None
    milestones: Optional[List[MilestoneItem]] = None
    risks: Optional[List[RiskAssessmentItem]] = None
    price_estimate: Optional[float] = None
    audio_script: Optional[str] = None
    status: Optional[str] = None

class ProposalSectionRegenerateRequest(BaseModel):
    section_key: str  # executive_summary, architecture, milestones_wbs, risk_mitigation, commercial_terms
    custom_instructions: Optional[str] = None

class ProposalExportResponse(BaseModel):
    id: str
    title: str
    html_content: str
    markdown_content: str

class OpportunityResponse(BaseModel):
    id: str
    client_id: Optional[str] = None
    company: Optional[str] = None
    title: str
    raw_content: str
    source_type: str
    source_url: Optional[str] = None
    budget_range: Optional[str] = None
    deadline: Optional[str] = None
    tech_stack: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[str] = None
    requirements_json: Optional[str] = None
    scoring_json: Optional[str] = None
    clarification_questions_json: Optional[str] = None
    estimation_json: Optional[str] = None
    fit_score: Optional[float] = None
    recommendation: Optional[str] = None
    status: str
    is_demo: Optional[bool] = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProposalResponse(BaseModel):
    id: str
    opportunity_id: str
    title: str
    content_markdown: str
    milestones_json: Optional[str] = None
    risk_register_json: Optional[str] = None
    price_estimate: Optional[float] = None
    audio_path: Optional[str] = None
    audio_script: Optional[str] = None
    status: str
    is_demo: Optional[bool] = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProfileBase(BaseModel):
    full_name: Optional[str] = ""
    title: Optional[str] = ""
    bio: Optional[str] = None
    hourly_rate: float = 0.0
    currency: Optional[str] = "USD"
    timezone: Optional[str] = "UTC"
    availability_hours_per_week: Optional[float] = 40.0
    skills: Optional[str] = None
    experience_years: Optional[float] = None
    preferred_categories: Optional[str] = None
    preferred_ai_provider: Optional[str] = "ollama"
    preferred_ai_model: Optional[str] = "gemma3:1b"
    onboarding_completed: bool = False

class OnboardingRequest(BaseModel):
    full_name: str
    title: str
    skills: Optional[str] = None
    hourly_rate: float = 0.0
    currency: Optional[str] = "USD"
    timezone: Optional[str] = "UTC"
    availability_hours_per_week: Optional[float] = 40.0
    experience_years: Optional[float] = None
    preferred_categories: Optional[str] = None
    preferred_ai_provider: Optional[str] = "ollama"
    preferred_ai_model: Optional[str] = "gemma3:1b"

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None
    availability_hours_per_week: Optional[float] = None
    skills: Optional[str] = None
    experience_years: Optional[float] = None
    preferred_categories: Optional[str] = None
    preferred_ai_provider: Optional[str] = None
    preferred_ai_model: Optional[str] = None
    onboarding_completed: Optional[bool] = None

class ProfileResponse(ProfileBase):
    id: str
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CaseStudyCreate(BaseModel):
    title: str
    summary: Optional[str] = None
    content: Optional[str] = None  # Backward compatibility alias
    client_industry: Optional[str] = None
    role: Optional[str] = None
    tech_stack: List[str] = Field(default_factory=list)
    outcomes: List[str] = Field(default_factory=list)
    metrics: Dict[str, str] = Field(default_factory=dict)
    testimonial_quote: Optional[str] = None
    link_url: Optional[str] = None
    doc_id: Optional[str] = None

    def get_effective_summary(self) -> str:
        return self.summary or self.content or ""

class CaseStudyUpdate(BaseModel):
    title: Optional[str] = None
    client_industry: Optional[str] = None
    role: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    outcomes: Optional[List[str]] = None
    metrics: Optional[Dict[str, str]] = None
    testimonial_quote: Optional[str] = None
    link_url: Optional[str] = None

class CaseStudyResponse(BaseModel):
    id: str
    title: str
    client_industry: Optional[str] = None
    role: Optional[str] = None
    tech_stack: List[str] = Field(default_factory=list)
    summary: str
    content: Optional[str] = None
    outcomes: List[str] = Field(default_factory=list)
    metrics: Dict[str, str] = Field(default_factory=dict)
    testimonial_quote: Optional[str] = None
    link_url: Optional[str] = None
    is_demo: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CaseStudySearchResult(BaseModel):
    case_study: CaseStudyResponse
    relevance_score: float
    matched_terms: List[str] = Field(default_factory=list)
    citation_preview: str

class PortfolioListResponse(BaseModel):
    count: int
    items: List[CaseStudyResponse]
    industries: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)

# --- Phase 7 Project Execution & Scope Guard Schemas ---

class ProjectTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    milestone_id: Optional[str] = None
    status: Optional[str] = "todo"  # todo, in_progress, review, done
    priority: Optional[str] = "medium"  # low, medium, high, urgent
    estimated_hours: Optional[float] = 0.0
    actual_hours: Optional[float] = 0.0
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    notes: Optional[str] = None
    is_scope_change: Optional[bool] = False
    order_index: Optional[float] = 0.0

class ProjectTaskCreate(ProjectTaskBase):
    pass

class ProjectTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    milestone_id: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    notes: Optional[str] = None
    is_scope_change: Optional[bool] = None
    order_index: Optional[float] = None

class ProjectTaskResponse(ProjectTaskBase):
    id: str
    project_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    client_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    proposal_id: Optional[str] = None
    pricing_model: Optional[str] = "fixed"
    total_budget: Optional[float] = 0.0
    hourly_rate: Optional[float] = 75.0
    estimated_hours: Optional[float] = 0.0
    status: Optional[str] = "active"
    from_proposal_id: Optional[str] = None
    milestones_baseline_json: Optional[str] = None
    initial_tasks: Optional[List[ProjectTaskCreate]] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # active, on_hold, completed, cancelled
    pricing_model: Optional[str] = None
    total_budget: Optional[float] = None
    hourly_rate: Optional[float] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None

class ProjectResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    client_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    proposal_id: Optional[str] = None
    status: str
    pricing_model: str
    total_budget: float
    hourly_rate: float
    estimated_hours: float
    actual_hours: float
    milestones_baseline_json: Optional[str] = None
    tasks_count: int = 0
    tasks_completed_count: int = 0
    progress_percent: float = 0.0
    tasks: List[ProjectTaskResponse] = Field(default_factory=list)
    is_demo: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ScopeCheckRequest(BaseModel):
    new_request_text: str
    client_name: Optional[str] = None

class ScopeCheckResponse(BaseModel):
    is_scope_creep: bool
    confidence_score: float
    scope_status: str  # in_scope, probable_scope_creep, definitive_scope_creep
    analysis_summary: str
    matched_milestones: List[str] = Field(default_factory=list)
    out_of_scope_items: List[str] = Field(default_factory=list)
    estimated_impact_hours: float = 0.0
    suggested_change_order_cost: float = 0.0
    suggested_client_response: str = ""

# --- Phase 8 Client Communications & Reporting Hub Schemas ---

class ClientReportRequest(BaseModel):
    report_type: str = "weekly_update"  # weekly_update, milestone_signoff, blocker_alert
    milestone_id: Optional[str] = None
    custom_notes: Optional[str] = None
    client_name: Optional[str] = None
    include_time_breakdown: bool = True

class ClientReportResponse(BaseModel):
    project_id: str
    project_title: str
    report_type: str
    report_title: str
    executive_summary: str
    completed_deliverables: List[str] = Field(default_factory=list)
    in_progress_deliverables: List[str] = Field(default_factory=list)
    upcoming_deliverables: List[str] = Field(default_factory=list)
    blockers: List[str] = Field(default_factory=list)
    total_estimated_hours: float = 0.0
    total_actual_hours: float = 0.0
    total_budget: float = 0.0
    budget_burned: float = 0.0
    budget_burn_percent: float = 0.0
    email_subject: str = ""
    email_body_markdown: str = ""
    generated_at: str = ""

# --- Phase 9 Invoicing, Retainers & Financial Health Hub Schemas ---

class InvoiceLineItem(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price: float = 0.0
    amount: float = 0.0

class InvoiceCreate(BaseModel):
    title: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    billing_model: Optional[str] = "fixed"  # fixed, time_and_materials, retainer
    invoice_number: Optional[str] = None
    issue_date: Optional[str] = None
    due_date: Optional[str] = None
    currency: Optional[str] = "USD"
    tax_rate: Optional[float] = 0.0
    line_items: List[InvoiceLineItem] = Field(default_factory=list)
    notes: Optional[str] = None
    payment_terms: Optional[str] = "Net 15"
    payment_instructions: Optional[str] = None
    generate_from_milestone_id: Optional[str] = None
    generate_from_unbilled_hours: Optional[bool] = False

class InvoiceUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None  # draft, issued, paid, overdue, cancelled
    due_date: Optional[str] = None
    paid_at: Optional[datetime] = None
    notes: Optional[str] = None
    payment_instructions: Optional[str] = None
    line_items: Optional[List[InvoiceLineItem]] = None

class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    project_id: Optional[str] = None
    project_title: Optional[str] = None
    title: str
    status: str
    billing_model: str
    issue_date: Optional[str] = None
    due_date: Optional[str] = None
    paid_at: Optional[datetime] = None
    currency: str = "USD"
    subtotal: float
    tax_rate: float
    tax_amount: float
    total_amount: float
    line_items: List[InvoiceLineItem] = Field(default_factory=list)
    notes: Optional[str] = None
    payment_terms: Optional[str] = None
    payment_instructions: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class FinancialHealthMetrics(BaseModel):
    total_invoiced: float = 0.0
    total_collected: float = 0.0
    outstanding_receivables: float = 0.0
    overdue_amount: float = 0.0
    draft_invoices_amount: float = 0.0
    active_projects_count: int = 0
    total_hours_logged: float = 0.0
    average_realized_hourly_rate: float = 0.0
    currency: str = "USD"
    recent_invoices: List[InvoiceResponse] = Field(default_factory=list)

