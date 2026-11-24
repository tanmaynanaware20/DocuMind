from typing import List, Optional
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    ANALYST = "ANALYST"
    VIEWER = "VIEWER"

class TenantScopeManager:
    """
    Multi-tenant isolation and role-based access control (RBAC) manager.
    Guarantees strict tenant partition across organizations and fine-grained permissions.
    """

    ROLE_PERMISSIONS = {
        UserRole.ADMIN: {"read", "upload", "reindex", "delete", "export", "manage_keys", "compare"},
        UserRole.ANALYST: {"read", "upload", "reindex", "export", "compare"},
        UserRole.VIEWER: {"read", "compare"}
    }

    @classmethod
    def can_access_document(cls, user_org: str, doc_org: Optional[str]) -> bool:
        """Verifies organization boundary."""
        if not doc_org:
            return True
        return user_org.strip().lower() == doc_org.strip().lower()

    @classmethod
    def has_permission(cls, role: str, action: str) -> bool:
        """Verifies RBAC permission for action."""
        normalized_role = UserRole.ADMIN
        for r in UserRole:
            if r.value.lower() == role.lower():
                normalized_role = r
                break
        
        allowed_actions = cls.ROLE_PERMISSIONS.get(normalized_role, set())
        return action in allowed_actions

    @classmethod
    def filter_documents_by_tenant(cls, documents: List[dict], user_org: str) -> List[dict]:
        """Filters a document list strictly to user organization."""
        return [
            d for d in documents
            if cls.can_access_document(user_org, d.get("organization"))
        ]
