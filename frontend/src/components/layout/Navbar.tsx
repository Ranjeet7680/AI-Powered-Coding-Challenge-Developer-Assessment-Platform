import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/useContexts';
import {
  Menu,
  X,
  ArrowRight,
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
  meta: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const ACADEMY_ITEMS: AcademyItem[] = [
  {
    name: 'LMS Courses Hub',
    desc: 'Structured academies and certification tracks',
    to: '/app/lms',
    meta: '2 tracks',
    icon: BookOpen,
  },
  {
    name: 'ML Course LMS',
    desc: '106-lecture machine learning path with proctored exam',
    to: '/app/ml-course',
    meta: '106',
    icon: BrainCircuit,
  },
  {
    name: 'Stanford DL LMS',
    desc: 'CS229 deep learning lectures, notes, and quizzes',
    to: '/app/dl-course',
    meta: '21',
    icon: GraduationCap,
  },
  {
    name: 'Video Masterclasses',
    desc: 'Engineering walkthroughs paired with coding tasks',
    to: '/app/videos',
    meta: 'Hub',
    icon: Video,
  },
];

const EASE_UI = [0.22, 1, 0.36, 1] as const;

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [academiesOpen, setAcademiesOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const academiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
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
    { name: 'Features', href: '/#features', isRoute: false },
    { name: 'Workbench', href: '/#challenges', isRoute: false },
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        isScrolled
          ? 'bg-[#141415]/92 backdrop-blur-md border-b border-white/[0.08]'
          : 'bg-[#141415]/75 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <BrandLogo size="md" />

          {/* Desktop Navigation: quiet links without floating pills */}
          <nav className="hidden lg:flex items-center gap-1 whitespace-nowrap">
            {primaryLinks.slice(0, 2).map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (location.pathname === '/' && link.href.startsWith('/#')) {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }
                }}
                className="px-3 py-2 text-sm text-[#a1a1a6] hover:text-[#ededed] rounded-lg transition-colors duration-150"
              >
                {link.name}
              </a>
            ))}

            {/* Academies Dropdown */}
            <div ref={academiesRef} className="relative">
              <button
                type="button"
                onClick={() => setAcademiesOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                  academiesOpen ? 'text-[#ededed] bg-[#222225]' : 'text-[#a1a1a6] hover:text-[#ededed]'
                }`}
              >
                <span>Academies</span>
                <ChevronDown
                  strokeWidth={1.5}
                  className={`w-3.5 h-3.5 text-[#85858b] transition-transform duration-150 ${
                    academiesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {academiesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.18, ease: EASE_UI }}
                    className="absolute left-0 top-full mt-2 w-80 p-2 rounded-xl bg-[#19191b] border border-white/[0.1] shadow-2xl shadow-black/60 z-50"
                  >
                    {ACADEMY_ITEMS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setAcademiesOpen(false)}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-[#222225] transition-colors duration-150 group"
                        >
                          <div className="w-7 h-7 rounded-md bg-[#222225] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                            <Icon strokeWidth={1.5} className="w-4 h-4 text-[#a1a1a6] group-hover:text-[#ededed]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-[#ededed] truncate">
                                {item.name}
                              </span>
                              <span className="font-mono text-xs text-[#85858b] tabular-nums shrink-0">
                                {item.meta}
                              </span>
                            </div>
                            <p className="text-xs text-[#85858b] mt-0.5 leading-snug">
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

            {primaryLinks.slice(2).map((link) => {
              const isActive = link.isRoute && location.pathname.startsWith(link.href);
              return link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                    isActive ? 'text-[#ededed] bg-[#222225]' : 'text-[#a1a1a6] hover:text-[#ededed]'
                  }`}
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
                    }
                  }}
                  className="px-3 py-2 text-sm text-[#a1a1a6] hover:text-[#ededed] rounded-lg transition-colors duration-150"
                >
                  {link.name}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Desktop Actions: quiet Sign in link + single solid primary button */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 whitespace-nowrap">
          {isAuthenticated ? (
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-[#141415] bg-[#ededed] hover:bg-white rounded-lg transition-[background-color,transform] duration-150 active:scale-[0.98]"
            >
              <LayoutDashboard strokeWidth={1.5} className="w-4 h-4" />
              <span>Open dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-2 text-sm font-medium text-[#a1a1a6] hover:text-[#ededed] transition-colors duration-150"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-[#141415] bg-[#ededed] hover:bg-white rounded-lg transition-[background-color,transform] duration-150 active:scale-[0.98]"
              >
                <span>Get started</span>
                <ArrowRight strokeWidth={1.5} className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          {!isAuthenticated && (
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm font-medium text-[#a1a1a6] hover:text-[#ededed] transition-colors"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#a1a1a6] hover:text-[#ededed] rounded-lg bg-[#19191b] border border-white/[0.08] transition-colors active:scale-[0.98]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X strokeWidth={1.5} className="w-4 h-4" /> : <Menu strokeWidth={1.5} className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: EASE_UI }}
            className="lg:hidden bg-[#0f0f10] border-b border-white/[0.08] px-4 pt-3 pb-6 space-y-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {primaryLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm text-[#a1a1a6] hover:text-[#ededed] bg-[#19191b] rounded-lg border border-white/[0.08] transition-colors"
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
                    className="px-3 py-2 text-sm text-[#a1a1a6] hover:text-[#ededed] bg-[#19191b] rounded-lg border border-white/[0.08] transition-colors"
                  >
                    {link.name}
                  </a>
                )
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-[#85858b] px-1">Academies</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {ACADEMY_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#19191b] border border-white/[0.08] text-sm text-[#ededed]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon strokeWidth={1.5} className="w-4 h-4 text-[#85858b]" />
                        <span>{item.name}</span>
                      </span>
                      <span className="font-mono text-xs text-[#85858b] tabular-nums">{item.meta}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row gap-2">
              {isAuthenticated ? (
                <Link
                  to="/app/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 text-sm font-medium text-[#141415] bg-[#ededed] rounded-lg"
                >
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 text-sm font-medium text-[#ededed] bg-[#222225] rounded-lg border border-white/[0.08]"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 text-sm font-medium text-[#141415] bg-[#ededed] rounded-lg"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
