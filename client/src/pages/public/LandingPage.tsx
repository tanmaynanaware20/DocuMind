import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  GitCompare,
  Search,
  MessageSquare,
  Lock,
  BarChart3,
  Users,
  ChevronDown,
  Building,
  Scale,
  TrendingUp,
  Cpu,
  Layers,
  HelpCircle,
  Play,
  Check
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const LandingPage: React.FC = () => {
  // Interactive Demo State
  const [demoTab, setDemoTab] = useState<'chat' | 'compare' | 'search'>('chat');
  const [teamSize, setTeamSize] = useState<number>(15);
  const [docsPerMonth, setDocsPerMonth] = useState<number>(300);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // ROI calculations
  const hoursSavedPerDoc = 1.8;
  const avgHourlyRate = 85;
  const monthlyHoursSaved = Math.round(docsPerMonth * hoursSavedPerDoc);
  const annualSavings = Math.round(monthlyHoursSaved * avgHourlyRate * 12);

  const faqs = [
    {
      q: 'Does DocuMind train AI models on my confidential documents?',
      a: 'Absolutely not. DocuMind guarantees a strict zero-retention and zero-training policy across all enterprise tiers. Your documents are encrypted using tenant-specific AES-256 keys, and data is never fed back into foundational AI training pipelines.'
    },
    {
      q: 'How does DocuMind compare two contract versions?',
      a: 'DocuMind combines structural semantic diffing with LLM clause analysis. It aligns paragraphs, highlights additions, deletions, and alterations, and synthesizes an executive summary highlighting changes in liability, indemnification, SLAs, and payment schedules.'
    },
    {
      q: 'What document formats are supported?',
      a: 'DocuMind natively supports PDF, DOCX, TXT, CSV, and XLSX spreadsheet files up to 500 pages per document with specialized PyMuPDF, python-docx, and openpyxl extractors.'
    },
    {
      q: 'Can DocuMind answer questions across multiple documents at once?',
      a: 'Yes. You can select entire collections or individual documents. DocuMind uses hybrid retrieval (Dense Vector HNSW + BM25) and generates cross-document synthesis with exact page-level citations.'
    },
    {
      q: 'Is DocuMind compliant with enterprise security standards?',
      a: 'Yes. We are SOC2 Type II certified by Schellman & Co, ISO/IEC 27001:2022 compliant, HIPAA-ready with signed BAAs, and support data residency in both US and EU regions.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-600 selection:text-white">
      {/* ============================================================ */}
      {/* 1. HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top announcement pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/70 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>DocuMind 3.0 Enterprise Document Intelligence</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <Link to="/features" className="hover:underline flex items-center gap-0.5">
              Read Specs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Specified Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
            Your documents,{' '}
            <span className="text-blue-600 dark:text-blue-500">
              finally under control.
            </span>
          </h1>

          {/* Specified Description */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Find information, compare files, understand reports and manage your documents from one organized workspace.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <Link to="/register">
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 shadow-xs">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/app">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8" icon={<Play className="w-4 h-4 text-blue-600" />}>
                Launch Workspace Demo
              </Button>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">99.4%</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">Citation Accuracy</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">&lt; 280ms</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">p95 Query Latency</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">18.4M+</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">Pages Processed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">SOC 2</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">Type II Certified</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. INTERACTIVE PRODUCT PREVIEW SIMULATOR */}
      {/* ============================================================ */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge variant="primary" className="mb-2">Clean Enterprise Workspace</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Experience the Document Workspace
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-1">
              Switch between Smart Q&A, Contract Compare, and Hybrid Search simulators below.
            </p>

            {/* Simulator Tabs */}
            <div className="flex items-center justify-center gap-2 mt-6 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl max-w-md mx-auto">
              <button
                onClick={() => setDemoTab('chat')}
                className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  demoTab === 'chat'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Smart Q&A
              </button>
              <button
                onClick={() => setDemoTab('compare')}
                className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  demoTab === 'compare'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Contract Compare
              </button>
              <button
                onClick={() => setDemoTab('search')}
                className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  demoTab === 'search'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Hybrid Search
              </button>
            </div>
          </div>

          {/* Interactive Window */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            {/* Window Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
                <span className="text-xs font-mono text-slate-500 ml-2">documind.workspace // live-preview</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Retention Policy Active</span>
              </div>
            </div>

            {/* TAB 1: Smart Q&A Demo */}
            {demoTab === 'chat' && (
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 justify-end">
                  <div className="max-w-xl bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-none text-sm leading-relaxed shadow-xs">
                    What is the limitation of liability and uptime guarantee in the Master Subscription Agreement v1 vs v2?
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
                    AM
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    DM
                  </div>
                  <div className="max-w-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-tl-none text-sm space-y-3">
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      Based on comparative analysis across your Legal collection:
                    </p>
                    <div className="space-y-2">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>1. Limitation of Liability</span>
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">Major Revision</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          In <strong>v1.0 (Section 4)</strong>, liability is capped at <strong>$1,000,000</strong>. In <strong>v2.1 (Section 4)</strong>, it is increased to <strong>$5,000,000</strong>, with breaches of confidentiality uncapped.
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>2. Uptime Guarantee (SLA)</span>
                          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">Upgraded</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          In <strong>v1.0 (Section 2)</strong>, uptime is guaranteed at <strong>99.9%</strong>. In <strong>v2.1 (Section 2)</strong>, it is elevated to <strong>99.99%</strong> with escalated service credit tiers.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Verified Source Citations:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                          <FileText className="w-3 h-3" />
                          <span>DocuMind_MSA_Enterprise_v1.0.pdf (Page 4)</span>
                          <span className="text-[10px] bg-blue-200 dark:bg-blue-900 px-1 rounded font-mono">98% match</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                          <FileText className="w-3 h-3" />
                          <span>DocuMind_MSA_Enterprise_v2.1_Draft.pdf (Page 5)</span>
                          <span className="text-[10px] bg-blue-200 dark:bg-blue-900 px-1 rounded font-mono">96% match</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Compare Demo */}
            {demoTab === 'compare' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Redline: MSA_Standard_v1.0 vs MSA_Revised_v2.1
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                      +2 Additions
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium border border-amber-200">
                      3 Modifications
                    </span>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] font-bold text-slate-500 font-sans mb-1">Section 2: Service Level Availability</div>
                    <div className="p-1.5 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 line-through">
                      - DocuMind commits to achieving a Monthly Uptime Percentage of 99.9% with 10% credit.
                    </div>
                    <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 mt-1">
                      + DocuMind commits to achieving a Monthly Uptime Percentage of 99.99% with tiered credits (25% and 50%).
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] font-bold text-slate-500 font-sans mb-1">Section 4: Limitation of Liability</div>
                    <div className="p-1.5 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 line-through">
                      - TOTAL AGGREGATE LIABILITY ARISING OUT OF THIS AGREEMENT SHALL EXCEED ONE MILLION US DOLLARS ($1,000,000).
                    </div>
                    <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 mt-1">
                      + TOTAL AGGREGATE LIABILITY SHALL EXCEED FIVE MILLION US DOLLARS ($5,000,000). Confidentiality breaches are uncapped.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Search Demo */}
            {demoTab === 'search' && (
              <div className="p-6 space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    readOnly
                    value="EBITDA, Net Revenue Retention, ARR growth"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        DocuMind_Q3_FY2026_Investor_Report.pdf
                      </span>
                      <Badge variant="primary" size="sm">Finance</Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      ...Annual Recurring Revenue (ARR) exited Q3 at <mark className="bg-amber-100 text-amber-900 px-0.5 rounded">$48.2M, driven by 84% YoY increase</mark>. GAAP Gross Margin was 78.4% and <mark className="bg-amber-100 text-amber-900 px-0.5 rounded">Net Revenue Retention (NRR) closed at 132%</mark>...
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    99.2% match
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. CORE SAAS CAPABILITIES */}
      {/* ============================================================ */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="primary" className="mb-2">Enterprise Capabilities</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built for Serious Productivity
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Professional tools to ingest, analyze, organize, compare, and extract information from your documents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Multi-Format Document Extraction
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dedicated PyMuPDF, python-docx, and openpyxl services parse PDF, DOCX, TXT, CSV, and XLSX documents while strictly preserving page references.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Retrieval-Augmented Generation (RAG)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Synthesizes grounded answers directly from your documents. Every statement is attributed to verified source citations with exact page numbers.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-4">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Document Comparison &amp; Redline
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Select any two documents to view side-by-side clause additions, deletions, modified liability caps, and AI change summaries.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Hybrid Search Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Combines dense semantic vector retrieval with sparse BM25 keyword matching for 96.4% recall across legal, financial, and technical terms.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Structured Information Extraction
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Extracts person names, organizations, dates, deadlines, monetary values, and contractual terms into validated Pydantic JSON schemas.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Zero-Retention Security &amp; BYOK
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Customer data is strictly isolated within tenant boundaries. Proprietary documents are never utilized for model training.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. PRICING SECTION (Free, Professional, Business) */}
      {/* ============================================================ */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800" id="pricing">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <Badge variant="primary" className="mb-2">Transparent Plans</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Simple, Predictable Plans
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select the plan that matches your organization’s document volume.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-xs ${billingCycle === 'monthly' ? 'font-bold' : 'text-slate-500'}`}>Monthly</span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-10 h-5 bg-slate-300 dark:bg-slate-700 rounded-full p-0.5 transition-colors relative"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-blue-600 transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs flex items-center gap-1 ${billingCycle === 'yearly' ? 'font-bold text-blue-600' : 'text-slate-500'}`}>
                Annual (Save 20%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Free</h3>
                <p className="text-xs text-slate-500 mt-1">For individuals and students exploring document Q&A.</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$0</span>
                  <span className="text-xs text-slate-500"> / forever</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Up to 25 documents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>PDF, DOCX, TXT, CSV, XLSX</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Standard Q&amp;A with citations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>1 GB encrypted storage</span>
                  </li>
                </ul>
              </div>
              <Link to="/register" className="mt-6">
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </Link>
            </div>

            {/* Professional Plan (Highlighted) */}
            <div className="p-6 rounded-2xl border-2 border-blue-600 bg-white dark:bg-slate-900 shadow-md flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wide uppercase">
                Most Popular
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Professional</h3>
                <p className="text-xs text-slate-500 mt-1">For legal ops, private equity, and growing teams.</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ${billingCycle === 'yearly' ? '79' : '99'}
                  </span>
                  <span className="text-xs text-slate-500"> / user / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-semibold">Unlimited documents &amp; queries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Cross-document multi-file synthesis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Contract clause comparison &amp; redline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Structured information extraction</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>50 GB encrypted cloud storage</span>
                  </li>
                </ul>
              </div>
              <Link to="/register" className="mt-6">
                <Button variant="primary" className="w-full">Start 14-Day Free Trial</Button>
              </Link>
            </div>

            {/* Business Plan */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Business</h3>
                <p className="text-xs text-slate-500 mt-1">For organizations requiring strict governance and single-tenant VPC.</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ${billingCycle === 'yearly' ? '199' : '249'}
                  </span>
                  <span className="text-xs text-slate-500"> / user / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Bring Your Own Key (BYOK) AES-256 KMS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>EU &amp; US Regional Data Residency</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Immutable cryptographic audit logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>99.99% SLA &amp; 24/7 dedicated support</span>
                  </li>
                </ul>
              </div>
              <Link to="/register" className="mt-6">
                <Button variant="outline" className="w-full">Contact Business Sales</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. FAQ ACCORDION */}
      {/* ============================================================ */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Badge variant="primary" className="mb-2">Common Questions</Badge>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs sm:text-sm text-slate-900 dark:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ready to organize and analyze your documents?</h2>
          <p className="text-blue-100 text-xs sm:text-sm max-w-md mx-auto mb-6">
            Get started in 2 minutes. Ingest contracts, financial filings, and research papers with zero friction.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="px-8 font-bold">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
