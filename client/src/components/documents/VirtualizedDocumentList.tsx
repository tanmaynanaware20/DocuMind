import React, { useState, useRef, useMemo } from 'react';
import { DocumentItem } from '../../types';
import { FileText, FileSpreadsheet, FileCode, Star, MoreVertical } from 'lucide-react';
import { Badge } from '../common/Badge';

interface VirtualizedDocumentListProps {
  documents: DocumentItem[];
  rowHeight?: number;
  viewportHeight?: number;
  onSelectDocument?: (doc: DocumentItem) => void;
  onToggleStar?: (docId: string) => void;
}

export const VirtualizedDocumentList: React.FC<VirtualizedDocumentListProps> = ({
  documents,
  rowHeight = 72,
  viewportHeight = 500,
  onSelectDocument,
  onToggleStar,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalCount = documents.length;
  const totalHeight = totalCount * rowHeight;

  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - 3);
    const visibleCount = Math.ceil(viewportHeight / rowHeight) + 6;
    const end = Math.min(totalCount, start + visibleCount);
    const offset = start * rowHeight;
    return { startIndex: start, endIndex: end, offsetY: offset };
  }, [scrollTop, rowHeight, viewportHeight, totalCount]);

  const visibleDocs = useMemo(() => {
    return documents.slice(startIndex, endIndex).map((doc, idx) => ({
      doc,
      index: startIndex + idx,
    }));
  }, [documents, startIndex, endIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      default:
        return <FileCode className="w-5 h-5 text-slate-500" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
      style={{ height: viewportHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
          }}
        >
          {visibleDocs.map(({ doc }) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument?.(doc)}
              className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              style={{ height: rowHeight }}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar?.(doc.id);
                  }}
                  className="text-slate-400 hover:text-amber-500 focus:outline-none"
                >
                  <Star
                    className={`w-4 h-4 ${
                      doc.starred ? 'fill-amber-400 text-amber-500' : ''
                    }`}
                  />
                </button>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                  {getFileIcon(doc.fileType)}
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {doc.title || doc.originalName}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                    <span>{doc.fileType.toUpperCase()}</span>
                    <span>•</span>
                    <span>{formatSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span>{doc.pageCount} pages</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0 ml-4">
                <Badge
                  variant={
                    doc.status === 'indexed'
                      ? 'success'
                      : doc.status === 'processing'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {doc.status}
                </Badge>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedDocumentList;
