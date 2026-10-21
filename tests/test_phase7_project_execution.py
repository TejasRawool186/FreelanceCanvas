import json
import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_create_project_from_accepted_proposal():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create client & opportunity
        client_res = await client.post("/api/opportunities", json={
            "title": "Fintech Multi-Tenant Dashboard",
            "raw_content": "Build a multi-tenant dashboard with PostgreSQL, FastAPI, and React.",
            "client_name": "Apex Fintech",
            "budget_range": "$8,000 - $12,000"
        })
        assert client_res.status_code in [200, 201]
        opp_id = client_res.json()["id"]

        # 2. Create proposal with WBS milestones
        milestones = [
            {
                "id": "m1",
                "phase": "Phase 1",
                "title": "Architecture & Schema Setup",
                "description": "PostgreSQL schema and multi-tenant tenant isolation",
                "deliverables": ["Tenant isolation middleware", "Database migrations"],
                "est_hours": 24.0,
                "rate": 100.0,
                "contingency_percent": 15.0,
                "subtotal": 2400.0,
                "contingency_cost": 360.0,
                "total_cost": 2760.0,
                "duration_weeks": 1.5
            },
            {
                "id": "m2",
                "phase": "Phase 2",
                "title": "API & Dashboard UI",
                "description": "FastAPI REST endpoints and React analytics views",
                "deliverables": ["REST CRUD APIs", "React Analytics Charts"],
                "est_hours": 36.0,
                "rate": 100.0,
                "contingency_percent": 15.0,
                "subtotal": 3600.0,
                "contingency_cost": 540.0,
                "total_cost": 4140.0,
                "duration_weeks": 2.0
            }
        ]

        prop_res = await client.post("/api/proposals", json={
            "opportunity_id": opp_id,
            "title": "Fintech Multi-Tenant Dashboard Proposal",
            "content_markdown": "# Scope of Work\n\nFull implementation plan for Apex Fintech.",
            "price_estimate": 6900.0,
            "milestones": milestones
        })
        assert prop_res.status_code == 200
        prop_id = prop_res.json()["id"]

        # 3. Accept proposal and promote to Project Workspace
        promote_res = await client.post(f"/api/proposals/{prop_id}/accept-and-create-project")
        assert promote_res.status_code == 200
        promote_data = promote_res.json()
        assert promote_data["status"] == "created"
        project_id = promote_data["project_id"]
        assert project_id is not None

        # 4. Verify Project Details
        proj_res = await client.get(f"/api/projects/{project_id}")
        assert proj_res.status_code == 200
        project = proj_res.json()
        assert project["title"] == "Fintech Multi-Tenant Dashboard Proposal"
        assert project["status"] == "active"
        assert project["proposal_id"] == prop_id
        assert project["total_budget"] == 6900.0
        # Check task decomposition: 2 milestones with 2 deliverables each = 4 tasks
        assert project["tasks_count"] == 4
        assert project["tasks_completed_count"] == 0
        assert project["progress_percent"] == 0.0

        # Check proposal status was transitioned to accepted
        prop_check = await client.get(f"/api/proposals/{prop_id}")
        assert prop_check.status_code == 200
        assert prop_check.json()["status"] == "accepted"

