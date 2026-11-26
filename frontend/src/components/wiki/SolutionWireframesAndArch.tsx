import React, { useState } from 'react';
import {
  CheckCircle2,
  FileCode2,
  FolderTree,
  Layers,
  LayoutDashboard,
  Play,
  Terminal,
} from 'lucide-react';

type MockTab = 'architecture' | 'cli' | 'web';
type CliStep = 'trigger' | 'inspect' | 'report';
type WebScreen = 'trigger' | 'inspector' | 'reports';
type PackageFileKey =
  | 'instruction.md'
  | 'task.toml'
  | 'environment/Dockerfile'
  | 'tests/test_outputs.py'
  | 'solution/solve.sh';

const PACKAGE_FILES: Record<
  PackageFileKey,
  { badge: string; lines: string[]; note: string }
> = {
  'instruction.md': {
    badge: 'Harbor 0.25 Prompt Spec',
    note: 'Zero solution leakage · verified clear acceptance criteria',
    lines: [
      '# Feature: Group Command Aliases in Click',
      '',
      'Extend click.Group and click.Group.command() to accept an',
      'optional `aliases: list[str]` sequence so registered alias',
      'names resolve cleanly during CLI dispatch and appear inside',
      '--help command listings without altering existing behavior.',
    ],
  },
  'task.toml': {
    badge: 'Schema Config · Valid ✓',
    note: 'Resource bounds & deterministic runner settings',
    lines: [
      'version = "0.25"',
      '[task]',
      'id = "click-feature-command-aliases"',
      'language = "python"',
      'timeout_sec = 180',
      'max_memory_mb = 2048',
    ],
  },
  'environment/Dockerfile': {
    badge: 'Container Parameters',
    note: 'Pinned commit 934813e · Python 3.11 + C++20 JsonCpp',
    lines: [
      'FROM python:3.11-slim',
      'RUN apt-get update && apt-get install -y git g++ cmake',
      'WORKDIR /app',
      'COPY click_repo /app',
      'RUN git checkout 934813e4d421071a1b3db3973c02fe2721359a6e',
      'RUN pip install -e . pytest',
    ],
  },
  'tests/test_outputs.py': {
    badge: 'Reference F2P + P2P Suite',
    note: 'Fails on baseline (0.0) · Passes on oracle (1.0) · Kills 2/2 mutants',
    lines: [
      'from click.testing import CliRunner',
      'import click',
      '',
      'def test_group_command_alias_dispatch():',
      '    @click.group()',
      '    def cli(): pass',
      '    @cli.command(aliases=["ls", "list"])',
      '    def show(): click.echo("ok")',
      '    assert CliRunner().invoke(cli, ["ls"]).output == "ok\\n"',
    ],
  },
  'solution/solve.sh': {
    badge: 'Oracle Reference Patch',
    note: 'Verified 100% pytest pass + 0 regressions',
    lines: [
      '#!/usr/bin/env bash',
      'set -euo pipefail',
      'git apply /solution/command_aliases.patch',
      'pytest -q tests/test_command_aliases.py',
    ],
  },
};

