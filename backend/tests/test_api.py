import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["service"] == "DocuMind FastAPI Python Engine"
    assert data["documentsCount"] >= 5

def test_auth_me():
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    data = res.json()
    assert "user" in data
    assert data["user"]["email"] == "alex.morgan@documind.io"

def test_documents_list():
    res = client.get("/api/documents")
    assert res.status_code == 200
    data = res.json()
    assert "documents" in data
    assert len(data["documents"]) >= 5
    first_doc = data["documents"][0]
    assert "title" in first_doc
    assert "status" in first_doc

def test_collections_list():
    res = client.get("/api/collections")
    assert res.status_code == 200
    data = res.json()
    assert "collections" in data
    assert len(data["collections"]) >= 4

def test_chat_conversations_and_query():
    # 1. List conversations
    res = client.get("/api/chat/conversations")
    assert res.status_code == 200
    data = res.json()
    assert "conversations" in data
    assert len(data["conversations"]) >= 1

    conv_id = data["conversations"][0]["id"]

    # 2. Query chat with grounding
    q_res = client.post("/api/chat/query", json={
        "query": "What is the limitation of liability?",
        "conversationId": conv_id
    })
    assert q_res.status_code == 200
    q_data = q_res.json()
    assert "assistantMessage" in q_data
    assert "citations" in q_data["assistantMessage"]

def test_search_api():
    res = client.get("/api/search?q=liability&search_type=hybrid")
    assert res.status_code == 200
    data = res.json()
    assert "results" in data
    assert len(data["results"]) > 0
    first = data["results"][0]
    assert "snippet" in first
    assert "matchScore" in first
    assert "page" in first

def test_compare_api():
    res = client.post("/api/compare", json={
        "docAId": "doc_msa_v1",
        "docBId": "doc_msa_v2"
    })
    assert res.status_code == 200
    data = res.json()
    assert "comparison" in data
    comp = data["comparison"]
    assert "similarityScore" in comp
    assert "diffs" in comp
    assert len(comp["diffs"]) > 0

def test_structured_extraction_api():
    res = client.post("/api/documents/doc_msa_v1/extract-structured")
    assert res.status_code == 200
    data = res.json()
    assert "extraction" in data
    ext = data["extraction"]
    assert "document_id" in ext
    assert "critical_clauses" in ext

def test_reports_pdf_download():
    res = client.get("/api/reports/pdf")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000

def test_activity_export():
    res_csv = client.get("/api/reports/export?format=csv")
    assert res_csv.status_code == 200
    assert "ID,Timestamp" in res_csv.text

    res_json = client.get("/api/reports/export?format=json")
    assert res_json.status_code == 200
    assert isinstance(res_json.json(), list)
