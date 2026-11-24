import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Sparkles,
  FileText,
  Trash2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  X,
  RefreshCw,
  Search,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Folder,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../../services/api';
import { DocumentItem, CollectionItem, ChatMessage, Citation, ConversationItem } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';

export const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Citation excerpt preview modal
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [citationDoc, setCitationDoc] = useState<DocumentItem | null>(null);

  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load of Documents, Collections, and Conversations
  useEffect(() => {
    const init = async () => {
      try {
        const [docsRes, colsRes, convsRes] = await Promise.all([
          api.getDocuments(),
          api.getCollections(),
          api.getConversations(),
        ]);
        setDocuments(docsRes.documents);
        setCollections(colsRes.collections);

        const loadedConvs = convsRes.conversations || [];
        setConversations(loadedConvs);

        // Check if query params specified a doc or collection
        const docIdParam = searchParams.get('docId');
        const colIdParam = searchParams.get('collectionId');

        if (docIdParam) {
          setSelectedDocIds([docIdParam]);
        } else if (colIdParam) {
          const col = colsRes.collections.find(c => c.id === colIdParam);
          if (col) {
            setSelectedDocIds(col.documentIds);
          }
        }

        // Pick initial conversation
        if (loadedConvs.length > 0) {
          const firstConv = loadedConvs[0];
          setActiveConversationId(firstConv.id);
          const msgsRes = await api.getConversationMessages(firstConv.id);
          setMessages(msgsRes.messages);
        } else {
          const histRes = await api.getChatHistory();
          setMessages(histRes.history);
        }
      } catch (err) {
        console.error('Failed to initialize ChatPage:', err);
      }
    };
    init();
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 2. Switch Conversation
  const handleSelectConversation = async (convId: string) => {
    if (convId === activeConversationId) return;
    setActiveConversationId(convId);
    setIsLoading(true);
    try {
      const res = await api.getConversationMessages(convId);
      setMessages(res.messages);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. New Conversation
  const handleNewConversation = async () => {
    try {
      const res = await api.createConversation({
        title: `Research Session #${conversations.length + 1}`
      });
      const newConv = res.conversation;
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  // 4. Delete Conversation
  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation thread?')) return;
    try {
      await api.deleteConversation(convId);
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);
      if (activeConversationId === convId) {
        if (remaining.length > 0) {
          handleSelectConversation(remaining[0].id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // 5. Send Message
  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    setInputQuery('');
    setIsLoading(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.queryChat(
        q,
        selectedDocIds.length > 0 ? selectedDocIds : undefined,
        activeConversationId || undefined
      );
      // Replace temp with real response
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), res.userMessage, res.assistantMessage]);

      // Update active conversation title if it was default
      if (activeConversationId) {
        setConversations(prev =>
          prev.map(c =>
            c.id === activeConversationId
              ? { ...c, messageCount: c.messageCount + 2, updatedAt: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to retrieve grounded context. Please try again.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCitation = (cit: Citation) => {
    setActiveCitation(cit);
    const doc = documents.find(d => d.id === cit.documentId);
    setCitationDoc(doc || null);
  };

  const activeConv = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* ============================================================ */}
      {/* 1. LEFT CONVERSATIONS DRAWER / SIDEBAR */}
      {/* ============================================================ */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-200 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col shrink-0 overflow-hidden`}
      >
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Research Threads
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                activeConversationId === conv.id
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeConversationId === conv.id ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{conv.title}</span>
              </div>
              <button
                onClick={(e) => handleDeleteConversation(e, conv.id)}
                className={`opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity ${
                  activeConversationId === conv.id ? 'text-white/80 hover:text-white' : 'text-slate-400'
                }`}
                title="Delete thread"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No previous threads. Click "New" to start.
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN CHAT WORKSPACE */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900">
        {/* Top Control Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800"
              title={isSidebarOpen ? 'Collapse threads' : 'Open threads'}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {activeConv?.title || 'AI Document Intelligence Studio'}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>RAG Hybrid Dense + BM25</span>
                <span>•</span>
                <span className="text-emerald-600 font-medium">100% Verifiable Source Grounding</span>
              </div>
            </div>
          </div>

          {/* Scope Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDocIds.length === 1 ? selectedDocIds[0] : 'all'}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setSelectedDocIds([]);
                } else {
                  setSelectedDocIds([e.target.value]);
                }
              }}
              className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Scope: All Documents ({documents.length})</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  Scope: {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-semibold ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 dark:bg-slate-800 text-blue-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {msg.role === 'user' ? 'U' : <Sparkles className="w-3.5 h-3.5" />}
              </div>

              {/* Bubble */}
              <div className="space-y-2 max-w-[85%]">
                <div
                  className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Assistant Source Citations */}
                {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                  <div className="pt-1 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Verified Grounded Citations ({msg.citations.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((cit, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOpenCitation(cit)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-[11px] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-white">p. {cit.page}</span>
                          <span className="text-slate-400 truncate max-w-[120px]">{cit.documentTitle}</span>
                          <span className="text-[10px] text-emerald-600 font-mono">
                            {Math.round(cit.matchScore * 100)}%
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-up Questions */}
                {msg.role === 'assistant' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedQuestions.map((sq, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sq)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors text-left"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Bar (Copy / Feedback) */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 pt-0.5 text-slate-400 text-[10px]">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-xl">
              <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-800 text-blue-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-500" />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Retrieving neural embeddings and synthesizing source citations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask questions across indexed documents (e.g. 'What is the liability cap in MSA v2?')..."
              className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || !inputQuery.trim()}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </form>
        </div>
      </div>

      {/* Citation Preview Modal */}
      {activeCitation && (
        <Modal
          isOpen={!!activeCitation}
          onClose={() => setActiveCitation(null)}
          title={`Verified Citation • Page ${activeCitation.page}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">
                Source Document
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">
                {activeCitation.documentTitle}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Page {activeCitation.page} • Neural Match Score: {(activeCitation.matchScore * 100).toFixed(1)}%
              </div>
            </div>

            <div>
              <div className="text-slate-500 font-semibold mb-1">Extracted Source Passage</div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 font-mono text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed border border-slate-200 dark:border-slate-700">
                "{activeCitation.snippet}"
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400">Zero-hallucination verification</span>
              <Button variant="outline" size="sm" onClick={() => setActiveCitation(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
