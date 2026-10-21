import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.tools.portfolio_store import PortfolioVectorStore

@pytest.mark.asyncio
async def test_portfolio_initial_seed():
    """Verify PortfolioVectorStore initializes with structured verified case studies."""
    store = PortfolioVectorStore()
    items = store.list_all_case_studies()
    assert len(items) >= 2
    for item in items:
        assert item.get("title")
        assert len(item.get("tech_stack", [])) > 0
        assert item.get("summary") or item.get("content")

@pytest.mark.asyncio
async def test_rag_lexical_retrieval():
    """Verify hybrid lexical RAG retrieval accurately ranks and cites matching case studies."""
    store = PortfolioVectorStore()
    results = store.search_relevant_experience("FastAPI Redis high throughput telemetry anomaly detection", limit=2)
    assert len(results) > 0

    top_result = results[0]
    assert "Telemetry" in top_result["title"] or "IoT" in top_result["title"]
    assert top_result["relevance_score"] > 0.3
    assert len(top_result["matched_terms"]) >= 2
    assert "fastapi" in [t.lower() for t in top_result["matched_terms"]]
    assert "[Case Study:" in top_result["citation_preview"]

@pytest.mark.asyncio
async def test_portfolio_crud_endpoints():
    """Verify full CRUD operations for portfolio case studies."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. CREATE
        new_cs = {
            "title": "Autonomous Billing & Stripe Invoicing Gateway",
            "client_industry": "SaaS & Subscriptions",
            "role": "Principal Backend Architect",
            "tech_stack": ["Python", "FastAPI", "Stripe", "PostgreSQL", "Docker"],
            "summary": "Engineered idempotent payment reconciliation webhook handling for 250,000 monthly active subscribers.",
            "outcomes": [
                "Achieved zero duplicate charge incidents over 12 months",
                "Automated failed dunning payment recovery recovering $180k ARR"
            ],
            "metrics": {
                "dunning_recovery": "$180k ARR",
                "webhook_latency": "<25ms"
            },
            "testimonial_quote": "Bulletproof billing infrastructure that never failed us.",
            "link_url": "https://example.com/billing-gateway"
        }
        res_create = await client.post("/api/profile/portfolio", json=new_cs)
        assert res_create.status_code == 200
        data = res_create.json()
        cs_id = data["id"]
        assert data["title"] == new_cs["title"]
        assert data["client_industry"] == new_cs["client_industry"]
        assert len(data["tech_stack"]) == 5
        assert len(data["outcomes"]) == 2

        # 2. READ BY ID
        res_get = await client.get(f"/api/profile/portfolio/{cs_id}")
        assert res_get.status_code == 200
        assert res_get.json()["id"] == cs_id

        # 3. LIST ALL
        res_list = await client.get("/api/profile/portfolio")
        assert res_list.status_code == 200
        list_data = res_list.json()
        assert list_data["count"] >= 3
        assert "SaaS & Subscriptions" in list_data["industries"]
        assert "Stripe" in list_data["technologies"]

        # 4. UPDATE
        update_payload = {
            "title": "Autonomous Enterprise Billing Gateway",
            "metrics": {
                "dunning_recovery": "$220k ARR",
                "webhook_latency": "<18ms"
            }
        }
        res_update = await client.put(f"/api/profile/portfolio/{cs_id}", json=update_payload)
        assert res_update.status_code == 200
        updated = res_update.json()
        assert updated["title"] == "Autonomous Enterprise Billing Gateway"
        assert updated["metrics"]["webhook_latency"] == "<18ms"

        # 5. SEARCH ENDPOINT
        res_search = await client.post("/api/profile/portfolio/search?query=Stripe%20billing%20reconciliation&limit=4")
        assert res_search.status_code == 200
        search_hits = res_search.json()
        assert len(search_hits) > 0
        matching_hit = next((h for h in search_hits if h["case_study"]["id"] == cs_id), None)
        assert matching_hit is not None
        assert matching_hit["relevance_score"] > 0
        assert "Case Study:" in matching_hit["citation_preview"] or "Billing" in matching_hit["citation_preview"]

        # 6. DELETE
        res_del = await client.delete(f"/api/profile/portfolio/{cs_id}")
        assert res_del.status_code == 200

        # Verify deletion
        res_after = await client.get(f"/api/profile/portfolio/{cs_id}")
        assert res_after.status_code == 404
