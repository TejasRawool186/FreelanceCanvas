import json
import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_complete_freelancer_lifecycle_journey():
    """
    End-to-End integration test covering the entire solo developer workflow:
    1. Onboard custom profile & rate card
    2. Ingest client RFP opportunity
    3. AI Requirements extraction & fit scoring
    4. Deterministic estimation & proposal generation
    5. Executive audio briefing preparation
    6. Proposal promotion to active project execution workspace
    7. Kanban task management & actual hour tracking
    8. Scope Guard creep detection
    9. Client status reporting & HTML export
    10. Milestone invoicing & cash collected telemetry
    11. Production system health & metrics telemetry
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:

        # ----------------------------------------------------------------------
        # Step 1: Onboard Custom Freelancer Profile
        # ----------------------------------------------------------------------
        profile_res = await ac.put("/api/profile", json={
            "full_name": "Jordan Vance",
            "title": "Principal Distributed Systems Engineer",
            "bio": "12+ years building high-throughput event-driven microservices.",
            "hourly_rate": 150.0,
            "currency": "USD",
            "timezone": "America/New_York",
            "availability_hours_per_week": 35.0,
            "skills": "Python, FastAPI, React, TypeScript, Kafka, SQLite, Docker",
            "experience_years": 12.0,
            "preferred_categories": "Full-Stack Web, Backend APIs, Cloud Infrastructure",
            "preferred_ai_provider": "ollama",
            "preferred_ai_model": "gemma3:1b",
            "onboarding_completed": True
        })
        assert profile_res.status_code == 200
        profile_data = profile_res.json()
        assert profile_data["hourly_rate"] == 150.0
        assert profile_data["onboarding_completed"] is True

        # ----------------------------------------------------------------------
        # Step 2: Ingest Real Client Brief / Opportunity
        # ----------------------------------------------------------------------
        opp_res = await ac.post("/api/opportunities", json={
            "title": "Global Trade Logistics Analytics Platform",
            "company": "Vanguard Oceanics",
            "raw_content": (
                "We need a real-time container tracking portal with WebSocket status feeds, "
                "automated customs compliance document generation, and role-based access for port operators. "
                "Stack must use Python FastAPI and React. Project timeline is 6 weeks."
            ),
            "budget_range": "$15,000 - $25,000",
            "deadline": "6 weeks",
            "tech_stack": "FastAPI, React, SQLite, Docker",
            "source_type": "text",
            "auto_analyze": False
        })
        assert opp_res.status_code == 200
        opp = opp_res.json()
        opp_id = opp["id"]
        assert opp["title"] == "Global Trade Logistics Analytics Platform"

        # ----------------------------------------------------------------------
        # Step 3: Run AI Opportunity Intelligence & Fit Scoring
        # ----------------------------------------------------------------------
        intel_res = await ac.post(f"/api/opportunities/{opp_id}/score")
        assert intel_res.status_code == 200
        intel = intel_res.json()
        assert "scoring" in intel
        assert 0.0 <= intel["scoring"]["composite_score"] <= 100.0
        assert "recommendation" in intel["scoring"]
        assert "requirements" in intel
        assert len(intel["requirements"]["deliverables"]) > 0
        assert "discovery" in intel
        assert len(intel["discovery"]["questions"]) > 0

        # ----------------------------------------------------------------------
        # Step 4: Generate Proposal with Milestones and Pricing
        # ----------------------------------------------------------------------
        prop_res = await ac.post("/api/proposals", json={
            "opportunity_id": opp_id,
            "title": "Global Trade Logistics Analytics Proposal",
            "content_markdown": "# Technical Proposal & Architecture\n\nComprehensive scope and milestone breakdown.",
            "price_estimate": 14850.0,
            "status": "ready",
            "milestones": [
                {
                    "id": "m1",
                    "phase": 1,
                    "title": "Core Architecture & WebSocket Pipeline",
                    "description": "Establish FastAPI WebSocket hub and data schemas",
                    "deliverables": ["WebSocket server", "Docker config"],
                    "est_hours": 40.0,
                    "rate": 150.0,
                    "contingency_percent": 10.0,
                    "subtotal": 6000.0,
                    "contingency_cost": 600.0,
                    "total_cost": 6600.0,
                    "duration_weeks": 2
                },
                {
                    "id": "m2",
                    "phase": 2,
                    "title": "Customs Document Engine & Role-Based UI",
                    "description": "Build PDF document generation and React dashboard",
                    "deliverables": ["PDF engine", "React frontend"],
                    "est_hours": 50.0,
                    "rate": 150.0,
                    "contingency_percent": 10.0,
                    "subtotal": 7500.0,
                    "contingency_cost": 750.0,
                    "total_cost": 8250.0,
                    "duration_weeks": 3
                }
            ],
            "risks": [
                {
                    "id": "r1",
                    "category": "Technical",
                    "risk": "High volume WebSocket message spikes",
                    "severity": "Medium",
                    "mitigation": "In-memory queue buffer and connection pooling"
                }
            ]
        })
        assert prop_res.status_code == 200
        prop = prop_res.json()
        prop_id = prop["id"]
        assert prop["opportunity_id"] == opp_id
        assert prop["price_estimate"] == 14850.0
        assert prop["milestones_json"] is not None
        milestones = json.loads(prop["milestones_json"])
        assert len(milestones) == 2
        assert prop["risk_register_json"] is not None
        risks = json.loads(prop["risk_register_json"])
        assert len(risks) == 1

        # ----------------------------------------------------------------------
        # Step 5: Executive Audio Briefing Preparation
        # ----------------------------------------------------------------------
        audio_brief_res = await ac.get(f"/api/proposals/{prop_id}/audio-brief")
        assert audio_brief_res.status_code == 200
        audio_meta = audio_brief_res.json()
        assert "script" in audio_meta
        assert len(audio_meta["script"]) > 20
        assert audio_meta["recommended_engine"] in ["stream", "browser_speech_synthesis"]

        # ----------------------------------------------------------------------
        # Step 6: Promote Approved Proposal to Project Execution Workspace
        # ----------------------------------------------------------------------
        promote_res = await ac.post(f"/api/proposals/{prop_id}/accept-and-create-project")
        assert promote_res.status_code == 200
        promote_data = promote_res.json()
        assert promote_data["status"] == "created"
        proj_id = promote_data["project_id"]

        proj_check = await ac.get(f"/api/projects/{proj_id}")
        assert proj_check.status_code == 200
        proj = proj_check.json()
        assert proj["proposal_id"] == prop_id
        assert proj["status"] == "active"
        assert proj["total_budget"] == prop["price_estimate"]
        assert len(proj["tasks"]) > 0

        first_task = proj["tasks"][0]
        first_task_id = first_task["id"]

        # ----------------------------------------------------------------------
        # Step 7: Kanban Task Lifecycle & Actual Hour Logging
        # ----------------------------------------------------------------------
        task_update_res = await ac.put(f"/api/projects/{proj_id}/tasks/{first_task_id}", json={
            "title": first_task["title"],
            "status": "done",
            "priority": "high",
            "actual_hours": 12.0
        })
        assert task_update_res.status_code == 200
        updated_task = task_update_res.json()
        assert updated_task["status"] == "done"
        assert updated_task["actual_hours"] == 12.0

        # Verify project actual hours rolled up
        proj_refresh = await ac.get(f"/api/projects/{proj_id}")
        assert proj_refresh.status_code == 200
        assert proj_refresh.json()["actual_hours"] >= 12.0

        # ----------------------------------------------------------------------
        # Step 8: Scope Guard Creep Detection
        # ----------------------------------------------------------------------
        guard_res = await ac.post(f"/api/projects/{proj_id}/scope-check", json={
            "new_request_text": "We also want you to build an iOS and Android native mobile app with Bluetooth low energy hardware sensor pairing.",
            "client_name": "Vanguard Oceanics"
        })
        assert guard_res.status_code == 200
        guard_data = guard_res.json()
        assert guard_data["is_scope_creep"] is True
        assert guard_data["scope_status"] in ["probable_scope_creep", "definitive_scope_creep"]
        assert guard_data["estimated_impact_hours"] > 0
        assert guard_data["suggested_change_order_cost"] > 0

        # ----------------------------------------------------------------------
        # Step 9: Client Status Reporting & HTML Export
        # ----------------------------------------------------------------------
        report_res = await ac.post(f"/api/projects/{proj_id}/reports/generate", json={
            "report_type": "weekly_update",
            "client_name": "Vanguard Oceanics",
            "custom_notes": "Milestone 1 architecture tasks completed on schedule."
        })
        assert report_res.status_code == 200
        report = report_res.json()
        assert report["report_type"] == "weekly_update"
        assert len(report["completed_deliverables"]) >= 1
        assert "email_body_markdown" in report
        assert "Key Accomplishments This Sprint" in report["email_body_markdown"]

        # Vector HTML export
        html_res = await ac.get(f"/api/projects/{proj_id}/reports/export-html?report_type=weekly_update&client_name=Vanguard+Oceanics")
        assert html_res.status_code == 200
        assert "text/html" in html_res.headers["content-type"]
        assert "<!DOCTYPE html>" in html_res.text
        assert "Vanguard Oceanics" in html_res.text

        # ----------------------------------------------------------------------
        # Step 10: Milestone Invoicing & Financial Health
        # ----------------------------------------------------------------------
        inv_res = await ac.post("/api/invoices", json={
            "project_id": proj_id,
            "title": "Milestone 1 Billing: Core Architecture",
            "generate_from_milestone_id": "m1"
        })
        assert inv_res.status_code == 201
        inv = inv_res.json()
        inv_id = inv["id"]
        assert inv["total_amount"] > 0

        # Mark invoice as paid
        paid_res = await ac.put(f"/api/invoices/{inv_id}", json={"status": "paid"})
        assert paid_res.status_code == 200
        assert paid_res.json()["status"] == "paid"

        # Verify financial health telemetry reflects payment
        fin_health = await ac.get("/api/invoices/financial-health")
        assert fin_health.status_code == 200
        fin_data = fin_health.json()
        assert fin_data["total_collected"] >= inv["total_amount"]
        assert fin_data["total_invoiced"] >= inv["total_amount"]

        # ----------------------------------------------------------------------
        # Step 11: Production Health Diagnostics & Executive Metrics
        # ----------------------------------------------------------------------
        metrics_res = await ac.get("/api/health/metrics")
        assert metrics_res.status_code == 200
        metrics = metrics_res.json()
        assert metrics["opportunities_total"] >= 1
        assert metrics["proposals_generated"] >= 1
        assert metrics["projects_managed"] >= 1
        assert metrics["financials"]["total_collected"] >= inv["total_amount"]

        detailed_res = await ac.get("/api/health/detailed")
        assert detailed_res.status_code == 200
        assert detailed_res.json()["subsystems"]["database"]["status"] == "healthy"
        assert detailed_res.json()["subsystems"]["storage"]["status"] == "healthy"
