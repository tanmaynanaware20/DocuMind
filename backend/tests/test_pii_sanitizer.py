import pytest
from backend.app.services.pii_sanitizer import PIISanitizer

def test_pii_scanner_detects_multiple_types():
    text = (
        "User Alice at alice.smith@enterprise.com with SSN 123-45-6789 and phone (555) 019-2834 "
        "connected from 192.168.1.100 using API key sk-live9876543210abcdef12345."
    )
    findings = PIISanitizer.scan(text)
    types_found = {f["type"] for f in findings}

    assert "EMAIL" in types_found
    assert "SSN" in types_found
    assert "PHONE" in types_found
    assert "IPV4" in types_found
    assert "API_KEY" in types_found

def test_pii_redaction_mask_mode():
    text = "Contact support@documind.ai or call 555-123-4567 for help."
    redacted, counts = PIISanitizer.redact(text, mode="mask")

    assert "[REDACTED:EMAIL]" in redacted
    assert "[REDACTED:PHONE]" in redacted
    assert "support@documind.ai" not in redacted
    assert "555-123-4567" not in redacted
    assert counts.get("EMAIL") == 1
    assert counts.get("PHONE") == 1

def test_pii_redaction_hash_mode():
    text = "Confidential SSN: 987-65-4321."
    redacted, counts = PIISanitizer.redact(text, mode="hash")

    assert "[HASH:SSN_" in redacted
    assert "987-65-4321" not in redacted
