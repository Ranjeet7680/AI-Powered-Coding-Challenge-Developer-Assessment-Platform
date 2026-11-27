import React from 'react';
import { Cloud, ShieldAlert } from 'lucide-react';

interface ExtraWikiDiagramProps {
  variant: 'deployment' | 'mutation';
}

export const ExtraWikiDiagram: React.FC<ExtraWikiDiagramProps> = ({ variant }) => {
  if (variant === 'deployment') {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#141415] overflow-hidden">
        <div className="px-4 py-3.5 sm:px-6 border-b border-white/[0.08] bg-[#0f0f10] flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#e5a00d] font-medium">
              <Cloud className="w-3.5 h-3.5" strokeWidth={1.5} />
              Multi-environment deployment, C++20 JsonCpp &amp; CI/CD architecture
            </div>
            <p className="text-xs text-[#85858b]">
              Unified delivery across Local/Docker (Python + Node + C++20 JsonCpp), GitHub Actions CI + Wiki Sync, and Vercel Production.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 overflow-x-auto custom-scrollbar">
          <svg
            viewBox="0 0 960 320"
            className="w-full min-w-[660px] h-auto"
            role="img"
            aria-label="Multi-Environment Deployment and CI/CD Architecture Diagram"
          >
            <defs>
              <marker id="dep-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
              </marker>
            </defs>

            <rect x="20" y="24" width="280" height="272" rx="14" fill="#0b1124" stroke="#6366f1" strokeWidth="1.5" />
            <text x="36" y="48" fill="#a5b4fc" fontSize="10.5" fontWeight="700" fontFamily="monospace">1 · LOCAL / DOCKER CONTAINER</text>
            <rect x="36" y="64" width="248" height="62" rx="9" fill="#131b36" stroke="#818cf8" strokeWidth="1" />
            <text x="50" y="86" fill="#ffffff" fontSize="12" fontWeight="700">Dockerfile + Ubuntu Runtime</text>
            <text x="50" y="106" fill="#cbd5e1" fontSize="10.5">g++ C++20 · cmake · Python 3.11</text>

            <rect x="36" y="140" width="248" height="68" rx="9" fill="#06281c" stroke="#10b981" strokeWidth="1" />
            <text x="50" y="162" fill="#6ee7b7" fontSize="12" fontWeight="700">Vendored JsonCpp + w64devkit</text>
            <text x="50" y="180" fill="#d1fae5" fontSize="10">backend/vendor/jsoncpp/jsoncpp.cpp</text>
            <text x="50" y="196" fill="#94a3b8" fontSize="10">GCC 16.2.0 static libjsoncpp.a (Win)</text>

            <rect x="36" y="222" width="248" height="58" rx="9" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <text x="50" y="244" fill="#ffffff" fontSize="11.5" fontWeight="700">Local CLI &amp; Dev Servers</text>
            <text x="50" y="262" fill="#94a3b8" fontSize="10">uvicorn · vite dev · run_factory.py</text>

            <path d="M 300 160 L 336 160" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#dep-arr)" />

            <rect x="342" y="24" width="280" height="272" rx="14" fill="#0c1b29" stroke="#06b6d4" strokeWidth="1.5" />
            <text x="358" y="48" fill="#67e8f9" fontSize="10.5" fontWeight="700" fontFamily="monospace">2 · GITHUB ACTIONS CI &amp; WIKI</text>
            <rect x="358" y="64" width="248" height="72" rx="9" fill="#082438" stroke="#22d3ee" strokeWidth="1" />
            <text x="372" y="86" fill="#ffffff" fontSize="12" fontWeight="700">.github/workflows/ci.yml</text>
            <text x="372" y="105" fill="#cbd5e1" fontSize="10.5">• g++ --version + pytest (15/15 PASS)</text>
            <text x="372" y="122" fill="#34d399" fontSize="10.5">• oxlint (0 warn) + vite build check</text>

            <rect x="358" y="150" width="248" height="64" rx="9" fill="#082438" stroke="#22d3ee" strokeWidth="1" />
            <text x="372" y="172" fill="#ffffff" fontSize="12" fontWeight="700">Harbor &amp; Mutation CI</text>
            <text x="372" y="191" fill="#cbd5e1" fontSize="10.5">Baseline 0.0 · Oracle 1.0 · 100% Kill</text>

            <rect x="358" y="228" width="248" height="52" rx="9" fill="#0f172a" stroke="#6366f1" strokeWidth="1" />
            <text x="372" y="250" fill="#a5b4fc" fontSize="11.5" fontWeight="700">Live GitHub .wiki.git Sync</text>
            <text x="372" y="266" fill="#94a3b8" fontSize="10">Mirrors wiki/*.md + raw SVG assets</text>

            <path d="M 622 160 L 658 160" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#dep-arr)" />

            <rect x="664" y="24" width="276" height="272" rx="14" fill="#0a1814" stroke="#10b981" strokeWidth="1.5" />
            <text x="680" y="48" fill="#6ee7b7" fontSize="10.5" fontWeight="700" fontFamily="monospace">3 · VERCEL CLOUD PRODUCTION</text>
            <rect x="680" y="64" width="244" height="68" rx="9" fill="#06281c" stroke="#34d399" strokeWidth="1" />
            <text x="694" y="86" fill="#ffffff" fontSize="12" fontWeight="700">Edge Static SPA (frontend/dist)</text>
            <text x="694" y="106" fill="#d1fae5" fontSize="10.5">React 19 + Monaco + Interactive Wiki</text>

            <rect x="680" y="146" width="244" height="68" rx="9" fill="#06281c" stroke="#34d399" strokeWidth="1" />
            <text x="694" y="168" fill="#ffffff" fontSize="12" fontWeight="700">Serverless Python API</text>
            <text x="694" y="188" fill="#d1fae5" fontSize="10.5">/api/index.py · ReportLab PDFs · JWT</text>

            <rect x="680" y="228" width="244" height="52" rx="9" fill="#181308" stroke="#f59e0b" strokeWidth="1" />
            <text x="694" y="250" fill="#fcd34d" fontSize="11.5" fontWeight="700">coding-task-factory.vercel.app</text>
            <text x="694" y="266" fill="#94a3b8" fontSize="10">/api/health + /verify/:id + /wiki</text>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#141415] overflow-hidden">
      <div className="px-4 py-3.5 sm:px-6 border-b border-white/[0.08] bg-[#0f0f10] flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#e5a00d] font-medium">
            <ShieldAlert className="w-3.5 h-3.5" strokeWidth={1.5} />
            Harbor 0.25 mutation testing &amp; zero-leakage validation matrix
          </div>
          <p className="text-xs text-[#85858b]">
            End-to-end integrity pipeline guaranteeing nop = 0.0, oracle = 1.0, 0 upstream regressions, and 100% mutant detection.
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 overflow-x-auto custom-scrollbar">
        <svg
          viewBox="0 0 960 320"
          className="w-full min-w-[660px] h-auto"
          role="img"
          aria-label="Harbor 0.25 Mutation Testing and Zero-Leakage Validation Matrix Flow"
        >
          <defs>
            <marker id="mut-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
            </marker>
            <marker id="mut-arr-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
            </marker>
          </defs>

          <rect x="20" y="42" width="190" height="225" rx="14" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
          <text x="34" y="66" fill="#a5b4fc" fontSize="10" fontWeight="700" fontFamily="monospace">GATE 1 · SCHEMA &amp; LEAK</text>
          <text x="34" y="92" fill="#ffffff" fontSize="13" fontWeight="700">Task Package Audit</text>
          <text x="34" y="114" fill="#cbd5e1" fontSize="10.5">• Validate task.toml (0.25)</text>
          <text x="34" y="134" fill="#cbd5e1" fontSize="10.5">• Scan instruction.md</text>
          <text x="34" y="154" fill="#cbd5e1" fontSize="10.5">  (0 oracle spoilers)</text>
          <text x="34" y="176" fill="#34d399" fontSize="10.5">• Inspect Dockerfile</text>
          <text x="34" y="196" fill="#94a3b8" fontSize="10.5">• Pin commit 934813e</text>
          <text x="34" y="238" fill="#a5b4fc" fontSize="10" fontFamily="monospace">0 Lint Errors</text>

          <path d="M 210 110 L 252 80" stroke="#fbbf24" strokeWidth="1.8" markerEnd="url(#mut-arr)" />
          <path d="M 210 180 L 252 210" stroke="#fbbf24" strokeWidth="1.8" markerEnd="url(#mut-arr)" />

          <rect x="258" y="34" width="220" height="98" rx="12" fill="#211118" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="274" y="56" fill="#fda4af" fontSize="10" fontWeight="700" fontFamily="monospace">GATE 2 · BASELINE (NOP)</text>
          <text x="274" y="78" fill="#ffffff" fontSize="12.5" fontWeight="700">Clean Base Click Repo</text>
          <text x="274" y="98" fill="#cbd5e1" fontSize="10.5">Feature F2P Tests MUST FAIL</text>
          <text x="274" y="116" fill="#fda4af" fontSize="11" fontWeight="700">Reward = 0.0 · 0 Regressions</text>

          <rect x="258" y="168" width="220" height="98" rx="12" fill="#071f17" stroke="#10b981" strokeWidth="1.5" />
          <text x="274" y="190" fill="#6ee7b7" fontSize="10" fontWeight="700" fontFamily="monospace">GATE 3 · ORACLE (SOLVE.SH)</text>
          <text x="274" y="212" fill="#ffffff" fontSize="12.5" fontWeight="700">Apply Oracle Solution Patch</text>
          <text x="274" y="232" fill="#cbd5e1" fontSize="10.5">Feature F2P + P2P MUST PASS</text>
          <text x="274" y="250" fill="#34d399" fontSize="11" fontWeight="700">Reward = 1.0 · 0 Regressions</text>

          <path d="M 478 83 L 520 120" stroke="#34d399" strokeWidth="1.8" markerEnd="url(#mut-arr-g)" />
          <path d="M 478 217 L 520 175" stroke="#34d399" strokeWidth="1.8" markerEnd="url(#mut-arr-g)" />

          <rect x="526" y="42" width="210" height="225" rx="14" fill="#1b1509" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="542" y="66" fill="#fcd34d" fontSize="10" fontWeight="700" fontFamily="monospace">GATE 4 · MUTATION SWEEP</text>
          <text x="542" y="92" fill="#ffffff" fontSize="13" fontWeight="700">run_mutation_testing.py</text>
          <text x="542" y="114" fill="#cbd5e1" fontSize="10.5">• Inject MUT-1.1 .. MUT-5.2</text>
          <text x="542" y="134" fill="#cbd5e1" fontSize="10.5">• Faulty guards &amp; bypasses</text>
          <text x="542" y="154" fill="#cbd5e1" fontSize="10.5">• Execute test_outputs.py</text>
          <text x="542" y="176" fill="#fde68a" fontSize="10.5">• Every mutant MUST FAIL</text>
          <text x="542" y="220" fill="#34d399" fontSize="12" fontWeight="800">10/10 Mutants Killed (100%)</text>

          <path d="M 736 154 L 774 154" stroke="#34d399" strokeWidth="2" markerEnd="url(#mut-arr-g)" />

          <rect x="780" y="64" width="160" height="180" rx="14" fill="#06281c" stroke="#34d399" strokeWidth="1.6" />
          <text x="794" y="88" fill="#6ee7b7" fontSize="10" fontWeight="700" fontFamily="monospace">EVIDENCE OUTPUT</text>
          <text x="794" y="112" fill="#ffffff" fontSize="12.5" fontWeight="700">Validated Artifacts</text>
          <text x="794" y="136" fill="#cbd5e1" fontSize="10">validation_report.json</text>
          <text x="794" y="156" fill="#cbd5e1" fontSize="10">validation_summary.md</text>
          <text x="794" y="176" fill="#cbd5e1" fontSize="10">baseline_logs/</text>
          <text x="794" y="196" fill="#cbd5e1" fontSize="10">oracle_logs/</text>
          <text x="794" y="216" fill="#cbd5e1" fontSize="10">mutation_logs/</text>
        </svg>
      </div>
    </div>
  );
};
