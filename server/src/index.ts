import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { store } from './store.js';
import { compareDocuments } from './compareEngine.js';
import { searchDocuments, answerDocumentQuery } from './qaEngine.js';
import { DocumentItem } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DocuMind Intelligence API',
    documentsCount: store.documents.length,
    collectionsCount: store.collections.length
  });
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  store.logActivity('User signed in', 'auth', email, 'success', 'Web session established');
  return res.json({
    token: `dm_jwt_${Date.now()}_auth_token`,
    user: store.user,
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, organization, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  store.user.name = name;
  store.user.email = email;
  if (organization) store.user.organization = organization;

  store.logActivity('User account created', 'auth', email, 'success', 'New enterprise trial onboarded');
  return res.json({
    token: `dm_jwt_${Date.now()}_auth_token`,
    user: store.user,
  });
});

app.get('/api/auth/me', (_req: Request, res: Response) => {
  res.json({ user: store.user });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  store.logActivity('User logged out', 'auth', store.user.email, 'info');
  res.json({ success: true });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  store.logActivity('Password reset requested', 'auth', email || 'User', 'info');
  res.json({ success: true, message: 'Password reset link sent if account exists.' });
});

app.post('/api/auth/2fa/verify', (req: Request, res: Response) => {
  const { code } = req.body;
  if (code === '123456' || code?.length === 6) {
    return res.json({ verified: true });
  }
  return res.status(400).json({ error: 'Invalid 2FA verification code' });
});

// ==========================================
// DOCUMENT ROUTES
// ==========================================

