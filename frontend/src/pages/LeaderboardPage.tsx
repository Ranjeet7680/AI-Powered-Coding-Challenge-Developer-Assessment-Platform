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
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Developer Leaderboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Competitive rankings based on algorithm solutions, streak length, and test case accuracy.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-1.5 rounded-xl transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time Global
          </button>
          <button
            onClick={() => handleFilterChange('weekly')}
            className={`px-4 py-1.5 rounded-xl transition ${
              filter === 'weekly'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Sprint
          </button>
        </div>
      </div>

      {/* Podium Top 3 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-60 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {leaderboard.slice(0, 3).map((top, idx) => {
            const podiumStyles = [
              { border: 'border-amber-400/50', badge: 'bg-amber-400/20 text-amber-300', rank: '1st Place' },
              { border: 'border-slate-300/40', badge: 'bg-slate-300/20 text-slate-200', rank: '2nd Place' },
              { border: 'border-amber-600/40', badge: 'bg-amber-600/20 text-amber-400', rank: '3rd Place' },
            ];
            const style = podiumStyles[idx] || podiumStyles[0];

            return (
              <div
                key={top.rank}
                className={`p-6 rounded-3xl bg-slate-900/60 border ${style.border} shadow-2xl relative flex flex-col items-center text-center`}
              >
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 ${style.badge}`}>
                  {style.rank}
                </span>
                <img
                  src={top.avatar}
                  alt={top.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50 shadow-lg mb-3"
                />
                <h4 className="text-base font-bold text-white">{top.name}</h4>
                <p className="text-xs text-slate-400 mb-4">{top.role}</p>

                <div className="w-full pt-4 border-t border-slate-800 grid grid-cols-3 text-center text-xs">
                  <div>
                    <p className="font-mono font-bold text-indigo-400">{top.points.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">Points</p>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-emerald-400">{top.solved}</p>
                    <p className="text-[10px] text-slate-500">Solved</p>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-amber-400">{top.streak}d</p>
                    <p className="text-[10px] text-slate-500">Streak</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search developer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filter === 'weekly' ? 'Weekly Sprint' : 'All-Time'} • {filteredUsers.length} ranked
          </span>
        </div>

        {/* Mobile Card Stack (< sm) */}
        <div className="sm:hidden divide-y divide-slate-800/70">
          {filteredUsers.map((u) => {
            const isCurrentUser = Boolean(u.is_current_user) || u.name.includes('(You)');
            return (
              <div
                key={`mob-${u.rank}-${u.name}`}
                className={`p-3.5 flex items-center justify-between gap-3 ${
                  isCurrentUser ? 'bg-indigo-600/15 border-l-4 border-l-indigo-500' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-slate-400 w-7 shrink-0">#{u.rank}</span>
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{u.name}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                      <span className="text-slate-300">{u.solved} solved</span>
                      <span>·</span>
                      <span className="text-amber-400">{u.streak}d</span>
                      <span>·</span>
                      <span className="text-emerald-400">{u.win_rate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono font-extrabold text-indigo-300">{u.points.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 font-mono">PTS</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
                <th className="py-3.5 px-6 font-semibold">Rank</th>
                <th className="py-3.5 px-4 font-semibold">Developer</th>
                <th className="py-3.5 px-4 font-semibold">Title / Badge</th>
                <th className="py-3.5 px-4 font-semibold">Solved</th>
                <th className="py-3.5 px-4 font-semibold">Streak</th>
                <th className="py-3.5 px-4 font-semibold">Win Rate</th>
                <th className="py-3.5 px-6 font-semibold text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => {
                const isCurrentUser = Boolean(u.is_current_user) || u.name.includes('(You)');
                return (
                  <tr
                    key={`${u.rank}-${u.name}`}
                    className={`transition ${
                      isCurrentUser
                        ? 'bg-indigo-600/15 border-l-4 border-l-indigo-500 font-semibold'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-300">#{u.rank}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        />
                        <span className="font-semibold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {u.badge}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{u.solved}</td>
                    <td className="py-3.5 px-4 font-mono text-amber-400">{u.streak} Days</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">{u.win_rate}</td>
                    <td className="py-3.5 px-6 font-mono font-bold text-right text-indigo-300">
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
