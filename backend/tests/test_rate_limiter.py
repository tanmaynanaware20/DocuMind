import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from backend.app.middleware.rate_limiter import RateLimiterMiddleware

def test_rate_limiter_allows_under_limit():
    test_app = FastAPI()
    test_app.add_middleware(RateLimiterMiddleware, default_limit=5, window_seconds=10)

    @test_app.get("/test")
    def sample():
        return {"ok": True}

    client = TestClient(test_app)
    for _ in range(4):
        res = client.get("/test")
        assert res.status_code == 200
        assert "X-RateLimit-Limit" in res.headers
        assert "X-RateLimit-Remaining" in res.headers

def test_rate_limiter_blocks_over_limit():
    test_app = FastAPI()
    test_app.add_middleware(RateLimiterMiddleware, default_limit=2, window_seconds=10)

    @test_app.get("/test-limit")
    def sample():
        return {"ok": True}

    client = TestClient(test_app)
    assert client.get("/test-limit").status_code == 200
    assert client.get("/test-limit").status_code == 200
    res3 = client.get("/test-limit")
    assert res3.status_code == 429
    assert "Retry-After" in res3.headers
    assert "Retry-After" in res3.headers
