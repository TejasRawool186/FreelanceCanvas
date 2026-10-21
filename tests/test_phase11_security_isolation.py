import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.config import settings
from backend.app.middleware.security import reset_rate_limiter

# Register a dedicated route to test server error sanitization safely
@app.get("/api/test-server-crash")
async def simulate_crash():
    raise RuntimeError("Critical internal database cluster partition / secret key leakage simulated")

@pytest.mark.asyncio
async def test_security_headers_enforcement():
    """Verify that all responses include strict modern security headers."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/health")
        assert res.status_code == 200
        headers = res.headers

        assert headers.get("X-Content-Type-Options") == "nosniff"
        assert headers.get("X-Frame-Options") == "DENY"
        assert headers.get("X-XSS-Protection") == "1; mode=block"
        assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
        assert "camera=()" in headers.get("Permissions-Policy", "")
        assert "microphone=()" in headers.get("Permissions-Policy", "")

@pytest.mark.asyncio
async def test_workspace_isolation_context():
    """Verify that X-Workspace-ID header is captured and reflected in response context."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Default workspace
        res_default = await ac.get("/api/health")
        assert res_default.headers.get("X-Workspace-Context") == "default_workspace"

        # Explicit custom workspace
        custom_ws = "tenant_enterprise_77"
        res_custom = await ac.get("/api/health", headers={"X-Workspace-ID": custom_ws})
        assert res_custom.headers.get("X-Workspace-Context") == custom_ws

@pytest.mark.asyncio
async def test_cors_preflight_and_allowed_origin():
    """Verify CORS preflight and access-control headers for allowed frontend origins."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get(
            "/api/health",
            headers={"Origin": "http://localhost:5173"}
        )
        assert res.status_code == 200
        assert res.headers.get("access-control-allow-origin") == "http://localhost:5173"

@pytest.mark.asyncio
async def test_sanitized_500_error_envelope():
    """Ensure unhandled internal exceptions are trapped and sanitized without leaking traces or secrets."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/test-server-crash")
        assert res.status_code == 500
        data = res.json()

        assert data["error"] == "InternalServerError"
        assert "unexpected error occurred" in data["message"].lower()
        assert "trace_id" in data
        assert len(data["trace_id"]) > 10

        # CRITICAL SECURITY ASSERTION: Internal exception details and stack frames must NOT be leaked
        assert "Critical internal database cluster" not in res.text
        assert "secret key leakage" not in res.text
        assert "Traceback" not in res.text

@pytest.mark.asyncio
async def test_ai_endpoint_rate_limiting():
    """Verify that rate limiter throttles burst requests on expensive AI endpoints."""
    reset_rate_limiter()
    transport = ASGITransport(app=app)
    
    # Save original settings
    orig_enabled = settings.RATE_LIMIT_ENABLED
    orig_ai_limit = settings.RATE_LIMIT_AI_BURST
    settings.RATE_LIMIT_ENABLED = True
    settings.RATE_LIMIT_AI_BURST = 5  # Set small limit for testing

    try:
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Send 5 allowed requests to an AI endpoint path
            for _ in range(5):
                res = await ac.post("/api/projects/sample-id/scope-guard", json={"task_description": "test"})
                # Status can be 404/422/200 depending on fixture, but must NOT be 429 yet
                assert res.status_code != 429

            # 6th request must exceed the burst limit and return 429
            rate_limited_res = await ac.post("/api/projects/sample-id/scope-guard", json={"task_description": "test"})
            assert rate_limited_res.status_code == 429
            data = rate_limited_res.json()
            assert data["error"] == "RateLimitExceeded"
            assert "Retry-After" in rate_limited_res.headers
            assert int(rate_limited_res.headers["Retry-After"]) >= 1

    finally:
        # Restore configuration and reset state
        settings.RATE_LIMIT_ENABLED = orig_enabled
        settings.RATE_LIMIT_AI_BURST = orig_ai_limit
        reset_rate_limiter()
