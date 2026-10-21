import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_generate_weekly_progress_update():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create project with tasks
        proj_res = await client.post("/api/projects", json={
            "title": "HealthTech Telemedicine Platform",
            "total_budget": 10000.0,
            "hourly_rate": 100.0,
            "estimated_hours": 100.0
        })
        assert proj_res.status_code == 201
        proj_id = proj_res.json()["id"]

        # Add tasks with varying states
        t1 = (await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "HIPAA Database Encryption",
            "status": "done",
            "estimated_hours": 20.0,
            "actual_hours": 22.0
        })).json()

        t2 = (await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "Video Consultation Room UI",
            "status": "in_progress",
            "estimated_hours": 30.0,
            "actual_hours": 12.0
        })).json()

        t3 = (await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "E-Prescription Integration",
            "status": "todo",
            "estimated_hours": 25.0,
            "actual_hours": 0.0
        })).json()

        # Generate weekly report
        report_res = await client.post(f"/api/projects/{proj_id}/reports/generate", json={
            "report_type": "weekly_update",
            "client_name": "HealthCorp Partners",
            "custom_notes": "All database migrations verified in staging."
        })
        assert report_res.status_code == 200
        report = report_res.json()
        assert report["report_type"] == "weekly_update"
        assert "Weekly" in report["report_title"]
        assert len(report["completed_deliverables"]) == 1
        assert "HIPAA Database Encryption" in report["completed_deliverables"][0]
        assert len(report["in_progress_deliverables"]) == 1
        assert "Video Consultation" in report["in_progress_deliverables"][0]
        assert report["total_actual_hours"] == 34.0
        assert report["budget_burned"] == 3400.0
        assert report["budget_burn_percent"] == 34.0
        assert "HealthTech Telemedicine Platform" in report["email_subject"]
        assert "HealthCorp Partners" in report["email_body_markdown"]
        assert "Key Accomplishments This Sprint" in report["email_body_markdown"]

@pytest.mark.asyncio
async def test_generate_milestone_signoff_report():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create project
        proj_res = await client.post("/api/projects", json={
            "title": "AI Knowledge Base Pipeline",
            "total_budget": 6000.0,
            "hourly_rate": 100.0
        })
        assert proj_res.status_code == 201
        proj_id = proj_res.json()["id"]

        # Add completed deliverable
        await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "Hybrid BM25 Vector Ingestion",
            "status": "done",
            "estimated_hours": 20.0,
            "actual_hours": 20.0
        })

        # Request milestone signoff
        signoff_res = await client.post(f"/api/projects/{proj_id}/reports/generate", json={
            "report_type": "milestone_signoff",
            "client_name": "KnowledgeAI Inc."
        })
        assert signoff_res.status_code == 200
        signoff = signoff_res.json()
        assert signoff["report_type"] == "milestone_signoff"
        assert "Sign-Off" in signoff["report_title"]
        assert "Sign-Off Request" in signoff["email_subject"]
        assert "APPROVED" in signoff["email_body_markdown"]
        assert "Hybrid BM25 Vector Ingestion" in signoff["completed_deliverables"][0]

@pytest.mark.asyncio
async def test_generate_blocker_alert_with_dependencies():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create project
        proj_res = await client.post("/api/projects", json={
            "title": "Payment Gateway Migration",
            "total_budget": 5000.0,
            "hourly_rate": 100.0
        })
        proj_id = proj_res.json()["id"]

        # Add urgent task blocked on client credentials
        await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "Stripe Connect Onboarding",
            "priority": "urgent",
            "status": "todo",
            "notes": "Blocked waiting for client Stripe Connect client_id and API production credentials",
            "estimated_hours": 15.0
        })

        # Generate blocker alert
        blocker_res = await client.post(f"/api/projects/{proj_id}/reports/generate", json={
            "report_type": "blocker_alert",
            "client_name": "Marketplace Co.",
            "custom_notes": "Waiting on client production Stripe credentials"
        })
        assert blocker_res.status_code == 200
        blocker = blocker_res.json()
        assert blocker["report_type"] == "blocker_alert"
        assert "Blocker Alert" in blocker["report_title"]
        assert len(blocker["blockers"]) > 0
        assert "Stripe Connect" in blocker["blockers"][0]
        assert "Critical Dependencies / Blockers" in blocker["email_body_markdown"]

@pytest.mark.asyncio
async def test_export_client_report_html():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create project with task
        proj_res = await client.post("/api/projects", json={
            "title": "Enterprise CRM Sync",
            "total_budget": 7500.0,
            "hourly_rate": 100.0
        })
        proj_id = proj_res.json()["id"]

        await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "Salesforce OAuth Handler",
            "status": "done",
            "actual_hours": 15.0,
            "estimated_hours": 15.0
        })

        # Fetch HTML export
        html_res = await client.get(f"/api/projects/{proj_id}/reports/export-html?report_type=weekly_update&client_name=MegaCorp")
        assert html_res.status_code == 200
        assert "text/html" in html_res.headers["content-type"]
        html_content = html_res.text
        assert "<!DOCTYPE html>" in html_content
        assert "Enterprise CRM Sync" in html_content
        assert "Salesforce OAuth Handler" in html_content
        assert "MegaCorp" in html_content
        assert "Hours Logged" in html_content
