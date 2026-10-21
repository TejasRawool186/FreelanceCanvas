import pytest
import json
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.agent.estimation import EstimationEngine
from backend.app.schemas.schemas import (
    ExtractedRequirements,
    DeliveryRisk,
    MilestoneItem,
    RiskAssessmentItem,
    EstimationRecalculateRequest,
    ProposalUpdateRequest
)

@pytest.mark.asyncio
async def test_estimation_math_deterministic():
    req = ExtractedRequirements(
        client_objectives=["Build high-performance real-time analytics dashboard with FastAPI and ClickHouse"],
        deliverables=[
            "Data ingestion pipeline with event buffering",
            "Real-time websocket telemetry stream",
            "Analytical query optimization with ClickHouse",
            "Interactive dashboard charts in React/TypeScript"
        ],
        detected_tech_stack=["FastAPI", "ClickHouse", "React", "TypeScript", "WebSocket"],
        delivery_risks=[
            DeliveryRisk(risk="ClickHouse schema optimization under load", severity="high", mitigation="Partitioning and benchmark testing")
        ],
        scope_clarity="Medium",
        unknowns=["Expected queries per second"]
    )

    est = EstimationEngine.generate_estimation(
        opportunity_id="test_opp_1",
        requirements=req,
        hourly_rate=100.0,
        currency="USD",
        availability_hours_per_week=40.0
    )

    assert est.hourly_rate == 100.0
    assert len(est.milestones) == 4
    assert est.total_hours > 0

    # Test exact arithmetic for each milestone
    for m in est.milestones:
        expected_subtotal = round(m.est_hours * 100.0, 2)
        expected_contingency = round(expected_subtotal * (m.contingency_percent / 100.0), 2)
        expected_total = round(expected_subtotal + expected_contingency, 2)

        assert m.subtotal == expected_subtotal
        assert m.contingency_cost == expected_contingency
        assert m.total_cost == expected_total

    # Verify Fixed Price Tier
    fixed = est.pricing_tiers.fixed_price
    sum_milestone_totals = sum(m.total_cost for m in est.milestones)
    assert fixed.total_price == pytest.approx(sum_milestone_totals, rel=1e-2)

    # Verify payment schedule adds up to total fixed price
    sched_sum = sum(p.amount for p in fixed.payment_schedule)
    assert sched_sum == pytest.approx(fixed.total_price, rel=1e-2)

    # Verify Time & Materials Tier
    tm = est.pricing_tiers.time_and_materials
    assert tm.hourly_rate == 100.0
    assert tm.estimated_hours_min < est.total_hours
    assert tm.estimated_hours_max > est.total_hours
    assert tm.not_to_exceed_cap > tm.estimated_cost_max

    # Verify Retainer Tier
    ret = est.pricing_tiers.retainer
    assert ret.weekly_rate > 0
    assert ret.monthly_rate == pytest.approx(ret.weekly_rate * 4.2, rel=1e-2)

@pytest.mark.asyncio
async def test_estimation_minimum_project_floor():
    req = ExtractedRequirements(
        client_objectives=["Minor CSS tweak"],
        deliverables=["Change button color"],
        detected_tech_stack=["CSS"],
        scope_clarity="High",
        unknowns=[]
    )

    # Force low hourly rate and very small milestone
    custom_m = [
        MilestoneItem(
            id="m_tiny",
            phase="Phase 1",
            title="CSS Fix",
            deliverables=["Button styling"],
            est_hours=3.0,
            rate=50.0,
            contingency_percent=10.0,
            subtotal=150.0,
            contingency_cost=15.0,
            total_cost=165.0,
            duration_weeks=0.5
        )
    ]

    recalculated = EstimationEngine.recalculate_estimation(
        current_estimation=EstimationEngine.generate_estimation("opp_floor", req, hourly_rate=50.0),
        new_hourly_rate=50.0,
        custom_milestones=custom_m
    )

    # Subtotal is $150, but fixed price should enforce floor of $1,200
    assert recalculated.pricing_tiers.fixed_price.total_price == EstimationEngine.MIN_PROJECT_FLOOR

