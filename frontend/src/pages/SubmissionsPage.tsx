import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Submission } from '../types';
import { useToast } from '../context/useContexts';
import {
  CheckCircle2,
  AlertCircle,
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
    showToast('Source code copied.', 'info');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed]">
            Submissions
          </h1>
          <p className="text-sm text-[#85858b] mt-1">
            Execution history, test metrics, and complexity audits
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full h-9 bg-[#19191b] border border-white/[0.08] rounded-lg pl-8 pr-3 text-xs text-[#ededed] placeholder-[#85858b] focus:outline-none focus:border-[#e5a00d]"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#19191b] border border-white/[0.08]">
            {['All', 'Accepted', 'Wrong Answer'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  statusFilter === st
                    ? 'bg-[#222225] text-[#ededed] font-medium'
                    : 'text-[#85858b] hover:text-[#ededed]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[#19191b] border border-white/[0.08] overflow-hidden">
        {/* Mobile Stack */}
        <div className="sm:hidden divide-y divide-white/[0.08]">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="p-4">
                <div className="h-12 bg-[#222225] rounded-lg animate-pulse" />
              </div>
            ))
          ) : filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((sub) => (
              <div key={`mob-${sub.id}`} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-[#ededed] leading-snug">
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
                    {sub.language} · {sub.runtime_ms}ms · {sub.memory_mb}MB
                  </span>
                  <span className="text-[#ededed]">{sub.score}%</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(sub)}
                  className="w-full h-8 rounded-lg text-xs font-medium text-[#ededed] bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] transition-colors"
                >
                  Inspect code
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#85858b]">
              No matching submissions found.
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#0f0f10] text-[#85858b] font-mono">
                <th className="py-3.5 px-6 font-normal">Challenge</th>
                <th className="py-3.5 px-4 font-normal">Language</th>
                <th className="py-3.5 px-4 font-normal">Status</th>
                <th className="py-3.5 px-4 font-normal">Runtime</th>
                <th className="py-3.5 px-4 font-normal">Memory</th>
                <th className="py-3.5 px-4 font-normal">Score</th>
                <th className="py-3.5 px-6 font-normal text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-5 px-6">
                      <div className="h-4 bg-[#222225] rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#222225]/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-[#ededed]">
                      {sub.challenge_title || 'Custom challenge'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#a1a1a6] capitalize">{sub.language}</td>
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          sub.status === 'Accepted' ? 'text-[#4cc38a]' : 'text-[#e5484d]'
                        }`}
                      >
                        {sub.status === 'Accepted' ? (
                          <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle strokeWidth={1.5} className="w-3.5 h-3.5" />
                        )}
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#a1a1a6]">{sub.runtime_ms} ms</td>
                    <td className="py-3.5 px-4 font-mono text-[#a1a1a6]">{sub.memory_mb} MB</td>
                    <td className="py-3.5 px-4 font-mono text-[#ededed]">{sub.score}%</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-3 h-7 rounded-md text-xs font-medium text-[#ededed] bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#85858b]">
                    No matching submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] bg-[#19191b] border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#0f0f10]">
              <div className="flex items-center gap-3">
                <FileCode strokeWidth={1.5} className="w-4 h-4 text-[#85858b]" />
                <div>
                  <h3 className="text-sm font-medium text-[#ededed]">
                    {selectedSubmission.challenge_title || 'Submission details'}
                  </h3>
                  <p className="text-xs text-[#85858b] font-mono tabular-nums">
                    <span className={selectedSubmission.status === 'Accepted' ? 'text-[#4cc38a]' : 'text-[#e5484d]'}>
                      {selectedSubmission.status}
                    </span>{' '}
                    · {selectedSubmission.runtime_ms} ms
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenInWorkspace(selectedSubmission)}
                  className="inline-flex items-center gap-1 px-3 h-8 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
                >
                  <span>Open in workspace</span>
                  <ArrowUpRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 rounded-lg text-[#85858b] hover:text-[#ededed] hover:bg-[#222225]"
                >
                  <X strokeWidth={1.5} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
              {selectedSubmission.ai_feedback && (
                <div className="p-4 rounded-xl bg-[#141415] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-[#ededed]">Review report</span>
                    <span className="font-mono text-xs text-[#4cc38a] tabular-nums">
                      Score {selectedSubmission.ai_feedback.overall_score || 94}/100
                    </span>
                  </div>
                  <p className="text-[#a1a1a6] leading-relaxed">{selectedSubmission.ai_feedback.summary}</p>
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="p-2.5 rounded-lg bg-[#19191b] border border-white/[0.08]">
                      <span className="text-[#85858b]">Time: </span>
                      <span className="text-[#ededed]">{selectedSubmission.ai_feedback.time_complexity}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#19191b] border border-white/[0.08]">
                      <span className="text-[#85858b]">Space: </span>
                      <span className="text-[#ededed]">{selectedSubmission.ai_feedback.space_complexity}</span>
                    </div>
                  </div>
                  {selectedSubmission.ai_feedback.highlights && (
                    <div>
                      <p className="font-medium text-[#ededed] mb-1">Notes</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-[#85858b]">
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
                  <span className="font-mono text-[#a1a1a6] text-xs">
                    Source code ({selectedSubmission.language})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(selectedSubmission.code)}
                    className="flex items-center gap-1.5 text-xs text-[#a1a1a6] hover:text-[#ededed]"
                  >
                    {copied ? <Check strokeWidth={1.5} className="w-3.5 h-3.5 text-[#4cc38a]" /> : <Copy strokeWidth={1.5} className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#0f0f10] border border-white/[0.08] font-mono text-xs text-[#ededed] overflow-x-auto leading-relaxed">
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
