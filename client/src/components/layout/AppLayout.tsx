import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  LayoutDashboard,
  Folder,
  MessageSquare,
  GitCompare,
  BarChart3,
  Settings,
  Search,
  Bell,
  Plus,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Shield,
  Upload,
  User,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CommandPalette } from '../common/CommandPalette';
import { Button } from '../common/Button';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/app', icon: LayoutDashboard },
    { name: 'My Documents', path: '/app/documents', icon: FileText },
    { name: 'Collections', path: '/app/collections', icon: Folder },
    { name: 'Search', path: '/app/search', icon: Search },
    { name: 'Compare Documents', path: '/app/compare', icon: GitCompare },
    { name: 'AI Q&A Studio', path: '/app/chat', icon: MessageSquare },
    { name: 'Reports', path: '/app/reports', icon: BarChart3 },
    { name: 'Activity', path: '/app/activity', icon: Shield },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const notifications = [
    {
      id: 1,
      title: 'Document comparison ready',
      desc: 'DocuMind_MSA_Enterprise_v1 vs v2.1 completed with 5 flagged clauses.',
      time: '10m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'New document indexed',
      desc: 'DocuMind_Q3_FY2026_Investor_Report.pdf 36 pages parsed.',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Security key rotated',
      desc: 'Production Ingestion Pipeline API token active.',
      time: 'Yesterday',
      unread: false,
    }
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors selection:bg-indigo-500 selection:text-white">
      {/* ============================================================ */}
      {/* 1. SIDEBAR (Desktop & Mobile Drawer) */}
      {/* ============================================================ */}
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Logo & Workspace Title */}
        <div>
          <div className="h-16 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link to="/app" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  DocuMind
                </span>
                <span className="block text-[10px] text-slate-400 font-medium -mt-1">
                  Enterprise Workspace
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action: New Document */}
          <div className="p-3">
            <button
              onClick={() => navigate('/app/documents?action=upload')}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Storage Meter & User Profile */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Cloud Storage Gauge */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
              <span className="text-slate-500">Cloud Storage</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">11.5 MB / 50 GB</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full w-[2%]" />
            </div>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Enterprise Tier</span>
              <Link to="/app/settings" className="text-indigo-600 hover:underline">
                Manage
              </Link>
            </div>
          </div>

          {/* User Profile Mini Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-indigo-200"
              />
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Alex Morgan'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.role || 'Head of AI'}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN APPLICATION CONTENT AREA */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
          {/* Left: Mobile hamburger & search shortcut */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick search input / Command Palette button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs transition-colors border border-slate-200 dark:border-slate-700/60"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search documents, collections, or actions...</span>
              <kbd className="ml-4 font-mono text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right: Actions, Theme, Notifications & User */}
          <div className="flex items-center gap-2">
            {/* Command palette mobile icon */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 sm:hidden"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
                      2 Unread
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-tight">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link
                      to="/app/reports"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View full audit logs →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                  alt={user?.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                />
                <span className="text-xs font-semibold hidden lg:inline-block text-slate-800 dark:text-slate-200">
                  {user?.name || 'Alex Morgan'}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-slate-900 dark:text-white">{user?.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                  </div>
                  <Link
                    to="/app/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile &amp; Settings</span>
                  </Link>
                  <Link
                    to="/app/settings?tab=security"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Security &amp; API Keys</span>
                  </Link>
                  <Link
                    to="/"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>Public Home Page</span>
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Child Pages Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};
