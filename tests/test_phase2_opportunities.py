import io
import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_create_opportunity_with_full_metadata():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "title": "Fintech Risk Analytics Dashboard",
            "client_name": "Apex Capital",
            "company": "Apex Capital Partners",
            "website": "https://apexcapital.example",
            "raw_content": "We need a real-time risk telemetry dashboard for algorithmic portfolios. Python FastAPI backend with React front-end.",
            "source_type": "text",
            "source_url": "https://jobs.example/apex-rfp",
            "budget_range": "$12,000 - $18,000",
            "deadline": "6 weeks",
            "tech_stack": "Python, FastAPI, TypeScript, React, PostgreSQL",
            "notes": "Client requested SOC2 compliant architecture and audit logging.",
            "tags": "fintech, telemetry, api, soc2",
            "status": "draft"
        }
        res = await client.post("/api/opportunities", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["title"] == payload["title"]
        assert data["status"] == "draft"
        assert data["source_url"] == payload["source_url"]
        assert data["notes"] == payload["notes"]
        assert data["tags"] == payload["tags"]
        opp_id = data["id"]

        # Verify retrieval
        get_res = await client.get(f"/api/opportunities/{opp_id}")
        assert get_res.status_code == 200
        assert get_res.json()["title"] == payload["title"]

@pytest.mark.asyncio
async def test_update_opportunity():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create initial opportunity
        create_res = await client.post("/api/opportunities", json={
            "title": "Initial Title",
            "raw_content": "Initial requirements content",
            "budget_range": "$5,000",
            "status": "draft"
        })
        opp = create_res.json()
        opp_id = opp["id"]

        # Update fields
        update_payload = {
            "title": "Updated Title: AI Chat Assistant",
            "budget_range": "$8,000 - $10,000",
            "notes": "Updated scope after discovery call.",
            "status": "ready_for_analysis"
        }
        put_res = await client.put(f"/api/opportunities/{opp_id}", json=update_payload)
        assert put_res.status_code == 200
        updated = put_res.json()
        assert updated["title"] == "Updated Title: AI Chat Assistant"
        assert updated["budget_range"] == "$8,000 - $10,000"
        assert updated["notes"] == "Updated scope after discovery call."
        assert updated["status"] == "ready_for_analysis"

@pytest.mark.asyncio
async def test_delete_opportunity():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create_res = await client.post("/api/opportunities", json={
            "title": "Temporary Opportunity",
            "raw_content": "To be deleted",
            "status": "draft"
        })
        opp_id = create_res.json()["id"]

        del_res = await client.delete(f"/api/opportunities/{opp_id}")
        assert del_res.status_code == 200
        assert del_res.json()["status"] == "success"

        # Verify 404 on subsequent get
        get_res = await client.get(f"/api/opportunities/{opp_id}")
        assert get_res.status_code == 404

@pytest.mark.asyncio
async def test_upload_valid_text_document():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        content = "Client Brief: Build a high-throughput event processing pipeline in Go and Kafka."
        files = {
            "file": ("brief.txt", io.BytesIO(content.encode("utf-8")), "text/plain")
        }
        data = {
            "title": "Event Pipeline Ingest",
            "company": "DataStream Ltd",
            "budget_range": "$10,000"
        }
        res = await client.post("/api/opportunities/upload", data=data, files=files)
        assert res.status_code == 200
        opp = res.json()
        assert opp["title"] == "Event Pipeline Ingest"
        assert "high-throughput event processing pipeline" in opp["raw_content"]
        assert opp["source_type"] == "file"

@pytest.mark.asyncio
async def test_upload_disallowed_file_extension():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        files = {
            "file": ("malicious.exe", io.BytesIO(b"binary data"), "application/x-msdownload")
        }
        data = {"title": "Malicious Upload"}
        res = await client.post("/api/opportunities/upload", data=data, files=files)
        assert res.status_code == 400
        assert "Unsupported file format" in res.json()["detail"]

@pytest.mark.asyncio
async def test_upload_file_size_limit():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        oversized_content = b"A" * (11 * 1024 * 1024)  # 11MB > 10MB limit
        files = {
            "file": ("oversized.txt", io.BytesIO(oversized_content), "text/plain")
        }
        data = {"title": "Oversized Brief"}
        res = await client.post("/api/opportunities/upload", data=data, files=files)
        assert res.status_code in (400, 413)
        assert "exceeds maximum allowed size" in res.json()["detail"]
