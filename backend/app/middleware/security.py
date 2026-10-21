import time
import uuid
import logging
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from ..config import settings

logger = logging.getLogger("freelance_desk.security")

# Rate limiting in-memory storage: client_ip -> list of timestamps
_request_records: Dict[str, List[float]] = defaultdict(list)
_ai_request_records: Dict[str, List[float]] = defaultdict(list)

def reset_rate_limiter():
    """Clear in-memory rate limiting counters (primarily for tests)."""
    _request_records.clear()
    _ai_request_records.clear()

def is_ai_heavy_endpoint(path: str) -> bool:
    return any(p in path for p in [
        "/intelligence",
        "/synthesize-audio",
        "/reports/generate",
        "/scope-guard"
    ])

class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Workspace Isolation Context
        workspace_id = request.headers.get("X-Workspace-ID", "default_workspace").strip()
        request.state.workspace_id = workspace_id or "default_workspace"

        # 2. Rate Limiting Check
        if settings.RATE_LIMIT_ENABLED:
            client_ip = request.client.host if request.client else "127.0.0.1"
            forwarded = request.headers.get("X-Forwarded-For")
            if forwarded:
                client_ip = forwarded.split(",")[0].strip()

            now = time.time()
            window = settings.RATE_LIMIT_WINDOW_SECONDS

            is_ai = is_ai_heavy_endpoint(request.url.path)
            records = _ai_request_records if is_ai else _request_records
            limit = settings.RATE_LIMIT_AI_BURST if is_ai else settings.RATE_LIMIT_DEFAULT_BURST

            # Purge timestamps outside current window
            client_history = [t for t in records[client_ip] if now - t < window]
            records[client_ip] = client_history

            if len(client_history) >= limit:
                oldest = client_history[0]
                retry_after = max(1, int(window - (now - oldest)))
                logger.warning(
                    f"Rate limit exceeded for IP {client_ip} on {request.url.path} (Limit: {limit}/{window}s)"
                )
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "RateLimitExceeded",
                        "message": f"Too many requests to {'AI processing' if is_ai else 'API'}. Please wait before retrying.",
                        "retry_after": retry_after,
                        "status_code": 429
                    },
                    headers={
                        "Retry-After": str(retry_after),
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0"
                    }
                )

            # Record this valid request
            records[client_ip].append(now)

        # 3. Request processing & Sanitized Error Trapping
        try:
            response = await call_next(request)
        except Exception as exc:
            trace_id = str(uuid.uuid4())
            logger.exception(f"Unhandled server error [Trace ID: {trace_id}]: {exc}")
            
            # In DEBUG mode, we still provide trace_id and sanitized JSON envelope
            # so clients never receive raw unstructured HTML crashes.
            return JSONResponse(
                status_code=500,
                content={
                    "error": "InternalServerError",
                    "message": "An unexpected error occurred while processing your request.",
                    "trace_id": trace_id,
                    "status_code": 500
                }
            )

        # 4. Enforce Hardened Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
        response.headers["X-Workspace-Context"] = request.state.workspace_id

        return response
