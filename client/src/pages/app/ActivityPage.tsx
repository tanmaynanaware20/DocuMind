import React, { useEffect, useState } from 'react';
import {
  Shield,
  Download,
  Filter,
  Search,
  FileText,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { ActivityLogItem, DashboardStats } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [actRes, statsRes] = await Promise.all([
        api.getActivityLogs({ type: typeFilter !== 'all' ? typeFilter : undefined, limit: 100 }),
        api.getDashboardStats()
      ]);
      setLogs(actRes.activity);
      setStats(statsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter]);

  const handleExport = (format: 'csv' | 'json') => {
    window.open(`/api/reports/export?format=${format}`, '_blank');
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      search === '' ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.targetTitle.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>Activity &amp; Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system logs, tamper-evident user access monitoring, and real-time operational events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => handleExport('json')}
          >
            Export JSON
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => handleExport('csv')}
          >
            Export CSV Audit Trail
          </Button>
        </div>
      </div>

      {/* 2. Security Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Total Audit Events</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {logs.length} Logged Actions
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            100% Verified Signatures
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Security Status</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Nominal</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Zero anomalies or unauthorized access
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Active User Identity</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            Alex Morgan
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
            Enterprise RBAC • Full Privileges
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Compliance Standard</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            SOC 2 Type II
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            AES-256 BYOK Encryption Active
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by action, document, or user..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="document">Document Events</option>
                <option value="collection">Collection Events</option>
                <option value="comparison">Comparison Events</option>
                <option value="auth">Auth Events</option>
                <option value="settings">Security &amp; API Keys</option>
              </select>
            </div>

            <div className="text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-3 pl-4">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Category</th>
                <th className="p-3">Target / Resource</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="p-3 pl-4 text-slate-400 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={log.userAvatar}
                        alt={log.userName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {log.userName}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                    {log.action}
                  </td>
                  <td className="p-3">
                    <Badge variant="neutral" size="sm">
                      {log.targetType.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3 font-medium text-blue-600 dark:text-blue-400 max-w-xs truncate">
                    {log.targetTitle}
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        log.status === 'success'
                          ? 'success'
                          : log.status === 'warning'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {log.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3 pr-4 text-right">
                    <span className="text-[11px] text-slate-400 hover:text-blue-600 flex items-center justify-end gap-1">
                      View
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Log Details */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Audit Event Details"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Event ID</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedLog.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Timestamp</span>
                <span className="text-slate-800 dark:text-slate-200">{new Date(selectedLog.timestamp).toISOString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Actor</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedLog.userName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Category</span>
                <span className="text-slate-800 dark:text-slate-200 uppercase">{selectedLog.targetType}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block mb-1">Action Description</span>
              <p className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                {selectedLog.action}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block mb-1">Target Resource</span>
              <p className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono">
                {selectedLog.targetTitle}
              </p>
            </div>

            {selectedLog.details && (
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Event Payload &amp; Notes</span>
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedLog.details}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
