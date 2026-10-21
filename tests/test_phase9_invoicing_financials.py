import json
import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_create_and_list_invoice_manual():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create client & project
        client_res = await client.post("/api/projects/clients", json={
            "name": "Acme Fintech Corp",
            "email": "finance@acmefintech.io"
        })
        assert client_res.status_code == 201
        client_id = client_res.json()["id"]

        proj_res = await client.post("/api/projects", json={
            "title": "Fintech Ledger Integration",
            "client_id": client_id,
            "total_budget": 15000.0,
            "hourly_rate": 150.0,
            "pricing_model": "fixed"
        })
        assert proj_res.status_code == 201
        proj_id = proj_res.json()["id"]

        # Create manual invoice
        inv_payload = {
            "title": "Deposit - Architecture & Scoping",
            "client_id": client_id,
            "project_id": proj_id,
            "billing_model": "fixed",
            "tax_rate": 0.10,
            "line_items": [
                {
                    "description": "Initial Sprint & Architecture Blueprint",
                    "quantity": 1.0,
                    "unit_price": 5000.0,
                    "amount": 5000.0
                },
                {
                    "description": "Security Audit Setup",
                    "quantity": 1.0,
                    "unit_price": 1000.0,
                    "amount": 1000.0
                }
            ],
            "notes": "Payment due upon receipt"
        }
        res = await client.post("/api/invoices", json=inv_payload)
        assert res.status_code == 201
        inv = res.json()
        assert inv["id"] is not None
        assert "INV-" in inv["invoice_number"]
        assert inv["subtotal"] == 6000.0
        assert inv["tax_rate"] == 0.10
        assert inv["tax_amount"] == 600.0
        assert inv["total_amount"] == 6600.0
        assert inv["status"] == "draft"
        assert len(inv["line_items"]) == 2

        # List invoices
        list_res = await client.get("/api/invoices")
        assert list_res.status_code == 200
        invoices = list_res.json()
        assert any(i["id"] == inv["id"] for i in invoices)

@pytest.mark.asyncio
async def test_auto_invoice_from_milestone():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create project with milestone baseline JSON
        milestones = [
            {
                "id": "ms-alpha-1",
                "title": "Phase 1: Discovery & Core API",
                "cost": 4500.0,
                "deliverables": ["PostgreSQL Schemas", "Auth0 Integration"]
            },
            {
                "id": "ms-beta-2",
                "title": "Phase 2: Frontend Dashboard",
                "cost": 6500.0,
                "deliverables": ["React Analytics Canvas", "Live WebSocket Feed"]
            }
        ]
        proj_res = await client.post("/api/projects", json={
            "title": "NextGen Dashboard",
            "total_budget": 11000.0,
            "hourly_rate": 125.0,
            "pricing_model": "fixed",
            "milestones_baseline_json": json.dumps(milestones)
        })
        assert proj_res.status_code == 201
        proj_id = proj_res.json()["id"]

        # Generate invoice from milestone 1
        inv_res = await client.post("/api/invoices", json={
            "project_id": proj_id,
            "title": "Milestone 1 Billing",
            "generate_from_milestone_id": "ms-alpha-1"
        })
        assert inv_res.status_code == 201
        inv = inv_res.json()
        assert inv["subtotal"] == 4500.0
        assert inv["total_amount"] == 4500.0
        assert len(inv["line_items"]) == 1
        assert "Discovery & Core API" in inv["line_items"][0]["description"]
        assert "Auth0 Integration" in inv["line_items"][0]["description"]

@pytest.mark.asyncio
async def test_auto_invoice_from_unbilled_hours():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        proj_res = await client.post("/api/projects", json={
            "title": "Mobile App Optimization",
            "total_budget": 8000.0,
            "hourly_rate": 100.0,
            "pricing_model": "time_and_materials"
        })
        assert proj_res.status_code == 201
        proj_id = proj_res.json()["id"]

        # Add tasks: 1 done with hours, 1 in_progress
        await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "Bundle Size Profiling",
            "status": "done",
            "estimated_hours": 10.0,
            "actual_hours": 8.5
        })
        await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "Image Asset Compression",
            "status": "done",
            "estimated_hours": 5.0,
            "actual_hours": 4.0
        })
        await client.post(f"/api/projects/{proj_id}/tasks", json={
            "title": "Lazy Route Loading",
            "status": "in_progress",
            "estimated_hours": 12.0,
            "actual_hours": 3.0
        })

        # Generate invoice from unbilled hours
        inv_res = await client.post("/api/invoices", json={
            "project_id": proj_id,
            "title": "Sprint 1 Timesheet",
            "generate_from_unbilled_hours": True
        })
        assert inv_res.status_code == 201
        inv = inv_res.json()
        # Only the 2 completed tasks are included
        assert len(inv["line_items"]) == 2
        # 8.5 * 100 = 850, 4.0 * 100 = 400 => subtotal 1250
        assert inv["subtotal"] == 1250.0
        assert inv["total_amount"] == 1250.0

@pytest.mark.asyncio
async def test_invoice_lifecycle_and_financial_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create invoice
        inv_res = await client.post("/api/invoices", json={
            "title": "Consulting Retainer - Nov",
            "billing_model": "retainer",
            "line_items": [
                {
                    "description": "Monthly Advisory Retainer (20h allocation)",
                    "quantity": 1.0,
                    "unit_price": 3000.0,
                    "amount": 3000.0
                }
            ]
        })
        assert inv_res.status_code == 201
        inv_id = inv_res.json()["id"]

        # Transition to issued
        update_res1 = await client.put(f"/api/invoices/{inv_id}", json={
            "status": "issued"
        })
        assert update_res1.status_code == 200
        assert update_res1.json()["status"] == "issued"
        assert update_res1.json()["paid_at"] is None

        # Check financial health: outstanding receivables should reflect 3000
        health_res1 = await client.get("/api/invoices/financial-health")
        assert health_res1.status_code == 200
        h1 = health_res1.json()
        assert h1["outstanding_receivables"] >= 3000.0

        # Mark paid
        update_res2 = await client.put(f"/api/invoices/{inv_id}", json={
            "status": "paid"
        })
        assert update_res2.status_code == 200
        assert update_res2.json()["status"] == "paid"
        assert update_res2.json()["paid_at"] is not None

        # Check financial health: collected should reflect paid invoice
        health_res2 = await client.get("/api/invoices/financial-health")
        assert health_res2.status_code == 200
        h2 = health_res2.json()
        assert h2["total_collected"] >= 3000.0

        # Test HTML export
        export_res = await client.get(f"/api/invoices/{inv_id}/export-html")
        assert export_res.status_code == 200
        assert "text/html" in export_res.headers["content-type"]
        assert "Monthly Advisory Retainer" in export_res.text
        assert "PAID" in export_res.text or "Paid" in export_res.text
