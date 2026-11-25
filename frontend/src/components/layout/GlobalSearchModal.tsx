import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Code2,
  Trophy,
  BarChart3,
  Settings,
  Award,
  Layers,
  X,
  ArrowRight,
  Video,
  History,
  FileCheck2,
  BookOpen,
  BrainCircuit,
} from 'lucide-react';
import { api } from '../../services/api';
import { Challenge, VideoLesson, Assessment } from '../../types';

interface GlobalSearchModalProps {
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeClass?: string;
  path: string;
  group: 'Pages' | 'Challenges' | 'Masterclasses' | 'Assessments';
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getChallenges().catch(() => []),
      api.getVideos().catch(() => []),
      api.getAssessments().catch(() => []),
    ]).then(([cList, vList, aList]) => {
      setChallenges(cList);
      setVideos(vList);
      setAssessments(aList);
    });
  }, []);

  const items = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();

    const quickPages: SearchResultItem[] = [
      { id: 'p-ml-course', title: 'ML Course LMS (106 Videos, Notes, 100+ Quizzes & Exam)', subtitle: 'StatQuest ML curriculum + camera-proctored final exam', path: '/app/ml-course', group: 'Pages', icon: BrainCircuit, iconColor: 'text-emerald-400' },
      { id: 'p-videos', title: 'Video Masterclasses & Walkthroughs', subtitle: 'ML & Algorithm deep dives', path: '/app/videos', group: 'Pages', icon: Video, iconColor: 'text-purple-400' },
      { id: 'p-gen', title: 'AI Task Generator', subtitle: 'Synthesize new coding challenges', path: '/app/generator', group: 'Pages', icon: Sparkles, iconColor: 'text-indigo-400' },
      { id: 'p-chal', title: 'Challenge Library', subtitle: 'Browse 350+ algorithmic & ML tasks', path: '/app/challenges', group: 'Pages', icon: Layers, iconColor: 'text-cyan-400' },
      { id: 'p-work', title: 'Coding Workspace', subtitle: 'Monaco IDE & live test runner', path: '/app/workspace/c2-lru-cache', group: 'Pages', icon: Code2, iconColor: 'text-violet-400' },
      { id: 'p-sub', title: 'My Submissions', subtitle: 'Execution history & AI reviews', path: '/app/submissions', group: 'Pages', icon: History, iconColor: 'text-blue-400' },
      { id: 'p-assess', title: 'Assessments', subtitle: 'Timed technical screeners', path: '/app/assessments', group: 'Pages', icon: Award, iconColor: 'text-emerald-400' },
      { id: 'p-analytics', title: 'Developer Analytics', subtitle: 'Velocity, skills radar & metrics', path: '/app/analytics', group: 'Pages', icon: BarChart3, iconColor: 'text-amber-400' },
      { id: 'p-leader', title: 'Leaderboard', subtitle: 'Global & weekly sprint rankings', path: '/app/leaderboard', group: 'Pages', icon: Trophy, iconColor: 'text-yellow-400' },
      { id: 'p-certs', title: 'Certificates', subtitle: 'Verified credentials', path: '/app/certificates', group: 'Pages', icon: FileCheck2, iconColor: 'text-teal-400' },
      { id: 'p-wiki', title: 'Platform Wiki & Architecture', subtitle: 'System diagrams, ER schema & Harbor docs', path: '/wiki', group: 'Pages', icon: BookOpen, iconColor: 'text-cyan-300' },
      { id: 'p-settings', title: 'Settings & IDE Preferences', subtitle: 'Profile, security & Gemini key', path: '/app/settings', group: 'Pages', icon: Settings, iconColor: 'text-slate-400' },
    ];

    const diffBadge = (diff: string) =>
      diff === 'Easy'
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : diff === 'Medium'
        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20';

    const challengeItems: SearchResultItem[] = challenges.map((c) => ({
      id: `c-${c.id}`,
      title: c.title,
      subtitle: `${c.category} • ${c.expected_complexity?.time || 'O(N)'}`,
      badge: c.difficulty,
      badgeClass: diffBadge(c.difficulty),
      path: `/app/workspace/${c.id}`,
      group: 'Challenges',
      icon: Code2,
      iconColor: 'text-indigo-400',
    }));

    const videoItems: SearchResultItem[] = videos.map((v) => ({
      id: `v-${v.id}`,
      title: v.title,
      subtitle: `${v.instructor} • ${v.duration_minutes}m`,
      badge: v.category,
      badgeClass: 'bg-purple-500/15 text-purple-300 border border-purple-500/25',
      path: `/app/videos/${v.id}`,
      group: 'Masterclasses',
      icon: Video,
      iconColor: 'text-purple-400',
    }));

    const assessmentItems: SearchResultItem[] = assessments.map((a) => ({
      id: `a-${a.id}`,
      title: a.title,
      subtitle: `${a.duration_minutes} mins • Passing ${a.passing_score}%`,
      badge: 'Screener',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      path: '/app/assessments',
      group: 'Assessments',
      icon: Award,
      iconColor: 'text-emerald-400',
    }));

    if (!q) {
      return [...quickPages.slice(0, 6), ...challengeItems.slice(0, 4)];
    }

    return [...challengeItems, ...videoItems, ...assessmentItems, ...quickPages]
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          (item.badge && item.badge.toLowerCase().includes(q))
      )
      .slice(0, 25);
  }, [query, challenges, videos, assessments]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (items.length ? (prev + 1) % items.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (items.length ? (prev - 1 + items.length) % items.length : 0));
      } else if (e.key === 'Enter' && items[activeIndex]) {
        e.preventDefault();
        onClose();
        navigate(items[activeIndex].path);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, items, activeIndex, navigate]);

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0B101D] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden shadow-indigo-950/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <Search className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search challenges, video masterclasses, assessments, pages..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            autoFocus
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {items.length > 0 ? (
            items.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelect(item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition border ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                      : 'border-transparent hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        <span className="text-slate-500 font-mono">{item.group}</span> • {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight className={`w-4 h-4 transition ${isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600'}`} />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm text-slate-400">No results matching &ldquo;{query}&rdquo;.</p>
              <button
                onClick={() => handleSelect('/app/generator')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate a custom challenge on this topic with AI
              </button>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>↑↓ Navigate • ↵ Open</span>
          <span>Ctrl/⌘+K Toggle • ESC Close</span>
        </div>
      </div>
    </div>
  );
};
