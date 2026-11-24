import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Folder,
  MessageSquare,
  GitCompare,
  BarChart3,
  Settings,
  X,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { DocumentItem, CollectionItem } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      api.getDocuments().then(res => setDocuments(res.documents)).catch(() => {});
      api.getCollections().then(res => setCollections(res.collections)).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(query.toLowerCase()) ||
    d.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 4);

  const filteredCols = collections.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const navItems = [
    { name: 'Dashboard Overview', path: '/app', icon: BarChart3 },
    { name: 'All Documents', path: '/app/documents', icon: FileText },
    { name: 'Document Collections', path: '/app/collections', icon: Folder },
    { name: 'AI Question Answering Studio', path: '/app/chat', icon: MessageSquare },
    { name: 'Contract Comparison Engine', path: '/app/compare', icon: GitCompare },
    { name: 'Audit & Activity Reports', path: '/app/reports', icon: BarChart3 },
    { name: 'Profile & Security Settings', path: '/app/settings', icon: Settings },
  ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Palette Modal */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search documents, or jump to..."
            className="w-full px-3 py-4 text-sm bg-transparent border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Documents Match */}
          {filteredDocs.length > 0 && (
            <div>
              <div className="px-2 py-1 font-semibold text-[11px] text-slate-400 uppercase tracking-wider">
                Documents
              </div>
              <div className="space-y-1 mt-1">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleSelect(`/app/documents?docId=${doc.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-slate-800 dark:text-slate-200 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="truncate font-medium">{doc.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono shrink-0">
                      {doc.fileType} • {doc.pageCount}p
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Collections Match */}
          {filteredCols.length > 0 && (
            <div>
              <div className="px-2 py-1 font-semibold text-[11px] text-slate-400 uppercase tracking-wider">
                Collections
              </div>
              <div className="space-y-1 mt-1">
                {filteredCols.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleSelect(`/app/collections?colId=${col.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-slate-800 dark:text-slate-200 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate font-medium">{col.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {col.documentIds.length} docs
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Actions */}
          {navItems.length > 0 && (
            <div>
              <div className="px-2 py-1 font-semibold text-[11px] text-slate-400 uppercase tracking-wider">
                Quick Navigation
              </div>
              <div className="space-y-1 mt-1">
                {navItems.map((nav) => (
                  <button
                    key={nav.path}
                    onClick={() => handleSelect(nav.path)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-slate-700 dark:text-slate-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <nav.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      <span className="font-medium">{nav.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredDocs.length === 0 && filteredCols.length === 0 && navItems.length === 0 && (
            <div className="text-center py-6 text-slate-400">
              No matching commands or documents found for "{query}"
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with mouse or arrow keys</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
