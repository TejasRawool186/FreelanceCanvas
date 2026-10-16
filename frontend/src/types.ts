export interface Opportunity {
  id: string;
  client_id?: string;
  company?: string;
  title: string;
  raw_content: string;
  source_type: string;
  budget_range?: string;
  deadline?: string;
  tech_stack?: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  created_at: string;
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
  status: 'draft' | 'ready' | 'sent' | 'accepted';
  created_at: string;
}

export interface FreelancerProfile {
  id: string;
  full_name: string;
  title: string;
  bio?: string;
  hourly_rate: number;
  skills?: string;
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
