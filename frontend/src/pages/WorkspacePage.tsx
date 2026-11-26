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
  Sparkles,
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
      text: 'Hello! I am your code-aware AI Coding Copilot. Ask me to analyze your complexity, find edge cases, or debug an error.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const selectedLangRef = useRef<SupportedLang>(selectedLanguage);
  useEffect(() => {
    selectedLangRef.current = selectedLanguage;
  }, [selectedLanguage]);

  // Load challenge list once for switcher
  useEffect(() => {
    api.getChallenges().then(setAllChallenges).catch(() => {});
  }, []);

  // Load current challenge & restore draft or state code
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

  // Persist code draft locally on edit
  const handleCodeChange = (value: string | undefined) => {
    const nextCode = value || '';
    setCode(nextCode);
    if (challenge) {
      localStorage.setItem(draftStorageKey(challenge.id, selectedLanguage), nextCode);
    }
  };

  // Switch language cleanly while preserving per-language drafts
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

  // Timer tick
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
          showToast(`Passed ${res.passed_count}/${res.total_count} sample test cases (${res.runtime_ms}ms)`, 'success');
        } else {
          showToast(`${res.status}: ${res.passed_count}/${res.total_count} passed`, 'error');
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
        showToast('Solution Accepted! +Points awarded and AI Code Review generated.', 'success');
        refreshUser().catch(() => {});
        try {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        } catch {
          // Decorative confetti
        }
      } else {
        showToast(`Submission status: ${sub.status} (${sub.test_cases_passed}/${sub.total_test_cases})`, 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed.';
      showToast(`Submission error: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [challenge, isRunning, isSubmitting, selectedLanguage, code, showToast, refreshUser]);

  // Keyboard shortcuts: Ctrl+Enter (Run) and Ctrl+Shift+Enter (Submit)
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
    showToast('Editor reset to starter template.', 'info');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('Code copied to clipboard.', 'info');
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
        { sender: 'ai', text: 'Unable to reach AI Copilot right now. Check your backend connection.' },
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
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818cf8' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'f59e0b' },
      ],
      colors: {
        'editor.background': '#090D18',
        'editor.lineHighlightBackground': '#11182C',
        'editorLineNumber.foreground': '#475569',
        'editorCursor.foreground': '#22d3ee',
      },
    });
  };

  return (
    <div
      className={`flex flex-col bg-[#05070E] text-slate-100 ${
        isFullscreen ? 'fixed inset-0 z-50 p-3 sm:p-4' : 'min-h-[calc(100vh-7rem)] lg:h-[calc(100vh-6.5rem)]'
      }`}
    >
      {/* Top Action & Language Toolbar */}
      <div className="min-h-14 py-2 px-3 sm:px-4 bg-[#090D18] border border-slate-800 rounded-t-2xl flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Left: Challenge Switcher & Difficulty */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <select
              value={challenge?.id || challengeId}
              onChange={(e) => navigate(`/app/workspace/${e.target.value}`)}
              aria-label="Select coding challenge"
              className="appearance-none bg-slate-900 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl pl-3 pr-8 py-1.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-indigo-500 max-w-[200px] sm:max-w-xs truncate"
            >
              {allChallenges.length > 0 ? (
                allChallenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))
              ) : (
                <option value={challengeId}>{challenge?.title || 'Loading Challenge...'}</option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {challenge && (
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold shrink-0 ${
                challenge.difficulty === 'Easy'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : challenge.difficulty === 'Medium'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {challenge.difficulty}
            </span>
          )}
        </div>

        {/* Center: Timer, Font size, Language */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <button
              onClick={() => setTimerRunning((prev) => !prev)}
              className="text-indigo-400 hover:text-indigo-300 transition"
              title={timerRunning ? 'Pause timer' : 'Resume timer'}
            >
              {timerRunning ? <Timer className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            </button>
            <span>{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setTimerSeconds(0)}
              className="text-slate-500 hover:text-slate-300 ml-0.5"
              title="Reset timer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-400 font-mono">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={preferences.fontSize}
              onChange={(e) => updatePreferences({ fontSize: Number(e.target.value) })}
              aria-label="Editor font size"
              className="bg-transparent text-white focus:outline-none"
            >
              <option value={12} className="bg-slate-900">12px</option>
              <option value={13} className="bg-slate-900">13px</option>
              <option value={14} className="bg-slate-900">14px</option>
              <option value={16} className="bg-slate-900">16px</option>
            </select>
          </div>

          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLang)}
            aria-label="Programming language"
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="python">Python 3.11</option>
            <option value="javascript">JavaScript (Node)</option>
            <option value="typescript">TypeScript</option>
            <option value="cpp">C++ 20</option>
          </select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Copy code"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownloadCode}
            className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Download code file"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetCode}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset to starter code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setMobilePane('output');
              handleRunCode(false);
            }}
            disabled={isRunning || isSubmitting}
            title="Run Code (Ctrl+Enter)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
            )}
            <span>Run</span>
          </button>

          <button
            onClick={() => {
              setMobilePane('output');
              handleSubmit();
            }}
            disabled={isRunning || isSubmitting}
            title="Submit Solution (Ctrl+Shift+Enter)"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Workspace'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile IDE Pane Switcher (< lg) so mobile coders never fight nested vertical scrolls */}
      <div className="lg:hidden grid grid-cols-3 gap-1 p-1 bg-[#080B14] border-x border-b border-slate-800 text-xs font-bold">
        {[
          { id: 'problem' as const, label: 'Problem & AI' },
          { id: 'editor' as const, label: 'Code Editor' },
          { id: 'output' as const, label: 'Tests & Output' },
        ].map((pane) => (
          <button
            key={pane.id}
            type="button"
            onClick={() => setMobilePane(pane.id)}
            className={`py-2 rounded-xl transition ${
              mobilePane === pane.id
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {pane.label}
          </button>
        ))}
      </div>

      {/* Main Workspace Split Panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 border-x border-b border-slate-800 rounded-b-2xl overflow-hidden">
        {/* Left Panel */}
        <div
          className={`lg:col-span-5 xl:col-span-4 bg-[#080B14] border-b lg:border-b-0 lg:border-r border-slate-800 flex-col min-h-[54dvh] lg:min-h-0 ${
            mobilePane === 'problem' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex items-center border-b border-slate-800 px-2 bg-slate-950/70 text-xs overflow-x-auto">
            {[
              { id: 'description', label: 'Problem', icon: null },
              { id: 'hints', label: `Hints (${challenge?.hints?.length || 0})`, icon: Lightbulb, iconColor: 'text-amber-400' },
              { id: 'assistant', label: 'AI Copilot', icon: Sparkles, iconColor: 'text-cyan-400' },
              { id: 'video', label: 'Video', icon: Video, iconColor: 'text-purple-400' },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeLeftTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveLeftTab(tab.id as typeof activeLeftTab)}
                  className={`py-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? tab.id === 'video'
                        ? 'border-purple-500 text-purple-300'
                        : 'border-indigo-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${tab.iconColor}`} />}
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
                    <h3 className="text-base font-bold text-white">{challenge.title}</h3>
                    <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {challenge.expected_complexity?.time || 'O(N)'}
                    </span>
                  </div>
                  <MarkdownRenderer content={challenge.description} />
                </div>

                {/* Constraints */}
                {challenge.constraints && challenge.constraints.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <h4 className="font-semibold text-white">Constraints</h4>
                    <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                      {challenge.constraints.map((c, i) => (
                        <li key={i}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Examples with Quick Test Load */}
                {challenge.examples && challenge.examples.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="font-semibold text-white">Examples</h4>
                    {challenge.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 font-mono text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 uppercase">Example #{i + 1}</span>
                          <button
                            onClick={() => {
                              setCustomInput(ex.input.replace(/\\n/g, '\n'));
                              setActiveBottomTab('custom');
                              setMobilePane('output');
                              showToast(`Loaded Example #${i + 1} into Custom Input`, 'info');
                            }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-sans font-semibold flex items-center gap-1"
                          >
                            <FlaskConical className="w-3 h-3" />
                            Load Input
                          </button>
                        </div>
                        <p className="whitespace-pre-wrap break-all">
                          <span className="text-indigo-400">Input:</span> {ex.input.replace(/\\n/g, '\n')}
                        </p>
                        <p className="whitespace-pre-wrap break-all">
                          <span className="text-emerald-400">Output:</span> {ex.output.replace(/\\n/g, '\n')}
                        </p>
                        {ex.explanation && (
                          <p className="text-slate-400 font-sans text-[11px] pt-1 border-t border-slate-800/60">
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
                <h4 className="font-bold text-white text-sm">Algorithmic Hints</h4>
                {challenge?.hints && challenge.hints.length > 0 ? (
                  challenge.hints.map((hint, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed"
                    >
                      <span className="font-semibold text-indigo-400 block mb-1">Hint #{idx + 1}</span>
                      {hint}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No hints available for this challenge.</p>
                )}
              </div>
            )}

            {activeLeftTab === 'assistant' && (
              <div className="flex flex-col h-full justify-between space-y-3">
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600/25 border border-indigo-500/30 text-white ml-6'
                          : 'bg-slate-900/80 border border-slate-800 text-slate-300 mr-4'
                      }`}
                    >
                      <span className="font-bold block mb-1 text-[10px] text-slate-400 uppercase font-mono">
                        {msg.sender === 'user' ? user?.full_name || 'You' : 'Gemini Copilot'}
                      </span>
                      <MarkdownRenderer content={msg.text} />
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-400 text-xs mr-4">
                      Analyzing your {selectedLanguage} code...
                    </div>
                  )}
                </div>

                {/* Quick Copilot Chips */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Analyze my time complexity',
                      'Find edge cases',
                      'Give me a subtle hint',
                      'Debug my error',
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendCopilotPrompt(prompt)}
                        disabled={chatLoading}
                        className="text-[10px] px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSendChatMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask AI Copilot about your code..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50"
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
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                          {relatedVideo.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {relatedVideo.duration_minutes} min walkthrough
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{relatedVideo.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        Instructor: <span className="text-slate-200 font-medium">{relatedVideo.instructor}</span>
                      </p>
                    </div>

                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-purple-500/30 bg-black shadow-lg">
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
                        <h5 className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                          Video Chapters
                        </h5>
                        <div className="space-y-1">
                          {relatedVideo.chapters.map((chap, i) => (
                            <div
                              key={i}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                            >
                              <span className="text-slate-300 text-[11px] truncate pr-2">{chap.title}</span>
                              <span className="font-mono text-purple-400 text-[11px] shrink-0">{chap.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {relatedVideo.key_takeaways && (
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                        <h5 className="font-semibold text-white text-[11px]">Key Concepts & Architecture</h5>
                        <ul className="space-y-1 text-slate-400 text-[11px]">
                          {relatedVideo.key_takeaways.map((point, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {relatedVideo.code_snippet && (
                      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-purple-300">Reference Snippet</span>
                          <button
                            onClick={() => {
                              if (relatedVideo.code_snippet) {
                                handleCodeChange(relatedVideo.code_snippet);
                                showToast('Loaded reference snippet into editor.', 'info');
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center gap-1 transition shadow"
                          >
                            <FileCode className="w-3 h-3" />
                            <span>Apply to Editor</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Click &ldquo;Apply to Editor&rdquo; to load this reference snippet into Monaco.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <Video className="w-8 h-8 text-purple-400 mx-auto" />
                    <h4 className="text-xs font-bold text-white">Explore Video Masterclasses</h4>
                    <button
                      onClick={() => navigate('/app/videos')}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                    >
                      Browse Masterclasses
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Monaco Editor + Test Execution */}
        <div
          className={`lg:col-span-7 xl:col-span-8 flex-col lg:min-h-0 bg-[#090D18] ${
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
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: preferences.minimap },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                padding: { top: 14 },
              }}
            />
          </div>

          {/* Bottom Execution Panel */}
          <div
            className={`h-[56dvh] lg:h-64 border-t border-slate-800 bg-[#080B14] flex-col shrink-0 ${
              mobilePane === 'output' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 px-3 sm:px-4 bg-slate-950/80 text-xs gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'tests', label: 'Unit Tests', icon: null },
                  { id: 'custom', label: 'Custom Input', icon: Edit3, iconColor: 'text-cyan-400' },
                  { id: 'console', label: 'Console', icon: null },
                  { id: 'ai_review', label: 'AI Review', icon: Sparkles, iconColor: 'text-cyan-400' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeBottomTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveBottomTab(tab.id as typeof activeBottomTab)}
                      className={`py-2 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                        active
                          ? 'border-indigo-500 text-white'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {Icon && <Icon className={`w-3.5 h-3.5 ${tab.iconColor}`} />}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] py-1">
                {executionResult && (
                  <>
                    <span className={`font-bold ${executionResult.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {executionResult.status} ({executionResult.passed_count}/{executionResult.total_count})
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">{executionResult.runtime_ms}ms</span>
                    <span className="hidden sm:inline text-slate-400">{executionResult.memory_mb}MB</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-xs font-mono">
              {activeBottomTab === 'tests' && (
                <div className="space-y-2.5">
                  {executionResult?.test_results && executionResult.test_results.length > 0 ? (
                    executionResult.test_results.map((tr, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border space-y-2 ${
                          tr.passed
                            ? 'bg-emerald-950/15 border-emerald-500/30 text-emerald-200'
                            : 'bg-rose-950/15 border-rose-500/30 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-semibold">
                            {tr.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <span>
                              Case #{tr.test_case_index}: {tr.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">{tr.runtime_ms}ms</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                            <span className="text-slate-500 block mb-0.5">Input</span>
                            <span className="text-slate-300 break-all whitespace-pre-wrap">{tr.input || 'None'}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                            <span className="text-slate-500 block mb-0.5">Expected</span>
                            <span className="text-emerald-300 break-all whitespace-pre-wrap">{tr.expected_output || '—'}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                            <span className="text-slate-500 block mb-0.5">Actual</span>
                            <span className={`${tr.passed ? 'text-emerald-300' : 'text-rose-300'} break-all whitespace-pre-wrap`}>
                              {tr.actual_output || tr.error || 'No Output'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 font-sans">
                      <span>
                        Press <strong className="text-slate-300">Run</strong> (Ctrl+Enter) to execute sample tests or{' '}
                        <strong className="text-indigo-300">Submit</strong> (Ctrl+Shift+Enter) to run the full hidden suite.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {activeBottomTab === 'custom' && (
                <div className="space-y-2.5 font-sans">
                  <p className="text-xs text-slate-400">
                    Enter custom standard input values to test edge cases directly:
                  </p>
                  <textarea
                    rows={4}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. 9&#10;2 7 11 15"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleRunCode(true)}
                    disabled={isRunning}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition"
                  >
                    Run Custom Input
                  </button>
                </div>
              )}

              {activeBottomTab === 'console' && (
                <div className="space-y-3 text-slate-300 whitespace-pre-wrap">
                  {executionResult?.stdout && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <p className="text-slate-500 font-semibold mb-1 text-[10px]">// STDOUT</p>
                      <p className="text-slate-200">{executionResult.stdout}</p>
                    </div>
                  )}
                  {executionResult?.stderr && (
                    <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                      <p className="text-rose-400 font-semibold mb-1 text-[10px]">// STDERR</p>
                      <p className="text-rose-300">{executionResult.stderr}</p>
                    </div>
                  )}
                  {!executionResult?.stdout && !executionResult?.stderr && (
                    <p className="text-slate-500">No console output recorded yet.</p>
                  )}
                </div>
              )}

              {activeBottomTab === 'ai_review' && (
                <div className="space-y-3 font-sans">
                  {submissionResult?.ai_feedback ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <span className="text-sm font-bold text-white">Automated AI Code Review</span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            Cleanliness: {submissionResult.ai_feedback.cleanliness_score ?? 90}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            Efficiency: {submissionResult.ai_feedback.efficiency_score ?? 90}
                          </span>
                          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Overall: {submissionResult.ai_feedback.overall_score || 95}/100
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {submissionResult.ai_feedback.summary}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                          Time Complexity: <strong className="text-indigo-400">{submissionResult.ai_feedback.time_complexity}</strong>
                        </div>
                        <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                          Space Complexity: <strong className="text-cyan-400">{submissionResult.ai_feedback.space_complexity}</strong>
                        </div>
                      </div>
                      {submissionResult.ai_feedback.highlights && (
                        <div>
                          <p className="text-xs font-semibold text-emerald-300 mb-1">Strengths:</p>
                          <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                            {submissionResult.ai_feedback.highlights.map((h, idx) => (
                              <li key={idx}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {submissionResult.ai_feedback.suggestions && (
                        <div>
                          <p className="text-xs font-semibold text-amber-300 mb-1">Refactoring & Edge-Case Suggestions:</p>
                          <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                            {submissionResult.ai_feedback.suggestions.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {submissionResult.ai_feedback.security_assessment && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{submissionResult.ai_feedback.security_assessment}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500">
                      Submit your solution to trigger an automated AI Code Review with Big-O complexity breakdown and security audit.
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
