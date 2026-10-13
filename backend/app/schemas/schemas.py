from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ClientBase(BaseModel):
    name: str
    company: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class OpportunityCreate(BaseModel):
    title: str
    raw_content: str
    client_name: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    source_type: Optional[str] = "text"
    budget_range: Optional[str] = None
    deadline: Optional[str] = None
    tech_stack: Optional[str] = None

class OpportunityResponse(BaseModel):
    id: str
    client_id: Optional[str] = None
    title: str
    raw_content: str
    source_type: str
    budget_range: Optional[str] = None
    deadline: Optional[str] = None
    tech_stack: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProposalResponse(BaseModel):
    id: str
    opportunity_id: str
    title: str
    content_markdown: str
    milestones_json: Optional[str] = None
    risk_register_json: Optional[str] = None
    price_estimate: Optional[float] = None
    audio_path: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = None
    skills: Optional[str] = None

class ProfileResponse(BaseModel):
    id: str
    full_name: str
    title: str
    bio: Optional[str] = None
    hourly_rate: float
    skills: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

# ISO-8601 datetime serialization