@pytest.mark.asyncio
async def test_estimation_recalculate_rate_and_buffer():
    req = ExtractedRequirements(
        client_objectives=["Full-stack SaaS platform"],
        deliverables=["Auth", "Billing", "Dashboard"],
        detected_tech_stack=["Next.js", "Python"],
        scope_clarity="Medium"
    )

    base_est = EstimationEngine.generate_estimation("opp_recalc", req, hourly_rate=80.0)
    initial_fixed_total = base_est.pricing_tiers.fixed_price.total_price

    # Recalculate with rate increased from $80 to $120 (+50%)
    higher_rate_est = EstimationEngine.recalculate_estimation(
        current_estimation=base_est,
        new_hourly_rate=120.0
    )

    assert higher_rate_est.hourly_rate == 120.0
    assert higher_rate_est.pricing_tiers.fixed_price.total_price > initial_fixed_total
    for m in higher_rate_est.milestones:
        assert m.rate == 120.0
        assert m.subtotal == round(m.est_hours * 120.0, 2)

    # Recalculate with higher contingency buffer (from default 15% to 30%)
    high_contingency_est = EstimationEngine.recalculate_estimation(
        current_estimation=base_est,
        new_contingency_percent=30.0
    )
    assert high_contingency_est.contingency_percent == 30.0
    for m in high_contingency_est.milestones:
        assert m.contingency_percent == 30.0
        assert m.contingency_cost == round(m.subtotal * 0.30, 2)

@pytest.mark.asyncio
async def test_api_opportunity_estimation_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create opportunity
        create_resp = await ac.post("/api/opportunities", json={
            "title": "Fintech Multi-Tenant Wallet Service",
            "raw_content": "Build PCI-compliant multi-tenant cryptocurrency and fiat wallet service using FastAPI, PostgreSQL, and Ledger.",
            "tech_stack": "FastAPI, PostgreSQL, Ledger",
            "budget_range": "$8,000 - $15,000",
            "auto_analyze": False
        })
        assert create_resp.status_code == 200
        opp_id = create_resp.json()["id"]

        # GET estimation (generated on-demand)
        get_est_resp = await ac.get(f"/api/opportunities/{opp_id}/estimation")
        assert get_est_resp.status_code == 200
        est_data = get_est_resp.json()
        assert est_data["opportunity_id"] == opp_id
        assert len(est_data["milestones"]) > 0
        assert est_data["pricing_tiers"]["fixed_price"]["total_price"] > 0
        assert len(est_data["risks"]) > 0

        # Preview recalculate (stateless POST)
        preview_resp = await ac.post(f"/api/opportunities/{opp_id}/estimation/recalculate", json={
            "hourly_rate": 150.0,
            "contingency_percent": 20.0
        })
        assert preview_resp.status_code == 200
        preview_data = preview_resp.json()
        assert preview_data["hourly_rate"] == 150.0
        assert preview_data["contingency_percent"] == 20.0

        # Persist updated estimation (PUT)
        put_resp = await ac.put(f"/api/opportunities/{opp_id}/estimation", json={
            "hourly_rate": 125.0,
            "contingency_percent": 18.0,
            "pricing_model": "fixed_price"
        })
        assert put_resp.status_code == 200
        updated_data = put_resp.json()
        assert updated_data["hourly_rate"] == 125.0
        assert updated_data["contingency_percent"] == 18.0

        # Verify persisted GET matches
        verify_resp = await ac.get(f"/api/opportunities/{opp_id}/estimation")
        assert verify_resp.status_code == 200
        assert verify_resp.json()["hourly_rate"] == 125.0

@pytest.mark.asyncio
async def test_proposal_sync_and_put_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create opportunity
        create_resp = await ac.post("/api/opportunities", json={
            "title": "Medical Records Sync API",
            "raw_content": "HIPAA-compliant HL7 and FHIR sync API with audit trails.",
            "auto_analyze": False
        })
        opp_id = create_resp.json()["id"]

        # Trigger analysis/estimation
        est_resp = await ac.get(f"/api/opportunities/{opp_id}/estimation")
        assert est_resp.status_code == 200
        est = est_resp.json()

        # Update estimation with custom milestone
        custom_milestones = est["milestones"]
        custom_milestones[0]["title"] = "Custom Phase: Security Hardening & Audit"
        custom_milestones[0]["est_hours"] = 30.0

        update_est_resp = await ac.put(f"/api/opportunities/{opp_id}/estimation", json={
            "hourly_rate": 110.0,
            "milestones": custom_milestones
        })
        assert update_est_resp.status_code == 200
        assert update_est_resp.json()["milestones"][0]["title"] == "Custom Phase: Security Hardening & Audit"
