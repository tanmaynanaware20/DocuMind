import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Folder,
  Plus,
  FileText,
  MessageSquare,
  Lock,
  Globe,
  Trash2,
  Edit2,
  ArrowRight,
  Layers,
  Check,
  ChevronLeft,
  X,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { CollectionItem, DocumentItem } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';

export const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [allDocuments, setAllDocuments] = useState<DocumentItem[]>([]);
  const [selectedCol, setSelectedCol] = useState<CollectionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addDocsModalOpen, setAddDocsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [isPrivate, setIsPrivate] = useState(false);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const colorOptions = [
    '#4f46e5', // indigo
    '#059669', // emerald
    '#d97706', // amber
    '#7c3aed', // violet
    '#e11d48', // rose
    '#0284c7', // sky
  ];

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const [colRes, docRes] = await Promise.all([
        api.getCollections(),
        api.getDocuments()
      ]);
      setCollections(colRes.collections);
      setAllDocuments(docRes.documents);

      const colId = searchParams.get('colId');
      if (colId) {
        const found = colRes.collections.find(c => c.id === colId);
        if (found) setSelectedCol(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await api.createCollection({
        name,
        description,
        color,
        isPrivate,
      });
      setCollections(prev => [...prev, res.collection]);
      setCreateModalOpen(false);
      setName('');
      setDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCollection = async (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Delete collection "${name}"? Documents will remain in your catalog.`)) {
      try {
        await api.deleteCollection(id);
        setCollections(prev => prev.filter(c => c.id !== id));
        if (selectedCol?.id === id) setSelectedCol(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleDocInCollection = async (docId: string) => {
    if (!selectedCol) return;
    const isInside = selectedCol.documentIds.includes(docId);
    const action = isInside ? 'remove' : 'add';

    try {
      const res = await api.updateCollectionDocuments(selectedCol.id, docId, action);
      setSelectedCol(res.collection);
      setCollections(prev => prev.map(c => (c.id === res.collection.id ? res.collection : c)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleQueryCollection = (col: CollectionItem) => {
    navigate(`/app/chat?collectionId=${col.id}`);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* 1. TOP HEADER */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {selectedCol ? (
            <button
              onClick={() => {
                setSelectedCol(null);
                setSearchParams({});
              }}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1 hover:underline cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to all collections</span>
            </button>
          ) : null}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {selectedCol ? selectedCol.name : 'Document Collections'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedCol
              ? selectedCol.description || 'Dedicated workspace collection'
              : 'Organize related contracts, financial disclosures, and policies for cross-document synthesis'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedCol ? (
            <>
              <Button
                variant="primary"
                size="sm"
                icon={<MessageSquare className="w-3.5 h-3.5" />}
                onClick={() => handleQueryCollection(selectedCol)}
              >
                Ask AI Across Collection
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setAddDocsModalOpen(true)}
              >
                Manage Documents
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setCreateModalOpen(true)}
            >
              New Collection
            </Button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. COLLECTION DETAIL VIEW OR GRID VIEW */}
      {/* ============================================================ */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : selectedCol ? (
        /* DETAIL VIEW */
        <div className="space-y-6">
          {/* Collection Metadata Card */}
          <div
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: selectedCol.color }}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: selectedCol.color }}
                >
                  <Folder className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedCol.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{selectedCol.documentIds.length} documents inside</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {selectedCol.isPrivate ? <Lock className="w-3 h-3 text-amber-500" /> : <Globe className="w-3 h-3 text-emerald-500" />}
                      {selectedCol.isPrivate ? 'Confidential (Private)' : 'Workspace Shared'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                  onClick={() => handleDeleteCollection(selectedCol.id, selectedCol.name)}
                >
                  Delete Collection
                </Button>
              </div>
            </div>
          </div>

          {/* Documents inside this collection */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Documents in this Collection ({selectedCol.documentIds.length})
            </h3>

            {selectedCol.documentIds.length === 0 ? (
              <EmptyState
                icon={<Folder className="w-6 h-6" />}
                title="This collection is empty"
                description="Add contracts or reports to enable multi-document synthesis and comparisons."
                actionText="Add Documents"
                actionIcon={<Plus className="w-4 h-4" />}
                onAction={() => setAddDocsModalOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allDocuments
                  .filter(d => selectedCol.documentIds.includes(d.id))
                  .map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => navigate(`/app/documents?docId=${doc.id}`)}
                      className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-all flex flex-col justify-between cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-600">
                            {doc.title}
                          </span>
                        </div>
                        <Badge variant="primary" size="sm">{doc.fileType.toUpperCase()}</Badge>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                        {doc.summary}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>{doc.pageCount} pages</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDocInCollection(doc.id);
                          }}
                          className="text-rose-500 hover:underline"
                        >
                          Remove from collection
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* GRID OF ALL COLLECTIONS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {collections.map((col) => {
            const docCount = col.documentIds?.length || col.documentCount || 0;

            return (
              <div
                key={col.id}
                onClick={() => {
                  setSelectedCol(col);
                  setSearchParams({ colId: col.id });
                }}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: col.color }}
                    >
                      <Folder className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      {col.isPrivate ? (
                        <span title="Private collection">
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                      ) : (
                        <span title="Shared workspace">
                          <Globe className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors mb-1.5">
                    {col.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {col.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {docCount} {docCount === 1 ? 'document' : 'documents'}
                  </span>
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. CREATE COLLECTION MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Collection"
        description="Group agreements, financial reports, or security frameworks together"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCollection} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Collection Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vendor Procurement MSAs"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Purpose of this collection and relevant guidelines..."
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Color Theme
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : ''
                  }`}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Mark as Confidential (Restricted to you and administrators)
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Collection
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* 4. MANAGE DOCUMENTS IN COLLECTION MODAL */}
      {/* ============================================================ */}
      {selectedCol && (
        <Modal
          isOpen={addDocsModalOpen}
          onClose={() => setAddDocsModalOpen(false)}
          title={`Manage Documents in "${selectedCol.name}"`}
          description="Check the documents you wish to include in this collection."
          maxWidth="lg"
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allDocuments.map((doc) => {
              const isChecked = selectedCol.documentIds.includes(doc.id);

              return (
                <div
                  key={doc.id}
                  onClick={() => handleToggleDocInCollection(doc.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by row click
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">
                        {doc.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {doc.pageCount} pages • {doc.fileType.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={isChecked ? 'primary' : 'neutral'} size="sm">
                    {isChecked ? 'Included' : 'Available'}
                  </Badge>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="primary" onClick={() => setAddDocsModalOpen(false)}>
              Done
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
