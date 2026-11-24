import { DocumentItem, Citation, ChatMessage } from './types.js';

export function searchDocuments(documents: DocumentItem[], query: string): Array<{
  document: DocumentItem;
  snippet: string;
  matchScore: number;
  page: number;
}> {
  if (!query || query.trim() === '') {
    return [];
  }

  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const results: Array<{
    document: DocumentItem;
    snippet: string;
    matchScore: number;
    page: number;
  }> = [];

  for (const doc of documents) {
    const fullText = `${doc.title} ${doc.tags.join(' ')} ${doc.summary} ${doc.content}`;
    const lower = fullText.toLowerCase();

    let matchedTerms = 0;
    for (const term of terms) {
      if (lower.includes(term)) matchedTerms++;
    }

    if (matchedTerms > 0 || terms.length === 0) {
      const score = Math.min(0.99, Math.max(0.65, Number(((matchedTerms / Math.max(1, terms.length)) * 0.4 + 0.55).toFixed(2))));
      
      // Find snippet around matched term
      let snippet = doc.summary;
      for (const term of terms) {
        const idx = doc.content.toLowerCase().indexOf(term);
        if (idx !== -1) {
          const start = Math.max(0, idx - 60);
          const end = Math.min(doc.content.length, idx + term.length + 90);
          snippet = `...${doc.content.substring(start, end).replace(/\n/g, ' ')}...`;
          break;
        }
      }

      results.push({
        document: doc,
        snippet,
        matchScore: score,
        page: Math.floor(Math.random() * (doc.pageCount || 5)) + 1,
      });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export function answerDocumentQuery(
  documents: DocumentItem[],
  query: string,
  targetDocIds?: string[]
): ChatMessage {
  const activeDocs = targetDocIds && targetDocIds.length > 0
    ? documents.filter(d => targetDocIds.includes(d.id))
    : documents;

  const searchResults = searchDocuments(activeDocs, query);
  const citations: Citation[] = searchResults.slice(0, 3).map(r => ({
    documentId: r.document.id,
    documentTitle: r.document.title,
    page: r.page,
    snippet: r.snippet,
    matchScore: r.matchScore,
  }));

  const lowerQ = query.toLowerCase();
  let answer = '';
  const suggestedQuestions: string[] = [];

  if (lowerQ.includes('liability') || lowerQ.includes('cap') || lowerQ.includes('indemn')) {
    answer = `Based on the indexed legal agreements:
- In the **Standard 2025 MSA (Section 4)**, the aggregate liability cap is strictly limited to **$1,000,000** (or the preceding 12 months' fees).
- In the **Revised 2026 Draft MSA (Section 4)**, this limitation was increased to **$5,000,000**, and breaches relating to data confidentiality or willful misconduct are **uncapped**.`;
    suggestedQuestions.push('What are the uptime SLA differences?', 'Does the revised draft include EU SCCs?', 'What is the governing law?');
  } else if (lowerQ.includes('sla') || lowerQ.includes('uptime') || lowerQ.includes('availability')) {
    answer = `According to Section 2 of the Cloud Subscription Agreements:
- **Baseline Agreement**: Guarantees a Monthly Uptime Percentage of **99.9%** with 10% credit eligibility.
- **Revised Agreement**: Upgraded to **99.99%** mission-critical availability with tiered penalties (25% service credit below 99.99% and 50% credit below 99.5%).`;
    suggestedQuestions.push('What are the payment terms?', 'What is the vulnerability patch SLA?');
  } else if (lowerQ.includes('revenue') || lowerQ.includes('arr') || lowerQ.includes('financial') || lowerQ.includes('q3') || lowerQ.includes('margin')) {
    answer = `From the **Q3 FY2026 Financial Results Report**:
- **Annual Recurring Revenue (ARR)**: Closed at **$48.2 Million**, representing an **84% year-over-year expansion**.
- **Quarterly Revenue**: Totaled **$13.8 Million** (up 77% YoY).
- **GAAP Gross Margin**: Reached **78.4%** (+310 bps sequentially) driven by token quantization and GPU inference batching.
- **Net Revenue Retention (NRR)**: Stood at **132%** across enterprise cohorts.
- **Liquidity**: Cash reserves of **$92.5M** with **zero long-term debt** and $6.8M positive free cash flow.`;
    suggestedQuestions.push('What drove gross margin expansion?', 'What is the total enterprise customer count?');
  } else if (lowerQ.includes('soc') || lowerQ.includes('security') || lowerQ.includes('iso') || lowerQ.includes('hipaa') || lowerQ.includes('pii') || lowerQ.includes('encrypt')) {
    answer = `According to the **Enterprise Security & Governance Framework**:
1. **Zero LLM Training**: Customer proprietary documents are strictly isolated and never utilized for model training or parameter adjustments.
2. **Certifications**: SOC2 Type II certified by Schellman & Co, ISO 27001:2022, ISO 27701, and HIPAA compliance with BAAs.
3. **Encryption**: AES-256 for data at rest with optional Bring-Your-Own-Key (BYOK), and TLS 1.3 in transit.
4. **PII Masking**: Automated Named Entity Recognition redacts sensitive identifiers (SSNs, financial numbers) before vector embedding creation.`;
    suggestedQuestions.push('Can we choose EU data residency?', 'How are vector embeddings isolated?');
  } else if (lowerQ.includes('chunk') || lowerQ.includes('rag') || lowerQ.includes('vector') || lowerQ.includes('hnsw') || lowerQ.includes('retrieval')) {
    answer = `Per the **DocuMind Architecture RFC (RFC-089)**:
- **Layout-Aware Semantic Chunking**: Chunks are split dynamically on semantic headings and sections rather than arbitrary token counts, targeting 512 tokens with 50-token overlap.
- **Hybrid Search**: Dense 1536-dimensional embeddings (indexed via HNSW in pgvector) combined with Sparse BM25 keyword matching using Reciprocal Rank Fusion (RRF).
- **Reranking**: A cross-encoder reranks the top 30 passages, supplying the top 5 highest-scoring contexts to the synthesis prompt.
- **Latency**: Time-to-First-Token (TTFT) is guaranteed under 180ms with sub-350ms end-to-end response times.`;
    suggestedQuestions.push('What embedding dimensions are used?', 'How are citation bounding boxes calculated?');
  } else if (activeDocs.length > 0) {
    const first = activeDocs[0];
    answer = `Based on analysis of "${first.title}":
${first.summary}

**Key takeaways from the document:**
${first.keyPoints.map(p => `• ${p}`).join('\n')}`;
    suggestedQuestions.push(`Explain the primary risks in ${first.title}`, `Extract all dates and people mentioned`);
  } else {
    answer = `I analyzed your query against all indexed documents. While no single exact clause was matched, DocuMind maintains full semantic indexing across your Legal, Financial, Security, and Engineering collections. Please specify a document or refine your query with key legal or financial terms.`;
    suggestedQuestions.push('Summarize Q3 financial results', 'Compare MSA liability terms', 'Explain SOC2 security controls');
  }

  return {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content: answer,
    timestamp: new Date().toISOString(),
    citations: citations.length > 0 ? citations : undefined,
    suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : undefined,
  };
}
