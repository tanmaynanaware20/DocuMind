import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_metrics_prometheus_exposition():
    res = client.get("/api/metrics")
    assert res.status_code == 200
    assert "text/plain" in res.headers["content-type"]
    content = res.text
    assert "# HELP documind_documents_total" in content
    assert "# TYPE documind_documents_total gauge" in content
    assert "documind_documents_total" in content
    assert "documind_pages_total" in content
    assert "documind_uptime_seconds" in content
