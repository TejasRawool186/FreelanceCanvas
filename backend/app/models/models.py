import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Client(Base):
    __tablename__ = "clients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    website = Column(String(512), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    opportunities = relationship("Opportunity", back_populates="client", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="client")
    invoices = relationship("Invoice", back_populates="client")

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=True)
    title = Column(String(255), nullable=False)
    raw_content = Column(Text, nullable=False)
    source_type = Column(String(50), default="text")  # text, pdf, url
    budget_range = Column(String(100), nullable=True)
    deadline = Column(String(100), nullable=True)
    tech_stack = Column(String(255), nullable=True)
    status = Column(String(50), default="draft")  # draft, ready_for_analysis, analyzing, completed, failed, archived
    source_url = Column(String(512), nullable=True)
    notes = Column(Text, nullable=True)
    tags = Column(String(255), nullable=True)
    requirements_json = Column(Text, nullable=True)
    scoring_json = Column(Text, nullable=True)
    clarification_questions_json = Column(Text, nullable=True)
    estimation_json = Column(Text, nullable=True)
    fit_score = Column(Float, nullable=True)
    recommendation = Column(String(50), nullable=True)  # Pursue, Request Clarification, Renegotiate, Skip
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("Client", back_populates="opportunities")
    proposals = relationship("Proposal", back_populates="opportunity", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="opportunity")

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content_markdown = Column(Text, nullable=False)
    milestones_json = Column(Text, nullable=True)
    risk_register_json = Column(Text, nullable=True)
    price_estimate = Column(Float, nullable=True)
    audio_path = Column(String(512), nullable=True)
    audio_script = Column(Text, nullable=True)
    status = Column(String(50), default="draft")  # draft, ready, sent, accepted
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    opportunity = relationship("Opportunity", back_populates="proposals")
    projects = relationship("Project", back_populates="proposal")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=True)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=True)
    proposal_id = Column(String(36), ForeignKey("proposals.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="active")  # active, on_hold, completed, cancelled
    pricing_model = Column(String(50), default="fixed")  # fixed, time_and_materials, retainer
    total_budget = Column(Float, default=0.0)
    hourly_rate = Column(Float, default=0.0)
    estimated_hours = Column(Float, default=0.0)
    actual_hours = Column(Float, default=0.0)
    milestones_baseline_json = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("Client", back_populates="projects")
    opportunity = relationship("Opportunity", back_populates="projects")
    proposal = relationship("Proposal", back_populates="projects")
    tasks = relationship("ProjectTask", back_populates="project", cascade="all, delete-orphan", order_by="ProjectTask.order_index")
    invoices = relationship("Invoice", back_populates="project")

class ProjectTask(Base):
    __tablename__ = "project_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    milestone_id = Column(String(100), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="todo")  # todo, in_progress, review, done
    priority = Column(String(50), default="medium")  # low, medium, high, urgent
    estimated_hours = Column(Float, default=0.0)
    actual_hours = Column(Float, default=0.0)
    assignee = Column(String(100), nullable=True)
    due_date = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    is_scope_change = Column(Boolean, default=False)
    order_index = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")

class FreelancerProfile(Base):
    __tablename__ = "freelancer_profile"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(255), nullable=True, default="")
    title = Column(String(255), nullable=True, default="")
    bio = Column(Text, nullable=True)
    hourly_rate = Column(Float, default=0.0)
    currency = Column(String(10), default="USD")
    timezone = Column(String(50), default="UTC")
    availability_hours_per_week = Column(Float, nullable=True, default=40.0)
    skills = Column(Text, nullable=True)  # comma separated or json
    experience_years = Column(Float, nullable=True)
    preferred_categories = Column(Text, nullable=True)
    preferred_ai_provider = Column(String(50), default="ollama")
    preferred_ai_model = Column(String(100), default="gemma3:1b")
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CaseStudy(Base):
    __tablename__ = "case_studies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    client_industry = Column(String(100), nullable=True)
    role = Column(String(150), nullable=True)
    tech_stack = Column(Text, nullable=True)  # JSON array string or comma separated
    summary = Column(Text, nullable=False)
    outcomes = Column(Text, nullable=True)  # JSON array string
    metrics = Column(Text, nullable=True)  # JSON object string
    testimonial_quote = Column(Text, nullable=True)
    link_url = Column(String(512), nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_number = Column(String(50), nullable=False, unique=True)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="draft")  # draft, issued, paid, overdue, cancelled
    billing_model = Column(String(50), default="fixed")  # fixed, time_and_materials, retainer
    issue_date = Column(String(50), nullable=True)
    due_date = Column(String(50), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    currency = Column(String(10), default="USD")
    subtotal = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    line_items_json = Column(Text, nullable=False, default="[]")
    notes = Column(Text, nullable=True)
    payment_terms = Column(String(100), default="Net 15")
    payment_instructions = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("Client", back_populates="invoices")
    project = relationship("Project", back_populates="invoices")
