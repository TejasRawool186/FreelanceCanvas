import re
import json
import uuid
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete
from ..database import get_db, AsyncSessionLocal
from ..models.models import Opportunity, Client, Proposal, FreelancerProfile
from ..schemas.schemas import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityResponse,
    OpportunityIntelligence,
    ExtractedRequirements,
    OpportunityScore,
    DiscoveryQuestionsReport,
    ProjectEstimation,
    EstimationRecalculateRequest,
    MilestoneItem,
    RiskAssessmentItem
)
from ..tools.doc_parser import DocumentParser, MAX_FILE_SIZE, ALLOWED_EXTENSIONS
from ..agent.workflow import FreelanceAgentWorkflow
from ..agent.intelligence import OpportunityIntelligenceEngine
from ..agent.estimation import EstimationEngine
from ..config import settings

router = APIRouter(prefix="/api/opportunities", tags=["Opportunities"])

def sanitize_filename(filename: str) -> str:
    """Removes directory paths and unsafe characters from filenames."""
    clean_name = Path(filename).name
    clean_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', clean_name)
    return clean_name or "document.txt"

async def run_autonomous_desk(opportunity_id: str, title: str, content: str, company: str):
    """Background analysis runner with failure isolation and guaranteed intelligence persistence."""
    async with AsyncSessionLocal() as db:
        opp = (await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))).scalar_one_or_none()
        if not opp:
            return
        opp.status = "analyzing"
        await db.commit()

        # Load profile for personalization
        profile = (await db.execute(select(FreelancerProfile))).scalars().first()
        profile_skills = profile.skills if profile else ""
        profile_rate = profile.hourly_rate if profile else 0.0
        freelancer_name = profile.full_name if profile else ""

        # Step 1: Compute deterministic requirements extraction, explainable score, and discovery questions
        try:
            workflow = FreelanceAgentWorkflow()
            portfolio_matches = workflow.portfolio_store.search_relevant_experience(f"{title} {content}", limit=3)
            intel = OpportunityIntelligenceEngine.run_full_intelligence(
                opportunity_id=opportunity_id,
                title=title,
                content=content,
                tech_stack_hint=opp.tech_stack,
                raw_budget=opp.budget_range,
                raw_deadline=opp.deadline,
                company=company,
                profile_skills=profile_skills,
                profile_rate=profile_rate,
                freelancer_name=freelancer_name,
                portfolio_case_studies=portfolio_matches
            )
            opp.requirements_json = intel.requirements.model_dump_json()
            opp.scoring_json = intel.scoring.model_dump_json()
            opp.clarification_questions_json = intel.discovery.model_dump_json()
            opp.fit_score = intel.scoring.composite_score
            opp.recommendation = intel.scoring.recommendation

            # Generate and persist grounded WBS estimation
            estimation = EstimationEngine.generate_estimation(
                opportunity_id=opportunity_id,
                requirements=intel.requirements,
                hourly_rate=profile_rate,
                currency=profile.currency if profile else "USD",
                availability_hours_per_week=profile.availability_hours_per_week if profile else 40.0
            )
            opp.estimation_json = estimation.model_dump_json()
            await db.commit()
        except Exception as e:
            print(f"[Intelligence Engine Warning]: {e}")

        # Step 2: Attempt Ollama proposal generation
        try:
            result = await workflow.execute_brief_analysis(
                opportunity_id=opportunity_id,
                title=title,
                content=content,
                company=company,
                budget_range=opp.budget_range,
                deadline=opp.deadline,
                tech_stack=opp.tech_stack,
                profile_skills=profile_skills,
                profile_rate=profile_rate,
                freelancer_name=freelancer_name
            )

            # Check if an existing proposal exists
            existing_prop = (await db.execute(select(Proposal).where(Proposal.opportunity_id == opportunity_id))).scalar_one_or_none()
            if existing_prop:
                existing_prop.title = result["proposal_title"]
                existing_prop.content_markdown = result["content_markdown"]
                existing_prop.milestones_json = result["milestones_json"]
                existing_prop.risk_register_json = result["risk_register_json"]
                existing_prop.price_estimate = result["price_estimate"]
                existing_prop.audio_path = result["audio_path"]
                existing_prop.audio_script = result.get("audio_script")
                existing_prop.status = "ready"
            else:
                proposal = Proposal(
                    opportunity_id=opportunity_id,
                    title=result["proposal_title"],
                    content_markdown=result["content_markdown"],
                    milestones_json=result["milestones_json"],
                    risk_register_json=result["risk_register_json"],
                    price_estimate=result["price_estimate"],
                    audio_path=result["audio_path"],
                    audio_script=result.get("audio_script"),
                    status="ready"
                )
                db.add(proposal)

            opp.status = "completed"
            await db.commit()
        except Exception as e:
            print(f"[Autonomous Desk Proposal Gen Warning]: {e}")
            # Honest degradation: If Ollama is offline, intelligence is preserved but status marks failure
            opp.status = "failed"
            opp.notes = (opp.notes or "") + f" [AI Note: Intelligence analysis saved. Proposal synthesis failed: {str(e)[:120]}]"
            await db.commit()

