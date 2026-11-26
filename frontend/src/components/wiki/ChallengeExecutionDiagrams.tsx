import React, { useState } from 'react';
import { Code2, Cpu, GitMerge, Layers, MessageSquareCode } from 'lucide-react';

type ChallengeDiagramTab = 'solution-arch' | 'execution' | 'synthesis' | 'sequence';

export const ChallengeExecutionDiagrams: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ChallengeDiagramTab>('solution-arch');

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#070B16] overflow-hidden shadow-xl">
      <div className="px-4 py-3.5 sm:px-6 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            Proposed Solution — 3 Architecture Diagrams &amp; Sequence
          </div>
          <p className="text-xs text-slate-400">
            Dual CLI/Web control plane, C++20 JsonCpp execution sandbox, 368+ challenge synthesis &amp; IDE Copilot sequence.
          </p>
        </div>

        <div className="flex overflow-x-auto no-scrollbar items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          {[
            { id: 'solution-arch' as const, label: 'Arch 1: Solution', icon: Layers },
            { id: 'execution' as const, label: 'Arch 2: Sandbox & JsonCpp', icon: Cpu },
            { id: 'synthesis' as const, label: 'Arch 3: 368+ Synthesis', icon: GitMerge },
            { id: 'sequence' as const, label: 'IDE Sequence', icon: MessageSquareCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-5 overflow-x-auto custom-scrollbar">
        {activeTab === 'solution-arch' && (
          <svg viewBox="0 0 960 440" className="w-full min-w-[660px] h-auto" role="img" aria-label="Architecture Diagram 1: Proposed Solution Full-Stack Architecture">
            <defs>
              <marker id="sol1-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
              </marker>
            </defs>

            <rect x="20" y="16" width="920" height="84" rx="14" fill="#0b1124" stroke="#6366f1" strokeWidth="1.5" />
            <text x="36" y="36" fill="#a5b4fc" fontSize="10" fontWeight="700" fontFamily="monospace">LAYER 1 · LIGHTWEIGHT CLI &amp; WEB DASHBOARD UI</text>
            <rect x="36" y="46" width="430" height="44" rx="8" fill="#131b36" stroke="#818cf8" strokeWidth="1" />
            <text x="50" y="65" fill="#ffffff" fontSize="12" fontWeight="700">CLI (run_factory.py · validate_tasks.py · run_mutation_testing.py)</text>
            <text x="50" y="81" fill="#a5b4fc" fontSize="10">Trigger pipelines, inspect package trees, view pass/fail matrices</text>
            <rect x="494" y="46" width="430" height="44" rx="8" fill="#0c1f33" stroke="#22d3ee" strokeWidth="1" />
            <text x="508" y="65" fill="#ffffff" fontSize="12" fontWeight="700">Web Dashboard &amp; Monaco IDE (React 19 + TS)</text>
            <text x="508" y="81" fill="#67e8f9" fontSize="10">Challenge Bank, AI Task Generator, LMS &amp; Evaluation Report Viewer</text>

            <path d="M 250 100 L 250 122" stroke="#38bdf8" strokeWidth="1.8" markerEnd="url(#sol1-arr)" />
            <path d="M 710 100 L 710 122" stroke="#38bdf8" strokeWidth="1.8" markerEnd="url(#sol1-arr)" />

            <rect x="20" y="126" width="920" height="82" rx="14" fill="#11162b" stroke="#8b5cf6" strokeWidth="1.5" />
            <text x="36" y="146" fill="#c4b5fd" fontSize="10" fontWeight="700" fontFamily="monospace">LAYER 2 · FASTAPI CONTROL PLANE &amp; PIPELINE ORCHESTRATOR</text>
            <rect x="36" y="156" width="430" height="42" rx="8" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" />
            <text x="50" y="175" fill="#ffffff" fontSize="12" fontWeight="700">FastAPI Zero-Trust API (/api/challenges · /run-code · /submit)</text>
            <text x="50" y="190" fill="#cbd5e1" fontSize="10">PBKDF2-HMAC-SHA256 Auth · HS256 JWT · Capability Probe</text>
            <rect x="494" y="156" width="430" height="42" rx="8" fill="#172554" stroke="#38bdf8" strokeWidth="1" />
            <text x="508" y="175" fill="#ffffff" fontSize="12" fontWeight="700">TaskForge Orchestrator (pipeline/orchestrator.py)</text>
            <text x="508" y="190" fill="#cbd5e1" fontSize="10">Repo Specs / Docker Image Params → Harbor 0.25 Packages</text>

            <path d="M 480 208 L 480 230" stroke="#38bdf8" strokeWidth="1.8" markerEnd="url(#sol1-arr)" />

            <rect x="20" y="234" width="920" height="92" rx="14" fill="#091d1c" stroke="#10b981" strokeWidth="1.5" />
            <text x="36" y="254" fill="#6ee7b7" fontSize="10" fontWeight="700" fontFamily="monospace">LAYER 3 · CHALLENGE SYNTHESIS &amp; MULTI-LANGUAGE SANDBOX</text>
            <rect x="36" y="264" width="430" height="50" rx="8" fill="#052e16" stroke="#34d399" strokeWidth="1" />
            <text x="50" y="284" fill="#ffffff" fontSize="12" fontWeight="700">368+ Challenge Bank &amp; Reference Solver Gate</text>
            <text x="50" y="301" fill="#d1fae5" fontSize="10">challenge_bank.py (10 domains) + Gemini/AST Generator</text>
            <rect x="494" y="264" width="430" height="50" rx="8" fill="#052e16" stroke="#34d399" strokeWidth="1" />
            <text x="508" y="284" fill="#ffffff" fontSize="12" fontWeight="700">Isolated Execution Sandbox (code_runner.py + Docker)</text>
            <text x="508" y="301" fill="#67e8f9" fontSize="10">Python 3.11 · Node JS/TS · C++20 + open-source-parsers/jsoncpp</text>

            <path d="M 480 326 L 480 348" stroke="#38bdf8" strokeWidth="1.8" markerEnd="url(#sol1-arr)" />

            <rect x="20" y="352" width="920" height="74" rx="14" fill="#181308" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="36" y="372" fill="#fcd34d" fontSize="10" fontWeight="700" fontFamily="monospace">LAYER 4 · VALIDATION EVIDENCE, AI REVIEW &amp; PERSISTENCE</text>
            <rect x="36" y="382" width="888" height="34" rx="8" fill="#271d0b" stroke="#fbbf24" strokeWidth="1" />
            <text x="52" y="403" fill="#fef3c7" fontSize="11.5" fontWeight="600">
              validator.py + mutation_tester.py + Gemini AI Copilot → SQLite Submissions · validation_evidence/ · ReportLab Vector PDFs
            </text>
          </svg>
        )}

        {activeTab === 'execution' && (
          <svg viewBox="0 0 960 400" className="w-full min-w-[660px] h-auto" role="img" aria-label="Architecture Diagram 2: Multi-Language Execution Sandbox and C++20 JsonCpp Flow">
            <defs>
              <marker id="cb-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
              </marker>
            </defs>

            <rect x="20" y="135" width="180" height="110" rx="12" fill="#131b36" stroke="#6366f1" strokeWidth="1.6" />
            <text x="34" y="158" fill="#a5b4fc" fontSize="10" fontWeight="700" fontFamily="monospace">01 · SUBMISSION</text>
            <text x="34" y="179" fill="#ffffff" fontSize="13" fontWeight="700">Code + Language</text>
            <text x="34" y="198" fill="#94a3b8" fontSize="11">JWT Auth Verified</text>
            <text x="34" y="216" fill="#67e8f9" fontSize="11">Isolated TempDir</text>

            <path d="M 200 190 L 245 190" stroke="#818cf8" strokeWidth="2" markerEnd="url(#cb-arr)" />

            <rect x="252" y="24" width="320" height="352" rx="14" fill="#091624" stroke="#06b6d4" strokeWidth="1.6" />
            <text x="270" y="48" fill="#67e8f9" fontSize="10.5" fontWeight="700" fontFamily="monospace">02 · LANGUAGE ROUTER (code_runner.py)</text>

            <rect x="270" y="64" width="284" height="58" rx="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            <text x="284" y="86" fill="#ffffff" fontSize="12.5" fontWeight="700">Python 3.11 Subprocess</text>
            <text x="284" y="104" fill="#94a3b8" fontSize="10.5">sys.executable · stdin JSON test loop</text>

            <rect x="270" y="134" width="284" height="58" rx="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            <text x="284" y="156" fill="#ffffff" fontSize="12.5" fontWeight="700">Node JS (.mjs) &amp; TS Strip-Types</text>
            <text x="284" y="174" fill="#94a3b8" fontSize="10.5">node --experimental-strip-types (.mts)</text>

            <rect x="270" y="206" width="284" height="150" rx="9" fill="#05231f" stroke="#10b981" strokeWidth="1.4" />
            <text x="284" y="228" fill="#6ee7b7" fontSize="12.5" fontWeight="700">C++20 Compiler + JsonCpp</text>
            <text x="284" y="248" fill="#d1fae5" fontSize="10.5">• _find_cpp_compiler(): g++ / clang++ -std=c++20 -O2</text>
            <text x="284" y="266" fill="#d1fae5" fontSize="10.5">• _uses_jsoncpp(): detects &lt;json/json.h&gt;</text>
            <text x="284" y="284" fill="#67e8f9" fontSize="10.5">• Links backend/vendor/jsoncpp/jsoncpp.cpp</text>
            <text x="284" y="302" fill="#94a3b8" fontSize="10.5">• Adds -static on Windows MinGW/w64devkit</text>
            <text x="284" y="324" fill="#fde68a" fontSize="10.5">• Clean Compilation Error stderr on syntax errors</text>

            <path d="M 572 190 L 620 190" stroke="#818cf8" strokeWidth="2" markerEnd="url(#cb-arr)" />

            <rect x="628" y="64" width="312" height="272" rx="14" fill="#0c1b15" stroke="#10b981" strokeWidth="1.6" />
            <text x="646" y="88" fill="#6ee7b7" fontSize="10.5" fontWeight="700" fontFamily="monospace">03 · GRADING &amp; AI REVIEW</text>
            <rect x="646" y="106" width="276" height="62" rx="9" fill="#06281c" stroke="#34d399" strokeWidth="1" />
            <text x="660" y="129" fill="#ffffff" fontSize="12" fontWeight="700">Normalize Line Endings &amp; Compare</text>
            <text x="660" y="148" fill="#cbd5e1" fontSize="10.5">Per-case stdout, runtime_ms &amp; Verdict</text>

            <rect x="646" y="182" width="276" height="62" rx="9" fill="#06281c" stroke="#34d399" strokeWidth="1" />
            <text x="660" y="205" fill="#ffffff" fontSize="12" fontWeight="700">Anti-Repeat-Solve Point Guard</text>
            <text x="660" y="224" fill="#cbd5e1" fontSize="10.5">Awards points only on first Accepted pass</text>

            <rect x="646" y="258" width="276" height="62" rx="9" fill="#171e30" stroke="#f59e0b" strokeWidth="1" />
            <text x="660" y="281" fill="#fde68a" fontSize="12" fontWeight="700">Gemini / AST Complexity Review</text>
            <text x="660" y="300" fill="#cbd5e1" fontSize="10.5">Persists Submission + Big-O feedback</text>
          </svg>
        )}

        {activeTab === 'synthesis' && (
          <svg viewBox="0 0 960 360" className="w-full min-w-[660px] h-auto" role="img" aria-label="Architecture Diagram 3: 368+ Challenge Bank Synthesis and AI Challenge Pipeline">
            <defs>
              <marker id="syn-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#22d3ee" />
              </marker>
            </defs>

            <rect x="20" y="24" width="275" height="92" rx="12" fill="#131b36" stroke="#6366f1" strokeWidth="1.5" />
            <text x="36" y="48" fill="#a5b4fc" fontSize="10" fontWeight="700" fontFamily="monospace">SOURCE A · FLAGSHIP</text>
            <text x="36" y="70" fill="#ffffff" fontSize="13" fontWeight="700">8 Curated Core Tasks</text>
            <text x="36" y="90" fill="#94a3b8" fontSize="11">challenges.py (LRU Cache, Graphs...)</text>

            <rect x="20" y="134" width="275" height="96" rx="12" fill="#0d1b2a" stroke="#06b6d4" strokeWidth="1.5" />
            <text x="36" y="158" fill="#67e8f9" fontSize="10" fontWeight="700" fontFamily="monospace">SOURCE B · ARCHETYPE BANK</text>
            <text x="36" y="180" fill="#ffffff" fontSize="13" fontWeight="700">360 Synthesized Challenges</text>
            <text x="36" y="200" fill="#94a3b8" fontSize="11">10 CS &amp; ML Domains × 36 tasks</text>

            <rect x="20" y="248" width="275" height="90" rx="12" fill="#1a162b" stroke="#a855f7" strokeWidth="1.5" />
            <text x="36" y="272" fill="#d8b4fe" fontSize="10" fontWeight="700" fontFamily="monospace">SOURCE C · ON-DEMAND AI</text>
            <text x="36" y="294" fill="#ffffff" fontSize="13" fontWeight="700">Gemini / AST Generator</text>
            <text x="36" y="314" fill="#94a3b8" fontSize="11">Topic · Difficulty · Custom Constraints</text>

            <path d="M 295 70 L 348 160" stroke="#22d3ee" strokeWidth="1.8" markerEnd="url(#syn-arr)" />
            <path d="M 295 182 L 348 182" stroke="#22d3ee" strokeWidth="1.8" markerEnd="url(#syn-arr)" />
            <path d="M 295 292 L 348 205" stroke="#22d3ee" strokeWidth="1.8" markerEnd="url(#syn-arr)" />

            <rect x="355" y="75" width="270" height="210" rx="14" fill="#081c1a" stroke="#10b981" strokeWidth="1.6" />
            <text x="372" y="100" fill="#6ee7b7" fontSize="10.5" fontWeight="700" fontFamily="monospace">VERIFICATION &amp; HARNESSING</text>
            <text x="372" y="128" fill="#ffffff" fontSize="13" fontWeight="700">Reference Solver Gate</text>
            <text x="372" y="148" fill="#cbd5e1" fontSize="11">• Runs canonical Python solver</text>
            <text x="372" y="168" fill="#cbd5e1" fontSize="11">• Locks deterministic I/O vectors</text>
            <text x="372" y="196" fill="#67e8f9" fontSize="12.5" fontWeight="700">4-Language Starter Harness</text>
            <text x="372" y="216" fill="#cbd5e1" fontSize="11">• Python 3 · JS · TS · C++20 JsonCpp</text>
            <text x="372" y="236" fill="#cbd5e1" fontSize="11">• Hints, constraints &amp; Big-O targets</text>

            <path d="M 625 180 L 675 180" stroke="#22d3ee" strokeWidth="2" markerEnd="url(#syn-arr)" />

            <rect x="682" y="95" width="258" height="170" rx="14" fill="#181308" stroke="#f59e0b" strokeWidth="1.6" />
            <text x="698" y="120" fill="#fcd34d" fontSize="10.5" fontWeight="700" fontFamily="monospace">CHALLENGE STORE &amp; API</text>
            <text x="698" y="148" fill="#ffffff" fontSize="13" fontWeight="700">SQLite / SQLAlchemy DB</text>
            <text x="698" y="170" fill="#cbd5e1" fontSize="11">✓ 368+ Verified Tasks Ready</text>
            <text x="698" y="190" fill="#cbd5e1" fontSize="11">✓ GET /api/challenges (Paginated)</text>
            <text x="698" y="210" fill="#cbd5e1" fontSize="11">✓ GET /api/challenges/stats</text>
            <text x="698" y="232" fill="#34d399" fontSize="11" fontWeight="700">✓ Ctrl+K Search + Monaco IDE</text>
          </svg>
        )}

        {activeTab === 'sequence' && (
          <svg viewBox="0 0 960 390" className="w-full min-w-[660px] h-auto" role="img" aria-label="Workspace IDE, Execution Sandbox and AI Copilot Sequence Diagram">
            <defs>
              <marker id="seq-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
              </marker>
            </defs>

            {[
              { x: 110, title: 'Monaco IDE', sub: 'Developer', stroke: '#6366f1' },
              { x: 350, title: 'FastAPI Router', sub: 'execution.py', stroke: '#8b5cf6' },
              { x: 600, title: 'Sandbox Runner', sub: 'code_runner.py', stroke: '#10b981' },
              { x: 840, title: 'Copilot & DB', sub: 'Gemini + SQLite', stroke: '#f59e0b' },
            ].map((actor) => (
              <g key={actor.title}>
                <rect x={actor.x - 85} y="16" width="170" height="46" rx="10" fill="#0f172a" stroke={actor.stroke} strokeWidth="1.5" />
                <text x={actor.x} y="37" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">{actor.title}</text>
                <text x={actor.x} y="53" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">{actor.sub}</text>
                <line x1={actor.x} y1="62" x2={actor.x} y2="368" stroke="#334155" strokeWidth="1.5" strokeDasharray="5,4" />
              </g>
            ))}

            <line x1="115" y1="95" x2="342" y2="95" stroke="#38bdf8" strokeWidth="1.8" markerEnd="url(#seq-arr)" />
            <text x="228" y="88" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontFamily="monospace">1. POST /api/run-code (code, lang)</text>

            <line x1="355" y1="132" x2="592" y2="132" stroke="#34d399" strokeWidth="1.8" markerEnd="url(#seq-arr)" />
            <text x="474" y="125" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontFamily="monospace">2. Compile &amp; Run (PY/JS/TS/C++ JsonCpp)</text>

            <line x1="595" y1="168" x2="118" y2="168" stroke="#818cf8" strokeWidth="1.8" strokeDasharray="4,3" markerEnd="url(#seq-arr)" />
            <text x="355" y="161" textAnchor="middle" fill="#c7d2fe" fontSize="11" fontFamily="monospace">3. stdout, runtime_ms, pass/fail cases</text>

            <line x1="115" y1="212" x2="832" y2="212" stroke="#fbbf24" strokeWidth="1.8" markerEnd="url(#seq-arr)" />
            <text x="474" y="205" textAnchor="middle" fill="#fde68a" fontSize="11" fontFamily="monospace">4. Optional: POST /api/ai-copilot (debugging hint &amp; Big-O check)</text>

            <line x1="115" y1="258" x2="342" y2="258" stroke="#38bdf8" strokeWidth="1.8" markerEnd="url(#seq-arr)" />
            <text x="228" y="251" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontFamily="monospace">5. POST /api/submit-solution</text>

            <line x1="355" y1="295" x2="592" y2="295" stroke="#34d399" strokeWidth="1.8" markerEnd="url(#seq-arr)" />
            <text x="474" y="288" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontFamily="monospace">6. Grade public + hidden test vectors</text>

            <line x1="355" y1="334" x2="832" y2="334" stroke="#f59e0b" strokeWidth="1.8" markerEnd="url(#seq-arr)" />
            <text x="594" y="327" textAnchor="middle" fill="#fcd34d" fontSize="11" fontFamily="monospace">7. Save Submission, AI Review &amp; first-solve Points -&gt; Dev UI</text>
          </svg>
        )}
      </div>
    </div>
  );
};
