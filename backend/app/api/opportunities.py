import uuid
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from ..database import get_db, AsyncSessionLocal
from ..models.models import Opportunity, Client, Proposal
from ..schemas.schemas import OpportunityCreate, OpportunityResponse
from ..tools.doc_parser import DocumentParser
from ..agent.workflow import FreelanceAgentWorkflow
from ..config import settings

router = APIRouter(prefix="/api/opportunities", tags=["Opportunities"])

async def run_autonomous_desk(opportunity_id: str, title: str, content: str, company: str):
    async with AsyncSessionLocal() as db:
        opp = (await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))).scalar_one_or_none()
        if not opp:
            return
        opp.status = "analyzing"
        await db.commit()

        try:
            workflow = FreelanceAgentWorkflow()
            result = await workflow.execute_brief_analysis(
                opportunity_id=opportunity_id,
                title=title,
                content=content,
                company=company
            )

            proposal = Proposal(
                opportunity_id=opportunity_id,
                title=result["proposal_title"],
                content_markdown=result["content_markdown"],
                milestones_json=result["milestones_json"],
                risk_register_json=result["risk_register_json"],
                price_estimate=result["price_estimate"],
                audio_path=result["audio_path"],
                status="ready"
            )
            db.add(proposal)
            opp.status = "completed"
            await db.commit()
        except Exception as e:
            print(f"[Autonomous Desk Pipeline Error]: {e}")
            opp.status = "failed"
            await db.commit()

@router.post("", response_model=OpportunityResponse)
async def create_opportunity(
    payload: OpportunityCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    client_id = None
    if payload.client_name or payload.company:
        client = Client(
            name=payload.client_name or payload.company or "Prospective Client",
            company=payload.company,
            website=payload.website
        )
        db.add(client)
        await db.flush()
        client_id = client.id

    opp = Opportunity(
        client_id=client_id,
        title=payload.title,
        raw_content=payload.raw_content,
        source_type=payload.source_type or "text",
        budget_range=payload.budget_range,
        deadline=payload.deadline,
        tech_stack=payload.tech_stack,
        status="pending"
    )
    db.add(opp)
    await db.commit()
    await db.refresh(opp)

    background_tasks.add_task(
        run_autonomous_desk,
        opportunity_id=opp.id,
        title=opp.title,
        content=opp.raw_content,
        company=payload.company or ""
    )

    return opp

@router.post("/upload", response_model=OpportunityResponse)
async def upload_brief_document(
    title: str = Form(...),
    company: Optional[str] = Form(None),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db)
):
    save_path = settings.UPLOADS_DIR / f"{uuid.uuid4()}_{file.filename}"
    content_bytes = await file.read()
    with open(save_path, "wb") as f:
        f.write(content_bytes)

    extracted_text = DocumentParser.parse_file(save_path)
    if not extracted_text:
        extracted_text = f"[Uploaded document: {file.filename}]"

    opp_create = OpportunityCreate(
        title=title,
        raw_content=extracted_text,
        company=company,
        source_type="file"
    )
    return await create_opportunity(opp_create, background_tasks, db)

@router.get("", response_model=List[OpportunityResponse])
async def list_opportunities(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Opportunity).order_by(Opportunity.created_at.desc()))
    return result.scalars().all()

@router.get("/{id}", response_model=OpportunityResponse)
async def get_opportunity(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Opportunity).where(Opportunity.id == id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp
