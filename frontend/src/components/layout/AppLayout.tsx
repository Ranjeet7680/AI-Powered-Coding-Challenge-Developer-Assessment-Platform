import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/useContexts';
import { BrandLogo } from '../common/BrandLogo';
import { Footer } from './Footer';
import { GlobalSearchModal } from './GlobalSearchModal';
import { api } from '../../services/api';
import {
  LayoutDashboard,
  Sparkles,
  Code2,
  Layers,
  History,
  Award,
  Trophy,
  BarChart3,
  FileCheck2,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Menu,
  X,
  User as UserIcon,
  Video,
  Flame,
  Keyboard,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    { name: 'Overview', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Explore Challenges', path: '/app/challenges', icon: Layers },
    { name: 'Video Masterclasses', path: '/app/videos', icon: Video, badge: 'NEW' },
    { name: 'AI Task Generator', path: '/app/generator', icon: Sparkles, badge: 'AI' },
    { name: 'My Workspace', path: '/app/workspace/c2-lru-cache', icon: Code2 },
    { name: 'My Submissions', path: '/app/submissions', icon: History },
    { name: 'Assessments', path: '/app/assessments', icon: Award },
    { name: 'Leaderboard', path: '/app/leaderboard', icon: Trophy },
    { name: 'Analytics', path: '/app/analytics', icon: BarChart3 },
    { name: 'Certificates', path: '/app/certificates', icon: FileCheck2 },
  ];

  // Global keyboard shortcuts: Ctrl/Cmd+K for Search, ? for Help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (
        e.key === '?' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName || '') &&
        !(e.target as HTMLElement)?.closest('.monaco-editor')
      ) {
        e.preventDefault();
        setHelpModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setNotificationsOpen(false);
        setProfileDropdownOpen(false);
        setHelpModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Backend health ping
  useEffect(() => {
    api.getHealth()
      .then(() => setApiConnected(true))
      .catch(() => setApiConnected(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return ['Workspace', 'Overview'];
    if (path.includes('/videos')) return ['Workspace', 'Video Masterclasses'];
    if (path.includes('/challenges')) return ['Workspace', 'Challenge Library'];
    if (path.includes('/generator')) return ['Workspace', 'AI Task Generator'];
    if (path.includes('/workspace')) return ['Workspace', 'Coding IDE'];
    if (path.includes('/submissions')) return ['Workspace', 'My Submissions'];
    if (path.includes('/assessments')) return ['Workspace', 'Assessments'];
    if (path.includes('/leaderboard')) return ['Workspace', 'Leaderboard'];
    if (path.includes('/analytics')) return ['Workspace', 'Developer Analytics'];
    if (path.includes('/certificates')) return ['Workspace', 'Certificates'];
    if (path.includes('/settings')) return ['Workspace', 'Settings'];
    return ['Workspace'];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-[#05070E] text-slate-100 flex overflow-hidden">
      {searchModalOpen && (
        <GlobalSearchModal onClose={() => setSearchModalOpen(false)} />
      )}

      {/* Desktop Left Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800/80 bg-[#080B14] transition-all duration-300 z-30 shrink-0 no-print ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <BrandLogo iconOnly={collapsed} size={collapsed ? 'md' : 'sm'} />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {!collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 font-mono px-3 mb-2">
              Core Platform
            </p>
          )}

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const basePrefix = item.path.startsWith('/app/workspace') ? '/app/workspace' : item.path;
            const isActive = location.pathname.startsWith(basePrefix);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={() =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/15 text-indigo-200 border border-indigo-500/35 shadow-sm shadow-indigo-950/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/45 border border-transparent'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Sidebar: Help, Settings, Profile */}
        <div className="p-3 border-t border-slate-800/80 space-y-1 bg-slate-950/40">
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          <button
            onClick={() => setHelpModalOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <span className="flex items-center justify-between w-full">
                <span>Shortcuts & Help</span>
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-slate-400">
                  ?
                </kbd>
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div className="pt-2">
            <div
              className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.full_name || 'User'}
                  className="w-8 h-8 rounded-lg object-cover border border-indigo-500/40"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#080B14]" />
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.full_name || 'Developer'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate font-mono">
                    {(user?.points ?? 0).toLocaleString()} pts • {user?.streak ?? 0}d streak
                  </p>
                </div>
              )}

              {!collapsed && (
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-[#080B14]/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 no-print">
          {/* Left: Mobile toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb}>
                  {idx > 0 && <span className="text-slate-600">/</span>}
                  <span className={idx === breadcrumbs.length - 1 ? 'text-white font-semibold' : ''}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right: Search, Status, Streak, Notifications, User Avatar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono">
                Ctrl K
              </kbd>
            </button>

            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{user?.streak ?? 0}d</span>
            </div>

            <Link
              to="/app/settings"
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono transition ${
                apiConnected
                  ? user?.has_gemini_api_key
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                    : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300'
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
              }`}
              title="Configure Gemini API key in Settings"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  apiConnected
                    ? user?.has_gemini_api_key
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-indigo-400'
                    : 'bg-rose-400'
                }`}
              />
              <span>
                {!apiConnected
                  ? 'API Offline'
                  : user?.has_gemini_api_key
                  ? 'Gemini Key Active'
                  : 'AI Engine Ready'}
              </span>
            </Link>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setUnreadCount(0);
                }}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0D1322] border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white">Activity Feed</p>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                      Up to date
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <p className="font-semibold text-indigo-300">Streak Maintained</p>
                      <p className="text-slate-400 mt-0.5">
                        You are on a {user?.streak || 1}-day streak with {(user?.points || 0).toLocaleString()} points.
                      </p>
                    </div>
                    <Link
                      to="/app/assessments"
                      onClick={() => setNotificationsOpen(false)}
                      className="block p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition"
                    >
                      <p className="font-semibold text-emerald-300">Interactive Assessments Live</p>
                      <p className="text-slate-400 mt-0.5">
                        Complete any timed technical screener to earn a verifiable certificate.
                      </p>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/80 transition"
              >
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.full_name || 'User'}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0D1322] border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-800 text-xs">
                    <p className="font-semibold text-white truncate">{user?.full_name}</p>
                    <p className="text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1 text-xs">
                    <Link
                      to="/app/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      Profile & Settings
                    </Link>
                    <Link
                      to="/app/certificates"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <Award className="w-3.5 h-3.5" />
                      My Certificates
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Viewport Outlet */}
        <main className="flex-1 overflow-y-auto bg-[#05070E] p-4 sm:p-6 lg:p-8 custom-scrollbar flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer compact />
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm flex no-print">
          <div className="w-72 bg-[#080B14] border-r border-slate-800 flex flex-col h-full p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <BrandLogo size="sm" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
              <NavLink
                to="/app/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </NavLink>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Keyboard Shortcuts & Help Modal */}
      {helpModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn no-print"
          onClick={() => setHelpModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#0B101D] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-indigo-400" />
                Keyboard Shortcuts & Guide
              </h3>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { keys: 'Ctrl / ⌘ + K', desc: 'Open global command search' },
                { keys: 'Ctrl / ⌘ + Enter', desc: 'Run code against sample tests (Workspace)' },
                { keys: 'Ctrl / ⌘ + Shift + Enter', desc: 'Submit solution & trigger AI Review' },
                { keys: '?', desc: 'Toggle this shortcuts guide' },
                { keys: 'Esc', desc: 'Close active modal or popover' },
              ].map((s) => (
                <div key={s.keys} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-300">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-indigo-300">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <Link
                to="/#faq"
                onClick={() => setHelpModalOpen(false)}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                View Platform FAQ &rarr;
              </Link>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
