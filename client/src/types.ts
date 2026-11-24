export interface DocumentEntity {
  people: string[];
  organizations: string[];
  dates: string[];
  terms: string[];
}

export interface DocumentVersion {
  version: number;
  updatedAt: string;
  summary: string;
  author: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  originalName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv' | 'md';
  fileSize: number;
  uploadDate: string;
  status: 'indexed' | 'processing' | 'failed';
  collections: string[];
  tags: string[];
  pageCount: number;
  wordCount: number;
  summary: string;
  keyPoints: string[];
  entities: DocumentEntity;
  versions: DocumentVersion[];
  content: string;
  starred: boolean;
}

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  documentIds: string[];
  createdAt: string;
  isPrivate: boolean;
  documentCount?: number;
  totalPages?: number;
  totalSize?: number;
}

export interface UserSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  organization: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  twoFactorEnabled: boolean;
  sessions: UserSession[];
  apiKeys: ApiKeyItem[];
  preferences: {
    theme: 'system' | 'light' | 'dark';
    aiModel: string;
    ocrEngine: string;
    autoSummarize: boolean;
    emailNotifications: boolean;
    citationConfidenceThreshold: number;
  };
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  targetType: 'document' | 'collection' | 'auth' | 'settings' | 'comparison' | 'export';
  targetTitle: string;
  status: 'success' | 'warning' | 'info';
  details?: string;
}

export interface StructuredExtractionResult {
  document_id: string;
  document_title: string;
  person_names: string[];
  organization_names: string[];
  important_dates: Array<{ date: string; context: string }>;
  deadlines: Array<{ deadline: string; context: string }>;
  monetary_values: Array<{ amount: string; description: string }>;
  contract_terms: string[];
  payment_conditions?: string;
  invoice_details?: Record<string, any>;
  critical_clauses: Array<{ clause_name: string; summary: string; risk_level: string }>;
}

export interface ConversationItem {
  id: string;
  title: string;
  collectionId?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface Citation {
  documentId: string;
  documentTitle: string;
  page: number;
  snippet: string;
  matchScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  suggestedQuestions?: string[];
}

export interface DiffItem {
  id: string;
  type: 'addition' | 'deletion' | 'modification' | 'unchanged';
  section: string;
  lineA?: number;
  lineB?: number;
  textA?: string;
  textB?: string;
  explanation: string;
}

export interface ComparisonResult {
  docA: { id: string; title: string; version: number };
  docB: { id: string; title: string; version: number };
  similarityScore: number;
  totalChanges: number;
  additionsCount: number;
  deletionsCount: number;
  modificationsCount: number;
  aiExecutiveSummary: string;
  keyDifferences: string[];
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    findings: string[];
  };
  diffs: DiffItem[];
}

export interface DashboardStats {
  kpi: {
    totalDocuments: number;
    storageUsedBytes: number;
    storageFormatted: string;
    storageLimitFormatted: string;
    storagePercentage: number;
    totalPages: number;
    totalWords: number;
    totalQueries: number;
    activeCollections: number;
    tokensProcessed: string;
    estimatedHoursSaved: number;
  };
  storageByType: Array<{ type: string; count: number; sizeBytes: number }>;
  weeklyActivity: Array<{ day: string; queries: number; uploads: number }>;
  queryLatencyP95: string;
  accuracyScore: string;
}
