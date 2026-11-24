import { DocumentItem, CollectionItem, UserProfile, ActivityLogItem, ChatMessage, ComparisonResult, DiffItem } from './types.js';

export class DataStore {
  documents: DocumentItem[] = [];
  collections: CollectionItem[] = [];
  user: UserProfile;
  activityLogs: ActivityLogItem[] = [];
  chatHistory: ChatMessage[] = [];

  constructor() {
    this.user = {
      id: 'usr_01',
      name: 'Alex Morgan',
      email: 'alex.morgan@documind.io',
      role: 'Head of Document Intelligence',
      department: 'Legal Operations & AI Strategy',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      organization: 'DocuMind Global Enterprise',
      plan: 'Enterprise',
      twoFactorEnabled: true,
      sessions: [
        {
          id: 'sess_1',
          device: 'Chrome on Windows 11 (Current)',
          ip: '192.168.1.104',
          location: 'San Francisco, CA, US',
          lastActive: 'Just now',
          isCurrent: true,
        },
        {
          id: 'sess_2',
          device: 'Safari on iPhone 16 Pro',
          ip: '10.0.0.45',
          location: 'San Jose, CA, US',
          lastActive: '2 hours ago',
          isCurrent: false,
        },
        {
          id: 'sess_3',
          device: 'DocuMind Desktop App (macOS)',
          ip: '192.168.1.120',
          location: 'San Francisco, CA, US',
          lastActive: 'Yesterday at 4:15 PM',
          isCurrent: false,
        }
      ],
      apiKeys: [
        {
          id: 'key_1',
          name: 'Production Ingestion Pipeline',
          prefix: 'dm_live_89f3...b2c9',
          createdAt: '2026-08-15',
          lastUsed: '10 minutes ago',
          status: 'active',
        },
        {
          id: 'key_2',
          name: 'Staging RAG Bot Service',
          prefix: 'dm_test_41a0...98fa',
          createdAt: '2026-10-01',
          lastUsed: 'Yesterday',
          status: 'active',
        }
      ],
      preferences: {
        theme: 'system',
        aiModel: 'Gemini 1.5 Pro (Multimodal Document Engine)',
        ocrEngine: 'DocuMind Neural OCR v3',
        autoSummarize: true,
        emailNotifications: true,
        citationConfidenceThreshold: 0.85,
      }
    };

    this.initSeedData();
  }

