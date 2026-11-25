import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Submission } from '../types';
import { useToast } from '../context/useContexts';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  FileCode,
  Copy,
  Check,
  Search,
  ArrowUpRight,
} from 'lucide-react';

export const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    api.getSubmissions()
      .then(setSubmissions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredSubmissions = useMemo(
    () =>
      submissions.filter((sub) => {
        const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;
        const matchesSearch =
          !search.trim() ||
          (sub.challenge_title || '').toLowerCase().includes(search.toLowerCase()) ||
          sub.language.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [submissions, statusFilter, search]
  );

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Submission source code copied.', 'info');
  };

  const handleOpenInWorkspace = (sub: Submission) => {
    setSelectedSubmission(null);
    navigate(`/app/workspace/${sub.challenge_id}`, {
      state: {
        initialCode: sub.code,
        initialLanguage: sub.language,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Submissions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review execution history, test vector performance, and AI code review audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter challenge or language..."
              className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          {['All', 'Accepted', 'Wrong Answer'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
                <th className="py-4 px-6 font-semibold">Challenge</th>
                <th className="py-4 px-4 font-semibold">Language</th>
                <th className="py-4 px-4 font-semibold">Status</th>
                <th className="py-4 px-4 font-semibold">Runtime</th>
                <th className="py-4 px-4 font-semibold">Memory</th>
                <th className="py-4 px-4 font-semibold">Score</th>
                <th className="py-4 px-6 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-5 px-6">
                      <div className="h-4 bg-slate-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6 font-semibold text-white">
                      {sub.challenge_title || 'Custom Challenge'}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400 capitalize">{sub.language}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold ${
                          sub.status === 'Accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {sub.status === 'Accepted' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">{sub.runtime_ms} ms</td>
                    <td className="py-4 px-4 font-mono text-slate-300">{sub.memory_mb} MB</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-200">{sub.score}%</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition"
                      >
                        Inspect Code &amp; Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No matching submissions found. Open a challenge from the library to test your code!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] bg-[#0A0D17] border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedSubmission.challenge_title || 'Submission Details'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Status:{' '}
                    <strong className={selectedSubmission.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}>
                      {selectedSubmission.status}
                    </strong>{' '}
                    | Runtime: {selectedSubmission.runtime_ms}ms
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenInWorkspace(selectedSubmission)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                >
                  Open in Workspace
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
              {selectedSubmission.ai_feedback && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Gemini AI Evaluation Report
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      Score: {selectedSubmission.ai_feedback.overall_score || 94}/100
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{selectedSubmission.ai_feedback.summary}</p>
                  <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      Time Complexity:{' '}
                      <strong className="text-indigo-400">{selectedSubmission.ai_feedback.time_complexity}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      Space Complexity:{' '}
                      <strong className="text-cyan-400">{selectedSubmission.ai_feedback.space_complexity}</strong>
                    </div>
                  </div>
                  {selectedSubmission.ai_feedback.highlights && (
                    <div>
                      <p className="font-semibold text-white mb-1">Highlights:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                        {selectedSubmission.ai_feedback.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Source Code ({selectedSubmission.language})
                  </span>
                  <button
                    onClick={() => handleCopyCode(selectedSubmission.code)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                  {selectedSubmission.code}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
