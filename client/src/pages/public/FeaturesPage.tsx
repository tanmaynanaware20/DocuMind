import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Search,
  GitCompare,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Database,
  Cpu,
  Lock,
  Layers,
  Code
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <section className="pt-16 pb-20 border-b border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="primary" className="mb-3">DocuMind Technology Core</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Next-Generation Document Intelligence Architecture
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Explore the multi-modal neural layout parser, hybrid retrieval pipeline, and verifiable citation engine that powers DocuMind.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/app">
              <Button size="lg" icon={<Sparkles className="w-4 h-4" />}>
                Test in Live Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Deep-Dive 1: Neural Layout OCR */}
      <section className="py-20 border-b border-slate-100 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              1. Multi-Modal Layout-Aware Parsing
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Standard OCR collapses tables, two-column PDF sections, and financial charts into scrambled unreadable strings. DocuMind’s vision-augmented parser reconstructs document hierarchy:
            </p>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Preserves table cell relationships and numerical accounting alignments.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Automatically links headers, subclauses, footnotes, and appendices.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Supports scanned images, watermarked PDF agreements, and skewed orientation.</span>
              </li>
            </ul>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span>// parser.extract_structure()</span>
              <span className="text-emerald-400">99.8% precision</span>
            </div>
            <div className="text-slate-300">
              &gt; Ingesting: DocuMind_MSA_Enterprise_v2.1.pdf<br />
              &gt; Detected 22 pages, 14 contractual sections, 3 schedule tables<br />
              &gt; Chunking strategy: Semantic Layout-Bounded (Target: 512 tokens)<br />
              &gt; Generated 44 high-dimensional embeddings in 142ms
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep-Dive 2: Hybrid RAG & Exact Citations */}
      <section className="py-20 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Search className="w-4 h-4" />
              <span>Hybrid Reciprocal Rank Fusion (RRF)</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                <strong>Dense Vector (HNSW):</strong> Captures semantic meaning ("liability threshold" matches "maximum aggregate monetary exposure").
              </div>
              <div className="p-2.5 rounded-lg bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900">
                <strong>Sparse BM25:</strong> Captures exact contract numbers, clause references ("Section 4.1.b"), and financial metrics ("$48.2M ARR").
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                <strong>Cross-Encoder Reranker:</strong> Calibrates top passages, eliminating irrelevant context before LLM prompt injection.
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              2. Hybrid Retrieval with Verified Citations
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Generic chatbots guess and hallucinate. DocuMind anchors every single generated statement to exact document coordinates:
            </p>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Exact page number, clause section, and highlighted snippet bounding boxes.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>One-click jump directly to the target page inside the document preview viewer.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Sub-350ms end-to-end response times with streaming output.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Deep-Dive 3: Contract Comparison & Redline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GitCompare className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              3. Automated Clause Redlining & Diff Engine
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Comparing revised drafts of a 50-page vendor contract used to take days of lawyer billable hours. DocuMind automates the process:
            </p>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Visual color-coded additions (+green), deletions (-red), and amended clauses (~amber).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>AI Risk Assessment: flags high-stakes shifts in indemnification, warranties, and jurisdiction.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Export redline audit reports directly to PDF or CSV for executive briefings.</span>
              </li>
            </ul>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Executive Change Brief</span>
              <Badge variant="warning" size="sm">Risk: Elevated</Badge>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200">
                • <strong>Liability Cap:</strong> Increased from $1M to $5M; breach uncapped.
              </div>
              <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200">
                • <strong>Uptime Guarantee:</strong> Increased from 99.9% to 99.99% high-availability tier.
              </div>
              <div className="p-2 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200">
                • <strong>Data Residency:</strong> Added European GDPR Standard Contractual Clauses (SCCs).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900 text-white text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to evaluate DocuMind on your documents?</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          Spin up a trial in 2 minutes. Upload your sample PDF and experience immediate intelligence.
        </p>
        <Link to="/app">
          <Button size="lg" variant="primary">Launch Workspace</Button>
        </Link>
      </section>
    </div>
  );
};
