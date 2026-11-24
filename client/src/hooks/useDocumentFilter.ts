import { useMemo } from 'react';
import { DocumentItem } from '../types';

export interface DocumentFilterOptions {
  search: string;
  collectionId: string;
  fileType: string;
  sortBy: string;
  starredOnly: boolean;
}

export function useDocumentFilter(documents: DocumentItem[], options: DocumentFilterOptions) {
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // 1. Text Search Filter
    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase();
      result = result.filter(
        d =>
          d.title.toLowerCase().includes(q) ||
          d.originalName.toLowerCase().includes(q) ||
          (d.tags && d.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // 2. Collection ID Filter
    if (options.collectionId && options.collectionId !== 'all') {
      result = result.filter(d => d.collections && d.collections.includes(options.collectionId));
    }

    // 3. File Type Filter
    if (options.fileType && options.fileType !== 'all') {
      result = result.filter(d => d.fileType.toLowerCase() === options.fileType.toLowerCase());
    }

    // 4. Starred Only
    if (options.starredOnly) {
      result = result.filter(d => d.starred);
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (options.sortBy === 'name_asc') {
        return a.title.localeCompare(b.title);
      } else if (options.sortBy === 'name_desc') {
        return b.title.localeCompare(a.title);
      } else if (options.sortBy === 'size_desc') {
        return b.fileSize - a.fileSize;
      } else if (options.sortBy === 'size_asc') {
        return a.fileSize - b.fileSize;
      } else if (options.sortBy === 'oldest') {
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      }
      // default: newest first
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    });

    return result;
  }, [documents, options.search, options.collectionId, options.fileType, options.sortBy, options.starredOnly]);

  return {
    filteredDocuments,
    totalCount: documents.length,
    filteredCount: filteredDocuments.length
  };
}
