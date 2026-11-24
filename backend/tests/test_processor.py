import io
import pytest
from backend.app.services.document_processor import DocumentProcessor

def test_extract_text_document():
    raw_content = "DocuMind Enterprise Architecture.\nThis document covers layout parsing and neural chunking.\nSection 2: Security."
    res = DocumentProcessor.extract_text(raw_content.encode("utf-8"))
    assert res.word_count > 10
    assert res.page_count >= 1
    assert "DocuMind Enterprise Architecture" in res.raw_text

def test_chunk_document_preserves_page_numbers():
    pages = [
        {"page_number": 1, "text": "This is page one text discussing limitation of liability and uptime agreements."},
        {"page_number": 2, "text": "This is page two text discussing confidentiality clauses, data retention, and governing jurisdiction."}
    ]
    raw_text = "\n\n".join(p["text"] for p in pages)
    chunks = DocumentProcessor.chunk_document(raw_text, pages, target_tokens=10, overlap=2)

    assert len(chunks) >= 2
    # Verify page numbers are strictly preserved
    page_nums = {c["page_number"] for c in chunks}
    assert 1 in page_nums
    assert 2 in page_nums
    for c in chunks:
        assert "content" in c
        assert "token_count" in c
        assert c["token_count"] > 0

def test_extract_csv_document():
    csv_bytes = b"ID,Name,Role,Department\n1,Alex Morgan,Head of AI,Engineering\n2,Sarah Chen,Lead Counsel,Legal"
    res = DocumentProcessor.extract_excel(csv_bytes, ext="csv")
    assert res.word_count > 5
    assert "Spreadsheet Data" in res.raw_text
    assert "Alex Morgan" in res.raw_text
