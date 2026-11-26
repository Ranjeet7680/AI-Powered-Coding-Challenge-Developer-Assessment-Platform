import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { PipelineDiagrams } from '../components/wiki/PipelineDiagrams';
import { SolutionWireframesAndArch } from '../components/wiki/SolutionWireframesAndArch';
import {
  ArrowRight,
  Award,
  BookOpen,
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
  Sparkles,
  Terminal,
  Workflow,
} from 'lucide-react';

type WikiSectionId =
  | 'overview'
  | 'wireframes-architecture'
  | 'process-flow'
  | 'architecture'
  | 'challenge-bank'
  | 'security-credentials'
  | 'taskforge';

interface WikiNavItem {
  id: WikiSectionId;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const WIKI_NAV: WikiNavItem[] = [
  {
    id: 'overview',
    title: 'Platform Overview & Ecosystem',
    shortTitle: 'Overview & Map',
    subtitle: 'End-to-end architecture & dual-engine workflow',
    icon: BookOpen,
  },
  {
    id: 'wireframes-architecture',
    title: 'Proposed Solution Architecture & CLI / Web Wireframes',
    shortTitle: 'CLI & Web Wireframes',
    subtitle: 'Trigger pipelines, inspect packages, view evaluation reports & solution architecture',
    icon: LayoutDashboard,
  },
  {
    id: 'process-flow',
    title: 'Process Flow, Use-Case & Architecture Diagrams',
    shortTitle: 'Process Flow & UML',
    subtitle: 'Repo specs/image params -> task packages -> target AI -> validated output',
    icon: Workflow,
  },
  {
    id: 'architecture',
    title: 'System Architecture & ER Schema',
    shortTitle: 'Architecture & DB',
    subtitle: 'React 19 SPA, FastAPI routers, SQLite & Vercel runtime',
    icon: Database,
  },
  {
    id: 'challenge-bank',
    title: '368+ Challenge Bank & Sandbox',
    shortTitle: 'Challenges & Runner',
    subtitle: '10 CS/ML domains, PY/JS/TS/C++ execution & AI Copilot',
    icon: Code2,
  },
  {
    id: 'security-credentials',
    title: 'Zero-Trust Security, PDF & Social Studio',
    shortTitle: 'Security & PDFs',
    subtitle: 'PBKDF2 100k, HS256 JWT, ReportLab PDFs & LinkedIn/IG/FB/WA',
    icon: ShieldCheck,
  },
  {
    id: 'taskforge',
    title: 'Track 1: TaskForge Harbor 0.25 Pipeline',
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
    <div className="min-h-screen bg-[#05070E] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-35 pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Animated Hero Wiki Banner */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0A1022] via-[#0B1228] to-[#070B16] border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-24 -top-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  OFFICIAL TECHNICAL WIKI &amp; ARCHITECTURE BLUEPRINT
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Coding Task Factory Wiki
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Interactive system documentation covering the React 19 + Monaco IDE frontend, FastAPI zero-trust backend, 368+ multi-language challenge bank, ReportLab vector PDF credential engine, and Harbor 0.25 TaskForge pipeline.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href={GITHUB_WIKI_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  GitHub Markdown Wiki
                </a>
                <Link
                  to="/app/challenges"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition"
                >
                  Launch Workspace
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Main 2-Column Wiki Shell */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-24">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter wiki topics..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <nav className="space-y-1.5">
                  {filteredNav.map((item) => {
                    const Icon = item.icon;
                    const active = item.id === activeSection;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/wiki/${item.id}`)}
                        className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-2.5 ${
                          active
                            ? 'bg-indigo-600/20 border-indigo-500/45 text-white shadow-md'
                            : 'bg-slate-950/50 border-transparent hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            active ? 'text-cyan-300' : 'text-slate-400'
                          }`}
                        />
                        <div>
                          <p className="text-xs font-bold leading-snug">{item.shortTitle}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2 text-xs">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Demo Credentials
                </p>
                <p className="text-slate-300 font-mono text-[11px]">
                  developer@codingtaskfactory.io
                </p>
                <p className="text-slate-400 font-mono text-[11px]">Developer@2026!</p>
              </div>
            </aside>

            {/* Active Documentation Body */}
            <article className="lg:col-span-8 xl:col-span-9 p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-8">
              <div className="border-b border-slate-800 pb-5">
                <p className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-1">
                  Wiki Section / {currentMeta.shortTitle}
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {currentMeta.title}
                </h2>
                <p className="text-sm text-slate-400 mt-1">{currentMeta.subtitle}</p>
              </div>

              {activeSection === 'overview' && (
                <div className="space-y-6">
                  {/* Visual End-to-End Architecture Flow Diagram */}
                  <div className="p-5 rounded-2xl bg-[#070B16] border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-cyan-300 font-mono uppercase tracking-wider">
                      Unified Platform Architecture Flow
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
                      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/35 space-y-1.5">
                        <span className="font-mono text-[10px] text-indigo-300 font-bold">
                          01 • CLIENT LAYER
                        </span>
                        <p className="font-bold text-white">React 19 + Monaco IDE</p>
                        <p className="text-slate-400">
                          Lazy-loaded routes, Ctrl+K global search, Canvas social card PNG exporter, public /verify view.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/35 space-y-1.5">
                        <span className="font-mono text-[10px] text-cyan-300 font-bold">
                          02 • API GATEWAY
                        </span>
                        <p className="font-bold text-white">FastAPI Zero-Trust API</p>
                        <p className="text-slate-400">
                          PBKDF2 100k auth, HS256 JWTs, rate lockouts, /api/challenges/stats, Vercel serverless adapter.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/35 space-y-1.5">
                        <span className="font-mono text-[10px] text-emerald-300 font-bold">
                          03 • ENGINES
                        </span>
                        <p className="font-bold text-white">368+ Bank &amp; Sandbox</p>
                        <p className="text-slate-400">
                          Python, Node JS/TS, C++ runners, Gemini challenge synthesizer, AST code reviewer &amp; Copilot.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/35 space-y-1.5">
                        <span className="font-mono text-[10px] text-amber-300 font-bold">
                          04 • CREDENTIALS
                        </span>
                        <p className="font-bold text-white">ReportLab PDF &amp; Harbor</p>
                        <p className="text-slate-400">
                          Landscape A4 PDFs, SHA-256 verification registry, social share studio, Harbor 0.25 benchmark suite.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <Layers className="w-5 h-5 text-indigo-400" />
                      <h4 className="font-bold text-white text-sm">Coding Task Factory Web App</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Full-stack SaaS coding studio combining 368+ verified multi-language challenges, timed assessments, live leaderboard, video masterclasses, and verifiable credentials.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <Cpu className="w-5 h-5 text-cyan-400" />
                      <h4 className="font-bold text-white text-sm">Track 1 TaskForge Pipeline</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Autonomous feature-task generator anchored at pallets/click v8.1.8 (934813e), validated with Harbor 0.25 linter (0 errors), 1.0 oracle pass rate, and 100% mutation kill rate.
                      </p>
                    </div>
                  </div>

                  <PipelineDiagrams defaultTab="process-flow" />

                  <SolutionWireframesAndArch defaultTab="web" />
                </div>
              )}

              {activeSection === 'wireframes-architecture' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Architectural blueprint and interactive interface wireframes pairing a{' '}
                    <strong className="text-white">lightweight command-line runner</strong> (
                    <code className="font-mono text-cyan-300">run_factory.py</code>,{' '}
                    <code className="font-mono text-cyan-300">validate_tasks.py</code>,{' '}
                    <code className="font-mono text-cyan-300">run_mutation_testing.py</code>) with a{' '}
                    <strong className="text-white">Web Dashboard interface</strong> for triggering generation pipelines, inspecting Harbor 0.25 task packages, and reviewing evaluation reports.
                  </p>

                  <SolutionWireframesAndArch defaultTab="architecture" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-[#070B16] border border-indigo-500/30 space-y-1.5">
                      <p className="font-mono font-bold text-indigo-300">01. TRIGGER PIPELINES</p>
                      <p className="text-slate-300 leading-relaxed">
                        Submit repository specs or Docker image params via CLI or the Web Dashboard form to synthesize Harbor task packages.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#070B16] border border-cyan-500/30 space-y-1.5">
                      <p className="font-mono font-bold text-cyan-300">02. INSPECT TASK PACKAGES</p>
                      <p className="text-slate-300 leading-relaxed">
                        Browse <code className="font-mono text-cyan-300">instruction.md</code>,{' '}
                        <code className="font-mono text-cyan-300">task.toml</code>, Dockerfiles, oracle patches, and <code className="font-mono text-cyan-300">tests/</code> with schema verification.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#070B16] border border-emerald-500/30 space-y-1.5">
                      <p className="font-mono font-bold text-emerald-300">03. VIEW EVAL REPORTS</p>
                      <p className="text-slate-300 leading-relaxed">
                        Inspect Baseline <code className="font-mono">0.0</code>, Oracle <code className="font-mono">1.0</code>, <code className="font-mono">100%</code> mutant kills, and JSON/PDF evidence artifacts.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'process-flow' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    The synthesis and evaluation pipeline accepts{' '}
                    <strong className="text-white">repository specifications</strong> (Git URL, commit SHA, language, test runner) or{' '}
                    <strong className="text-white">container image parameters</strong> (Dockerfile base, resource caps, Python/Node/C++20 with{' '}
                    <code className="text-cyan-300 font-mono">open-source-parsers/jsoncpp</code>), synthesizes Harbor 0.25 task packages with reference tests, executes target AI coding models in isolation, and emits validated results &amp; evidence artifacts.
                  </p>

                  <PipelineDiagrams defaultTab="process-flow" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-[#070B16] border border-indigo-500/30 space-y-1.5">
                      <p className="font-mono font-bold text-indigo-300">1. INGESTION SPECS</p>
                      <p className="text-slate-300 leading-relaxed">
                        Accepts <code className="font-mono text-cyan-300">pipeline/config.py</code> repository metadata or custom <code className="font-mono text-cyan-300">Dockerfile</code> image bounds.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#070B16] border border-emerald-500/30 space-y-1.5">
                      <p className="font-mono font-bold text-emerald-300">2. PACKAGE + AI EXECUTION</p>
                      <p className="text-slate-300 leading-relaxed">
                        Builds <code className="font-mono text-emerald-300">instruction.md</code>, reference tests (<code className="font-mono">F2P/P2P</code>), and runs target AI models &amp; baseline/oracle suites.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#070B16] border border-amber-500/30 space-y-1.5">
                      <p className="font-mono font-bold text-amber-300">3. VALIDATED OUTPUTS</p>
                      <p className="text-slate-300 leading-relaxed">
                        <code className="font-mono text-amber-300">validator.py</code> &amp; <code className="font-mono text-amber-300">mutation_tester.py</code> emit verified scorecards into <code className="font-mono">validation_evidence/</code>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'architecture' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Every API module resides in{' '}
                    <code className="text-indigo-300 font-mono">backend/app/routers/</code> and shares Pydantic v2 schemas and SQLAlchemy models. On startup or Vercel cold start,{' '}
                    <code className="text-cyan-300 font-mono">ensure_schema_migrations()</code> idempotently migrates SQLite columns before seeding.
                  </p>

                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#070B16]">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-950/70">
                          <th className="py-3 px-4">SQLAlchemy Model</th>
                          <th className="py-3 px-4">Key Columns</th>
                          <th className="py-3 px-4">Primary Endpoints</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 text-slate-300">
                        <tr>
                          <td className="py-3 px-4 font-mono font-bold text-indigo-300">User</td>
                          <td className="py-3 px-4">email, hashed_password, points, streak, solved_count, gemini_api_key</td>
                          <td className="py-3 px-4 font-mono">/api/auth/*, /api/user/profile</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-mono font-bold text-cyan-300">Challenge</td>
                          <td className="py-3 px-4">id, slug, difficulty, category, starter_code (4 langs), test_cases</td>
                          <td className="py-3 px-4 font-mono">/api/challenges, /stats, /generate-challenge</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-300">Submission</td>
                          <td className="py-3 px-4">user_id, challenge_id, language, status, runtime_ms, ai_feedback</td>
                          <td className="py-3 px-4 font-mono">/api/run-code, /submit-solution, /submissions</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-mono font-bold text-amber-300">Certificate</td>
                          <td className="py-3 px-4">credential_id, score_percent, skills_verified, challenges_completed, credential_hash</td>
                          <td className="py-3 px-4 font-mono">/api/certificates, /verify, /pdf</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === 'challenge-bank' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <code className="text-indigo-300 font-mono">backend/app/services/challenge_bank.py</code> synthesizes 360 deterministic coding problems across 10 core domains (paired with 8 flagship challenges for 368 total), each checked against Python reference solvers and packaged with starter harnesses for Python, JavaScript, TypeScript, and C++.
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
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center"
                      >
                        <p className="font-semibold text-white">{domain}</p>
                        <p className="text-[10px] font-mono text-cyan-400 mt-1">36+ Verified Tasks</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 rounded-2xl bg-[#070B16] border border-slate-800 space-y-2 text-xs">
                    <p className="font-bold text-white">Multi-Language Execution Sandbox Flow</p>
                    <p className="text-slate-400 leading-relaxed">
                      Incoming code runs in isolated temporary directories via <code className="text-emerald-300 font-mono">code_runner.py</code>: Python invokes <code className="font-mono">sys.executable</code>, JavaScript executes Node <code className="font-mono">.mjs</code>, TypeScript utilizes Node <code className="font-mono">--experimental-strip-types</code>, and C++20 compiles with <code className="font-mono">g++/clang++</code> bundled with amalgamated <code className="text-cyan-300 font-mono">open-source-parsers/jsoncpp</code> (<code className="font-mono">#include &lt;json/json.h&gt;</code>).
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'security-credentials' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-[#070B16] border border-indigo-500/30 space-y-2.5">
                      <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                        <Lock className="w-4 h-4" />
                        Zero-Trust Auth Pipeline
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        <li>• Password policy: 10–128 chars, mixed case, digit &amp; symbol</li>
                        <li>• Salted PBKDF2-HMAC-SHA256 (100,000 rounds)</li>
                        <li>• Constant-time checks via <code className="font-mono text-cyan-300">hmac.compare_digest</code></li>
                        <li>• 15-minute lockout shield after 5 failed logins</li>
                        <li>• Masked Gemini API keys (<code className="font-mono text-cyan-300">gemini_api_key_preview</code>)</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#070B16] border border-amber-500/30 space-y-2.5">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                        <FileText className="w-4 h-4" />
                        ReportLab Vector PDF &amp; Verify Registry
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        <li>• Landscape A4 vector PDF generated live by ReportLab</li>
                        <li>• Unique SHA-256 fingerprint + 15×15 QR matrix</li>
                        <li>• Verified skills pills, score %, tasks &amp; lab hours</li>
                        <li>• Signatory block &amp; embossed gold seal emblem</li>
                        <li>• Public recruiter endpoint at <code className="font-mono text-emerald-300">/verify/:credentialId</code></li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Share2 className="w-4 h-4 text-cyan-400" />
                      Built-In Social Share &amp; Post Studio
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Every earned credential generates editable messages, hashtags, verification links, and crisp HTML5 Canvas PNG graphics tailored for LinkedIn (Feed + Add-to-Profile + 1200×630 PNG), Instagram (1080×1080 PNG + caption), Facebook (Share dialog + 1200×630 PNG), and WhatsApp (bold-formatted share message + PDF attachment).
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'taskforge' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    TaskForge targets <code className="text-cyan-300 font-mono">pallets/click</code> v8.1.8 (<code className="font-mono text-xs">934813e4d421071a1b3db3973c02fe2721359a6e</code>) and synthesizes 5 Harbor 0.25 feature packages spanning distinct Click subsystems with zero upstream regression failures.
                  </p>

                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#070B16]">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-950/70">
                          <th className="py-3 px-4">Package ID</th>
                          <th className="py-3 px-4">Subsystem</th>
                          <th className="py-3 px-4 text-center">Baseline</th>
                          <th className="py-3 px-4 text-center">Oracle</th>
                          <th className="py-3 px-4 text-center">Mutants Killed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 text-slate-300 font-mono">
                        <tr>
                          <td className="py-2.5 px-4 text-indigo-300">click-feature-command-aliases</td>
                          <td className="py-2.5 px-4 font-sans">Command Dispatch (core.py)</td>
                          <td className="py-2.5 px-4 text-center text-rose-400">0.0</td>
                          <td className="py-2.5 px-4 text-center text-emerald-400">1.0</td>
                          <td className="py-2.5 px-4 text-center text-emerald-300">100% (2/2)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-indigo-300">click-feature-json-help-export</td>
                          <td className="py-2.5 px-4 font-sans">Help Export (core.py)</td>
                          <td className="py-2.5 px-4 text-center text-rose-400">0.0</td>
                          <td className="py-2.5 px-4 text-center text-emerald-400">1.0</td>
                          <td className="py-2.5 px-4 text-center text-emerald-300">100% (2/2)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-indigo-300">click-feature-nested-envvar-prefix</td>
                          <td className="py-2.5 px-4 font-sans">Context Envvars (core.py)</td>
                          <td className="py-2.5 px-4 text-center text-rose-400">0.0</td>
                          <td className="py-2.5 px-4 text-center text-emerald-400">1.0</td>
                          <td className="py-2.5 px-4 text-center text-emerald-300">100% (2/2)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-indigo-300">click-feature-parameter-deprecation</td>
                          <td className="py-2.5 px-4 font-sans">Param Lifecycle (core.py)</td>
                          <td className="py-2.5 px-4 text-center text-rose-400">0.0</td>
                          <td className="py-2.5 px-4 text-center text-emerald-400">1.0</td>
                          <td className="py-2.5 px-4 text-center text-emerald-300">100% (2/2)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-indigo-300">click-feature-password-minlen-validator</td>
                          <td className="py-2.5 px-4 font-sans">Password UI (termui.py)</td>
                          <td className="py-2.5 px-4 text-center text-rose-400">0.0</td>
                          <td className="py-2.5 px-4 text-center text-emerald-400">1.0</td>
                          <td className="py-2.5 px-4 text-center text-emerald-300">100% (2/2)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
                    <span>python demo_walkthrough.py &amp;&amp; python run_mutation_testing.py</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                      <Award className="w-4 h-4" />
                      Harbor 0.25: 0 Errors
                    </span>
                  </div>
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
