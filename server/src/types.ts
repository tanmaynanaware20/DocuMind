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
