from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth Schemas -----------------
class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    organization: Optional[str] = 'Enterprise Corp'

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserSessionSchema(BaseModel):
    id: str
    device: str
    ip: str
    location: str
    lastActive: str
    isCurrent: bool

class ApiKeySchema(BaseModel):
    id: str
    name: str
    prefix: str
    createdAt: str
    lastUsed: str
    status: str

class UserPreferencesSchema(BaseModel):
    theme: str = 'system'
    aiModel: str = 'Gemini 1.5 Pro'
    ocrEngine: str = 'DocuMind Neural Layout OCR v3'
    autoSummarize: bool = True
    emailNotifications: bool = True
    citationConfidenceThreshold: float = 0.85

class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: str
    avatar: str
    organization: str
    plan: str
    twoFactorEnabled: bool
    sessions: List[UserSessionSchema] = []
    apiKeys: List[ApiKeySchema] = []
    preferences: UserPreferencesSchema = UserPreferencesSchema()

class AuthResponse(BaseModel):
    token: str
    user: UserProfileResponse

# ----------------- Document Schemas -----------------
class DocumentEntitySchema(BaseModel):
    people: List[str] = []
    organizations: List[str] = []
    dates: List[str] = []
    terms: List[str] = []

class DocumentVersionSchema(BaseModel):
    version: int
    updatedAt: str
    summary: str
    author: str

class DocumentResponse(BaseModel):
    id: str
    title: str
    originalName: str
    fileType: str
    fileSize: int
    uploadDate: str
    status: str
    collections: List[str] = []
    tags: List[str] = []
    pageCount: int
    wordCount: int
    summary: Optional[str] = None
    keyPoints: List[str] = []
    entities: DocumentEntitySchema = DocumentEntitySchema()
    versions: List[DocumentVersionSchema] = []
    content: str = ""
    starred: bool = False

# ----------------- Structured Extraction Schemas -----------------
class StructuredExtractionResult(BaseModel):
    document_id: str
    document_title: str
    person_names: List[str] = []
    organization_names: List[str] = []
    important_dates: List[Dict[str, str]] = []  # e.g. [{"date": "2026-09-12", "context": "Effective Date"}]
    deadlines: List[Dict[str, str]] = []
    monetary_values: List[Dict[str, str]] = []  # e.g. [{"amount": "$1,000,000", "description": "Liability Cap"}]
    contract_terms: List[str] = []
    payment_conditions: Optional[str] = None
    invoice_details: Optional[Dict[str, Any]] = None
    critical_clauses: List[Dict[str, str]] = []
    overall_confidence: float = 0.95
    extracted_fields_count: int = 0
    missing_critical_fields: List[str] = []
    field_confidences: Dict[str, float] = {}

# ----------------- Collection Schemas -----------------
class CollectionCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = ""
    color: Optional[str] = "#2563EB"
    icon: Optional[str] = "Folder"
    isPrivate: Optional[bool] = False

class CollectionResponse(BaseModel):
    id: str
    name: str
    description: str
    color: str
    icon: str
    documentIds: List[str] = []
    createdAt: str
    isPrivate: bool
    documentCount: int = 0
    totalPages: int = 0
    totalSize: int = 0

# ----------------- Chat / RAG Schemas -----------------
class CitationSchema(BaseModel):
    documentId: str
    documentTitle: str
    page: int
    snippet: str
    matchScore: float

class ChatMessageSchema(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str
    citations: Optional[List[CitationSchema]] = None
    suggestedQuestions: Optional[List[str]] = None

class ChatQueryRequest(BaseModel):
    query: str = Field(..., min_length=1)
    documentIds: Optional[List[str]] = None
    conversationId: Optional[str] = None

class ConversationSchema(BaseModel):
    id: str
    title: str
    createdAt: str
    messageCount: int = 0

# ----------------- Document Comparison Schemas -----------------
class DiffItemSchema(BaseModel):
    id: str
    type: str  # addition, deletion, modification, unchanged
    section: str
    lineA: Optional[int] = None
    lineB: Optional[int] = None
    textA: Optional[str] = None
    textB: Optional[str] = None
    explanation: str

class ComparisonRequest(BaseModel):
    docAId: str
    docBId: str

class ComparisonResponse(BaseModel):
    docA: Dict[str, Any]
    docB: Dict[str, Any]
    similarityScore: float
    totalChanges: int
    additionsCount: int
    deletionsCount: int
    modificationsCount: int
    aiExecutiveSummary: str
    keyDifferences: List[str]
    riskAssessment: Dict[str, Any]
    diffs: List[DiffItemSchema]

# ----------------- Reports Schemas -----------------
class DashboardStatsResponse(BaseModel):
    kpi: Dict[str, Any]
    storageByType: List[Dict[str, Any]]
    weeklyActivity: List[Dict[str, Any]]
    queryLatencyP95: str
    accuracyScore: str

class ActivityLogSchema(BaseModel):
    id: str
    timestamp: str
    userId: str
    userName: str
    userAvatar: str
    action: str
    targetType: str
    targetTitle: str
    status: str
    details: Optional[str] = None
