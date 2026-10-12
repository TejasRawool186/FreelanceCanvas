from fastapi import APIRouter
import httpx
from ..config import settings

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("")
async def get_health():
    ollama_online = False
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            ollama_online = (resp.status_code == 200)
    except Exception:
        ollama_online = False

    return {
        "status": "healthy",
        "service": "Autonomiq Freelance Desk",
        "version": "1.0.0",
        "ollama_connected": ollama_online,
        "ollama_model": settings.OLLAMA_MODEL,
        "serpapi_configured": bool(settings.SERPAPI_API_KEY),
        "elevenlabs_configured": bool(settings.ELEVENLABS_API_KEY)
    }
