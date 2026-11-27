import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Challenge } from '../types';
import { useToast } from '../context/useContexts';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import {
  Play,
  RotateCcw,
  Save,
  Download,
  AlertCircle,
  Cpu,
  Copy,
  Check,
  Clock,
} from 'lucide-react';

export const GeneratorPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [topic, setTopic] = useState('Dynamic Programming');
  const [language, setLanguage] = useState('python');
  const [difficulty, setDifficulty] = useState('Medium');
  const [problemType, setProblemType] = useState('Algorithm');
  const [testCaseCount, setTestCaseCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(2000);
  const [customInstructions, setCustomInstructions] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedChallenge, setGeneratedChallenge] = useState<Challenge | null>(null);
  const [savedChallengeId, setSavedChallengeId] = useState<string | null>(null);
  const [previewLang, setPreviewLang] = useState<'python' | 'javascript' | 'typescript' | 'cpp'>('python');
  const [copiedCode, setCopiedCode] = useState(false);

  const topicsList = [
    'Machine Learning: Linear Regression from Scratch',
    'Machine Learning: Transformer Self-Attention',
    'Dynamic Programming & Memoization',
    'Graph Algorithms & BFS/DFS',
    'Sliding Window & Two Pointers',
    'System Design & Rate Limiter',
  ];

  const handleGenerate = async () => {
    setError(null);
    setSavedChallengeId(null);
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
        model,
      });

      setGeneratedChallenge({
        ...result,
        id: result.id || `gen-${Date.now()}`,
        slug: result.slug || result.title.toLowerCase().replace(/\s+/g, '-'),
        acceptance_rate: 74.0,
        total_submissions: 0,
      });
      setPreviewLang((language as typeof previewLang) || 'python');
      showToast(`Generated "${result.title}".`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate challenge.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const ensureSaved = async (): Promise<string | null> => {
    if (!generatedChallenge) return null;
    if (savedChallengeId) return savedChallengeId;

    const saved = await api.createChallenge(generatedChallenge);
    setGeneratedChallenge(saved);
    setSavedChallengeId(saved.id);
    return saved.id;
  };

  const handleSaveToLibrary = async () => {
    if (!generatedChallenge || savedChallengeId) return;
    try {
      await ensureSaved();
      showToast('Saved challenge to library.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save challenge.';
      showToast(msg, 'error');
    }
  };

  const handleOpenInWorkspace = async () => {
    if (!generatedChallenge) return;
    try {
      const targetId = await ensureSaved();
      if (targetId) {
        navigate(`/app/workspace/${targetId}`, {
          state: { initialLanguage: language },
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not open workspace.';
      showToast(msg, 'error');
    }
  };

  const handleCopyStarter = () => {
    if (!generatedChallenge) return;
    const starter =
      generatedChallenge.starter_code?.[previewLang] ||
      generatedChallenge.starter_code?.python ||
      '';
    navigator.clipboard.writeText(starter);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('Starter code copied.', 'info');
  };

  const handleExportJson = () => {
    if (!generatedChallenge) return;
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(generatedChallenge, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${generatedChallenge.slug || 'challenge'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-white/[0.08]">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed]">
          Task generator
        </h1>
        <p className="text-sm text-[#85858b] mt-1">
          Create coding problems with constraints, multi-language starter code, and test cases
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08] space-y-5">
            <h2 className="text-sm font-medium text-[#ededed] flex items-center gap-2">
              <Cpu strokeWidth={1.5} className="w-4 h-4 text-[#85858b]" />
              <span>Parameters</span>
            </h2>

            {error && (
              <div className="p-3 rounded-lg bg-[#141415] border border-[#e5484d]/50 text-[#e5484d] text-xs flex items-center gap-2">
                <AlertCircle strokeWidth={1.5} className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                Topic or domain
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Dynamic Programming"
                className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-xs text-[#ededed] placeholder-[#85858b] focus:outline-none focus:border-[#e5a00d]"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {topicsList.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTopic(t);
                      if (t.includes('Machine Learning')) setProblemType('Machine Learning');
                    }}
                    className="text-[11px] px-2 py-1 rounded-md border bg-[#141415] hover:bg-[#222225] text-[#a1a1a6] hover:text-[#ededed] border-white/[0.08] transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                Difficulty
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Easy', 'Medium', 'Hard', 'Expert'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`h-8 rounded-lg text-xs font-medium border transition-colors ${
                      difficulty === diff
                        ? 'bg-[#222225] text-[#ededed] border-[#e5a00d]/60'
                        : 'bg-[#141415] text-[#85858b] border-white/[0.08] hover:text-[#ededed]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-xs text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (Node)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="cpp">C++ 20</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                  Problem type
                </label>
                <select
                  value={problemType}
                  onChange={(e) => setProblemType(e.target.value)}
                  className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-3 text-xs text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
                >
                  <option value="Algorithm">Algorithm</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Deep Learning">Deep Learning</option>
                  <option value="Data Structure">Data Structure</option>
                  <option value="System Design">System Design</option>
                  <option value="Optimization">Performance Optimization</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                  Test cases
                </label>
                <select
                  value={testCaseCount}
                  onChange={(e) => setTestCaseCount(Number(e.target.value))}
                  className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-2.5 text-xs text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
                >
                  <option value={3}>3 cases</option>
                  <option value={5}>5 cases</option>
                  <option value={8}>8 cases</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                  Timeout
                </label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-2.5 text-xs text-[#ededed] focus:outline-none focus:border-[#e5a00d]"
                >
                  <option value={1000}>1,000 ms</option>
                  <option value={2000}>2,000 ms</option>
                  <option value={5000}>5,000 ms</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full h-9 bg-[#141415] border border-white/[0.1] rounded-lg px-2.5 text-xs text-[#ededed] focus:outline-none focus:border-[#e5a00d] font-mono"
                >
                  <option value="gemini-2.0-flash">2.0 Flash</option>
                  <option value="gemini-2.5-flash">2.5 Flash</option>
                  <option value="gemini-1.5-pro">1.5 Pro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                Custom instructions (optional)
              </label>
              <textarea
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Include negative edge cases or O(1) space constraint"
                className="w-full bg-[#141415] border border-white/[0.1] rounded-lg p-3 text-xs text-[#ededed] placeholder-[#85858b] focus:outline-none focus:border-[#e5a00d]"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-10 px-4 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#141415]/30 border-t-[#141415] rounded-full animate-spin" />
                  <span>Generating challenge</span>
                </>
              ) : (
                <>
                  <Cpu strokeWidth={1.5} className="w-4 h-4" />
                  <span>Generate challenge</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7">
          {generatedChallenge ? (
            <div className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08] space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                    <span
                      className={
                        generatedChallenge.difficulty === 'Easy'
                          ? 'text-[#4cc38a]'
                          : generatedChallenge.difficulty === 'Medium'
                          ? 'text-[#e5a00d]'
                          : 'text-[#e5484d]'
                      }
                    >
                      {generatedChallenge.difficulty}
                    </span>
                    <span className="text-[#85858b]">{generatedChallenge.category}</span>
                    <span className="text-[#a1a1a6]">
                      Target {generatedChallenge.expected_complexity?.time || 'O(N)'}
                    </span>
                  </div>
                  <h2 className="text-xl font-medium text-[#ededed]">{generatedChallenge.title}</h2>
                </div>

                <button
                  type="button"
                  onClick={handleOpenInWorkspace}
                  className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
                >
                  <Play strokeWidth={1.5} className="w-3.5 h-3.5 fill-current" />
                  <span>Open in workspace</span>
                </button>
              </div>

              <div className="p-4 rounded-lg bg-[#141415] border border-white/[0.08]">
                <MarkdownRenderer content={generatedChallenge.description} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#141415] border border-white/[0.08] text-xs">
                  <h3 className="font-medium text-[#ededed] mb-2 flex items-center gap-1.5">
                    <AlertCircle strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b]" />
                    <span>Constraints</span>
                  </h3>
                  <ul className="space-y-1 text-[#a1a1a6] font-mono text-[11px]">
                    {generatedChallenge.constraints?.map((c, i) => <li key={i}>· {c}</li>) || (
                      <li>· Optimal time and space bounds</li>
                    )}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[#141415] border border-white/[0.08] text-xs">
                  <h3 className="font-medium text-[#ededed] mb-2 flex items-center gap-1.5">
                    <Clock strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b]" />
                    <span>Complexity budget</span>
                  </h3>
                  <div className="space-y-1 font-mono text-[11px] text-[#a1a1a6] tabular-nums">
                    <p>Time: <span className="text-[#ededed]">{generatedChallenge.expected_complexity?.time || 'O(N)'}</span></p>
                    <p>Space: <span className="text-[#ededed]">{generatedChallenge.expected_complexity?.space || 'O(1)'}</span></p>
                    <p>Timeout: <span className="text-[#ededed]">{generatedChallenge.time_limit_ms} ms</span></p>
                  </div>
                </div>
              </div>

              {generatedChallenge.examples && generatedChallenge.examples.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-[#a1a1a6]">Examples</h3>
                  {generatedChallenge.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg bg-[#141415] border border-white/[0.08] font-mono text-xs text-[#ededed] space-y-1"
                    >
                      <p className="whitespace-pre-wrap">
                        <span className="text-[#85858b]">Input:</span> {ex.input}
                      </p>
                      <p className="whitespace-pre-wrap">
                        <span className="text-[#4cc38a]">Output:</span> {ex.output}
                      </p>
                      {ex.explanation && (
                        <p className="text-[#85858b] text-[11px] mt-1 font-sans">{ex.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-[#141415] p-1 rounded-lg border border-white/[0.08] text-xs font-mono">
                    {(['python', 'javascript', 'typescript', 'cpp'] as const).map((langKey) => (
                      <button
                        key={langKey}
                        type="button"
                        onClick={() => setPreviewLang(langKey)}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          previewLang === langKey
                            ? 'bg-[#222225] text-[#ededed]'
                            : 'text-[#85858b] hover:text-[#ededed]'
                        }`}
                      >
                        {langKey === 'cpp' ? 'C++' : langKey}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyStarter}
                    className="flex items-center gap-1.5 text-xs text-[#a1a1a6] hover:text-[#ededed]"
                  >
                    {copiedCode ? <Check strokeWidth={1.5} className="w-3.5 h-3.5 text-[#4cc38a]" /> : <Copy strokeWidth={1.5} className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-lg bg-[#0f0f10] border border-white/[0.08] text-[#ededed] font-mono text-xs overflow-x-auto max-h-52 custom-scrollbar">
                  {generatedChallenge.starter_code?.[previewLang] ||
                    generatedChallenge.starter_code?.python ||
                    '// Starter code ready'}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium text-[#a1a1a6] tabular-nums">
                  Test cases ({generatedChallenge.test_cases?.length || 0})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {generatedChallenge.test_cases?.slice(0, 4).map((tc, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#141415] border border-white/[0.08]">
                      <div className="flex justify-between text-[11px] text-[#85858b] mb-1">
                        <span>Case #{idx + 1}</span>
                        <span className={tc.is_hidden ? 'text-[#e5a00d]' : 'text-[#4cc38a]'}>
                          {tc.is_hidden ? 'Hidden' : 'Public'}
                        </span>
                      </div>
                      <p className="truncate text-[#ededed]">In: {tc.input}</p>
                      <p className="truncate text-[#a1a1a6]">Exp: {tc.expected_output}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveToLibrary}
                    disabled={!!savedChallengeId}
                    className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium border transition-colors ${
                      savedChallengeId
                        ? 'bg-[#222225] text-[#4cc38a] border-[#4cc38a]/40'
                        : 'text-[#ededed] bg-[#222225] hover:bg-[#2a2a2e] border-white/[0.08]'
                    }`}
                  >
                    <Save strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>{savedChallengeId ? 'Saved' : 'Save to library'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-[#ededed] bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] transition-colors"
                  >
                    <Download strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-xs text-[#a1a1a6] hover:text-[#ededed]"
                >
                  <RotateCcw strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[440px] p-8 rounded-xl bg-[#19191b] border border-dashed border-white/[0.1] flex flex-col items-center justify-center text-center">
              <div className="w-11 h-11 rounded-lg bg-[#222225] border border-white/[0.08] flex items-center justify-center text-[#85858b] mb-4">
                <Cpu strokeWidth={1.5} className="w-5 h-5" />
              </div>
              <h2 className="text-base font-medium text-[#ededed] mb-1.5">No challenge generated</h2>
              <p className="text-xs text-[#85858b] max-w-sm leading-relaxed mb-6">
                Configure your domain, difficulty, and runtime on the left, then generate a problem with test vectors.
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
              >
                <Cpu strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Generate sample</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
