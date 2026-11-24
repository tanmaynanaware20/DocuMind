import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  X,
  Star,
  Download,
  Trash2,
  RefreshCw,
  MessageSquare,
  GitCompare,
  Sparkles,
  Calendar,
  Users,
  Building,
  Tag,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Code,
  DollarSign,
  AlertOctagon
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DocumentItem, StructuredExtractionResult } from '../../types';
import { api } from '../../services/api';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdated: (doc: DocumentItem) => void;
  onDocumentDeleted: (id: string) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onDocumentUpdated,
  onDocumentDeleted,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'summary' | 'entities' | 'structured' | 'history'>('preview');
  const [searchInDoc, setSearchInDoc] = useState('');
  const [isStarred, setIsStarred] = useState(document?.starred || false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [structuredExtraction, setStructuredExtraction] = useState<StructuredExtractionResult | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const navigate = useNavigate();

  if (!document) return null;

  const handleRunExtraction = async () => {
    setIsExtracting(true);
    try {
      const res = await api.extractStructured(document.id);
      setStructuredExtraction(res.extraction);
    } catch (err) {
      console.error('Failed to extract structured data:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownloadExtractionJson = () => {
    if (!structuredExtraction) return;
    const blob = new Blob([JSON.stringify(structuredExtraction, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `documind_structured_extraction_${document.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleStar = async () => {
    try {
      const nextStar = !isStarred;
      setIsStarred(nextStar);
      const res = await api.updateDocument(document.id, { starred: nextStar });
      onDocumentUpdated(res.document);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReindex = async () => {
    setIsReindexing(true);
    try {
      const res = await api.reindexDocument(document.id);
      onDocumentUpdated(res.document);
    } finally {
      setIsReindexing(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to permanently delete "${document.title}"?`)) {
      try {
        await api.deleteDocument(document.id);
        onDocumentDeleted(document.id);
        onClose();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAskAI = () => {
    onClose();
    navigate(`/app/chat?docId=${document.id}`);
  };

  const handleCompare = () => {
    onClose();
    navigate(`/app/compare?docAId=${document.id}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-md">
                  {document.title}
                </h3>
                <button
                  onClick={handleToggleStar}
                  className="text-slate-400 hover:text-amber-500 transition-colors"
                >
                  <Star className={`w-4 h-4 ${isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <Badge variant="primary" size="sm">{document.fileType.toUpperCase()}</Badge>
                <span>•</span>
                <span>{document.pageCount} pages</span>
                <span>•</span>
                <span>{document.wordCount.toLocaleString()} words</span>
                <span>•</span>
                <span>{(document.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>
          </div>

          {/* Quick action bar */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<MessageSquare className="w-3.5 h-3.5 text-indigo-500" />}
              onClick={handleAskAI}
            >
              Ask AI
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<GitCompare className="w-3.5 h-3.5 text-violet-500" />}
              onClick={handleCompare}
            >
              Compare
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin' : ''}`} />}
              onClick={handleReindex}
              disabled={isReindexing}
              title="Re-run neural indexer"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
              onClick={handleDelete}
              title="Delete document"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'preview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Document Content ({document.pageCount} Pages)
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Executive Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('entities')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'entities'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Entities &amp; Topics
          </button>
          <button
            onClick={() => {
              setActiveTab('structured');
              if (!structuredExtraction) {
                handleRunExtraction();
              }
            }}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'structured'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-blue-500" />
            <span>Structured Extraction (Pydantic)</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Versions ({document.versions.length})
          </button>
        </div>

        {/* Tab 1: Full Document Preview */}
        {activeTab === 'preview' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchInDoc}
                  onChange={(e) => setSearchInDoc(e.target.value)}
                  placeholder="Find within document..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <button
                onClick={handleCopyContent}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-96 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {document.content}
            </div>
          </div>
        )}

        {/* Tab 2: AI Executive Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Executive Overview</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {document.summary}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Key Contractual &amp; Operational Takeaways
              </h4>
              <ul className="space-y-2">
                {document.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAskAI}
                icon={<MessageSquare className="w-3.5 h-3.5" />}
              >
                Chat with this document in AI Studio
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Extracted Entities */}
        {activeTab === 'entities' && (
          <div className="space-y-4 text-xs">
            {/* People */}
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-2">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Signatories &amp; Key People</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {document.entities.people.map((p) => (
                  <Badge key={p} variant="primary" size="sm">{p}</Badge>
                ))}
              </div>
            </div>

            {/* Organizations */}
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-2">
                <Building className="w-3.5 h-3.5 text-violet-500" />
                <span>Identified Organizations</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {document.entities.organizations.map((org) => (
                  <Badge key={org} variant="neutral" size="sm">{org}</Badge>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Key Dates &amp; Deadlines</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {document.entities.dates.map((d) => (
                  <Badge key={d} variant="success" size="sm">{d}</Badge>
                ))}
              </div>
            </div>

            {/* Contractual Terms */}
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-2">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Legal &amp; Financial Terms</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {document.entities.terms.map((t) => (
                  <Badge key={t} variant="warning" size="sm">{t}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Structured Schema Extraction (Pydantic validated) */}
        {activeTab === 'structured' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Pydantic Structured Information Extraction
                </span>
                <span className="text-[11px] text-slate-500">
                  Strict schema extraction: Signatories, Organizations, Monetary Values, Deadlines &amp; Clauses
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunExtraction}
                  disabled={isExtracting}
                  icon={<RefreshCw className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin' : ''}`} />}
                >
                  {isExtracting ? 'Extracting...' : 'Re-extract Schema'}
                </Button>
                {structuredExtraction && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDownloadExtractionJson}
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Export JSON
                  </Button>
                )}
              </div>
            </div>

            {isExtracting ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mb-2" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Executing Pydantic schema validation pipeline...
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Parsing monetary terms, dates, and liability caps
                </p>
              </div>
            ) : structuredExtraction ? (
              <div className="space-y-4">
                {/* 1. Monetary Values & Financial Commitments */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Monetary Values &amp; Financial Caps ({structuredExtraction.monetary_values.length})</span>
                  </h4>
                  {structuredExtraction.monetary_values.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {structuredExtraction.monetary_values.map((m, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm block">
                            {m.amount}
                          </span>
                          <span className="text-[11px] text-slate-600 dark:text-slate-400">
                            {m.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No monetary values identified.</p>
                  )}
                </div>

                {/* 2. Critical Clauses & Risk Level */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />
                    <span>Critical Clauses &amp; Risk Classification ({structuredExtraction.critical_clauses.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {structuredExtraction.critical_clauses.map((c, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {c.clause_name}
                          </span>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                            {c.summary}
                          </p>
                        </div>
                        <Badge
                          variant={c.risk_level === 'high' ? 'danger' : c.risk_level === 'medium' ? 'warning' : 'success'}
                          size="sm"
                        >
                          {c.risk_level.toUpperCase()} RISK
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Deadlines & Dates */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Deadlines &amp; Important Dates ({structuredExtraction.important_dates.length + structuredExtraction.deadlines.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {structuredExtraction.important_dates.map((d, idx) => (
                      <div key={idx} className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono block text-[11px]">{d.date}</span>
                        <span className="text-[10px] text-slate-500">{d.context}</span>
                      </div>
                    ))}
                    {structuredExtraction.deadlines.map((dl, idx) => (
                      <div key={`dl-${idx}`} className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                        <span className="font-semibold text-amber-700 dark:text-amber-400 font-mono block text-[11px]">{dl.deadline}</span>
                        <span className="text-[10px] text-slate-500">{dl.context}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Payment Conditions & Invoicing */}
                {structuredExtraction.payment_conditions && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Payment Conditions
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      {structuredExtraction.payment_conditions}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                Click "Re-extract Schema" above to run structured entity extraction.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Version History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {document.versions.map((ver) => (
              <div
                key={ver.version}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>Version {ver.version}.0</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {new Date(ver.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{ver.summary}</p>
                <div className="text-[10px] text-slate-400 pt-1">Author: {ver.author}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
