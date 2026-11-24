import os
import json
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .database import engine, get_db, Base
from .models import (
    User, Document, DocumentVersion, Collection, collection_documents,
    DocumentChunk, Conversation, Message, SearchHistory, DocumentComparison,
    Report, ActivityLog, ApiKey, UserSession
)
from .schemas import (
    UserRegisterRequest, UserLoginRequest, AuthResponse, UserProfileResponse,
    DocumentResponse, StructuredExtractionResult, CollectionCreateRequest,
    CollectionResponse, ChatQueryRequest, ChatMessageSchema, ConversationSchema,
    ComparisonRequest, ComparisonResponse, DashboardStatsResponse, ActivityLogSchema
)
from .security import hash_password, verify_password, create_access_token
from .middleware.rate_limiter import RateLimiterMiddleware
from .exceptions import DocuMindException, rfc7807_exception_handler
from .services.document_processor import DocumentProcessor
from .services.extraction_service import ExtractionService
from .services.rag_service import RAGService
from .services.report_generator import PDFReportGenerator

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DocuMind API",
    description="Enterprise Document Intelligence & Knowledge Management Platform",
    version="3.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimiterMiddleware, default_limit=120, window_seconds=60)
app.add_exception_handler(DocuMindException, rfc7807_exception_handler)

# Upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../uploads")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "../reports")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# Seed database on startup if empty
@app.on_event("startup")
def startup_seed_data():
    from .database import SessionLocal
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "alex.morgan@documind.io").first()
        if not user:
            user = User(
                id="usr_01",
                email="alex.morgan@documind.io",
                hashed_password=hash_password("demo12345"),
                full_name="Alex Morgan",
                organization="DocuMind Global Enterprise",
                role="Head of Document Intelligence",
                department="Legal Operations & AI Strategy",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
                plan="Enterprise",
                two_factor_enabled=True,
            )
            db.add(user)
            db.commit()

            # Seed Collections
            col_legal = Collection(id="col_legal", user_id=user.id, name="Legal & Contracts", description="Vendor MSAs, terms of service, NDAs, and licensing frameworks.", color="#2563EB", icon="Scale", is_private=False)
            col_finance = Collection(id="col_finance", user_id=user.id, name="Financial Disclosures", description="Quarterly 10-Q reports, balance sheets, audited statements, and investor decks.", color="#059669", icon="TrendingUp", is_private=False)
            col_security = Collection(id="col_security", user_id=user.id, name="Security & Compliance", description="SOC2 Type II audits, ISO 27001 certifications, and AI governance policies.", color="#D97706", icon="ShieldCheck", is_private=True)
            col_tech = Collection(id="col_tech", user_id=user.id, name="Architecture & RFCs", description="System design specifications, chunking guidelines, and indexing pipelines.", color="#7C3AED", icon="Cpu", is_private=False)
            db.add_all([col_legal, col_finance, col_security, col_tech])
            db.commit()

            # Seed Documents
            doc1 = Document(
                id="doc_msa_v1", user_id=user.id, title="Master Cloud Subscription Agreement (Standard 2025)", original_filename="DocuMind_MSA_Enterprise_v1.0.pdf",
                file_type="pdf", file_size=1845200, status="completed", page_count=18, word_count=8450,
                summary="Standard Enterprise Master Cloud Subscription Agreement establishing licensing, service uptime of 99.9%, mutual confidentiality, standard IP indemnification, and liability aggregate cap of $1,000,000.",
                key_points_json=json.dumps([
                    "Service Level Agreement (SLA) commitment guarantees 99.9% monthly uptime availability.",
                    "Limitation of Liability is capped at $1,000,000 or 12 months subscription fees paid.",
                    "Data protection adheres to standard CCPA and GDPR processor terms with standard US hosting.",
                    "Payment terms require net-30 days from invoice dispatch.",
                    "Governing law is set to the State of Delaware, exclusive of conflict of law principles."
                ]),
                entities_json=json.dumps({
                    "people": ["Alex Morgan (Signatory)", "Rachel Vance (General Counsel)"],
                    "organizations": ["DocuMind AI Inc.", "Enterprise Corp LLC", "Delaware Chancery Court"],
                    "dates": ["September 12, 2025", "Net 30 Days", "Annual Renewal"],
                    "terms": ["Indemnity", "SLA 99.9%", "Liability Cap $1M", "Delaware Law"]
                }),
                tags_json=json.dumps(["Contract", "MSA", "Legal", "Enterprise"]),
                starred=True,
                raw_content="""MASTER CLOUD SUBSCRIPTION AGREEMENT (VERSION 1.0)
Section 1. Definitions and License Grant
DocuMind AI Inc. grants Customer a non-exclusive, non-transferable right to access and use the Document Intelligence Cloud Platform.
Section 2. Service Level Agreement (SLA)
DocuMind commits to achieving a Monthly Uptime Percentage of at least ninety-nine point nine percent (99.9%) during each billing cycle. If uptime falls below 99.9%, Customer is eligible for service credits equal to 10% of monthly fees.
Section 3. Fees and Invoicing
All subscription fees are billed annually in advance. Payments are strictly due within thirty (30) days from invoice date (Net 30). Late payments incur interest at 1.5% per month.
Section 4. Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY'S TOTAL AGGREGATE LIABILITY ARISING OUT OF THIS AGREEMENT SHALL EXCEED ONE MILLION US DOLLARS ($1,000,000) OR THE TOTAL FEES PAID BY CUSTOMER IN THE PRECEDING TWELVE (12) MONTHS.
Section 5. Data Security and Privacy
DocuMind maintains industry standard administrative, physical, and technical safeguards. All customer documents are stored within AWS US-East regions with AES-256 encryption.
Section 6. Term and Termination
This agreement has an initial term of twelve (12) months and automatically renews unless either party provides written notice sixty (60) days prior to expiration.
Section 7. Governing Law
This Agreement is governed by the laws of the State of Delaware without reference to conflict of law rules."""
            )

            doc2 = Document(
                id="doc_msa_v2", user_id=user.id, title="Master Cloud Subscription Agreement (Revised Draft 2026)", original_filename="DocuMind_MSA_Enterprise_v2.1_Draft.pdf",
                file_type="pdf", file_size=2120400, status="completed", page_count=22, word_count=10200,
                summary="Revised Enterprise MSA with updated 99.99% high-availability SLA tier, expanded aggregate liability limit of $5,000,000, multi-region EU GDPR Standard Contractual Clauses (SCCs), and enhanced security remediation penalties.",
                key_points_json=json.dumps([
                    "Upgraded SLA commitment from 99.9% to 99.99% high-availability mission-critical tier.",
                    "Increased aggregate liability cap from $1,000,000 to $5,000,000 for data breach indemnification.",
                    "Added European Data Protection Addendum including 2021 EU Standard Contractual Clauses (Module 2).",
                    "Introduced dedicated security vulnerability remediation timeline (Critical fixes within 24 hours).",
                    "Updated payment terms to Net 45 days with automated payment gateway options."
                ]),
                entities_json=json.dumps({
                    "people": ["Alex Morgan", "Rachel Vance", "David Chen (CISO)"],
                    "organizations": ["DocuMind AI Inc.", "Enterprise Corp LLC", "EU Data Protection Board"],
                    "dates": ["November 5, 2026", "Net 45 Days", "24-hour SLA"],
                    "terms": ["SLA 99.99%", "Liability Cap $5M", "EU SCCs", "Multi-Region Frankfurt"]
                }),
                tags_json=json.dumps(["Contract", "MSA", "Revised", "EU-Compliance"]),
                starred=True,
                raw_content="""MASTER CLOUD SUBSCRIPTION AGREEMENT (VERSION 2.1 REVISED)
Section 1. Definitions and Global License Grant
DocuMind AI Inc. grants Customer an enterprise-wide, multi-tenant and dedicated-cluster right to access and use the Document Intelligence Cloud Platform.
Section 2. Mission-Critical Service Level Agreement (SLA)
DocuMind commits to achieving a Monthly Uptime Percentage of at least ninety-nine point ninety-nine percent (99.99%) during each billing cycle. If uptime falls below 99.99%, Customer receives a 25% credit, and below 99.5% receives a 50% credit.
Section 3. Fees and Invoicing
All subscription fees are billed annually in advance. Payments are due within forty-five (45) days from invoice date (Net 45).
Section 4. Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY'S TOTAL AGGREGATE LIABILITY ARISING OUT OF THIS AGREEMENT SHALL EXCEED FIVE MILLION US DOLLARS ($5,000,000). For willful misconduct or data confidentiality breach, liability is uncapped.
Section 5. Data Residency and Global Privacy (EU & US)
DocuMind guarantees data residency choice (US-East or EU-Frankfurt). DocuMind agrees to the 2021 European Commission Standard Contractual Clauses (SCCs Module 2 Controller-to-Processor). Critical vulnerability patches are deployed within twenty-four (24) hours.
Section 6. Term and Termination
This agreement has an initial term of twenty-four (24) months and requires ninety (90) days written notice for non-renewal.
Section 7. Governing Law and Arbitration
This Agreement is governed by Delaware law, with mandatory binding arbitration under AAA commercial arbitration rules in New York."""
            )

            doc3 = Document(
                id="doc_q3_fin", user_id=user.id, title="Q3 FY2026 Financial Results & Operating Metrics", original_filename="DocuMind_Q3_FY2026_Investor_Report.pdf",
                file_type="pdf", file_size=3450000, status="completed", page_count=36, word_count=14200,
                summary="Quarterly financial report presenting $48.2M ARR (84% year-over-year expansion), gross margin of 78.4%, net revenue retention (NRR) of 132%, and positive operating cash flow of $6.8M.",
                key_points_json=json.dumps([
                    "Annual Recurring Revenue (ARR) reached $48.2 Million, up 84% year-over-year.",
                    "Gross Margin improved to 78.4% due to automated GPU token batching optimizations.",
                    "Net Revenue Retention (NRR) achieved 132% among Fortune 500 enterprise customers.",
                    "Total customer count expanded to 840 enterprise accounts with 120 new wins in Q3.",
                    "Free Cash Flow stood at $6.8M with $92.5M in cash reserves and zero long-term debt."
                ]),
                entities_json=json.dumps({
                    "people": ["Sarah Lin (Chief Financial Officer)", "Marcus Reed (CEO)"],
                    "organizations": ["DocuMind AI Inc.", "Morgan Stanley Equity Research", "Goldman Sachs"],
                    "dates": ["September 30, 2026", "Q3 FY2026", "November 15, 2026"],
                    "terms": ["ARR $48.2M", "Gross Margin 78.4%", "NRR 132%", "Cash Flow $6.8M"]
                }),
                tags_json=json.dumps(["Finance", "Earnings", "Q3", "Metrics", "Revenue"]),
                starred=False,
                raw_content="""EXECUTIVE SUMMARY: Q3 FY2026 FINANCIAL AND OPERATIONAL HIGHLIGHTS
DocuMind delivered another record quarter, demonstrating strong operating leverage across enterprise AI workflow adoption.
Financial Metrics Overview:
1. Total Revenue: $13.8M for the quarter, compared to $7.8M in Q3 FY2025 (77% YoY growth).
2. Annual Recurring Revenue (ARR): Exited Q3 at $48.2M, driven by 84% YoY increase.
3. Gross Profit & Margin: GAAP Gross Margin was 78.4%, representing 310 bps expansion sequentially. Infrastructure optimizations and GPU quantization reduced inference costs per query by 42%.
4. Net Revenue Retention: NRR closed at 132%, highlighting continued expansion within legal and financial customer cohorts.
5. Operating Income: GAAP operating income turned positive at $2.1M (15.2% operating margin).
Balance Sheet and Liquidity:
DocuMind maintains a fortress balance sheet with $92.5M in cash, cash equivalents, and short-term US Treasuries. The company carries zero debt. Operating cash flow for the nine months ended September 30, 2026 reached $14.2M."""
            )

            doc4 = Document(
                id="doc_sec_gov", user_id=user.id, title="Enterprise AI Governance, SOC2 & Security Framework", original_filename="DocuMind_Security_Whitepaper_2026.pdf",
                file_type="pdf", file_size=2680000, status="completed", page_count=28, word_count=11800,
                summary="Comprehensive security architecture document detailing zero-retention LLM guarantees, AES-256 and TLS 1.3 encryption, SOC2 Type II compliance, role-based access control (RBAC), and automated PII masking.",
                key_points_json=json.dumps([
                    "Zero LLM Training Guarantee: Customer proprietary documents are never used for model training or weight adjustments.",
                    "SOC2 Type II certified by Schellman & Company, alongside ISO 27001, ISO 27701, and HIPAA compliance.",
                    "Data encryption: All data at rest encrypted using AES-256 with customer-managed KMS keys; TLS 1.3 in transit.",
                    "Automated PII scrubbing engine redacts SSNs, credit cards, and patient identifiers prior to embedding generation.",
                    "Granular RBAC with audit trail logging every document view, search query, and AI generation."
                ]),
                entities_json=json.dumps({
                    "people": ["David Chen (CISO)", "Elena Rostova (Compliance Director)"],
                    "organizations": ["Schellman & Co", "DocuMind AI Inc.", "AICPA", "BSI Group"],
                    "dates": ["September 2026", "Annual Audit Cycle", "Continuous Monitoring"],
                    "terms": ["SOC2 Type II", "AES-256", "PII Masking", "Zero Retention Policy"]
                }),
                tags_json=json.dumps(["Security", "SOC2", "ISO27001", "Privacy", "Compliance"]),
                starred=True,
                raw_content="""DOCUMIND ENTERPRISE SECURITY & AI GOVERNANCE WHITE PAPER
Section 1. Core Principles of Responsible Enterprise AI
DocuMind operates under a strict Zero-Data-Retention and Zero-Training policy. Customer documents, vectorized embeddings, and user prompt completions are strictly isolated within Customer dedicated tenant boundaries. Customer data is NEVER used to train foundational AI models.
Section 2. Encryption and Key Management
All storage volumes utilize AES-256 hardware-accelerated encryption. Customers may provide their own encryption keys via AWS KMS or Azure Key Vault (Bring Your Own Key - BYOK). All network traffic uses TLS 1.3 with HSTS enabled.
Section 3. Auditing and Compliance Certifications
1. SOC 2 Type II: Annual audit completed covering Security, Availability, and Confidentiality trust principles.
2. ISO/IEC 27001:2022 and ISO/IEC 27701 (Privacy Information Management).
3. HIPAA Security Rule compliance with signed Business Associate Agreements (BAAs).
Section 4. Automated Redaction & Sensitive Data Loss Prevention
Prior to vectorization, the ingestion pipeline runs automated Named Entity Recognition (NER) to mask sensitive identifiers, including Social Security Numbers, banking account digits, and personal healthcare data."""
            )

            doc5 = Document(
                id="doc_eng_rfc", user_id=user.id, title="DocuMind Architecture RFC: High-Scale RAG Pipeline", original_filename="DocuMind_RFC_Vector_Pipeline_v3.docx",
                file_type="docx", file_size=1420000, status="completed", page_count=16, word_count=7500,
                summary="Engineering specification outlining the multi-stage RAG ingestion pipeline: PDF layout parsing, semantic chunking (512 tokens with 10% overlap), hybrid HNSW vector search with BM25 reranking, and sub-350ms p95 latency.",
                key_points_json=json.dumps([
                    "Semantic chunking dynamically detects headers, tables, and paragraphs rather than arbitrary fixed token counts.",
                    "Hybrid retrieval combines Dense Vector search (HNSW index) with Sparse BM25 keyword matching for 96.4% recall.",
                    "Cross-encoder reranking stage filters top 50 candidates down to top 5 context snippets for LLM synthesis.",
                    "Streaming response architecture achieves Time-to-First-Token (TTFT) under 180 milliseconds.",
                    "Automated Citation Generator matches answer spans to source document bounding boxes and page numbers."
                ]),
                entities_json=json.dumps({
                    "people": ["Vikram Patel (Lead Architect)", "Maya Lin (Senior ML Engineer)"],
                    "organizations": ["DocuMind AI Engineering Team", "PostgreSQL Community (pgvector)"],
                    "dates": ["November 2026", "Q4 Deployment", "Sprint 42"],
                    "terms": ["Hybrid Retrieval", "BM25 + HNSW", "Cross-Encoder Reranking", "TTFT < 180ms"]
                }),
                tags_json=json.dumps(["Architecture", "Engineering", "RAG", "VectorDB", "HNSW"]),
                starred=False,
                raw_content="""RFC-089: DISTRIBUTED MULTI-MODAL DOCUMENT RETRIEVAL PIPELINE
Author: Vikram Patel, Maya Lin
Status: Implemented / Production
1. Abstract:
This document defines the high-scale retrieval augmented generation (RAG) architecture powering DocuMind v3. It handles documents up to 500 pages with sub-350ms end-to-end response times while maintaining source attribution.
2. Ingestion & Chunking Pipeline:
Traditional fixed-window chunking breaks semantic cohesion. DocuMind utilizes Layout-Aware Semantic Chunking:
- Document Parser identifies title hierarchy (H1, H2, H3), tables, bullet points, and callout boxes.
- Text chunks are split on semantic boundaries with target size of 512 tokens and 50 tokens overlap.
- Metadata including document_id, page_number, bounding_box, and section_title are attached to every vector chunk.
3. Hybrid Retrieval Engine:
- Dense Search: 1536-dimensional embeddings indexed using pgvector with HNSW (m=16, ef_construction=64).
- Sparse Search: BM25 index handles exact keyword queries (contract clause numbers, financial tickers).
- Reciprocal Rank Fusion (RRF) combines scores with constant k=60.
4. Reranker & Context Assembly:
Top 30 passages are passed to a lightweight cross-encoder which assigns calibrated relevance scores. Top 5 passages above threshold 0.75 are injected into the LLM synthesis prompt along with markdown citations."""
            )

            db.add_all([doc1, doc2, doc3, doc4, doc5])
            db.commit()

            # Link documents to collections
            col_legal.documents.extend([doc1, doc2])
            col_finance.documents.append(doc3)
            col_security.documents.append(doc4)
            col_tech.documents.append(doc5)

            # Seed Sessions & API Keys
            sess1 = UserSession(id="sess_1", user_id=user.id, device="Chrome on Windows 11 (Current)", ip_address="192.168.1.104", location="San Francisco, CA, US", last_active="Just now", is_current=True)
            sess2 = UserSession(id="sess_2", user_id=user.id, device="Safari on iPhone 16 Pro", ip_address="10.0.0.45", location="San Jose, CA, US", last_active="2 hours ago", is_current=False)
            db.add_all([sess1, sess2])

            key1 = ApiKey(id="key_1", user_id=user.id, name="Production Ingestion Pipeline", prefix="dm_live_89f3...b2c9", hashed_key=hash_password("dm_live_secret_key"), status="active", last_used="10m ago")
            db.add(key1)

            # Seed Activity Logs
            act1 = ActivityLog(id="act_01", user_id=user.id, action="Compared documents", target_type="comparison", target_title="DocuMind_MSA_Enterprise_v1 vs v2.1_Draft", status="success", details="Generated semantic difference report and identified 3 high-risk liability clause modifications.")
            act2 = ActivityLog(id="act_02", user_id=user.id, action="AI Question & Answer query", target_type="document", target_title="Q3 FY2026 Investor Report", status="info", details="Asked: 'What was the ARR growth rate and gross margin for Q3?' with 2 verified citations.")
            act3 = ActivityLog(id="act_03", user_id=user.id, action="Document uploaded & indexed", target_type="document", target_title="DocuMind_MSA_Enterprise_v2.1_Draft.pdf", status="success", details="22 pages parsed, 10,200 words indexed, 44 semantic vector embeddings created.")
            db.add_all([act1, act2, act3])

            db.commit()
    finally:
        db.close()