  private initSeedData() {
    this.collections = [
      {
        id: 'col_legal',
        name: 'Legal & Contracts',
        description: 'Vendor MSAs, terms of service, NDAs, and licensing frameworks.',
        color: '#4f46e5', // indigo
        icon: 'Scale',
        documentIds: ['doc_msa_v1', 'doc_msa_v2'],
        createdAt: '2026-09-01T10:00:00Z',
        isPrivate: false,
      },
      {
        id: 'col_finance',
        name: 'Financial Disclosures',
        description: 'Quarterly 10-Q reports, balance sheets, audited statements, and investor decks.',
        color: '#059669', // emerald
        icon: 'TrendingUp',
        documentIds: ['doc_q3_fin'],
        createdAt: '2026-10-15T14:30:00Z',
        isPrivate: false,
      },
      {
        id: 'col_security',
        name: 'Security & Compliance',
        description: 'SOC2 Type II audits, ISO 27001 certifications, and AI governance policies.',
        color: '#d97706', // amber
        icon: 'ShieldCheck',
        documentIds: ['doc_sec_gov'],
        createdAt: '2026-09-20T09:15:00Z',
        isPrivate: true,
      },
      {
        id: 'col_tech',
        name: 'Architecture & RFCs',
        description: 'System design specifications, chunking guidelines, and indexing pipelines.',
        color: '#7c3aed', // violet
        icon: 'Cpu',
        documentIds: ['doc_eng_rfc'],
        createdAt: '2026-11-01T11:45:00Z',
        isPrivate: false,
      }
    ];

    this.documents = [
      {
        id: 'doc_msa_v1',
        title: 'Master Cloud Subscription Agreement (Standard 2025)',
        originalName: 'DocuMind_MSA_Enterprise_v1.0.pdf',
        fileType: 'pdf',
        fileSize: 1845200, // 1.8 MB
        uploadDate: '2026-09-12T08:30:00Z',
        status: 'indexed',
        collections: ['col_legal'],
        tags: ['Contract', 'MSA', 'Legal', 'Enterprise'],
        pageCount: 18,
        wordCount: 8450,
        summary: 'Standard Enterprise Master Cloud Subscription Agreement establishing licensing, service uptime of 99.9%, mutual confidentiality, standard IP indemnification, and liability aggregate cap of $1,000,000.',
        keyPoints: [
          'Service Level Agreement (SLA) commitment guarantees 99.9% monthly uptime availability.',
          'Limitation of Liability is capped at $1,000,000 or 12 months subscription fees paid.',
          'Data protection adheres to standard CCPA and GDPR processor terms with standard US hosting.',
          'Payment terms require net-30 days from invoice dispatch.',
          'Governing law is set to the State of Delaware, exclusive of conflict of law principles.'
        ],
        entities: {
          people: ['Alex Morgan (Signatory)', 'Rachel Vance (General Counsel)'],
          organizations: ['DocuMind AI Inc.', 'Enterprise Corp LLC', 'Delaware Chancery Court'],
          dates: ['September 12, 2025', 'Net 30 Days', 'Annual Renewal'],
          terms: ['Indemnity', 'SLA 99.9%', 'Liability Cap $1M', 'Delaware Law']
        },
        versions: [
          {
            version: 1,
            updatedAt: '2026-09-12T08:30:00Z',
            summary: 'Initial executed baseline version.',
            author: 'Rachel Vance'
          }
        ],
        content: `MASTER CLOUD SUBSCRIPTION AGREEMENT (VERSION 1.0)
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
This Agreement is governed by the laws of the State of Delaware without reference to conflict of law rules.`,
        starred: true,
      },
      {
        id: 'doc_msa_v2',
        title: 'Master Cloud Subscription Agreement (Revised Draft 2026)',
        originalName: 'DocuMind_MSA_Enterprise_v2.1_Draft.pdf',
        fileType: 'pdf',
        fileSize: 2120400, // 2.1 MB
        uploadDate: '2026-11-05T15:20:00Z',
        status: 'indexed',
        collections: ['col_legal'],
        tags: ['Contract', 'MSA', 'Revised', 'EU-Compliance'],
        pageCount: 22,
        wordCount: 10200,
        summary: 'Revised Enterprise MSA with updated 99.99% high-availability SLA tier, expanded aggregate liability limit of $5,000,000, multi-region EU GDPR Standard Contractual Clauses (SCCs), and enhanced security remediation penalties.',
        keyPoints: [
          'Upgraded SLA commitment from 99.9% to 99.99% high-availability mission-critical tier.',
          'Increased aggregate liability cap from $1,000,000 to $5,000,000 for data breach indemnification.',
          'Added European Data Protection Addendum including 2021 EU Standard Contractual Clauses (Module 2).',
          'Introduced dedicated security vulnerability remediation timeline (Critical fixes within 24 hours).',
          'Updated payment terms to Net 45 days with automated payment gateway options.'
        ],
        entities: {
          people: ['Alex Morgan', 'Rachel Vance', 'David Chen (CISO)'],
          organizations: ['DocuMind AI Inc.', 'Enterprise Corp LLC', 'EU Data Protection Board'],
          dates: ['November 5, 2026', 'Net 45 Days', '24-hour SLA'],
          terms: ['SLA 99.99%', 'Liability Cap $5M', 'EU SCCs', 'Multi-Region Frankfurt']
        },
        versions: [
          {
            version: 1,
            updatedAt: '2026-09-12T08:30:00Z',
            summary: 'Initial executed baseline version.',
            author: 'Rachel Vance'
          },
          {
            version: 2,
            updatedAt: '2026-11-05T15:20:00Z',
            summary: 'Revised draft with $5M liability cap, 99.99% SLA, and EU data residency.',
            author: 'Alex Morgan'
          }
        ],
        content: `MASTER CLOUD SUBSCRIPTION AGREEMENT (VERSION 2.1 REVISED)
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
This Agreement is governed by Delaware law, with mandatory binding arbitration under AAA commercial arbitration rules in New York.`,
        starred: true,
      },
      {
        id: 'doc_q3_fin',
        title: 'Q3 FY2026 Financial Results & Operating Metrics',
        originalName: 'DocuMind_Q3_FY2026_Investor_Report.pdf',
        fileType: 'pdf',
        fileSize: 3450000, // 3.45 MB
        uploadDate: '2026-10-28T16:45:00Z',
        status: 'indexed',
        collections: ['col_finance'],
        tags: ['Finance', 'Earnings', 'Q3', 'Metrics', 'Revenue'],
        pageCount: 36,
        wordCount: 14200,
        summary: 'Quarterly financial report presenting $48.2M ARR (84% year-over-year expansion), gross margin of 78.4%, net revenue retention (NRR) of 132%, and positive operating cash flow of $6.8M.',
        keyPoints: [
          'Annual Recurring Revenue (ARR) reached $48.2 Million, up 84% year-over-year.',
          'Gross Margin improved to 78.4% due to automated GPU token batching optimizations.',
          'Net Revenue Retention (NRR) achieved 132% among Fortune 500 enterprise customers.',
          'Total customer count expanded to 840 enterprise accounts with 120 new wins in Q3.',
          'Free Cash Flow stood at $6.8M with $92.5M in cash reserves and zero long-term debt.'
        ],
        entities: {
          people: ['Sarah Lin (Chief Financial Officer)', 'Marcus Reed (CEO)'],
          organizations: ['DocuMind AI Inc.', 'Morgan Stanley Equity Research', 'Goldman Sachs'],
          dates: ['September 30, 2026', 'Q3 FY2026', 'November 15, 2026'],
          terms: ['ARR $48.2M', 'Gross Margin 78.4%', 'NRR 132%', 'Cash Flow $6.8M']
        },
        versions: [
          {
            version: 1,
            updatedAt: '2026-10-28T16:45:00Z',
            summary: 'Audited Q3 Financial Results.',
            author: 'Sarah Lin'
          }
        ],
        content: `EXECUTIVE SUMMARY: Q3 FY2026 FINANCIAL AND OPERATIONAL HIGHLIGHTS
DocuMind delivered another record quarter, demonstrating strong operating leverage across enterprise AI workflow adoption.
Financial Metrics Overview:
1. Total Revenue: $13.8M for the quarter, compared to $7.8M in Q3 FY2025 (77% YoY growth).
2. Annual Recurring Revenue (ARR): Exited Q3 at $48.2M, driven by 84% YoY increase.
3. Gross Profit & Margin: GAAP Gross Margin was 78.4%, representing 310 bps expansion sequentially. Infrastructure optimizations and GPU quantization reduced inference costs per query by 42%.
4. Net Revenue Retention: NRR closed at 132%, highlighting continued expansion within legal and financial customer cohorts.
5. Operating Income: GAAP operating income turned positive at $2.1M (15.2% operating margin).
Balance Sheet and Liquidity:
DocuMind maintains a fortress balance sheet with $92.5M in cash, cash equivalents, and short-term US Treasuries. The company carries zero debt. Operating cash flow for the nine months ended September 30, 2026 reached $14.2M.`,
        starred: false,
      },
      {
        id: 'doc_sec_gov',
        title: 'Enterprise AI Governance, SOC2 & Security Framework',
        originalName: 'DocuMind_Security_Whitepaper_2026.pdf',
        fileType: 'pdf',
        fileSize: 2680000,
        uploadDate: '2026-09-22T11:10:00Z',
        status: 'indexed',
        collections: ['col_security'],
        tags: ['Security', 'SOC2', 'ISO27001', 'Privacy', 'Compliance'],
        pageCount: 28,
        wordCount: 11800,
        summary: 'Comprehensive security architecture document detailing zero-retention LLM guarantees, AES-256 and TLS 1.3 encryption, SOC2 Type II compliance, role-based access control (RBAC), and automated PII masking.',
        keyPoints: [
          'Zero LLM Training Guarantee: Customer proprietary documents are never used for model training or weight adjustments.',
          'SOC2 Type II certified by Schellman & Company, alongside ISO 27001, ISO 27701, and HIPAA compliance.',
          'Data encryption: All data at rest encrypted using AES-256 with customer-managed KMS keys; TLS 1.3 in transit.',
          'Automated PII scrubbing engine redacts SSNs, credit cards, and patient identifiers prior to embedding generation.',
          'Granular RBAC with audit trail logging every document view, search query, and AI generation.'
        ],
        entities: {
          people: ['David Chen (CISO)', 'Elena Rostova (Compliance Director)'],
          organizations: ['Schellman & Co', 'DocuMind AI Inc.', 'AICPA', 'BSI Group'],
          dates: ['September 2026', 'Annual Audit Cycle', 'Continuous Monitoring'],
          terms: ['SOC2 Type II', 'AES-256', 'PII Masking', 'Zero Retention Policy']
        },
        versions: [
          {
            version: 1,
            updatedAt: '2026-09-22T11:10:00Z',
            summary: '2026 Annual Security Framework release.',
            author: 'David Chen'
          }
        ],
        content: `DOCUMIND ENTERPRISE SECURITY & AI GOVERNANCE WHITE PAPER
Section 1. Core Principles of Responsible Enterprise AI
DocuMind operates under a strict Zero-Data-Retention and Zero-Training policy. Customer documents, vectorized embeddings, and user prompt completions are strictly isolated within Customer dedicated tenant boundaries. Customer data is NEVER used to train foundational AI models.
Section 2. Encryption and Key Management
All storage volumes utilize AES-256 hardware-accelerated encryption. Customers may provide their own encryption keys via AWS KMS or Azure Key Vault (Bring Your Own Key - BYOK). All network traffic uses TLS 1.3 with HSTS enabled.
Section 3. Auditing and Compliance Certifications
1. SOC 2 Type II: Annual audit completed covering Security, Availability, and Confidentiality trust principles.
2. ISO/IEC 27001:2022 and ISO/IEC 27701 (Privacy Information Management).
3. HIPAA Security Rule compliance with signed Business Associate Agreements (BAAs).
Section 4. Automated Redaction & Sensitive Data Loss Prevention
Prior to vectorization, the ingestion pipeline runs automated Named Entity Recognition (NER) to mask sensitive identifiers, including Social Security Numbers, banking account digits, and personal healthcare data.`,
        starred: true,
      },
      {
        id: 'doc_eng_rfc',
        title: 'DocuMind Architecture RFC: High-Scale RAG Pipeline',
        originalName: 'DocuMind_RFC_Vector_Pipeline_v3.docx',
        fileType: 'docx',
        fileSize: 1420000,
        uploadDate: '2026-11-02T13:00:00Z',
        status: 'indexed',
        collections: ['col_tech'],
        tags: ['Architecture', 'Engineering', 'RAG', 'VectorDB', 'HNSW'],
        pageCount: 16,
        wordCount: 7500,
        summary: 'Engineering specification outlining the multi-stage RAG ingestion pipeline: PDF layout parsing, semantic chunking (512 tokens with 10% overlap), hybrid HNSW vector search with BM25 reranking, and sub-350ms p95 latency.',
        keyPoints: [
          'Semantic chunking dynamically detects headers, tables, and paragraphs rather than arbitrary fixed token counts.',
          'Hybrid retrieval combines Dense Vector search (HNSW index) with Sparse BM25 keyword matching for 96.4% recall.',
          'Cross-encoder reranking stage filters top 50 candidates down to top 5 context snippets for LLM synthesis.',
          'Streaming response architecture achieves Time-to-First-Token (TTFT) under 180 milliseconds.',
          'Automated Citation Generator matches answer spans to source document bounding boxes and page numbers.'
        ],
        entities: {
          people: ['Vikram Patel (Lead Architect)', 'Maya Lin (Senior ML Engineer)'],
          organizations: ['DocuMind AI Engineering Team', 'PostgreSQL Community (pgvector)'],
          dates: ['November 2026', 'Q4 Deployment', 'Sprint 42'],
          terms: ['Hybrid Retrieval', 'BM25 + HNSW', 'Cross-Encoder Reranking', 'TTFT < 180ms']
        },
        versions: [
          {
            version: 1,
            updatedAt: '2026-11-02T13:00:00Z',
            summary: 'RFC approved for production rollout in v3.2.',
            author: 'Vikram Patel'
          }
        ],
        content: `RFC-089: DISTRIBUTED MULTI-MODAL DOCUMENT RETRIEVAL PIPELINE
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
Top 30 passages are passed to a lightweight cross-encoder which assigns calibrated relevance scores. Top 5 passages above threshold 0.75 are injected into the LLM synthesis prompt along with markdown citations.`,
        starred: false,
      }
    ];

    this.activityLogs = [
      {
        id: 'act_01',
        timestamp: '2026-11-24T10:45:00Z',
        userId: 'usr_01',
        userName: 'Alex Morgan',
        userAvatar: this.user.avatar,
        action: 'Compared documents',
        targetType: 'comparison',
        targetTitle: 'DocuMind_MSA_Enterprise_v1 vs v2.1_Draft',
        status: 'success',
        details: 'Generated semantic difference report and identified 3 high-risk liability clause modifications.'
      },
      {
        id: 'act_02',
        timestamp: '2026-11-24T09:12:00Z',
        userId: 'usr_01',
        userName: 'Alex Morgan',
        userAvatar: this.user.avatar,
        action: 'AI Question & Answer query',
        targetType: 'document',
        targetTitle: 'Q3 FY2026 Investor Report',
        status: 'info',
        details: 'Asked: "What was the ARR growth rate and gross margin for Q3?" with 2 verified citations.'
      },
      {
        id: 'act_03',
        timestamp: '2026-11-23T16:30:00Z',
        userId: 'usr_01',
        userName: 'Alex Morgan',
        userAvatar: this.user.avatar,
        action: 'Document uploaded & indexed',
        targetType: 'document',
        targetTitle: 'DocuMind_MSA_Enterprise_v2.1_Draft.pdf',
        status: 'success',
        details: '22 pages parsed, 10,200 words indexed, 44 semantic vector embeddings created.'
      },
      {
        id: 'act_04',
        timestamp: '2026-11-23T14:15:00Z',
        userId: 'usr_01',
        userName: 'Alex Morgan',
        userAvatar: this.user.avatar,
        action: 'Collection updated',
        targetType: 'collection',
        targetTitle: 'Legal & Contracts',
        status: 'info',
        details: 'Added DocuMind_MSA_Enterprise_v2.1_Draft to Legal & Contracts collection.'
      },
      {
        id: 'act_05',
        timestamp: '2026-11-22T11:00:00Z',
        userId: 'usr_01',
        userName: 'Alex Morgan',
        userAvatar: this.user.avatar,
        action: 'Exported Intelligence Report',
        targetType: 'export',
        targetTitle: 'Quarterly Executive Document Audit (PDF)',
        status: 'success',
        details: 'Exported summary of 5 active collections and 14 analyzed contracts.'
      },
      {
        id: 'act_06',
        timestamp: '2026-11-21T08:20:00Z',
        userId: 'usr_01',
        userName: 'Alex Morgan',
        userAvatar: this.user.avatar,
        action: 'Security settings updated',
        targetType: 'settings',
        targetTitle: 'Two-Factor Authentication',
        status: 'success',
        details: 'Enforced hardware security key and TOTP authenticator requirements.'
      },
      {
        id: 'act_07',
        timestamp: '2026-11-20T17:40:00Z',
        userId: 'usr_01',
        userName: 'Alex Morgan',
        userAvatar: this.user.avatar,
        action: 'Generated API Key',
        targetType: 'settings',
        targetTitle: 'Production Ingestion Pipeline Key',
        status: 'warning',
        details: 'Generated new secret token with read-write document scopes.'
      }
    ];

    this.chatHistory = [
      {
        id: 'msg_01',
        role: 'user',
        content: 'What is the limitation of liability and uptime guarantee in the Master Subscription Agreement v1 versus v2?',
        timestamp: '2026-11-24T09:10:00Z',
      },
      {
        id: 'msg_02',
        role: 'assistant',
        content: `Based on an analysis of both contract versions in your Legal collection, here are the key differences:

1. **Limitation of Liability**:
   - In **Version 1.0 (Section 4)**, the aggregate liability is strictly capped at **$1,000,000** or 12 months fees paid.
   - In **Version 2.1 Revised (Section 4)**, the aggregate liability cap has been increased to **$5,000,000**. Furthermore, liability for willful misconduct or confidentiality/data breach is **uncapped**.

2. **Service Level Agreement (Uptime)**:
   - In **Version 1.0 (Section 2)**, DocuMind guarantees a **99.9%** monthly uptime commitment with standard 10% service credits.
   - In **Version 2.1 (Section 2)**, the uptime tier is upgraded to **99.99%** mission-critical availability, featuring tiered service credits (25% credit below 99.99%, and 50% credit below 99.5%).`,
        timestamp: '2026-11-24T09:10:05Z',
        citations: [
          {
            documentId: 'doc_msa_v1',
            documentTitle: 'Master Cloud Subscription Agreement (Standard 2025)',
            page: 4,
            snippet: 'NEITHER PARTY\'S TOTAL AGGREGATE LIABILITY ARISING OUT OF THIS AGREEMENT SHALL EXCEED ONE MILLION US DOLLARS ($1,000,000)...',
            matchScore: 0.96
          },
          {
            documentId: 'doc_msa_v2',
            documentTitle: 'Master Cloud Subscription Agreement (Revised Draft 2026)',
            page: 5,
            snippet: 'NEITHER PARTY\'S TOTAL AGGREGATE LIABILITY SHALL EXCEED FIVE MILLION US DOLLARS ($5,000,000). For willful misconduct or data confidentiality breach, liability is uncapped.',
            matchScore: 0.98
          },
          {
            documentId: 'doc_msa_v2',
            documentTitle: 'Master Cloud Subscription Agreement (Revised Draft 2026)',
            page: 2,
            snippet: 'DocuMind commits to achieving a Monthly Uptime Percentage of at least ninety-nine point ninety-nine percent (99.99%)...',
            matchScore: 0.94
          }
        ],
        suggestedQuestions: [
          'What are the payment terms in the revised agreement?',
          'Does v2.1 include EU GDPR Standard Contractual Clauses?',
          'What is the governing law in both agreements?'
        ]
      }
    ];
  }

  // Helper methods
  getDocument(id: string) {
    return this.documents.find(d => d.id === id);
  }

  logActivity(action: string, targetType: ActivityLogItem['targetType'], targetTitle: string, status: ActivityLogItem['status'] = 'success', details?: string) {
    const item: ActivityLogItem = {
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: this.user.id,
      userName: this.user.name,
      userAvatar: this.user.avatar,
      action,
      targetType,
      targetTitle,
      status,
      details,
    };
    this.activityLogs.unshift(item);
    return item;
  }
}

export const store = new DataStore();
