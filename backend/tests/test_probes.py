from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_liveness_probe():
    response = client.get("/api/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert "timestamp" in data

def test_readiness_probe():
    response = client.get("/api/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["checks"]["database"] == "connected"
    assert data["checks"]["storage"] == "healthy"
