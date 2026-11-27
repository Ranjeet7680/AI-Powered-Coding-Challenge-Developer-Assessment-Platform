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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingScore, setPassingScore] = useState(75);
  const [selectedChallengeIds, setSelectedChallengeIds] = useState<string[]>([]);

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
      showToast('Assessment created.', 'success');
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
        showToast(`${currentProblem.title}: ${res.total_count}/${res.total_count} tests passed.`, 'success');
      } else {
        showToast(`${currentProblem.title}: ${res.passed_count}/${res.total_count} passed (${pct}%).`, 'error');
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
        showToast(`Passed with ${res.score}%. Certificate issued.`, 'success');
        try {
          confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
        } catch {
          // Decorative
        }
      } else {
        showToast(`Completed with ${res.score}% (required ${activeAssessment.passing_score}%).`, 'info');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed]">
            Technical assessments
          </h1>
          <p className="text-sm text-[#85858b] mt-1">
            Timed coding evaluations that issue verified SHA-256 certificates on passing scores
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors self-start sm:self-auto"
        >
          <Plus strokeWidth={1.5} className="w-3.5 h-3.5" />
          <span>New assessment</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-xl bg-[#19191b] border border-white/[0.08] animate-pulse p-6" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 tabular-nums">
          {assessments.map((a) => (
            <div
              key={a.id}
              className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08] hover:border-white/[0.14] flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className={a.is_active ? 'text-[#4cc38a]' : 'text-[#85858b]'}>
                    {a.is_active ? 'Active' : 'Closed'}
                  </span>
                  <span className="text-[#85858b] flex items-center gap-1.5">
                    <Clock strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>{a.duration_minutes}m</span>
                  </span>
                </div>

                <h2 className="text-base font-medium text-[#ededed] mb-2">{a.title}</h2>
                <p className="text-xs text-[#a1a1a6] leading-relaxed line-clamp-3 mb-6">
                  {a.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] space-y-3.5">
                <div className="flex items-center justify-between text-xs text-[#85858b] font-mono">
                  <span>Pass {a.passing_score}%</span>
                  <span>{a.challenge_ids?.length || 2} tasks</span>
                  <span className="flex items-center gap-1">
                    <Users strokeWidth={1.5} className="w-3.5 h-3.5" />
                    {a.candidates_count}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartAssessment(a)}
                  className="w-full h-9 px-4 rounded-lg text-xs font-medium text-[#ededed] bg-[#222225] hover:bg-[#ededed] hover:text-[#141415] border border-white/[0.08] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Start assessment</span>
                  <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assessment Runner */}
      {activeAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-6xl h-[92dvh] sm:h-[90vh] bg-[#141415] border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#0f0f10] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Award strokeWidth={1.5} className="w-4 h-4 text-[#e5a00d]" />
                <div>
                  <h3 className="text-sm font-medium text-[#ededed]">{activeAssessment.title}</h3>
                  <p className="text-xs text-[#85858b] font-mono tabular-nums">
                    Pass threshold {activeAssessment.passing_score}% · {sessionChallenges.length} tasks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[#19191b] border border-white/[0.08] font-mono text-xs text-[#e5a00d] tabular-nums">
                  <Timer strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>{formatCountdown(remainingSeconds)}</span>
                </div>
                {!completionResult && (
                  <button
                    type="button"
                    onClick={handleFinishAssessment}
                    disabled={isFinishing}
                    className="px-4 h-8 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
                  >
                    {isFinishing ? 'Grading' : 'Submit assessment'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveAssessment(null)}
                  className="p-1.5 rounded-lg text-[#85858b] hover:text-[#ededed] hover:bg-[#19191b]"
                  aria-label="Close assessment"
                >
                  <X strokeWidth={1.5} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {completionResult ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div className="max-w-md space-y-5 p-8 rounded-2xl bg-[#19191b] border border-white/[0.08]">
                  <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center bg-[#222225] border border-white/[0.08]">
                    {completionResult.passed ? (
                      <ShieldCheck strokeWidth={1.5} className="w-6 h-6 text-[#4cc38a]" />
                    ) : (
                      <Award strokeWidth={1.5} className="w-6 h-6 text-[#e5a00d]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-[#ededed]">
                      {completionResult.passed ? 'Assessment passed' : 'Assessment completed'}
                    </h3>
                    <p className="text-sm text-[#a1a1a6] mt-1 tabular-nums">
                      Score <span className="font-mono text-[#ededed]">{completionResult.score}%</span> · threshold{' '}
                      {activeAssessment.passing_score}%
                    </p>
                  </div>

                  {completionResult.certificate && (
                    <div className="p-4 rounded-xl bg-[#141415] border border-white/[0.08] text-xs space-y-1 text-left">
                      <p className="font-medium text-[#4cc38a]">Certificate issued</p>
                      <p className="text-[#ededed]">{completionResult.certificate.title}</p>
                      <p className="font-mono text-[#85858b]">
                        ID: {completionResult.certificate.credential_id}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2.5 pt-2">
                    {completionResult.certificate && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveAssessment(null);
                          navigate('/app/certificates');
                        }}
                        className="px-4 h-9 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium"
                      >
                        View certificate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveAssessment(null)}
                      className="px-4 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] border border-white/[0.08] text-xs font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-5 py-2 border-b border-white/[0.08] bg-[#19191b] flex items-center gap-2 overflow-x-auto">
                  {sessionChallenges.map((p, idx) => {
                    const score = sessionScores[p.id];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActiveProblemIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors whitespace-nowrap tabular-nums ${
                          activeProblemIdx === idx
                            ? 'bg-[#222225] text-[#ededed] border border-white/[0.12]'
                            : 'text-[#85858b] hover:text-[#ededed] border border-transparent'
                        }`}
                      >
                        <span>
                          Task {idx + 1}: {p.title}
                        </span>
                        {score !== undefined && (
                          <span className={`font-mono ${score === 100 ? 'text-[#4cc38a]' : 'text-[#e5a00d]'}`}>
                            {score}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {currentProblem && (
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
                    <div className="lg:col-span-5 p-5 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/[0.08] custom-scrollbar space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-medium text-[#ededed]">{currentProblem.title}</h4>
                        <span className="text-xs font-mono text-[#a1a1a6]">{currentProblem.difficulty}</span>
                      </div>
                      <MarkdownRenderer content={currentProblem.description} />
                      <div className="p-3.5 rounded-lg bg-[#19191b] border border-white/[0.08] text-xs">
                        <p className="font-medium text-[#ededed] mb-1.5">Constraints</p>
                        <ul className="space-y-1 text-[#85858b] font-mono text-[11px]">
                          {currentProblem.constraints.map((c, i) => (
                            <li key={i}>· {c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col min-h-[300px]">
                      <div className="px-4 py-2 bg-[#0f0f10] border-b border-white/[0.08] flex items-center justify-between text-xs">
                        <span className="font-mono text-[#85858b]">Python 3.11</span>
                        <button
                          type="button"
                          onClick={handleRunProblemTests}
                          disabled={isRunningTests}
                          className="inline-flex items-center gap-1.5 px-3 h-7 rounded-md bg-[#ededed] hover:bg-white text-[#141415] font-medium"
                        >
                          {isRunningTests ? (
                            <span className="w-3 h-3 border-2 border-[#141415]/30 border-t-[#141415] rounded-full animate-spin" />
                          ) : (
                            <Play strokeWidth={1.5} className="w-3 h-3 fill-current" />
                          )}
                          <span>Verify tests</span>
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
                            fontFamily: "'IBM Plex Mono', monospace",
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                          }}
                        />
                      </div>
                      <div className="px-4 py-2.5 border-t border-white/[0.08] bg-[#0f0f10] flex items-center justify-between text-xs font-mono tabular-nums">
                        <span className="text-[#85858b]">
                          Task score:{' '}
                          <span className="text-[#4cc38a]">
                            {sessionScores[currentProblem.id] !== undefined
                              ? `${sessionScores[currentProblem.id]}%`
                              : 'Pending'}
                          </span>
                        </span>
                        <span className="text-[#85858b] flex items-center gap-1.5">
                          <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                          <span>Verify tests before submitting</span>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#19191b] border border-white/[0.12] rounded-2xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-medium text-[#ededed] flex items-center gap-2">
                <Award strokeWidth={1.5} className="w-4 h-4 text-[#85858b]" />
                <span>Create assessment</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-[#85858b] hover:text-[#ededed]"
                aria-label="Close"
              >
                <X strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#a1a1a6] mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Senior Backend Screener"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-sm text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#a1a1a6] mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Candidate instructions"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#141415] border border-white/[0.1] rounded-lg p-3 text-xs text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#a1a1a6] mb-1.5">Duration (minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-[#ededed] font-mono tabular-nums focus:outline-none focus:border-[#e5a00d]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#a1a1a6] mb-1.5">Passing score (%)</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-[#ededed] font-mono tabular-nums focus:outline-none focus:border-[#e5a00d]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#a1a1a6] mb-1.5">Assigned challenges</label>
                <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-[#141415] rounded-lg border border-white/[0.08] custom-scrollbar">
                  {challenges.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 p-1.5 hover:bg-[#222225] rounded cursor-pointer">
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
                        className="rounded border-white/20 bg-[#19191b] accent-[#e5a00d]"
                      />
                      <span className="text-[#ededed] truncate">{c.title}</span>
                      <span className="text-[11px] text-[#85858b] ml-auto font-mono">{c.difficulty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-9 rounded-lg font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
              >
                Create assessment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
