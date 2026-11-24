import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Challenge } from '../types';
import {
  Search,
  Filter,
  Code2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react';

export const ChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.getChallenges({
      search: search || undefined,
      difficulty: difficultyFilter,
      category: categoryFilter,
    })
      .then(setChallenges)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, difficultyFilter, categoryFilter]);

  const categories = [
    'All',
    'Machine Learning',
    'Arrays & Hashing',
    'Design & Systems',
    'Two Pointers',
    'Graphs & BFS/DFS',
    'Dynamic Programming',
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Challenge Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Explore curated algorithmic problems and automated technical assessments.
          </p>
        </div>

        <Link
          to="/app/generator"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          Generate with AI
        </Link>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search problems by title, tag, or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Difficulty pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                  difficultyFilter === diff
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-500 font-semibold mr-1">Categories:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                categoryFilter === cat
                  ? cat === 'Machine Learning'
                    ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                    : 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat === 'Machine Learning' && <BrainCircuit className="w-3 h-3 text-purple-300" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          <span className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin inline-block mb-3" />
          <p>Loading challenges...</p>
        </div>
      ) : challenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((c) => (
            <div
              key={c.id}
              className={`p-5 rounded-2xl bg-slate-900/50 border transition duration-200 flex flex-col justify-between group shadow-lg hover:-translate-y-1 ${
                c.category === 'Machine Learning'
                  ? 'border-purple-500/40 hover:border-purple-500/80 shadow-purple-950/20'
                  : 'border-slate-800/80 hover:border-indigo-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                        c.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : c.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {c.difficulty}
                    </span>
                    {c.category === 'Machine Learning' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <BrainCircuit className="w-3 h-3" />
                        ML
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {c.expected_complexity?.time || 'O(N)'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {c.description.replace(/[#*`]/g, '')}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  {c.acceptance_rate}% Acceptance
                </span>
                <button
                  onClick={() => navigate(`/app/workspace/${c.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  Solve Challenge
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
          No challenges matching your filters. Try adjusting your search query or generate one with AI!
        </div>
      )}
    </div>
  );
};
