import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { PipelineDiagrams } from '../components/wiki/PipelineDiagrams';
import { SolutionWireframesAndArch } from '../components/wiki/SolutionWireframesAndArch';
import { ChallengeExecutionDiagrams } from '../components/wiki/ChallengeExecutionDiagrams';
import { ExtraWikiDiagram } from '../components/wiki/ExtraWikiDiagrams';
import { MLWikiBigDiagrams } from '../components/wiki/MLWikiBigDiagrams';
import {
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  FileText,
  GitBranch,
  Layers,
  LayoutDashboard,
  Lock,
  Search,
  Share2,
  ShieldCheck,
  Terminal,
  Workflow,
} from 'lucide-react';

type WikiSectionId =
  | 'overview'
  | 'wireframes-architecture'
  | 'process-flow'
  | 'architecture'
  | 'challenge-bank'
  | 'ml-lms'
  | 'security-credentials'
  | 'taskforge';

interface WikiNavItem {
  id: WikiSectionId;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const WIKI_NAV: WikiNavItem[] = [
  {
    id: 'overview',
    title: 'Platform overview & ecosystem',
    shortTitle: 'Overview & map',
    subtitle: 'End-to-end architecture & dual-engine workflow',
    icon: BookOpen,
  },
  {
    id: 'wireframes-architecture',
    title: 'Proposed solution architecture & CLI / web wireframes',
    shortTitle: 'CLI & web wireframes',
    subtitle: 'Trigger pipelines, inspect packages, view evaluation reports & architecture',
    icon: LayoutDashboard,
  },
  {
    id: 'process-flow',
    title: 'Process flow, use-case & architecture diagrams',
    shortTitle: 'Process flow & UML',
    subtitle: 'Repo specs/image params -> task packages -> target AI -> validated output',
    icon: Workflow,
  },
  {
    id: 'architecture',
    title: 'System architecture & ER schema',
    shortTitle: 'Architecture & DB',
    subtitle: 'React 19 SPA, FastAPI routers, SQLite & Vercel runtime',
    icon: Database,
  },
  {
    id: 'challenge-bank',
    title: '368+ challenge bank & sandbox',
    shortTitle: 'Challenges & runner',
    subtitle: '10 CS/ML domains, PY/JS/TS/C++ execution & AI Copilot',
    icon: Code2,
  },
  {
    id: 'ml-lms',
    title: '5 Academy LMS Tracks (230 Lectures) + AI Proctoring',
    shortTitle: 'Academy LMS',
    subtitle: 'ML, Stanford DL, Data Science, IITM Business & Agentic AI tracks',
    icon: BrainCircuit,
  },
  {
    id: 'security-credentials',
    title: 'Zero-trust security, PDF & social studio',
    shortTitle: 'Security & PDFs',
    subtitle: 'PBKDF2 100k, HS256 JWT, ReportLab PDFs & social share studio',
    icon: ShieldCheck,
  },
  {
    id: 'taskforge',
    title: 'Track 1: TaskForge Harbor 0.25 pipeline',
    shortTitle: 'TaskForge Harbor',
    subtitle: 'Autonomous Click feature synthesis & 100% mutation kill',
    icon: GitBranch,
  },
];

const GITHUB_WIKI_URL =
  'https://github.com/Ranjeet7680/AI-Powered-Coding-Challenge-Developer-Assessment-Platform/tree/main/wiki';

export const WikiPage: React.FC = () => {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const [filterQuery, setFilterQuery] = useState('');

  const activeSection: WikiSectionId = useMemo(() => {
    const valid = WIKI_NAV.find((item) => item.id === section);
    return valid ? valid.id : 'overview';
  }, [section]);

  const filteredNav = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return WIKI_NAV;
    return WIKI_NAV.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [filterQuery]);

  const currentMeta = WIKI_NAV.find((item) => item.id === activeSection) || WIKI_NAV[0];

