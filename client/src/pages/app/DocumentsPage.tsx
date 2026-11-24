import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Eye,
  Trash2,
  MessageSquare,
  GitCompare,
  Plus,
  Sparkles,
  ChevronDown,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { api } from '../../services/api';
import { DocumentItem, CollectionItem } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { UploadModal } from '../../components/documents/UploadModal';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & View state
  const [search, setSearch] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [starredOnly, setStarredOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const [docsRes, colsRes] = await Promise.all([
        api.getDocuments({
          collection: collectionFilter !== 'all' ? collectionFilter : undefined,
          fileType: fileTypeFilter !== 'all' ? fileTypeFilter : undefined,
          search: search || undefined,
          sort: sortBy === 'name_asc' ? 'name_asc' : sortBy === 'size_desc' ? 'size_desc' : undefined,
          starred: starredOnly ? true : undefined,
        }),
        api.getCollections()
      ]);
      setDocuments(docsRes.documents);
      setCollections(colsRes.collections);

      // Check URL query parameters
      const docId = searchParams.get('docId');
      if (docId) {
        const found = docsRes.documents.find(d => d.id === docId);
        if (found) {
          setSelectedDoc(found);
          setPreviewModalOpen(true);
        }
      }
      if (searchParams.get('action') === 'upload') {
        setUploadModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [collectionFilter, fileTypeFilter, sortBy, starredOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDocuments();
  };

  const handleToggleStar = async (doc: DocumentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.updateDocument(doc.id, { starred: !doc.starred });
      setDocuments(prev => prev.map(d => (d.id === doc.id ? res.document : d)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${title}" permanently?`)) {
      try {
        await api.deleteDocument(id);
        setDocuments(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenPreview = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setPreviewModalOpen(true);
  };

  const handleUploadSuccess = (newDoc: DocumentItem) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & PRIMARY ACTIONS */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Document Repository
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage, upload, preview, and organize your enterprise document catalog ({documents.length} files)
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setUploadModalOpen(true)}
          className="shadow-sm"
        >
          Upload Document
        </Button>
      </div>

      {/* ============================================================ */}
      {/* 2. FILTER & SEARCH CONTROL BAR */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tags, or contents..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Collection Filter */}
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Collections</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>

            {/* File Type Filter */}
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All File Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="docx">Word (DOCX)</option>
              <option value="txt">Text &amp; Markdown</option>
              <option value="csv">Spreadsheet (CSV)</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest Uploads First</option>
              <option value="name_asc">Title A-Z</option>
              <option value="size_desc">Largest File Size</option>
            </select>

            {/* Starred Only Toggle */}
            <button
              onClick={() => setStarredOnly(!starredOnly)}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                starredOnly
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${starredOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span className="hidden sm:inline">Starred</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. DOCUMENT CATALOG DISPLAY */}
      {/* ============================================================ */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-7 h-7" />}
          title="No documents found"
          description="Try broadening your search filters, or upload your first PDF or Word document."
          actionText="Upload Document"
          actionIcon={<Upload className="w-4 h-4" />}
          onAction={() => setUploadModalOpen(true)}
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => handleOpenPreview(doc)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="primary" size="sm">{doc.fileType.toUpperCase()}</Badge>
                    <button
                      onClick={(e) => handleToggleStar(doc, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <Star className={`w-4 h-4 ${doc.starred ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {doc.summary}
                </p>
              </div>

              <div>
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {doc.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Footer metadata & actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{doc.pageCount} pages • {(doc.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPreview(doc);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600"
                      title="Inspect Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(doc.id, doc.title, e)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-3 pl-4">Title</th>
                  <th className="p-3">Format</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Pages</th>
                  <th className="p-3">Upload Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => handleOpenPreview(doc)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={(e) => handleToggleStar(doc, e)}
                          className="text-slate-300 hover:text-amber-500"
                        >
                          <Star className={`w-3.5 h-3.5 ${doc.starred ? 'text-amber-500 fill-amber-500' : ''}`} />
                        </button>
                        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {doc.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="primary" size="sm">{doc.fileType.toUpperCase()}</Badge>
                    </td>
                    <td className="p-3 text-slate-500">
                      {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="p-3 text-slate-500">{doc.pageCount}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <Badge variant="success" size="sm">Indexed</Badge>
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPreview(doc);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(doc.id, doc.title, e)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        collections={collections}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Document Detail Preview Modal */}
      <DocumentPreviewModal
        document={selectedDoc}
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        onDocumentUpdated={(updated) => {
          setDocuments(prev => prev.map(d => (d.id === updated.id ? updated : d)));
          setSelectedDoc(updated);
        }}
        onDocumentDeleted={(id) => {
          setDocuments(prev => prev.filter(d => d.id !== id));
        }}
      />
    </div>
  );
};
