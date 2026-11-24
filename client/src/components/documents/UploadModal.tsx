import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Plus, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CollectionItem, DocumentItem } from '../../types';
import { api } from '../../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: CollectionItem[];
  onUploadSuccess: (doc: DocumentItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  collections,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Enterprise']);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
    setError(null);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !title) {
      setError('Please select a file or provide content to upload');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(20);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('title', title || (file ? file.name : 'Untitled Document'));
    if (collectionId) formData.append('collectionId', collectionId);
    formData.append('tags', JSON.stringify(tags));

    try {
      setUploadProgress(65);
      const res = await api.uploadDocument(formData);
      setUploadProgress(100);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      onUploadSuccess(res.document);
      handleReset();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTitle('');
    setCollectionId('');
    setTags(['Enterprise']);
    setUploadProgress(0);
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Document"
      description="Ingest PDFs, Word files, contracts, or spreadsheets into your AI workspace"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dropzone Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
              : file
              ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.xlsx,.xls,.txt,.csv,.md"
            className="hidden"
            onChange={handleFileChange}
          />

          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-sm">
                {file.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for neural extraction
              </p>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-2 font-medium hover:underline">
                Click to change file
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Drag and drop your file here, or browse
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, DOCX, XLSX, CSV, TXT up to 50MB
              </p>
            </div>
          )}
        </div>

        {/* Document Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Document Display Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master Cloud Services Agreement 2026"
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Collection Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Assign to Collection (Optional)
          </label>
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">No Collection (Unassigned)</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tags (Press Enter to add)
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={tags.length === 0 ? "Add tags like 'Contract', 'Q3'..." : ""}
              className="flex-1 min-w-[100px] text-xs bg-transparent border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Progress Bar when uploading */}
        {isUploading && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Extracting layouts &amp; generating vector embeddings...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isUploading} disabled={!file && !title}>
            Ingest Document
          </Button>
        </div>
      </form>
    </Modal>
  );
};
