# DocuMind Enterprise Security Audit & Compliance Matrix

This document defines the security architecture, threat model mitigations, and compliance verification standards enforced across the DocuMind SaaS platform.

---

## 1. Regulatory Compliance Frameworks

| Standard | Scope | Implementation Mechanism | Verification Test |
|---|---|---|---|
| **SOC 2 Type II** | Confidentiality, Availability, Integrity | Encrypt-then-MAC payload encryption, SHA-256 immutable audit chain | `test_audit_chain.py`, `test_crypto_vault.py` |
| **HIPAA Security Rule** | ePHI Protection & Access Controls | Automated PII scanner masking SSNs, MRNs, and medical record numbers | `test_pii_sanitizer.py` |
| **GDPR (EU 2016/679)** | Right to erasure, Data minimization, PII masking | Regex & entropy PII redaction pipeline prior to vector storage | `test_pii_sanitizer.py` |
| **ISO/IEC 27001:2022** | Cryptographic controls & Access Management | Multi-tenant RBAC scoping, PBKDF2-HMAC-SHA256 key derivation | `test_tenant_manager.py` |

---

## 2. OWASP API Security Top 10 (2023) Mitigations

- **API1:2023 Broken Object Level Authorization (BOLA)**:
  - Enforced via `TenantManager.enforce_tenant_scope()` injecting mandatory `organization_id` filters into every SQLAlchemy query.
- **API2:2023 Broken Authentication**:
  - Implemented with Argon2 / bcrypt password hashing, short-lived JWT access tokens (15m), and constant-time token comparison.
- **API3:2023 Broken Object Property Level Authorization**:
  - Pydantic V2 schemas strictly filter out sensitive internal columns during JSON serialization.
- **API4:2023 Unrestricted Resource Consumption**:
  - Sliding window in-memory rate limiting middleware enforcing 120 req/min general and 30 req/min for LLM/RAG generation.
- **API5:2023 Broken Function Level Authorization (BFLA)**:
  - Explicit role checks (`Role.ADMIN`, `Role.COMPLIANCE_OFFICER`, `Role.MEMBER`) on sensitive endpoints.
- **API7:2023 Server-Side Request Forgery (SSRF)**:
  - Document ingestion restricted to internal file byte buffers; external URL fetching is strictly disallowed without sandboxing.
- **API8:2023 Security Misconfiguration**:
  - Standardized RFC-7807 problem details error responses with zero stack trace leakage to unauthenticated clients.

---

## 3. Cryptographic Key Management

- **Data at Rest**:
  - Master keys stored via `DOCUMIND_CRYPTO_KEY` environment variable.
  - Per-tenant key derivation using 50,000 PBKDF2 iterations with unique 16-byte random salts.
  - Encrypt-then-MAC (EtM) counter mode with HMAC-SHA256 tags.
- **Data in Transit**:
  - TLS 1.3 mandated for all reverse proxy ingresses (Nginx / Cloudflare).
  - Strict Transport Security (HSTS) header `max-age=31536000; includeSubDomains; preload`.