  return (
    <div className="min-h-screen bg-[#141415] text-[#ededed] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Banner */}
          <div className="rounded-2xl p-6 sm:p-8 bg-[#19191b] border border-white/[0.08]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="text-xs font-mono text-[#e5a00d]">
                  Technical documentation · architecture blueprint
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#ededed] tracking-tight">
                  Coding Task Factory Wiki
                </h1>
                <p className="text-sm text-[#a1a1a6] leading-relaxed">
                  Interactive system documentation covering the React 19 + Monaco IDE frontend,
                  FastAPI zero-trust backend, 368+ multi-language challenge bank, ReportLab vector
                  PDF credential engine, and Harbor 0.25 TaskForge pipeline.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href={GITHUB_WIKI_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium text-[#ededed] bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
                  GitHub Markdown wiki
                </a>
                <Link
                  to="/app/challenges"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
                >
                  Launch workspace
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>

          {/* Main 2-Column Wiki Shell */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-24">
              <div className="p-4 rounded-xl bg-[#19191b] border border-white/[0.08] space-y-3">
                <div className="relative">
                  <Search
                    className="w-3.5 h-3.5 text-[#85858b] absolute left-3 top-1/2 -translate-y-1/2"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter wiki topics..."
                    className="w-full rounded-lg bg-[#141415] border border-white/[0.08] pl-8 pr-3 py-2 text-xs text-[#ededed] placeholder:text-[#85858b] focus:outline-none focus:border-[#e5a00d]/60"
                  />
                </div>

                <nav className="space-y-1">
                  {filteredNav.map((item) => {
                    const Icon = item.icon;
                    const active = item.id === activeSection;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate(`/wiki/${item.id}`)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 ${
                          active
                            ? 'bg-[#222225] border-white/[0.12] text-[#ededed]'
                            : 'bg-transparent border-transparent hover:bg-[#141415] text-[#a1a1a6]'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            active ? 'text-[#e5a00d]' : 'text-[#85858b]'
                          }`}
                          strokeWidth={1.5}
                        />
                        <div>
                          <p className="text-xs font-medium leading-snug">{item.shortTitle}</p>
                          <p className="text-[11px] text-[#85858b] line-clamp-2 mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 rounded-xl bg-[#19191b] border border-white/[0.08] space-y-1.5 text-xs">
                <p className="font-medium text-[#ededed] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#4cc38a]" strokeWidth={1.5} />
                  Reference demo credentials
                </p>
                <p className="text-[#a1a1a6] font-mono text-[11px]">
                  developer@codingtaskfactory.io
                </p>
                <p className="text-[#85858b] font-mono text-[11px]">Developer@2026!</p>
              </div>
            </aside>

            {/* Active Documentation Body */}
            <article className="lg:col-span-8 xl:col-span-9 p-6 sm:p-8 rounded-2xl bg-[#19191b] border border-white/[0.08] space-y-8">
              <div className="border-b border-white/[0.08] pb-5">
                <p className="text-xs font-mono text-[#e5a00d] mb-1">
                  Wiki / {currentMeta.shortTitle}
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#ededed] tracking-tight">
                  {currentMeta.title}
                </h2>
                <p className="text-sm text-[#a1a1a6] mt-1">{currentMeta.subtitle}</p>
              </div>

              {activeSection === 'overview' && (
                <div className="space-y-6">
                  {/* Unified Platform Architecture Flow */}
                  <div className="p-5 rounded-xl bg-[#141415] border border-white/[0.08] space-y-4">
                    <h3 className="text-xs font-mono text-[#a1a1a6]">
                      Unified platform architecture flow
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
                      <div className="p-4 rounded-lg bg-[#19191b] border border-white/[0.08] space-y-1.5">
                        <span className="font-mono text-[11px] text-[#e5a00d]">
                          01 · Client layer
                        </span>
                        <p className="font-medium text-[#ededed]">React 19 + Monaco IDE</p>
                        <p className="text-[#85858b]">
                          Lazy-loaded routes, Ctrl+K global search, Canvas social card PNG exporter, public /verify view.
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#19191b] border border-white/[0.08] space-y-1.5">
                        <span className="font-mono text-[11px] text-[#e5a00d]">
                          02 · API gateway
                        </span>
                        <p className="font-medium text-[#ededed]">FastAPI zero-trust API</p>
                        <p className="text-[#85858b]">
                          PBKDF2 100k auth, HS256 JWTs, rate lockouts, /api/challenges/stats, Vercel serverless adapter.
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#19191b] border border-white/[0.08] space-y-1.5">
                        <span className="font-mono text-[11px] text-[#e5a00d]">
                          03 · Engines
                        </span>
                        <p className="font-medium text-[#ededed]">368+ bank &amp; sandbox</p>
                        <p className="text-[#85858b]">
                          Python, Node JS/TS, C++ runners, Gemini challenge synthesizer, AST code reviewer &amp; Copilot.
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#19191b] border border-white/[0.08] space-y-1.5">
                        <span className="font-mono text-[11px] text-[#e5a00d]">
                          04 · Credentials
                        </span>
                        <p className="font-medium text-[#ededed]">ReportLab PDF &amp; Harbor</p>
                        <p className="text-[#85858b]">
                          Landscape A4 PDFs, SHA-256 verification registry, social share studio, Harbor 0.25 benchmark suite.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl bg-[#141415] border border-white/[0.08] space-y-2">
                      <Layers className="w-4 h-4 text-[#e5a00d]" strokeWidth={1.5} />
                      <h4 className="font-medium text-[#ededed] text-sm">
                        Coding Task Factory web app
                      </h4>
                      <p className="text-xs text-[#a1a1a6] leading-relaxed">
                        Full-stack coding studio combining 368+ verified multi-language challenges,
                        timed assessments, live leaderboard, video masterclasses, and verifiable credentials.
                      </p>
                    </div>
                    <div className="p-5 rounded-xl bg-[#141415] border border-white/[0.08] space-y-2">
                      <Cpu className="w-4 h-4 text-[#e5a00d]" strokeWidth={1.5} />
                      <h4 className="font-medium text-[#ededed] text-sm">
                        Track 1 TaskForge pipeline
                      </h4>
                      <p className="text-xs text-[#a1a1a6] leading-relaxed">
                        Autonomous feature-task generator anchored at pallets/click v8.1.8 (934813e),
                        validated with Harbor 0.25 linter (0 errors), 1.0 oracle pass rate, and 100% mutation kill rate.
                      </p>
                    </div>
                  </div>

                  <PipelineDiagrams defaultTab="process-flow" />

                  <SolutionWireframesAndArch defaultTab="web" />
                </div>
              )}

              {activeSection === 'wireframes-architecture' && (
                <div className="space-y-6">
                  <p className="text-sm text-[#a1a1a6] leading-relaxed">
                    Architectural blueprint and interactive interface wireframes pairing a{' '}
                    <strong className="font-medium text-[#ededed]">lightweight command-line runner</strong> (
                    <code className="font-mono text-[#ededed]">run_factory.py</code>,{' '}
                    <code className="font-mono text-[#ededed]">validate_tasks.py</code>,{' '}
                    <code className="font-mono text-[#ededed]">run_mutation_testing.py</code>) with a{' '}
                    <strong className="font-medium text-[#ededed]">Web Dashboard interface</strong> for triggering generation pipelines, inspecting Harbor 0.25 task packages, and reviewing evaluation reports.
                  </p>

                  <SolutionWireframesAndArch defaultTab="architecture" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#141415] border border-white/[0.08] space-y-1.5">
                      <p className="font-mono font-medium text-[#e5a00d]">01. Trigger pipelines</p>
                      <p className="text-[#a1a1a6] leading-relaxed">
                        Submit repository specs or Docker image params via CLI or the Web Dashboard form to synthesize Harbor task packages.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#141415] border border-white/[0.08] space-y-1.5">
                      <p className="font-mono font-medium text-[#e5a00d]">02. Inspect task packages</p>
                      <p className="text-[#a1a1a6] leading-relaxed">
                        Browse <code className="font-mono text-[#ededed]">instruction.md</code>,{' '}
                        <code className="font-mono text-[#ededed]">task.toml</code>, Dockerfiles, oracle patches, and <code className="font-mono text-[#ededed]">tests/</code> with schema verification.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#141415] border border-white/[0.08] space-y-1.5">
                      <p className="font-mono font-medium text-[#4cc38a]">03. View eval reports</p>
                      <p className="text-[#a1a1a6] leading-relaxed">
                        Inspect Baseline <code className="font-mono">0.0</code>, Oracle <code className="font-mono">1.0</code>, <code className="font-mono">100%</code> mutant kills, and JSON/PDF evidence artifacts.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'process-flow' && (
                <div className="space-y-6">
                  <p className="text-sm text-[#a1a1a6] leading-relaxed">
                    The synthesis and evaluation pipeline accepts{' '}
                    <strong className="font-medium text-[#ededed]">repository specifications</strong> (Git URL, commit SHA, language, test runner) or{' '}
                    <strong className="font-medium text-[#ededed]">container image parameters</strong> (Dockerfile base, resource caps, Python/Node/C++20 with{' '}
                    <code className="text-[#ededed] font-mono">open-source-parsers/jsoncpp</code>), synthesizes Harbor 0.25 task packages with reference tests, executes target AI coding models in isolation, and emits validated results &amp; evidence artifacts.
                  </p>

                  <PipelineDiagrams defaultTab="process-flow" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#141415] border border-white/[0.08] space-y-1.5">
                      <p className="font-mono font-medium text-[#e5a00d]">1. Ingestion specs</p>
                      <p className="text-[#a1a1a6] leading-relaxed">
                        Accepts <code className="font-mono text-[#ededed]">pipeline/config.py</code> repository metadata or custom <code className="font-mono text-[#ededed]">Dockerfile</code> image bounds.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#141415] border border-white/[0.08] space-y-1.5">
                      <p className="font-mono font-medium text-[#e5a00d]">2. Package + AI execution</p>
                      <p className="text-[#a1a1a6] leading-relaxed">
                        Builds <code className="font-mono text-[#ededed]">instruction.md</code>, reference tests (<code className="font-mono">F2P/P2P</code>), and runs target AI models &amp; baseline/oracle suites.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#141415] border border-white/[0.08] space-y-1.5">
                      <p className="font-mono font-medium text-[#4cc38a]">3. Validated outputs</p>
                      <p className="text-[#a1a1a6] leading-relaxed">
                        <code className="font-mono text-[#ededed]">validator.py</code> &amp; <code className="font-mono text-[#ededed]">mutation_tester.py</code> emit verified scorecards into <code className="font-mono">validation_evidence/</code>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'architecture' && (
                <div className="space-y-6">
                  <p className="text-sm text-[#a1a1a6] leading-relaxed">
                    Every API module resides in{' '}
                    <code className="text-[#ededed] font-mono">backend/app/routers/</code> and shares Pydantic v2 schemas and SQLAlchemy models. On startup or Vercel cold start,{' '}
                    <code className="text-[#ededed] font-mono">ensure_schema_migrations()</code> idempotently migrates SQLite columns before seeding.
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#141415]">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-[#85858b] font-mono bg-[#0f0f10]">
                          <th className="py-3 px-4 font-medium">SQLAlchemy model</th>
                          <th className="py-3 px-4 font-medium">Key columns</th>
                          <th className="py-3 px-4 font-medium">Primary endpoints</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06] text-[#a1a1a6]">
                        <tr>
                          <td className="py-3 px-4 font-mono font-medium text-[#ededed]">User</td>
                          <td className="py-3 px-4">email, hashed_password, points, streak, solved_count, gemini_api_key</td>
                          <td className="py-3 px-4 font-mono text-[#e5a00d]">/api/auth/*, /api/user/profile</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-mono font-medium text-[#ededed]">Challenge</td>
                          <td className="py-3 px-4">id, slug, difficulty, category, starter_code (4 langs), test_cases</td>
                          <td className="py-3 px-4 font-mono text-[#e5a00d]">/api/challenges, /stats, /generate-challenge</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-mono font-medium text-[#ededed]">Submission</td>
                          <td className="py-3 px-4">user_id, challenge_id, language, status, runtime_ms, ai_feedback</td>
                          <td className="py-3 px-4 font-mono text-[#e5a00d]">/api/run-code, /submit-solution, /submissions</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-mono font-medium text-[#ededed]">Certificate</td>
                          <td className="py-3 px-4">credential_id, score_percent, skills_verified, challenges_completed, credential_hash</td>
                          <td className="py-3 px-4 font-mono text-[#e5a00d]">/api/certificates, /verify, /pdf</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <ExtraWikiDiagram variant="deployment" />
                </div>
              )}

              {activeSection === 'challenge-bank' && (
                <div className="space-y-6">
                  <p className="text-sm text-[#a1a1a6] leading-relaxed">
                    <code className="text-[#ededed] font-mono">backend/app/services/challenge_bank.py</code> synthesizes 360 deterministic coding problems across 10 core domains (paired with 8 flagship challenges for 368 total), each checked against Python reference solvers and packaged with starter harnesses for Python, JavaScript, TypeScript, and C++.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
                    {[
                      'Arrays & Hashing',
                      'Strings & Parsing',
                      'Sliding Window',
                      'Stack & Queue',
                      'Graphs & BFS/DFS',
                      'Dynamic Programming',
                      'Binary Search',
                      'Math & Bitwise',
                      'Design & Systems',
                      'Machine Learning',
                    ].map((domain) => (
                      <div
                        key={domain}
                        className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] text-center"
                      >
                        <p className="font-medium text-[#ededed]">{domain}</p>
                        <p className="text-[11px] font-mono text-[#e5a00d] mt-1 tabular-nums">36+ tasks</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 rounded-xl bg-[#141415] border border-white/[0.08] space-y-2 text-xs">
                    <p className="font-medium text-[#ededed]">Multi-language execution sandbox flow</p>
                    <p className="text-[#a1a1a6] leading-relaxed">
                      Incoming code runs in isolated temporary directories via <code className="text-[#ededed] font-mono">code_runner.py</code>: Python invokes <code className="font-mono">sys.executable</code>, JavaScript executes Node <code className="font-mono">.mjs</code>, TypeScript utilizes Node <code className="font-mono">--experimental-strip-types</code>, and C++20 compiles with <code className="font-mono">g++/clang++</code> bundled with amalgamated <code className="text-[#ededed] font-mono">open-source-parsers/jsoncpp</code> (<code className="font-mono">#include &lt;json/json.h&gt;</code>).
                    </p>
                  </div>

                  <ChallengeExecutionDiagrams />
                </div>
              )}

              {activeSection === 'ml-lms' && (
                <div className="space-y-6">
                  <p className="text-sm text-[#a1a1a6] leading-relaxed">
                    Full architectural walkthrough of the{' '}
                    <strong className="font-medium text-[#ededed]">Applied ML Course LMS (106 lectures, 7 modules)</strong>,{' '}
                    <strong className="font-medium text-[#ededed]">Stanford &times; CTF Deep Learning Track (21 lectures, 4 modules)</strong>,{' '}
                    <strong className="font-medium text-[#ededed]">Python Data Science &amp; Big Data (14 lectures, 3 modules)</strong>,{' '}
                    <strong className="font-medium text-[#ededed]">IIT Madras &times; CTF Business Fundamentals for Entrepreneurs (66 lectures, 6 modules)</strong>, and{' '}
                    <strong className="font-medium text-[#ededed]">Agentic AI &amp; MCP Engineering (23 lectures, 4 modules)</strong>, including page-by-page video + quiz flow, the 4-tier{' '}
                    <code className="text-[#e5a00d] font-mono">MediaPipe</code> AI Camera Proctor engine, and FastAPI LMS credential telemetry.
                  </p>

                  <MLWikiBigDiagrams />
                </div>
              )}

              {activeSection === 'security-credentials' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl bg-[#141415] border border-white/[0.08] space-y-2.5">
                      <div className="flex items-center gap-2 text-[#ededed] font-medium text-sm">
                        <Lock className="w-4 h-4 text-[#e5a00d]" strokeWidth={1.5} />
                        Zero-trust auth pipeline
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#a1a1a6]">
                        <li>· Password policy: 10–128 chars, mixed case, digit &amp; symbol</li>
                        <li>· Salted PBKDF2-HMAC-SHA256 (100,000 rounds)</li>
                        <li>· Constant-time checks via <code className="font-mono text-[#ededed]">hmac.compare_digest</code></li>
                        <li>· 15-minute lockout shield after 5 failed logins</li>
                        <li>· Masked Gemini API keys (<code className="font-mono text-[#ededed]">gemini_api_key_preview</code>)</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-xl bg-[#141415] border border-white/[0.08] space-y-2.5">
                      <div className="flex items-center gap-2 text-[#ededed] font-medium text-sm">
                        <FileText className="w-4 h-4 text-[#e5a00d]" strokeWidth={1.5} />
                        ReportLab vector PDF &amp; verify registry
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#a1a1a6]">
                        <li>· Landscape A4 vector PDF generated live by ReportLab</li>
                        <li>· Unique SHA-256 fingerprint + 15&times;15 QR matrix</li>
                        <li>· Verified skills, score %, tasks &amp; lab hours</li>
                        <li>· Signatory block &amp; verification seal emblem</li>
                        <li>· Public endpoint at <code className="font-mono text-[#4cc38a]">/verify/:credentialId</code></li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-[#141415] border border-white/[0.08] space-y-2.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#ededed]">
                      <Share2 className="w-4 h-4 text-[#85858b]" strokeWidth={1.5} />
                      Built-in social share &amp; post studio
                    </div>
                    <p className="text-xs text-[#a1a1a6] leading-relaxed">
                      Every earned credential generates editable messages, verification links, and HTML5 Canvas PNG graphics formatted for LinkedIn (1200&times;630 PNG), Instagram (1080&times;1080 PNG), Facebook (1200&times;630 PNG), and WhatsApp (formatted summary + PDF attachment).
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'taskforge' && (
                <div className="space-y-6">
                  <p className="text-sm text-[#a1a1a6] leading-relaxed">
                    TaskForge targets <code className="text-[#ededed] font-mono">pallets/click</code> v8.1.8 (<code className="font-mono text-xs">934813e4d421071a1b3db3973c02fe2721359a6e</code>) and synthesizes 5 Harbor 0.25 feature packages spanning distinct Click subsystems with zero upstream regression failures.
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#141415]">
                    <table className="w-full text-left text-xs tabular-nums">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-[#85858b] font-mono bg-[#0f0f10]">
                          <th className="py-3 px-4 font-medium">Package ID</th>
                          <th className="py-3 px-4 font-medium">Subsystem</th>
                          <th className="py-3 px-4 font-medium text-center">Baseline</th>
                          <th className="py-3 px-4 font-medium text-center">Oracle</th>
                          <th className="py-3 px-4 font-medium text-center">Mutants killed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06] text-[#a1a1a6] font-mono">
                        <tr>
                          <td className="py-2.5 px-4 text-[#ededed]">click-feature-command-aliases</td>
                          <td className="py-2.5 px-4 font-sans">Command Dispatch (core.py)</td>
                          <td className="py-2.5 px-4 text-center text-[#e5484d]">0.0</td>
                          <td className="py-2.5 px-4 text-center text-[#4cc38a]">1.0</td>
                          <td className="py-2.5 px-4 text-center text-[#4cc38a]">100% (2/2)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-[#ededed]">click-feature-json-help-export</td>
                          <td className="py-2.5 px-4 font-sans">Help Export (core.py)</td>
                          <td className="py-2.5 px-4 text-center text-[#e5484d]">0.0</td>
                          <td className="py-2.5 px-4 text-center text-[#4cc38a]">1.0</td>
                          <td className="py-2.5 px-4 text-center text-[#4cc38a]">100% (2/2)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-[#ededed]">click-feature-nested-envvar-prefix</td>
                          <td className="py-2.5 px-4 font-sans">Context Envvars (core.py)</td>
                          <td className="py-2.5 px-4 text-center text-[#e5484d]">0.0</td>
                          <td className="py-2.5 px-4 text-center text-[#4cc38a]">1.0</td>
                          <td className="py-2.5 px-4 text-center text-[#4cc38a]">100% (2/2)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-[#ededed]">click-feature-parameter-deprecation</td>
                          <td className="py-2.5 px-4 font-sans">Param Lifecycle (core.py)</td>
                          <td className="py-2.5 px-4 text-center text-[#e5484d]">0.0</td>
                          <td className="py-2.5 px-4 text-center text-[#4cc38a]">1.0</td>
                          <td className="py-2.5 px-4 text-center text-[#4cc38a]">100% (2/2)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-[#ededed]">click-feature-password-minlen-validator</td>
                          <td className="py-2.5 px-4 font-sans">Password UI (termui.py)</td>
                          <td className="py-2.5 px-4 text-center text-[#e5484d]">0.0</td>
                          <td className="py-2.5 px-4 text-center text-[#4cc38a]">1.0</td>
                          <td className="py-2.5 px-4 text-center text-[#4cc38a]">100% (2/2)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-xl bg-[#141415] border border-white/[0.08] font-mono text-xs text-[#a1a1a6] flex flex-wrap items-center justify-between gap-2">
                    <span>python demo_walkthrough.py &amp;&amp; python run_mutation_testing.py</span>
                    <span className="inline-flex items-center gap-1.5 text-[#4cc38a] font-medium">
                      <Award className="w-4 h-4" strokeWidth={1.5} />
                      Harbor 0.25: 0 errors
                    </span>
                  </div>

                  <ExtraWikiDiagram variant="mutation" />
                </div>
              )}
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
