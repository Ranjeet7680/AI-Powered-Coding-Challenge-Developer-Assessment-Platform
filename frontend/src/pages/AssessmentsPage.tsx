import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';
import { Assessment, AssessmentCompleteResponse, Challenge } from '../types';
import { useToast, useAuth } from '../context/useContexts';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import confetti from 'canvas-confetti';
import {
  Award,
  Plus,
  Clock,
  Users,
  ArrowRight,
  X,
  Play,
  CheckCircle2,
  ShieldCheck,
  Timer,
} from 'lucide-react';

export const AssessmentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingScore, setPassingScore] = useState(75);
  const [selectedChallengeIds, setSelectedChallengeIds] = useState<string[]>([]);

  // Active assessment session runner
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [sessionChallenges, setSessionChallenges] = useState<Challenge[]>([]);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [sessionCodeById, setSessionCodeById] = useState<Record<string, string>>({});
  const [sessionScores, setSessionScores] = useState<Record<string, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [completionResult, setCompletionResult] = useState<AssessmentCompleteResponse | null>(null);

  useEffect(() => {
    Promise.all([
      api.getAssessments().catch(() => []),
      api.getChallenges().catch(() => []),
    ]).then(([aList, cList]) => {
      setAssessments(aList);
      setChallenges(cList);
      if (cList.length >= 2) {
        setSelectedChallengeIds([cList[0].id, cList[1].id]);
      }
      setLoading(false);
    });
  }, []);

  // Countdown timer during active assessment
  useEffect(() => {
    if (!activeAssessment || completionResult) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeAssessment, completionResult]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const created = await api.createAssessment({
        title: title.trim(),
        description: description.trim(),
        duration_minutes: duration,
        passing_score: passingScore,
        challenge_ids: selectedChallengeIds,
        category: 'Custom Assessment',
      });
      setAssessments([created, ...assessments]);
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      showToast('Assessment created and published.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not create assessment.';
      showToast(msg, 'error');
    }
  };

  const handleStartAssessment = (assessment: Assessment) => {
    const matched = assessment.challenge_ids
      .map((id) => challenges.find((c) => c.id === id))
      .filter((c): c is Challenge => Boolean(c));
    const problems = matched.length > 0 ? matched : challenges.slice(0, 2);

    const initialCode: Record<string, string> = {};
    problems.forEach((p) => {
      initialCode[p.id] = p.starter_code?.python || '';
    });

    setSessionChallenges(problems);
    setSessionCodeById(initialCode);
    setSessionScores({});
    setActiveProblemIdx(0);
    setCompletionResult(null);
    setRemainingSeconds(assessment.duration_minutes * 60);
    setActiveAssessment(assessment);
  };

  const handleRunProblemTests = async () => {
    const currentProblem = sessionChallenges[activeProblemIdx];
    if (!currentProblem) return;
    setIsRunningTests(true);
    try {
      const res = await api.runCode({
        language: 'python',
        code: sessionCodeById[currentProblem.id] || '',
        test_cases: currentProblem.test_cases || [],
        challenge_id: currentProblem.id,
      });
      const pct = Math.round((res.passed_count / Math.max(1, res.total_count)) * 100);
      setSessionScores((prev) => ({
        ...prev,
        [currentProblem.id]: Math.max(prev[currentProblem.id] || 0, pct),
      }));
      if (res.status === 'Accepted') {
        showToast(`${currentProblem.title}: All ${res.total_count} tests passed (100%)!`, 'success');
      } else {
        showToast(`${currentProblem.title}: ${res.passed_count}/${res.total_count} passed (${pct}%)`, 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Test run failed.';
      showToast(msg, 'error');
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleFinishAssessment = async () => {
    if (!activeAssessment) return;
    setIsFinishing(true);
    try {
      const problemCount = Math.max(1, sessionChallenges.length);
      const totalPct = sessionChallenges.reduce((sum, p) => sum + (sessionScores[p.id] || 0), 0);
      const avgScore = Math.round(totalPct / problemCount);
      const solvedIds = sessionChallenges.filter((p) => (sessionScores[p.id] || 0) === 100).map((p) => p.id);
      const elapsed = Math.max(0, activeAssessment.duration_minutes * 60 - remainingSeconds);

      const res = await api.completeAssessment(activeAssessment.id, {
        score: avgScore,
        solved_challenge_ids: solvedIds,
        elapsed_seconds: elapsed,
      });
      setCompletionResult(res);
      setAssessments((prev) =>
        prev.map((a) => (a.id === activeAssessment.id ? { ...a, candidates_count: a.candidates_count + 1 } : a))
      );

      if (res.passed) {
        refreshUser().catch(() => {});
        showToast(`Passed with ${res.score}%! Certificate unlocked.`, 'success');
        try {
          confetti({ particleCount: 110, spread: 70, origin: { y: 0.6 } });
        } catch {
          // Decorative
        }
      } else {
        showToast(`Assessment completed with ${res.score}% (required ${activeAssessment.passing_score}%).`, 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not submit assessment.';
      showToast(msg, 'error');
    } finally {
      setIsFinishing(false);
    }
  };

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentProblem = sessionChallenges[activeProblemIdx];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Technical Assessments
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Standardized timed coding evaluations. Pass any screener to unlock a verified credential certificate.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create New Assessment
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-900/50 border border-slate-800 animate-pulse p-6" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((a) => (
            <div
              key={a.id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition duration-200 group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {a.is_active ? 'Active Screener' : 'Closed'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {a.duration_minutes} Mins
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                  {a.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-6">
                  {a.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>
                    Passing: <strong className="text-slate-200">{a.passing_score}%</strong>
                  </span>
                  <span>{a.challenge_ids?.length || 2} Problems</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {a.candidates_count}
                  </span>
                </div>

                <button
                  onClick={() => handleStartAssessment(a)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-indigo-600 transition flex items-center justify-center gap-2"
                >
                  Start Timed Assessment
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Assessment Session Runner Modal */}
      {activeAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-6xl h-[92dvh] sm:h-[90vh] bg-[#080B14] border border-indigo-500/35 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Session Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{activeAssessment.title}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Passing Score: {activeAssessment.passing_score}% • {sessionChallenges.length} Tasks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-amber-300">
                  <Timer className="w-3.5 h-3.5" />
                  <span>{formatCountdown(remainingSeconds)}</span>
                </div>
                {!completionResult && (
                  <button
                    onClick={handleFinishAssessment}
                    disabled={isFinishing}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    {isFinishing ? 'Grading...' : 'Finish & Submit Assessment'}
                  </button>
                )}
                <button
                  onClick={() => setActiveAssessment(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {completionResult ? (
              /* Completion Summary */
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div className="max-w-md space-y-5 p-8 rounded-3xl bg-slate-900/70 border border-slate-800">
                  <div
                    className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border ${
                      completionResult.passed
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {completionResult.passed ? <ShieldCheck className="w-8 h-8" /> : <Award className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white">
                      {completionResult.passed ? 'Assessment Passed!' : 'Assessment Completed'}
                    </h3>
                    <p className="text-sm text-slate-300 mt-1">
                      Final Score: <strong className="font-mono text-indigo-300">{completionResult.score}%</strong> (Threshold:{' '}
                      {activeAssessment.passing_score}%)
                    </p>
                  </div>

                  {completionResult.certificate && (
                    <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1">
                      <p className="font-bold text-indigo-300">Verified Certificate Awarded</p>
                      <p className="text-slate-300">{completionResult.certificate.title}</p>
                      <p className="font-mono text-[11px] text-emerald-400">
                        Credential ID: {completionResult.certificate.credential_id}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3 pt-2">
                    {completionResult.certificate && (
                      <button
                        onClick={() => {
                          setActiveAssessment(null);
                          navigate('/app/certificates');
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                      >
                        View Certificate
                      </button>
                    )}
                    <button
                      onClick={() => setActiveAssessment(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Problem Tabs + Split Editor */
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-5 py-2 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2 overflow-x-auto">
                  {sessionChallenges.map((p, idx) => {
                    const score = sessionScores[p.id];
                    return (
                      <button
                        key={p.id}
                        onClick={() => setActiveProblemIdx(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                          activeProblemIdx === idx
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <span>Task {idx + 1}: {p.title}</span>
                        {score !== undefined && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              score === 100 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {score}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {currentProblem && (
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
                    <div className="lg:col-span-5 p-5 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-800 custom-scrollbar space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-white">{currentProblem.title}</h4>
                        <span className="text-[11px] font-mono text-indigo-300">{currentProblem.difficulty}</span>
                      </div>
                      <MarkdownRenderer content={currentProblem.description} />
                      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
                        <p className="font-semibold text-white mb-1">Constraints</p>
                        <ul className="space-y-0.5 text-slate-400 font-mono text-[11px]">
                          {currentProblem.constraints.map((c, i) => (
                            <li key={i}>• {c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col min-h-[300px]">
                      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-400">Python 3.11 Sandbox</span>
                        <button
                          onClick={handleRunProblemTests}
                          disabled={isRunningTests}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                        >
                          {isRunningTests ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                          Verify Task Tests
                        </button>
                      </div>
                      <div className="flex-1">
                        <Editor
                          height="100%"
                          language="python"
                          theme="vs-dark"
                          value={sessionCodeById[currentProblem.id] || ''}
                          onChange={(val) =>
                            setSessionCodeById((prev) => ({
                              ...prev,
                              [currentProblem.id]: val || '',
                            }))
                          }
                          options={{
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', monospace",
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                          }}
                        />
                      </div>
                      <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">
                          Task Score:{' '}
                          <strong className="text-emerald-400">
                            {sessionScores[currentProblem.id] !== undefined
                              ? `${sessionScores[currentProblem.id]}%`
                              : 'Not verified yet'}
                          </strong>
                        </span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                          Run Verify Task Tests before finishing
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0A0D17] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Create New Assessment
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Fullstack Screener"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Candidate screening instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Passing Threshold (%)</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assigned Challenges</label>
                <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-slate-900 rounded-xl border border-slate-800 custom-scrollbar">
                  {challenges.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedChallengeIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedChallengeIds([...selectedChallengeIds, c.id]);
                          } else {
                            setSelectedChallengeIds(selectedChallengeIds.filter((id) => id !== c.id));
                          }
                        }}
                        className="rounded border-slate-700 text-indigo-600 bg-slate-950"
                      />
                      <span className="text-slate-300 font-medium truncate">{c.title}</span>
                      <span className="text-[10px] text-slate-500 ml-auto font-mono">{c.difficulty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
              >
                Create &amp; Publish Screener
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
