import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..models.models import Project, ProjectTask, Proposal, Opportunity, Client, FreelancerProfile
from ..schemas.schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectTaskCreate,
    ProjectTaskUpdate,
    ProjectTaskResponse,
    ScopeCheckRequest,
    ScopeCheckResponse,
    ClientReportRequest,
    ClientReportResponse,
    ClientCreate,
    ClientResponse
)
from ..agent.scope_guard import ScopeGuardEngine
from ..agent.reporting import ClientReportingEngine

router = APIRouter(prefix="/api/projects", tags=["projects"])

def _format_project_response(project: Project) -> ProjectResponse:
    tasks = project.tasks or []
    tasks_count = len(tasks)
    completed_count = sum(1 for t in tasks if t.status == "done")
    progress_pct = round((completed_count / tasks_count * 100.0), 1) if tasks_count > 0 else 0.0

    # Calculate actual hours dynamically from tasks if tasks exist
    actual_hrs = sum(t.actual_hours or 0.0 for t in tasks) if tasks else (project.actual_hours or 0.0)
    est_hrs = sum(t.estimated_hours or 0.0 for t in tasks) if tasks else (project.estimated_hours or 0.0)

    task_responses = [
        ProjectTaskResponse.model_validate(t) for t in sorted(tasks, key=lambda x: (x.order_index or 0.0, x.created_at))
    ]

    return ProjectResponse(
        id=project.id,
        title=project.title,
        description=project.description,
        client_id=project.client_id,
        opportunity_id=project.opportunity_id,
        proposal_id=project.proposal_id,
        status=project.status or "active",
        pricing_model=project.pricing_model or "fixed",
        total_budget=float(project.total_budget or 0.0),
        hourly_rate=float(project.hourly_rate or 75.0),
        estimated_hours=float(est_hrs),
        actual_hours=float(actual_hrs),
        milestones_baseline_json=project.milestones_baseline_json,
        tasks_count=tasks_count,
        tasks_completed_count=completed_count,
        progress_percent=progress_pct,
        tasks=task_responses,
        is_demo=bool(project.is_demo),
        created_at=project.created_at,
        updated_at=project.updated_at
    )

