import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GitCompare,
  ArrowRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Download,
  Share2,
  Layers,
  ArrowUpDown,
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { DocumentItem, ComparisonResult } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ComparePage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docAId, setDocAId] = useState<string>('doc_msa_v1');
  const [docBId, setDocBId] = useState<string>('doc_msa_v2');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'sideBySide' | 'unified' | 'changesOnly'>('sideBySide');

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const initDocs = async () => {
      try {
        const res = await api.getDocuments();
        setDocuments(res.documents);

        const aParam = searchParams.get('docAId');
        const bParam = searchParams.get('docBId');
        if (aParam) setDocAId(aParam);
        if (bParam) setDocBId(bParam);

        // Run default comparison on load if both set
        const finalA = aParam || 'doc_msa_v1';
        const finalB = bParam || 'doc_msa_v2';
        runCompare(finalA, finalB);
      } catch (err) {
        console.error(err);
      }
    };
    initDocs();
  }, [searchParams]);

  const runCompare = async (aId: string, bId: string) => {
    if (!aId || !bId || aId === bId) return;
    setIsLoading(true);
    try {
      const res = await api.compareDocuments(aId, bId);
      setComparison(res.comparison);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompareClick = () => {
    runCompare(docAId, docBId);
  };

  const handleSwap = () => {
    const temp = docAId;
    setDocAId(docBId);
    setDocBId(temp);
    runCompare(docBId, temp);
  };

  const handleExport = () => {
    if (!comparison) return;
    const blob = new Blob([JSON.stringify(comparison, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DocuMind_Comparison_${comparison.docA.title}_vs_${comparison.docB.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const docA = documents.find(d => d.id === docAId);
  const docB = documents.find(d => d.id === docBId);

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & COMPARISON SELECTOR */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Contract &amp; Document Comparison Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Detect contractual modifications, altered liability caps, SLA deviations, and additions between drafts
          </p>
        </div>

        {comparison && (
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExport}
          >
            Export Redline Report
          </Button>
        )}
      </div>

      {/* Selector Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* Doc A */}
          <div className="md:col-span-5 space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Baseline Document (Version A)
            </label>
            <select
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.fileType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pt-4 md:pt-4">
            <button
              onClick={handleSwap}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Swap Documents"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Doc B */}
          <div className="md:col-span-5 space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Revised Draft (Version B)
            </label>
            <select
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.fileType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Quick Pair:</span>
            <button
              type="button"
              onClick={() => {
                setDocAId('doc_msa_v1');
                setDocBId('doc_msa_v2');
                runCompare('doc_msa_v1', 'doc_msa_v2');
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Compare Standard MSA v1 vs Revised Draft v2.1
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            loading={isLoading}
            onClick={handleCompareClick}
            icon={<GitCompare className="w-4 h-4" />}
          >
            Run Neural Diff
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. EXECUTIVE BRIEFING & RISK ASSESSMENT */}
      {/* ============================================================ */}
      {comparison && (
        <div className="space-y-6 animate-in fade-in">
          {/* Executive Summary Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Executive Change Analysis
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={comparison.riskAssessment.riskLevel === 'high' ? 'danger' : 'warning'} size="md">
                  Risk Level: {comparison.riskAssessment.riskLevel.toUpperCase()}
                </Badge>
                <Badge variant="primary" size="md">
                  {comparison.similarityScore}% Semantic Overlap
                </Badge>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {comparison.aiExecutiveSummary}
            </p>

            {/* Stat Counters */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  +{comparison.additionsCount}
                </div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">Additions</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-center">
                <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                  -{comparison.deletionsCount}
                </div>
                <div className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">Deletions</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center">
                <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                  ~{comparison.modificationsCount}
                </div>
                <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">Modifications</div>
              </div>
            </div>

            {/* Key Differences Bullet Points */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Key Contractual Revisions
              </div>
              <div className="space-y-1.5">
                {comparison.keyDifferences.map((kd, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{kd}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 3. CLAUSE BY CLAUSE DIFF VIEWER */}
          {/* ============================================================ */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Detailed Clause Revisions &amp; Redlines ({comparison.diffs.length} clauses analyzed)
              </h3>

              {/* View Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                <button
                  onClick={() => setViewMode('sideBySide')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    viewMode === 'sideBySide'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setViewMode('unified')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    viewMode === 'unified'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Unified Diff
                </button>
                <button
                  onClick={() => setViewMode('changesOnly')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    viewMode === 'changesOnly'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Modified Only
                </button>
              </div>
            </div>

            {/* Diffs List */}
            <div className="space-y-4">
              {comparison.diffs
                .filter(d => viewMode !== 'changesOnly' || d.type !== 'unchanged')
                .map((diff) => {
                  return (
                    <div
                      key={diff.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs font-mono space-y-2"
                    >
                      <div className="flex items-center justify-between font-sans">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {diff.section}
                        </span>
                        <Badge
                          variant={
                            diff.type === 'addition'
                              ? 'success'
                              : diff.type === 'deletion'
                              ? 'danger'
                              : diff.type === 'modification'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {diff.type.toUpperCase()}
                        </Badge>
                      </div>

                      {diff.explanation && diff.type !== 'unchanged' && (
                        <div className="font-sans text-[11px] text-slate-500 italic">
                          Analysis: {diff.explanation}
                        </div>
                      )}

                      {/* Content rendering based on viewMode */}
                      {viewMode === 'sideBySide' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {/* Left: Doc A */}
                          <div
                            className={`p-3 rounded-lg border leading-relaxed ${
                              diff.type === 'modification' || diff.type === 'deletion'
                                ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="font-sans text-[10px] text-slate-400 mb-1 font-bold">
                              {comparison.docA.title}
                            </div>
                            <div>{diff.textA || '(Clause not present)'}</div>
                          </div>

                          {/* Right: Doc B */}
                          <div
                            className={`p-3 rounded-lg border leading-relaxed ${
                              diff.type === 'modification' || diff.type === 'addition'
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="font-sans text-[10px] text-slate-400 mb-1 font-bold">
                              {comparison.docB.title}
                            </div>
                            <div>{diff.textB || '(Clause not present)'}</div>
                          </div>
                        </div>
                      ) : (
                        /* Unified Redline View */
                        <div className="space-y-1 pt-1">
                          {diff.textA && diff.type !== 'addition' && (
                            <div
                              className={`p-2.5 rounded-lg ${
                                diff.type === 'modification' || diff.type === 'deletion'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 line-through'
                                  : 'text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {diff.textA}
                            </div>
                          )}
                          {diff.textB && diff.type !== 'unchanged' && diff.type !== 'deletion' && (
                            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                              {diff.textB}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
