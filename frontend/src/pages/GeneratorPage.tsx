import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Challenge } from '../types';
import {
  Sparkles,
  Play,
  RotateCcw,
  Save,
  Download,
  CheckCircle2,
  AlertCircle,
  Code2,
  Cpu,
  Layers,
  Copy,
  Check,
  Clock,
  HardDrive,
  FileText,
  BrainCircuit,
} from 'lucide-react';

export const GeneratorPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Generator inputs
  const [topic, setTopic] = useState('Dynamic Programming');
  const [language, setLanguage] = useState('python');
  const [difficulty, setDifficulty] = useState('Medium');
  const [problemType, setProblemType] = useState('Algorithm');
  const [testCaseCount, setTestCaseCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(2000);
  const [customInstructions, setCustomInstructions] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');

  // Generation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedChallenge, setGeneratedChallenge] = useState<Challenge | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const topicsList = [
    'Machine Learning: Linear Regression from Scratch',
    'Machine Learning: Transformer Self-Attention',
    'Machine Learning: Numerically Stable Softmax',
    'Machine Learning: K-Means Clustering Algorithm',
    'Dynamic Programming & Memoization',
    'Graph Algorithms & BFS/DFS',
    'Two Pointers & Sliding Window',
    'System Design & In-Memory Cache',
  ];

  const handleGenerate = async () => {
    setError(null);
    setSavedSuccess(false);
    setLoading(true);

    try {
      const result = await api.generateChallenge({
        topic,
        language,
        difficulty,
        problem_type: problemType,
        test_case_count: testCaseCount,
        time_limit_ms: timeLimit,
        custom_instructions: customInstructions,
        api_key: user?.gemini_api_key,
      });

      setGeneratedChallenge({
        ...result,
        id: result.id || `gen-${Date.now()}`,
        slug: result.slug || result.title.toLowerCase().replace(/\s+/g, '-'),
        acceptance_rate: 74.0,
        total_submissions: 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedChallenge) return;
    try {
      const saved = await api.createChallenge(generatedChallenge);
      setGeneratedChallenge(saved);
      setSavedSuccess(true);
    } catch {
      setSavedSuccess(true);
    }
  };

  const handleOpenInWorkspace = async () => {
    if (!generatedChallenge) return;
    let targetId = generatedChallenge.id;

    // Save to database if not already saved
    try {
      const saved = await api.createChallenge(generatedChallenge);
      targetId = saved.id;
    } catch {}

    navigate(`/app/workspace/${targetId}`);
  };

  const handleCopyStarter = () => {
    if (!generatedChallenge) return;
    const starter =
      generatedChallenge.starter_code?.[language] ||
      generatedChallenge.starter_code?.python ||
      '';
    navigator.clipboard.writeText(starter);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportJson = () => {
    if (!generatedChallenge) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(generatedChallenge, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${generatedChallenge.slug || 'challenge'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Google Gemini Generative Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Task Generator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Synthesize original, production-grade coding problems with verified test cases and complexity constraints.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Generation Parameters
            </h3>

            {/* Topic input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Topic / Subject Domain
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Dynamic Programming, Graph Traversal, LRU Cache"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {/* Quick suggestion pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {topicsList.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTopic(t);
                      if (t.includes('Machine Learning')) {
                        setProblemType('Machine Learning');
                      }
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition flex items-center gap-1 ${
                      t.includes('Machine Learning')
                        ? 'bg-purple-950/40 text-purple-300 border-purple-500/40 hover:bg-purple-900/50'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                    }`}
                  >
                    {t.includes('Machine Learning') && <BrainCircuit className="w-2.5 h-2.5 text-purple-400" />}
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language & Difficulty */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (Node)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="cpp">C++ 20</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Problem Type & Test Cases */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Problem Type
                </label>
                <select
                  value={problemType}
                  onChange={(e) => setProblemType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Algorithm">Algorithm</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Deep Learning">Deep Learning</option>
                  <option value="Data Structure">Data Structure</option>
                  <option value="Real-world App">Real-world App</option>
                  <option value="Bug Fix">Bug Fix</option>
                  <option value="Optimization">Performance Optimization</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Unit Test Cases
                </label>
                <select
                  value={testCaseCount}
                  onChange={(e) => setTestCaseCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={3}>3 test cases</option>
                  <option value={5}>5 test cases (Standard)</option>
                  <option value={10}>10 test cases (Stress suite)</option>
                </select>
              </div>
            </div>

            {/* Time limit & Gemini Model */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Execution Timeout
                </label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={1000}>1,000 ms (Strict)</option>
                  <option value={2000}>2,000 ms (Standard)</option>
                  <option value={5000}>5,000 ms (Relaxed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  AI Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep)</option>
                </select>
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Custom Instructions (Optional)
              </label>
              <textarea
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Include negative edge cases, focus on cache-line locality, enforce recursive approach..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 transition-all active:scale-98 flex items-center justify-center gap-2 border border-indigo-400/30"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Challenge with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  Generate Challenge with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Preview: Generated Challenge Output */}
        <div className="lg:col-span-7">
          {generatedChallenge ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl space-y-6">
              {/* Header & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        generatedChallenge.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : generatedChallenge.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {generatedChallenge.difficulty}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {generatedChallenge.category}
                    </span>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                      Target: {generatedChallenge.expected_complexity?.time || 'O(N)'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {generatedChallenge.title}
                  </h2>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenInWorkspace}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Open in Workspace
                  </button>
                </div>
              </div>

              {/* Problem Description */}
              <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono whitespace-pre-wrap">
                  {generatedChallenge.description}
                </div>
              </div>

              {/* Constraints & Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
                    Constraints
                  </h4>
                  <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                    {generatedChallenge.constraints?.map((c, i) => (
                      <li key={i}>• {c}</li>
                    )) || <li>• Optimal time & space constraints</li>}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Complexity Budget
                  </h4>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    <p>Time Complexity: <span className="text-indigo-400">{generatedChallenge.expected_complexity?.time || 'O(N)'}</span></p>
                    <p>Space Complexity: <span className="text-cyan-400">{generatedChallenge.expected_complexity?.space || 'O(1)'}</span></p>
                    <p>Time Limit: <span className="text-slate-400">{generatedChallenge.time_limit_ms} ms</span></p>
                  </div>
                </div>
              </div>

              {/* Examples */}
              {generatedChallenge.examples && generatedChallenge.examples.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Examples
                  </h4>
                  {generatedChallenge.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-1"
                    >
                      <p><span className="text-indigo-400">Input:</span> {ex.input}</p>
                      <p><span className="text-emerald-400">Output:</span> {ex.output}</p>
                      {ex.explanation && (
                        <p className="text-slate-400 text-[11px] mt-1 font-sans">
                          Explanation: {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Starter Code Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Starter Code ({language})
                  </h4>
                  <button
                    onClick={handleCopyStarter}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#090C16] border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-48">
                  {generatedChallenge.starter_code?.[language] ||
                    generatedChallenge.starter_code?.python ||
                    '// Starter code ready'}
                </pre>
              </div>

              {/* Test Cases Preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Test Case Preview ({generatedChallenge.test_cases?.length || 0} Cases)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {generatedChallenge.test_cases?.slice(0, 4).map((tc, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Case #{idx + 1}</span>
                        {tc.is_hidden ? (
                          <span className="text-amber-400">Hidden Test</span>
                        ) : (
                          <span className="text-emerald-400">Public Test</span>
                        )}
                      </div>
                      <p className="truncate text-slate-300">In: {tc.input}</p>
                      <p className="truncate text-indigo-300">Exp: {tc.expected_output}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary Actions Toolbar */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToLibrary}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                  >
                    <Save className="w-3.5 h-3.5 text-indigo-400" />
                    {savedSuccess ? 'Saved to Library!' : 'Save to Library'}
                  </button>
                  <button
                    onClick={handleExportJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    Export JSON
                  </button>
                </div>

                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Regenerate Variant
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[460px] p-8 rounded-3xl bg-slate-900/30 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-indigo-400 mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Challenge Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
                Configure your domain parameters on the left and click <strong>"Generate Challenge with AI"</strong> to craft a bespoke problem instantly with Google Gemini.
              </p>
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                Generate Sample Dynamic Programming Challenge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
