import os
import time
import platform
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, func, select
import httpx
from ..config import settings
from ..database import get_db
from ..models.models import Opportunity, Proposal, Project, Invoice

logger = logging.getLogger("freelance_desk.health")
router = APIRouter(prefix="/api/health", tags=["Health"])

BOOT_TIME = time.time()

@router.get("")
async def get_health(db: AsyncSession = Depends(get_db)):
    """Fast liveness and readiness probe for container orchestrators and load balancers."""
    db_connected = False
    db_latency_ms = 0.0
    try:
        t0 = time.perf_counter()
        res = await db.execute(text("SELECT 1"))
        res.scalar()
        db_latency_ms = round((time.perf_counter() - t0) * 1000, 2)
        db_connected = True
    except Exception as exc:
        logger.error(f"Database health check failed: {exc}")
        db_connected = False

    ollama_online = False
    try:
        async with httpx.AsyncClient(timeout=1.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            ollama_online = (resp.status_code == 200)
    except Exception:
        ollama_online = False

    # Honest overall status determination
    if not db_connected:
        overall_status = "unhealthy"
    elif not ollama_online:
        overall_status = "degraded"
    else:
        overall_status = "healthy"

    dependencies = {
        "database": {
            "status": "connected" if db_connected else "disconnected",
            "latency_ms": db_latency_ms
        },
        "ollama": {
            "status": "connected" if ollama_online else "offline",
            "model": settings.OLLAMA_MODEL
        },
        "serpapi": "configured" if bool(settings.SERPAPI_API_KEY) else "unconfigured",
        "elevenlabs": "configured" if bool(settings.ELEVENLABS_API_KEY) else "unconfigured"
    }

    return {
        "status": overall_status,
        "service": "FreelanceCanvas",
        "version": "1.0.0",
        "uptime_seconds": int(time.time() - BOOT_TIME),
        "ollama_connected": ollama_online,
        "ollama_model": settings.OLLAMA_MODEL,
        "dependencies": dependencies
    }

@router.get("/detailed")
async def get_detailed_health(db: AsyncSession = Depends(get_db)):
    """Deep diagnostics telemetry covering database, storage, RAG store, and compute subsystems."""
    now = time.time()
    subsystems: Dict[str, Any] = {}

    # 1. Database Subsystem
    db_latency_ms = 0.0
    try:
        t0 = time.perf_counter()
        await db.execute(text("SELECT 1"))
        db_latency_ms = round((time.perf_counter() - t0) * 1000, 2)

        # Count records
        opp_count = (await db.execute(select(func.count(Opportunity.id)))).scalar() or 0
        prop_count = (await db.execute(select(func.count(Proposal.id)))).scalar() or 0
        proj_count = (await db.execute(select(func.count(Project.id)))).scalar() or 0
        inv_count = (await db.execute(select(func.count(Invoice.id)))).scalar() or 0

        subsystems["database"] = {
            "status": "healthy",
            "latency_ms": db_latency_ms,
            "engine": "SQLite/aiosqlite",
            "tables": {
                "opportunities": opp_count,
                "proposals": prop_count,
                "projects": proj_count,
                "invoices": inv_count
            }
        }
    except Exception as exc:
        subsystems["database"] = {
            "status": "unhealthy",
            "error": str(exc)
        }

    # 2. Disk Storage & Writeability Subsystem
    storage_healthy = True
    storage_checks = {}
    for name, path in [
        ("data", settings.DATA_DIR),
        ("artifacts", settings.ARTIFACTS_DIR),
        ("uploads", settings.UPLOADS_DIR),
        ("portfolio", settings.PORTFOLIO_DIR)
    ]:
        try:
            path.mkdir(parents=True, exist_ok=True)
            test_file = path / ".health_probe"
            test_file.write_text("ok", encoding="utf-8")
            if test_file.exists():
                test_file.unlink()
            storage_checks[name] = {"path": str(path), "writable": True}
        except Exception as exc:
            storage_healthy = False
            storage_checks[name] = {"path": str(path), "writable": False, "error": str(exc)}

    subsystems["storage"] = {
        "status": "healthy" if storage_healthy else "degraded",
        "directories": storage_checks
    }

    # 3. Vector / Portfolio Knowledge Base Subsystem
    try:
        portfolio_file = settings.DATA_DIR / "portfolio_store.json"
        case_study_count = 0
        if portfolio_file.exists():
            import json
            data = json.loads(portfolio_file.read_text(encoding="utf-8"))
            case_study_count = len(data) if isinstance(data, list) else 0

        subsystems["rag_portfolio"] = {
            "status": "ready",
            "engine": "BM25+Qdrant",
            "case_studies_indexed": case_study_count,
            "store_path": str(portfolio_file)
        }
    except Exception as exc:
        subsystems["rag_portfolio"] = {
            "status": "degraded",
            "error": str(exc)
        }

    # 4. Ollama LLM Subsystem
    ollama_latency_ms = 0.0
    ollama_online = False
    try:
        t0 = time.perf_counter()
        async with httpx.AsyncClient(timeout=1.5) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            ollama_latency_ms = round((time.perf_counter() - t0) * 1000, 2)
            ollama_online = (resp.status_code == 200)
    except Exception:
        ollama_online = False

    subsystems["ollama_llm"] = {
        "status": "online" if ollama_online else "offline",
        "url": settings.OLLAMA_BASE_URL,
        "model": settings.OLLAMA_MODEL,
        "latency_ms": ollama_latency_ms if ollama_online else None,
        "fallback_available": True
    }

    # 5. External Partner APIs
    subsystems["partner_apis"] = {
        "elevenlabs": {
            "status": "configured" if bool(settings.ELEVENLABS_API_KEY) else "unconfigured",
            "voice_id": settings.ELEVENLABS_VOICE_ID,
            "offline_fallback": "Web Speech API (Native Browser Speech)"
        },
        "serpapi": {
            "status": "configured" if bool(settings.SERPAPI_API_KEY) else "unconfigured",
            "offline_fallback": "Local Search / Manual Input"
        }
    }

    # System Environment
    sys_env = {
        "platform": platform.platform(),
        "python_version": platform.python_version(),
        "uptime_seconds": int(now - BOOT_TIME),
        "debug_mode": settings.DEBUG,
        "rate_limiting": settings.RATE_LIMIT_ENABLED
    }

    is_overall_healthy = (
        subsystems["database"].get("status") == "healthy" and
        subsystems["storage"].get("status") == "healthy"
    )

    return {
        "status": "healthy" if (is_overall_healthy and ollama_online) else ("degraded" if is_overall_healthy else "unhealthy"),
        "service": "FreelanceCanvas",
        "environment": sys_env,
        "subsystems": subsystems
    }

@router.get("/metrics")
async def get_health_metrics(db: AsyncSession = Depends(get_db)):
    """Executive operational telemetry for portfolio desk throughput."""
    opp_count = (await db.execute(select(func.count(Opportunity.id)))).scalar() or 0
    prop_count = (await db.execute(select(func.count(Proposal.id)))).scalar() or 0
    proj_count = (await db.execute(select(func.count(Project.id)))).scalar() or 0

    inv_records = (await db.execute(select(Invoice))).scalars().all()
    total_invoiced = sum(inv.total_amount for inv in inv_records)
    total_paid = sum(inv.total_amount for inv in inv_records if inv.status == "paid")
    pending_amount = sum(inv.total_amount for inv in inv_records if inv.status in ["sent", "draft"])

    return {
        "opportunities_total": opp_count,
        "proposals_generated": prop_count,
        "projects_managed": proj_count,
        "financials": {
            "invoices_total": len(inv_records),
            "total_invoiced": total_invoiced,
            "total_collected": total_paid,
            "pending_receivable": pending_amount
        },
        "uptime_seconds": int(time.time() - BOOT_TIME)
    }
