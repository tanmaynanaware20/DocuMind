import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from backend.app.exceptions import (
    DocuMindException,
    DocumentNotFoundException,
    DocumentParsingException,
    UnauthorizedAccessException,
    rfc7807_exception_handler
)

def test_rfc7807_exception_serialization():
    app = FastAPI()
    app.add_exception_handler(DocuMindException, rfc7807_exception_handler)

    @app.get("/trigger-404")
    def trigger_404():
        raise DocumentNotFoundException("doc_xyz_999")

    @app.get("/trigger-parsing")
    def trigger_parsing():
        raise DocumentParsingException("corrupted.pdf", "Encrypted with unsupported cipher")

    client = TestClient(app)

    # Test 404 Problem Details
    res1 = client.get("/trigger-404")
    assert res1.status_code == 404
    assert res1.headers["content-type"] == "application/problem+json"
    data1 = res1.json()
    assert data1["type"] == "urn:documind:error:document-not-found"
    assert data1["title"] == "Document Not Found"
    assert "doc_xyz_999" in data1["detail"]
    assert data1["instance"] == "/trigger-404"

    # Test 422 Problem Details
    res2 = client.get("/trigger-parsing")
    assert res2.status_code == 422
    data2 = res2.json()
    assert data2["title"] == "Document Parsing Failed"
    assert "corrupted.pdf" in data2["detail"]