@pytest.mark.asyncio
async def test_project_task_lifecycle_and_hour_tracking():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create a direct project
        proj_create_res = await client.post("/api/projects", json={
            "title": "Custom SaaS Billing Portal",
            "description": "Stripe webhook integration and billing admin panel.",
            "total_budget": 5000.0,
            "hourly_rate": 100.0,
            "estimated_hours": 50.0
        })
        assert proj_create_res.status_code == 201
        proj_id = proj_create_res.json()["id"]

        # Add two tasks
        t1_res = await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "Stripe Webhook Handler",
            "description": "Handle invoice.paid and customer.subscription.deleted events",
            "estimated_hours": 10.0,
            "priority": "high"
        })
        assert t1_res.status_code == 201
        t1 = t1_res.json()

        t2_res = await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "Customer Portal UI",
            "description": "Frontend plan management view",
            "estimated_hours": 15.0,
            "priority": "medium"
        })
        assert t2_res.status_code == 201
        t2 = t2_res.json()

        # Update task 1 to in_progress with partial hours
        up1_res = await client.put(f"/api/projects/{proj_id}/tasks/{t1['id']}", json={
            "status": "in_progress",
            "actual_hours": 4.5
        })
        assert up1_res.status_code == 200
        assert up1_res.json()["status"] == "in_progress"
        assert up1_res.json()["actual_hours"] == 4.5

        # Update task 1 to done with 9.0 actual hours
        up2_res = await client.put(f"/api/projects/{proj_id}/tasks/{t1['id']}", json={
            "status": "done",
            "actual_hours": 9.0
        })
        assert up2_res.status_code == 200
        assert up2_res.json()["status"] == "done"

        # Check project progress and actual hours aggregation
        p_check = await client.get(f"/api/projects/{proj_id}")
        assert p_check.status_code == 200
        p_data = p_check.json()
        assert p_data["tasks_count"] == 2
        assert p_data["tasks_completed_count"] == 1
        assert p_data["progress_percent"] == 50.0
        assert p_data["actual_hours"] == 9.0

        # Delete task 2
        del_res = await client.delete(f"/api/projects/{proj_id}/tasks/{t2['id']}")
        assert del_res.status_code == 200

        # Check updated task count
        p_final = await client.get(f"/api/projects/{proj_id}")
        assert p_final.json()["tasks_count"] == 1
        assert p_final.json()["progress_percent"] == 100.0

@pytest.mark.asyncio
async def test_scope_guard_in_scope_vs_scope_creep():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create project with baseline WBS
        baseline_milestones = [
            {
                "milestone_name": "API & Database",
                "description": "FastAPI REST endpoints and PostgreSQL schema",
                "deliverables": ["REST CRUD APIs", "PostgreSQL database migrations"]
            },
            {
                "milestone_name": "Web Dashboard",
                "description": "Responsive React frontend web portal",
                "deliverables": ["React Analytics Views", "User Settings Page"]
            }
        ]

        proj_res = await client.post("/api/projects", json={
            "title": "Inventory Management SaaS",
            "hourly_rate": 100.0,
            "total_budget": 8000.0
        })
        proj_id = proj_res.json()["id"]

        # Directly update milestones_baseline_json on the project via a task
        await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "REST CRUD APIs",
            "description": "FastAPI endpoints"
        })
        await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "React Analytics Views",
            "description": "Responsive Web Dashboard"
        })

        # 1. Test In-Scope Request
        in_scope_res = await client.post(f"/api/projects/{proj_id}/scope-check", json={
            "new_request_text": "Can you ensure the REST CRUD APIs include filtering by product category on the inventory endpoint?",
            "client_name": "Acme Inventory"
        })
        assert in_scope_res.status_code == 200
        in_scope_data = in_scope_res.json()
        assert in_scope_data["is_scope_creep"] is False
        assert in_scope_data["scope_status"] == "in_scope"
        assert in_scope_data["suggested_change_order_cost"] == 0.0

        # 2. Test Explicit Scope Creep Request
        creep_res = await client.post(f"/api/projects/{proj_id}/scope-check", json={
            "new_request_text": "We also want you to build a native iOS and Android mobile app with barcode scanning, push notifications, and crypto payment support.",
            "client_name": "Acme Inventory"
        })
        assert creep_res.status_code == 200
        creep_data = creep_res.json()
        assert creep_data["is_scope_creep"] is True
        assert creep_data["scope_status"] in ["probable_scope_creep", "definitive_scope_creep"]
        assert len(creep_data["out_of_scope_items"]) > 0
        assert creep_data["estimated_impact_hours"] > 0
        assert creep_data["suggested_change_order_cost"] > 0
        assert "Option A (Formal Change Order)" in creep_data["suggested_client_response"]
        assert "Option B (Phase 2 Backlog)" in creep_data["suggested_client_response"]

        # 3. Convert scope creep items into project tasks
        convert_res = await client.post(f"/api/projects/{proj_id}/convert-scope-to-tasks", json=creep_data)
        assert convert_res.status_code == 200
        new_tasks = convert_res.json()
        assert len(new_tasks) > 0
        assert new_tasks[0]["is_scope_change"] is True
        assert "[Scope Change]" in new_tasks[0]["title"]
