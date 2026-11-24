import pytest
from backend.app.services.audit_verifier import AuditChainVerifier

def test_audit_chain_verification():
    records = [
        {"id": "log_1", "timestamp": "2026-11-24T09:00:00Z", "action": "User Login", "target_type": "auth", "status": "success"},
        {"id": "log_2", "timestamp": "2026-11-24T09:05:00Z", "action": "Document Upload", "target_type": "document", "status": "success"},
        {"id": "log_3", "timestamp": "2026-11-24T09:10:00Z", "action": "RAG Query Executed", "target_type": "document", "status": "info"}
    ]

    is_valid, count, latest_hash = AuditChainVerifier.verify_chain(records)
    assert is_valid is True
    assert count == 3
    assert len(latest_hash) == 64  # SHA-256 length

def test_audit_chain_tamper_detection():
    records = [
        {"id": "log_1", "timestamp": "2026-11-24T09:00:00Z", "action": "User Login", "target_type": "auth", "status": "success"},
        {"id": "log_2", "timestamp": "2026-11-24T09:05:00Z", "action": "Document Upload", "target_type": "document", "status": "success"}
    ]
    _, _, original_hash = AuditChainVerifier.verify_chain(records)

    # Tamper with record 1
    tampered_records = [
        {"id": "log_1", "timestamp": "2026-11-24T09:00:00Z", "action": "Malicious Tamper", "target_type": "auth", "status": "success"},
        {"id": "log_2", "timestamp": "2026-11-24T09:05:00Z", "action": "Document Upload", "target_type": "document", "status": "success"}
    ]
    _, _, tampered_hash = AuditChainVerifier.verify_chain(tampered_records)
    assert original_hash != tampered_hash