@router.post("", response_model=OpportunityResponse)
async def create_opportunity(
    payload: OpportunityCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    client_id = None
    client_company = payload.company or payload.client_name
    if payload.client_name or payload.company:
        client = Client(
            name=payload.client_name or payload.company or "Prospective Client",
            company=payload.company,
            website=payload.website
        )
        db.add(client)
        await db.flush()
        client_id = client.id

    initial_status = payload.status or "draft"
    if payload.auto_analyze:
        initial_status = "analyzing"

    opp = Opportunity(
        id=str(uuid.uuid4()),
        client_id=client_id,
        title=payload.title,
        raw_content=payload.raw_content,
        source_type=payload.source_type or "text",
        source_url=payload.source_url,
        budget_range=payload.budget_range,
        deadline=payload.deadline,
        tech_stack=payload.tech_stack,
        notes=payload.notes,
        tags=payload.tags,
        status=initial_status
    )

    # Compute immediate deterministic intelligence
    try:
        profile = (await db.execute(select(FreelancerProfile))).scalars().first()
        portfolio_matches = []
        try:
            workflow = FreelanceAgentWorkflow()
            portfolio_matches = workflow.portfolio_store.search_relevant_experience(f"{opp.title} {opp.raw_content}", limit=3)
        except Exception:
            pass

        intel = OpportunityIntelligenceEngine.run_full_intelligence(
            opportunity_id=opp.id,
            title=opp.title,
            content=opp.raw_content,
            tech_stack_hint=opp.tech_stack,
            raw_budget=opp.budget_range,
            raw_deadline=opp.deadline,
            company=client_company or "",
            profile_skills=profile.skills if profile else "",
            profile_rate=profile.hourly_rate if profile else 0.0,
            freelancer_name=profile.full_name if profile else "",
            portfolio_case_studies=portfolio_matches
        )
        opp.requirements_json = intel.requirements.model_dump_json()
        opp.scoring_json = intel.scoring.model_dump_json()
        opp.clarification_questions_json = intel.discovery.model_dump_json()
        opp.fit_score = intel.scoring.composite_score
        opp.recommendation = intel.scoring.recommendation
    except Exception as e:
        print(f"[Create Opportunity Intel Warning]: {e}")

    db.add(opp)
    await db.commit()
    await db.refresh(opp)

    if payload.auto_analyze:
        background_tasks.add_task(
            run_autonomous_desk,
            opportunity_id=opp.id,
            title=opp.title,
            content=opp.raw_content,
            company=client_company or ""
        )

    return opp

@router.post("/upload", response_model=OpportunityResponse)
async def upload_brief_document(
    title: str = Form(...),
    company: Optional[str] = Form(None),
    budget_range: Optional[str] = Form(None),
    deadline: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    auto_analyze: bool = Form(False),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db)
):
    filename = file.filename or "uploaded_brief.txt"
    ext = Path(filename).suffix.lower()

    if not DocumentParser.is_allowed_extension(filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # Secure unique destination
    safe_name = sanitize_filename(filename)
    save_path = settings.UPLOADS_DIR / f"{uuid.uuid4()}_{safe_name}"

    try:
        content_bytes = await file.read()
        if len(content_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE / (1024*1024):.0f}MB."
            )

        with open(save_path, "wb") as f:
            f.write(content_bytes)

        extracted_text = DocumentParser.parse_file(save_path)
    except HTTPException:
        if save_path.exists():
            save_path.unlink()
        raise
    except ValueError as val_err:
        if save_path.exists():
            save_path.unlink()
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as e:
        if save_path.exists():
            save_path.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to process uploaded file: {str(e)}")

    opp_create = OpportunityCreate(
        title=title,
        raw_content=extracted_text,
        company=company,
        source_type="file",
        budget_range=budget_range,
        deadline=deadline,
        notes=notes,
        tags=tags,
        status="draft",
        auto_analyze=auto_analyze
    )
    return await create_opportunity(opp_create, background_tasks, db)

