from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from ..database import get_db
from ..models.models import FreelancerProfile, Opportunity, Proposal, Client
from ..schemas.schemas import ProfileResponse, ProfileUpdate, OnboardingRequest, CaseStudyCreate
from ..tools.portfolio_store import PortfolioVectorStore
from ..config import settings
import httpx

router = APIRouter(prefix="/api/profile", tags=["Freelancer Profile"])
portfolio_store = PortfolioVectorStore()

@router.get("", response_model=ProfileResponse)
async def get_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FreelancerProfile).limit(1))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = FreelancerProfile(
            full_name="",
            title="",
            bio="",
            hourly_rate=0.0,
            currency="USD",
            timezone="UTC",
            availability_hours_per_week=40.0,
            skills="",
            onboarding_completed=False
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile

@router.post("/onboarding", response_model=ProfileResponse)
async def complete_onboarding(payload: OnboardingRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FreelancerProfile).limit(1))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = FreelancerProfile()
        db.add(profile)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    profile.onboarding_completed = True
    await db.commit()
    await db.refresh(profile)
    return profile

@router.put("", response_model=ProfileResponse)
async def update_profile(payload: ProfileUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FreelancerProfile).limit(1))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = FreelancerProfile()
        db.add(profile)

    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile

@router.get("/integrations")
async def get_integrations_status():
    ollama_online = False
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            ollama_online = (resp.status_code == 200)
    except Exception:
        ollama_online = False

    return {
        "ollama": {
            "name": "Local LLM (Ollama)",
            "connected": ollama_online,
            "model": settings.OLLAMA_MODEL,
            "url": settings.OLLAMA_BASE_URL
        },
        "serpapi": {
            "name": "SerpApi (Client Web Reconnaissance)",
            "configured": bool(settings.SERPAPI_API_KEY)
        },
        "elevenlabs": {
            "name": "ElevenLabs (Executive Audio Briefings)",
            "configured": bool(settings.ELEVENLABS_API_KEY)
        }
    }

@router.post("/demo/load")
async def load_demo_dataset(db: AsyncSession = Depends(get_db)):
    """Loads a clearly labeled demo opportunity for exploring the workspace."""
    # Check if demo already exists
    existing = await db.execute(select(Opportunity).where(Opportunity.is_demo == True))
    if existing.scalar_one_or_none():
        return {"status": "info", "message": "Demo opportunity is already loaded."}

    client = Client(
        name="[DEMO] NextWave Logistics",
        company="NextWave Telematics Inc.",
        website="https://example.com/demo-nextwave",
        notes="Demo prospect for fleet monitoring dashboard RFP."
    )
    db.add(client)
    await db.flush()

    opp = Opportunity(
        client_id=client.id,
        title="[DEMO] Real-Time Fleet Telemetry & Predictive Maintenance API",
        raw_content="""We require a senior software consultant to design and build an MVP for fleet telemetry tracking.
Key Requirements:
1. Real-time GPS ingest from 500+ commercial vehicles.
2. Anomaly detection for engine diagnostics (OBD-II data streams).
3. Secure REST API and WebSocket feed for front-office dispatcher dashboard.
4. Clean Dockerized microservices architecture with automated tests.
Target timeline is 4 weeks, with an estimated initial budget of $7,500-$10,000.""",
        source_type="text",
        budget_range="$7,500 - $10,000",
        deadline="4 weeks",
        tech_stack="Python, FastAPI, Redis, PostgreSQL, React",
        status="completed",
        is_demo=True
    )
    db.add(opp)
    await db.flush()

    proposal = Proposal(
        opportunity_id=opp.id,
        title="[DEMO] Technical Architecture & MVP Proposal: NextWave Telematics",
        content_markdown="""# Technical Architecture & MVP Proposal: NextWave Telematics

## 1. Executive Summary & Problem Understanding
NextWave Telematics requires a real-time tracking and predictive diagnostics backend capable of ingesting high-throughput OBD-II telemetry from 500+ commercial vehicles. Our proposed solution utilizes an event-driven architecture designed for zero data loss, sub-50ms ingestion latency, and strict schema validation.

## 2. Proposed System Architecture
- **Ingestion Engine:** FastAPI asynchronous endpoints with Redis Stream buffering for burst resistance.
- **Diagnostics Service:** Scheduled worker analyzing sensor anomalies (fuel variance, oil pressure spikes).
- **Dispatcher Feed:** Secure WebSockets streaming real-time geofence alerts to the React frontend.
- **Persistence:** Time-series tables in PostgreSQL with automated daily partitioned rollups.

## 3. Phased Milestones & Deliverables Schedule
- **Milestone 1:** Telemetry ingestion pipeline, Redis buffer, and schema validators.
- **Milestone 2:** WebSocket broadcast layer and live map dispatch API.
- **Milestone 3:** Anomaly detection heuristics, integration tests, and production Docker bundle.
""",
        milestones_json='[{"phase": "Milestone 1", "title": "Ingestion Pipeline & Schema Validators", "est_hours": 20, "cost": 2400.0}, {"phase": "Milestone 2", "title": "WebSocket Stream & Dispatch API", "est_hours": 25, "cost": 3000.0}, {"phase": "Milestone 3", "title": "Anomaly Heuristics, Docker & Tests", "est_hours": 15, "cost": 1800.0}]',
        risk_register_json='[{"risk": "High-frequency burst spikes during fleet shift changes", "severity": "Medium", "mitigation": "Redis Stream queue buffering with backpressure handling"}, {"risk": "Intermittent cellular packet drops from remote vehicles", "severity": "Low", "mitigation": "Idempotent packet sequencing and client-side retry replay"}]',
        price_estimate=7200.0,
        status="ready",
        is_demo=True
    )
    db.add(proposal)
    await db.commit()

    return {"status": "success", "message": "Demo opportunity and sample proposal loaded successfully."}