@router.get("", response_model=List[ProjectResponse])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks)).order_by(Project.created_at.desc())
    )
    projects = result.scalars().all()
    return [_format_project_response(p) for p in projects]

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, db: AsyncSession = Depends(get_db)):
    target_proposal: Optional[Proposal] = None
    target_opportunity: Optional[Opportunity] = None
    baseline_milestones = []
    total_budget = payload.total_budget or 0.0
    estimated_hours = payload.estimated_hours or 0.0
    hourly_rate = payload.hourly_rate or 75.0
    client_id = payload.client_id

    # Promotion from proposal
    proposal_id = payload.from_proposal_id or payload.proposal_id
    if proposal_id:
        p_res = await db.execute(select(Proposal).where(Proposal.id == proposal_id))
        target_proposal = p_res.scalar_one_or_none()
        if not target_proposal:
            raise HTTPException(status_code=404, detail=f"Proposal with ID '{proposal_id}' not found.")

        target_proposal.status = "accepted"
        target_proposal.updated_at = datetime.utcnow()

        if target_proposal.price_estimate:
            total_budget = target_proposal.price_estimate

        # Load linked opportunity
        opp_res = await db.execute(select(Opportunity).where(Opportunity.id == target_proposal.opportunity_id))
        target_opportunity = opp_res.scalar_one_or_none()
        if target_opportunity:
            client_id = target_opportunity.client_id
            target_opportunity.status = "completed"

        # Extract baseline WBS milestones
        if target_proposal.milestones_json:
            try:
                baseline_milestones = json.loads(target_proposal.milestones_json)
            except Exception:
                pass
        elif target_opportunity and target_opportunity.estimation_json:
            try:
                est_data = json.loads(target_opportunity.estimation_json)
                baseline_milestones = est_data.get("milestones", [])
                if not total_budget and est_data.get("pricing_summary", {}).get("fixed_price", {}).get("suggested_client_price"):
                    total_budget = est_data["pricing_summary"]["fixed_price"]["suggested_client_price"]
                if est_data.get("total_estimated_hours"):
                    estimated_hours = est_data["total_estimated_hours"]
                if est_data.get("hourly_rate"):
                    hourly_rate = est_data["hourly_rate"]
            except Exception:
                pass
    elif payload.milestones_baseline_json:
        try:
            baseline_milestones = json.loads(payload.milestones_baseline_json)
        except Exception:
            pass

    new_project = Project(
        title=payload.title or (target_proposal.title if target_proposal else "Client Project"),
        description=payload.description or (target_proposal.content_markdown[:300] if target_proposal else None),
        client_id=client_id,
        opportunity_id=target_opportunity.id if target_opportunity else payload.opportunity_id,
        proposal_id=target_proposal.id if target_proposal else payload.proposal_id,
        status=payload.status or "active",
        pricing_model=payload.pricing_model or "fixed",
        total_budget=total_budget,
        hourly_rate=hourly_rate,
        estimated_hours=estimated_hours,
        actual_hours=0.0,
        milestones_baseline_json=json.dumps(baseline_milestones) if baseline_milestones else None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_project)
    await db.flush()

    # Generate initial tasks from baseline milestones if available
    task_order = 1.0
    if baseline_milestones:
        for m_idx, m in enumerate(baseline_milestones):
            m_id = m.get("id") or f"m{m_idx + 1}"
            m_title = m.get("milestone_name") or m.get("title") or f"Milestone {m_idx + 1}"
            m_delivs = m.get("deliverables") or []
            m_hours = float(m.get("estimated_hours") or 20.0)

            if m_delivs:
                per_task_hours = round(m_hours / max(1, len(m_delivs)), 1)
                for d_idx, deliv in enumerate(m_delivs):
                    task = ProjectTask(
                        project_id=new_project.id,
                        milestone_id=m_id,
                        title=f"{m_title}: {deliv}",
                        description=f"Deliverable for milestone '{m_title}'.",
                        status="todo",
                        priority="medium",
                        estimated_hours=per_task_hours,
                        actual_hours=0.0,
                        order_index=task_order,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    db.add(task)
                    task_order += 1.0
            else:
                task = ProjectTask(
                    project_id=new_project.id,
                    milestone_id=m_id,
                    title=m_title,
                    description=m.get("description", f"Deliver milestone {m_title}"),
                    status="todo",
                    priority="medium",
                    estimated_hours=m_hours,
                    actual_hours=0.0,
                    order_index=task_order,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(task)
                task_order += 1.0

    # Add any explicitly passed initial tasks
    if payload.initial_tasks:
        for t_in in payload.initial_tasks:
            t = ProjectTask(
                project_id=new_project.id,
                milestone_id=t_in.milestone_id,
                title=t_in.title,
                description=t_in.description,
                status=t_in.status or "todo",
                priority=t_in.priority or "medium",
                estimated_hours=t_in.estimated_hours or 0.0,
                actual_hours=t_in.actual_hours or 0.0,
                assignee=t_in.assignee,
                due_date=t_in.due_date,
                notes=t_in.notes,
                is_scope_change=t_in.is_scope_change or False,
                order_index=task_order,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(t)
            task_order += 1.0

    await db.commit()
    await db.refresh(new_project)

    # Reload with tasks
    refreshed = await db.execute(
        select(Project).options(selectinload(Project.tasks)).where(Project.id == new_project.id)
    )
    full_project = refreshed.scalar_one()
    return _format_project_response(full_project)

@router.get("/clients", response_model=List[ClientResponse])
async def list_clients(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Client).order_by(Client.name.asc()))
    clients = res.scalars().all()
    return clients

@router.post("/clients", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(payload: ClientCreate, db: AsyncSession = Depends(get_db)):
    client = Client(
        name=payload.name,
        company=payload.company,
        website=payload.website,
        notes=payload.notes,
        created_at=datetime.utcnow()
    )
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client

@router.get("/{id}", response_model=ProjectResponse)
async def get_project(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks)).where(Project.id == id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{id}' not found.")
    return _format_project_response(project)

@router.put("/{id}", response_model=ProjectResponse)
async def update_project(id: str, payload: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks)).where(Project.id == id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{id}' not found.")

    if payload.title is not None:
        project.title = payload.title
    if payload.description is not None:
        project.description = payload.description
    if payload.status is not None:
        valid_statuses = {"active", "on_hold", "completed", "cancelled"}
        if payload.status not in valid_statuses:
            raise HTTPException(status_code=422, detail=f"Invalid project status. Must be one of {valid_statuses}")
        project.status = payload.status
    if payload.pricing_model is not None:
        project.pricing_model = payload.pricing_model
    if payload.total_budget is not None:
        project.total_budget = payload.total_budget
    if payload.hourly_rate is not None:
        project.hourly_rate = payload.hourly_rate
    if payload.estimated_hours is not None:
        project.estimated_hours = payload.estimated_hours
    if payload.actual_hours is not None:
        project.actual_hours = payload.actual_hours

    project.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(project)
    return _format_project_response(project)

@router.delete("/{id}")
async def delete_project(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{id}' not found.")
    await db.delete(project)
    await db.commit()
    return {"message": f"Project '{id}' and associated tasks deleted."}

# --- Project Tasks API ---

@router.post("/{id}/tasks", response_model=ProjectTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_project_task(id: str, payload: ProjectTaskCreate, db: AsyncSession = Depends(get_db)):
    p_res = await db.execute(select(Project).where(Project.id == id))
    project = p_res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{id}' not found.")

    task = ProjectTask(
        project_id=id,
        milestone_id=payload.milestone_id,
        title=payload.title,
        description=payload.description,
        status=payload.status or "todo",
        priority=payload.priority or "medium",
        estimated_hours=payload.estimated_hours or 0.0,
        actual_hours=payload.actual_hours or 0.0,
        assignee=payload.assignee,
        due_date=payload.due_date,
        notes=payload.notes,
        is_scope_change=payload.is_scope_change or False,
        order_index=payload.order_index or 0.0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return ProjectTaskResponse.model_validate(task)

@router.put("/{id}/tasks/{task_id}", response_model=ProjectTaskResponse)
async def update_project_task(id: str, task_id: str, payload: ProjectTaskUpdate, db: AsyncSession = Depends(get_db)):
    t_res = await db.execute(
        select(ProjectTask).where(ProjectTask.id == task_id, ProjectTask.project_id == id)
    )
    task = t_res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found in project '{id}'.")

    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.milestone_id is not None:
        task.milestone_id = payload.milestone_id
    if payload.status is not None:
        valid_statuses = {"todo", "in_progress", "review", "done"}
        if payload.status not in valid_statuses:
            raise HTTPException(status_code=422, detail=f"Invalid task status. Must be one of {valid_statuses}")
        task.status = payload.status
    if payload.priority is not None:
        task.priority = payload.priority
    if payload.estimated_hours is not None:
        task.estimated_hours = payload.estimated_hours
    if payload.actual_hours is not None:
        task.actual_hours = payload.actual_hours
    if payload.assignee is not None:
        task.assignee = payload.assignee
    if payload.due_date is not None:
        task.due_date = payload.due_date
    if payload.notes is not None:
        task.notes = payload.notes
    if payload.is_scope_change is not None:
        task.is_scope_change = payload.is_scope_change
    if payload.order_index is not None:
        task.order_index = payload.order_index

    task.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return ProjectTaskResponse.model_validate(task)

@router.delete("/{id}/tasks/{task_id}")
async def delete_project_task(id: str, task_id: str, db: AsyncSession = Depends(get_db)):
    t_res = await db.execute(
        select(ProjectTask).where(ProjectTask.id == task_id, ProjectTask.project_id == id)
    )
    task = t_res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found in project '{id}'.")
    await db.delete(task)
    await db.commit()
    return {"message": f"Task '{task_id}' deleted."}

# --- Scope Guard Inspection API ---

@router.post("/{id}/scope-check", response_model=ScopeCheckResponse)
async def check_scope_creep(id: str, payload: ScopeCheckRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks)).where(Project.id == id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{id}' not found.")

    # Parse baseline milestones
    baseline_wbs = []
    if project.milestones_baseline_json:
        try:
            baseline_wbs = json.loads(project.milestones_baseline_json)
        except Exception:
            pass

    tasks_dicts = [
        {"title": t.title, "description": t.description or "", "milestone_id": t.milestone_id}
        for t in project.tasks
    ]

    guard = ScopeGuardEngine()
    analysis = await guard.analyze_scope(
        project_title=project.title,
        baseline_wbs=baseline_wbs,
        baseline_tasks=tasks_dicts,
        new_request_text=payload.new_request_text,
        hourly_rate=project.hourly_rate or 75.0,
        client_name=payload.client_name or "Client"
    )
    return analysis

@router.post("/{id}/convert-scope-to-tasks", response_model=List[ProjectTaskResponse])
async def convert_scope_to_tasks(id: str, payload: ScopeCheckResponse, db: AsyncSession = Depends(get_db)):
    p_res = await db.execute(select(Project).options(selectinload(Project.tasks)).where(Project.id == id))
    project = p_res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{id}' not found.")

    items = payload.out_of_scope_items or []
    if not items and payload.analysis_summary:
        items = [payload.analysis_summary[:100]]

    created_tasks = []
    current_count = len(project.tasks)
    hrs_per_task = round(payload.estimated_impact_hours / max(1, len(items)), 1) if payload.estimated_impact_hours else 8.0

    for idx, item in enumerate(items):
        task = ProjectTask(
            project_id=project.id,
            milestone_id="scope_change",
            title=f"[Scope Change] {item[:120]}",
            description=f"Approved out-of-scope requirement from change order evaluation.\n\nContext: {item}",
            status="todo",
            priority="high",
            estimated_hours=hrs_per_task,
            actual_hours=0.0,
            is_scope_change=True,
            order_index=float(current_count + idx + 1),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(task)
        created_tasks.append(task)

    await db.commit()
    for t in created_tasks:
        await db.refresh(t)

    return [ProjectTaskResponse.model_validate(t) for t in created_tasks]

# --- Phase 8 Client Communications & Status Reporting Hub Endpoints ---

@router.post("/{id}/reports/generate", response_model=ClientReportResponse)
async def generate_client_report(
    id: str,
    payload: ClientReportRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks)).where(Project.id == id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{id}' not found.")

    client_name = payload.client_name
    if not client_name and project.client_id:
        c_res = await db.execute(select(Client).where(Client.id == project.client_id))
        c = c_res.scalar_one_or_none()
        if c:
            client_name = c.name

    profile = (await db.execute(select(FreelancerProfile))).scalars().first()
    freelancer_name = profile.full_name if profile and profile.full_name else "Lead Engineer"

    report = ClientReportingEngine.generate_report(
        project=project,
        tasks=project.tasks or [],
        request=payload,
        client_name=client_name or "Client",
        freelancer_name=freelancer_name
    )
    return report

@router.get("/{id}/reports/export-html", response_class=HTMLResponse)
async def export_client_report_html(
    id: str,
    report_type: str = "weekly_update",
    client_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks)).where(Project.id == id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{id}' not found.")

    eff_client = client_name
    if not eff_client and project.client_id:
        c_res = await db.execute(select(Client).where(Client.id == project.client_id))
        c = c_res.scalar_one_or_none()
        if c:
            eff_client = c.name

    profile = (await db.execute(select(FreelancerProfile))).scalars().first()
    freelancer_name = profile.full_name if profile and profile.full_name else "Lead Engineer"

    req = ClientReportRequest(report_type=report_type, client_name=eff_client)
    report = ClientReportingEngine.generate_report(
        project=project,
        tasks=project.tasks or [],
        request=req,
        client_name=eff_client or "Client",
        freelancer_name=freelancer_name
    )

    html = ClientReportingEngine.generate_html_report(
        report=report,
        client_name=eff_client or "Client",
        freelancer_name=freelancer_name
    )
    return HTMLResponse(content=html, media_type="text/html")
