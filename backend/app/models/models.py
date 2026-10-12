import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Float
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
    status = Column(String(50), default="pending")  # pending, analyzing, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("Client", back_populates="opportunities")
    proposals = relationship("Proposal", back_populates="opportunity", cascade="all, delete-orphan")

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
    status = Column(String(50), default="draft")  # draft, ready, sent, accepted
    created_at = Column(DateTime, default=datetime.utcnow)

    opportunity = relationship("Opportunity", back_populates="proposals")

class FreelancerProfile(Base):
    __tablename__ = "freelancer_profile"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(255), nullable=False, default="Senior Autonomous Consultant")
    title = Column(String(255), nullable=False, default="Full-Stack AI & Cloud Architect")
    bio = Column(Text, nullable=True)
    hourly_rate = Column(Float, default=125.0)
    skills = Column(Text, nullable=True)  # comma separated or json
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
