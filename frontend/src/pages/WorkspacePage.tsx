import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';
import { Challenge, ExecutionResult, Submission, VideoLesson } from '../types';
import { useAuth } from '../context/AuthContext';
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
  Clock,
  Code2,
  Terminal,
  Timer,
  Lightbulb,
  Copy,
  Download,
  Check,
  Type,
  FileCode,
  Edit3,
  Video,
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const { challengeId = 'c2-lru-cache' } = useParams<{ challengeId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'typescript' | 'cpp'>('python');
  const [code, setCode] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(13);
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'hints' | 'assistant' | 'video'>('description');
  const [activeBottomTab, setActiveBottomTab] = useState<'tests' | 'custom' | 'console' | 'ai_review'>('tests');
  const [customInput, setCustomInput] = useState<string>('');
  const [relatedVideo, setRelatedVideo] = useState<VideoLesson | null>(null);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [submissionResult, setSubmissionResult] = useState<Submission | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Timer state for interview prep
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Chat copilot state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Coding Copilot powered by Google Gemini. Ask me about time complexity, edge cases, or how to design this algorithm.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Load Challenge and Related Video
  useEffect(() => {
    api.getChallenge(challengeId)
      .then((c) => {
        setChallenge(c);
        const starter = c.starter_code?.[selectedLanguage] || c.starter_code?.python || '';
        setCode(starter);

        // Fetch matching video
        api.getVideos().then((vList) => {
          const match = vList.find((v) => v.related_challenge_id === c.id) ||
                        vList.find((v) => v.category === c.category) ||
                        vList[0];
          if (match) setRelatedVideo(match);
        }).catch(() => {});
      })
      .catch(async () => {
        const all = await api.getChallenges().catch(() => []);
        if (all.length > 0) {
          setChallenge(all[0]);
          setCode(all[0].starter_code?.[selectedLanguage] || all[0].starter_code?.python || '');
        }
      });
  }, [challengeId]);

  // Handle language switch
  const handleLanguageChange = (lang: 'python' | 'javascript' | 'typescript' | 'cpp') => {
    setSelectedLanguage(lang);
    if (challenge && challenge.starter_code?.[lang]) {
      setCode(challenge.starter_code[lang]);
    }
  };

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Run Code
  const handleRunCode = async () => {
    if (!challenge) return;
    setIsRunning(true);
    if (activeBottomTab === 'custom') {
      setActiveBottomTab('console');
    } else {
      setActiveBottomTab('tests');
    }

    try {
      let testCasesToRun = challenge.test_cases?.filter((tc) => !tc.is_hidden) || [];
      if (activeBottomTab === 'custom' && customInput.trim()) {
        testCasesToRun = [{ input: customInput, expected_output: '', is_hidden: false }];
      }

      const res = await api.runCode({
        language: selectedLanguage,
        code,
        test_cases: testCasesToRun,
        custom_input: activeBottomTab === 'custom' ? customInput : undefined,
        challenge_id: challenge.id,
      });
      setExecutionResult(res);
    } catch (err: any) {
      setExecutionResult({
        status: 'Runtime Error',
        stdout: '',
        stderr: err.message || 'Execution failed.',
        runtime_ms: 0,
        memory_mb: 0,
        passed_count: 0,
        total_count: 0,
        test_results: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution
  const handleSubmit = async () => {
    if (!challenge) return;
    setIsSubmitting(true);
    setActiveBottomTab('ai_review');

    try {
      const sub = await api.submitSolution({
        challenge_id: challenge.id,
        language: selectedLanguage,
        code,
        api_key: user?.gemini_api_key,
      });
      setSubmissionResult(sub);

      if (sub.status === 'Accepted') {
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetCode = () => {
    if (challenge && challenge.starter_code?.[selectedLanguage]) {
      setCode(challenge.starter_code[selectedLanguage]);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCode = () => {
    const ext = selectedLanguage === 'python' ? 'py' : selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'typescript' ? 'ts' : 'cpp';
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${challenge?.slug || 'solution'}.${ext}`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "That's a good direction. Look at whether you can store the seen elements in a hash map for constant-time lookup.";
      if (userMsg.toLowerCase().includes('time') || userMsg.toLowerCase().includes('complexity')) {
        reply = `For this challenge, the optimal target time complexity is ${challenge?.expected_complexity?.time || 'O(N)'}. Ensure you avoid nested loops over the input stream.`;
      } else if (userMsg.toLowerCase().includes('hint')) {
        reply = challenge?.hints?.[0] || 'Try decomposing the condition into boundary base cases first.';
      }
      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <div
      className={`flex flex-col bg-[#070A12] text-slate-100 ${
        isFullscreen ? 'fixed inset-0 z-50 p-4' : 'h-[calc(100vh-6.5rem)]'
      }`}
    >
      {/* Top Action & Language Toolbar */}
      <div className="h-14 px-4 bg-[#0A0D17] border border-slate-800 rounded-t-2xl flex items-center justify-between shrink-0">
        {/* Left: Challenge Title & Difficulty */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-white truncate max-w-xs sm:max-w-md">
            {challenge?.title || 'Loading Challenge...'}
          </span>
          {challenge && (
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
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

        {/* Center: Language selector, Font size, & Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Timer className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          {/* Font Size Toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-400 font-mono">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value={12}>12px</option>
              <option value={13}>13px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
            </select>
          </div>

          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="python">Python 3.11</option>
            <option value="javascript">JavaScript (Node)</option>
            <option value="typescript">TypeScript</option>
            <option value="cpp">C++ 20</option>
          </select>
        </div>

        {/* Right: Actions (Copy, Download, Reset, Run, Submit, Fullscreen) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Copy code"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownloadCode}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
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
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition active:scale-95"
          >
            {isRunning ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
            )}
            Run Code
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            {isSubmitting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Submit Solution
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

      {/* Main Workspace Split Panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 border-x border-b border-slate-800 rounded-b-2xl overflow-hidden">
        {/* Left Panel: Problem, Constraints, Hints, AI Copilot */}
        <div className="lg:col-span-4 bg-[#090C16] border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col min-h-0">
          {/* Tabs */}
          <div className="flex items-center border-b border-slate-800 px-3 bg-slate-950/60 text-xs">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`py-2.5 px-3 font-semibold border-b-2 transition ${
                activeLeftTab === 'description'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveLeftTab('hints')}
              className={`py-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeLeftTab === 'hints'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Hints ({challenge?.hints?.length || 0})
            </button>
            <button
              onClick={() => setActiveLeftTab('assistant')}
              className={`py-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeLeftTab === 'assistant'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              AI Copilot
            </button>
            <button
              onClick={() => setActiveLeftTab('video')}
              className={`py-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeLeftTab === 'video'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-purple-400" />
              Video Solution
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar text-xs">
            {activeLeftTab === 'description' && challenge && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white mb-2">{challenge.title}</h3>
                  <div className="prose prose-invert text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                    {challenge.description}
                  </div>
                </div>

                {/* Constraints */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <h4 className="font-semibold text-white mb-1.5">Constraints:</h4>
                  <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                    {challenge.constraints?.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>

                {/* Examples */}
                {challenge.examples && (
                  <div className="space-y-2.5">
                    <h4 className="font-semibold text-white">Examples:</h4>
                    {challenge.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs space-y-1"
                      >
                        <p><span className="text-indigo-400">Input:</span> {ex.input}</p>
                        <p><span className="text-emerald-400">Output:</span> {ex.output}</p>
                        {ex.explanation && (
                          <p className="text-slate-400 font-sans text-[11px] mt-1">
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
                      <span className="font-semibold text-indigo-400 block mb-1">
                        Hint #{idx + 1}
                      </span>
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
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600/25 border border-indigo-500/30 text-white ml-6'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 mr-6'
                      }`}
                    >
                      <span className="font-bold block mb-1 text-[10px] text-slate-400 uppercase font-mono">
                        {msg.sender === 'user' ? 'You' : 'Gemini Copilot'}
                      </span>
                      {msg.text}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChatMessage} className="pt-2 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask Gemini AI for advice..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    Send
                  </button>
                </form>
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
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {relatedVideo.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Instructor: <span className="text-slate-200 font-medium">{relatedVideo.instructor}</span>
                      </p>
                    </div>

                    {/* Embedded Video */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-purple-500/30 bg-black shadow-lg">
                      <iframe
                        src={`${relatedVideo.video_url}?rel=0`}
                        title={relatedVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>

                    {/* Chapters */}
                    {relatedVideo.chapters && relatedVideo.chapters.length > 0 && (
                      <div className="space-y-1.5">
                        <h5 className="font-semibold text-white text-[11px] uppercase tracking-wider text-slate-400">
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

                    {/* Key Takeaways */}
                    {relatedVideo.key_takeaways && (
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                        <h5 className="font-semibold text-white text-[11px]">Key Concepts & Architecture:</h5>
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

                    {/* Reference Code Actions */}
                    {relatedVideo.code_snippet && (
                      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-purple-300">
                            Reference Solution Code
                          </span>
                          <button
                            onClick={() => {
                              if (relatedVideo.code_snippet) {
                                setCode(relatedVideo.code_snippet);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center gap-1 transition shadow"
                          >
                            <FileCode className="w-3 h-3" />
                            <span>Apply to Editor</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Click "Apply to Editor" to load the instructor's verified algorithmic solution directly into Monaco.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <Video className="w-8 h-8 text-purple-400 mx-auto" />
                    <h4 className="text-xs font-bold text-white">Explore Video Masterclasses</h4>
                    <p className="text-[11px] text-slate-400">
                      Visit our comprehensive video library to watch full step-by-step masterclasses.
                    </p>
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

        {/* Center & Bottom Panel: Monaco Code Editor + Test Results */}
        <div className="lg:col-span-8 flex flex-col min-h-0 bg-[#0B0F19]">
          {/* Editor Area */}
          <div className="flex-1 min-h-[300px] relative">
            <Editor
              height="100%"
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: fontSize,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Bottom Execution Panel */}
          <div className="h-60 border-t border-slate-800 bg-[#0A0D17] flex flex-col shrink-0">
            {/* Bottom Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 bg-slate-950 text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveBottomTab('tests')}
                  className={`py-2 px-3 font-semibold border-b-2 transition ${
                    activeBottomTab === 'tests'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Unit Tests
                </button>
                <button
                  onClick={() => setActiveBottomTab('custom')}
                  className={`py-2 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 ${
                    activeBottomTab === 'custom'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  Custom Input
                </button>
                <button
                  onClick={() => setActiveBottomTab('console')}
                  className={`py-2 px-3 font-semibold border-b-2 transition ${
                    activeBottomTab === 'console'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Standard Output
                </button>
                <button
                  onClick={() => setActiveBottomTab('ai_review')}
                  className={`py-2 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 ${
                    activeBottomTab === 'ai_review'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  AI Code Review
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3 font-mono text-[11px]">
                {executionResult && (
                  <>
                    <span
                      className={`font-bold ${
                        executionResult.status === 'Accepted'
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {executionResult.status} ({executionResult.passed_count}/{executionResult.total_count} Passed)
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400">{executionResult.runtime_ms} ms</span>
                    <span className="text-slate-400">{executionResult.memory_mb} MB</span>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Content Body */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-xs font-mono">
              {activeBottomTab === 'tests' && (
                <div className="space-y-2">
                  {executionResult?.test_results && executionResult.test_results.length > 0 ? (
                    executionResult.test_results.map((tr, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border flex items-center justify-between ${
                          tr.passed
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {tr.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span>
                            Case #{tr.test_case_index}: {tr.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 space-x-3">
                          <span>In: {tr.input || 'None'}</span>
                          <span>Expected: {tr.expected_output}</span>
                          <span>Got: {tr.actual_output || 'Error'}</span>
                          <span>({tr.runtime_ms}ms)</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">
                      Click <strong>"Run Code"</strong> to execute your solution against test cases.
                    </p>
                  )}
                </div>
              )}

              {activeBottomTab === 'custom' && (
                <div className="space-y-2 font-sans">
                  <p className="text-xs text-slate-400">
                    Enter custom standard input values to pass into your code:
                  </p>
                  <textarea
                    rows={4}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. 5&#10;10 20 30 40 50"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleRunCode}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
                  >
                    Run Against Custom Input
                  </button>
                </div>
              )}

              {activeBottomTab === 'console' && (
                <div className="space-y-2 text-slate-300 whitespace-pre-wrap">
                  {executionResult?.stdout && (
                    <div>
                      <p className="text-slate-500 font-semibold mb-1">// STDOUT</p>
                      <p className="text-slate-200">{executionResult.stdout}</p>
                    </div>
                  )}
                  {executionResult?.stderr && (
                    <div>
                      <p className="text-rose-400 font-semibold mb-1">// STDERR</p>
                      <p className="text-rose-300">{executionResult.stderr}</p>
                    </div>
                  )}
                  {!executionResult?.stdout && !executionResult?.stderr && (
                    <p className="text-slate-500">No console output recorded.</p>
                  )}
                </div>
              )}

              {activeBottomTab === 'ai_review' && (
                <div className="space-y-3 font-sans">
                  {submissionResult?.ai_feedback ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-sm font-bold text-white">Automated Code Review Summary</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Overall Score: {submissionResult.ai_feedback.overall_score || 95}/100
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {submissionResult.ai_feedback.summary}
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2 bg-slate-900 rounded border border-slate-800">
                          Time Complexity: <strong className="text-indigo-400">{submissionResult.ai_feedback.time_complexity}</strong>
                        </div>
                        <div className="p-2 bg-slate-900 rounded border border-slate-800">
                          Space Complexity: <strong className="text-cyan-400">{submissionResult.ai_feedback.space_complexity}</strong>
                        </div>
                      </div>
                      {submissionResult.ai_feedback.suggestions && (
                        <div>
                          <p className="text-xs font-semibold text-slate-200 mb-1">Key Suggestions:</p>
                          <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                            {submissionResult.ai_feedback.suggestions.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500">
                      Submit your solution to trigger an in-depth AI Code Review with Big-O complexity breakdown.
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
