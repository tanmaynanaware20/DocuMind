from typing import Optional, List, Dict, Any
from fastapi import Request, status
from fastapi.responses import JSONResponse

class DocuMindException(Exception):
    """Base exception for all domain-specific DocuMind platform errors."""
    def __init__(
        self,
        title: str,
        detail: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        error_type: str = "urn:documind:error:generic",
        invalid_params: Optional[List[Dict[str, Any]]] = None
    ):
        self.title = title
        self.detail = detail
        self.status_code = status_code
        self.error_type = error_type
        self.invalid_params = invalid_params or []
        super().__init__(detail)

class DocumentNotFoundException(DocuMindException):
    def __init__(self, document_id: str):
        super().__init__(
            title="Document Not Found",
            detail=f"The requested document with ID '{document_id}' was not found in the workspace.",
            status_code=status.HTTP_404_NOT_FOUND,
            error_type="urn:documind:error:document-not-found"
        )

class DocumentParsingException(DocuMindException):
    def __init__(self, filename: str, reason: str):
        super().__init__(
            title="Document Parsing Failed",
            detail=f"Failed to extract document '{filename}'. Reason: {reason}",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_type="urn:documind:error:parsing-failure"
        )

class UnauthorizedAccessException(DocuMindException):
    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            title="Access Forbidden",
            detail=f"You do not have permission to access {resource_type} '{resource_id}'.",
            status_code=status.HTTP_403_FORBIDDEN,
            error_type="urn:documind:error:access-forbidden"
        )

async def rfc7807_exception_handler(request: Request, exc: DocuMindException) -> JSONResponse:
    """Serializes DocuMindException into an RFC-7807 compliant Problem Details JSON payload."""
    payload = {
        "type": exc.error_type,
        "title": exc.title,
        "status": exc.status_code,
        "detail": exc.detail,
        "instance": str(request.url.path),
    }
    if exc.invalid_params:
        payload["invalid_params"] = exc.invalid_params

    return JSONResponse(
        status_code=exc.status_code,
        content=payload,
        media_type="application/problem+json"
    )
