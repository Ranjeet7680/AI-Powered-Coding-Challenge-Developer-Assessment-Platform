import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
    { name: 'Easy', value: data?.difficulty_breakdown?.Easy ?? 0, color: '#4cc38a' },
    { name: 'Medium', value: data?.difficulty_breakdown?.Medium ?? 0, color: '#e5a00d' },
    { name: 'Hard', value: data?.difficulty_breakdown?.Hard ?? 0, color: '#e5484d' },
  ];
  const totalDifficulty = difficultyData.reduce((acc, item) => acc + item.value, 0);

  const skillsList = (data?.skills_radar || []).slice().sort((a, b) => b.score - a.score);

  const languageData = data?.language_breakdown
    ? Object.entries(data.language_breakdown)
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count)
    : [];
  const maxLangCount = languageData[0]?.count ?? 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-56 bg-[#19191b] rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-[#19191b] border border-white/[0.08] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-white/[0.08]">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed]">
          Analytics
        </h1>
        <p className="text-sm text-[#85858b] mt-1">
          Submission velocity, language distribution, and domain coverage
        </p>
      </div>

      {/* 4 Compact Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        <div className="p-5 rounded-xl bg-[#19191b] border border-white/[0.08]">
          <span className="text-xs text-[#85858b]">Accuracy ratio</span>
          <p className="text-2xl sm:text-[28px] font-medium text-[#4cc38a] font-mono mt-2">
            {(data?.success_rate ?? 0).toFixed(1)}%
          </p>
          <p className="text-xs text-[#85858b] mt-1.5">Across all test runs</p>
        </div>

        <div className="p-5 rounded-xl bg-[#19191b] border border-white/[0.08]">
          <span className="text-xs text-[#85858b]">Daily streak</span>
          <p className="text-2xl sm:text-[28px] font-medium text-[#ededed] font-mono mt-2">
            {data?.current_streak ?? 0}d
          </p>
          <p className="text-xs text-[#85858b] mt-1.5">Active daily cadence</p>
        </div>

        <div className="p-5 rounded-xl bg-[#19191b] border border-white/[0.08]">
          <span className="text-xs text-[#85858b]">Lifetime points</span>
          <p className="text-2xl sm:text-[28px] font-medium text-[#e5a00d] font-mono mt-2">
            {(data?.total_points ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-[#85858b] mt-1.5">Verified test vectors</p>
        </div>

        <div className="p-5 rounded-xl bg-[#19191b] border border-white/[0.08]">
          <span className="text-xs text-[#85858b]">Global rank</span>
          <p className="text-2xl sm:text-[28px] font-medium text-[#ededed] font-mono mt-2">
            #{data?.global_rank ?? 184}
          </p>
          <p className="text-xs text-[#85858b] mt-1.5">Platform standing</p>
        </div>
      </div>

      {/* Main Chart (8 cols) + Domain Competency List (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-xl bg-[#19191b] border border-white/[0.08]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-medium text-[#ededed]">Weekly velocity trend</h2>
              <p className="text-xs text-[#85858b] mt-0.5">Submissions and passing solutions per day</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#85858b]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#e5a00d]" />
                Submissions
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6b6b73]" />
                Solved
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.weekly_activity || []}>
                <defs>
                  <linearGradient id="areaAmber" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#areaAmber)"
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

        <div className="lg:col-span-4 p-6 rounded-xl bg-[#19191b] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <h2 className="text-base font-medium text-[#ededed]">Competency coverage</h2>
            <p className="text-xs text-[#85858b] mt-0.5 mb-5">Multi-domain score</p>

            <div className="space-y-3.5 tabular-nums">
              {skillsList.length > 0 ? (
                skillsList.map((s, idx) => (
                  <div key={s.subject} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#a1a1a6]">{s.subject}</span>
                      <span className="font-mono text-[#ededed]">{s.score}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#222225] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${idx === 0 ? 'bg-[#e5a00d]' : 'bg-[#6b6b73]'}`}
                        style={{ width: `${Math.min(100, Math.max(0, s.score))}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#85858b]">No competency records yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Difficulty Share Bar + Language Utilization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <h2 className="text-base font-medium text-[#ededed]">Solved by difficulty</h2>
            <p className="text-xs text-[#85858b] mt-0.5 mb-6">
              Share across Easy, Medium, and Hard tiers
            </p>
          </div>

          <div className="space-y-6 tabular-nums">
            <div className="h-3 w-full rounded-md bg-[#222225] overflow-hidden flex">
              {totalDifficulty > 0 &&
                difficultyData.map((d) => (
                  <div
                    key={d.name}
                    style={{
                      width: `${(d.value / totalDifficulty) * 100}%`,
                      backgroundColor: d.color,
                    }}
                    title={`${d.name}: ${d.value}`}
                  />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {difficultyData.map((d) => (
                <div
                  key={d.name}
                  className="p-3 rounded-lg bg-[#141415] border border-white/[0.08]"
                >
                  <div className="flex items-center gap-2 text-xs text-[#85858b]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.name}</span>
                  </div>
                  <p className="text-lg font-medium font-mono text-[#ededed] mt-1">{d.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <h2 className="text-base font-medium text-[#ededed]">Language utilization</h2>
            <p className="text-xs text-[#85858b] mt-0.5 mb-4">Submissions by runtime</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languageData}>
                <CartesianGrid stroke="rgba(237,237,237,0.06)" vertical={false} />
                <XAxis
                  dataKey="language"
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
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {languageData.map((entry) => (
                    <Cell
                      key={entry.language}
                      fill={entry.count === maxLangCount && maxLangCount > 0 ? '#e5a00d' : '#4a4a50'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
