from typing import List
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.models import Proposal
from ..schemas.schemas import ProposalResponse

router = APIRouter(prefix="/api/proposals", tags=["Proposals"])

@router.get("/opportunity/{opportunity_id}", response_model=List[ProposalResponse])
async def get_proposals_by_opportunity(opportunity_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Proposal).where(Proposal.opportunity_id == opportunity_id))
    return result.scalars().all()

@router.get("/{id}", response_model=ProposalResponse)
async def get_proposal(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Proposal).where(Proposal.id == id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

@router.get("/{id}/download-markdown")
async def download_proposal_markdown(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Proposal).where(Proposal.id == id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    filename = f"{proposal.title.replace(' ', '_').lower()}.md"
    return PlainTextResponse(
        content=proposal.content_markdown,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{id}/audio")
async def get_proposal_audio(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Proposal).where(Proposal.id == id))
    proposal = result.scalar_one_or_none()
    if not proposal or not proposal.audio_path:
        raise HTTPException(status_code=404, detail="Audio brief not found")
    
    audio_path = Path(proposal.audio_path)
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file missing on disk")
    
    media_type = "audio/mpeg" if audio_path.suffix == ".mp3" else "text/plain"
    return FileResponse(path=str(audio_path), media_type=media_type)
