import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Challenge, ChallengeStats } from '../types';
import {
  Search,
  Cpu,
  CheckCircle2,
  ArrowRight,
  LayoutGrid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed]">
              Challenge library
            </h1>
            <span className="font-mono text-sm text-[#85858b] tabular-nums">
              {stats?.total ?? challenges.length} tasks
            </span>
          </div>
          <p className="text-sm text-[#85858b] mt-1 tabular-nums">
            10 CS and ML domains ·{' '}
            <span className="font-mono text-[#4cc38a]">
              {solvedVisibleCount}/{filteredChallenges.length} solved
            </span>
          </p>
        </div>

        <Link
          to="/app/generator"
          className="inline-flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors self-start sm:self-auto"
        >
          <Cpu strokeWidth={1.5} className="w-3.5 h-3.5" />
          <span>Generate task</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-[#19191b] border border-white/[0.08] space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-80">
            <Search strokeWidth={1.5} className="w-4 h-4 text-[#85858b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 bg-[#141415] border border-white/[0.08] rounded-lg pl-9 pr-8 text-xs text-[#ededed] placeholder-[#85858b] focus:outline-none focus:border-[#e5a00d] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#85858b] hover:text-[#ededed]"
                aria-label="Clear search"
              >
                <X strokeWidth={1.5} className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-1 bg-[#141415] p-1 rounded-lg border border-white/[0.08] overflow-x-auto">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
                const count = diff === 'All' ? stats?.total : stats?.by_difficulty?.[diff];
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => {
                      setDifficultyFilter(diff);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 tabular-nums ${
                      difficultyFilter === diff
                        ? 'bg-[#222225] text-[#ededed] font-medium'
                        : 'text-[#85858b] hover:text-[#ededed]'
                    }`}
                  >
                    <span>{diff}</span>
                    {count !== undefined && (
                      <span className="text-[11px] font-mono text-[#85858b]">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#141415] border border-white/[0.08]">
              {(['all', 'solved', 'unsolved'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-[#222225] text-[#ededed] font-medium'
                      : 'text-[#85858b] hover:text-[#ededed]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#141415] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-[#222225] text-[#ededed]' : 'text-[#85858b] hover:text-[#ededed]'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid strokeWidth={1.5} className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-[#222225] text-[#ededed]' : 'text-[#85858b] hover:text-[#ededed]'
                }`}
                title="Table view"
                aria-label="Table view"
              >
                <List strokeWidth={1.5} className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-1.5 pt-2.5 border-t border-white/[0.08]">
          <span className="text-xs text-[#85858b] mr-1 shrink-0">Category</span>
          {categories.map((cat) => {
            const catCount = cat === 'All' ? stats?.total : stats?.by_category?.[cat];
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat);
                  setPage(1);
                }}
                className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-md text-xs transition-colors flex items-center gap-1.5 border tabular-nums ${
                  isSelected
                    ? 'bg-[#222225] text-[#ededed] border-[#e5a00d]/50 font-medium'
                    : 'bg-[#141415] text-[#85858b] hover:text-[#ededed] border-white/[0.08]'
                }`}
              >
                <span>{cat}</span>
                {catCount !== undefined && (
                  <span className="text-[11px] font-mono text-[#85858b]">{catCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-[#19191b] border border-white/[0.08] animate-pulse p-5" />
          ))}
        </div>
      ) : paginatedChallenges.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedChallenges.map((c) => {
                const isSolved = solvedIds.has(c.id);
                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-xl bg-[#19191b] border border-white/[0.08] hover:border-white/[0.14] transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              c.difficulty === 'Easy'
                                ? 'text-[#4cc38a]'
                                : c.difficulty === 'Medium'
                                ? 'text-[#e5a00d]'
                                : 'text-[#e5484d]'
                            }
                          >
                            {c.difficulty}
                          </span>
                          {isSolved && (
                            <span className="inline-flex items-center gap-1 text-[#4cc38a]">
                              <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                              Solved
                            </span>
                          )}
                        </div>
                        <span className="text-[#85858b] tabular-nums">
                          {c.expected_complexity?.time || 'O(N)'}
                        </span>
                      </div>

                      <h2 className="text-base font-medium text-[#ededed] mb-1">{c.title}</h2>
                      <p className="text-xs font-mono text-[#85858b] mb-2">{c.category}</p>
                      <p className="text-xs text-[#a1a1a6] line-clamp-2 leading-relaxed mb-4">
                        {c.description.replace(/[#*`$]/g, '')}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-white/[0.08] flex items-center justify-between">
                      <span className="text-xs text-[#85858b] font-mono tabular-nums">
                        {c.acceptance_rate}% acceptance
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(`/app/workspace/${c.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
                      >
                        <span>{isSolved ? 'Review' : 'Solve'}</span>
                        <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-[#19191b] border border-white/[0.08] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs tabular-nums">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-[#0f0f10] text-[#85858b] font-mono">
                      <th className="py-3 px-5 font-normal">Status</th>
                      <th className="py-3 px-4 font-normal">Challenge</th>
                      <th className="py-3 px-4 font-normal">Category</th>
                      <th className="py-3 px-4 font-normal">Difficulty</th>
                      <th className="py-3 px-4 font-normal">Target</th>
                      <th className="py-3 px-4 font-normal">Acceptance</th>
                      <th className="py-3 px-5 font-normal text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {paginatedChallenges.map((c) => {
                      const isSolved = solvedIds.has(c.id);
                      return (
                        <tr key={c.id} className="hover:bg-[#222225]/50 transition-colors">
                          <td className="py-3.5 px-5">
                            {isSolved ? (
                              <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a]" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block" />
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#ededed]">{c.title}</td>
                          <td className="py-3.5 px-4 text-[#a1a1a6]">{c.category}</td>
                          <td className="py-3.5 px-4 font-mono">
                            <span
                              className={
                                c.difficulty === 'Easy'
                                  ? 'text-[#4cc38a]'
                                  : c.difficulty === 'Medium'
                                  ? 'text-[#e5a00d]'
                                  : 'text-[#e5484d]'
                              }
                            >
                              {c.difficulty}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#a1a1a6]">
                            {c.expected_complexity?.time || 'O(N)'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#85858b]">{c.acceptance_rate}%</td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => navigate(`/app/workspace/${c.id}`)}
                              className="inline-flex items-center gap-1 px-3 h-7 rounded-md bg-[#222225] hover:bg-[#ededed] text-[#ededed] hover:text-[#141415] border border-white/[0.08] font-medium transition-colors"
                            >
                              <span>Solve</span>
                              <ArrowRight strokeWidth={1.5} className="w-3 h-3" />
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

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/[0.08] text-xs tabular-nums">
              <span className="text-[#85858b] font-mono">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filteredChallenges.length)} of{' '}
                {filteredChallenges.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-1 px-3 h-8 rounded-lg bg-[#19191b] border border-white/[0.08] text-[#a1a1a6] hover:text-[#ededed] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <span className="px-3 h-8 inline-flex items-center rounded-lg bg-[#222225] border border-white/[0.08] font-mono text-[#ededed]">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-1 px-3 h-8 rounded-lg bg-[#19191b] border border-white/[0.08] text-[#a1a1a6] hover:text-[#ededed] disabled:opacity-40 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center rounded-xl bg-[#19191b] border border-white/[0.08] text-[#85858b] text-xs space-y-3">
          <p>No challenges matching your filters.</p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-[#ededed] hover:text-[#e5a00d] font-medium transition-colors"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};
