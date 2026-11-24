import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User,
  Shield,
  Key,
  Cpu,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  Plus,
  Lock,
  Smartphone,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { UserProfile, ApiKeyItem, UserSession } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'api' | 'ai' | 'billing'>('profile');
  const [searchParams] = useSearchParams();

  // Profile Form state
  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [role, setRole] = useState(user?.role || 'Head of AI');
  const [department, setDepartment] = useState(user?.department || 'Legal Operations');
  const [organization, setOrganization] = useState(user?.organization || 'DocuMind Global Enterprise');
  const [profileSaved, setProfileSaved] = useState(false);

  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled ?? true);
  const [sessions, setSessions] = useState<UserSession[]>(user?.sessions || []);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(user?.apiKeys || []);

  // API Key creation
  const [createKeyModalOpen, setCreateKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // AI Preferences
  const [aiModel, setAiModel] = useState(user?.preferences?.aiModel || 'Gemini 1.5 Pro (Multimodal Document Engine)');
  const [ocrEngine, setOcrEngine] = useState(user?.preferences?.ocrEngine || 'DocuMind Neural OCR v3');
  const [autoSummarize, setAutoSummarize] = useState(user?.preferences?.autoSummarize ?? true);
  const [emailNotifs, setEmailNotifs] = useState(user?.preferences?.emailNotifications ?? true);
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'security') setActiveTab('security');
    else if (tabParam === 'api') setActiveTab('api');
  }, [searchParams]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile({ name, role, department, organization });
      updateUser(res.user);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await api.updatePreferences({
        theme,
        aiModel,
        ocrEngine,
        autoSummarize,
        emailNotifications: emailNotifs,
        citationConfidenceThreshold: 0.85,
      });
      setPrefSaved(true);
      setTimeout(() => setPrefSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await api.createApiKey(newKeyName);
      setApiKeys(prev => [res.apiKey, ...prev]);
      setGeneratedSecret(res.secret);
      setNewKeyName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (confirm('Revoke this API Key permanently?')) {
      try {
        await api.revokeApiKey(id);
        setApiKeys(prev => prev.filter(k => k.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await api.revokeSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Workspace Settings &amp; Security
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage identity, encryption keys, active sessions, and AI model parameters
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security &amp; 2FA</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'api'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Tokens ({apiKeys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'ai'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Engine &amp; OCR</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'billing'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Plan &amp; Quotas</span>
        </button>
      </div>

      {/* TAB 1: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200"
            />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <Badge variant="primary" size="sm" className="mt-1">
                {user?.plan || 'Enterprise'} Plan
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            {profileSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile information successfully updated.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Email (Verified Single Sign-On)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'alex.morgan@documind.io'}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Organization / Company
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button type="submit" variant="primary" size="sm">
              Save Profile Changes
            </Button>
          </form>
        </div>
      )}

      {/* TAB 2: Security & 2FA */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* 2FA Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Two-Factor Authentication (2FA)
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Require a TOTP verification code from Google Authenticator or 1Password on sign-in.
                </p>
              </div>

              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${
                  twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {twoFactorEnabled && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>2FA Protection is active. Authenticator app linked.</span>
              </div>
            )}
          </div>

          {/* Active Sessions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Active Authorized Sessions ({sessions.length})
            </h3>
            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{sess.device}</span>
                      {sess.isCurrent && (
                        <Badge variant="success" size="sm">Current Session</Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      IP: {sess.ip} • {sess.location} • Last active: {sess.lastActive}
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="text-rose-500 hover:text-rose-600 text-xs"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: API Tokens */}
      {activeTab === 'api' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Enterprise API Keys</h3>
              <p className="text-xs text-slate-500 mt-0.5">Use these secret keys to ingest documents via REST API pipelines</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setGeneratedSecret(null);
                setCreateKeyModalOpen(true);
              }}
            >
              Generate Secret Key
            </Button>
          </div>

          <div className="space-y-3">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{k.name}</div>
                  <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                    {k.prefix} • Created: {k.createdAt} • Last used: {k.lastUsed}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={k.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {k.status.toUpperCase()}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    onClick={() => handleRevokeApiKey(k.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AI Engine & OCR Preferences */}
      {activeTab === 'ai' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Engine &amp; OCR Parameters</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select models, parsing heuristics, and automated extraction policies</p>
          </div>

          {prefSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Preferences successfully saved.</span>
            </div>
          )}

          <div className="space-y-4 max-w-xl text-xs">
            {/* Primary Model */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary LLM Synthesis Model
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Gemini 1.5 Pro (Multimodal Document Engine)">
                  Gemini 1.5 Pro (Fastest, 2M context, 180ms TTFT)
                </option>
                <option value="GPT-4o Document Specialist">
                  GPT-4o Document Specialist (128k context)
                </option>
                <option value="Claude 3.5 Sonnet (Legal & Logic)">
                  Claude 3.5 Sonnet (Legal &amp; Contract Logic)
                </option>
              </select>
            </div>

            {/* OCR Engine */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Neural Layout Parser &amp; OCR Engine
              </label>
              <select
                value={ocrEngine}
                onChange={(e) => setOcrEngine(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="DocuMind Neural OCR v3">
                  DocuMind Neural Layout OCR v3 (99.8% precision, handles multi-column)
                </option>
                <option value="Standard Lightweight OCR">
                  Standard Lightweight OCR (Fast extraction)
                </option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSummarize}
                  onChange={(e) => setAutoSummarize(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Automatically generate executive summary upon document ingestion
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Send email digest for high-risk redline alerts and weekly audit logs
                </span>
              </label>
            </div>

            <Button variant="primary" size="sm" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </div>
        </div>
      )}

      {/* TAB 5: Billing & Quotas */}
      {activeTab === 'billing' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="md">Enterprise Unlimited</Badge>
                <span className="text-xs text-slate-500">Contract #DM-ENT-2026-904</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">
                Active Organization Subscription
              </h3>
            </div>
            <Button variant="outline" size="sm">
              Manage Agreement
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500">Monthly Document Limit</div>
              <div className="text-xl font-bold mt-1 text-slate-900 dark:text-white">Unlimited</div>
              <div className="text-[10px] text-emerald-600 mt-1">Fair use enterprise tier</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500">Dedicated Storage</div>
              <div className="text-xl font-bold mt-1 text-slate-900 dark:text-white">50.0 GB</div>
              <div className="text-[10px] text-slate-400 mt-1">11.5 MB consumed (0.02%)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500">Service Level Guarantee</div>
              <div className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">99.99% SLA</div>
              <div className="text-[10px] text-slate-400 mt-1">24/7 dedicated telephone line</div>
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Modal */}
      <Modal
        isOpen={createKeyModalOpen}
        onClose={() => setCreateKeyModalOpen(false)}
        title="Create API Token"
        description="Generate a secret token for automated document ingestion scripts"
        maxWidth="md"
      >
        {generatedSecret ? (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
              Make sure to copy your secret key now. You will not be able to see it again!
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-xs flex items-center justify-between">
              <span className="truncate mr-2">{generatedSecret}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedSecret);
                  setCopiedSecret(true);
                  setTimeout(() => setCopiedSecret(false), 2000);
                }}
                className="text-indigo-600 hover:text-indigo-500 shrink-0 cursor-pointer"
              >
                {copiedSecret ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <Button variant="primary" className="w-full" onClick={() => setCreateKeyModalOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateApiKey} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Token Name / Description
              </label>
              <input
                type="text"
                required
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Zapier / Slack Bot Pipeline"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCreateKeyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Generate Token
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