export const SolutionWireframesAndArch: React.FC<{ defaultTab?: MockTab }> = ({
  defaultTab = 'architecture',
}) => {
  const [activeTab, setActiveTab] = useState<MockTab>(defaultTab);
  const [cliStep, setCliStep] = useState<CliStep>('trigger');
  const [webScreen, setWebScreen] = useState<WebScreen>('trigger');
  const [selectedFile, setSelectedFile] = useState<PackageFileKey>('tests/test_outputs.py');
  const [pipelineTriggered, setPipelineTriggered] = useState(false);

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[#070B16] overflow-hidden shadow-xl">
      {/* Header Switcher */}
      <div className="px-4 py-3.5 sm:px-6 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Proposed Solution Architecture &amp; Dual-Interface Wireframes
          </div>
          <p className="text-xs text-slate-400">
            Lightweight CLI &amp; Web Dashboard to trigger generation pipelines, inspect task packages, and view evaluation reports.
          </p>
        </div>

        <div className="flex overflow-x-auto no-scrollbar items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          {[
            { id: 'architecture' as const, label: 'Solution Architecture', icon: Layers },
            { id: 'cli' as const, label: 'CLI Wireframe', icon: Terminal },
            { id: 'web' as const, label: 'Web Dashboard Mockup', icon: LayoutDashboard },
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
                    ? 'bg-cyan-600 text-white shadow'
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

      {/* Body */}
      <div className="p-4 sm:p-6">
        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <div className="overflow-x-auto custom-scrollbar">
              <svg
                viewBox="0 0 960 490"
                className="w-full min-w-[680px] h-auto"
                role="img"
                aria-label="Architecture Diagram of the Proposed CLI and Web Dashboard Solution"
              >
                <defs>
                  <marker id="sol-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                  <marker id="sol-arr-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
                  </marker>
                </defs>

                {/* Layer 1: Dual Interfaces */}
                <rect x="16" y="14" width="928" height="92" rx="14" fill="#0b1124" stroke="#6366f1" strokeWidth="1.5" />
                <text x="32" y="34" fill="#a5b4fc" fontSize="10" fontWeight="700" fontFamily="monospace">
                  1 · LIGHTWEIGHT CLI &amp; WEB DASHBOARD INTERFACES
                </text>
                <rect x="32" y="44" width="435" height="50" rx="9" fill="#131b36" stroke="#818cf8" strokeWidth="1.1" />
                <text x="46" y="65" fill="#ffffff" fontSize="12.5" fontWeight="700">Lightweight CLI (Terminal / CI)</text>
                <text x="46" y="83" fill="#a5b4fc" fontSize="10.5" fontFamily="monospace">
                  run_factory.py · validate_tasks.py · run_mutation_testing.py
                </text>
                <rect x="493" y="44" width="435" height="50" rx="9" fill="#0c1f33" stroke="#22d3ee" strokeWidth="1.1" />
                <text x="507" y="65" fill="#ffffff" fontSize="12.5" fontWeight="700">Web Dashboard UI (React 19 + Monaco Studio)</text>
                <text x="507" y="83" fill="#67e8f9" fontSize="10.5" fontFamily="monospace">
                  Trigger Pipelines · Inspect Task Packages · View Eval Reports
                </text>

                <path d="M 250 106 L 250 128" stroke="#38bdf8" strokeWidth="1.8" markerEnd="url(#sol-arr)" />
                <path d="M 710 106 L 710 128" stroke="#38bdf8" strokeWidth="1.8" markerEnd="url(#sol-arr)" />

                {/* Layer 2: Control Plane */}
                <rect x="16" y="132" width="928" height="84" rx="14" fill="#11162b" stroke="#8b5cf6" strokeWidth="1.5" />
                <text x="32" y="152" fill="#c4b5fd" fontSize="10" fontWeight="700" fontFamily="monospace">
                  2 · API GATEWAY &amp; PIPELINE CONTROL PLANE
                </text>
                <rect x="32" y="162" width="290" height="42" rx="8" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" />
                <text x="44" y="180" fill="#ffffff" fontSize="12" fontWeight="700">FastAPI Zero-Trust Server</text>
                <text x="44" y="196" fill="#cbd5e1" fontSize="10" fontFamily="monospace">JWT Auth · /api/challenges · /run-code</text>

                <rect x="336" y="162" width="290" height="42" rx="8" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" />
                <text x="348" y="180" fill="#ffffff" fontSize="12" fontWeight="700">Pipeline Orchestrator</text>
                <text x="348" y="196" fill="#cbd5e1" fontSize="10" fontFamily="monospace">pipeline/config.py · orchestrator.py</text>

                <rect x="640" y="162" width="288" height="42" rx="8" fill="#172554" stroke="#38bdf8" strokeWidth="1" />
                <text x="652" y="180" fill="#ffffff" fontSize="12" fontWeight="700">Package Inspector &amp; Linter</text>
                <text x="652" y="196" fill="#cbd5e1" fontSize="10" fontFamily="monospace">Harbor 0.25 schema · zero-leak checks</text>

                <path d="M 260 216 L 260 240" stroke="#38bdf8" strokeWidth="1.8" markerEnd="url(#sol-arr)" />
                <path d="M 700 216 L 700 240" stroke="#34d399" strokeWidth="1.8" markerEnd="url(#sol-arr-g)" />

                {/* Layer 3: Task Synthesis + Execution Sandbox */}
                <rect x="16" y="244" width="454" height="122" rx="14" fill="#0b192c" stroke="#06b6d4" strokeWidth="1.5" />
                <text x="32" y="264" fill="#67e8f9" fontSize="10" fontWeight="700" fontFamily="monospace">
                  3A · REPO / IMAGE TO TASK PACKAGE GENERATOR
                </text>
                <rect x="32" y="276" width="422" height="76" rx="9" fill="#060d1c" stroke="#22d3ee" strokeWidth="1" />
                <text x="46" y="297" fill="#ffffff" fontSize="12" fontWeight="700">RepoAnalyzer &amp; PackageBuilder (pipeline/)</text>
                <text x="46" y="316" fill="#cbd5e1" fontSize="10.5">• Parses repo URL / SHA or Dockerfile image params</text>
                <text x="46" y="334" fill="#34d399" fontSize="10.5">• Outputs instruction.md, task.toml, tests/ (F2P+P2P) &amp; patch</text>

                <path d="M 470 305 L 486 305" stroke="#34d399" strokeWidth="2" markerEnd="url(#sol-arr-g)" />

                <rect x="490" y="244" width="454" height="122" rx="14" fill="#081d1a" stroke="#10b981" strokeWidth="1.5" />
                <text x="506" y="264" fill="#6ee7b7" fontSize="10" fontWeight="700" fontFamily="monospace">
                  3B · TARGET AI &amp; ISOLATED EXECUTION SANDBOX
                </text>
                <rect x="506" y="276" width="422" height="76" rx="9" fill="#041510" stroke="#34d399" strokeWidth="1" />
                <text x="520" y="297" fill="#ffffff" fontSize="12" fontWeight="700">Target AI Trial Harness &amp; Multi-Lang Sandbox</text>
                <text x="520" y="316" fill="#d1fae5" fontSize="10.5">• Evaluates target LLMs + Baseline (nop) vs Oracle patch</text>
                <text x="520" y="334" fill="#67e8f9" fontSize="10.5">• code_runner.py: Python 3.11 · Node JS/TS · C++20 JsonCpp</text>

                <path d="M 480 366 L 480 390" stroke="#fbbf24" strokeWidth="1.8" markerEnd="url(#sol-arr)" />

                {/* Layer 4: Validated Results & Report Store */}
                <rect x="16" y="394" width="928" height="82" rx="14" fill="#181308" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="32" y="414" fill="#fcd34d" fontSize="10" fontWeight="700" fontFamily="monospace">
                  4 · EVALUATION REPORTS, MUTATION EVIDENCE &amp; STORAGE
                </text>
                <rect x="32" y="424" width="896" height="40" rx="8" fill="#271d0b" stroke="#fbbf24" strokeWidth="1" />
                <text x="48" y="448" fill="#fef3c7" fontSize="11.5" fontWeight="600">
                  validator.py + mutation_tester.py → validation_evidence/ (JSON &amp; Logs) · task_packages/ · SQLite DB · PDF/JSON Evaluation Reports
                </text>
              </svg>
            </div>
          </div>
        )}

        {activeTab === 'cli' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'trigger' as const, label: '1. Trigger Generation Pipeline' },
                { id: 'inspect' as const, label: '2. Inspect Task Package' },
                { id: 'report' as const, label: '3. View Evaluation Report' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setCliStep(btn.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                    cliStep === btn.id
                      ? 'bg-indigo-600/25 border-indigo-400 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#04070f] overflow-hidden shadow-lg">
              <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-mono text-slate-400 ml-2">
                    taskforge-cli — ~/Innodata-AI-Hackathon
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase">CLI Wireframe Preview</span>
              </div>

              <pre className="p-4 sm:p-5 text-xs font-mono leading-relaxed overflow-x-auto text-slate-200">
                {cliStep === 'trigger' &&
                  `$ python run_factory.py --repo https://github.com/pallets/click --sha 934813e\n` +
                  `[INFO] Reading pipeline/config.py (Python 3.11 / Docker + C++20 JsonCpp available)\n` +
                  `[STEP 1/3] Checking out pallets/click @ 934813e4d421071a1b3db3973c02fe2721359a6e ...\n` +
                  `[STEP 2/3] Synthesizing 5 Harbor 0.25 task packages in task_packages/ ...\n` +
                  `  + task_packages/click-feature-command-aliases\n` +
                  `  + task_packages/click-feature-json-help-export\n` +
                  `  + task_packages/click-feature-nested-envvar-prefix\n` +
                  `  + task_packages/click-feature-parameter-deprecation\n` +
                  `  + task_packages/click-feature-password-minlen-validator\n` +
                  `[STEP 3/3] Schema lint & zero-leakage gate passed (0 errors in 1.84s).`}

                {cliStep === 'inspect' &&
                  `$ tree task_packages/click-feature-command-aliases\n` +
                  `task_packages/click-feature-command-aliases/\n` +
                  `├── task.toml                # Harbor 0.25 metadata (timeout=180s, mem=2048MB)\n` +
                  `├── instruction.md           # Developer prompt & acceptance requirements\n` +
                  `├── environment/\n` +
                  `│   └── Dockerfile           # Pinned commit + test runner dependencies\n` +
                  `├── solution/\n` +
                  `│   └── solve.sh             # Reference oracle patch (verified 100% pass)\n` +
                  `└── tests/\n` +
                  `    └── test_outputs.py      # Fail-to-Pass (F2P) + Pass-to-Pass (P2P) assertions`}

                {cliStep === 'report' &&
                  `$ python validate_tasks.py && python run_mutation_testing.py\n` +
                  `===========================================================================\n` +
                  `Package                                 | Baseline | Oracle | Mutants Killed\n` +
                  `----------------------------------------+----------+--------+---------------\n` +
                  `click-feature-command-aliases           |   0.0    |  1.0   | 100% (2/2)\n` +
                  `click-feature-json-help-export          |   0.0    |  1.0   | 100% (2/2)\n` +
                  `click-feature-nested-envvar-prefix      |   0.0    |  1.0   | 100% (2/2)\n` +
                  `click-feature-parameter-deprecation     |   0.0    |  1.0   | 100% (2/2)\n` +
                  `click-feature-password-minlen-validator |   0.0    |  1.0   | 100% (2/2)\n` +
                  `===========================================================================\n` +
                  `[SAVED] validation_evidence/validation_report.json & baseline/oracle/mutation logs`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'web' && (
          <div className="rounded-xl border border-slate-800 bg-[#050812] overflow-hidden shadow-lg">
            {/* Mock Browser Top Chrome */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                  Web Dashboard Wireframe
                </span>
                <span className="hidden sm:inline">https://coding-task-factory.vercel.app/app</span>
              </div>

              <div className="flex items-center gap-1.5">
                {[
                  { id: 'trigger' as const, label: 'Trigger Pipeline' },
                  { id: 'inspector' as const, label: 'Inspect Packages' },
                  { id: 'reports' as const, label: 'Evaluation Reports' },
                ].map((scr) => (
                  <button
                    key={scr.id}
                    type="button"
                    onClick={() => setWebScreen(scr.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      webScreen === scr.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {scr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mock Screen Content */}
            <div className="p-4 sm:p-5 space-y-4">
              {webScreen === 'trigger' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <p className="text-[10px] font-mono text-slate-400 mb-1">REPOSITORY URL / LOCAL PATH</p>
                      <p className="font-mono text-white">github.com/pallets/click</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <p className="text-[10px] font-mono text-slate-400 mb-1">BASE COMMIT &amp; IMAGE PARAMS</p>
                      <p className="font-mono text-cyan-300">934813e · Python 3.11 + JsonCpp</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <p className="text-[10px] font-mono text-slate-400 mb-1">TARGET AI MODELS</p>
                      <p className="font-mono text-emerald-300">Gemini 2.5 · Baseline · Oracle</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                    <span className="text-xs text-slate-300">
                      Checks Harbor 0.25 schema, zero-leakage prompt guard, and isolated container execution bounds.
                    </span>
                    <button
                      type="button"
                      onClick={() => setPipelineTriggered((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {pipelineTriggered ? 'Pipeline Queued (5 Packages ✓)' : 'Simulate Trigger Pipeline'}
                    </button>
                  </div>

                  {pipelineTriggered && (
                    <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                      ✓ Job #TF-2026 triggered: checked out 934813e → built 5 task packages → ready for inspection &amp; grading.
                    </div>
                  )}
                </div>
              )}

              {webScreen === 'inspector' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  <div className="md:col-span-5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <p className="text-[10px] font-mono uppercase text-cyan-300 font-bold flex items-center gap-1.5 mb-2">
                      <FolderTree className="w-3.5 h-3.5" />
                      click-feature-command-aliases
                    </p>
                    {(Object.keys(PACKAGE_FILES) as PackageFileKey[]).map((fileKey) => (
                      <button
                        key={fileKey}
                        type="button"
                        onClick={() => setSelectedFile(fileKey)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg font-mono text-[11px] flex items-center gap-2 transition ${
                          selectedFile === fileKey
                            ? 'bg-cyan-600/20 border border-cyan-500/40 text-white'
                            : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                        }`}
                      >
                        <FileCode2 className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                        <span className="truncate">{fileKey}</span>
                      </button>
                    ))}
                  </div>

                  <div className="md:col-span-7 p-3.5 rounded-xl bg-[#04070f] border border-slate-800 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <span className="font-mono font-bold text-white">{selectedFile}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
                        {PACKAGE_FILES[selectedFile].badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{PACKAGE_FILES[selectedFile].note}</p>
                    <pre className="font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed pt-1">
                      {PACKAGE_FILES[selectedFile].lines.join('\n')}
                    </pre>
                  </div>
                </div>
              )}

              {webScreen === 'reports' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <p className="text-[10px] font-mono text-slate-400">BASELINE (NOP)</p>
                      <p className="text-lg font-extrabold font-mono text-rose-400 mt-0.5">0.0 / 1.0</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <p className="text-[10px] font-mono text-slate-400">ORACLE PASS</p>
                      <p className="text-lg font-extrabold font-mono text-emerald-400 mt-0.5">1.0 / 1.0</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <p className="text-[10px] font-mono text-slate-400">MUTANT KILL</p>
                      <p className="text-lg font-extrabold font-mono text-cyan-300 mt-0.5">100% (10/10)</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <p className="text-[10px] font-mono text-slate-400">ARTIFACTS</p>
                      <p className="text-sm font-bold text-amber-300 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        JSON + PDF Ready
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                    <p className="text-cyan-300 font-bold">validation_evidence/validation_report.json</p>
                    <p>• click-feature-command-aliases · Baseline: FAIL (0.0) · Oracle: PASS (1.0) · Mutants: 2/2</p>
                    <p>• click-feature-json-help-export · Baseline: FAIL (0.0) · Oracle: PASS (1.0) · Mutants: 2/2</p>
                    <p>• click-feature-nested-envvar-prefix · Baseline: FAIL (0.0) · Oracle: PASS (1.0) · Mutants: 2/2</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
