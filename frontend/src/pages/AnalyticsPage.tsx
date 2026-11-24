import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  PieChart,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const difficultyData = [
    { name: 'Easy', value: data?.difficulty_breakdown?.Easy || 12, color: '#10b981' },
    { name: 'Medium', value: data?.difficulty_breakdown?.Medium || 10, color: '#f59e0b' },
    { name: 'Hard', value: data?.difficulty_breakdown?.Hard || 6, color: '#f43f5e' },
  ];

  const languageData = [
    { language: 'Python', count: 42 },
    { language: 'TypeScript', count: 28 },
    { language: 'JavaScript', count: 18 },
    { language: 'C++', count: 12 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Developer Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          In-depth breakdown of algorithmic skill velocity, language diversity, and submission accuracy.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Accuracy Ratio</span>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            {data?.success_rate || 89.4}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Across all test runs</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Daily Streak</span>
          <p className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
            {data?.current_streak || 12} Days
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Consistency score: High</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Lifetime Score</span>
          <p className="text-3xl font-extrabold text-indigo-400 font-mono mt-1">
            {data?.total_points || 2450} pts
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Algorithm verified vectors</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Global Ranking</span>
          <p className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">
            #{data?.global_rank || 184}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Top 2% of platform</p>
        </div>
      </div>

      {/* Two Column Grid: Weekly Velocity & Skill Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Velocity */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">Weekly Velocity Trend</h3>
          <p className="text-xs text-slate-400 mb-6">Submissions and passing algorithms per day</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.weekly_activity || []}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="submissions" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGradient)" />
                <Area type="monotone" dataKey="solved" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Radar */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Competency Radar</h3>
            <p className="text-xs text-slate-400 mb-4">Multi-domain algorithm scoring</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data?.skills_radar || []}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row: Difficulty Distribution & Languages Used */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty Pie Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Solved Challenges by Difficulty</h3>
            <p className="text-xs text-slate-400 mb-4">Ratio of solved problems across complexity tiers</p>
          </div>

          <div className="flex items-center justify-center gap-8 py-4">
            <div className="h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={difficultyData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {difficultyData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-300 font-medium">{d.name}:</span>
                  <span className="text-white font-mono font-bold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Languages Bar Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Language Utilization</h3>
            <p className="text-xs text-slate-400 mb-4">Distribution of programming languages used</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languageData}>
                <XAxis dataKey="language" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
