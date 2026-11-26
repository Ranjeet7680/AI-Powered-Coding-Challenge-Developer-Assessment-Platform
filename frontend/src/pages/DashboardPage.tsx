import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useContexts';
import { api } from '../services/api';
import { Challenge, Submission, AnalyticsSummary } from '../types';
import {
  Sparkles,
  Code2,
  Trophy,
  Flame,
  Award,
  ArrowRight,
  Play,
  CheckCircle2,
  Clock,
  TrendingUp,
  Video,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
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

  const radarAvg = analytics?.skills_radar?.length
    ? (analytics.skills_radar.reduce((sum, item) => sum + item.score, 0) / analytics.skills_radar.length).toFixed(1)
    : '90.2';

  const solvedSet = new Set(submissions.filter((s) => s.status === 'Accepted').map((s) => s.challenge_id));
  const nextRecommended = challenges.find((c) => !solvedSet.has(c.id)) || challenges[0];

  const stats = [
    {
      label: 'Challenges Solved',
      value: user?.solved_count ?? analytics?.total_challenges_solved ?? 0,
      sub: 'Verified accepted solutions',
      icon: CheckCircle2,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Success Rate',
      value: `${analytics?.success_rate ?? 88.5}%`,
      sub: 'Submission accuracy ratio',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Coding Streak',
      value: `${user?.streak ?? analytics?.current_streak ?? 1} Days`,
      sub: 'Consistent daily problem solving',
      icon: Flame,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Total Points',
      value: (user?.points ?? analytics?.total_points ?? 1200).toLocaleString(),
      sub: 'Earned from test vectors',
      icon: Trophy,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Global Rank',
      value: `#${analytics?.global_rank ?? 184}`,
      sub: 'Across platform developers',
      icon: Award,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10 border-violet-500/20',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-slate-900/90 to-[#080B14] border border-indigo-500/30 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>AI Workspace Ready</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name || 'Developer'}
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Your coding journey continues. Generate bespoke problems, verify code in the live sandbox, and track your algorithmic velocity.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to="/app/generator"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              Generate Challenge
            </Link>
            <Link
              to="/app/videos"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-purple-300 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/30 transition"
            >
              <Video className="w-3.5 h-3.5 text-purple-400" />
              Watch Masterclasses
            </Link>
            <Link
              to="/app/workspace/c-ml-linear-regression"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              ML Coding Workspace
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {loading
          ? [1, 2, 3, 4, 5].map((i, idx) => (
              <div
                key={i}
                className={`h-28 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-4 sm:p-5 ${
                  idx === 4 ? 'col-span-2 lg:col-span-1' : ''
                }`}
              />
            ))
          : stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition ${
                    idx === 4 ? 'col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">{s.label}</span>
                    <div className={`p-2 rounded-xl border ${s.bgColor}`}>
                      <Icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-white font-mono tracking-tight">{s.value}</p>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{s.sub}</p>
                </div>
              );
            })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Performance Overview</h3>
              <p className="text-xs text-slate-400">Weekly coding submission volume</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              Active Velocity
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.weekly_activity || []}>
                <defs>
                  <linearGradient id="subGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#subGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Skill Mastery Overview</h3>
            <p className="text-xs text-slate-400 mb-2">Automated proficiency evaluation</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={analytics?.skills_radar || []}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <Radar name="Proficiency" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
            <span>
              Overall Score: <strong className="text-cyan-400 font-mono">{radarAvg} / 100</strong>
            </span>
            <Link to="/app/analytics" className="text-indigo-400 hover:text-indigo-300">
              View Full &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Continue & Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/70 to-slate-900/90 border border-indigo-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Up Next
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {nextRecommended?.expected_complexity?.time || 'O(N)'}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white">{nextRecommended?.title || 'LRU Cache Design'}</h4>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              {nextRecommended?.description?.replace(/[#*`$]/g, '') ||
                'Implement get and put operations in O(1) time complexity with automatic eviction.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">{nextRecommended?.category || 'Design & Systems'}</span>
            <Link
              to={`/app/workspace/${nextRecommended?.id || 'c2-lru-cache'}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
            >
              Open in IDE <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Recommended For You</h3>
              <p className="text-xs text-slate-400">Curated based on your target topics and skills</p>
            </div>
            <Link to="/app/challenges" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            {challenges.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-semibold text-white truncate">{c.title}</h5>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span>{c.category}</span>
                      <span>•</span>
                      <span className="font-mono">{c.acceptance_rate}% Acceptance</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                      c.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : c.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {c.difficulty}
                  </span>
                  <button
                    onClick={() => navigate(`/app/workspace/${c.id}`)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                    title="Solve in IDE"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Submissions</h3>
            <p className="text-xs text-slate-400">Automated test runs and scores</p>
          </div>
          <Link to="/app/submissions" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            Full History &rarr;
          </Link>
        </div>

        {/* Mobile Card Stack (< sm) */}
        <div className="sm:hidden space-y-2.5">
          {submissions.length > 0 ? (
            submissions.slice(0, 4).map((sub) => (
              <Link
                key={sub.id}
                to="/app/submissions"
                className="block p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-white line-clamp-1">
                    {sub.challenge_title || 'Custom Challenge'}
                  </span>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      sub.status === 'Accepted'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="capitalize">{sub.language} · {sub.runtime_ms}ms</span>
                  <span className="text-slate-200 font-bold">{sub.score}%</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="py-6 text-center text-xs text-slate-500">
              No submissions yet — pick a challenge above and submit your first solution!
            </p>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-3 font-semibold">Challenge</th>
                <th className="pb-3 font-semibold">Language</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Runtime</th>
                <th className="pb-3 font-semibold">Score</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {submissions.length > 0 ? (
                submissions.slice(0, 4).map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-semibold text-slate-200">{sub.challenge_title || 'Custom Challenge'}</td>
                    <td className="py-3 font-mono text-slate-400 capitalize">{sub.language}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          sub.status === 'Accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-400">{sub.runtime_ms}ms</td>
                    <td className="py-3 font-mono font-bold text-slate-200">{sub.score}%</td>
                    <td className="py-3 text-right">
                      <Link to="/app/submissions" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No submissions yet — pick a challenge above and submit your first solution!
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
