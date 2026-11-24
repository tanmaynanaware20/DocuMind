import os
import pytest
from backend.app.services.report_generator import PDFReportGenerator

def test_generate_pdf_report(tmp_path):
    output_pdf = os.path.join(tmp_path, "test_report.pdf")
    title = "Test Intelligence Audit"
    related_docs = [
        {"title": "Master Services Agreement", "fileType": "pdf", "pageCount": 12, "status": "indexed"},
        {"title": "Security Framework", "fileType": "pdf", "pageCount": 8, "status": "indexed"}
    ]
    summary = "Executive summary of contract compliance and SLA guarantees."
    findings = [
        "Liability cap increased from $1M to $5M in revised agreement.",
        "Uptime SLA committed at 99.99% with tiered remedies."
    ]

    path = PDFReportGenerator.generate_executive_report(
        output_path=output_pdf,
        title=title,
        related_documents=related_docs,
        summary=summary,
        findings=findings
    )

    assert os.path.exists(path)
    assert os.path.getsize(path) > 1000
