import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Cpu,
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
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
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
      { id: 'p-lms-hub', title: 'LMS Courses Hub', subtitle: 'Structured tracks, exams, and certification', path: '/app/lms', group: 'Pages', icon: BrainCircuit },
      { id: 'p-ml-course', title: 'ML Course LMS', subtitle: '106-lecture machine learning path and exam', path: '/app/ml-course', group: 'Pages', icon: BrainCircuit },
      { id: 'p-dl-course', title: 'Stanford DL LMS', subtitle: 'CS229 21 lectures, notes, and quizzes', path: '/app/dl-course', group: 'Pages', icon: BrainCircuit },
      { id: 'p-ds-course', title: 'Data Science LMS', subtitle: '14 lectures on Jupyter, NumPy, Pandas, JSON & Matplotlib', path: '/app/ds-course', group: 'Pages', icon: BarChart3 },
      { id: 'p-biz-course', title: 'IITM Business Fundamentals', subtitle: '66 lectures on elasticity, Bayes, DEA frontiers & conjoint', path: '/app/biz-course', group: 'Pages', icon: BookOpen },
      { id: 'p-agentic-course', title: 'Agentic AI & MCP LMS', subtitle: '23 lectures on Q-learning, LangGraph, CrewAI, Agno & MCP', path: '/app/agentic-course', group: 'Pages', icon: Cpu },
      { id: 'p-videos', title: 'Video library', subtitle: 'ML and algorithm walkthroughs', path: '/app/videos', group: 'Pages', icon: Video },
      { id: 'p-gen', title: 'Task generator', subtitle: 'Create custom coding problems', path: '/app/generator', group: 'Pages', icon: Cpu },
      { id: 'p-chal', title: 'Challenge library', subtitle: '368+ algorithmic and ML tasks', path: '/app/challenges', group: 'Pages', icon: Layers },
      { id: 'p-work', title: 'Coding IDE', subtitle: 'Monaco editor and test runner', path: '/app/workspace/c2-lru-cache', group: 'Pages', icon: Code2 },
      { id: 'p-sub', title: 'Submissions', subtitle: 'Execution history and code reviews', path: '/app/submissions', group: 'Pages', icon: History },
      { id: 'p-assess', title: 'Assessments', subtitle: 'Timed technical screeners', path: '/app/assessments', group: 'Pages', icon: Award },
      { id: 'p-analytics', title: 'Analytics', subtitle: 'Submission velocity and domain coverage', path: '/app/analytics', group: 'Pages', icon: BarChart3 },
      { id: 'p-leader', title: 'Leaderboard', subtitle: 'Global and weekly rankings', path: '/app/leaderboard', group: 'Pages', icon: Trophy },
      { id: 'p-certs', title: 'Certificates', subtitle: 'Verified SHA-256 credentials', path: '/app/certificates', group: 'Pages', icon: FileCheck2 },
      { id: 'p-wiki', title: 'Platform wiki', subtitle: 'Architecture, ER schema, and Harbor docs', path: '/wiki', group: 'Pages', icon: BookOpen },
      { id: 'p-settings', title: 'Settings', subtitle: 'Profile, security, and Gemini key', path: '/app/settings', group: 'Pages', icon: Settings },
    ];

    const diffBadge = (diff: string) =>
      diff === 'Easy'
        ? 'text-[#4cc38a]'
        : diff === 'Medium'
        ? 'text-[#e5a00d]'
        : 'text-[#e5484d]';

    const challengeItems: SearchResultItem[] = challenges.map((c) => ({
      id: `c-${c.id}`,
      title: c.title,
      subtitle: `${c.category} · ${c.expected_complexity?.time || 'O(N)'}`,
      badge: c.difficulty,
      badgeClass: diffBadge(c.difficulty),
      path: `/app/workspace/${c.id}`,
      group: 'Challenges',
      icon: Code2,
    }));

    const videoItems: SearchResultItem[] = videos.map((v) => ({
      id: `v-${v.id}`,
      title: v.title,
      subtitle: `${v.instructor} · ${v.duration_minutes}m`,
      badge: v.category,
      badgeClass: 'text-[#a1a1a6]',
      path: `/app/videos/${v.id}`,
      group: 'Masterclasses',
      icon: Video,
    }));

    const assessmentItems: SearchResultItem[] = assessments.map((a) => ({
      id: `a-${a.id}`,
      title: a.title,
      subtitle: `${a.duration_minutes} mins · Passing ${a.passing_score}%`,
      badge: 'Screener',
      badgeClass: 'text-[#a1a1a6]',
      path: '/app/assessments',
      group: 'Assessments',
      icon: Award,
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
        className="w-full max-w-2xl bg-[#19191b] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-white/[0.08] bg-[#141415]">
          <Search strokeWidth={1.5} className="w-4 h-4 text-[#85858b] mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            autoFocus
            className="w-full bg-transparent text-[#ededed] placeholder-[#85858b] text-sm focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#85858b] hover:text-[#ededed] hover:bg-[#222225] transition-colors"
            aria-label="Close search"
          >
            <X strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
          {items.length > 0 ? (
            items.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelect(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors duration-150 border ${
                    isSelected
                      ? 'bg-[#222225] border-white/[0.1] text-[#ededed]'
                      : 'border-transparent hover:bg-[#222225]/60 text-[#a1a1a6]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-[#141415] border border-white/[0.08] flex items-center justify-center shrink-0">
                      <Icon strokeWidth={1.5} className="w-4 h-4 text-[#85858b]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#ededed] truncate">{item.title}</p>
                      <p className="text-xs text-[#85858b] truncate">
                        <span className="font-mono">{item.group}</span> · {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    {item.badge && (
                      <span className={`font-mono text-xs ${item.badgeClass || 'text-[#85858b]'}`}>
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight strokeWidth={1.5} className={`w-4 h-4 transition-opacity ${isSelected ? 'text-[#ededed] opacity-100' : 'text-[#85858b] opacity-40'}`} />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm text-[#a1a1a6]">No results matching &ldquo;{query}&rdquo;</p>
              <button
                type="button"
                onClick={() => handleSelect('/app/generator')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#e5a00d] hover:text-[#f0b024]"
              >
                <Cpu strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Generate a challenge for this topic</span>
              </button>
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-[#0f0f10] border-t border-white/[0.08] flex items-center justify-between text-xs text-[#85858b] font-mono">
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-[#19191b] border border-white/[0.08]">↑↓</kbd>
            <span>Navigate</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#19191b] border border-white/[0.08]">↵</kbd>
            <span>Open</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-[#19191b] border border-white/[0.08]">Esc</kbd>
            <span>Close</span>
          </span>
        </div>
      </div>
    </div>
  );
};
