from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.models import FreelancerProfile
from ..schemas.schemas import ProfileResponse, ProfileUpdate
from ..tools.portfolio_store import PortfolioVectorStore

router = APIRouter(prefix="/api/profile", tags=["Freelancer Profile"])
portfolio_store = PortfolioVectorStore()

@router.get("", response_model=ProfileResponse)
async def get_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FreelancerProfile).limit(1))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = FreelancerProfile(
            full_name="Alex Mercer",
            title="Senior Autonomous Consultant & AI Architect",
            bio="10+ years engineering scalable applications, local LLM pipelines, and resilient backend systems.",
            hourly_rate=140.0,
            skills="Python, FastAPI, TypeScript, React, Docker, Qdrant, Ollama, LangGraph"
        )
        db.add(profile)
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

    if payload.full_name is not None:
        profile.full_name = payload.full_name
    if payload.title is not None:
        profile.title = payload.title
    if payload.bio is not None:
        profile.bio = payload.bio
    if payload.hourly_rate is not None:
        profile.hourly_rate = payload.hourly_rate
    if payload.skills is not None:
        profile.skills = payload.skills

    await db.commit()
    await db.refresh(profile)
    return profile

@router.post("/portfolio")
async def add_case_study(payload: dict):
    title = payload.get("title", "Past Project")
    content = payload.get("content", "")
    tech_stack = payload.get("tech_stack", [])
    doc_id = payload.get("doc_id", title.lower().replace(" ", "_"))

    portfolio_store.add_case_study(doc_id=doc_id, title=title, content=content, tech_stack=tech_stack)
    return {"status": "success", "message": f"Case study '{title}' indexed in Qdrant."}

# Profile payload validation
