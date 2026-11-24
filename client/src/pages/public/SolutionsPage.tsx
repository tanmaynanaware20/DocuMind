import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Scale,
  TrendingUp,
  Settings,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Shield,
  FileText
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const SolutionsPage: React.FC = () => {
  const solutions = [
    {
      id: 'hr',
      title: 'Human Resources',
      icon: Users,
      badge: 'Talent & Policies',
      headline: 'Automate Employee Handbook Q&A & Policy Compliance',
      description: 'Streamline employee onboarding, benefits inquiries, and internal compliance verification across hundreds of HR policies and handbooks.',
      benefits: [
        'Instant natural-language answers to complex benefits and PTO inquiries.',
        'Version control between annual handbook amendments and compliance updates.',
        'Role-based access controls ensuring strict employee confidentiality.'
      ]
    },
    {
      id: 'legal',
      title: 'Legal Teams',
      icon: Scale,
      badge: 'Contracts & Diligence',
      headline: 'Accelerate M&A Due Diligence & Vendor Contract Redlines',
      description: 'Pinpoint clause variations, altered liability caps, and indemnification exclusions between draft contracts in seconds instead of billable hours.',
      benefits: [
        'Side-by-side automated redlining and clause-by-clause risk scoring.',
        'Cross-document semantic search across thousands of active client agreements.',
        'Exact page and bounding-box citations for ironclad legal verification.'
      ]
    },
    {
      id: 'finance',
      title: 'Finance & Private Equity',
      icon: TrendingUp,
      badge: 'Audit & Statements',
      headline: 'Analyze 10-K/10-Q Filings, Invoices & Audit Statements',
      description: 'Extract key performance indicators, ARR disclosures, balance sheet notes, and EBITDA reconciliations with zero hallucination.',
      benefits: [
        'Table-aware OCR preserving financial column alignments and cell relationships.',
        'Automated extraction of payment deadlines, invoice amounts, and audit disclosures.',
        'High-speed quarterly comparative analysis across multi-year SEC filings.'
      ]
    },
    {
      id: 'operations',
      title: 'Operations',
      icon: Settings,
      badge: 'SOPs & Logistics',
      headline: 'Standard Operating Procedures & Vendor Management',
      description: 'Keep complex vendor contracts, logistics SLAs, and operational protocols organized and accessible across distributed teams.',
      benefits: [
        'Monitor vendor SLA compliance benchmarks and credit penalty clauses.',
        'Unified repository for engineering RFCs, system architecture, and vendor guidelines.',
        'Full activity audit trails tracking every document access and query.'
      ]
    },
    {
      id: 'education',
      title: 'Education & Research',
      icon: GraduationCap,
      badge: 'Academic Research',
      headline: 'Synthesize Academic Papers & Institutional Archives',
      description: 'Query extensive academic literature, institutional grants, and research papers with transparent source attributions.',
      benefits: [
        'Multi-document cross-synthesis across academic journal collections.',
        'Exact citation references with direct page-level excerpts.',
        'Organized research collections with private and shared workspace vaults.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <section className="pt-16 pb-16 border-b border-slate-200 dark:border-slate-800 text-center bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="primary" className="mb-3">Industry Solutions</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
            Tailored Document Intelligence for Every Team
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Whether reviewing legal contracts, auditing financial disclosures, or managing HR policies, DocuMind eliminates hours of manual document review.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/app">
              <Button size="lg" variant="primary">
                Explore in Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Solutions List */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {solutions.map((sol, idx) => (
          <div
            key={sol.id}
            id={sol.id}
            className={`p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row gap-8 items-start`}
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <sol.icon className="w-7 h-7" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">{sol.badge}</Badge>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{sol.title}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {sol.headline}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {sol.description}
              </p>

              <div className="pt-2 space-y-2">
                {sol.benefits.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <Link to="/app">
                  <Button variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Try with {sol.title} Documents
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Trust banner */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Enterprise Security &amp; Compliance Guaranteed</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            All solutions operate under a strict zero-retention guarantee. Your proprietary records are never utilized for model training.
          </p>
          <Link to="/register">
            <Button variant="primary">Start Free Trial</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
