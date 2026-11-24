import pytest
from backend.app.services.tenant_manager import TenantScopeManager, UserRole

def test_tenant_isolation_matching_org():
    user_org = "DocuMind Global Enterprise"
    doc_org = "DocuMind Global Enterprise"
    assert TenantScopeManager.can_access_document(user_org, doc_org) is True

def test_tenant_isolation_cross_org_blocked():
    user_org = "DocuMind Global Enterprise"
    competitor_org = "External Corp"
    assert TenantScopeManager.can_access_document(user_org, competitor_org) is False

def test_rbac_permissions():
    # Admin can do all
    assert TenantScopeManager.has_permission("admin", "delete") is True
    assert TenantScopeManager.has_permission("admin", "manage_keys") is True

    # Analyst can upload/read but cannot delete or manage keys
    assert TenantScopeManager.has_permission("analyst", "upload") is True
    assert TenantScopeManager.has_permission("analyst", "delete") is False

    # Viewer can only read and compare
    assert TenantScopeManager.has_permission("viewer", "read") is True
    assert TenantScopeManager.has_permission("viewer", "upload") is False
    assert TenantScopeManager.has_permission("viewer", "delete") is False

def test_filter_documents_by_tenant():
    docs = [
        {"id": "d1", "title": "Doc 1", "organization": "DocuMind Global Enterprise"},
        {"id": "d2", "title": "Doc 2", "organization": "Competitor Inc"},
        {"id": "d3", "title": "Doc 3", "organization": "DocuMind Global Enterprise"}
    ]
    filtered = TenantScopeManager.filter_documents_by_tenant(docs, "DocuMind Global Enterprise")
    assert len(filtered) == 2
    assert {d["id"] for d in filtered} == {"d1", "d3"}
