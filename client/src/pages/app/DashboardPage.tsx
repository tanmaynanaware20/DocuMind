import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Folder,
  MessageSquare,
  GitCompare,
  Upload,
  Plus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  HardDrive,
  Shield,
  Star,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { DocumentItem, CollectionItem, DashboardStats, ActivityLogItem } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useAuth } from '../../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, docsRes, colsRes, actRes] = await Promise.all([
          api.getDashboardStats(),
          api.getDocuments({ starred: true }),
          api.getCollections(),
          api.getActivityLogs({ limit: 6 })
        ]);
        setStats(statsRes);
        setDocuments(docsRes.documents);
        setCollections(colsRes.collections);
        setActivities(actRes.activity);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const kpi = stats?.kpi;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* 1. WELCOME HEADER & QUICK ACTIONS */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Workspace: {user?.organization || 'Enterprise Global'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Alex Morgan'}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl">
            {kpi?.totalDocuments || 5} indexed documents across {kpi?.activeCollections || 4} collections.
            System operating at {stats?.accuracyScore || '99.4%'} citation confidence.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/app/documents?action=upload')}
            className="px-4 py-2 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => navigate('/app/chat')}
            className="px-4 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
          <button
            onClick={() => navigate('/app/compare')}
            className="px-4 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. METRIC KPI CARDS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Documents */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Indexed Documents</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {kpi?.totalDocuments}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              100% indexed
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {kpi?.totalPages} total pages • {kpi?.totalWords.toLocaleString()} words
          </div>
        </div>

        {/* Card 2: Storage Used */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Cloud Storage</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {kpi?.storageFormatted}
            </span>
            <span className="text-xs text-slate-400">of {kpi?.storageLimitFormatted}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.max(4, kpi?.storagePercentage || 4)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Queries Processed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">RAG Queries</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {kpi?.totalQueries.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-sky-600 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">
              p95 {stats?.queryLatencyP95}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {kpi?.tokensProcessed} tokens processed
          </div>
        </div>

        {/* Card 4: Hours Saved */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Analyst Time Saved</span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {kpi?.estimatedHoursSaved} Hours
            </span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            ≈ ${(kpi?.estimatedHoursSaved || 164) * 85} in review costs
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. VISUAL ACTIVITY & STORAGE BREAKDOWN */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Weekly Query &amp; Ingestion Volume
              </h3>
              <p className="text-xs text-slate-400">Activity across all workspaces for the last 7 days</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>Queries</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Uploads</span>
              </span>
            </div>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="pt-6 pb-2 grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 border-b border-slate-100 dark:border-slate-800">
            {stats?.weeklyActivity.map((day) => {
              const maxQ = 350;
              const qHeight = Math.min(100, Math.round((day.queries / maxQ) * 100));
              const uHeight = Math.min(100, Math.round((day.uploads / 30) * 100));

              return (
                <div key={day.day} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    {/* Queries bar */}
                    <div
                      title={`${day.queries} queries`}
                      style={{ height: `${qHeight}%` }}
                      className="w-3 sm:w-5 bg-indigo-600 rounded-t-md hover:opacity-85 transition-opacity"
                    />
                    {/* Uploads bar */}
                    <div
                      title={`${day.uploads} uploads`}
                      style={{ height: `${uHeight}%` }}
                      className="w-2 sm:w-3 bg-emerald-500 rounded-t-md hover:opacity-85 transition-opacity"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Storage Breakdown by File Format */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Storage by Document Type
            </h3>
            <p className="text-xs text-slate-400 mb-6">File format allocation across active vaults</p>

            <div className="space-y-4">
              {stats?.storageByType.map((item, idx) => {
                const total = stats.kpi.storageUsedBytes || 1;
                const pct = Math.round((item.sizeBytes / total) * 100);
                const colors = ['bg-indigo-600', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500'];
                const color = colors[idx % colors.length];

                return (
                  <div key={item.type} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.type} Files ({item.count})
                      </span>
                      <span className="text-slate-500">
                        {(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/app/documents"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-between"
            >
              <span>Manage all document files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. PINNED DOCUMENTS & AUDIT ACTIVITY FEED */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Starred / Priority Documents */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Starred Priority Documents
              </h3>
            </div>
            <Link
              to="/app/documents"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              View all ({kpi?.totalDocuments})
            </Link>
          </div>

          <div className="space-y-3">
            {documents.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/app/documents?docId=${doc.id}`)}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                      {doc.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{doc.fileType.toUpperCase()}</span>
                      <span>•</span>
                      <span>{doc.pageCount} pages</span>
                      <span>•</span>
                      <span>{(doc.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="success" size="sm">Indexed</Badge>
                  <Eye className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit & System Activity Feed */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Activity &amp; Audit Trail
            </h3>
            <Link
              to="/app/reports"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Full log
            </Link>
          </div>

          <div className="space-y-3.5">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {act.action}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {act.targetTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