@router.post("/demo/clear")
async def clear_demo_dataset(db: AsyncSession = Depends(get_db)):
    """Removes all demo dataset records."""
    await db.execute(delete(Proposal).where(Proposal.is_demo == True))
    await db.execute(delete(Opportunity).where(Opportunity.is_demo == True))
    await db.commit()
    return {"status": "success", "message": "Demo dataset removed."}

import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from ..models.models import FreelancerProfile, Opportunity, Proposal, Client, CaseStudy
from ..schemas.schemas import (
    ProfileResponse,
    ProfileUpdate,
    OnboardingRequest,
    CaseStudyCreate,
    CaseStudyUpdate,
    CaseStudyResponse,
    CaseStudySearchResult,
    PortfolioListResponse
)

def _case_study_to_response(cs: CaseStudy) -> CaseStudyResponse:
    tech = json.loads(cs.tech_stack) if cs.tech_stack and cs.tech_stack.startswith("[") else ([t.strip() for t in (cs.tech_stack or "").split(",") if t.strip()])
    outcomes = json.loads(cs.outcomes) if cs.outcomes and cs.outcomes.startswith("[") else []
    metrics = json.loads(cs.metrics) if cs.metrics and cs.metrics.startswith("{") else {}

    return CaseStudyResponse(
        id=cs.id,
        title=cs.title,
        client_industry=cs.client_industry,
        role=cs.role,
        tech_stack=tech,
        summary=cs.summary,
        content=cs.summary,
        outcomes=outcomes,
        metrics=metrics,
        testimonial_quote=cs.testimonial_quote,
        link_url=cs.link_url,
        is_demo=cs.is_demo or False,
        created_at=cs.created_at,
        updated_at=cs.updated_at
    )

@router.get("/portfolio", response_model=PortfolioListResponse)
async def get_portfolio(db: AsyncSession = Depends(get_db)):
    """List all portfolio case studies with industry and technology metrics."""
    result = await db.execute(select(CaseStudy).order_by(CaseStudy.created_at.desc()))
    records = result.scalars().all()

    # Sync any seed/store items not yet in SQLite table
    existing_ids = {r.id for r in records}
    store_items = portfolio_store.list_all_case_studies()
    added_any = False
    for item in store_items:
        doc_id = item.get("doc_id")
        if doc_id and doc_id not in existing_ids:
            cs = CaseStudy(
                id=doc_id,
                title=item.get("title", ""),
                client_industry=item.get("client_industry", ""),
                role=item.get("role", ""),
                tech_stack=json.dumps(item.get("tech_stack", [])),
                summary=item.get("summary") or item.get("content", ""),
                outcomes=json.dumps(item.get("outcomes", [])),
                metrics=json.dumps(item.get("metrics", {})),
                testimonial_quote=item.get("testimonial_quote", ""),
                link_url=item.get("link_url", "")
            )
            db.add(cs)
            added_any = True

    if added_any:
        await db.commit()
        result = await db.execute(select(CaseStudy).order_by(CaseStudy.created_at.desc()))
        records = result.scalars().all()

    items = [_case_study_to_response(cs) for cs in records]
    industries = sorted(list(set(i.client_industry for i in items if i.client_industry)))
    technologies = sorted(list(set(t for i in items for t in i.tech_stack)))

    return PortfolioListResponse(
        count=len(items),
        items=items,
        industries=industries,
        technologies=technologies
    )

