import pytest
from backend.app.services.extraction_service import ExtractionService

def test_structured_information_extraction():
    content = """
    AGREEMENT
    Effective Date: October 15, 2026.
    Parties: DocuMind Enterprise Inc. ("Provider") and Global Logistics Corp ("Customer").
    Executive Signatories: Alex Morgan (CEO) and David Vance (CFO).
    Section 4. Monetary Commitments: Total contract value is $2,450,000 USD payable Net 30.
    Limitation of Liability: Capped at $5,000,000 for standard claims.
    Termination Deadline: Formal notice must be provided before December 31, 2026.
    """

    res = ExtractionService.extract_structured_data("doc_test", "Enterprise Services Agreement", content)

    assert res.document_id == "doc_test"
    assert res.document_title == "Enterprise Services Agreement"
    # Signatories
    assert any("Alex Morgan" in name for name in res.person_names)
    # Monetary values
    assert len(res.monetary_values) > 0
    # Important dates or deadlines
    assert len(res.important_dates) > 0 or len(res.deadlines) > 0
    # Critical clauses
    assert len(res.critical_clauses) > 0
    # Confidence and metrics
    assert 0.8 <= res.overall_confidence <= 1.0
    assert res.extracted_fields_count > 0
    assert "signatories" in res.field_confidences

def test_extraction_missing_fields_confidence_penalty():
    sparse_content = "Short note without any dates, dollar values, or signatories."
    res = ExtractionService.extract_structured_data("doc_sparse", "Note", sparse_content)
    assert res.overall_confidence < 0.90
    assert len(res.missing_critical_fields) >= 2