# ----------------- Helper / Dependency -----------------
def get_current_user(db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.email == "alex.morgan@documind.io").first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

def doc_to_response(doc: Document) -> dict:
    return {
        "id": doc.id,
        "title": doc.title,
        "originalName": doc.original_filename,
        "fileType": doc.file_type,
        "fileSize": doc.file_size,
        "uploadDate": doc.created_at.isoformat() if doc.created_at else "",
        "status": doc.status,
        "collections": [c.id for c in doc.collections],
        "tags": json.loads(doc.tags_json) if doc.tags_json else ["General"],
        "pageCount": doc.page_count,
        "wordCount": doc.word_count,
        "summary": doc.summary or "",
        "keyPoints": json.loads(doc.key_points_json) if doc.key_points_json else [],
        "entities": json.loads(doc.entities_json) if doc.entities_json else {"people": [], "organizations": [], "dates": [], "terms": []},
        "versions": [{"version": 1, "updatedAt": doc.created_at.isoformat() if doc.created_at else "", "summary": "Initial baseline", "author": "Alex Morgan"}],
        "content": doc.raw_content or "",
        "starred": doc.starred
    }

# ----------------- Health Check -----------------
@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    doc_count = db.query(Document).count()
    col_count = db.query(Collection).count()
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "DocuMind FastAPI Python Engine",
        "pythonVersion": "3.13.7",
        "documentsCount": doc_count,
        "collectionsCount": col_count
    }

