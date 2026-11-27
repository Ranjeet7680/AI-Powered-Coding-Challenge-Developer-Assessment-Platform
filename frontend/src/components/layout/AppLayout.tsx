import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/useContexts';
import { BrandLogo } from '../common/BrandLogo';
import { Footer } from './Footer';
import { GlobalSearchModal } from './GlobalSearchModal';
import { api } from '../../services/api';
import {
  LayoutDashboard,
  Cpu,
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
  ChevronDown,
  Search,
  Bell,
  Menu,
  X,
  User as UserIcon,
  Video,
  BrainCircuit,
  GraduationCap,
  BookOpen,
  Briefcase,
  Flame,
  Keyboard,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface NavItemConfig {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  meta?: string;
}

interface NavSectionConfig {
  id: string;
  label: string;
  items: NavItemConfig[];
}

const NAV_SECTIONS: NavSectionConfig[] = [
  {
    id: 'core',
    label: 'Core workspace',
    items: [
      { name: 'Overview', path: '/app/dashboard', icon: LayoutDashboard },
      { name: 'Challenge library', path: '/app/challenges', icon: Layers, meta: '368' },
      { name: 'Task generator', path: '/app/generator', icon: Cpu },
      { name: 'Coding IDE', path: '/app/workspace/c2-lru-cache', icon: Code2 },
      { name: 'Submissions', path: '/app/submissions', icon: History },
    ],
  },
  {
    id: 'lms',
    label: 'Academies',
    items: [
      { name: 'Courses hub', path: '/app/lms', icon: BookOpen },
      { name: 'ML course', path: '/app/ml-course', icon: BrainCircuit, meta: '106' },
      { name: 'Stanford DL', path: '/app/dl-course', icon: GraduationCap, meta: '21' },
      { name: 'Data Science', path: '/app/ds-course', icon: BarChart3, meta: '14' },
      { name: 'IITM Business', path: '/app/biz-course', icon: Briefcase, meta: '66' },
      { name: 'Agentic AI', path: '/app/agentic-course', icon: Cpu, meta: '23' },
      { name: 'Video library', path: '/app/videos', icon: Video },
    ],
  },
  {
    id: 'growth',
    label: 'Assessments & growth',
    items: [
      { name: 'Assessments', path: '/app/assessments', icon: Award },
      { name: 'Certificates', path: '/app/certificates', icon: FileCheck2 },
      { name: 'Analytics', path: '/app/analytics', icon: BarChart3 },
      { name: 'Leaderboard', path: '/app/leaderboard', icon: Trophy },
    ],
  },
  {
    id: 'docs',
    label: 'Documentation',
    items: [{ name: 'Platform wiki', path: '/wiki', icon: BookOpen }],
  },
];

const EASE_UI = [0.22, 1, 0.36, 1] as const;

function readInitialCollapsedState(): boolean {
  try {
    return localStorage.getItem('ctf_sidebar_collapsed') === 'true';
  } catch {
    return false;
  }
}

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(readInitialCollapsedState);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    core: true,
    lms: true,
    growth: true,
    docs: true,
  });
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

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ctf_sidebar_collapsed', String(next));
      } catch {
        // Ignore storage restrictions
      }
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [sectionId]: !(prev[sectionId] ?? true),
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setCollapsed((prev) => {
          const next = !prev;
          try {
            localStorage.setItem('ctf_sidebar_collapsed', String(next));
          } catch {
            // Ignore
          }
          return next;
        });
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
    if (path.includes('/lms/agentic')) return ['Workspace', 'LMS hub', 'Agentic AI'];
    if (path.includes('/lms/biz')) return ['Workspace', 'LMS hub', 'IITM Business'];
    if (path.includes('/lms/ds')) return ['Workspace', 'LMS hub', 'Data Science'];
    if (path.includes('/lms/dl')) return ['Workspace', 'LMS hub', 'Stanford DL'];
    if (path.includes('/lms/ml')) return ['Workspace', 'LMS hub', 'ML course'];
    if (path.includes('/lms')) return ['Workspace', 'LMS courses hub'];
    if (path.includes('/ml-course')) return ['Workspace', 'Academies', 'ML course'];
    if (path.includes('/dl-course')) return ['Workspace', 'Academies', 'Stanford DL'];
    if (path.includes('/ds-course')) return ['Workspace', 'Academies', 'Data Science'];
    if (path.includes('/biz-course')) return ['Workspace', 'Academies', 'IITM Business'];
    if (path.includes('/agentic-course')) return ['Workspace', 'Academies', 'Agentic AI'];
    if (path.includes('/videos')) return ['Workspace', 'Academies', 'Video library'];
    if (path.includes('/challenges')) return ['Workspace', 'Challenge library'];
    if (path.includes('/generator')) return ['Workspace', 'Task generator'];
    if (path.includes('/workspace')) return ['Workspace', 'Coding IDE'];
    if (path.includes('/submissions')) return ['Workspace', 'Submissions'];
    if (path.includes('/assessments')) return ['Workspace', 'Assessments'];
    if (path.includes('/leaderboard')) return ['Workspace', 'Leaderboard'];
    if (path.includes('/analytics')) return ['Workspace', 'Analytics'];
    if (path.includes('/certificates')) return ['Workspace', 'Certificates'];
    if (path.includes('/settings')) return ['Workspace', 'Settings'];
    return ['Workspace'];
  };

  const breadcrumbs = getBreadcrumbs();
  const initials = (user?.full_name || 'Developer')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="h-dvh bg-[#141415] text-[#ededed] flex overflow-hidden">
      {searchModalOpen && <GlobalSearchModal onClose={() => setSearchModalOpen(false)} />}

      {/* Desktop Left Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-full border-r border-white/[0.08] bg-[#0f0f10] transition-[width] duration-200 z-30 shrink-0 no-print ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {collapsed ? (
          <div className="py-3 px-2 flex flex-col items-center justify-center gap-2 border-b border-white/[0.08] shrink-0">
            <BrandLogo iconOnly size="sm" />
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-9 h-7 rounded-md bg-[#19191b] hover:bg-[#222225] text-[#a1a1a6] hover:text-[#ededed] border border-white/[0.08] flex items-center justify-center transition-colors"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.08] shrink-0">
            <BrandLogo size="sm" />
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-[#85858b] hover:text-[#ededed] hover:bg-[#19191b] transition-colors"
              title="Collapse sidebar (Ctrl+B)"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft strokeWidth={1.5} className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sidebar Search Trigger */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="w-full h-9 px-3 rounded-lg bg-[#19191b] hover:bg-[#222225] border border-white/[0.08] flex items-center justify-between text-xs text-[#85858b] transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Search strokeWidth={1.5} className="w-4 h-4 text-[#85858b]" />
                <span>Search</span>
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-[#85858b]">
                <kbd className="px-1.5 py-0.5 rounded bg-[#222225] border border-white/[0.08]">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-[#222225] border border-white/[0.08]">K</kbd>
              </span>
            </button>
          </div>
        )}

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
          {NAV_SECTIONS.map((section, sectionIdx) => {
            const isGroupOpen = openGroups[section.id] ?? true;

            return (
              <div key={section.id} className={sectionIdx > 0 ? 'mt-5' : 'mt-2'}>
                {!collapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-2.5 pb-1.5 text-xs text-[#85858b] hover:text-[#a1a1a6] transition-colors"
                    aria-expanded={isGroupOpen}
                  >
                    <span>{section.label}</span>
                    {isGroupOpen ? (
                      <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                    )}
                  </button>
                ) : (
                  sectionIdx > 0 && <div className="mx-2 my-2 border-t border-white/[0.08]" />
                )}

                {(collapsed || isGroupOpen) && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const basePrefix = item.path.startsWith('/app/workspace')
                        ? '/app/workspace'
                        : item.path;
                      const isActive =
                        item.path === '/wiki'
                          ? location.pathname.startsWith('/wiki')
                          : location.pathname.startsWith(basePrefix);

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={() =>
                            `h-9 flex items-center gap-2.5 px-2.5 rounded-lg text-sm transition-colors duration-150 relative group ${
                              isActive
                                ? 'surface-active text-[#ededed] font-medium'
                                : 'text-[#a1a1a6] hover:text-[#ededed] hover:bg-[#19191b] border border-transparent'
                            } ${collapsed ? 'justify-center px-0' : ''}`
                          }
                        >
                          <Icon
                            strokeWidth={1.5}
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-[#e5a00d]' : 'text-[#85858b] group-hover:text-[#a1a1a6]'
                            }`}
                          />
                          {!collapsed && <span className="truncate">{item.name}</span>}
                          {!collapsed && item.meta && (
                            <span className="ml-auto font-mono text-xs text-[#85858b] tabular-nums">
                              {item.meta}
                            </span>
                          )}
                          {collapsed && (
                            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity fixed left-18 px-2.5 py-1 bg-[#19191b] border border-white/[0.12] text-xs text-[#ededed] rounded-md z-50 whitespace-nowrap shadow-lg">
                              {item.name}
                            </div>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Sidebar Controls */}
        <div className="p-3 border-t border-white/[0.08] space-y-0.5 shrink-0">
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `h-9 flex items-center gap-2.5 px-2.5 rounded-lg text-sm transition-colors duration-150 ${
                isActive
                  ? 'surface-active text-[#ededed] font-medium'
                  : 'text-[#a1a1a6] hover:text-[#ededed] hover:bg-[#19191b] border border-transparent'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
          >
            <Settings strokeWidth={1.5} className="w-4 h-4 shrink-0 text-[#85858b]" />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className={`w-full h-9 flex items-center gap-2.5 px-2.5 rounded-lg text-sm text-[#a1a1a6] hover:text-[#ededed] hover:bg-[#19191b] transition-colors duration-150 ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            <HelpCircle strokeWidth={1.5} className="w-4 h-4 shrink-0 text-[#85858b]" />
            {!collapsed && (
              <span className="flex items-center justify-between w-full">
                <span>Shortcuts</span>
                <kbd className="text-[11px] px-1.5 py-0.5 rounded bg-[#19191b] border border-white/[0.08] font-mono text-[#85858b]">
                  ?
                </kbd>
              </span>
            )}
          </button>

          <div className="pt-2">
            <div
              className={`flex items-center gap-2.5 p-2 rounded-lg bg-[#19191b] border border-white/[0.08] ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <div className="w-7 h-7 rounded-md bg-[#222225] border border-white/[0.1] flex items-center justify-center text-xs font-mono font-medium text-[#ededed] shrink-0">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || 'User'}
                    className="w-full h-full rounded-md object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium text-[#ededed] truncate">
                    {user?.full_name || 'Developer'}
                  </p>
                  <p className="text-[11px] text-[#85858b] truncate font-mono tabular-nums">
                    {(user?.points ?? 0).toLocaleString()} pts · {user?.streak ?? 0}d
                  </p>
                </div>
              )}

              {!collapsed && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-[#85858b] hover:text-[#e5484d] rounded-md transition-colors"
                  title="Sign out"
                >
                  <LogOut strokeWidth={1.5} className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-14 border-b border-white/[0.08] bg-[#141415]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-2 z-20 shrink-0 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#a1a1a6] hover:text-[#ededed] rounded-lg bg-[#19191b] border border-white/[0.08] shrink-0"
              aria-label="Open menu"
            >
              <Menu strokeWidth={1.5} className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-[#19191b] hover:bg-[#222225] border border-white/[0.08] text-xs text-[#a1a1a6] hover:text-[#ededed] transition-colors shrink-0"
              title={collapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <PanelLeftOpen strokeWidth={1.5} className="w-4 h-4" />
              ) : (
                <PanelLeftClose strokeWidth={1.5} className="w-4 h-4" />
              )}
            </button>

            <nav className="hidden sm:flex items-center gap-2 text-xs text-[#85858b] min-w-0 truncate">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb}>
                  {idx > 0 && <span className="text-[#85858b]/50">/</span>}
                  <span className={idx === breadcrumbs.length - 1 ? 'text-[#ededed] font-medium truncate' : 'truncate'}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
            <span className="sm:hidden text-xs font-medium text-[#ededed] truncate max-w-[160px]">
              {breadcrumbs[breadcrumbs.length - 1]}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-[#19191b] border border-white/[0.08] text-[#a1a1a6] text-xs font-mono tabular-nums">
              <Flame strokeWidth={1.5} className="w-3.5 h-3.5 text-[#e5a00d]" />
              <span>{user?.streak ?? 0}d</span>
            </div>

            <Link
              to="/app/settings"
              className="hidden lg:flex items-center gap-2 px-2.5 h-8 rounded-lg bg-[#19191b] hover:bg-[#222225] border border-white/[0.08] text-xs font-mono text-[#a1a1a6] hover:text-[#ededed] transition-colors"
              title="Configure Gemini API key in Settings"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  apiConnected
                    ? user?.has_gemini_api_key
                      ? 'bg-[#4cc38a]'
                      : 'bg-[#e5a00d]'
                    : 'bg-[#e5484d]'
                }`}
              />
              <span>
                {!apiConnected
                  ? 'Offline'
                  : user?.has_gemini_api_key
                  ? 'Gemini active'
                  : 'Sandbox ready'}
              </span>
            </Link>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setUnreadCount(0);
                }}
                className="relative h-8 w-8 flex items-center justify-center text-[#a1a1a6] hover:text-[#ededed] hover:bg-[#19191b] rounded-lg transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell strokeWidth={1.5} className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#e5a00d]" />
                )}
              </button>

              {notificationsOpen && (
                <div className="fixed inset-x-3 top-16 sm:inset-x-auto sm:top-auto sm:absolute sm:right-0 sm:mt-2 sm:w-80 bg-[#19191b] border border-white/[0.12] rounded-xl shadow-2xl p-3 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
                    <p className="text-xs font-medium text-[#ededed]">Activity</p>
                    <span className="text-[11px] font-mono text-[#85858b]">Up to date</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#141415] border border-white/[0.08]">
                      <p className="font-medium text-[#ededed]">Streak maintained</p>
                      <p className="text-[#85858b] mt-0.5 tabular-nums">
                        {user?.streak || 1}-day streak · {(user?.points || 0).toLocaleString()} points
                      </p>
                    </div>
                    <Link
                      to="/app/dl-course"
                      onClick={() => setNotificationsOpen(false)}
                      className="block p-2.5 rounded-lg bg-[#141415] border border-white/[0.08] hover:border-white/[0.16] transition-colors"
                    >
                      <p className="font-medium text-[#ededed]">Stanford Deep Learning LMS</p>
                      <p className="text-[#85858b] mt-0.5">
                        21 lectures, capstone lab, and proctored certification available
                      </p>
                    </Link>
                    <Link
                      to="/app/ds-course"
                      onClick={() => setNotificationsOpen(false)}
                      className="block p-2.5 rounded-lg bg-[#141415] border border-white/[0.08] hover:border-white/[0.16] transition-colors"
                    >
                      <p className="font-medium text-[#ededed]">Python Data Science &amp; Big Data</p>
                      <p className="text-[#85858b] mt-0.5">
                        14 NumPy, Pandas, JSON &amp; Matplotlib lectures with proctored exam
                      </p>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-[#19191b] border border-transparent hover:border-white/[0.08] transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-[#222225] border border-white/[0.1] flex items-center justify-center text-[11px] font-mono text-[#ededed] overflow-hidden">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <span className="hidden sm:inline text-xs text-[#a1a1a6] max-w-[120px] truncate">
                  {user?.full_name || 'Developer'}
                </span>
                <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b]" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#19191b] border border-white/[0.12] rounded-xl shadow-2xl p-1.5 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-white/[0.08] text-xs">
                    <p className="font-medium text-[#ededed] truncate">{user?.full_name}</p>
                    <p className="text-[#85858b] truncate">{user?.email}</p>
                  </div>
                  <div className="py-1 text-xs space-y-0.5">
                    <Link
                      to="/app/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#a1a1a6] hover:text-[#ededed] hover:bg-[#222225] transition-colors"
                    >
                      <UserIcon strokeWidth={1.5} className="w-4 h-4 text-[#85858b]" />
                      <span>Profile &amp; settings</span>
                    </Link>
                    <Link
                      to="/app/certificates"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#a1a1a6] hover:text-[#ededed] hover:bg-[#222225] transition-colors"
                    >
                      <Award strokeWidth={1.5} className="w-4 h-4 text-[#85858b]" />
                      <span>Certificates</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#e5484d] hover:bg-[#222225] transition-colors text-left"
                    >
                      <LogOut strokeWidth={1.5} className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Viewport Outlet */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#141415] p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 custom-scrollbar flex flex-col">
          <div className="flex-1 min-w-0 max-w-[1520px] w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname.split('/')[2] || 'dashboard'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: EASE_UI }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="max-w-[1520px] w-full mx-auto">
            <Footer compact />
          </div>
        </main>

        {/* Mobile Quick Bottom Bar */}
        <nav
          aria-label="Mobile quick navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/[0.08] bg-[#0f0f10]/95 backdrop-blur-md px-1 pt-1.5 pb-safe grid grid-cols-5 gap-1 no-print"
        >
          {[
            { label: 'Home', path: '/app/dashboard', icon: LayoutDashboard },
            { label: 'Tasks', path: '/app/challenges', icon: Layers },
            { label: 'LMS', path: '/app/lms', icon: GraduationCap },
            { label: 'Videos', path: '/app/videos', icon: Video },
            { label: 'IDE', path: '/app/workspace/c2-lru-cache', icon: Code2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    isActive ? 'text-[#ededed] bg-[#222225]' : 'text-[#85858b]'
                  }`
                }
              >
                <Icon strokeWidth={1.5} className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-full">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/75 backdrop-blur-sm flex no-print">
          <div className="w-72 bg-[#0f0f10] border-r border-white/[0.08] flex flex-col h-full p-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <BrandLogo size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-[#85858b] hover:text-[#ededed] rounded-lg bg-[#19191b]"
              >
                <X strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-5">
              {NAV_SECTIONS.map((section) => (
                <div key={section.id} className="space-y-1">
                  <div className="px-2.5 pb-1 text-xs text-[#85858b]">{section.label}</div>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `h-9 flex items-center gap-2.5 px-2.5 rounded-lg text-sm transition-colors ${
                            isActive
                              ? 'surface-active text-[#ededed] font-medium'
                              : 'text-[#a1a1a6] hover:text-[#ededed] hover:bg-[#19191b]'
                          }`
                        }
                      >
                        <Icon strokeWidth={1.5} className="w-4 h-4 shrink-0 text-[#85858b]" />
                        <span className="truncate">{item.name}</span>
                        {item.meta && (
                          <span className="ml-auto font-mono text-xs text-[#85858b] tabular-nums">
                            {item.meta}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              ))}
              <NavLink
                to="/app/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `h-9 flex items-center gap-2.5 px-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'surface-active text-[#ededed] font-medium'
                      : 'text-[#a1a1a6] hover:text-[#ededed] hover:bg-[#19191b]'
                  }`
                }
              >
                <Settings strokeWidth={1.5} className="w-4 h-4 text-[#85858b]" />
                <span>Settings</span>
              </NavLink>
            </div>
            <div className="pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full h-9 flex items-center gap-2 px-3 rounded-lg text-[#e5484d] bg-[#19191b] hover:bg-[#222225] border border-white/[0.08] text-sm"
              >
                <LogOut strokeWidth={1.5} className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {helpModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn no-print"
          onClick={() => setHelpModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#19191b] border border-white/[0.12] rounded-2xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-medium text-[#ededed] flex items-center gap-2">
                <Keyboard strokeWidth={1.5} className="w-4 h-4 text-[#85858b]" />
                <span>Keyboard shortcuts</span>
              </h3>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="p-1 text-[#85858b] hover:text-[#ededed] rounded-lg"
                aria-label="Close shortcuts"
              >
                <X strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { keys: 'Ctrl + B', desc: 'Toggle sidebar navigation' },
                { keys: 'Ctrl + K', desc: 'Open global search' },
                { keys: 'Ctrl + Enter', desc: 'Run code against sample tests' },
                { keys: 'Ctrl + Shift + Enter', desc: 'Submit solution for review' },
                { keys: '?', desc: 'Toggle this shortcuts dialog' },
                { keys: 'Esc', desc: 'Close active dialog or menu' },
              ].map((s) => (
                <div
                  key={s.keys}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#141415] border border-white/[0.08]"
                >
                  <span className="text-[#a1a1a6]">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#222225] border border-white/[0.08] font-mono text-[11px] text-[#ededed]">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <Link
                to="/#faq"
                onClick={() => setHelpModalOpen(false)}
                className="text-[#a1a1a6] hover:text-[#ededed]"
              >
                Platform FAQ →
              </Link>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#ededed] text-[#141415] font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