@router.post("/portfolio", response_model=CaseStudyResponse)
async def add_case_study(payload: CaseStudyCreate, db: AsyncSession = Depends(get_db)):
    """Add a new case study to SQLite and index it in the RAG vector store."""
    cs_id = payload.doc_id or str(uuid.uuid4())
    summary = payload.get_effective_summary()

    cs = CaseStudy(
        id=cs_id,
        title=payload.title,
        client_industry=payload.client_industry,
        role=payload.role,
        tech_stack=json.dumps(payload.tech_stack),
        summary=summary,
        outcomes=json.dumps(payload.outcomes),
        metrics=json.dumps(payload.metrics),
        testimonial_quote=payload.testimonial_quote,
        link_url=payload.link_url
    )
    db.add(cs)
    await db.commit()
    await db.refresh(cs)

    # Index in RAG vector store
    portfolio_store.add_case_study(
        doc_id=cs.id,
        title=cs.title,
        content=summary,
        tech_stack=payload.tech_stack,
        client_industry=payload.client_industry or "",
        role=payload.role or "",
        outcomes=payload.outcomes,
        metrics=payload.metrics,
        testimonial_quote=payload.testimonial_quote or "",
        link_url=payload.link_url or ""
    )

    return _case_study_to_response(cs)

@router.get("/portfolio/{id}", response_model=CaseStudyResponse)
async def get_case_study(id: str, db: AsyncSession = Depends(get_db)):
    """Fetch single case study by ID."""
    result = await db.execute(select(CaseStudy).where(CaseStudy.id == id))
    cs = result.scalar_one_or_none()
    if not cs:
        raise HTTPException(status_code=404, detail="Case study not found")
    return _case_study_to_response(cs)

@router.put("/portfolio/{id}", response_model=CaseStudyResponse)
async def update_case_study(id: str, payload: CaseStudyUpdate, db: AsyncSession = Depends(get_db)):
    """Update existing case study."""
    result = await db.execute(select(CaseStudy).where(CaseStudy.id == id))
    cs = result.scalar_one_or_none()
    if not cs:
        raise HTTPException(status_code=404, detail="Case study not found")

    if payload.title is not None:
        cs.title = payload.title
    if payload.client_industry is not None:
        cs.client_industry = payload.client_industry
    if payload.role is not None:
        cs.role = payload.role
    if payload.tech_stack is not None:
        cs.tech_stack = json.dumps(payload.tech_stack)
    if payload.summary is not None or payload.content is not None:
        cs.summary = payload.summary or payload.content or cs.summary
    if payload.outcomes is not None:
        cs.outcomes = json.dumps(payload.outcomes)
    if payload.metrics is not None:
        cs.metrics = json.dumps(payload.metrics)
    if payload.testimonial_quote is not None:
        cs.testimonial_quote = payload.testimonial_quote
    if payload.link_url is not None:
        cs.link_url = payload.link_url

    await db.commit()
    await db.refresh(cs)

    # Re-index in RAG store
    tech = json.loads(cs.tech_stack) if cs.tech_stack and cs.tech_stack.startswith("[") else []
    outcomes = json.loads(cs.outcomes) if cs.outcomes and cs.outcomes.startswith("[") else []
    metrics = json.loads(cs.metrics) if cs.metrics and cs.metrics.startswith("{") else {}
    portfolio_store.add_case_study(
        doc_id=cs.id,
        title=cs.title,
        content=cs.summary,
        tech_stack=tech,
        client_industry=cs.client_industry or "",
        role=cs.role or "",
        outcomes=outcomes,
        metrics=metrics,
        testimonial_quote=cs.testimonial_quote or "",
        link_url=cs.link_url or ""
    )

    return _case_study_to_response(cs)

@router.delete("/portfolio/{id}")
async def delete_case_study(id: str, db: AsyncSession = Depends(get_db)):
    """Delete a case study from database and RAG store."""
    result = await db.execute(select(CaseStudy).where(CaseStudy.id == id))
    cs = result.scalar_one_or_none()
    if not cs:
        raise HTTPException(status_code=404, detail="Case study not found")

    await db.execute(delete(CaseStudy).where(CaseStudy.id == id))
    await db.commit()
    portfolio_store.delete_case_study(id)

    return {"status": "success", "message": f"Case study '{cs.title}' deleted successfully."}

@router.post("/portfolio/search", response_model=List[CaseStudySearchResult])
async def search_portfolio(query: str, limit: int = 4):
    """Interactive RAG semantic search endpoint to test retrieval quality."""
    hits = portfolio_store.search_relevant_experience(query=query, limit=limit)
    results = []
    for hit in hits:
        cs_resp = CaseStudyResponse(
            id=hit.get("doc_id", ""),
            title=hit.get("title", ""),
            client_industry=hit.get("client_industry"),
            role=hit.get("role"),
            tech_stack=hit.get("tech_stack", []),
            summary=hit.get("summary") or hit.get("content", ""),
            content=hit.get("summary") or hit.get("content", ""),
            outcomes=hit.get("outcomes", []),
            metrics=hit.get("metrics", {}),
            testimonial_quote=hit.get("testimonial_quote"),
            link_url=hit.get("link_url"),
            is_demo=False,
            created_at=datetime.now(timezone.utc)
        )
        results.append(CaseStudySearchResult(
            case_study=cs_resp,
            relevance_score=hit.get("relevance_score", 0.0),
            matched_terms=hit.get("matched_terms", []),
            citation_preview=hit.get("citation_preview", "")
        ))
    return results
