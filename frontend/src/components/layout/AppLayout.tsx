import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import { GlobalSearchModal } from './GlobalSearchModal';
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
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
  User as UserIcon,
  CheckCircle2,
  Video,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Overview', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Explore Challenges', path: '/app/challenges', icon: Layers },
    { name: 'Video Masterclasses', path: '/app/videos', icon: Video, badge: 'NEW' },
    { name: 'AI Task Generator', path: '/app/generator', icon: Sparkles, badge: 'AI' },
    { name: 'My Workspace', path: '/app/workspace/c-ml-linear-regression', icon: Code2 },
    { name: 'My Submissions', path: '/app/submissions', icon: History },
    { name: 'Assessments', path: '/app/assessments', icon: Award },
    { name: 'Leaderboard', path: '/app/leaderboard', icon: Trophy },
    { name: 'Analytics', path: '/app/analytics', icon: BarChart3 },
    { name: 'Certificates', path: '/app/certificates', icon: FileCheck2 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Breadcrumb generator
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return ['Dashboard', 'Overview'];
    if (path.includes('/videos')) return ['Dashboard', 'Video Masterclasses'];
    if (path.includes('/challenges')) return ['Dashboard', 'Challenge Library'];
    if (path.includes('/generator')) return ['Dashboard', 'AI Task Generator'];
    if (path.includes('/workspace')) return ['Dashboard', 'Coding Workspace'];
    if (path.includes('/submissions')) return ['Dashboard', 'My Submissions'];
    if (path.includes('/assessments')) return ['Dashboard', 'Assessments'];
    if (path.includes('/leaderboard')) return ['Dashboard', 'Leaderboard'];
    if (path.includes('/analytics')) return ['Dashboard', 'Developer Analytics'];
    if (path.includes('/certificates')) return ['Dashboard', 'Certificates & Achievements'];
    if (path.includes('/settings')) return ['Dashboard', 'Platform Settings'];
    return ['Dashboard'];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex overflow-hidden">
      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Desktop Left Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800/80 bg-[#0A0D17] transition-all duration-300 z-30 shrink-0 ${
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
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {!collapsed && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono px-3 mb-2">
              Core Platform
            </p>
          )}

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: linkActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 relative group ${
                    linkActive || isActive
                      ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-950/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850 hover:bg-slate-800/40'
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
                {/* Floating tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap shadow-xl">
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
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          <a
            href="#faq"
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <span className="flex items-center justify-between w-full">
                Help & Docs
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </span>
            )}
          </a>

          {/* User Profile Pill */}
          <div className="pt-2">
            <div
              className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.full_name || 'User'}
                  className="w-8 h-8 rounded-lg object-cover border border-indigo-500/40"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0A0D17]" />
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.full_name || 'Alex Chen'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user?.role || 'Developer'}
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
        <header className="h-16 border-b border-slate-800/80 bg-[#0A0D17]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
          {/* Left: Mobile toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb nav */}
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

          {/* Right: Search, Notifications, Theme, User Avatar */}
          <div className="flex items-center gap-2.5">
            {/* Global Search trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search (Ctrl+K)</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Gemini AI Status Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemini AI Connected</span>
            </div>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white">Notifications</p>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-mono">
                      2 New
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                      <p className="font-semibold text-indigo-300">Streak Maintained! 🔥</p>
                      <p className="text-slate-400 mt-0.5">
                        You hit day {user?.streak || 7} of consistent algorithm problem solving.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                      <p className="font-semibold text-emerald-300">New Assessment Available</p>
                      <p className="text-slate-400 mt-0.5">
                        Google & Meta Tier-1 Technical Screener is now open for enrollment.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/80 transition"
              >
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.full_name || 'User'}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800 text-xs">
                    <p className="font-semibold text-white">{user?.full_name}</p>
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
        <main className="flex-1 overflow-y-auto bg-[#070A12] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm flex">
          <div className="w-72 bg-[#0A0D17] border-r border-slate-800 flex flex-col h-full p-4">
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
    </div>
  );
};
