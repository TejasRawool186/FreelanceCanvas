import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_proposal_lifecycle_statuses():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create opportunity
        opp_resp = await ac.post("/api/opportunities", json={
            "title": "Logistics Route Optimization API",
            "raw_content": "Build multi-stop routing engine with graph heuristics and vehicle capacity constraints.",
            "auto_analyze": False
        })
        assert opp_resp.status_code == 200
        opp_id = opp_resp.json()["id"]

        # Create proposal via POST endpoint
        prop_create_resp = await ac.post("/api/proposals", json={
            "opportunity_id": opp_id,
            "title": "Logistics Route Optimization Proposal",
            "content_markdown": "# Technical Proposal\n\nInitial draft for route optimization.",
            "price_estimate": 4800.0,
            "status": "draft"
        })
        assert prop_create_resp.status_code == 200
        prop_id = prop_create_resp.json()["id"]
        assert prop_create_resp.json()["status"] == "draft"

        # Update status to 'ready'
        up_resp = await ac.put(f"/api/proposals/{prop_id}", json={
            "status": "ready"
        })
        assert up_resp.status_code == 200
        assert up_resp.json()["status"] == "ready"

        # Update status to 'sent'
        sent_resp = await ac.put(f"/api/proposals/{prop_id}", json={
            "status": "sent"
        })
        assert sent_resp.status_code == 200
        assert sent_resp.json()["status"] == "sent"

        # Update status to 'accepted'
        acc_resp = await ac.put(f"/api/proposals/{prop_id}", json={
            "status": "accepted"
        })
        assert acc_resp.status_code == 200
        assert acc_resp.json()["status"] == "accepted"

        # Reject invalid status
        invalid_resp = await ac.put(f"/api/proposals/{prop_id}", json={
            "status": "not_a_valid_status"
        })
        assert invalid_resp.status_code == 400

@pytest.mark.asyncio
async def test_proposal_section_regeneration_grounded():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        opp_resp = await ac.post("/api/opportunities", json={
            "title": "Real-time Telemetry Processing",
            "raw_content": "Ingest and process 10,000 IoT sensor events/sec with Kafka and Redis.",
            "tech_stack": "Kafka, Redis, Python",
            "auto_analyze": False
        })
        opp_id = opp_resp.json()["id"]

        # Create proposal via POST endpoint
        prop_resp = await ac.post("/api/proposals", json={
            "opportunity_id": opp_id,
            "title": "Real-time Telemetry Proposal",
            "content_markdown": "# Base Proposal\n\nOverview of IoT pipeline.",
            "price_estimate": 6000.0,
            "status": "draft"
        })
        assert prop_resp.status_code == 200
        prop_id = prop_resp.json()["id"]

        # Regenerate executive summary section
        regen_resp = await ac.post(f"/api/proposals/{prop_id}/regenerate-section", json={
            "section_key": "executive_summary",
            "custom_instructions": "Highlight low latency and fault tolerance"
        })
        assert regen_resp.status_code == 200
        updated = regen_resp.json()
        assert "Executive Summary" in updated["content_markdown"]

        # Regenerate architecture section
        arch_resp = await ac.post(f"/api/proposals/{prop_id}/regenerate-section", json={
            "section_key": "architecture"
        })
        assert arch_resp.status_code == 200
        updated_arch = arch_resp.json()
        assert "Technical Architecture" in updated_arch["content_markdown"]

@pytest.mark.asyncio
async def test_proposal_export_html_and_markdown():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        opp_resp = await ac.post("/api/opportunities", json={
            "title": "Enterprise SSO & SCIM Directory Sync",
            "raw_content": "SAML2 and OIDC single sign-on with automatic Okta and Azure AD user provisioning.",
            "company": "Acme Global Enterprise",
            "auto_analyze": False
        })
        opp_id = opp_resp.json()["id"]

        # Create proposal with milestones and risks via POST endpoint
        prop_resp = await ac.post("/api/proposals", json={
            "opportunity_id": opp_id,
            "title": "Enterprise SSO Proposal",
            "content_markdown": "# Executive Summary\n\nHigh performance identity sync.",
            "milestones": [
                {
                    "id": "m1",
                    "phase": "Phase 1",
                    "title": "SAML Auth",
                    "est_hours": 20.0,
                    "rate": 120.0,
                    "contingency_percent": 15.0,
                    "subtotal": 2400.0,
                    "contingency_cost": 360.0,
                    "total_cost": 2760.0,
                    "duration_weeks": 1.0,
                    "deliverables": ["Okta SAML integration"]
                }
            ],
            "risks": [
                {
                    "id": "r1",
                    "category": "Security",
                    "risk": "IdP certificate expiry",
                    "severity": "Medium",
                    "probability": "Low",
                    "impact": "Auth outage",
                    "mitigation": "Automated cert rotation alerts",
                    "contractual_assumption": "Client provisions IdP sandbox"
                }
            ],
            "price_estimate": 2760.0,
            "status": "ready"
        })
        assert prop_resp.status_code == 200
        prop_id = prop_resp.json()["id"]

        # Test HTML export
        html_resp = await ac.get(f"/api/proposals/{prop_id}/export-html")
        assert html_resp.status_code == 200
        assert "text/html" in html_resp.headers["content-type"]
        html_text = html_resp.text
        assert "<!DOCTYPE html>" in html_text
        assert "@media print" in html_text
        assert "Enterprise SSO Proposal" in html_text
        assert "Acme Global Enterprise" in html_text
        assert "SAML Auth" in html_text
        assert "$2,760.00" in html_text
        assert "Client Acceptance & Sign-off" in html_text

        # Test Markdown download
        md_resp = await ac.get(f"/api/proposals/{prop_id}/download-markdown")
        assert md_resp.status_code == 200
        assert "attachment" in md_resp.headers["content-disposition"]
        assert "# Executive Summary" in md_resp.text
