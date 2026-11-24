import {
  DocumentItem,
  CollectionItem,
  UserProfile,
  ActivityLogItem,
  ChatMessage,
  ComparisonResult,
  DashboardStats,
  ConversationItem,
  StructuredExtractionResult,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('dm_token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMessage = 'An error occurred';
    try {
      const errData = await response.json();
      errMessage = errData.error || errData.message || response.statusText;
    } catch {
      errMessage = response.statusText;
    }
    throw new Error(errMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    return request<{ token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name: string, email: string, password: string, organization?: string) {
    return request<{ token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, organization }),
    });
  },

  async getMe() {
    return request<{ user: UserProfile }>('/auth/me');
  },

  async logout() {
    return request<{ success: boolean }>('/auth/logout', { method: 'POST' });
  },

  async forgotPassword(email: string) {
    return request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verify2FA(code: string) {
    return request<{ verified: boolean }>('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  // Documents
  async getDocuments(params?: {
    collection?: string;
    search?: string;
    fileType?: string;
    sort?: string;
    starred?: boolean;
  }) {
    const query = new URLSearchParams();
    if (params?.collection) query.set('collection', params.collection);
    if (params?.search) query.set('search', params.search);
    if (params?.fileType) query.set('fileType', params.fileType);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.starred !== undefined) query.set('starred', String(params.starred));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ documents: DocumentItem[]; total: number }>(`/documents${qs}`);
  },

  async getDocument(id: string) {
    return request<{ document: DocumentItem }>(`/documents/${id}`);
  },

  async uploadDocument(formData: FormData) {
    return request<{ document: DocumentItem }>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async updateDocument(id: string, updates: Partial<DocumentItem>) {
    return request<{ document: DocumentItem }>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteDocument(id: string) {
    return request<{ success: boolean; deletedId: string }>(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  async reindexDocument(id: string) {
    return request<{ document: DocumentItem; message: string }>(`/documents/${id}/reindex`, {
      method: 'POST',
    });
  },

  async extractStructured(id: string) {
    return request<{ extraction: StructuredExtractionResult }>(`/documents/${id}/extract-structured`, {
      method: 'POST',
    });
  },

  // Collections
  async getCollections() {
    return request<{ collections: CollectionItem[] }>('/collections');
  },

  async getCollection(id: string) {
    return request<{ collection: CollectionItem; documents: DocumentItem[] }>(`/collections/${id}`);
  },

  async createCollection(data: Partial<CollectionItem>) {
    return request<{ collection: CollectionItem }>('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCollection(id: string, updates: Partial<CollectionItem>) {
    return request<{ collection: CollectionItem }>(`/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteCollection(id: string) {
    return request<{ success: boolean; deletedId: string }>(`/collections/${id}`, {
      method: 'DELETE',
    });
  },

  async updateCollectionDocuments(collectionId: string, documentId: string, action: 'add' | 'remove') {
    return request<{ collection: CollectionItem }>(`/collections/${collectionId}/documents`, {
      method: 'POST',
      body: JSON.stringify({ documentId, action }),
    });
  },

  // Chat & Search
  async queryChat(query: string, documentIds?: string[], conversationId?: string) {
    return request<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>('/chat/query', {
      method: 'POST',
      body: JSON.stringify({ query, documentIds, conversationId }),
    });
  },

  async getConversations() {
    return request<{ conversations: ConversationItem[] }>('/chat/conversations');
  },

  async createConversation(data?: { title?: string; collectionId?: string; documentIds?: string[] }) {
    return request<{ conversation: ConversationItem }>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  async getConversationMessages(id: string) {
    return request<{ conversation: ConversationItem; messages: ChatMessage[] }>(`/chat/conversations/${id}/messages`);
  },

  async deleteConversation(id: string) {
    return request<{ success: boolean; deletedId: string }>(`/chat/conversations/${id}`, {
      method: 'DELETE',
    });
  },

  async getChatHistory(conversationId?: string) {
    const qs = conversationId ? `?conversation_id=${conversationId}` : '';
    return request<{ history: ChatMessage[] }>(`/chat/history${qs}`);
  },

  async clearChatHistory() {
    return request<{ success: boolean }>('/chat/history', { method: 'DELETE' });
  },

  async search(q: string) {
    return request<{
      results: Array<{
        document: DocumentItem;
        snippet: string;
        matchScore: number;
        page: number;
      }>;
      total: number;
    }>(`/search?q=${encodeURIComponent(q)}`);
  },

  // Compare
  async compareDocuments(docAId: string, docBId: string) {
    return request<{ comparison: ComparisonResult }>('/compare', {
      method: 'POST',
      body: JSON.stringify({ docAId, docBId }),
    });
  },

  // Reports
  async getDashboardStats() {
    return request<DashboardStats>('/reports/stats');
  },

  async getActivityLogs(params?: { type?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ activity: ActivityLogItem[]; total: number }>(`/reports/activity${qs}`);
  },

  // Settings
  async getSettings() {
    return request<{
      user: UserProfile;
      availableModels: Array<{ id: string; name: string; latency: string; contextWindow: string }>;
      ocrEngines: Array<{ id: string; name: string; accuracy: string }>;
    }>('/settings');
  },

  async updateProfile(profile: Partial<UserProfile>) {
    return request<{ user: UserProfile }>('/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    });
  },

  async updatePreferences(preferences: Partial<UserProfile['preferences']>) {
    return request<{ preferences: UserProfile['preferences'] }>('/settings/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  },

  async createApiKey(name: string) {
    return request<{ apiKey: UserProfile['apiKeys'][0]; secret: string }>('/settings/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async revokeApiKey(id: string) {
    return request<{ success: boolean }>(`/settings/api-keys/${id}`, { method: 'DELETE' });
  },

  async revokeSession(id: string) {
    return request<{ success: boolean }>(`/settings/sessions/${id}`, { method: 'DELETE' });
  },
};
