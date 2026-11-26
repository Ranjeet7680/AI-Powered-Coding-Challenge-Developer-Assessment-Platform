import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Challenge, ChallengeStats } from '../types';
import {
  Search,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
  LayoutGrid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

const PAGE_SIZE = 24;

export const ChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    api.getSubmissions()
      .then((subs) => {
        const ids = new Set(subs.filter((s) => s.status === 'Accepted').map((s) => s.challenge_id));
        setSolvedIds(ids);
      })
      .catch(() => {});

    api.getChallengeStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    api.getChallenges({
      search: search || undefined,
      difficulty: difficultyFilter,
      category: categoryFilter,
    })
      .then((list) => {
        if (active) setChallenges(list);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, difficultyFilter, categoryFilter]);

  const categories = useMemo(() => {
    if (stats && Object.keys(stats.by_category).length > 0) {
      return ['All', ...Object.keys(stats.by_category)];
    }
    return [
      'All',
      'Arrays & Hashing',
      'Strings & Parsing',
      'Two Pointers & Sliding Window',
      'Stack & Queue',
      'Graphs & BFS/DFS',
      'Dynamic Programming',
      'Binary Search & Sorting',
      'Math & Bitwise',
      'Design & Systems',
      'Machine Learning',
    ];
  }, [stats]);

  const filteredChallenges = useMemo(() => {
    if (statusFilter === 'solved') {
      return challenges.filter((c) => solvedIds.has(c.id));
    }
    if (statusFilter === 'unsolved') {
      return challenges.filter((c) => !solvedIds.has(c.id));
    }
    return challenges;
  }, [challenges, solvedIds, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredChallenges.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedChallenges = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredChallenges.slice(start, start + PAGE_SIZE);
  }, [filteredChallenges, safePage]);

  const solvedVisibleCount = useMemo(
    () => filteredChallenges.filter((c) => solvedIds.has(c.id)).length,
    [filteredChallenges, solvedIds]
  );

  const resetAllFilters = () => {
    setSearch('');
    setDifficultyFilter('All');
    setCategoryFilter('All');
    setStatusFilter('all');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Challenge Library
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              {stats?.total ?? challenges.length} Challenges
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Explore verified algorithmic, systems &amp; ML challenges across 10 domains —{' '}
            <span className="text-emerald-400 font-mono font-semibold">
              {solvedVisibleCount}/{filteredChallenges.length} solved in view
            </span>
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
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 350+ problems by title, tag, or topic..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
            {/* Difficulty Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
                const count =
                  diff === 'All' ? stats?.total : stats?.by_difficulty?.[diff];
                return (
                  <button
                    key={diff}
                    onClick={() => {
                      setDifficultyFilter(diff);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
                      difficultyFilter === diff
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{diff}</span>
                    {count !== undefined && (
                      <span className="text-[10px] font-mono opacity-75">({count})</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Solved / Unsolved Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
              {(['all', 'solved', 'unsolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition ${
                    statusFilter === st
                      ? 'bg-emerald-600/80 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Grid / Table Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-1.5 pt-2 pb-1 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-500 font-semibold mr-1 shrink-0">Categories:</span>
          {categories.map((cat) => {
            const catCount =
              cat === 'All' ? stats?.total : stats?.by_category?.[cat];
            return (
              <button
                key={cat}
                onClick={() => {
                  setCategoryFilter(cat);
                  setPage(1);
                }}
                className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  categoryFilter === cat
                    ? cat === 'Machine Learning'
                      ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                      : 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat === 'Machine Learning' && <BrainCircuit className="w-3 h-3 text-purple-300" />}
                <span>{cat}</span>
                {catCount !== undefined && (
                  <span className="text-[10px] font-mono opacity-75">{catCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse p-5 space-y-3">
              <div className="h-4 w-20 bg-slate-800 rounded" />
              <div className="h-5 w-3/4 bg-slate-800 rounded" />
              <div className="h-3 w-full bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : paginatedChallenges.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedChallenges.map((c) => {
                const isSolved = solvedIds.has(c.id);
                return (
                  <div
                    key={c.id}
                    className={`p-5 rounded-2xl bg-slate-900/50 border transition duration-200 flex flex-col justify-between group shadow-lg hover:-translate-y-1 ${
                      c.category === 'Machine Learning'
                        ? 'border-purple-500/35 hover:border-purple-500/75 shadow-purple-950/20'
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
                          {isSolved && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Solved
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {c.expected_complexity?.time || 'O(N)'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mb-1.5">
                        {c.title}
                      </h3>
                      <p className="text-[11px] font-mono text-indigo-400/90 mb-2">{c.category}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {c.description.replace(/[#*`$]/g, '')}
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
                        {isSolved ? 'Review / Optimize' : 'Solve Challenge'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
                      <th className="py-3.5 px-5 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Challenge</th>
                      <th className="py-3.5 px-4 font-semibold">Category</th>
                      <th className="py-3.5 px-4 font-semibold">Difficulty</th>
                      <th className="py-3.5 px-4 font-semibold">Target</th>
                      <th className="py-3.5 px-4 font-semibold">Acceptance</th>
                      <th className="py-3.5 px-5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedChallenges.map((c) => {
                      const isSolved = solvedIds.has(c.id);
                      return (
                        <tr key={c.id} className="hover:bg-slate-800/35 transition">
                          <td className="py-3.5 px-5">
                            {isSolved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" />
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-white">{c.title}</td>
                          <td className="py-3.5 px-4 text-slate-400">{c.category}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                                c.difficulty === 'Easy'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : c.difficulty === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {c.difficulty}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-indigo-300">
                            {c.expected_complexity?.time || 'O(N)'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">{c.acceptance_rate}%</td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => navigate(`/app/workspace/${c.id}`)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                            >
                              Solve <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-mono">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filteredChallenges.length)} of{' '}
                {filteredChallenges.length} challenges (Page {safePage} of {totalPages})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <span className="px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 font-mono font-bold text-indigo-300">
                  {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs space-y-3">
          <p>No challenges matching your filters.</p>
          <button
            onClick={resetAllFilters}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
