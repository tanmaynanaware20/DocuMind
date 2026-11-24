import pytest
from backend.app.services.hyde_service import HyDEService

def test_hyde_domain_detection():
    assert HyDEService.detect_domain("What is the clause for breach of contract?") == "legal"
    assert HyDEService.detect_domain("Q3 fiscal revenue and margin reconciliation") == "financial"
    assert HyDEService.detect_domain("GDPR compliance for user PII data") == "compliance"
    assert HyDEService.detect_domain("Redis cache latency and docker deployment") == "technical"
    assert HyDEService.detect_domain("How to submit travel expense receipts?") == "financial"

def test_hyde_query_expansion():
    query = "limitation of liability clause"
    expanded = HyDEService.expand_query(query, domain="legal")

    assert expanded["original_query"] == query
    assert expanded["domain"] == "legal"
    assert "In accordance with standard enterprise agreement provisions" in expanded["hypothetical_document"]
    assert query in expanded["hypothetical_document"]
    assert query in expanded["search_text"]

def test_hyde_empty_query():
    expanded = HyDEService.expand_query("")
    assert expanded["original_query"] == ""
    assert expanded["hypothetical_document"] == ""
