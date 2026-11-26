import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/useContexts';
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  ChevronDown,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  Video,
} from 'lucide-react';

interface AcademyItem {
  name: string;
  desc: string;
  to: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ACADEMY_ITEMS: AcademyItem[] = [
  {
    name: 'LMS Courses Hub',
    desc: 'Structured academies & end-to-end learning pathways',
    to: '/app/lms',
    badge: 'ALL',
    icon: BookOpen,
  },
  {
    name: 'ML Course LMS',
    desc: '106-lecture Machine Learning mastery with proctored exam',
    to: '/app/ml-course',
    badge: '106',
    icon: BrainCircuit,
  },
  {
    name: 'Stanford DL LMS',
    desc: 'CS229 & Deep Learning video lectures, notes & quizzes',
    to: '/app/dl-course',
    badge: '21',
    icon: GraduationCap,
  },
  {
    name: 'Video Masterclasses',
    desc: 'In-platform multi-playlist engineering video theater',
    to: '/app/videos',
    badge: 'HUB',
    icon: Video,
  },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [academiesOpen, setAcademiesOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const academiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (academiesRef.current && !academiesRef.current.contains(e.target as Node)) {
        setAcademiesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const primaryLinks = [
    { name: 'Home', href: '/#hero', isRoute: false },
    { name: 'Features', href: '/#features', isRoute: false },
    { name: 'Challenges', href: '/#challenges', isRoute: false },
    { name: 'Solutions', href: '/#solutions', isRoute: false },
    { name: 'Pricing', href: '/#pricing', isRoute: false },
    { name: 'Wiki', href: '/wiki', isRoute: true },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    setAcademiesOpen(false);
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070A13]/90 backdrop-blur-xl border-b border-indigo-500/20 shadow-xl shadow-black/40 py-2.5'
          : 'bg-gradient-to-b from-[#05070E]/85 via-[#05070E]/45 to-transparent py-4'
      }`}
    >
      {/* Subtle animated top shimmer accent on scroll */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent animate-shimmer transition-opacity duration-500 ${
          isScrolled ? 'opacity-100' : 'opacity-40'
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 lg:gap-4">
          <BrandLogo size="md" />

          {/* Desktop Single-Row Floating Navigation Pill (never wraps) */}
          <nav
            onMouseLeave={() => setHoveredNav(null)}
            className="hidden lg:flex items-center gap-0.5 bg-slate-900/65 p-1.5 rounded-full border border-slate-800/80 backdrop-blur-xl shadow-lg shadow-black/30 whitespace-nowrap"
          >
            {primaryLinks.slice(0, 3).map((link) => {
              const isActive =
                (link.isRoute && location.pathname.startsWith(link.href)) ||
                (!link.isRoute && location.pathname === '/' && link.href === '/#hero');
              const isHighlighted = hoveredNav === link.name || (hoveredNav === null && isActive);

              return link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onMouseEnter={() => setHoveredNav(link.name)}
                  className="relative px-3.5 py-1.5 text-xs xl:text-sm font-medium text-slate-300 hover:text-white rounded-full transition-colors whitespace-nowrap shrink-0"
                >
                  {isHighlighted && (
                    <motion.span
                      layoutId="navbarActivePill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-slate-800/85 border border-slate-700/70 -z-10"
                    />
                  )}
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredNav(link.name)}
                  onClick={(e) => {
                    if (location.pathname === '/' && link.href.startsWith('/#')) {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }
                  }}
                  className="relative px-3.5 py-1.5 text-xs xl:text-sm font-medium text-slate-300 hover:text-white rounded-full transition-colors whitespace-nowrap shrink-0"
                >
                  {isHighlighted && (
                    <motion.span
                      layoutId="navbarActivePill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-slate-800/85 border border-slate-700/70 -z-10"
                    />
                  )}
                  {link.name}
                </a>
              );
            })}

            {/* Academies Interactive Dropdown */}
            <div ref={academiesRef} className="relative shrink-0">
              <button
                type="button"
                onMouseEnter={() => setHoveredNav('Academies')}
                onClick={() => setAcademiesOpen((prev) => !prev)}
                className="relative inline-flex items-center gap-1 px-3.5 py-1.5 text-xs xl:text-sm font-medium text-slate-200 hover:text-white rounded-full transition-colors whitespace-nowrap"
              >
                {(hoveredNav === 'Academies' || academiesOpen) && (
                  <motion.span
                    layoutId="navbarActivePill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-indigo-600/25 border border-indigo-400/35 -z-10"
                  />
                )}
                <span>Academies</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-cyan-300 transition-transform duration-200 ${
                    academiesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {academiesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-80 p-2 rounded-2xl bg-[#0B1020]/95 backdrop-blur-2xl border border-indigo-500/30 shadow-2xl shadow-black/70 z-50"
                  >
                    {ACADEMY_ITEMS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setAcademiesOpen(false)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 transition group"
                        >
                          <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-cyan-300 group-hover:scale-105 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                                {item.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug whitespace-normal">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {primaryLinks.slice(3).map((link) => {
              const isActive = link.isRoute && location.pathname.startsWith(link.href);
              const isHighlighted = hoveredNav === link.name || (hoveredNav === null && isActive);

              return link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onMouseEnter={() => setHoveredNav(link.name)}
                  className="relative px-3.5 py-1.5 text-xs xl:text-sm font-medium text-slate-300 hover:text-white rounded-full transition-colors whitespace-nowrap shrink-0"
                >
                  {isHighlighted && (
                    <motion.span
                      layoutId="navbarActivePill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-slate-800/85 border border-slate-700/70 -z-10"
                    />
                  )}
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredNav(link.name)}
                  onClick={(e) => {
                    if (location.pathname === '/' && link.href.startsWith('/#')) {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }
                  }}
                  className="relative px-3.5 py-1.5 text-xs xl:text-sm font-medium text-slate-300 hover:text-white rounded-full transition-colors whitespace-nowrap shrink-0"
                >
                  {isHighlighted && (
                    <motion.span
                      layoutId="navbarActivePill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-slate-800/85 border border-slate-700/70 -z-10"
                    />
                  )}
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Desktop CTA Actions (single-line, never wrap) */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0 whitespace-nowrap">
            {isAuthenticated ? (
              <Link
                to="/app/dashboard"
                className="group relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95 border border-indigo-400/30 whitespace-nowrap shrink-0"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/50 transition-all whitespace-nowrap shrink-0"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="group relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600 bg-[length:200%_100%] animate-shimmer hover:shadow-indigo-500/50 rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95 border border-indigo-400/35 whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse shrink-0" />
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile / Tablet Compact Controls */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {!isAuthenticated && (
              <Link
                to="/login"
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900/80 border border-slate-700/80 rounded-lg whitespace-nowrap"
              >
                Sign In
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900/80 border border-slate-700/70 transition active:scale-95"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Animated Mobile / Tablet Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="lg:hidden overflow-hidden bg-[#0B0F19]/95 backdrop-blur-2xl border-b border-slate-800 px-5 pt-3 pb-6 mt-3 space-y-4 shadow-2xl"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {primaryLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-slate-200 hover:text-white bg-slate-900/60 hover:bg-slate-800/70 rounded-xl border border-slate-800/70 transition"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      if (location.pathname === '/' && link.href.startsWith('/#')) {
                        e.preventDefault();
                        handleNavClick(link.href);
                      } else {
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="px-3 py-2 text-sm font-medium text-slate-200 hover:text-white bg-slate-900/60 hover:bg-slate-800/70 rounded-xl border border-slate-800/70 transition"
                  >
                    {link.name}
                  </a>
                )
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 px-1">
                Academies &amp; LMS Hubs
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {ACADEMY_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-cyan-300" />
                        {item.name}
                      </span>
                      <span className="font-mono text-[10px] text-cyan-300">{item.badge}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2.5">
              {isAuthenticated ? (
                <Link
                  to="/app/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 font-semibold text-white bg-indigo-600 rounded-xl"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 text-sm font-semibold text-slate-200 bg-slate-800/80 rounded-xl border border-slate-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-600/30"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
