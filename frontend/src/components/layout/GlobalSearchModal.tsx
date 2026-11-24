import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Code2, Trophy, BarChart3, Settings, Award, Layers, X, ArrowRight, Video } from 'lucide-react';
import { api } from '../../services/api';
import { Challenge } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      api.getChallenges().then(setChallenges).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { name: 'Video Masterclasses & Walkthroughs', path: '/app/videos', icon: Video, color: 'text-purple-400' },
    { name: 'AI Task Generator', path: '/app/generator', icon: Sparkles, color: 'text-indigo-400' },
    { name: 'Challenge Library', path: '/app/challenges', icon: Layers, color: 'text-cyan-400' },
    { name: 'Coding Workspace (LRU Cache)', path: '/app/workspace/c2-lru-cache', icon: Code2, color: 'text-violet-400' },
    { name: 'Assessments', path: '/app/assessments', icon: Award, color: 'text-emerald-400' },
    { name: 'Developer Analytics', path: '/app/analytics', icon: BarChart3, color: 'text-amber-400' },
    { name: 'Leaderboard', path: '/app/leaderboard', icon: Trophy, color: 'text-yellow-400' },
    { name: 'Settings & API Keys', path: '/app/settings', icon: Settings, color: 'text-slate-400' },
  ];

  const filteredChallenges = challenges.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase()) ||
    c.difficulty.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden shadow-indigo-950/40">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search challenges, tools, pages... (Press Esc to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-slate-500 text-base focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Nav Section */}
          {!query && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3 py-1 font-mono">
                Platform Navigation
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-800/70 text-slate-300 hover:text-white transition group border border-transparent hover:border-slate-700/60"
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm font-medium">{item.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 text-slate-400 transition" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtered Challenges */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3 py-1 font-mono">
              {query ? 'Matching Challenges' : 'Featured Challenges'}
            </p>
            <div className="space-y-1 mt-1">
              {(query ? filteredChallenges : challenges.slice(0, 4)).map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => handleSelect(`/app/workspace/${challenge.id}`)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800/80 text-left transition border border-transparent hover:border-indigo-500/30 group"
                >
                  <div className="flex items-center gap-3">
                    <Code2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-white">
                        {challenge.title}
                      </p>
                      <p className="text-xs text-slate-500">{challenge.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        challenge.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : challenge.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {challenge.difficulty}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
                  </div>
                </button>
              ))}

              {query && filteredChallenges.length === 0 && (
                <p className="text-sm text-slate-500 px-3 py-4 text-center">
                  No challenges matching "{query}". Try searching "Dynamic Programming" or generate one with AI!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Navigate with mouse or arrow keys</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
