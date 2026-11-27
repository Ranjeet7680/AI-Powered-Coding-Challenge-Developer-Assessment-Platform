import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor, { Monaco } from '@monaco-editor/react';
import { api } from '../services/api';
import { Challenge, ExecutionResult, Submission, VideoLesson } from '../types';
import { useAuth, useToast, usePreferences } from '../context/useContexts';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import confetti from 'canvas-confetti';
import {
  Play,
  Send,
  RotateCcw,
  Maximize2,
  Minimize2,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Timer,
  Pause,
  Lightbulb,
  Copy,
  Download,
  Check,
  Type,
  FileCode,
  Edit3,
  Video,
  ShieldCheck,
  ChevronDown,
  FlaskConical,
} from 'lucide-react';

type SupportedLang = 'python' | 'javascript' | 'typescript' | 'cpp';

function draftStorageKey(challengeId: string, lang: SupportedLang) {
  return `ctf_draft_${challengeId}_${lang}`;
}

export const WorkspacePage: React.FC = () => {
  const { challengeId = 'c2-lru-cache' } = useParams<{ challengeId: string }>();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { preferences, updatePreferences } = usePreferences();
  const navigate = useNavigate();
  const location = useLocation();

  const navState = location.state as { initialCode?: string; initialLanguage?: SupportedLang } | null;
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>(
    () => navState?.initialLanguage || 'python'
  );
  const [code, setCode] = useState<string>('');
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'hints' | 'assistant' | 'video'>('description');
  const [activeBottomTab, setActiveBottomTab] = useState<'tests' | 'custom' | 'console' | 'ai_review'>('tests');
  const [mobilePane, setMobilePane] = useState<'problem' | 'editor' | 'output'>('problem');
  const [customInput, setCustomInput] = useState<string>('');
  const [relatedVideo, setRelatedVideo] = useState<VideoLesson | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [submissionResult, setSubmissionResult] = useState<Submission | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Ask for complexity analysis, boundary edge cases, or debugging notes on your current buffer.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const selectedLangRef = useRef<SupportedLang>(selectedLanguage);
  useEffect(() => {
    selectedLangRef.current = selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    api.getChallenges().then(setAllChallenges).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    const stateObj = location.state as { initialCode?: string; initialLanguage?: SupportedLang } | null;
    const targetLang = stateObj?.initialLanguage || selectedLangRef.current;

    api.getChallenge(challengeId)
      .then((c) => {
        if (!active) return;
        setExecutionResult(null);
        setSubmissionResult(null);
        setChallenge(c);
        const savedDraft = localStorage.getItem(draftStorageKey(c.id, targetLang));
        const starter = stateObj?.initialCode || savedDraft || c.starter_code?.[targetLang] || c.starter_code?.python || '';
        setCode(starter);

        api.getVideos()
          .then((vList) => {
            if (!active) return;
            const match =
              vList.find((v) => v.related_challenge_id === c.id) ||
              vList.find((v) => v.category === c.category) ||
              vList[0];
            if (match) setRelatedVideo(match);
          })
          .catch(() => {});
      })
      .catch(async () => {
        const all = await api.getChallenges().catch(() => []);
        if (!active) return;
        if (all.length > 0) {
          const fallback = all[0];
          setExecutionResult(null);
          setSubmissionResult(null);
          setChallenge(fallback);
          setCode(fallback.starter_code?.[targetLang] || fallback.starter_code?.python || '');
        }
      });
    return () => {
      active = false;
    };
  }, [challengeId, location.state]);

  const handleCodeChange = (value: string | undefined) => {
    const nextCode = value || '';
    setCode(nextCode);
    if (challenge) {
      localStorage.setItem(draftStorageKey(challenge.id, selectedLanguage), nextCode);
    }
  };

  const handleLanguageChange = (lang: SupportedLang) => {
    setSelectedLanguage(lang);
    if (!challenge) return;
    const draft = localStorage.getItem(draftStorageKey(challenge.id, lang));
    if (draft !== null) {
      setCode(draft);
    } else if (challenge.starter_code?.[lang]) {
      setCode(challenge.starter_code[lang]);
    } else {
      setCode('');
    }
  };

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRunCode = useCallback(
    async (forceCustom = false) => {
      if (!challenge || isRunning || isSubmitting) return;
      setIsRunning(true);
      const useCustom = forceCustom || activeBottomTab === 'custom';
      setActiveBottomTab(useCustom && customInput.trim() ? 'console' : 'tests');

      try {
        const testCasesToRun =
          useCustom && customInput.trim()
            ? [{ input: customInput, expected_output: '', is_hidden: false }]
            : challenge.test_cases?.filter((tc) => !tc.is_hidden) || [];

        const res = await api.runCode({
          language: selectedLanguage,
          code,
          test_cases: testCasesToRun,
          custom_input: useCustom ? customInput : undefined,
          challenge_id: challenge.id,
        });
        setExecutionResult(res);
        if (res.status === 'Accepted') {
          showToast(`Passed ${res.passed_count}/${res.total_count} sample tests (${res.runtime_ms}ms).`, 'success');
        } else {
          showToast(`${res.status}: ${res.passed_count}/${res.total_count} passed.`, 'error');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Execution failed.';
        setExecutionResult({
          status: 'Runtime Error',
          stdout: '',
          stderr: msg,
          runtime_ms: 0,
          memory_mb: 0,
          passed_count: 0,
          total_count: 0,
          test_results: [],
        });
        showToast(msg, 'error');
      } finally {
        setIsRunning(false);
      }
    },
    [challenge, isRunning, isSubmitting, activeBottomTab, customInput, selectedLanguage, code, showToast]
  );

  const handleSubmit = useCallback(async () => {
    if (!challenge || isRunning || isSubmitting) return;
    setIsSubmitting(true);
    setActiveBottomTab('ai_review');

    try {
      const sub = await api.submitSolution({
        challenge_id: challenge.id,
        language: selectedLanguage,
        code,
      });
      setSubmissionResult(sub);
      setExecutionResult({
        status: sub.status,
        stdout: '',
        stderr: sub.test_results.find((t) => t.error)?.error || '',
        runtime_ms: sub.runtime_ms,
        memory_mb: sub.memory_mb,
        passed_count: sub.test_cases_passed,
        total_count: sub.total_test_cases,
        test_results: sub.test_results,
        ai_feedback: sub.ai_feedback,
      });

      if (sub.status === 'Accepted') {
        showToast('Solution accepted. Review generated.', 'success');
        refreshUser().catch(() => {});
        try {
          confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
        } catch {
          // Decorative
        }
      } else {
        showToast(`${sub.status}: ${sub.test_cases_passed}/${sub.total_test_cases} passed.`, 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed.';
      showToast(`Submission error: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [challenge, isRunning, isSubmitting, selectedLanguage, code, showToast, refreshUser]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmit();
        } else {
          handleRunCode(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleRunCode, handleSubmit]);

  const handleResetCode = () => {
    if (!challenge) return;
    const starter = challenge.starter_code?.[selectedLanguage] || '';
    setCode(starter);
    localStorage.removeItem(draftStorageKey(challenge.id, selectedLanguage));
    showToast('Reset to starter code.', 'info');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('Code copied.', 'info');
  };

  const handleDownloadCode = () => {
    const ext =
      selectedLanguage === 'python'
        ? 'py'
        : selectedLanguage === 'javascript'
        ? 'js'
        : selectedLanguage === 'typescript'
        ? 'ts'
        : 'cpp';
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${challenge?.slug || 'solution'}.${ext}`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  const sendCopilotPrompt = async (promptText: string) => {
    if (!promptText.trim() || chatLoading) return;
    const userMsg = promptText.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.askCopilot({
        message: userMsg,
        challenge_id: challenge?.id,
        challenge_title: challenge?.title,
        challenge_description: challenge?.description,
        language: selectedLanguage,
        code,
        last_error: executionResult?.stderr || undefined,
      });
      setChatMessages((prev) => [...prev, { sender: 'ai', text: res.reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Unable to reach assistant right now. Check backend connection.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendCopilotPrompt(chatInput);
  };

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('midnight-obsidian', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b6b73', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'e5a00d' },
        { token: 'string', foreground: '4cc38a' },
        { token: 'number', foreground: 'ededed' },
      ],
      colors: {
        'editor.background': '#141415',
        'editor.lineHighlightBackground': '#19191b',
        'editorLineNumber.foreground': '#6b6b73',
        'editorCursor.foreground': '#e5a00d',
      },
    });
  };

  return (
    <div
      className={`flex flex-col bg-[#141415] text-[#ededed] ${
        isFullscreen ? 'fixed inset-0 z-50 p-3 sm:p-4' : 'min-h-[calc(100vh-7rem)] lg:h-[calc(100vh-6.5rem)]'
      }`}
    >
      {/* Top Toolbar */}
      <div className="min-h-14 py-2 px-3 sm:px-4 bg-[#0f0f10] border border-white/[0.08] rounded-t-xl flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <select
              value={challenge?.id || challengeId}
              onChange={(e) => navigate(`/app/workspace/${e.target.value}`)}
              aria-label="Select coding challenge"
              className="appearance-none bg-[#19191b] border border-white/[0.1] rounded-lg pl-3 pr-8 h-8 text-xs sm:text-sm font-medium text-[#ededed] focus:outline-none focus:border-[#e5a00d] max-w-[200px] sm:max-w-xs truncate"
            >
              {allChallenges.length > 0 ? (
                allChallenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))
              ) : (
                <option value={challengeId}>{challenge?.title || 'Loading...'}</option>
              )}
            </select>
            <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {challenge && (
            <span
              className={`text-xs font-mono shrink-0 ${
                challenge.difficulty === 'Easy'
                  ? 'text-[#4cc38a]'
                  : challenge.difficulty === 'Medium'
                  ? 'text-[#e5a00d]'
                  : 'text-[#e5484d]'
              }`}
            >
              {challenge.difficulty}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-[#19191b] border border-white/[0.08] text-xs font-mono text-[#a1a1a6] tabular-nums">
            <button
              type="button"
              onClick={() => setTimerRunning((prev) => !prev)}
              className="text-[#a1a1a6] hover:text-[#ededed] transition-colors"
              title={timerRunning ? 'Pause timer' : 'Resume timer'}
            >
              {timerRunning ? <Timer strokeWidth={1.5} className="w-3.5 h-3.5" /> : <Pause strokeWidth={1.5} className="w-3.5 h-3.5 text-[#e5a00d]" />}
            </button>
            <span>{formatTimer(timerSeconds)}</span>
            <button
              type="button"
              onClick={() => setTimerSeconds(0)}
              className="text-[#85858b] hover:text-[#ededed] ml-0.5"
              title="Reset timer"
            >
              <RotateCcw strokeWidth={1.5} className="w-3 h-3" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-[#19191b] border border-white/[0.08] rounded-lg px-2 h-8 text-xs text-[#a1a1a6] font-mono tabular-nums">
            <Type strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b]" />
            <select
              value={preferences.fontSize}
              onChange={(e) => updatePreferences({ fontSize: Number(e.target.value) })}
              aria-label="Editor font size"
              className="bg-transparent text-[#ededed] focus:outline-none"
            >
              <option value={12} className="bg-[#19191b]">12px</option>
              <option value={13} className="bg-[#19191b]">13px</option>
              <option value={14} className="bg-[#19191b]">14px</option>
              <option value={16} className="bg-[#19191b]">16px</option>
            </select>
          </div>

          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLang)}
            aria-label="Programming language"
            className="bg-[#19191b] border border-white/[0.1] rounded-lg px-3 h-8 text-xs text-[#ededed] focus:outline-none focus:border-[#e5a00d] font-mono"
          >
            <option value="python">Python 3.11</option>
            <option value="javascript">JavaScript (Node)</option>
            <option value="typescript">TypeScript</option>
            <option value="cpp">C++ 20</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyCode}
            className="w-8 h-8 rounded-lg text-[#85858b] hover:text-[#ededed] hover:bg-[#19191b] flex items-center justify-center transition-colors"
            title="Copy code"
          >
            {copiedCode ? <Check strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a]" /> : <Copy strokeWidth={1.5} className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadCode}
            className="hidden sm:inline-flex w-8 h-8 rounded-lg text-[#85858b] hover:text-[#ededed] hover:bg-[#19191b] items-center justify-center transition-colors"
            title="Download file"
          >
            <Download strokeWidth={1.5} className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetCode}
            className="w-8 h-8 rounded-lg text-[#85858b] hover:text-[#ededed] hover:bg-[#19191b] flex items-center justify-center transition-colors"
            title="Reset code"
          >
            <RotateCcw strokeWidth={1.5} className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setMobilePane('output');
              handleRunCode(false);
            }}
            disabled={isRunning || isSubmitting}
            title="Run tests (Ctrl+Enter)"
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-[#ededed] bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <span className="w-3.5 h-3.5 border-2 border-[#ededed]/30 border-t-[#ededed] rounded-full animate-spin" />
            ) : (
              <Play strokeWidth={1.5} className="w-3.5 h-3.5 text-[#4cc38a] fill-current" />
            )}
            <span>Run</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobilePane('output');
              handleSubmit();
            }}
            disabled={isRunning || isSubmitting}
            title="Submit solution (Ctrl+Shift+Enter)"
            className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-3.5 h-3.5 border-2 border-[#141415]/30 border-t-[#141415] rounded-full animate-spin" />
            ) : (
              <Send strokeWidth={1.5} className="w-3.5 h-3.5" />
            )}
            <span>Submit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 rounded-lg text-[#85858b] hover:text-[#ededed] hover:bg-[#19191b] flex items-center justify-center transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 strokeWidth={1.5} className="w-4 h-4" /> : <Maximize2 strokeWidth={1.5} className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Pane Switcher */}
      <div className="lg:hidden grid grid-cols-3 gap-1 p-1 bg-[#0f0f10] border-x border-b border-white/[0.08] text-xs font-medium">
        {[
          { id: 'problem' as const, label: 'Problem' },
          { id: 'editor' as const, label: 'Editor' },
          { id: 'output' as const, label: 'Output' },
        ].map((pane) => (
          <button
            key={pane.id}
            type="button"
            onClick={() => setMobilePane(pane.id)}
            className={`py-2 rounded-lg transition-colors ${
              mobilePane === pane.id ? 'bg-[#222225] text-[#ededed]' : 'text-[#85858b] hover:text-[#ededed]'
            }`}
          >
            {pane.label}
          </button>
        ))}
      </div>

      {/* Split Panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 border-x border-b border-white/[0.08] rounded-b-xl overflow-hidden">
        {/* Left Panel */}
        <div
          className={`lg:col-span-5 xl:col-span-4 bg-[#19191b] border-b lg:border-b-0 lg:border-r border-white/[0.08] flex-col min-h-[54dvh] lg:min-h-0 ${
            mobilePane === 'problem' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex items-center border-b border-white/[0.08] px-2 bg-[#0f0f10] text-xs overflow-x-auto">
            {[
              { id: 'description', label: 'Problem', icon: null },
              { id: 'hints', label: `Hints (${challenge?.hints?.length || 0})`, icon: Lightbulb },
              { id: 'assistant', label: 'Copilot', icon: MessageSquare },
              { id: 'video', label: 'Video', icon: Video },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeLeftTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveLeftTab(tab.id as typeof activeLeftTab)}
                  className={`py-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'border-[#e5a00d] text-[#ededed]'
                      : 'border-transparent text-[#85858b] hover:text-[#ededed]'
                  }`}
                >
                  {Icon && <Icon strokeWidth={1.5} className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar text-xs">
            {activeLeftTab === 'description' && challenge && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h1 className="text-base font-medium text-[#ededed]">{challenge.title}</h1>
                    <span className="text-xs font-mono text-[#a1a1a6] tabular-nums">
                      {challenge.expected_complexity?.time || 'O(N)'}
                    </span>
                  </div>
                  <MarkdownRenderer content={challenge.description} />
                </div>

                {challenge.constraints && challenge.constraints.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-[#141415] border border-white/[0.08] space-y-1.5">
                    <h2 className="font-medium text-[#ededed]">Constraints</h2>
                    <ul className="space-y-1 text-[#a1a1a6] font-mono text-[11px]">
                      {challenge.constraints.map((c, i) => (
                        <li key={i}>· {c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {challenge.examples && challenge.examples.length > 0 && (
                  <div className="space-y-2.5">
                    <h2 className="font-medium text-[#ededed]">Examples</h2>
                    {challenge.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] font-mono text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#85858b]">Example #{i + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomInput(ex.input.replace(/\\n/g, '\n'));
                              setActiveBottomTab('custom');
                              setMobilePane('output');
                              showToast(`Loaded example #${i + 1} into custom input.`, 'info');
                            }}
                            className="text-[11px] text-[#a1a1a6] hover:text-[#ededed] font-sans font-medium flex items-center gap-1"
                          >
                            <FlaskConical strokeWidth={1.5} className="w-3 h-3" />
                            <span>Load input</span>
                          </button>
                        </div>
                        <p className="whitespace-pre-wrap break-all text-[#ededed]">
                          <span className="text-[#85858b]">Input:</span> {ex.input.replace(/\\n/g, '\n')}
                        </p>
                        <p className="whitespace-pre-wrap break-all text-[#4cc38a]">
                          <span className="text-[#85858b]">Output:</span> {ex.output.replace(/\\n/g, '\n')}
                        </p>
                        {ex.explanation && (
                          <p className="text-[#85858b] font-sans text-[11px] pt-1 border-t border-white/[0.08]">
                            {ex.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === 'hints' && (
              <div className="space-y-3">
                <h2 className="font-medium text-[#ededed] text-sm">Hints</h2>
                {challenge?.hints && challenge.hints.length > 0 ? (
                  challenge.hints.map((hint, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-[#141415] border border-white/[0.08] text-xs text-[#a1a1a6] leading-relaxed"
                    >
                      <span className="font-mono text-[#e5a00d] block mb-1">Hint {idx + 1}</span>
                      {hint}
                    </div>
                  ))
                ) : (
                  <p className="text-[#85858b]">No hints available for this challenge.</p>
                )}
              </div>
            )}

            {activeLeftTab === 'assistant' && (
              <div className="flex flex-col h-full justify-between space-y-3">
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-xs leading-relaxed border ${
                        msg.sender === 'user'
                          ? 'bg-[#222225] border-white/[0.12] text-[#ededed] ml-6'
                          : 'bg-[#141415] border-white/[0.08] text-[#a1a1a6] mr-4'
                      }`}
                    >
                      <span className="font-mono block mb-1 text-[11px] text-[#85858b]">
                        {msg.sender === 'user' ? user?.full_name || 'You' : 'Copilot'}
                      </span>
                      <MarkdownRenderer content={msg.text} />
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] text-[#85858b] text-xs mr-4">
                      Analyzing {selectedLanguage} code
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Analyze complexity',
                      'Find edge cases',
                      'Subtle hint',
                      'Debug error',
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendCopilotPrompt(prompt)}
                        disabled={chatLoading}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-[#141415] hover:bg-[#222225] text-[#a1a1a6] hover:text-[#ededed] border border-white/[0.08] transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSendChatMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask about complexity or bugs"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-xs text-[#ededed] placeholder-[#85858b] focus:outline-none focus:border-[#e5a00d]"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading}
                      className="px-3.5 h-9 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium disabled:opacity-50"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeLeftTab === 'video' && (
              <div className="space-y-4">
                {relatedVideo ? (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-[#e5a00d]">{relatedVideo.category}</span>
                        <span className="text-[#85858b] tabular-nums">· {relatedVideo.duration_minutes}m</span>
                      </div>
                      <h3 className="text-sm font-medium text-[#ededed] leading-snug">{relatedVideo.title}</h3>
                      <p className="text-xs text-[#85858b]">{relatedVideo.instructor}</p>
                    </div>

                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-white/[0.08] bg-black">
                      <iframe
                        src={`${relatedVideo.video_url}?rel=0`}
                        title={relatedVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>

                    {relatedVideo.chapters && relatedVideo.chapters.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="font-medium text-xs text-[#a1a1a6]">Chapters</h4>
                        <div className="space-y-1">
                          {relatedVideo.chapters.map((chap, i) => (
                            <div
                              key={i}
                              className="px-2.5 py-1.5 rounded-md bg-[#141415] border border-white/[0.08] flex items-center justify-between text-xs"
                            >
                              <span className="text-[#a1a1a6] truncate pr-2">{chap.title}</span>
                              <span className="font-mono text-[#85858b] tabular-nums shrink-0">{chap.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {relatedVideo.key_takeaways && (
                      <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] space-y-1.5">
                        <h4 className="font-medium text-[#ededed] text-xs">Key takeaways</h4>
                        <ul className="space-y-1 text-[#85858b] text-xs">
                          {relatedVideo.key_takeaways.map((point, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5 text-[#4cc38a] shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {relatedVideo.code_snippet && (
                      <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#ededed]">Reference snippet</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (relatedVideo.code_snippet) {
                                handleCodeChange(relatedVideo.code_snippet);
                                showToast('Loaded snippet into editor.', 'info');
                              }
                            }}
                            className="px-2.5 h-7 rounded-md bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <FileCode strokeWidth={1.5} className="w-3 h-3" />
                            <span>Apply</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-[#85858b]">
                          Load reference implementation into the editor buffer.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center rounded-lg bg-[#141415] border border-white/[0.08] space-y-3">
                    <Video strokeWidth={1.5} className="w-6 h-6 text-[#85858b] mx-auto" />
                    <h3 className="text-xs font-medium text-[#ededed]">Video walkthroughs</h3>
                    <button
                      type="button"
                      onClick={() => navigate('/app/videos')}
                      className="px-3 h-8 rounded-lg bg-[#ededed] text-[#141415] text-xs font-medium"
                    >
                      Browse library
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Monaco + Output */}
        <div
          className={`lg:col-span-7 xl:col-span-8 flex-col lg:min-h-0 bg-[#141415] ${
            mobilePane === 'problem' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div
            className={`h-[56dvh] lg:h-auto lg:flex-1 lg:min-h-[260px] relative ${
              mobilePane === 'editor' ? 'block' : 'hidden lg:block'
            }`}
          >
            <Editor
              height="100%"
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
              theme={preferences.editorTheme}
              beforeMount={handleEditorWillMount}
              value={code}
              onChange={handleCodeChange}
              options={{
                fontSize: preferences.fontSize,
                tabSize: preferences.tabSize,
                wordWrap: preferences.wordWrap,
                fontFamily: "'IBM Plex Mono', monospace",
                minimap: { enabled: preferences.minimap },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                padding: { top: 14 },
              }}
            />
          </div>

          <div
            className={`h-[56dvh] lg:h-64 border-t border-white/[0.08] bg-[#19191b] flex-col shrink-0 ${
              mobilePane === 'output' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] px-3 sm:px-4 bg-[#0f0f10] text-xs gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'tests', label: 'Unit tests', icon: null },
                  { id: 'custom', label: 'Custom input', icon: Edit3 },
                  { id: 'console', label: 'Console', icon: null },
                  { id: 'ai_review', label: 'Code review', icon: ShieldCheck },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeBottomTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveBottomTab(tab.id as typeof activeBottomTab)}
                      className={`py-2 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                        active
                          ? 'border-[#e5a00d] text-[#ededed]'
                          : 'border-transparent text-[#85858b] hover:text-[#ededed]'
                      }`}
                    >
                      {Icon && <Icon strokeWidth={1.5} className="w-3.5 h-3.5" />}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 font-mono text-xs py-1 tabular-nums">
                {executionResult && (
                  <>
                    <span className={executionResult.status === 'Accepted' ? 'text-[#4cc38a]' : 'text-[#e5484d]'}>
                      {executionResult.status} ({executionResult.passed_count}/{executionResult.total_count})
                    </span>
                    <span className="text-[#85858b]">·</span>
                    <span className="text-[#a1a1a6]">{executionResult.runtime_ms} ms</span>
                    <span className="hidden sm:inline text-[#a1a1a6]">{executionResult.memory_mb} MB</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-xs font-mono">
              {activeBottomTab === 'tests' && (
                <div className="space-y-2.5 tabular-nums">
                  {executionResult?.test_results && executionResult.test_results.length > 0 ? (
                    executionResult.test_results.map((tr, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border space-y-2 bg-[#141415] ${
                          tr.passed ? 'border-[#4cc38a]/35' : 'border-[#e5484d]/35'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {tr.passed ? (
                              <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a] shrink-0" />
                            ) : (
                              <AlertCircle strokeWidth={1.5} className="w-4 h-4 text-[#e5484d] shrink-0" />
                            )}
                            <span className={tr.passed ? 'text-[#4cc38a]' : 'text-[#e5484d]'}>
                              Case #{tr.test_case_index}: {tr.passed ? '[PASS]' : '[FAIL]'}
                            </span>
                          </div>
                          <span className="text-[#85858b]">{tr.runtime_ms} ms</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="p-2 rounded bg-[#19191b] border border-white/[0.08]">
                            <span className="text-[#85858b] block mb-0.5">Input</span>
                            <span className="text-[#ededed] break-all whitespace-pre-wrap">{tr.input || 'None'}</span>
                          </div>
                          <div className="p-2 rounded bg-[#19191b] border border-white/[0.08]">
                            <span className="text-[#85858b] block mb-0.5">Expected</span>
                            <span className="text-[#4cc38a] break-all whitespace-pre-wrap">{tr.expected_output || '—'}</span>
                          </div>
                          <div className="p-2 rounded bg-[#19191b] border border-white/[0.08]">
                            <span className="text-[#85858b] block mb-0.5">Actual</span>
                            <span className={`${tr.passed ? 'text-[#4cc38a]' : 'text-[#e5484d]'} break-all whitespace-pre-wrap`}>
                              {tr.actual_output || tr.error || 'No output'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[#85858b] flex items-center justify-between p-3 rounded-lg bg-[#141415] border border-white/[0.08] font-sans">
                      <span>
                        Press <strong className="font-medium text-[#ededed]">Run</strong> (Ctrl+Enter) for sample cases or{' '}
                        <strong className="font-medium text-[#ededed]">Submit</strong> (Ctrl+Shift+Enter) for full grading.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {activeBottomTab === 'custom' && (
                <div className="space-y-2.5 font-sans">
                  <p className="text-xs text-[#85858b]">
                    Enter standard input values to test custom edge cases
                  </p>
                  <textarea
                    rows={4}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="9&#10;2 7 11 15"
                    className="w-full bg-[#141415] border border-white/[0.1] rounded-lg p-3 text-xs text-[#ededed] font-mono focus:outline-none focus:border-[#e5a00d]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRunCode(true)}
                    disabled={isRunning}
                    className="px-4 h-8 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
                  >
                    Run custom input
                  </button>
                </div>
              )}

              {activeBottomTab === 'console' && (
                <div className="space-y-3 text-[#ededed] whitespace-pre-wrap">
                  {executionResult?.stdout && (
                    <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08]">
                      <p className="text-[#85858b] mb-1 text-[11px]">// STDOUT</p>
                      <p>{executionResult.stdout}</p>
                    </div>
                  )}
                  {executionResult?.stderr && (
                    <div className="p-3 rounded-lg bg-[#141415] border border-[#e5484d]/40">
                      <p className="text-[#e5484d] mb-1 text-[11px]">// STDERR</p>
                      <p className="text-[#e5484d]">{executionResult.stderr}</p>
                    </div>
                  )}
                  {!executionResult?.stdout && !executionResult?.stderr && (
                    <p className="text-[#85858b]">No console output yet.</p>
                  )}
                </div>
              )}

              {activeBottomTab === 'ai_review' && (
                <div className="space-y-3 font-sans">
                  {submissionResult?.ai_feedback ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-2">
                        <span className="text-sm font-medium text-[#ededed]">Code review report</span>
                        <div className="flex items-center gap-3 font-mono text-xs tabular-nums text-[#a1a1a6]">
                          <span>Cleanliness {submissionResult.ai_feedback.cleanliness_score ?? 90}</span>
                          <span>Efficiency {submissionResult.ai_feedback.efficiency_score ?? 90}</span>
                          <span className="text-[#4cc38a]">
                            Overall {submissionResult.ai_feedback.overall_score || 95}/100
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#a1a1a6] leading-relaxed">
                        {submissionResult.ai_feedback.summary}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 bg-[#141415] rounded-lg border border-white/[0.08]">
                          <span className="text-[#85858b]">Time: </span>
                          <span className="text-[#ededed]">{submissionResult.ai_feedback.time_complexity}</span>
                        </div>
                        <div className="p-2.5 bg-[#141415] rounded-lg border border-white/[0.08]">
                          <span className="text-[#85858b]">Space: </span>
                          <span className="text-[#ededed]">{submissionResult.ai_feedback.space_complexity}</span>
                        </div>
                      </div>
                      {submissionResult.ai_feedback.highlights && (
                        <div>
                          <p className="text-xs font-medium text-[#4cc38a] mb-1">Strengths</p>
                          <ul className="text-xs text-[#a1a1a6] space-y-1 list-disc pl-4">
                            {submissionResult.ai_feedback.highlights.map((h, idx) => (
                              <li key={idx}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {submissionResult.ai_feedback.suggestions && (
                        <div>
                          <p className="text-xs font-medium text-[#e5a00d] mb-1">Suggestions</p>
                          <ul className="text-xs text-[#85858b] space-y-1 list-disc pl-4">
                            {submissionResult.ai_feedback.suggestions.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {submissionResult.ai_feedback.security_assessment && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#141415] border border-white/[0.08] text-xs text-[#85858b]">
                          <ShieldCheck strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a] shrink-0" />
                          <span>{submissionResult.ai_feedback.security_assessment}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[#85858b]">
                      Submit your solution to generate complexity analysis and code review notes.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
