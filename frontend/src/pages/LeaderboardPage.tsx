import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LeaderboardUser } from '../types';
import { Search } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [filter, setFilter] = useState<'all' | 'weekly'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getLeaderboard(filter)
      .then((rows) => {
        if (active) setLeaderboard(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filter]);

  const handleFilterChange = (nextFilter: 'all' | 'weekly') => {
    setLoading(true);
    setFilter(nextFilter);
  };

  const filteredUsers = leaderboard.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed]">
            Leaderboard
          </h1>
          <p className="text-sm text-[#85858b] mt-1">
            Rankings by solved challenges, streak cadence, and accuracy
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#19191b] border border-white/[0.08] text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === 'all' ? 'bg-[#222225] text-[#ededed]' : 'text-[#85858b] hover:text-[#ededed]'
            }`}
          >
            All-time
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('weekly')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === 'weekly' ? 'bg-[#222225] text-[#ededed]' : 'text-[#85858b] hover:text-[#ededed]'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Top 3 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-xl bg-[#19191b] border border-white/[0.08] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 tabular-nums">
          {leaderboard.slice(0, 3).map((top, idx) => {
            const rankLabels = ['#1', '#2', '#3'];
            return (
              <div
                key={top.rank}
                className={`p-5 rounded-xl bg-[#19191b] border flex flex-col justify-between ${
                  idx === 0 ? 'border-[#e5a00d]/50' : 'border-white/[0.08]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={top.avatar}
                      alt={top.name}
                      className="w-10 h-10 rounded-lg object-cover border border-white/[0.1]"
                    />
                    <div className="min-w-0">
                      <h2 className="text-sm font-medium text-[#ededed] truncate">{top.name}</h2>
                      <p className="text-xs text-[#85858b] truncate">{top.role}</p>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-xs ${
                      idx === 0 ? 'text-[#e5a00d]' : 'text-[#85858b]'
                    }`}
                  >
                    {rankLabels[idx] || `#${top.rank}`}
                  </span>
                </div>

                <div className="pt-4 border-t border-white/[0.08] grid grid-cols-3 text-xs">
                  <div>
                    <p className="text-[#85858b]">Points</p>
                    <p className="font-mono text-[#ededed] mt-0.5">{top.points.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[#85858b]">Solved</p>
                    <p className="font-mono text-[#ededed] mt-0.5">{top.solved}</p>
                  </div>
                  <div>
                    <p className="text-[#85858b]">Streak</p>
                    <p className="font-mono text-[#4cc38a] mt-0.5">{top.streak}d</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl bg-[#19191b] border border-white/[0.08] overflow-hidden">
        <div className="p-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search strokeWidth={1.5} className="w-4 h-4 text-[#85858b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 bg-[#141415] border border-white/[0.08] rounded-lg pl-9 pr-3 text-xs text-[#ededed] placeholder-[#85858b] focus:outline-none focus:border-[#e5a00d]"
            />
          </div>
          <span className="text-xs text-[#85858b] font-mono tabular-nums">
            {filter === 'weekly' ? 'Weekly' : 'All-time'} · {filteredUsers.length} ranked
          </span>
        </div>

        {/* Mobile */}
        <div className="sm:hidden divide-y divide-white/[0.08]">
          {filteredUsers.map((u) => {
            const isCurrentUser = Boolean(u.is_current_user) || u.name.includes('(You)');
            return (
              <div
                key={`mob-${u.rank}-${u.name}`}
                className={`p-3.5 flex items-center justify-between gap-3 tabular-nums ${
                  isCurrentUser ? 'bg-[#222225]' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-[#85858b] w-7 shrink-0">#{u.rank}</span>
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-8 h-8 rounded-md object-cover border border-white/[0.08] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#ededed] truncate">{u.name}</p>
                    <p className="text-[11px] font-mono text-[#85858b] mt-0.5">
                      {u.solved} solved · {u.streak}d · {u.win_rate}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono text-[#ededed]">{u.points.toLocaleString()}</p>
                  <p className="text-[10px] text-[#85858b] font-mono">pts</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#0f0f10] text-[#85858b] font-mono">
                <th className="py-3.5 px-6 font-normal">Rank</th>
                <th className="py-3.5 px-4 font-normal">Developer</th>
                <th className="py-3.5 px-4 font-normal">Tier</th>
                <th className="py-3.5 px-4 font-normal">Solved</th>
                <th className="py-3.5 px-4 font-normal">Streak</th>
                <th className="py-3.5 px-4 font-normal">Accuracy</th>
                <th className="py-3.5 px-6 font-normal text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredUsers.map((u) => {
                const isCurrentUser = Boolean(u.is_current_user) || u.name.includes('(You)');
                return (
                  <tr
                    key={`${u.rank}-${u.name}`}
                    className={`transition-colors ${
                      isCurrentUser ? 'bg-[#222225] font-medium' : 'hover:bg-[#222225]/50'
                    }`}
                  >
                    <td className="py-3.5 px-6 font-mono text-[#a1a1a6]">#{u.rank}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-7 h-7 rounded-md object-cover border border-white/[0.08]"
                        />
                        <span className="font-medium text-[#ededed]">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#85858b]">{u.badge}</td>
                    <td className="py-3.5 px-4 font-mono text-[#a1a1a6]">{u.solved}</td>
                    <td className="py-3.5 px-4 font-mono text-[#a1a1a6]">{u.streak}d</td>
                    <td className="py-3.5 px-4 font-mono text-[#4cc38a]">{u.win_rate}</td>
                    <td className="py-3.5 px-6 font-mono text-right text-[#ededed]">
                      {u.points.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
