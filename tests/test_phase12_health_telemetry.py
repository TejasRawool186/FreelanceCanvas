import pytest
from unittest.mock import patch
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_basic_health_liveness_and_db_ping():
    """Verify standard liveness probe with real database connection ping."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/health")
        assert res.status_code == 200
        data = res.json()

        assert data["service"] == "FreelanceCanvas"
        assert data["status"] in ["healthy", "degraded"]
        assert "uptime_seconds" in data
        assert data["uptime_seconds"] >= 0

        # Database connection check
        db_dep = data["dependencies"]["database"]
        assert db_dep["status"] == "connected"
        assert "latency_ms" in db_dep
        assert isinstance(db_dep["latency_ms"], (int, float))

@pytest.mark.asyncio
async def test_detailed_health_diagnostics_and_subsystems():
    """Verify deep diagnostics probe detailing database, storage, RAG, and LLM subsystems."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/health/detailed")
        assert res.status_code == 200
        data = res.json()

        assert "subsystems" in data
        sub = data["subsystems"]

        # 1. Database table metrics
        assert "database" in sub
        assert sub["database"]["status"] == "healthy"
        assert "tables" in sub["database"]
        assert "opportunities" in sub["database"]["tables"]
        assert "invoices" in sub["database"]["tables"]

        # 2. Disk storage directories writeability
        assert "storage" in sub
        assert sub["storage"]["status"] in ["healthy", "degraded"]
        dirs = sub["storage"]["directories"]
        for required_dir in ["data", "artifacts", "uploads", "portfolio"]:
            assert required_dir in dirs
            assert dirs[required_dir]["writable"] is True

        # 3. RAG Portfolio store
        assert "rag_portfolio" in sub
        assert sub["rag_portfolio"]["status"] == "ready"
        assert "case_studies_indexed" in sub["rag_portfolio"]

        # 4. LLM & Partner APIs
        assert "ollama_llm" in sub
        assert "partner_apis" in sub
        assert "elevenlabs" in sub["partner_apis"]

        # 5. Host & environment
        assert "environment" in data
        assert "platform" in data["environment"]
        assert "python_version" in data["environment"]

@pytest.mark.asyncio
async def test_health_operational_metrics():
    """Verify executive telemetry counters across opportunities, proposals, and invoices."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/health/metrics")
        assert res.status_code == 200
        data = res.json()

        assert "opportunities_total" in data
        assert "proposals_generated" in data
        assert "projects_managed" in data
        assert "financials" in data

        fin = data["financials"]
        assert "invoices_total" in fin
        assert "total_invoiced" in fin
        assert "total_collected" in fin
        assert "pending_receivable" in fin

@pytest.mark.asyncio
async def test_database_offline_graceful_degradation():
    """Verify that when the database query fails, health returns status 'unhealthy' honestly."""
    transport = ASGITransport(app=app)
    with patch("sqlalchemy.ext.asyncio.AsyncSession.execute", side_effect=Exception("Database lock error")):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.get("/api/health")
            assert res.status_code == 200
            data = res.json()
            assert data["status"] == "unhealthy"
            assert data["dependencies"]["database"]["status"] == "disconnected"
