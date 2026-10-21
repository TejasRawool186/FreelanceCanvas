import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_health_check_honesty():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "ollama_connected" in data
        assert "dependencies" in data
        if not data["ollama_connected"]:
            assert data["status"] in ("degraded", "operational_without_ai")
        else:
            assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_first_run_profile_no_hardcoded_identity():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/profile")
        assert response.status_code == 200
        data = response.json()
        # Must NOT contain hardcoded "Alex Mercer" as the default persona
        assert data.get("full_name") != "Alex Mercer"
        assert "onboarding_completed" in data

@pytest.mark.asyncio
async def test_complete_onboarding():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        onboarding_payload = {
            "full_name": "Jane Developer",
            "title": "Full-Stack Python & React Engineer",
            "skills": "FastAPI, React, TypeScript, PostgreSQL",
            "hourly_rate": 95.0,
            "currency": "USD",
            "timezone": "America/New_York",
            "availability_hours_per_week": 35.0,
            "experience_years": 7.0,
            "preferred_categories": "Full-stack Web, APIs, MVP Development",
            "preferred_ai_provider": "ollama",
            "preferred_ai_model": "gemma3:1b"
        }
        response = await client.post("/api/profile/onboarding", json=onboarding_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Jane Developer"
        assert data["hourly_rate"] == 95.0
        assert data["onboarding_completed"] is True

        # Verify profile persists on subsequent GET
        get_resp = await client.get("/api/profile")
        assert get_resp.status_code == 200
        persisted = get_resp.json()
        assert persisted["full_name"] == "Jane Developer"
        assert persisted["onboarding_completed"] is True

@pytest.mark.asyncio
async def test_profile_update():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        update_payload = {
            "hourly_rate": 110.0,
            "bio": "Building reliable high-performance distributed systems."
        }
        response = await client.put("/api/profile", json=update_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["hourly_rate"] == 110.0
        assert data["bio"] == "Building reliable high-performance distributed systems."

@pytest.mark.asyncio
async def test_integrations_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/profile/integrations")
        assert response.status_code == 200
        data = response.json()
        assert "ollama" in data
        assert "serpapi" in data
        assert "elevenlabs" in data

@pytest.mark.asyncio
async def test_demo_dataset_load_and_clear():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Load demo dataset
        load_resp = await client.post("/api/profile/demo/load")
        assert load_resp.status_code == 200
        assert load_resp.json()["status"] in ("success", "info")

        # Verify demo opportunity appears
        opps_resp = await client.get("/api/opportunities")
        assert opps_resp.status_code == 200
        opps = opps_resp.json()
        demo_opps = [o for o in opps if o.get("is_demo") is True]
        assert len(demo_opps) > 0

        # Clear demo dataset
        clear_resp = await client.post("/api/profile/demo/clear")
        assert clear_resp.status_code == 200
        assert clear_resp.json()["status"] == "success"

        # Verify demo opportunities removed
        opps_after = (await client.get("/api/opportunities")).json()
        assert not any(o.get("is_demo") is True for o in opps_after)
