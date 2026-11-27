import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useContexts';
import { api } from '../services/api';
import { Challenge, Submission, AnalyticsSummary } from '../types';
import { ArrowRight, Play, Clock, Cpu } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [aData, cData, sData] = await Promise.all([
          api.getAnalytics().catch(() => null),
          api.getChallenges().catch(() => []),
          api.getSubmissions().catch(() => []),
        ]);
        setAnalytics(aData);
        setChallenges(cData);
        setSubmissions(sData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const skillsList = analytics?.skills_radar?.length
    ? [...analytics.skills_radar].sort((a, b) => b.score - a.score)
    : [
        { subject: 'Arrays', score: 92 },
        { subject: 'Graphs', score: 88 },
        { subject: 'Dynamic Prog', score: 84 },
        { subject: 'System Design', score: 90 },
        { subject: 'ML Math', score: 95 },
      ];

  const radarAvg = (
    skillsList.reduce((sum, item) => sum + item.score, 0) / Math.max(1, skillsList.length)
  ).toFixed(1);

  const solvedSet = new Set(
    submissions.filter((s) => s.status === 'Accepted').map((s) => s.challenge_id)
  );
  const nextRecommended = challenges.find((c) => !solvedSet.has(c.id)) || challenges[0];

  const stats = [
    {
      label: 'Challenges solved',
      value: String(user?.solved_count ?? analytics?.total_challenges_solved ?? 0),
      meta: 'Verified accepted runs',
      accent: false,
    },
    {
      label: 'Success rate',
      value: `${(analytics?.success_rate ?? 88.5).toFixed(1)}%`,
      meta: 'Passing submission ratio',
      accent: false,
    },
    {
      label: 'Coding streak',
      value: `${user?.streak ?? analytics?.current_streak ?? 1}d`,
      meta: 'Consecutive active days',
      accent: false,
    },
    {
      label: 'Total points',
      value: (user?.points ?? analytics?.total_points ?? 1200).toLocaleString(),
      meta: `Global rank #${analytics?.global_rank ?? 184}`,
      accent: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header — context title, no greeting banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed]">
            Overview
          </h1>
          <p className="text-sm text-[#85858b] mt-1">
            {user?.full_name || 'Developer'} · {user?.role || 'Engineer'} workbench
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/app/workspace/c-ml-linear-regression"
            className="inline-flex items-center gap-2 px-3.5 h-9 rounded-lg text-xs font-medium text-[#ededed] bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] transition-colors"
          >
            <Play strokeWidth={1.5} className="w-3.5 h-3.5 text-[#a1a1a6]" />
            <span>ML workspace</span>
          </Link>
          <Link
            to="/app/generator"
            className="inline-flex items-center gap-2 px-3.5 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
          >
            <Cpu strokeWidth={1.5} className="w-3.5 h-3.5" />
            <span>New challenge</span>
          </Link>
        </div>
      </div>

      {/* 4 Compact Stat Cards — Numbers only */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-[#19191b] border border-white/[0.08] animate-pulse p-5"
              />
            ))
          : stats.map((s) => (
              <div
                key={s.label}
                className="p-5 rounded-xl bg-[#19191b] border border-white/[0.08] flex flex-col justify-between"
              >
                <span className="text-xs text-[#85858b]">{s.label}</span>
                <p
                  className={`text-2xl sm:text-[28px] font-medium font-mono leading-none mt-3 ${
                    s.accent ? 'text-[#e5a00d]' : 'text-[#ededed]'
                  }`}
                >
                  {s.value}
                </p>
                <p className="text-xs text-[#85858b] mt-2 truncate">{s.meta}</p>
              </div>
            ))}
      </div>

      {/* Main Chart (8 cols) + Ranked Proficiency List (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-xl bg-[#19191b] border border-white/[0.08]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-medium text-[#ededed]">Weekly submission velocity</h2>
              <p className="text-xs text-[#85858b] mt-0.5">
                Total runs compared against accepted solutions
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#85858b]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#e5a00d]" />
                Submissions
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6b6b73]" />
                Accepted
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.weekly_activity || []}>
                <defs>
                  <linearGradient id="amberVel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e5a00d" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#e5a00d" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(237,237,237,0.06)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#85858b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="IBM Plex Mono, monospace"
                />
                <YAxis
                  stroke="#85858b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="IBM Plex Mono, monospace"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#19191b',
                    borderColor: 'rgba(237,237,237,0.14)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#ededed',
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke="#e5a00d"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#amberVel)"
                />
                <Area
                  type="monotone"
                  dataKey="solved"
                  stroke="#6b6b73"
                  strokeWidth={1.5}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranked Domain Proficiency List */}
        <div className="lg:col-span-4 p-6 rounded-xl bg-[#19191b] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="text-base font-medium text-[#ededed]">Domain mastery</h2>
              <span className="font-mono text-sm text-[#ededed] tabular-nums">{radarAvg}/100</span>
            </div>
            <p className="text-xs text-[#85858b] mb-6">Average proficiency score</p>

            <div className="space-y-4">
              {skillsList.map((item, idx) => (
                <div key={item.subject} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#a1a1a6]">{item.subject}</span>
                    <span className="font-mono text-[#ededed] tabular-nums">{item.score}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#222225] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${idx === 0 ? 'bg-[#e5a00d]' : 'bg-[#6b6b73]'}`}
                      style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-white/[0.08] flex justify-end text-xs">
            <Link to="/app/analytics" className="text-[#a1a1a6] hover:text-[#ededed] transition-colors">
              Full analytics →
            </Link>
          </div>
        </div>
      </div>

      {/* Up Next & Recommended Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-6 rounded-xl bg-[#19191b] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="text-[#e5a00d]">Up next</span>
              <span className="text-[#85858b] flex items-center gap-1.5 tabular-nums">
                <Clock strokeWidth={1.5} className="w-3.5 h-3.5" />
                {nextRecommended?.expected_complexity?.time || 'O(N)'}
              </span>
            </div>
            <h3 className="text-lg font-medium text-[#ededed]">
              {nextRecommended?.title || 'LRU Cache Design'}
            </h3>
            <p className="text-xs text-[#a1a1a6] mt-2 line-clamp-2 leading-relaxed">
              {nextRecommended?.description?.replace(/[#*`$]/g, '') ||
                'Implement get and put operations in O(1) time complexity with automatic eviction.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs font-mono text-[#85858b]">
              {nextRecommended?.category || 'Design & Systems'}
            </span>
            <Link
              to={`/app/workspace/${nextRecommended?.id || 'c2-lru-cache'}`}
              className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
            >
              <span>Open in IDE</span>
              <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 rounded-xl bg-[#19191b] border border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-medium text-[#ededed]">Recommended challenges</h2>
              <p className="text-xs text-[#85858b] mt-0.5">Matched to your active topics</p>
            </div>
            <Link to="/app/challenges" className="text-xs text-[#a1a1a6] hover:text-[#ededed] transition-colors">
              View all →
            </Link>
          </div>

          <div className="divide-y divide-white/[0.08]">
            {challenges.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-[#ededed] truncate">{c.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[#85858b] tabular-nums">
                    <span>{c.category}</span>
                    <span>·</span>
                    <span className="font-mono">{c.acceptance_rate}% accepted</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`font-mono text-xs ${
                      c.difficulty === 'Easy'
                        ? 'text-[#4cc38a]'
                        : c.difficulty === 'Medium'
                        ? 'text-[#e5a00d]'
                        : 'text-[#e5484d]'
                    }`}
                  >
                    {c.difficulty}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/workspace/${c.id}`)}
                    className="w-8 h-8 rounded-lg bg-[#222225] hover:bg-[#ededed] text-[#a1a1a6] hover:text-[#141415] border border-white/[0.08] flex items-center justify-center transition-colors"
                    title="Solve in IDE"
                  >
                    <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#19191b] border border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-medium text-[#ededed]">Recent submissions</h2>
            <p className="text-xs text-[#85858b] mt-0.5">Latest test runner results</p>
          </div>
          <Link to="/app/submissions" className="text-xs text-[#a1a1a6] hover:text-[#ededed] transition-colors">
            Full history →
          </Link>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-2">
          {submissions.length > 0 ? (
            submissions.slice(0, 4).map((sub) => (
              <Link
                key={sub.id}
                to="/app/submissions"
                className="block p-3.5 rounded-lg bg-[#141415] border border-white/[0.08] space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-[#ededed] line-clamp-1">
                    {sub.challenge_title || 'Custom challenge'}
                  </span>
                  <span
                    className={`shrink-0 font-mono text-xs ${
                      sub.status === 'Accepted' ? 'text-[#4cc38a]' : 'text-[#e5484d]'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-[#85858b] tabular-nums">
                  <span className="capitalize">
                    {sub.language} · {sub.runtime_ms}ms
                  </span>
                  <span className="text-[#ededed]">{sub.score}%</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="py-6 text-center text-xs text-[#85858b]">
              No submissions yet. Open a challenge above to run your first solution.
            </p>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <thead>
              <tr className="border-b border-white/[0.08] text-[#85858b] font-mono">
                <th className="pb-3 font-normal">Challenge</th>
                <th className="pb-3 font-normal">Language</th>
                <th className="pb-3 font-normal">Status</th>
                <th className="pb-3 font-normal">Runtime</th>
                <th className="pb-3 font-normal">Score</th>
                <th className="pb-3 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {submissions.length > 0 ? (
                submissions.slice(0, 4).map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#222225]/50 transition-colors">
                    <td className="py-3 font-medium text-[#ededed]">
                      {sub.challenge_title || 'Custom challenge'}
                    </td>
                    <td className="py-3 font-mono text-[#a1a1a6] capitalize">{sub.language}</td>
                    <td className="py-3">
                      <span
                        className={`font-mono text-xs ${
                          sub.status === 'Accepted' ? 'text-[#4cc38a]' : 'text-[#e5484d]'
                        }`}
                      >
                        {sub.status === 'Accepted' ? '[PASS]' : '[FAIL]'} {sub.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[#85858b]">{sub.runtime_ms} ms</td>
                    <td className="py-3 font-mono text-[#ededed]">{sub.score}%</td>
                    <td className="py-3 text-right">
                      <Link
                        to="/app/submissions"
                        className="text-[#a1a1a6] hover:text-[#ededed] font-medium transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#85858b]">
                    No submissions yet. Open a challenge above to run your first solution.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