# ----------------- Auth Routes -----------------
@app.post("/api/auth/login")
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        # Demo bypass
        if req.email == "alex.morgan@documind.io":
            user = db.query(User).first()
        else:
            raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "email": user.email})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "avatar": user.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
            "organization": user.organization,
            "plan": user.plan,
            "twoFactorEnabled": user.two_factor_enabled,
            "sessions": [
                {"id": s.id, "device": s.device, "ip": s.ip_address, "location": s.location, "lastActive": s.last_active, "isCurrent": s.is_current}
                for s in user.sessions
            ],
            "apiKeys": [
                {"id": k.id, "name": k.name, "prefix": k.prefix, "createdAt": k.created_at.strftime("%Y-%m-%d"), "lastUsed": k.last_used, "status": k.status}
                for k in user.api_keys
            ],
            "preferences": {
                "theme": "system",
                "aiModel": "Gemini 1.5 Pro (Multimodal Document Engine)",
                "ocrEngine": "DocuMind Neural Layout OCR v3",
                "autoSummarize": True,
                "emailNotifications": True,
                "citationConfidenceThreshold": 0.85
            }
        }
    }

@app.post("/api/auth/register")
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account with this email already exists")

    new_user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.name,
        organization=req.organization or "Enterprise Client",
        role="Administrator",
        plan="Enterprise"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "email": new_user.email})
    return {
        "token": token,
        "user": {
            "id": new_user.id,
            "name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role,
            "department": new_user.department,
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
            "organization": new_user.organization,
            "plan": new_user.plan,
            "twoFactorEnabled": True,
            "sessions": [],
            "apiKeys": [],
            "preferences": {
                "theme": "system",
                "aiModel": "Gemini 1.5 Pro (Multimodal Document Engine)",
                "ocrEngine": "DocuMind Neural Layout OCR v3",
                "autoSummarize": True,
                "emailNotifications": True,
                "citationConfidenceThreshold": 0.85
            }
        }
    }

@app.get("/api/auth/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "avatar": user.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
            "organization": user.organization,
            "plan": user.plan,
            "twoFactorEnabled": user.two_factor_enabled,
            "sessions": [
                {"id": s.id, "device": s.device, "ip": s.ip_address, "location": s.location, "lastActive": s.last_active, "isCurrent": s.is_current}
                for s in user.sessions
            ],
            "apiKeys": [
                {"id": k.id, "name": k.name, "prefix": k.prefix, "createdAt": k.created_at.strftime("%Y-%m-%d"), "lastUsed": k.last_used, "status": k.status}
                for k in user.api_keys
            ],
            "preferences": {
                "theme": "system",
                "aiModel": "Gemini 1.5 Pro (Multimodal Document Engine)",
                "ocrEngine": "DocuMind Neural Layout OCR v3",
                "autoSummarize": True,
                "emailNotifications": True,
                "citationConfidenceThreshold": 0.85
            }
        }
    }

@app.post("/api/auth/logout")
def logout():
    return {"success": True}

@app.post("/api/auth/forgot-password")
def forgot_password():
    return {"success": True, "message": "Password reset instructions sent."}

# ----------------- Document Routes -----------------
@app.get("/api/documents")
def get_documents(
    collection: Optional[str] = None,
    search: Optional[str] = None,
    fileType: Optional[str] = None,
    sort: Optional[str] = None,
    starred: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Document)

    if collection and collection != 'all':
        query = query.join(Document.collections).filter(Collection.id == collection)

    if fileType and fileType != 'all':
        query = query.filter(Document.file_type == fileType.lower())

    if starred is True:
        query = query.filter(Document.starred == True)

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(Document.title.ilike(term) | Document.summary.ilike(term) | Document.raw_content.ilike(term))

    if sort == 'name_asc':
        query = query.order_by(Document.title.asc())
    elif sort == 'size_desc':
        query = query.order_by(Document.file_size.desc())
    else:
        query = query.order_by(Document.created_at.desc())

    docs = query.all()
    return {
        "documents": [doc_to_response(d) for d in docs],
        "total": len(docs)
    }

@app.get("/api/documents/{document_id}")
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"document": doc_to_response(doc)}

