import json
import re
from typing import List, Optional, Dict, Any
from pathlib import Path
from datetime import datetime, timezone
import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse, HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.models import Proposal, Opportunity, FreelancerProfile, Client, Project, ProjectTask
from ..schemas.schemas import (
    ProposalResponse,
    ProposalCreate,
    ProposalUpdateRequest,
    ProposalSectionRegenerateRequest,
    ExtractedRequirements,
    ProjectEstimation
)
from ..config import settings
from ..tools.audio_brief import AudioBriefGenerator

router = APIRouter(prefix="/api/proposals", tags=["Proposals"])

VALID_PROPOSAL_STATUSES = {"draft", "ready", "sent", "accepted", "archived"}

@router.post("", response_model=ProposalResponse)
async def create_proposal(
    payload: ProposalCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new proposal draft for an opportunity."""
    milestones_json = None
    if payload.milestones is not None:
        milestones_json = json.dumps([
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
            for m in payload.milestones
        ])
    risks_json = None
    if payload.risks is not None:
        risks_json = json.dumps([r.model_dump() for r in payload.risks])

    proposal = Proposal(
        opportunity_id=payload.opportunity_id,
        title=payload.title,
        content_markdown=payload.content_markdown or "# Technical Proposal\n\nDraft proposal scope.",
        milestones_json=milestones_json,
        risk_register_json=risks_json,
        price_estimate=payload.price_estimate,
        audio_script=payload.audio_script,
        status=payload.status or "draft"
    )
    db.add(proposal)
    await db.commit()
    await db.refresh(proposal)
    return proposal

@router.get("/opportunity/{opportunity_id}", response_model=List[ProposalResponse])
async def get_proposals_by_opportunity(opportunity_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Proposal).where(Proposal.opportunity_id == opportunity_id))
    return result.scalars().all()

@router.post("/generate/{opportunity_id}", response_model=ProposalResponse)
async def generate_proposal_for_opportunity(opportunity_id: str, db: AsyncSession = Depends(get_db)):
    """Dynamically generate or regenerate a comprehensive, client-ready proposal for an opportunity."""
    result = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
    opp = result.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    profile = (await db.execute(select(FreelancerProfile))).scalars().first()
    company_name = ""
    if opp.client_id:
        client = (await db.execute(select(Client).where(Client.id == opp.client_id))).scalar_one_or_none()
        if client:
            company_name = client.company or client.name

    from ..agent.workflow import FreelanceAgentWorkflow
    workflow = FreelanceAgentWorkflow()
    analysis_res = await workflow.execute_brief_analysis(
        opportunity_id=opp.id,
        title=opp.title,
        content=opp.raw_content,
        company=company_name,
        budget_range=opp.budget_range,
        deadline=opp.deadline,
        tech_stack=opp.tech_stack,
        profile_skills=profile.skills if profile else "",
        profile_rate=profile.hourly_rate if profile else 85.0,
        freelancer_name=profile.full_name if profile else ""
    )

    prop_result = await db.execute(select(Proposal).where(Proposal.opportunity_id == opportunity_id))
    existing_prop = prop_result.scalar_one_or_none()
    if existing_prop:
        existing_prop.title = analysis_res["proposal_title"]
        existing_prop.content_markdown = analysis_res["content_markdown"]
        existing_prop.milestones_json = analysis_res["milestones_json"]
        existing_prop.risk_register_json = analysis_res["risk_register_json"]
        existing_prop.price_estimate = analysis_res["price_estimate"]
        existing_prop.audio_path = analysis_res["audio_path"]
        existing_prop.audio_script = analysis_res.get("audio_script")
        existing_prop.status = "ready"
        existing_prop.updated_at = datetime.now(timezone.utc)
        proposal = existing_prop
    else:
        proposal = Proposal(
            opportunity_id=opportunity_id,
            title=analysis_res["proposal_title"],
            content_markdown=analysis_res["content_markdown"],
            milestones_json=analysis_res["milestones_json"],
            risk_register_json=analysis_res["risk_register_json"],
            price_estimate=analysis_res["price_estimate"],
            audio_path=analysis_res["audio_path"],
            audio_script=analysis_res.get("audio_script"),
            status="ready"
        )
        db.add(proposal)

    opp.status = "completed"
    opp.estimation_json = analysis_res["estimation_json"]
    opp.requirements_json = analysis_res["requirements_json"]
    opp.scoring_json = analysis_res["scoring_json"]
    opp.fit_score = analysis_res["fit_score"]
    opp.recommendation = analysis_res["recommendation"]
    await db.commit()
    await db.refresh(proposal)
    return proposal


@router.get("/{id}", response_model=ProposalResponse)
async def get_proposal(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Proposal).where(Proposal.id == id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

@router.put("/{id}", response_model=ProposalResponse)
async def update_proposal(
    id: str,
    payload: ProposalUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Update proposal content, milestones, risks, pricing, and lifecycle status."""
    result = await db.execute(select(Proposal).where(Proposal.id == id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if payload.status is not None:
        if payload.status.lower() not in VALID_PROPOSAL_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status '{payload.status}'. Valid statuses: {', '.join(sorted(VALID_PROPOSAL_STATUSES))}"
            )
        proposal.status = payload.status.lower()

    if payload.title is not None:
        proposal.title = payload.title
    if payload.content_markdown is not None:
        proposal.content_markdown = payload.content_markdown
    if payload.milestones is not None:
        proposal.milestones_json = json.dumps([
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
            for m in payload.milestones
        ])
    if payload.risks is not None:
        proposal.risk_register_json = json.dumps([r.model_dump() for r in payload.risks])
    if payload.price_estimate is not None:
        proposal.price_estimate = payload.price_estimate
    if payload.audio_script is not None:
        proposal.audio_script = payload.audio_script

    proposal.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(proposal)
    return proposal

@router.post("/{id}/regenerate-section", response_model=ProposalResponse)
async def regenerate_proposal_section(
    id: str,
    payload: ProposalSectionRegenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Regenerates a specific proposal section using AI or grounded requirements synthesis."""
    result = await db.execute(select(Proposal).where(Proposal.id == id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    opp_result = await db.execute(select(Opportunity).where(Opportunity.id == proposal.opportunity_id))
    opp = opp_result.scalar_one_or_none()
    profile = (await db.execute(select(FreelancerProfile))).scalars().first()

    section_key = payload.section_key.lower().strip()
    custom_inst = payload.custom_instructions or ""

    # Parse existing milestones and requirements
    milestones: List[Dict[str, Any]] = []
    if proposal.milestones_json:
        try:
            milestones = json.loads(proposal.milestones_json)
        except Exception:
            pass

    risks: List[Dict[str, Any]] = []
    if proposal.risk_register_json:
        try:
            risks = json.loads(proposal.risk_register_json)
        except Exception:
            pass

    # Attempt AI regeneration with Ollama if running
    llm_text = ""
    prompt = f"""You are a professional software consultant. Regenerate the section '{section_key}' of the proposal for '{proposal.title}'.
Project details: {opp.raw_content if opp else ''}
Freelancer: {profile.full_name if profile else 'Technical Consultant'}, Rate: ${profile.hourly_rate if profile else 75}/hr
Additional instructions: {custom_inst}

Produce ONLY the markdown content for this section under a clear markdown header. Do not repeat unrelated sections.
"""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False
                }
            )
            if resp.status_code == 200:
                llm_text = resp.json().get("response", "").strip()
    except Exception:
        pass

    # If LLM offline, apply deterministic grounded synthesis for that section
    if not llm_text or len(llm_text) < 40:
        if "summary" in section_key or "executive" in section_key:
            llm_text = (
                f"### Executive Summary\n\n"
                f"This proposal outlines a phased engineering approach for **{opp.title if opp else proposal.title}**. "
                f"The primary goal is delivering a robust, maintainable architecture aligned with client operational requirements, "
                f"incorporating verified security best practices, transparent milestones, and zero scope ambiguity.\n"
            )
            if custom_inst:
                llm_text += f"\n*Refinement Note*: {custom_inst}\n"
        elif "arch" in section_key or "technical" in section_key:
            tech_stack_str = opp.tech_stack if (opp and opp.tech_stack) else "Modern standard web/cloud architecture"
            llm_text = (
                f"### Technical Architecture & System Design\n\n"
                f"The proposed implementation centers around **{tech_stack_str}**. "
                f"Key design priorities include modular component decoupling, secure API contracts, structured data validation, "
                f"and automated CI/CD deployment pipelines to maintain high velocity and zero regression.\n"
            )
        elif "milestone" in section_key or "wbs" in section_key or "scope" in section_key:
            milestone_rows = []
            for m in milestones:
                milestone_rows.append(f"| {m.get('phase', 'Phase')} | {m.get('title', '')} | {m.get('est_hours', 0)} hrs | ${Number(m.get('cost', 0)):,.2f} |")
            table = "\n".join(milestone_rows)
            llm_text = (
                f"### Phased Work Breakdown Structure (WBS)\n\n"
                f"| Phase | Deliverable Title | Estimated Hours | Fee |\n"
                f"| :--- | :--- | :--- | :--- |\n"
                f"{table}\n\n"
                f"**Total Scope Investment**: ${proposal.price_estimate or 0:,.2f}\n"
            )
        elif "risk" in section_key:
            risk_bullets = []
            for r in risks:
                risk_bullets.append(f"- **{r.get('risk', '')}** ({r.get('severity', 'Medium')}): {r.get('mitigation', '')}")
            llm_text = (
                f"### Risk Mitigation & Quality Assurance\n\n"
                f"To protect project timelines and budget certainty, the following risks have been identified with proactive mitigations:\n\n"
                + "\n".join(risk_bullets) + "\n"
            )
        else:
            llm_text = (
                f"### Commercial Terms & Collaboration Guidelines\n\n"
                f"- **Billing & Disbursements**: Phased disbursements tied to verified milestone deliverables.\n"
                f"- **Turnaround SLA**: Client review and feedback turnaround within 2 business days.\n"
                f"- **Change Orders**: Any requests outside the agreed WBS will be estimated and billed under a separate change order.\n"
            )

    # Append or splice the regenerated section into markdown
    current_md = proposal.content_markdown or ""
    proposal.content_markdown = f"{current_md}\n\n---\n\n{llm_text}"
    proposal.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(proposal)
    return proposal

@router.get("/{id}/download-markdown")
async def download_proposal_markdown(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Proposal).where(Proposal.id == id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    filename = f"{re.sub(r'[^a-zA-Z0-9_.-]', '_', proposal.title.lower())}.md"
    return PlainTextResponse(
        content=proposal.content_markdown,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{id}/export-html", response_class=HTMLResponse)
async def export_proposal_html(id: str, db: AsyncSession = Depends(get_db)):
    """Generates a clean, selectable-text printable HTML document with embedded CSS."""
    result = await db.execute(select(Proposal).where(Proposal.id == id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    opp_result = await db.execute(select(Opportunity).where(Opportunity.id == proposal.opportunity_id))
    opp = opp_result.scalar_one_or_none()

    client = None
    if opp and opp.client_id:
        client_res = await db.execute(select(Client).where(Client.id == opp.client_id))
        client = client_res.scalar_one_or_none()

    profile = (await db.execute(select(FreelancerProfile))).scalars().first()

    html_doc = _generate_standalone_proposal_html(
        proposal=proposal,
        opportunity=opp,
        profile=profile,
        client=client
    )
    return HTMLResponse(content=html_doc, status_code=200)

@router.get("/{id}/audio")
async def get_proposal_audio(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Proposal).where(Proposal.id == id))
    proposal = result.scalar_one_or_none()
    if not proposal or not proposal.audio_path:
        raise HTTPException(status_code=404, detail="Audio brief not found for this proposal.")
    
    audio_path = Path(proposal.audio_path)
    if not audio_path.exists() or audio_path.suffix.lower() != ".mp3":
        raise HTTPException(status_code=404, detail="Audio MP3 stream missing or not generated.")
    
    return FileResponse(path=str(audio_path), media_type="audio/mpeg", filename=f"{proposal.title[:30]}_brief.mp3")

@router.get("/{id}/audio-brief")
async def get_proposal_audio_brief(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Proposal).where(Proposal.id == id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    has_audio_file = bool(
        proposal.audio_path and 
        Path(proposal.audio_path).exists() and 
        Path(proposal.audio_path).suffix.lower() == ".mp3"
    )

    script = proposal.audio_script
    if not script:
        first_section = proposal.content_markdown.split("\n\n")[0] if proposal.content_markdown else ""
        clean_text = re.sub(r"[#*_`\(\)\[\]]", "", first_section).strip()[:350]
        script = f"Here is your executive brief for {proposal.title}. {clean_text}"

    return {
        "proposal_id": proposal.id,
        "proposal_title": proposal.title,
        "has_audio_file": has_audio_file,
        "audio_url": f"/api/proposals/{proposal.id}/audio" if has_audio_file else None,
        "script": script,
        "elevenlabs_configured": bool(settings.ELEVENLABS_API_KEY and settings.ELEVENLABS_API_KEY.strip()),
        "voice_id": settings.ELEVENLABS_VOICE_ID or "21m00Tcm4TlvDq8ikWAM",
        "recommended_engine": "stream" if has_audio_file else "browser_speech_synthesis"
    }

@router.post("/{id}/synthesize-audio")
async def synthesize_proposal_audio(id: str, payload: Optional[Dict[str, str]] = None, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Proposal).where(Proposal.id == id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    script = (payload.get("script") if payload else None) or proposal.audio_script
    if not script:
        first_section = proposal.content_markdown.split("\n\n")[0] if proposal.content_markdown else ""
        clean_text = re.sub(r"[#*_`\(\)\[\]]", "", first_section).strip()[:350]
        script = f"Here is your executive brief for {proposal.title}. {clean_text}"

    proposal.audio_script = script
    audio_path = await AudioBriefGenerator.generate_brief(script, filename_prefix=f"prop_{proposal.id[:8]}")
    if audio_path and audio_path.exists() and audio_path.suffix.lower() == ".mp3":
        proposal.audio_path = str(audio_path)
    
    proposal.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(proposal)

    has_audio_file = bool(
        proposal.audio_path and 
        Path(proposal.audio_path).exists() and 
        Path(proposal.audio_path).suffix.lower() == ".mp3"
    )

    return {
        "proposal_id": proposal.id,
        "has_audio_file": has_audio_file,
        "audio_url": f"/api/proposals/{proposal.id}/audio" if has_audio_file else None,
        "script": proposal.audio_script,
        "elevenlabs_configured": bool(settings.ELEVENLABS_API_KEY and settings.ELEVENLABS_API_KEY.strip()),
        "message": (
            "Studio audio synthesized successfully with ElevenLabs."
            if has_audio_file else
            "ElevenLabs API unconfigured or quota reached. Speech script generated for offline browser Web Speech engine."
        )
    }

def _generate_standalone_proposal_html(
    proposal: Proposal,
    opportunity: Optional[Opportunity],
    profile: Optional[FreelancerProfile],
    client: Optional[Client]
) -> str:
    """Renders clean, styled, print-ready HTML for document presentation and PDF conversion."""
    milestones: List[Dict[str, Any]] = []
    if proposal.milestones_json:
        try:
            milestones = json.loads(proposal.milestones_json)
        except Exception:
            pass

    risks: List[Dict[str, Any]] = []
    if proposal.risk_register_json:
        try:
            risks = json.loads(proposal.risk_register_json)
        except Exception:
            pass

    freelancer_name = profile.full_name if (profile and profile.full_name) else "Technical Consultant"
    freelancer_title = profile.title if (profile and profile.title) else "Senior Software Architect & Full-Stack Engineer"
    currency = profile.currency if (profile and profile.currency) else "USD"
    client_name = client.company or client.name if client else (opportunity.company if opportunity else "Valued Client")
    doc_date = proposal.created_at.strftime("%B %d, %Y") if proposal.created_at else datetime.now().strftime("%B %d, %Y")
    status_badge = proposal.status.upper() if proposal.status else "DRAFT"

    # Convert markdown-ish text to simple HTML paragraphs
    body_paragraphs = []
    for line in (proposal.content_markdown or "").split("\n\n"):
        clean = line.strip()
        if clean.startswith("###"):
            body_paragraphs.append(f"<h3 style='margin-top: 24px; color: #0F172A; font-size: 18px;'>{clean.replace('###', '').strip()}</h3>")
        elif clean.startswith("##"):
            body_paragraphs.append(f"<h2 style='margin-top: 28px; color: #0F172A; font-size: 22px; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px;'>{clean.replace('##', '').strip()}</h2>")
        elif clean.startswith("#"):
            body_paragraphs.append(f"<h1 style='margin-top: 32px; color: #0F172A; font-size: 26px;'>{clean.replace('#', '').strip()}</h1>")
        elif clean.startswith("-") or clean.startswith("*"):
            items = "".join([f"<li style='margin-bottom: 4px;'>{it.replace('-', '').replace('*', '').strip()}</li>" for it in clean.splitlines() if it.strip()])
            body_paragraphs.append(f"<ul style='margin-left: 20px; color: #334155; line-height: 1.6;'>{items}</ul>")
        elif clean:
            body_paragraphs.append(f"<p style='color: #334155; line-height: 1.7; margin-bottom: 12px;'>{clean}</p>")

    body_html = "\n".join(body_paragraphs)

    # Milestones table rows
    m_rows = []
    for m in milestones:
        deliverables_html = ""
        if m.get("deliverables"):
            deliverables_html = "<br><span style='font-size: 11px; color: #64748B;'>" + " • ".join(m.get("deliverables", [])[:3]) + "</span>"
        cost_val = m.get("cost") or m.get("total_cost") or 0.0
        m_rows.append(f"""
        <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 12px 14px; font-weight: 700; color: #0F172A;">{m.get('phase', 'Phase')}</td>
            <td style="padding: 12px 14px; color: #1E293B;">
                <strong>{m.get('title', '')}</strong>
                {deliverables_html}
            </td>
            <td style="padding: 12px 14px; text-align: center; color: #475569; font-family: monospace;">{m.get('est_hours', 0)} hrs</td>
            <td style="padding: 12px 14px; text-align: right; font-weight: 800; color: #166534; font-family: monospace;">${float(cost_val):,.2f}</td>
        </tr>
        """)

    milestone_table_html = "\n".join(m_rows)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{proposal.title} - Proposal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        @page {{
            margin: 20mm 15mm;
            size: A4 portrait;
        }}
        * {{
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }}
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #0F172A;
            background-color: #FFFFFF;
            margin: 0;
            padding: 40px;
            font-size: 14px;
            line-height: 1.6;
        }}
        .proposal-container {{
            max-width: 860px;
            margin: 0 auto;
        }}
        .header-bar {{
            display: flex;
            justifyContent: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #0F172A;
            padding-bottom: 24px;
            margin-bottom: 32px;
        }}
        .badge {{
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            background-color: #0F172A;
            color: #FFFFFF;
        }}
        .info-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 32px;
        }}
        .wbs-table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
            margin-bottom: 24px;
            page-break-inside: avoid;
        }}
        .wbs-table th {{
            background-color: #0F172A;
            color: #FFFFFF;
            padding: 10px 14px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            text-align: left;
        }}
        .signature-block {{
            margin-top: 48px;
            padding-top: 24px;
            border-top: 2px dashed #CBD5E1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            page-break-inside: avoid;
        }}
        .signature-line {{
            margin-top: 40px;
            border-bottom: 1px solid #000000;
            padding-bottom: 4px;
            font-size: 12px;
            color: #64748B;
        }}
        @media print {{
            body {{
                padding: 0;
            }}
            .no-print {{
                display: none !important;
            }}
        }}
    </style>
</head>
<body>
    <div class="no-print" style="position: fixed; top: 16px; right: 20px; z-index: 1000; display: flex; gap: 10px;">
        <button onclick="window.print()" style="background-color: #0F172A; color: #FFFFFF; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            🖨️ Print / Save as PDF
        </button>
    </div>

    <div class="proposal-container">
        <!-- Header -->
        <div class="header-bar">
            <div>
                <span class="badge">{status_badge}</span>
                <h1 style="margin: 12px 0 6px 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">
                    {proposal.title}
                </h1>
                <div style="color: #64748B; font-size: 13px;">
                    Date: <strong>{doc_date}</strong> • Prepared for: <strong>{client_name}</strong>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 12px; color: #64748B; font-weight: 700; text-transform: uppercase;">Total Scope Investment</div>
                <div style="font-size: 28px; font-weight: 900; color: #166534; font-family: 'JetBrains Mono', monospace;">
                    ${proposal.price_estimate or 0:,.2f}
                </div>
                <div style="font-size: 11px; color: #64748B;">{currency} • Guaranteed Milestone Delivery</div>
            </div>
        </div>

        <!-- Stakeholders Grid -->
        <div class="info-grid">
            <div>
                <div style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; margin-bottom: 6px;">Prepared By (Service Provider)</div>
                <div style="font-size: 15px; font-weight: 800; color: #0F172A;">{freelancer_name}</div>
                <div style="font-size: 13px; color: #475569;">{freelancer_title}</div>
            </div>
            <div>
                <div style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; margin-bottom: 6px;">Prepared For (Client)</div>
                <div style="font-size: 15px; font-weight: 800; color: #0F172A;">{client_name}</div>
                <div style="font-size: 13px; color: #475569;">Technical & Commercial Stakeholders</div>
            </div>
        </div>

        <!-- Main Markdown Content -->
        <div style="margin-bottom: 32px;">
            {body_html}
        </div>

        <!-- Work Breakdown Structure Table -->
        {f'''
        <div style="page-break-inside: avoid;">
            <h2 style="font-size: 20px; font-weight: 800; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px;">
                Phased Work Breakdown & Milestones
            </h2>
            <table class="wbs-table">
                <thead>
                    <tr>
                        <th style="width: 15%;">Phase</th>
                        <th style="width: 55%;">Deliverable Scope</th>
                        <th style="width: 15%; text-align: center;">Hours</th>
                        <th style="width: 15%; text-align: right;">Fee</th>
                    </tr>
                </thead>
                <tbody>
                    {milestone_table_html}
                </tbody>
            </table>
        </div>
        ''' if milestones else ''}

        <!-- Signature Block -->
        <div class="signature-block">
            <div>
                <div style="font-weight: 800; font-size: 13px; color: #0F172A;">Service Provider Authorization</div>
                <div style="font-size: 12px; color: #64748B; margin-top: 2px;">{freelancer_name}</div>
                <div class="signature-line">Signature: __________________________  Date: ___________</div>
            </div>
            <div>
                <div style="font-weight: 800; font-size: 13px; color: #0F172A;">Client Acceptance & Sign-off</div>
                <div style="font-size: 12px; color: #64748B; margin-top: 2px;">Authorized Representative for {client_name}</div>
                <div class="signature-line">Signature: __________________________  Date: ___________</div>
            </div>
        </div>
    </div>
</body>
</html>
"""

@router.post("/{id}/accept-and-create-project")
async def accept_and_create_project(id: str, db: AsyncSession = Depends(get_db)):
    """Marks proposal accepted and promotes it into an active Project Workspace with decomposed tasks."""
    res = await db.execute(select(Proposal).where(Proposal.id == id))
    proposal = res.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    proposal.status = "accepted"
    proposal.updated_at = datetime.now(timezone.utc)

    # Check if a project was already created for this proposal
    existing_res = await db.execute(select(Project).where(Project.proposal_id == id))
    existing_project = existing_res.scalar_one_or_none()
    if existing_project:
        await db.commit()
        return {
            "project_id": existing_project.id,
            "project_title": existing_project.title,
            "message": "Existing project workspace loaded.",
            "status": "existing"
        }

    # Fetch opportunity details
    opp_res = await db.execute(select(Opportunity).where(Opportunity.id == proposal.opportunity_id))
    opp = opp_res.scalar_one_or_none()

    baseline_milestones = []
    total_budget = proposal.price_estimate or 0.0
    estimated_hours = 0.0
    hourly_rate = 75.0

    if proposal.milestones_json:
        try:
            baseline_milestones = json.loads(proposal.milestones_json)
        except Exception:
            pass

    if opp and opp.estimation_json and not baseline_milestones:
        try:
            est_data = json.loads(opp.estimation_json)
            baseline_milestones = est_data.get("milestones", [])
            if not total_budget and est_data.get("pricing_summary", {}).get("fixed_price", {}).get("suggested_client_price"):
                total_budget = est_data["pricing_summary"]["fixed_price"]["suggested_client_price"]
            if est_data.get("total_estimated_hours"):
                estimated_hours = est_data["total_estimated_hours"]
            if est_data.get("hourly_rate"):
                hourly_rate = est_data["hourly_rate"]
        except Exception:
            pass

    if opp:
        opp.status = "completed"

    project = Project(
        title=proposal.title,
        description=proposal.content_markdown[:300] if proposal.content_markdown else None,
        client_id=opp.client_id if opp else None,
        opportunity_id=proposal.opportunity_id,
        proposal_id=proposal.id,
        status="active",
        pricing_model="fixed",
        total_budget=total_budget,
        hourly_rate=hourly_rate,
        estimated_hours=estimated_hours,
        actual_hours=0.0,
        milestones_baseline_json=json.dumps(baseline_milestones) if baseline_milestones else None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(project)
    await db.flush()

    # Decompose baseline milestones into project tasks
    task_order = 1.0
    if baseline_milestones:
        for m_idx, m in enumerate(baseline_milestones):
            m_id = m.get("id") or f"m{m_idx + 1}"
            m_title = m.get("title") or m.get("milestone_name") or f"Milestone {m_idx + 1}"
            m_delivs = m.get("deliverables") or []
            m_hours = float(m.get("est_hours") or m.get("estimated_hours") or 20.0)

            if m_delivs:
                per_task_hours = round(m_hours / max(1, len(m_delivs)), 1)
                for deliv in m_delivs:
                    task = ProjectTask(
                        project_id=project.id,
                        milestone_id=m_id,
                        title=f"{m_title}: {deliv}",
                        description=f"Actionable deliverable for milestone '{m_title}'.",
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
                    project_id=project.id,
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

    await db.commit()
    await db.refresh(project)
    return {
        "project_id": project.id,
        "project_title": project.title,
        "message": "Project workspace generated successfully.",
        "status": "created"
    }

