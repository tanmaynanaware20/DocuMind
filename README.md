# DocuMind

> **Enterprise Document Intelligence & Knowledge Management Platform**  
> *"Your documents, finally under control."*

DocuMind is a production-grade SaaS application designed to organize, index, search, compare, understand, and extract structured insights from large collections of enterprise documents with zero-hallucination source citations.

---

## Architecture Overview

DocuMind follows a clean, decoupled architecture:

```
┌────────────────────────────────────────────────────────┐
│                   React 19 SPA Client                  │
│       Vite • TypeScript • Tailwind CSS • Lucide        │
│       Executive Simulator • Document Workspace        │
└───────────────────────────┬────────────────────────────┘
                            │ Reverse Proxy /api
┌───────────────────────────▼────────────────────────────┐
│              FastAPI Python 3.13 Backend Engine        │
│  ┌───────────────────────┐  ┌────────────────────────┐ │
│  │ Multi-Format Parser   │  │ Hybrid Dense + BM25    │ │
│  │ PyMuPDF (PDF)         │  │ RAG Vector Engine      │ │
│  │ python-docx (DOCX)    │  │ 128-dim Cosine Sim     │ │
│  │ pandas/openpyxl (XLSX)│  │ Reciprocal Rank Fusion │ │
│  └───────────────────────┘  └────────────────────────┘ │
│  ┌───────────────────────┐  ┌────────────────────────┐ │
│  │ Pydantic Structured   │  │ ReportLab PDF Audit    │ │
│  │ Extraction Service    │  │ Report Generator       │ │
│  └───────────────────────┘  └────────────────────────┘ │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│      SQLAlchemy ORM + SQLite (Dev) / PostgreSQL (Prod) │
│           Tamper-Evident Audit Trails & Sessions       │
└────────────────────────────────────────────────────────┘
```

---

## Core Capabilities

1. **Multi-Format Document Ingestion**:
   - Layout-aware extraction across PDF (`PyMuPDF`), Word (`python-docx`), Excel/CSV (`pandas`, `openpyxl`), and TXT.
   - Page-preserving semantic chunker retaining strict page boundaries for citations.

2. **Neural Hybrid RAG & Exact Page Citations**:
   - Hybrid retrieval combining dense vector similarity with BM25 keyword matching via Reciprocal Rank Fusion (RRF).
   - Verifiable citation cards showing exact page numbers, confidence match scores, and verbatim text snippets.

3. **Multi-Session Document Conversations**:
   - Persistent conversation threads scoped to individual documents, collections, or the entire enterprise portfolio.
   - Interactive follow-up question chips and citation previews.

4. **Document Comparison & Redline Diff Engine**:
   - Automated contract comparison between versions (e.g. MSA v1.0 vs v2.1).
   - Side-by-side redline diffs tracking additions, deletions, modifications, and executive risk flags.

5. **Pydantic Structured Information Extraction**:
   - Entity extraction into validated Pydantic models: Signatories, Organizations, Monetary Values & Liability Caps, Deadlines, and Critical Clauses.
   - Exportable structured JSON with zero fabricated fields.

6. **Executive Intelligence & ReportLab PDF Generation**:
   - One-click generation and download of professional PDF audit reports formatted with ReportLab.
   - Comprehensive system activity audit trails with CSV and JSON export.

7. **Enterprise Security & Zero-Retention Compliance**:
   - Bcrypt password hashing and JWT authentication.
   - RBAC user data isolation, API key generation, active session revocation, and 2FA support.
   - Strict zero-data-retention and zero-training guarantee.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v7.
- **Backend**: Python 3.13 / FastAPI, Pydantic v2, SQLAlchemy, Alembic, PyJWT, Bcrypt.
- **Document Processing**: PyMuPDF (`fitz`), `python-docx`, `pandas`, `openpyxl`.
- **Retrieval & RAG**: 128-dim deterministic vector embeddings, Cosine similarity, BM25 scoring, Hybrid RRF.
- **Reporting**: ReportLab PDF generator.
- **Database**: SQLite (local development), PostgreSQL with `pgvector` (production Docker).
- **Testing**: Pytest, FastAPI TestClient, HTTPX.
- **Deployment**: Docker, Docker Compose, Nginx.

---

## Getting Started

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ (Node 20+ recommended)
- Git

### 2. Clone Repository
```bash
git clone https://github.com/your-username/DocuMind.git
cd DocuMind
```

### 3. Environment Setup
```bash
cp .env.example .env
```

### 4. Backend Startup
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start FastAPI backend engine on port 8000
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend initializes the database and seeds demo documents, collections, and audit logs automatically.  
API documentation is available at `http://localhost:8000/docs`.

### 5. Frontend Startup
```bash
cd client
npm install
npm run dev
```
The application will launch on `http://localhost:5173`.  
Vite automatically proxies `/api` requests to `http://localhost:8000`.

---

## Demo Credentials

You can sign in with the pre-seeded enterprise account or click **"One-Click Demo Login"** on the login screen:

- **Email**: `alex.morgan@documind.io`
- **Password**: `demo12345`

---

## Running the Automated Test Suite

The backend contains a test suite covering authentication, file extraction, semantic chunking, hybrid RAG, structured extraction, comparisons, PDF reporting, and API endpoints:

```bash
# Run all tests
python -m pytest backend/tests -v
```

Expected result:
```
======================= 21 passed in 4.47s =======================
```

---

## Production Deployment with Docker Compose

To orchestrate the full stack (FastAPI backend, React frontend with Nginx, PostgreSQL with pgvector, and Redis):

```bash
docker-compose up --build -d
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`
- **PostgreSQL Database**: `localhost:5432`
- **Redis Cache**: `localhost:6379`

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check and indexing statistics |
| `POST` | `/api/auth/login` | User login and JWT token issuance |
| `GET` | `/api/auth/me` | Current authenticated user profile |
| `GET` | `/api/documents` | List user documents with filters & sorting |
| `POST` | `/api/documents/upload` | Upload & extract document (PDF, DOCX, XLSX, TXT) |
| `POST` | `/api/documents/{id}/extract-structured` | Run Pydantic structured entity extraction |
| `GET` | `/api/collections` | List workspace collections |
| `GET` | `/api/chat/conversations` | List conversation threads |
| `POST` | `/api/chat/query` | Grounded hybrid RAG question-answering |
| `GET` | `/api/search` | Search documents (keyword, semantic, hybrid) |
| `POST` | `/api/compare` | Compare two documents with redline diff |
| `GET` | `/api/reports/pdf` | Download ReportLab executive audit PDF |
| `GET` | `/api/reports/export?format=csv` | Export immutable activity audit trail |

| `GET` | `/api/health/live` | Kubernetes container liveness probe |
| `GET` | `/api/health/ready` | Kubernetes deep database readiness probe |
| `GET` | `/api/metrics` | Prometheus telemetry and latency percentiles |

---

## Architecture & Production Documentation

- **[Security & Compliance Matrix](file:///d:/Project/DocuMind/docs/SECURITY_AUDIT.md)**: SOC2 Type II, HIPAA ePHI, GDPR, and OWASP API Top 10 mitigations.
- **[Production Deployment Runbook](file:///d:/Project/DocuMind/docs/DEPLOYMENT_RUNBOOK.md)**: Docker Compose, Kubernetes Helm charts, and disaster recovery.
- **[19-Day Engineering Roadmap](file:///d:/Project/DocuMind/DEVELOPMENT_PLAN.md)**: Continuous, production-grade daily enhancements.

---

## License

Enterprise Proprietary & Confidential. Built for DocuMind Platform.
