import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.schemas.schemas import ExtractedRequirements
from backend.app.agent.intelligence import OpportunityIntelligenceEngine

@pytest.mark.asyncio
async def test_requirements_extraction_deterministic():
    """Verify requirements extraction identifies real facts and flags explicit unknowns."""
    brief_title = "FastAPI Backend with React Dashboard"
    brief_content = """
    We need an experienced developer to build a modern management platform.
    Key requirements:
    - FastAPI REST API backend with PostgreSQL database
    - React and TypeScript frontend dashboard
    - Stripe payment subscription integration
    - Deliver clean GitHub repository with automated test suite
    - Fixed budget $8,000 for Milestone 1 and Milestone 2
    """

    reqs = OpportunityIntelligenceEngine.extract_requirements(
        title=brief_title,
        content=brief_content
    )

    assert isinstance(reqs, ExtractedRequirements)
    assert len(reqs.client_objectives) > 0
    assert len(reqs.deliverables) > 0

    # Tech stack detection
    detected = reqs.detected_tech_stack
    assert "FastAPI" in detected
    assert "PostgreSQL" in detected
    assert "React" in detected
    assert "TypeScript" in detected
    assert "Stripe" in detected

    # Verify explicit unknowns (no hosting or auth specified in brief)
    unknowns_text = " ".join(reqs.unknowns).lower()
    assert "hosting" in unknowns_text or "infrastructure" in unknowns_text
    assert "authentication" in unknowns_text or "auth" in unknowns_text

    # Verify delivery risks
    assert len(reqs.delivery_risks) > 0

@pytest.mark.asyncio
async def test_explainable_scoring_high_alignment():
    """Verify high fit score and 'Pursue' recommendation for matching skills and budget."""
    reqs = OpportunityIntelligenceEngine.extract_requirements(
        title="Python & FastAPI Cloud Microservice",
        content="Looking for a Python and FastAPI engineer to develop a REST API and Dockerize it. AWS cloud deployment with JWT auth."
    )

    score = OpportunityIntelligenceEngine.calculate_opportunity_score(
        requirements=reqs,
        raw_budget="$120/hr",
        raw_deadline="1 month",
        profile_skills="Python, FastAPI, Docker, PostgreSQL, REST, AWS",
        profile_rate=120.0,
        portfolio_case_studies=[{"title": "FastAPI Service", "tech_stack": ["Python", "FastAPI", "Docker"]}]
    )

    assert score.composite_score >= 70.0
    assert score.recommendation in ["Pursue", "Request Clarification"]
    assert len(score.factors) == 5

    # Check skill compatibility factor
    skill_factor = next(f for f in score.factors if f.name == "Skill Compatibility")
    assert skill_factor.raw_score >= 80.0
    assert skill_factor.status == "positive"

    # Check budget feasibility factor
    budget_factor = next(f for f in score.factors if f.name == "Budget Feasibility")
    assert budget_factor.raw_score >= 90.0
    assert budget_factor.status == "positive"

@pytest.mark.asyncio
async def test_explainable_scoring_budget_gap():
    """Verify low budget score triggers 'Renegotiate' recommendation."""
    reqs = OpportunityIntelligenceEngine.extract_requirements(
        title="Senior Python Architect Needed",
        content="Architect our Python and FastAPI platform."
    )

    score = OpportunityIntelligenceEngine.calculate_opportunity_score(
        requirements=reqs,
        raw_budget="$25/hr",
        raw_deadline="2 weeks",
        profile_skills="Python, FastAPI",
        profile_rate=120.0,
        portfolio_case_studies=[]
    )

    budget_factor = next(f for f in score.factors if f.name == "Budget Feasibility")
    assert budget_factor.status in ["critical", "warning"]
    assert score.recommendation in ["Renegotiate", "Skip", "Request Clarification"]

@pytest.mark.asyncio
async def test_discovery_questions_and_email_draft():
    """Verify discovery questions and client email draft generation."""
    reqs = OpportunityIntelligenceEngine.extract_requirements(
        title="E-commerce Analytics System",
        content="Build a dashboard for order metrics. Need it fast."
    )

    score = OpportunityIntelligenceEngine.calculate_opportunity_score(
        requirements=reqs,
        raw_budget=None,
        raw_deadline=None,
        profile_skills="React, Node.js",
        profile_rate=90.0
    )

    discovery = OpportunityIntelligenceEngine.generate_discovery_questions(
        requirements=reqs,
        scoring=score,
        title="E-commerce Analytics System",
        company="Acme Retail",
        freelancer_name="Jane Developer"
    )

    assert len(discovery.questions) >= 3
    assert "Acme Retail" in discovery.client_email_draft
    assert "Jane Developer" in discovery.client_email_draft
    assert "Subject:" in discovery.client_email_draft
    assert "### Discovery Questionnaire:" in discovery.questionnaire_markdown

@pytest.mark.asyncio
async def test_api_opportunity_intelligence():
    """Verify GET /api/opportunities/{id}/intelligence returns populated intelligence."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create opportunity
        create_resp = await client.post("/api/opportunities", json={
            "title": "Django & React Medical Portal",
            "raw_content": "HIPAA compliant portal using Django, React, and PostgreSQL database. AWS cloud deployment.",
            "company": "HealthFirst",
            "budget_range": "$10,000",
            "deadline": "2 months",
            "tech_stack": "Django, React, PostgreSQL"
        })
        assert create_resp.status_code == 200
        opp_data = create_resp.json()
        opp_id = opp_data["id"]

        # Verify instant score and recommendation on response
        assert opp_data["fit_score"] is not None
        assert opp_data["recommendation"] is not None

        # Fetch intelligence
        intel_resp = await client.get(f"/api/opportunities/{opp_id}/intelligence")
        assert intel_resp.status_code == 200
        intel = intel_resp.json()

        assert intel["opportunity_id"] == opp_id
        assert len(intel["requirements"]["detected_tech_stack"]) >= 2
        assert intel["scoring"]["composite_score"] > 0
        assert len(intel["scoring"]["factors"]) == 5
        assert len(intel["discovery"]["questions"]) > 0

@pytest.mark.asyncio
async def test_api_opportunity_rescore():
    """Verify POST /api/opportunities/{id}/score recalculates fit score with updated profile."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create opportunity
        create_resp = await client.post("/api/opportunities", json={
            "title": "Vue.js Frontend App",
            "raw_content": "Build a responsive Vue dashboard with TailwindCSS.",
            "budget_range": "$50/hr"
        })
        opp_id = create_resp.json()["id"]

        # Update profile to have Vue skills
        await client.put("/api/profile", json={
            "skills": "Vue, TailwindCSS, TypeScript",
            "hourly_rate": 50.0
        })

        # Rescore
        rescore_resp = await client.post(f"/api/opportunities/{opp_id}/score")
        assert rescore_resp.status_code == 200
        rescored = rescore_resp.json()

        skill_factor = next(f for f in rescored["scoring"]["factors"] if f["name"] == "Skill Compatibility")
        assert skill_factor["status"] == "positive"
        assert skill_factor["raw_score"] >= 80.0
