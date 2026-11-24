import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Submission } from '../types';
import {
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Code2,
  Sparkles,
  X,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';

export const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSubmissions()
      .then(setSubmissions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Submissions
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review your execution history, test vector performance, and AI code review audits.
        </p>
      </div>

      {/* Submissions Table Card */}
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
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6 font-semibold text-white">
                      {sub.challenge_title || 'Custom Challenge'}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400 capitalize">
                      {sub.language}
                    </td>
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
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {sub.runtime_ms} ms
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {sub.memory_mb} MB
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-200">
                      {sub.score}%
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition"
                      >
                        Inspect Code & AI Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No submissions recorded yet. Open a challenge from the library to test your code!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code & Review Inspection Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[85vh] bg-[#0A0D17] border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedSubmission.challenge_title || 'Submission Details'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Status: <strong className={selectedSubmission.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}>{selectedSubmission.status}</strong> | Runtime: {selectedSubmission.runtime_ms}ms
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
              {/* AI Feedback Banner */}
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
                  <p className="text-slate-300 leading-relaxed">
                    {selectedSubmission.ai_feedback.summary}
                  </p>
                  <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      Time Complexity: <strong className="text-indigo-400">{selectedSubmission.ai_feedback.time_complexity}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      Space Complexity: <strong className="text-cyan-400">{selectedSubmission.ai_feedback.space_complexity}</strong>
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

              {/* Source Code Viewer */}
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
