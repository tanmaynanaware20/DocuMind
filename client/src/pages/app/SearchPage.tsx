import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Sparkles,
  Filter,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  Folder,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { DocumentItem, CollectionItem } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';

interface SearchResultItem {
  document: DocumentItem;
  snippet: string;
  matchScore: number;
  page: number;
}

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('liability limit or SLA uptime');
  const [searchType, setSearchType] = useState<'hybrid' | 'semantic' | 'keyword'>('hybrid');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    'liability limit or SLA uptime',
    'Q3 revenue and gross margin',
    'SOC 2 Type II encryption',
    'chunking tokens RFC-089'
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    api.getCollections().then(res => setCollections(res.collections)).catch(() => {});
    handleSearch('liability limit or SLA uptime', 'hybrid');
  }, []);

  const handleSearch = async (searchTerm?: string, type?: 'hybrid' | 'semantic' | 'keyword') => {
    const q = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!q) return;

    const sType = type || searchType;
    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await api.search(q);
      setResults(res.results);

      if (!searchHistory.includes(q)) {
        setSearchHistory(prev => [q, ...prev.slice(0, 5)]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleAskAboutDoc = (docId: string, q: string) => {
    navigate(`/app/chat?docId=${docId}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Enterprise Document Search Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Perform high-precision keyword, semantic vector, and hybrid search across all indexed document chunks
        </p>
      </div>

      {/* Search Input Bar & Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clauses, revenue figures, legal definitions, or compliance requirements..."
            className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-1.5 flex items-center">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isLoading}
              className="rounded-lg px-4"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Filter Bar: Search Mode + Collection Scope */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Mode:</span>
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setSearchType('hybrid');
                  handleSearch(query, 'hybrid');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  searchType === 'hybrid'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Hybrid (Dense + BM25)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchType('semantic');
                  handleSearch(query, 'semantic');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  searchType === 'semantic'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semantic Vector
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchType('keyword');
                  handleSearch(query, 'keyword');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  searchType === 'keyword'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Keyword Exact
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Collections</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Recent Search Queries */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Recent queries:</span>
          {searchHistory.map((h, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(h);
                handleSearch(h);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
            >
              "{h}"
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>Found {results.length} relevant passages</span>
          <span>Ranking: Reciprocal Rank Fusion (k=60)</span>
        </div>

        {results.length === 0 && hasSearched ? (
          <EmptyState
            icon={<Search className="w-7 h-7" />}
            title="No matching passages found"
            description="Try switching between Hybrid, Semantic, or Keyword search modes, or broaden your query terms."
          />
        ) : (
          results.map((res, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-all space-y-3 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      onClick={() => setPreviewDoc(res.document)}
                      className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {res.document.title}
                    </h3>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold uppercase">{res.document.fileType}</span>
                      <span>•</span>
                      <span>Page {res.page}</span>
                      <span>•</span>
                      <span>Total {res.document.pageCount} pages</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    {Math.round(res.matchScore * 100)}% Match
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<MessageSquare className="w-3.5 h-3.5 text-blue-600" />}
                    onClick={() => handleAskAboutDoc(res.document.id, query)}
                    className="text-xs"
                  >
                    Query in Q&amp;A
                  </Button>
                </div>
              </div>

              {/* Snippet Excerpt */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                {res.snippet}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document preview modal */}
      {previewDoc && (
        <DocumentPreviewModal
          document={previewDoc}
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          onDocumentUpdated={() => {}}
          onDocumentDeleted={() => {}}
        />
      )}
    </div>
  );
};