@router.get("", response_model=List[OpportunityResponse])
async def list_opportunities(
    status: Optional[str] = Query(None),
    include_archived: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Opportunity).order_by(Opportunity.created_at.desc())
    if status:
        stmt = stmt.where(Opportunity.status == status)
    elif not include_archived:
        stmt = stmt.where(Opportunity.status != "archived")
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{id}", response_model=OpportunityResponse)
async def get_opportunity(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Opportunity).where(Opportunity.id == id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp

@router.put("/{id}", response_model=OpportunityResponse)
async def update_opportunity(
    id: str,
    payload: OpportunityUpdate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Opportunity).where(Opportunity.id == id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(opp, field, value)

    await db.commit()
    await db.refresh(opp)
    return opp

@router.delete("/{id}")
async def delete_opportunity(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Opportunity).where(Opportunity.id == id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    await db.execute(delete(Opportunity).where(Opportunity.id == id))
    await db.commit()
    return {"status": "success", "message": f"Opportunity '{opp.title}' deleted successfully."}

@router.post("/{id}/analyze", response_model=OpportunityResponse)
async def analyze_opportunity(
    id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Opportunity).where(Opportunity.id == id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    opp.status = "analyzing"
    await db.commit()
    await db.refresh(opp)

    company_name = ""
    if opp.client_id:
        client = (await db.execute(select(Client).where(Client.id == opp.client_id))).scalar_one_or_none()
        if client:
            company_name = client.company or client.name

    background_tasks.add_task(
        run_autonomous_desk,
        opportunity_id=opp.id,
        title=opp.title,
        content=opp.raw_content,
        company=company_name
    )

    return opp

@router.get("/{id}/intelligence", response_model=OpportunityIntelligence)
async def get_opportunity_intelligence(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Opportunity).where(Opportunity.id == id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if opp.requirements_json and opp.scoring_json and opp.clarification_questions_json:
        try:
            return OpportunityIntelligence(
                opportunity_id=opp.id,
                title=opp.title,
                requirements=ExtractedRequirements.model_validate_json(opp.requirements_json),
                scoring=OpportunityScore.model_validate_json(opp.scoring_json),
                discovery=DiscoveryQuestionsReport.model_validate_json(opp.clarification_questions_json)
            )
        except Exception as e:
            print(f"[Parse Stored Intelligence Error]: {e}")

    # Compute on the fly if not cached
    profile = (await db.execute(select(FreelancerProfile))).scalars().first()
    company_name = ""
    if opp.client_id:
        client = (await db.execute(select(Client).where(Client.id == opp.client_id))).scalar_one_or_none()
        if client:
            company_name = client.company or client.name

    portfolio_matches = []
    try:
        workflow = FreelanceAgentWorkflow()
        portfolio_matches = workflow.portfolio_store.search_relevant_experience(f"{opp.title} {opp.raw_content}", limit=3)
    except Exception:
        pass

    intel = OpportunityIntelligenceEngine.run_full_intelligence(
        opportunity_id=opp.id,
        title=opp.title,
        content=opp.raw_content,
        tech_stack_hint=opp.tech_stack,
        raw_budget=opp.budget_range,
        raw_deadline=opp.deadline,
        company=company_name,
        profile_skills=profile.skills if profile else "",
        profile_rate=profile.hourly_rate if profile else 0.0,
        freelancer_name=profile.full_name if profile else "",
        portfolio_case_studies=portfolio_matches
    )

    opp.requirements_json = intel.requirements.model_dump_json()
    opp.scoring_json = intel.scoring.model_dump_json()
    opp.clarification_questions_json = intel.discovery.model_dump_json()
    opp.fit_score = intel.scoring.composite_score
    opp.recommendation = intel.scoring.recommendation
    await db.commit()

    return intel

@router.post("/{id}/score", response_model=OpportunityIntelligence)
async def rescore_opportunity(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Opportunity).where(Opportunity.id == id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    profile = (await db.execute(select(FreelancerProfile))).scalars().first()
    company_name = ""
    if opp.client_id:
        client = (await db.execute(select(Client).where(Client.id == opp.client_id))).scalar_one_or_none()
        if client:
            company_name = client.company or client.name

    portfolio_matches = []
    try:
        workflow = FreelanceAgentWorkflow()
        portfolio_matches = workflow.portfolio_store.search_relevant_experience(f"{opp.title} {opp.raw_content}", limit=3)
    except Exception:
        pass

    intel = OpportunityIntelligenceEngine.run_full_intelligence(
        opportunity_id=opp.id,
        title=opp.title,
        content=opp.raw_content,
        tech_stack_hint=opp.tech_stack,
        raw_budget=opp.budget_range,
        raw_deadline=opp.deadline,
        company=company_name,
        profile_skills=profile.skills if profile else "",
        profile_rate=profile.hourly_rate if profile else 0.0,
        freelancer_name=profile.full_name if profile else "",
        portfolio_case_studies=portfolio_matches
    )

    opp.requirements_json = intel.requirements.model_dump_json()
    opp.scoring_json = intel.scoring.model_dump_json()
    opp.clarification_questions_json = intel.discovery.model_dump_json()
    opp.fit_score = intel.scoring.composite_score
    opp.recommendation = intel.scoring.recommendation

    # Also refresh estimation
    estimation = EstimationEngine.generate_estimation(
        opportunity_id=opp.id,
        requirements=intel.requirements,
        hourly_rate=profile.hourly_rate if profile else 0.0,
        currency=profile.currency if profile else "USD",
        availability_hours_per_week=profile.availability_hours_per_week if profile else 40.0
    )
    opp.estimation_json = estimation.model_dump_json()
    await db.commit()

    return intel

@router.get("/{id}/estimation", response_model=ProjectEstimation)
async def get_opportunity_estimation(id: str, db: AsyncSession = Depends(get_db)):
    """Fetch current Work Breakdown Structure and pricing models for an opportunity."""
    result = await db.execute(select(Opportunity).where(Opportunity.id == id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if opp.estimation_json:
        try:
            return ProjectEstimation.model_validate_json(opp.estimation_json)
        except Exception:
            pass

    # If no estimation saved yet, generate it deterministically
    req = None
    if opp.requirements_json:
        try:
            req = ExtractedRequirements.model_validate_json(opp.requirements_json)
        except Exception:
            pass

    if not req:
        req = OpportunityIntelligenceEngine.extract_requirements(opp.title, opp.raw_content, opp.tech_stack)
        opp.requirements_json = req.model_dump_json()

    profile = (await db.execute(select(FreelancerProfile))).scalars().first()
    rate = profile.hourly_rate if profile else 0.0
    currency = profile.currency if profile else "USD"
    availability = profile.availability_hours_per_week if profile else 40.0

    estimation = EstimationEngine.generate_estimation(
        opportunity_id=opp.id,
        requirements=req,
        hourly_rate=rate,
        currency=currency,
        availability_hours_per_week=availability
    )
    opp.estimation_json = estimation.model_dump_json()
    await db.commit()
    return estimation

@router.post("/{id}/estimation", response_model=ProjectEstimation)
async def generate_opportunity_estimation(
    id: str,
    payload: Optional[EstimationRecalculateRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    """Regenerates or recalculates estimation using updated rate, buffer, or overrides."""
    result = await db.execute(select(Opportunity).where(Opportunity.id == id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    req = None
    if opp.requirements_json:
        try:
            req = ExtractedRequirements.model_validate_json(opp.requirements_json)
        except Exception:
            pass

    if not req:
        req = OpportunityIntelligenceEngine.extract_requirements(opp.title, opp.raw_content, opp.tech_stack)
        opp.requirements_json = req.model_dump_json()

    profile = (await db.execute(select(FreelancerProfile))).scalars().first()
    rate = payload.hourly_rate if (payload and payload.hourly_rate is not None) else (profile.hourly_rate if profile else 0.0)
    contingency = payload.contingency_percent if (payload and payload.contingency_percent is not None) else None
    currency = profile.currency if profile else "USD"
    availability = profile.availability_hours_per_week if profile else 40.0

    estimation = EstimationEngine.generate_estimation(
        opportunity_id=opp.id,
        requirements=req,
        hourly_rate=rate,
        currency=currency,
        availability_hours_per_week=availability,
        contingency_override=contingency
    )
    if payload and payload.pricing_model:
        estimation.pricing_model = payload.pricing_model
        estimation.pricing_tiers.recommended_model = payload.pricing_model

    opp.estimation_json = estimation.model_dump_json()
    await db.commit()
    return estimation

@router.put("/{id}/estimation", response_model=ProjectEstimation)
async def update_opportunity_estimation(
    id: str,
    payload: EstimationRecalculateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Saves customized milestones, rates, and assumptions, syncing changes to proposals."""
    result = await db.execute(select(Opportunity).where(Opportunity.id == id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Load existing estimation base
    current_est = None
    if opp.estimation_json:
        try:
            current_est = ProjectEstimation.model_validate_json(opp.estimation_json)
        except Exception:
            pass

    if not current_est:
        req = OpportunityIntelligenceEngine.extract_requirements(opp.title, opp.raw_content, opp.tech_stack)
        profile = (await db.execute(select(FreelancerProfile))).scalars().first()
        current_est = EstimationEngine.generate_estimation(
            opportunity_id=opp.id,
            requirements=req,
            hourly_rate=profile.hourly_rate if profile else 0.0,
            currency=profile.currency if profile else "USD"
        )

    updated_est = EstimationEngine.recalculate_estimation(
        current_estimation=current_est,
        new_hourly_rate=payload.hourly_rate,
        new_contingency_percent=payload.contingency_percent,
        new_pricing_model=payload.pricing_model,
        custom_milestones=payload.milestones,
        custom_risks=payload.risks,
        custom_assumptions=payload.assumptions
    )

    opp.estimation_json = updated_est.model_dump_json()

    # Sync with any existing proposal or auto-create proposal for this opportunity
    prop_result = await db.execute(select(Proposal).where(Proposal.opportunity_id == id))
    proposal = prop_result.scalar_one_or_none()
    milestones_export = [
        {
            "id": m.id,
            "phase": m.phase,
            "title": m.title,
            "description": m.description,
            "deliverables": m.deliverables,
            "est_hours": m.est_hours,
            "rate": m.rate,
            "contingency_percent": m.contingency_percent,
            "subtotal": m.subtotal,
            "contingency_cost": m.contingency_cost,
            "cost": m.total_cost,
            "duration_weeks": m.duration_weeks
        }
        for m in updated_est.milestones
    ]

    if proposal:
        proposal.milestones_json = json.dumps(milestones_export)
        proposal.risk_register_json = json.dumps([r.model_dump() for r in updated_est.risks])
        proposal.price_estimate = updated_est.pricing_tiers.fixed_price.total_price
        proposal.updated_at = datetime.now(timezone.utc)
    else:
        from ..agent.workflow import FreelanceAgentWorkflow
        req = OpportunityIntelligenceEngine.extract_requirements(opp.title, opp.raw_content, opp.tech_stack)
        profile = (await db.execute(select(FreelancerProfile))).scalars().first()
        company_name = ""
        if opp.client_id:
            c = (await db.execute(select(Client).where(Client.id == opp.client_id))).scalar_one_or_none()
            if c:
                company_name = c.company or c.name

        content_md = FreelanceAgentWorkflow.build_dynamic_proposal_markdown(
            title=opp.title,
            company=company_name,
            freelancer_name=profile.full_name if profile else "",
            profile_skills=profile.skills if profile else "",
            requirements=req,
            estimation=updated_est,
            portfolio_text="- Proven full-stack and systems engineering track record.",
            recon_text="",
            discovery_questions=[]
        )
        proposal = Proposal(
            opportunity_id=id,
            title=f"Technical Proposal: {opp.title}",
            content_markdown=content_md,
            milestones_json=json.dumps(milestones_export),
            risk_register_json=json.dumps([r.model_dump() for r in updated_est.risks]),
            price_estimate=updated_est.pricing_tiers.fixed_price.total_price,
            status="ready"
        )
        db.add(proposal)

    if opp.status in ("draft", "failed", "ready_for_analysis"):
        opp.status = "completed"

    await db.commit()
    return updated_est

@router.post("/{id}/estimation/recalculate", response_model=ProjectEstimation)
async def preview_recalculate_estimation(
    id: str,
    payload: EstimationRecalculateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Stateless preview calculation for live UI slider and milestone editing."""
    result = await db.execute(select(Opportunity).where(Opportunity.id == id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    current_est = None
    if opp.estimation_json:
        try:
            current_est = ProjectEstimation.model_validate_json(opp.estimation_json)
        except Exception:
            pass

    if not current_est:
        req = OpportunityIntelligenceEngine.extract_requirements(opp.title, opp.raw_content, opp.tech_stack)
        profile = (await db.execute(select(FreelancerProfile))).scalars().first()
        current_est = EstimationEngine.generate_estimation(
            opportunity_id=opp.id,
            requirements=req,
            hourly_rate=profile.hourly_rate if profile else 0.0,
            currency=profile.currency if profile else "USD"
        )

    preview_est = EstimationEngine.recalculate_estimation(
        current_estimation=current_est,
        new_hourly_rate=payload.hourly_rate,
        new_contingency_percent=payload.contingency_percent,
        new_pricing_model=payload.pricing_model,
        custom_milestones=payload.milestones,
        custom_risks=payload.risks,
        custom_assumptions=payload.assumptions
    )
    return preview_est