app.get('/api/documents', (req: Request, res: Response) => {
  const { collection, search, fileType, sort, starred } = req.query;

  let docs = [...store.documents];

  if (collection && collection !== 'all') {
    docs = docs.filter(d => d.collections.includes(String(collection)));
  }

  if (fileType && fileType !== 'all') {
    docs = docs.filter(d => d.fileType === String(fileType));
  }

  if (starred === 'true') {
    docs = docs.filter(d => d.starred);
  }

  if (search && String(search).trim()) {
    const q = String(search).toLowerCase();
    docs = docs.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.summary.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (sort === 'name_asc') {
    docs.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'name_desc') {
    docs.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sort === 'size_desc') {
    docs.sort((a, b) => b.fileSize - a.fileSize);
  } else {
    // Default newest first
    docs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }

  res.json({ documents: docs, total: docs.length });
});

app.get('/api/documents/:id', (req: Request, res: Response) => {
  const doc = store.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json({ document: doc });
});

app.post('/api/documents/upload', upload.single('file'), (req: Request, res: Response) => {
  let originalName = 'Uploaded_Document.pdf';
  let fileSize = 1500000;
  let fileType: DocumentItem['fileType'] = 'pdf';
  let title = req.body.title || 'New Document';
  let content = req.body.content || '';
  const collectionId = req.body.collectionId;
  const tags = req.body.tags ? JSON.parse(req.body.tags) : ['General', 'Upload'];

  if (req.file) {
    originalName = req.file.originalname;
    fileSize = req.file.size;
    const ext = path.extname(originalName).toLowerCase().replace('.', '');
    if (['pdf', 'docx', 'txt', 'csv', 'md'].includes(ext)) {
      fileType = ext as DocumentItem['fileType'];
    }
    if (!title || title === 'New Document') {
      title = originalName.replace(/\.[^/.]+$/, '');
    }

    // If text file, read content
    if (ext === 'txt' || ext === 'md' || ext === 'csv') {
      try {
        content = fs.readFileSync(req.file.path, 'utf-8');
      } catch (e) {
        content = `Extracted textual content for ${originalName}`;
      }
    } else {
      content = `Parsed contents for ${originalName}.\n` +
        `This document contains business terms, technical specifications, and metadata indexed by DocuMind neural ingestion engine.`;
    }
  } else if (req.body.text) {
    content = req.body.text;
  }

  const newDocId = `doc_${Date.now()}`;
  const words = content.split(/\s+/).filter(Boolean).length;
  const pages = Math.max(1, Math.round(words / 400));

  const newDoc: DocumentItem = {
    id: newDocId,
    title,
    originalName,
    fileType,
    fileSize,
    uploadDate: new Date().toISOString(),
    status: 'indexed',
    collections: collectionId ? [collectionId] : [],
    tags,
    pageCount: pages,
    wordCount: Math.max(words, 450),
    summary: `Automated executive summary for ${title}: Document contains comprehensive guidelines, contractual parameters, and operational instructions. Key provisions include compliance requirements and SLA operational benchmarks.`,
    keyPoints: [
      `Primary focus on enterprise standard requirements for ${title}.`,
      'Data retention and confidentiality guidelines established.',
      'SLA performance benchmarks and service credit thresholds outlined.',
      'Review cycle mandated semi-annually with cross-functional approval.'
    ],
    entities: {
      people: ['Alex Morgan', 'System Auditor'],
      organizations: ['DocuMind AI Inc.', 'Enterprise Client'],
      dates: [new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
      terms: ['Compliance', 'Confidentiality', 'Governance', 'Operations']
    },
    versions: [
      {
        version: 1,
        updatedAt: new Date().toISOString(),
        summary: 'Initial uploaded version.',
        author: store.user.name,
      }
    ],
    content: content || `Full document content for ${title}`,
    starred: false,
  };

  store.documents.unshift(newDoc);

  // If assigned to a collection, add to collection
  if (collectionId) {
    const col = store.collections.find(c => c.id === collectionId);
    if (col && !col.documentIds.includes(newDocId)) {
      col.documentIds.push(newDocId);
    }
  }

  store.logActivity('Uploaded document', 'document', title, 'success', `File size: ${(fileSize / 1024).toFixed(1)} KB, ${pages} pages`);

  res.status(201).json({ document: newDoc });
});

app.patch('/api/documents/:id', (req: Request, res: Response) => {
  const doc = store.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const { title, tags, collections, starred } = req.body;
  if (title !== undefined) doc.title = title;
  if (tags !== undefined) doc.tags = tags;
  if (collections !== undefined) doc.collections = collections;
  if (starred !== undefined) doc.starred = starred;

  store.logActivity('Updated document metadata', 'document', doc.title, 'info');
  res.json({ document: doc });
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const index = store.documents.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const [removed] = store.documents.splice(index, 1);
  // Remove from all collections
  store.collections.forEach(c => {
    c.documentIds = c.documentIds.filter(id => id !== req.params.id);
  });

  store.logActivity('Deleted document', 'document', removed.title, 'warning');
  res.json({ success: true, deletedId: req.params.id });
});

app.post('/api/documents/:id/reindex', (req: Request, res: Response) => {
  const doc = store.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  doc.status = 'indexed';
  store.logActivity('Re-indexed document', 'document', doc.title, 'success', 'All vector embeddings and OCR refreshed');
  res.json({ document: doc, message: 'Re-indexing complete' });
});

// ==========================================
// COLLECTION ROUTES
// ==========================================

app.get('/api/collections', (_req: Request, res: Response) => {
  const enriched = store.collections.map(col => {
    const docs = store.documents.filter(d => col.documentIds.includes(d.id));
    const totalPages = docs.reduce((acc, d) => acc + d.pageCount, 0);
    const totalSize = docs.reduce((acc, d) => acc + d.fileSize, 0);
    return {
      ...col,
      documentCount: docs.length,
      totalPages,
      totalSize,
    };
  });
  res.json({ collections: enriched });
});

app.get('/api/collections/:id', (req: Request, res: Response) => {
  const col = store.collections.find(c => c.id === req.params.id);
  if (!col) {
    return res.status(404).json({ error: 'Collection not found' });
  }
  const docs = store.documents.filter(d => col.documentIds.includes(d.id));
  res.json({ collection: col, documents: docs });
});

app.post('/api/collections', (req: Request, res: Response) => {
  const { name, description, color, icon, isPrivate } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Collection name is required' });
  }

  const newCol = {
    id: `col_${Date.now()}`,
    name,
    description: description || '',
    color: color || '#4f46e5',
    icon: icon || 'Folder',
    documentIds: [],
    createdAt: new Date().toISOString(),
    isPrivate: Boolean(isPrivate),
  };

  store.collections.push(newCol);
  store.logActivity('Created collection', 'collection', name, 'success');
  res.status(201).json({ collection: newCol });
});

app.patch('/api/collections/:id', (req: Request, res: Response) => {
  const col = store.collections.find(c => c.id === req.params.id);
  if (!col) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  const { name, description, color, icon, isPrivate, documentIds } = req.body;
  if (name !== undefined) col.name = name;
  if (description !== undefined) col.description = description;
  if (color !== undefined) col.color = color;
  if (icon !== undefined) col.icon = icon;
  if (isPrivate !== undefined) col.isPrivate = isPrivate;
  if (documentIds !== undefined) col.documentIds = documentIds;

  store.logActivity('Updated collection', 'collection', col.name, 'info');
  res.json({ collection: col });
});

app.delete('/api/collections/:id', (req: Request, res: Response) => {
  const index = store.collections.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  const [removed] = store.collections.splice(index, 1);
  // Remove reference from documents
  store.documents.forEach(d => {
    d.collections = d.collections.filter(cid => cid !== req.params.id);
  });

  store.logActivity('Deleted collection', 'collection', removed.name, 'warning');
  res.json({ success: true, deletedId: req.params.id });
});

app.post('/api/collections/:id/documents', (req: Request, res: Response) => {
  const col = store.collections.find(c => c.id === req.params.id);
  if (!col) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  const { documentId, action } = req.body;
  if (!documentId) {
    return res.status(400).json({ error: 'documentId required' });
  }

  const doc = store.getDocument(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (action === 'remove') {
    col.documentIds = col.documentIds.filter(id => id !== documentId);
    doc.collections = doc.collections.filter(id => id !== col.id);
  } else {
    if (!col.documentIds.includes(documentId)) {
      col.documentIds.push(documentId);
    }
    if (!doc.collections.includes(col.id)) {
      doc.collections.push(col.id);
    }
  }

  res.json({ collection: col });
});

// ==========================================
// CHAT & SEARCH ROUTES
// ==========================================

app.post('/api/chat/query', (req: Request, res: Response) => {
  const { query, documentIds } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const userMsg = {
    id: `msg_${Date.now()}_u`,
    role: 'user' as const,
    content: query,
    timestamp: new Date().toISOString(),
  };

  const assistantMsg = answerDocumentQuery(store.documents, query, documentIds);

  store.chatHistory.push(userMsg);
  store.chatHistory.push(assistantMsg);

  store.logActivity('AI Q&A query executed', 'document', query.substring(0, 40) + '...', 'info', `Retrieved ${assistantMsg.citations?.length || 0} citations`);

  res.json({
    userMessage: userMsg,
    assistantMessage: assistantMsg,
  });
});

app.get('/api/chat/history', (_req: Request, res: Response) => {
  res.json({ history: store.chatHistory });
});

app.delete('/api/chat/history', (_req: Request, res: Response) => {
  store.chatHistory = [];
  res.json({ success: true });
});

app.get('/api/search', (req: Request, res: Response) => {
  const { q } = req.query;
  const results = searchDocuments(store.documents, String(q || ''));
  res.json({ results, total: results.length });
});

// ==========================================
// DOCUMENT COMPARISON
// ==========================================

app.post('/api/compare', (req: Request, res: Response) => {
  const { docAId, docBId } = req.body;
  if (!docAId || !docBId) {
    return res.status(400).json({ error: 'docAId and docBId are required' });
  }

  const docA = store.getDocument(docAId);
  const docB = store.getDocument(docBId);

  if (!docA || !docB) {
    return res.status(404).json({ error: 'One or both documents not found' });
  }

  const result = compareDocuments(docA, docB);
  store.logActivity('Compared documents', 'comparison', `${docA.title} vs ${docB.title}`, 'success', `Similarity: ${result.similarityScore}%, Total changes: ${result.totalChanges}`);

  res.json({ comparison: result });
});

// ==========================================
// REPORTS & ANALYTICS
// ==========================================

app.get('/api/reports/stats', (_req: Request, res: Response) => {
  const totalDocs = store.documents.length;
  const totalSize = store.documents.reduce((acc, d) => acc + d.fileSize, 0);
  const totalPages = store.documents.reduce((acc, d) => acc + d.pageCount, 0);
  const totalWords = store.documents.reduce((acc, d) => acc + d.wordCount, 0);

  const byType: Record<string, { count: number; size: number }> = {};
  store.documents.forEach(d => {
    if (!byType[d.fileType]) byType[d.fileType] = { count: 0, size: 0 };
    byType[d.fileType].count++;
    byType[d.fileType].size += d.fileSize;
  });

  const storageByType = Object.keys(byType).map(type => ({
    type: type.toUpperCase(),
    count: byType[type].count,
    sizeBytes: byType[type].size,
  }));

  res.json({
    kpi: {
      totalDocuments: totalDocs,
      storageUsedBytes: totalSize,
      storageFormatted: `${(totalSize / (1024 * 1024)).toFixed(1)} MB`,
      storageLimitFormatted: '50.0 GB',
      storagePercentage: Number(((totalSize / (50 * 1024 * 1024 * 1024)) * 100).toFixed(2)),
      totalPages,
      totalWords,
      totalQueries: 1420 + store.chatHistory.length,
      activeCollections: store.collections.length,
      tokensProcessed: '18.4M',
      estimatedHoursSaved: 164,
    },
    storageByType,
    weeklyActivity: [
      { day: 'Mon', queries: 145, uploads: 12 },
      { day: 'Tue', queries: 210, uploads: 18 },
      { day: 'Wed', queries: 185, uploads: 9 },
      { day: 'Thu', queries: 290, uploads: 24 },
      { day: 'Fri', queries: 320, uploads: 15 },
      { day: 'Sat', queries: 75, uploads: 3 },
      { day: 'Sun', queries: 95, uploads: 4 },
    ],
    queryLatencyP95: '280ms',
    accuracyScore: '99.4%',
  });
});

app.get('/api/reports/activity', (req: Request, res: Response) => {
  const { type, limit } = req.query;
  let logs = [...store.activityLogs];

  if (type && type !== 'all') {
    logs = logs.filter(l => l.targetType === type);
  }

  const max = limit ? parseInt(String(limit), 10) : 50;
  res.json({ activity: logs.slice(0, max), total: logs.length });
});

app.get('/api/reports/export', (req: Request, res: Response) => {
  const { format } = req.query;
  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=documind_audit_logs.json');
    return res.json(store.activityLogs);
  }

  // CSV export
  const headers = ['ID', 'Timestamp', 'User', 'Action', 'Target Type', 'Target Title', 'Status', 'Details'];
  const rows = store.activityLogs.map(l => [
    l.id,
    l.timestamp,
    `"${l.userName}"`,
    `"${l.action}"`,
    l.targetType,
    `"${l.targetTitle.replace(/"/g, '""')}"`,
    l.status,
    `"${(l.details || '').replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=documind_audit_logs.csv');
  return res.send(csv);
});

// ==========================================
// SETTINGS ROUTES
// ==========================================

app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({
    user: store.user,
    availableModels: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Multimodal Document Engine)', latency: 'Fast (180ms)', contextWindow: '2M Tokens' },
      { id: 'gpt-4o', name: 'GPT-4o Document Specialist', latency: 'Moderate (320ms)', contextWindow: '128k Tokens' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet (Legal & Logic)', latency: 'Balanced (290ms)', contextWindow: '200k Tokens' }
    ],
    ocrEngines: [
      { id: 'neural-v3', name: 'DocuMind Neural Layout OCR v3 (Recommended)', accuracy: '99.8%' },
      { id: 'tesseract-fast', name: 'Standard Lightweight OCR', accuracy: '94.2%' }
    ]
  });
});

app.patch('/api/settings/profile', (req: Request, res: Response) => {
  const { name, department, role, organization } = req.body;
  if (name) store.user.name = name;
  if (department) store.user.department = department;
  if (role) store.user.role = role;
  if (organization) store.user.organization = organization;

  store.logActivity('Updated user profile', 'settings', store.user.name, 'info');
  res.json({ user: store.user });
});

app.patch('/api/settings/preferences', (req: Request, res: Response) => {
  const { theme, aiModel, ocrEngine, autoSummarize, emailNotifications } = req.body;
  if (theme) store.user.preferences.theme = theme;
  if (aiModel) store.user.preferences.aiModel = aiModel;
  if (ocrEngine) store.user.preferences.ocrEngine = ocrEngine;
  if (autoSummarize !== undefined) store.user.preferences.autoSummarize = autoSummarize;
  if (emailNotifications !== undefined) store.user.preferences.emailNotifications = emailNotifications;

  store.logActivity('Updated system preferences', 'settings', 'Preferences', 'info');
  res.json({ preferences: store.user.preferences });
});

app.post('/api/settings/api-keys', (req: Request, res: Response) => {
  const { name } = req.body;
  const newKey = {
    id: `key_${Date.now()}`,
    name: name || 'API Token',
    prefix: `dm_${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString().split('T')[0],
    lastUsed: 'Never',
    status: 'active' as const,
  };

  store.user.apiKeys.push(newKey);
  store.logActivity('Generated new API Key', 'settings', newKey.name, 'warning');
  res.status(201).json({ apiKey: newKey, secret: `dm_live_secret_${Date.now()}_${Math.random().toString(36).substring(2)}` });
});

app.delete('/api/settings/api-keys/:id', (req: Request, res: Response) => {
  const idx = store.user.apiKeys.findIndex(k => k.id === req.params.id);
  if (idx !== -1) {
    const [removed] = store.user.apiKeys.splice(idx, 1);
    store.logActivity('Revoked API Key', 'settings', removed.name, 'warning');
  }
  res.json({ success: true });
});

app.delete('/api/settings/sessions/:id', (req: Request, res: Response) => {
  const idx = store.user.sessions.findIndex(s => s.id === req.params.id);
  if (idx !== -1) {
    const [removed] = store.user.sessions.splice(idx, 1);
    store.logActivity('Terminated user session', 'settings', removed.device, 'warning');
  }
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`[DocuMind Server] Running on http://localhost:${PORT}`);
});
