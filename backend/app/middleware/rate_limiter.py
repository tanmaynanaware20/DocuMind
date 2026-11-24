import time
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Sliding window in-memory rate limiter middleware for FastAPI.
    Tracks client IP request timestamps and enforces rate limits.
    """
    def __init__(self, app, default_limit: int = 120, window_seconds: int = 60):
        super().__init__(app)
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        # client_ip -> list of timestamps
        self.clients: Dict[str, list] = {}

    async def dispatch(self, request: Request, call_next):
        # Exempt health and metrics endpoints from rate limits
        path = request.url.path
        if path in ("/api/health", "/api/metrics", "/docs", "/openapi.json"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old timestamps
        history = self.clients.get(client_ip, [])
        valid_history = [ts for ts in history if ts > window_start]

        # Enforce rate limit
        limit = 30 if "/chat/query" in path else self.default_limit
        if len(valid_history) >= limit:
            retry_after = int(self.window_seconds - (now - valid_history[0]))
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "detail": f"Allowed maximum {limit} requests per {self.window_seconds}s.",
                    "retry_after_seconds": max(1, retry_after)
                },
                headers={"Retry-After": str(max(1, retry_after))}
            )

        valid_history.append(now)
        self.clients[client_ip] = valid_history

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - len(valid_history)))
        return response