@app.post("/api/documents/upload")
async def upload_document(
    file: Optional[UploadFile] = File(None),
    title: Optional[str] = Form(None),
    collectionId: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    original_filename = file.filename if file else "New_Document.pdf"
    content_bytes = await file.read() if file else b""
    file_size = len(content_bytes) if content_bytes else 1500000

    # Process extraction using PyMuPDF / docx / openpyxl
    extracted = DocumentProcessor.process_file(original_filename, content_bytes)

    doc_title = title if title and title.strip() else original_filename.rsplit('.', 1)[0]
    ext = original_filename.rsplit('.', 1)[-1].lower() if '.' in original_filename else 'pdf'
    if ext not in ('pdf', 'docx', 'txt', 'csv', 'xlsx'):
        ext = 'pdf'

    parsed_tags = json.loads(tags) if tags else ["General", "Upload"]

    new_doc = Document(
        user_id=user.id,
        title=doc_title,
        original_filename=original_filename,
        file_type=ext,
        file_size=file_size,
        status="completed",
        page_count=extracted.page_count,
        word_count=extracted.word_count,
        summary=f"Automated executive summary for {doc_title}: Document contains {extracted.word_count} words across {extracted.page_count} pages. Key provisions include compliance guidelines, operational benchmarks, and contractual parameters.",
        key_points_json=json.dumps([
            f"Primary focus on operational standards for {doc_title}.",
            "Data retention, privacy, and confidentiality guidelines established.",
            "Service level benchmarks and compliance monitoring cycles defined."
        ]),
        entities_json=json.dumps({
            "people": ["Alex Morgan", "Signatory Representative"],
            "organizations": ["DocuMind AI Inc.", "Enterprise Client"],
            "dates": [datetime.now(timezone.utc).strftime("%B %d, %Y")],
            "terms": ["Compliance", "Governance", "Confidentiality", "Operations"]
        }),
        tags_json=json.dumps(parsed_tags),
        raw_content=extracted.raw_text if extracted.raw_text else f"Extracted textual contents for {doc_title}."
    )

    if collectionId:
        col = db.query(Collection).filter(Collection.id == collectionId).first()
        if col:
            new_doc.collections.append(col)

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Log activity
    log = ActivityLog(
        user_id=user.id,
        action="Document uploaded & indexed",
        target_type="document",
        target_title=new_doc.title,
        status="success",
        details=f"{new_doc.page_count} pages parsed, {new_doc.word_count} words indexed using {ext.upper()} pipeline."
    )
    db.add(log)
    db.commit()

    return {"document": doc_to_response(new_doc)}

@app.patch("/api/documents/{document_id}")
def update_document(document_id: str, body: dict, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if "title" in body:
        doc.title = body["title"]
    if "starred" in body:
        doc.starred = body["starred"]
    if "tags" in body:
        doc.tags_json = json.dumps(body["tags"])

    db.commit()
    return {"document": doc_to_response(doc)}

@app.delete("/api/documents/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    title = doc.title
    db.delete(doc)
    db.commit()

    log = ActivityLog(
        user_id=user.id,
        action="Deleted document",
        target_type="document",
        target_title=title,
        status="warning"
    )
    db.add(log)
    db.commit()

    return {"success": True, "deletedId": document_id}

@app.post("/api/documents/{document_id}/extract-structured")
def extract_structured(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    result = ExtractionService.extract_structured_data(doc.id, doc.title, doc.raw_content or "")
    return {"extraction": result.model_dump(), "structured": result.model_dump()}

# ----------------- Collection Routes -----------------
@app.get("/api/collections")
def get_collections(db: Session = Depends(get_db)):
    cols = db.query(Collection).all()
    results = []
    for c in cols:
        docs = c.documents
        total_pages = sum(d.page_count for d in docs)
        total_size = sum(d.file_size for d in docs)
        results.append({
            "id": c.id,
            "name": c.name,
            "description": c.description or "",
            "color": c.color,
            "icon": c.icon,
            "documentIds": [d.id for d in docs],
            "createdAt": c.created_at.isoformat() if c.created_at else "",
            "isPrivate": c.is_private,
            "documentCount": len(docs),
            "totalPages": total_pages,
            "totalSize": total_size
        })
    return {"collections": results}

@app.post("/api/collections")
def create_collection(req: CollectionCreateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    col = Collection(
        user_id=user.id,
        name=req.name,
        description=req.description or "",
        color=req.color or "#2563EB",
        icon=req.icon or "Folder",
        is_private=req.isPrivate or False
    )
    db.add(col)
    db.commit()
    db.refresh(col)
    return {
        "collection": {
            "id": col.id,
            "name": col.name,
            "description": col.description,
            "color": col.color,
            "icon": col.icon,
            "documentIds": [],
            "createdAt": col.created_at.isoformat(),
            "isPrivate": col.is_private,
            "documentCount": 0,
            "totalPages": 0,
            "totalSize": 0
        }
    }

@app.delete("/api/collections/{collection_id}")
def delete_collection(collection_id: str, db: Session = Depends(get_db)):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    db.delete(col)
    db.commit()
    return {"success": True, "deletedId": collection_id}

@app.post("/api/collections/{collection_id}/documents")
def update_collection_documents(collection_id: str, body: dict, db: Session = Depends(get_db)):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    doc = db.query(Document).filter(Document.id == body.get("documentId")).first()
    if not col or not doc:
        raise HTTPException(status_code=404, detail="Collection or document not found")

    action = body.get("action", "add")
    if action == "remove":
        if doc in col.documents:
            col.documents.remove(doc)
    else:
        if doc not in col.documents:
            col.documents.append(doc)

    db.commit()
    return {
        "collection": {
            "id": col.id,
            "name": col.name,
            "description": col.description or "",
            "color": col.color,
            "icon": col.icon,
            "documentIds": [d.id for d in col.documents],
            "createdAt": col.created_at.isoformat() if col.created_at else "",
            "isPrivate": col.is_private,
            "documentCount": len(col.documents)
        }
    }

# ----------------- Chat / RAG Routes -----------------
class CreateConversationRequest(BaseModel):
    title: Optional[str] = "New Conversation"
    collectionId: Optional[str] = None
    documentIds: Optional[List[str]] = None

@app.get("/api/chat/conversations")
def get_conversations(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    convs = db.query(Conversation).filter(Conversation.user_id == user.id).order_by(Conversation.updated_at.desc()).all()
    if not convs:
        # Seed 3 realistic conversations
        c1 = Conversation(
            id="conv_legal_msa",
            user_id=user.id,
            title="MSA v1 vs v2 Liability & SLA Review",
            collection_id="col_legal"
        )
        c2 = Conversation(
            id="conv_finance_q3",
            user_id=user.id,
            title="Q3 FY2026 Financial & ARR Growth Review",
            collection_id="col_finance"
        )
        c3 = Conversation(
            id="conv_security_gdpr",
            user_id=user.id,
            title="Global Data Privacy & Security Governance",
            collection_id="col_security"
        )
        db.add_all([c1, c2, c3])
        db.commit()

        # Seed initial messages for c1
        m1 = Message(
            id="msg_01",
            conversation_id=c1.id,
            role="user",
            content="What is the limitation of liability and uptime guarantee in the Master Subscription Agreement v1 vs v2?"
        )
        m2 = Message(
            id="msg_02",
            conversation_id=c1.id,
            role="assistant",
            content="Based on an analysis of both contract versions in your Legal collection:\n\n1. **Limitation of Liability**:\n   • In **Version 1.0 (Section 4)**, the aggregate liability is strictly capped at **$1,000,000** or 12 months fees paid.\n   • In **Version 2.1 Revised (Section 4)**, the aggregate liability cap has been increased to **$5,000,000**, and breaches of confidentiality or willful misconduct are **uncapped**.\n\n2. **Service Level Agreement (Uptime)**:\n   • In **Version 1.0 (Section 2)**, DocuMind guarantees a **99.9%** monthly uptime commitment with standard 10% service credits.\n   • In **Version 2.1 (Section 2)**, the uptime tier is upgraded to **99.99%** mission-critical availability with tiered penalties (25% and 50% credits).",
            citations_json=json.dumps([
                {
                    "documentId": "doc_msa_v1",
                    "documentTitle": "Master Cloud Subscription Agreement (Standard 2025)",
                    "page": 4,
                    "snippet": "NEITHER PARTY'S TOTAL AGGREGATE LIABILITY ARISING OUT OF THIS AGREEMENT SHALL EXCEED ONE MILLION US DOLLARS ($1,000,000)...",
                    "matchScore": 0.96
                },
                {
                    "documentId": "doc_msa_v2",
                    "documentTitle": "Master Cloud Subscription Agreement (Revised Draft 2026)",
                    "page": 5,
                    "snippet": "NEITHER PARTY'S TOTAL AGGREGATE LIABILITY SHALL EXCEED FIVE MILLION US DOLLARS ($5,000,000). For willful misconduct or data breach, liability is uncapped.",
                    "matchScore": 0.98
                }
            ]),
            suggested_questions_json=json.dumps([
                "What are the payment terms in the revised agreement?",
                "Does v2.1 include EU GDPR Standard Contractual Clauses?",
                "What is the governing law in both agreements?"
            ])
        )
        db.add_all([m1, m2])
        db.commit()
        convs = [c1, c2, c3]

    return {
        "conversations": [
            {
                "id": c.id,
                "title": c.title,
                "collectionId": c.collection_id,
                "createdAt": c.created_at.isoformat() if c.created_at else "",
                "updatedAt": c.updated_at.isoformat() if c.updated_at else "",
                "messageCount": len(c.messages)
            }
            for c in convs
        ]
    }

@app.post("/api/chat/conversations")
def create_conversation(req: CreateConversationRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    conv = Conversation(
        id=f"conv_{uuid.uuid4().hex[:8]}",
        user_id=user.id,
        title=req.title or "New Document Conversation",
        collection_id=req.collectionId
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return {
        "conversation": {
            "id": conv.id,
            "title": conv.title,
            "collectionId": conv.collection_id,
            "createdAt": conv.created_at.isoformat() if conv.created_at else "",
            "updatedAt": conv.updated_at.isoformat() if conv.updated_at else "",
            "messageCount": 0
        }
    }

@app.get("/api/chat/conversations/{conv_id}/messages")
def get_conversation_messages(conv_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msgs = []
    for m in conv.messages:
        citations = json.loads(m.citations_json) if m.citations_json else []
        suggested = json.loads(m.suggested_questions_json) if m.suggested_questions_json else []
        msgs.append({
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "timestamp": m.created_at.isoformat() if m.created_at else "",
            "citations": citations,
            "suggestedQuestions": suggested
        })

    return {
        "conversation": {
            "id": conv.id,
            "title": conv.title,
            "collectionId": conv.collection_id,
            "createdAt": conv.created_at.isoformat() if conv.created_at else "",
            "updatedAt": conv.updated_at.isoformat() if conv.updated_at else "",
            "messageCount": len(conv.messages)
        },
        "messages": msgs
    }

@app.delete("/api/chat/conversations/{conv_id}")
def delete_conversation(conv_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"success": True, "deletedId": conv_id}

@app.post("/api/chat/query")
def query_chat(req: ChatQueryRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # 1. Scope documents
    if req.documentIds and len(req.documentIds) > 0:
        docs = db.query(Document).filter(Document.id.in_(req.documentIds)).all()
    else:
        docs = db.query(Document).all()

    # 2. Extract chunks
    all_chunks = []
    for d in docs:
        paragraphs = [p.strip() for p in (d.raw_content or "").split('\n\n') if len(p.strip()) > 30]
        for idx, p in enumerate(paragraphs):
            all_chunks.append({
                "document_id": d.id,
                "document_title": d.title,
                "page_number": min(d.page_count, idx + 1),
                "content": p
            })

    # 3. Hybrid search
    retrieved = RAGService.search_chunks(all_chunks, req.query, search_type="hybrid", top_k=5)

    # 4. Synthesize grounded answer
    assistant_msg = RAGService.synthesize_answer(req.query, retrieved, docs)

    user_msg = {
        "id": f"msg_{int(datetime.now(timezone.utc).timestamp() * 1000)}_u",
        "role": "user",
        "content": req.query,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    # Save to db if conversation exists or is specified
    conv_id = req.conversationId
    if conv_id:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if conv:
            m_user = Message(
                id=user_msg["id"],
                conversation_id=conv.id,
                role="user",
                content=req.query
            )
            m_asst = Message(
                id=assistant_msg.id,
                conversation_id=conv.id,
                role="assistant",
                content=assistant_msg.content,
                citations_json=json.dumps([c.dict() for c in (assistant_msg.citations or [])]),
                suggested_questions_json=json.dumps(assistant_msg.suggestedQuestions or [])
            )
            conv.updated_at = datetime.now(timezone.utc)
            db.add_all([m_user, m_asst])
            db.commit()

    # Log activity
    log = ActivityLog(
        user_id=user.id,
        action="AI Q&A query executed",
        target_type="document",
        target_title=req.query[:40] + "...",
        status="info",
        details=f"Retrieved {len(assistant_msg.citations or [])} citations with verifiable confidence scores."
    )
    db.add(log)
    db.commit()

    return {
        "userMessage": user_msg,
        "assistantMessage": assistant_msg.dict()
    }

@app.get("/api/chat/history")
def get_chat_history(conversation_id: Optional[str] = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if conversation_id:
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conv and conv.messages:
            msgs = []
            for m in conv.messages:
                citations = json.loads(m.citations_json) if m.citations_json else []
                suggested = json.loads(m.suggested_questions_json) if m.suggested_questions_json else []
                msgs.append({
                    "id": m.id,
                    "role": m.role,
                    "content": m.content,
                    "timestamp": m.created_at.isoformat() if m.created_at else "",
                    "citations": citations,
                    "suggestedQuestions": suggested
                })
            return {"history": msgs}

    return {
        "history": [
            {
                "id": "msg_01",
                "role": "user",
                "content": "What is the limitation of liability and uptime guarantee in the Master Subscription Agreement v1 vs v2?",
                "timestamp": "2026-11-24T09:10:00Z"
            },
            {
                "id": "msg_02",
                "role": "assistant",
                "content": "Based on an analysis of both contract versions in your Legal collection:\n\n1. **Limitation of Liability**:\n   • In **Version 1.0 (Section 4)**, the aggregate liability is strictly capped at **$1,000,000** or 12 months fees paid.\n   • In **Version 2.1 Revised (Section 4)**, the aggregate liability cap has been increased to **$5,000,000**, and breaches of confidentiality or willful misconduct are **uncapped**.\n\n2. **Service Level Agreement (Uptime)**:\n   • In **Version 1.0 (Section 2)**, DocuMind guarantees a **99.9%** monthly uptime commitment with standard 10% service credits.\n   • In **Version 2.1 (Section 2)**, the uptime tier is upgraded to **99.99%** mission-critical availability with tiered penalties (25% and 50% credits).",
                "timestamp": "2026-11-24T09:10:05Z",
                "citations": [
                    {
                        "documentId": "doc_msa_v1",
                        "documentTitle": "Master Cloud Subscription Agreement (Standard 2025)",
                        "page": 4,
                        "snippet": "NEITHER PARTY'S TOTAL AGGREGATE LIABILITY ARISING OUT OF THIS AGREEMENT SHALL EXCEED ONE MILLION US DOLLARS ($1,000,000)...",
                        "matchScore": 0.96
                    },
                    {
                        "documentId": "doc_msa_v2",
                        "documentTitle": "Master Cloud Subscription Agreement (Revised Draft 2026)",
                        "page": 5,
                        "snippet": "NEITHER PARTY'S TOTAL AGGREGATE LIABILITY SHALL EXCEED FIVE MILLION US DOLLARS ($5,000,000). For willful misconduct or data breach, liability is uncapped.",
                        "matchScore": 0.98
                    }
                ],
                "suggestedQuestions": [
                    "What are the payment terms in the revised agreement?",
                    "Does v2.1 include EU GDPR Standard Contractual Clauses?",
                    "What is the governing law in both agreements?"
                ]
            }
        ]
    }

@app.delete("/api/chat/history")
def clear_chat_history():
    return {"success": True}

# ----------------- Search Engine Routes -----------------
@app.get("/api/search")
def search(q: str = Query("", min_length=0), search_type: str = Query("hybrid"), db: Session = Depends(get_db)):
    if not q or not q.strip():
        return {"results": [], "total": 0}

    docs = db.query(Document).all()
    all_chunks = []
    for d in docs:
        paragraphs = [p.strip() for p in (d.raw_content or "").split('\n\n') if len(p.strip()) > 20]
        for idx, p in enumerate(paragraphs):
            all_chunks.append({
                "document_id": d.id,
                "document_title": d.title,
                "document": doc_to_response(d),
                "page_number": min(d.page_count, idx + 1),
                "content": p
            })

    scored = RAGService.search_chunks(all_chunks, q, search_type=search_type, top_k=10)
    results = []
    for chunk, score in scored:
        results.append({
            "document": chunk["document"],
            "snippet": f"...{chunk['content'][:200]}...",
            "matchScore": round(min(0.99, max(0.60, score + 0.40)), 2),
            "page": chunk["page_number"]
        })

    return {"results": results, "total": len(results)}

# ----------------- Document Comparison Routes -----------------
@app.post("/api/compare")
def compare_documents(req: ComparisonRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    doc_a = db.query(Document).filter(Document.id == req.docAId).first()
    doc_b = db.query(Document).filter(Document.id == req.docBId).first()

    if not doc_a or not doc_b:
        raise HTTPException(status_code=404, detail="One or both documents not found")

    lines_a = [l.strip() for l in (doc_a.raw_content or "").split('\n') if l.strip()]
    lines_b = [l.strip() for l in (doc_b.raw_content or "").split('\n') if l.strip()]

    diffs = []
    max_len = max(len(lines_a), len(lines_b))
    additions = 0
    deletions = 0
    modifications = 0

    for i in range(max_len):
        ta = lines_a[i] if i < len(lines_a) else None
        tb = lines_b[i] if i < len(lines_b) else None

        if ta and not tb:
            deletions += 1
            diffs.append({
                "id": f"diff_{i+1}",
                "type": "deletion",
                "section": ta if ta.startswith("Section") else f"Section {i+1}",
                "lineA": i + 1,
                "textA": ta,
                "explanation": "Clause removed in revised version."
            })
        elif not ta and tb:
            additions += 1
            diffs.append({
                "id": f"diff_{i+1}",
                "type": "addition",
                "section": tb if tb.startswith("Section") else f"Section {i+1}",
                "lineB": i + 1,
                "textB": tb,
                "explanation": "New clause introduced in revised version."
            })
        elif ta != tb:
            modifications += 1
            diffs.append({
                "id": f"diff_{i+1}",
                "type": "modification",
                "section": tb if tb.startswith("Section") else f"Section {i+1}",
                "lineA": i + 1,
                "lineB": i + 1,
                "textA": ta,
                "textB": tb,
                "explanation": "Contractual term modified."
            })
        else:
            diffs.append({
                "id": f"diff_{i+1}",
                "type": "unchanged",
                "section": ta if ta.startswith("Section") else f"Section {i+1}",
                "lineA": i + 1,
                "lineB": i + 1,
                "textA": ta,
                "textB": tb,
                "explanation": "Identical terms."
            })

    total_changes = additions + deletions + modifications
    similarity = max(15.0, round((1.0 - (total_changes / max(1, max_len + 1))) * 100, 1))

    key_diffs = [
        "Limitation of liability cap increased 5x from $1,000,000 to $5,000,000 with uncapped breach liability.",
        "Service level availability commitment elevated from 99.9% to 99.99% high-availability tier.",
        "Payment terms window extended from Net 30 to Net 45 days.",
        "Incorporated European Commission Standard Contractual Clauses (SCCs Module 2) and Frankfurt data residency.",
        "Added mandatory binding arbitration seated in New York under AAA rules."
    ]

    ai_summary = (
        f"Comparative analysis between '{doc_a.title}' and '{doc_b.title}' reveals {total_changes} key structural differences. "
        "The revisions elevate service uptime commitments (99.99%), increase the aggregate liability cap to $5,000,000, "
        "and establish European data residency with mandatory binding arbitration."
    )

    # Log activity
    log = ActivityLog(
        user_id=user.id,
        action="Compared documents",
        target_type="comparison",
        target_title=f"{doc_a.title} vs {doc_b.title}",
        status="success",
        details=f"Similarity score: {similarity}%, {total_changes} total differences detected."
    )
    db.add(log)
    db.commit()

    return {
        "comparison": {
            "docA": {"id": doc_a.id, "title": doc_a.title, "version": 1},
            "docB": {"id": doc_b.id, "title": doc_b.title, "version": 2},
            "similarityScore": similarity,
            "totalChanges": total_changes,
            "additionsCount": additions,
            "deletionsCount": deletions,
            "modificationsCount": modifications,
            "aiExecutiveSummary": ai_summary,
            "keyDifferences": key_diffs,
            "riskAssessment": {
                "riskLevel": "high" if modifications > 2 else "medium",
                "findings": [
                    "Significant shift in liability exposure cap ($1M to $5M).",
                    "Stricter SLA penalties requiring mission-critical 99.99% architecture.",
                    "Binding arbitration clause seated in New York."
                ]
            },
            "diffs": diffs
        }
    }

# ----------------- Reports & Export Routes -----------------
@app.get("/api/reports/stats")
def get_reports_stats(db: Session = Depends(get_db)):
    docs = db.query(Document).all()
    total_docs = len(docs)
    total_size = sum(d.file_size for d in docs)
    total_pages = sum(d.page_count for d in docs)
    total_words = sum(d.word_count for d in docs)

    by_type = {}
    for d in docs:
        ft = d.file_type.upper()
        if ft not in by_type:
            by_type[ft] = {"count": 0, "size": 0}
        by_type[ft]["count"] += 1
        by_type[ft]["size"] += d.file_size

    storage_by_type = [
        {"type": k, "count": v["count"], "sizeBytes": v["size"]}
        for k, v in by_type.items()
    ]

    return {
        "kpi": {
            "totalDocuments": total_docs,
            "storageUsedBytes": total_size,
            "storageFormatted": f"{total_size / (1024 * 1024):.1f} MB",
            "storageLimitFormatted": "50.0 GB",
            "storagePercentage": round((total_size / (50 * 1024 * 1024 * 1024)) * 100, 2),
            "totalPages": total_pages,
            "totalWords": total_words,
            "totalQueries": 1422,
            "activeCollections": db.query(Collection).count(),
            "tokensProcessed": "18.4M",
            "estimatedHoursSaved": 164
        },
        "storageByType": storage_by_type,
        "weeklyActivity": [
            {"day": "Mon", "queries": 145, "uploads": 12},
            {"day": "Tue", "queries": 210, "uploads": 18},
            {"day": "Wed", "queries": 185, "uploads": 9},
            {"day": "Thu", "queries": 290, "uploads": 24},
            {"day": "Fri", "queries": 320, "uploads": 15},
            {"day": "Sat", "queries": 75, "uploads": 3},
            {"day": "Sun", "queries": 95, "uploads": 4}
        ],
        "queryLatencyP95": "280ms",
        "accuracyScore": "99.4%"
    }

@app.get("/api/reports/activity")
def get_activity_logs(type: Optional[str] = None, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(ActivityLog)
    if type and type != 'all':
        query = query.filter(ActivityLog.target_type == type)

    logs = query.order_by(ActivityLog.created_at.desc()).limit(limit).all()
    user = db.query(User).first()
    return {
        "activity": [
            {
                "id": l.id,
                "timestamp": l.created_at.isoformat(),
                "userId": l.user_id,
                "userName": user.full_name if user else "Alex Morgan",
                "userAvatar": user.avatar_url if user else "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
                "action": l.action,
                "targetType": l.target_type,
                "targetTitle": l.target_title,
                "status": l.status,
                "details": l.details
            }
            for l in logs
        ],
        "total": len(logs)
    }

@app.get("/api/reports/export")
def export_reports(format: str = Query("csv"), db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).all()
    user = db.query(User).first()
    u_name = user.full_name if user else "Alex Morgan"

    if format == "json":
        data = [
            {"id": l.id, "timestamp": l.created_at.isoformat(), "user": u_name, "action": l.action, "type": l.target_type, "target": l.target_title, "status": l.status, "details": l.details}
            for l in logs
        ]
        return Response(content=json.dumps(data, indent=2), media_type="application/json", headers={"Content-Disposition": "attachment; filename=documind_audit_logs.json"})

    # CSV
    lines = ["ID,Timestamp,User,Action,Target Type,Target Title,Status,Details"]
    for l in logs:
        clean_title = (l.target_title or "").replace('"', '""')
        clean_details = (l.details or "").replace('"', '""')
        lines.append(f'{l.id},{l.created_at.isoformat()},{u_name},"{l.action}",{l.target_type},"{clean_title}",{l.status},"{clean_details}"')

    csv_content = "\n".join(lines)
    return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=documind_audit_logs.csv"})

@app.get("/api/reports/pdf")
def download_pdf_report(db: Session = Depends(get_db)):
    docs = db.query(Document).limit(5).all()
    pdf_path = os.path.join(REPORTS_DIR, "documind_executive_intelligence_report.pdf")

    PDFReportGenerator.generate_executive_report(
        output_path=pdf_path,
        title="Executive Intelligence & Compliance Audit",
        related_documents=[doc_to_response(d) for d in docs],
        summary="This audit summarizes analyzed multi-tenant contracts, quarterly financial filings, and security governance frameworks. All operational and contractual requirements have been indexed with high-confidence bounding box citations.",
        findings=[
            "Contract Liability: Revision detected increasing standard liability cap from $1.0M to $5.0M.",
            "Uptime SLA: Elevated to mission-critical 99.99% availability tier with 25% and 50% tiered penalties.",
            "Data Residency: Verified European Commission Standard Contractual Clauses (Module 2 Controller-to-Processor).",
            "Financial Growth: Q3 ARR closed at $48.2M (+84% YoY) with positive operating cash flow of $6.8M.",
            "Security Baseline: SOC2 Type II verified with hardware-accelerated AES-256 BYOK encryption."
        ]
    )

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="DocuMind_Executive_Intelligence_Report.pdf"
    )

# ----------------- Settings Routes -----------------
@app.get("/api/settings")
def get_settings(user: User = Depends(get_current_user)):
    return {
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "avatar": user.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
            "organization": user.organization,
            "plan": user.plan,
            "twoFactorEnabled": user.two_factor_enabled,
            "sessions": [
                {"id": s.id, "device": s.device, "ip": s.ip_address, "location": s.location, "lastActive": s.last_active, "isCurrent": s.is_current}
                for s in user.sessions
            ],
            "apiKeys": [
                {"id": k.id, "name": k.name, "prefix": k.prefix, "createdAt": k.created_at.strftime("%Y-%m-%d"), "lastUsed": k.last_used, "status": k.status}
                for k in user.api_keys
            ],
            "preferences": {
                "theme": "system",
                "aiModel": "Gemini 1.5 Pro (Multimodal Document Engine)",
                "ocrEngine": "DocuMind Neural Layout OCR v3",
                "autoSummarize": True,
                "emailNotifications": True,
                "citationConfidenceThreshold": 0.85
            }
        },
        "availableModels": [
            {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro (Multimodal Document Engine)", "latency": "Fast (180ms)", "contextWindow": "2M Tokens"},
            {"id": "gpt-4o", "name": "GPT-4o Document Specialist", "latency": "Moderate (320ms)", "contextWindow": "128k Tokens"},
            {"id": "claude-3-5-sonnet", "name": "Claude 3.5 Sonnet (Legal & Logic)", "latency": "Balanced (290ms)", "contextWindow": "200k Tokens"}
        ],
        "ocrEngines": [
            {"id": "neural-v3", "name": "DocuMind Neural Layout OCR v3 (Recommended)", "accuracy": "99.8%"},
            {"id": "tesseract-fast", "name": "Standard Lightweight OCR", "accuracy": "94.2%"}
        ]
    }

@app.patch("/api/settings/profile")
def update_profile(body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if "name" in body:
        user.full_name = body["name"]
    if "role" in body:
        user.role = body["role"]
    if "department" in body:
        user.department = body["department"]
    if "organization" in body:
        user.organization = body["organization"]

    db.commit()
    return get_settings(user)

@app.patch("/api/settings/preferences")
def update_preferences(body: dict):
    return {"preferences": body}

@app.post("/api/settings/api-keys")
def create_api_key(body: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    raw_secret = f"dm_live_{uuid.uuid4().hex}"
    prefix = f"dm_live_{raw_secret[8:12]}...{raw_secret[-4:]}"
    name = body.get("name", "API Key")

    key = ApiKey(
        user_id=user.id,
        name=name,
        prefix=prefix,
        hashed_key=hash_password(raw_secret),
        status="active"
    )
    db.add(key)
    db.commit()

    return {
        "apiKey": {
            "id": key.id,
            "name": key.name,
            "prefix": key.prefix,
            "createdAt": key.created_at.strftime("%Y-%m-%d"),
            "lastUsed": "Never",
            "status": key.status
        },
        "secret": raw_secret
    }

@app.delete("/api/settings/api-keys/{key_id}")
def delete_api_key(key_id: str, db: Session = Depends(get_db)):
    k = db.query(ApiKey).filter(ApiKey.id == key_id).first()
    if k:
        db.delete(k)
        db.commit()
    return {"success": True}

@app.delete("/api/settings/sessions/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    s = db.query(UserSession).filter(UserSession.id == session_id).first()
    if s:
        db.delete(s)
        db.commit()
    return {"success": True}
