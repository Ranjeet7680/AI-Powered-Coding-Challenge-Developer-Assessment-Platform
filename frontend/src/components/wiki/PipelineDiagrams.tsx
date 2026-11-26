import React, { useState } from 'react';
import { GitBranch, Layers, Users, Workflow } from 'lucide-react';

export type DiagramKind = 'process-flow' | 'use-case' | 'architecture';

interface PipelineDiagramsProps {
  defaultTab?: DiagramKind;
}

export const PipelineDiagrams: React.FC<PipelineDiagramsProps> = ({
  defaultTab = 'process-flow',
}) => {
  const [activeDiagram, setActiveDiagram] = useState<DiagramKind>(defaultTab);

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#070B16] overflow-hidden shadow-xl">
      {/* Diagram Selector Header */}
      <div className="px-4 py-3.5 sm:px-6 border-b border-slate-800 bg-slate-950/75 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
            <GitBranch className="w-3.5 h-3.5" />
            Interactive Pipeline Architecture &amp; UML Views
          </div>
          <p className="text-xs text-slate-400">
            Repo specs &amp; image params → generated task packages + reference tests → target AI models → validated outputs.
          </p>
        </div>

        <div className="flex overflow-x-auto no-scrollbar items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          {[
            { id: 'process-flow' as const, label: 'Process Flow', icon: Workflow },
            { id: 'use-case' as const, label: 'Use-Case (UML)', icon: Users },
            { id: 'architecture' as const, label: 'Architecture', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeDiagram === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDiagram(tab.id)}
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

      {/* Responsive SVG Diagram Canvas */}
      <div className="p-3 sm:p-5 overflow-x-auto custom-scrollbar">
        {activeDiagram === 'process-flow' && (
          <svg
            viewBox="0 0 960 440"
            className="w-full min-w-[680px] h-auto"
            role="img"
            aria-label="Coding Task Factory End-to-End Process Flow Diagram"
          >
            <defs>
              <marker id="pf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
              </marker>
              <marker id="pf-arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
              </marker>
            </defs>

            {/* Step 1: Inputs */}
            <rect x="20" y="34" width="205" height="92" rx="14" fill="#111936" stroke="#6366f1" strokeWidth="1.6" />
            <text x="34" y="57" fill="#a5b4fc" fontSize="10" fontWeight="700" fontFamily="monospace">01 · INPUT SPEC</text>
            <text x="34" y="77" fill="#ffffff" fontSize="13" fontWeight="700">Repository Specs</text>
            <text x="34" y="96" fill="#94a3b8" fontSize="11">Git URL · Pinned SHA</text>
            <text x="34" y="112" fill="#94a3b8" fontSize="11">Language · Test Runner</text>

            <rect x="20" y="160" width="205" height="92" rx="14" fill="#0e1b2c" stroke="#06b6d4" strokeWidth="1.6" />
            <text x="34" y="183" fill="#67e8f9" fontSize="10" fontWeight="700" fontFamily="monospace">01B · CONTAINER PARAMS</text>
            <text x="34" y="203" fill="#ffffff" fontSize="13" fontWeight="700">Image Parameters</text>
            <text x="34" y="222" fill="#94a3b8" fontSize="11">Dockerfile · Resource Caps</text>
            <text x="34" y="238" fill="#94a3b8" fontSize="11">C++ JsonCpp / Python / Node</text>

            {/* Step 2: Task Package Generator */}
            <path d="M 225 80 L 285 130" stroke="#818cf8" strokeWidth="2" markerEnd="url(#pf-arrow)" />
            <path d="M 225 206 L 285 155" stroke="#818cf8" strokeWidth="2" markerEnd="url(#pf-arrow)" />

            <rect x="292" y="75" width="225" height="145" rx="16" fill="#131c31" stroke="#8b5cf6" strokeWidth="1.8" />
            <text x="308" y="99" fill="#c4b5fd" fontSize="10" fontWeight="700" fontFamily="monospace">02 · TASK SYNTHESIS</text>
            <text x="308" y="121" fill="#ffffff" fontSize="14" fontWeight="800">Generate Task Packages</text>
            <text x="308" y="143" fill="#cbd5e1" fontSize="11">• RepoAnalyzer &amp; PackageBuilder</text>
            <text x="308" y="162" fill="#cbd5e1" fontSize="11">• instruction.md + task.toml</text>
            <text x="308" y="181" fill="#34d399" fontSize="11" fontWeight="600">• Reference Tests (F2P + P2P)</text>
            <text x="308" y="200" fill="#cbd5e1" fontSize="11">• Reference Oracle Patch</text>

            {/* Decision / Schema Gate */}
            <path d="M 517 148 L 565 148" stroke="#818cf8" strokeWidth="2" markerEnd="url(#pf-arrow)" />
            <rect x="572" y="55" width="175" height="190" rx="16" fill="#102124" stroke="#10b981" strokeWidth="1.8" />
            <text x="588" y="79" fill="#6ee7b7" fontSize="10" fontWeight="700" fontFamily="monospace">03 · TRIAL EXECUTION</text>
            <text x="588" y="101" fill="#ffffff" fontSize="14" fontWeight="800">Run Target AI</text>
            <text x="588" y="119" fill="#ffffff" fontSize="14" fontWeight="800">Models &amp; Suite</text>
            <rect x="588" y="132" width="143" height="28" rx="8" fill="#064e3b" stroke="#34d399" strokeWidth="1" />
            <text x="600" y="150" fill="#d1fae5" fontSize="11" fontWeight="700">Target AI Coding Models</text>
            <rect x="588" y="168" width="143" height="28" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
            <text x="600" y="186" fill="#cbd5e1" fontSize="11">Baseline (nop) · 0.0 Check</text>
            <rect x="588" y="204" width="143" height="28" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
            <text x="600" y="222" fill="#fde68a" fontSize="11">Oracle + Mutant Sweep</text>

            {/* Step 4: Validator & Validated Results */}
            <path d="M 747 148 L 787 148" stroke="#34d399" strokeWidth="2" markerEnd="url(#pf-arrow-green)" />
            <rect x="794" y="65" width="150" height="170" rx="16" fill="#1a180d" stroke="#f59e0b" strokeWidth="1.8" />
            <text x="808" y="89" fill="#fcd34d" fontSize="10" fontWeight="700" fontFamily="monospace">04 · OUTPUT</text>
            <text x="808" y="111" fill="#ffffff" fontSize="14" fontWeight="800">Validated</text>
            <text x="808" y="129" fill="#ffffff" fontSize="14" fontWeight="800">Results</text>
            <text x="808" y="154" fill="#cbd5e1" fontSize="11">✓ Pass/Fail Score</text>
            <text x="808" y="172" fill="#cbd5e1" fontSize="11">✓ Evidence JSON</text>
            <text x="808" y="190" fill="#cbd5e1" fontSize="11">✓ 100% Mutant Kill</text>
            <text x="808" y="208" fill="#34d399" fontSize="11" fontWeight="700">✓ PDF &amp; Logs</text>

            {/* Feedback Loop Arrow */}
            <path d="M 660 245 L 660 310 L 404 310 L 404 228" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5,4" markerEnd="url(#pf-arrow)" />
            <rect x="440" y="294" width="195" height="28" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="1" />
            <text x="454" y="312" fill="#94a3b8" fontSize="10.5" fontFamily="monospace">Iterative Reference Test Refinement</text>

            {/* Bottom Summary Strip */}
            <rect x="20" y="352" width="924" height="68" rx="14" fill="#0b1120" stroke="#1e293b" strokeWidth="1.2" />
            <text x="38" y="378" fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">HARBOR 0.25 + MULTI-LANG SANDBOX GUARANTEE</text>
            <text x="38" y="399" fill="#94a3b8" fontSize="12">
              Every generated task verifies zero pre-patch leakage (nop = 0.0), deterministic reference patch pass (oracle = 1.0), and C++20/JsonCpp, Python, JS &amp; TS parity.
            </text>
          </svg>
        )}

        {activeDiagram === 'use-case' && (
          <svg
            viewBox="0 0 960 460"
            className="w-full min-w-[680px] h-auto"
            role="img"
            aria-label="Coding Task Factory UML Use-Case Diagram"
          >
            {/* System Boundary Box */}
            <rect x="215" y="20" width="530" height="420" rx="20" fill="#0a1020" stroke="#4f46e5" strokeWidth="2" strokeDasharray="7,5" />
            <text x="238" y="46" fill="#a5b4fc" fontSize="12" fontWeight="800" fontFamily="monospace">
              &lt;&lt;system&gt;&gt; Coding Task Factory &amp; TaskForge Pipeline
            </text>

            {/* Actor 1: Task Author */}
            <circle cx="85" cy="95" r="16" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
            <line x1="85" y1="111" x2="85" y2="152" stroke="#818cf8" strokeWidth="2" />
            <line x1="60" y1="126" x2="110" y2="126" stroke="#818cf8" strokeWidth="2" />
            <line x1="85" y1="152" x2="66" y2="180" stroke="#818cf8" strokeWidth="2" />
            <line x1="85" y1="152" x2="104" y2="180" stroke="#818cf8" strokeWidth="2" />
            <text x="85" y="200" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="700">Task Author /</text>
            <text x="85" y="216" textAnchor="middle" fill="#94a3b8" fontSize="11">Engineer</text>

            {/* Actor 2: Target AI Model */}
            <circle cx="85" cy="300" r="16" fill="#083344" stroke="#22d3ee" strokeWidth="2" />
            <line x1="85" y1="316" x2="85" y2="357" stroke="#22d3ee" strokeWidth="2" />
            <line x1="60" y1="331" x2="110" y2="331" stroke="#22d3ee" strokeWidth="2" />
            <line x1="85" y1="357" x2="66" y2="385" stroke="#22d3ee" strokeWidth="2" />
            <line x1="85" y1="357" x2="104" y2="385" stroke="#22d3ee" strokeWidth="2" />
            <text x="85" y="405" textAnchor="middle" fill="#67e8f9" fontSize="12" fontWeight="700">Target AI</text>
            <text x="85" y="421" textAnchor="middle" fill="#94a3b8" fontSize="11">Coding Model</text>

            {/* Actor 3: Validator / CI */}
            <circle cx="875" cy="145" r="16" fill="#052e16" stroke="#34d399" strokeWidth="2" />
            <line x1="875" y1="161" x2="875" y2="202" stroke="#34d399" strokeWidth="2" />
            <line x1="850" y1="176" x2="900" y2="176" stroke="#34d399" strokeWidth="2" />
            <line x1="875" y1="202" x2="856" y2="230" stroke="#34d399" strokeWidth="2" />
            <line x1="875" y1="202" x2="894" y2="230" stroke="#34d399" strokeWidth="2" />
            <text x="875" y="250" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="700">Validator &amp;</text>
            <text x="875" y="266" textAnchor="middle" fill="#94a3b8" fontSize="11">CI Harness</text>

            {/* Actor 4: Platform User */}
            <circle cx="875" cy="335" r="16" fill="#2d1b07" stroke="#fbbf24" strokeWidth="2" />
            <line x1="875" y1="351" x2="875" y2="388" stroke="#fbbf24" strokeWidth="2" />
            <line x1="850" y1="364" x2="900" y2="364" stroke="#fbbf24" strokeWidth="2" />
            <line x1="875" y1="388" x2="856" y2="412" stroke="#fbbf24" strokeWidth="2" />
            <line x1="875" y1="388" x2="894" y2="412" stroke="#fbbf24" strokeWidth="2" />
            <text x="875" y="432" textAnchor="middle" fill="#fde68a" fontSize="12" fontWeight="700">Recruiter / Dev</text>

            {/* Use Case Ovals */}
            <ellipse cx="385" cy="96" rx="138" ry="30" fill="#172554" stroke="#6366f1" strokeWidth="1.6" />
            <text x="385" y="92" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="700">UC-1: Supply Repo Specs</text>
            <text x="385" y="108" textAnchor="middle" fill="#a5b4fc" fontSize="10">or Docker Image Parameters</text>

            <ellipse cx="385" cy="176" rx="138" ry="30" fill="#172554" stroke="#8b5cf6" strokeWidth="1.6" />
            <text x="385" y="172" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="700">UC-2: Generate Task Package</text>
            <text x="385" y="188" textAnchor="middle" fill="#ddd6fe" fontSize="10">&amp; Reference Tests (F2P / P2P)</text>

            <ellipse cx="385" cy="264" rx="138" ry="30" fill="#083344" stroke="#06b6d4" strokeWidth="1.6" />
            <text x="385" y="260" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="700">UC-3: Run Target AI Model</text>
            <text x="385" y="276" textAnchor="middle" fill="#67e8f9" fontSize="10">Inside Sandboxed Task Env</text>

            <ellipse cx="605" cy="220" rx="122" ry="30" fill="#052e16" stroke="#10b981" strokeWidth="1.6" />
            <text x="605" y="216" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="700">UC-4: Execute Sandbox</text>
            <text x="605" y="232" textAnchor="middle" fill="#6ee7b7" fontSize="10">PY / JS / TS / C++ (JsonCpp)</text>

            <ellipse cx="595" cy="126" rx="122" ry="30" fill="#052e16" stroke="#34d399" strokeWidth="1.6" />
            <text x="595" y="122" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="700">UC-5: Validate Baseline,</text>
            <text x="595" y="138" textAnchor="middle" fill="#6ee7b7" fontSize="10">Oracle Patch &amp; Mutant Kills</text>

            <ellipse cx="505" cy="368" rx="150" ry="32" fill="#29200c" stroke="#f59e0b" strokeWidth="1.6" />
            <text x="505" y="364" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="700">UC-6: Output Validated Results</text>
            <text x="505" y="380" textAnchor="middle" fill="#fcd34d" fontSize="10">Evidence JSON · Scorecards · PDF Certs</text>

            {/* Associations */}
            <line x1="114" y1="120" x2="250" y2="98" stroke="#818cf8" strokeWidth="1.6" />
            <line x1="114" y1="142" x2="250" y2="174" stroke="#818cf8" strokeWidth="1.6" />
            <line x1="114" y1="330" x2="248" y2="268" stroke="#22d3ee" strokeWidth="1.6" />

            <line x1="846" y1="170" x2="716" y2="132" stroke="#34d399" strokeWidth="1.6" />
            <line x1="846" y1="190" x2="726" y2="218" stroke="#34d3ee" strokeWidth="1.6" />
            <line x1="846" y1="360" x2="655" y2="368" stroke="#fbbf24" strokeWidth="1.6" />
            <line x1="846" y1="210" x2="650" y2="352" stroke="#34d399" strokeWidth="1.4" />

            {/* <<include>> dashed relationships */}
            <line x1="490" y1="196" x2="520" y2="208" stroke="#94a3b8" strokeWidth="1.3" strokeDasharray="4,3" />
            <line x1="490" y1="248" x2="520" y2="234" stroke="#94a3b8" strokeWidth="1.3" strokeDasharray="4,3" />
            <text x="502" y="298" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">&lt;&lt;include&gt;&gt;</text>
          </svg>
        )}

        {activeDiagram === 'architecture' && (
          <svg
            viewBox="0 0 960 430"
            className="w-full min-w-[680px] h-auto"
            role="img"
            aria-label="Coding Task Factory System Architecture Diagram"
          >
            {/* 4 Architectural Tiers */}
            <rect x="20" y="20" width="920" height="82" rx="14" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
            <text x="36" y="42" fill="#a5b4fc" fontSize="10.5" fontWeight="700" fontFamily="monospace">LAYER 1 · INPUT SPECIFICATIONS &amp; IMAGE PARAMETERS</text>
            <rect x="36" y="54" width="280" height="36" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
            <text x="50" y="76" fill="#e2e8f0" fontSize="11.5" fontWeight="600">pipeline/config.py (Repo URL · SHA · Test Cmd)</text>
            <rect x="336" y="54" width="285" height="36" rx="8" fill="#083344" stroke="#06b6d4" strokeWidth="1" />
            <text x="350" y="76" fill="#e2e8f0" fontSize="11.5" fontWeight="600">Dockerfile Params (Python 3.11 · Node · g++ JsonCpp)</text>
            <rect x="641" y="54" width="280" height="36" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
            <text x="655" y="76" fill="#e2e8f0" fontSize="11.5" fontWeight="600">React 19 Studio + Ctrl+K &amp; Wiki (/wiki)</text>

            <rect x="20" y="124" width="920" height="90" rx="14" fill="#11162b" stroke="#8b5cf6" strokeWidth="1.5" />
            <text x="36" y="146" fill="#c4b5fd" fontSize="10.5" fontWeight="700" fontFamily="monospace">LAYER 2 · TASK PACKAGE GENERATOR &amp; API ORCHESTRATION</text>
            <rect x="36" y="158" width="290" height="42" rx="8" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" />
            <text x="50" y="177" fill="#ffffff" fontSize="11.5" fontWeight="700">orchestrator.py &amp; repo_analyzer.py</text>
            <text x="50" y="192" fill="#cbd5e1" fontSize="10">AST analysis · Pinned commit checkout</text>
            <rect x="342" y="158" width="285" height="42" rx="8" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" />
            <text x="356" y="177" fill="#ffffff" fontSize="11.5" fontWeight="700">package_builder.py (Harbor 0.25)</text>
            <text x="356" y="192" fill="#cbd5e1" fontSize="10">instruction.md · reference tests · oracle patch</text>
            <rect x="643" y="158" width="278" height="42" rx="8" fill="#0f293a" stroke="#38bdf8" strokeWidth="1" />
            <text x="657" y="177" fill="#ffffff" fontSize="11.5" fontWeight="700">FastAPI Zero-Trust Backend</text>
            <text x="657" y="192" fill="#cbd5e1" fontSize="10">Auth JWT · Challenge Bank · AI Generator</text>

            <rect x="20" y="236" width="920" height="84" rx="14" fill="#091d1c" stroke="#10b981" strokeWidth="1.5" />
            <text x="36" y="258" fill="#6ee7b7" fontSize="10.5" fontWeight="700" fontFamily="monospace">LAYER 3 · AI MODEL RUNNER &amp; MULTI-LANGUAGE SANDBOX</text>
            <rect x="36" y="270" width="420" height="38" rx="8" fill="#052e16" stroke="#34d399" strokeWidth="1" />
            <text x="50" y="293" fill="#ffffff" fontSize="11.5" fontWeight="600">Target AI Models (Gemini / Frontier Agents) Trial Loop</text>
            <rect x="476" y="270" width="445" height="38" rx="8" fill="#052e16" stroke="#34d399" strokeWidth="1" />
            <text x="490" y="293" fill="#d1fae5" fontSize="11.5" fontWeight="600">code_runner.py: Python 3.11 · Node JS/TS · C++20 + JsonCpp</text>

            <rect x="20" y="342" width="920" height="72" rx="14" fill="#1b1509" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="36" y="364" fill="#fcd34d" fontSize="10.5" fontWeight="700" fontFamily="monospace">LAYER 4 · VALIDATED RESULTS &amp; ARTIFACTS</text>
            <rect x="36" y="374" width="885" height="28" rx="8" fill="#271d0b" stroke="#fbbf24" strokeWidth="1" />
            <text x="50" y="392" fill="#fef3c7" fontSize="11.5" fontWeight="600">
              validator.py &amp; mutation_tester.py → Baseline 0.0 · Oracle 1.0 · 100% Mutant Kill → validation_evidence/ &amp; SHA-256 PDFs
            </text>
          </svg>
        )}
      </div>
    </div>
  );
};
