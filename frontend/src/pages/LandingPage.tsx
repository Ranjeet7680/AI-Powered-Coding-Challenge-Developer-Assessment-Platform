import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CodeGlyphField } from '../components/common/CodeGlyphField';
import { api } from '../services/api';
import {
  ArrowRight,
  Code2,
  Cpu,
  BarChart3,
  Award,
  Play,
  Terminal,
  ShieldCheck,
  Users,
  GraduationCap,
  Building,
  Briefcase,
  ChevronDown,
  Check,
  BrainCircuit,
  X,
  FileCheck2,
  GitBranch,
  Lock,
} from 'lucide-react';

const EASE_UI = [0.22, 1, 0.36, 1] as const;

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState({
    coding_challenges: '368+',
    supported_languages: '4',
  });

  const [activeTab, setActiveTab] = useState<'ide' | 'generator' | 'dashboard' | 'review' | 'credentials'>('ide');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [annualBilling, setAnnualBilling] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<{
    title: string;
    video_url: string;
    instructor: string;
    category: string;
    duration: string;
    challenge_id: string;
    description: string;
  } | null>(null);

  const [heroLang, setHeroLang] = useState<'python' | 'typescript' | 'cpp'>('python');
  const [simState, setSimState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [simProgress, setSimProgress] = useState(0);

  useEffect(() => {
    api.getPlatformStats()
      .then((res) => {
        if (res) {
          setStats({
            coding_challenges: res.coding_challenges || '368+',
            supported_languages: res.supported_languages || '4',
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!previewVideo) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewVideo(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [previewVideo]);

  const runHeroSimulation = () => {
    setSimState('running');
    setSimProgress(1);

    setTimeout(() => setSimProgress(3), 450);
    setTimeout(() => setSimProgress(5), 900);
    setTimeout(() => {
      setSimState('completed');
    }, 1300);
  };

  const heroCodeSnippets = {
    python: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)  # O(1) refresh
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)  # Evict oldest`,
    typescript: `class LRUCache {
  private capacity: number;
  private cache: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key: number, val: number): void {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, val);
    if (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
}`,
    cpp: `#include <unordered_map>
#include <list>
using namespace std;

class LRUCache {
    int cap;
    list<pair<int, int>> order;
    unordered_map<int, list<pair<int, int>>::iterator> lookup;
public:
    LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        if (!lookup.count(key)) return -1;
        order.splice(order.begin(), order, lookup[key]);
        return lookup[key]->second;
    }
};`,
  };

  const features = [
    {
      title: '368+ multi-language problem bank',
      description: 'Structured tasks across 10 CS and ML domains with Python, JavaScript, TypeScript, and C++ harnesses.',
      icon: Code2,
    },
    {
      title: 'Task generator & copilot',
      description: 'Create new challenges with Gemini or AST fallbacks and review time/space complexity inline.',
      icon: Cpu,
    },
    {
      title: 'Isolated subprocess runner',
      description: 'Execute public and hidden unit vectors with strict timeouts, stdout/stderr capture, and runtime profiling.',
      icon: Terminal,
    },
    {
      title: 'SHA-256 PDF credentials',
      description: 'Export ReportLab landscape A4 certificates with deterministic 15×15 QR matrices and public /verify links.',
      icon: ShieldCheck,
    },
    {
      title: 'Social card exporter',
      description: 'Render 1080×1080 and 1200×630 PNG credential cards and pre-formatted posts for LinkedIn, Instagram, Facebook, and WhatsApp.',
      icon: Award,
    },
    {
      title: 'Assessments & analytics',
      description: 'Run timed engineering screeners, track weekly submission volume, and compare domain mastery.',
      icon: BarChart3,
    },
  ];

  const steps = [
    { num: '01', title: 'Select a domain', desc: 'Pick algorithms, systems design, data structures, or machine learning.' },
    { num: '02', title: 'Configure or generate', desc: 'Choose from 368+ curated tasks or synthesize a custom problem with unit tests.' },
    { num: '03', title: 'Write in the IDE', desc: 'Implement solutions in Python, TypeScript, JavaScript, or C++ inside Monaco.' },
    { num: '04', title: 'Verify against tests', desc: 'Run sample and hidden boundary checks in isolated subprocesses.' },
    { num: '05', title: 'Inspect complexity', desc: 'Review time/space complexity estimates and refactoring notes.' },
    { num: '06', title: 'Issue credentials', desc: 'Pass assessments or courses to mint a SHA-256 verified PDF diploma.' },
  ];

  const architecturePillars = [
    {
      title: 'Subprocess execution isolation',
      metric: '4 runtimes',
      desc: 'Python 3, Node.js (.mjs), TypeScript (--experimental-strip-types), and C++ (g++) execute in temporary directories with strict timeout bounds.',
      icon: Terminal,
    },
    {
      title: 'Cryptographic credential verification',
      metric: 'PBKDF2 + SHA-256',
      desc: 'Accounts enforce 100k-round salted PBKDF2 and HS256 JWTs. Certificates carry immutable SHA-256 digests and public /verify routes.',
      icon: Lock,
    },
    {
      title: 'Harbor 0.25 benchmark parity',
      metric: '10/10 mutation kill',
      desc: 'Automated TaskForge pipeline builds SWE feature-development packages verified against baseline failure (0.0) and oracle pass (1.0).',
      icon: GitBranch,
    },
  ];

  const solutions = [
    { title: 'Individual developers', desc: 'Practice algorithmic patterns and systems design with timed test feedback.', icon: Users },
    { title: 'Students & learners', desc: 'Follow 127 ML and deep learning lectures paired with notes and coding labs.', icon: GraduationCap },
    { title: 'Educators & universities', desc: 'Assign problem sets with automated unit verification and progress tracking.', icon: Terminal },
    { title: 'Coding bootcamps', desc: 'Deliver hands-on exercises across four languages without local setup friction.', icon: Code2 },
    { title: 'Technical recruiters', desc: 'Screen candidates with timed multi-problem assessments and complexity audits.', icon: Briefcase },
    { title: 'Engineering teams', desc: 'Standardize internal coding benchmarks and verify completion with signed PDFs.', icon: Building },
  ];

  const faqs = [
    {
      q: 'How does task generation work',
      a: 'Coding Task Factory uses Google Gemini (or offline deterministic AST templates when no key is set) to produce a problem statement, constraints, starter code, and unit test vectors.',
    },
    {
      q: 'Which programming languages are supported',
      a: 'Python 3, JavaScript (Node.js), TypeScript, and C++ run natively inside the sandboxed execution engine.',
    },
    {
      q: 'How is code execution isolated',
      a: 'Every submission runs in a temporary working directory inside an isolated subprocess with strict memory and timeout limits.',
    },
    {
      q: 'Can teams build custom timed assessments',
      a: 'Yes. The Assessments module lets you select challenges, configure duration and passing thresholds, and inspect per-problem scores.',
    },
    {
      q: 'How do certificate verification and PDF exports work',
      a: 'Earned certificates include a unique Credential ID, a SHA-256 verification digest, a public /verify/:credentialId page, a ReportLab landscape A4 PDF download, and PNG social card exports.',
    },
    {
      q: 'Can I bring my own Gemini API key',
      a: 'Yes. Save your Google Gemini API key in Settings; it is stored server-side and masked in all API responses.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#141415] text-[#ededed] flex flex-col overflow-x-hidden">
      <Navbar />

      {/* Hero Section: Calm space on left for headline, code-glyph field on right, live IDE rising from bottom */}
      <section id="hero" className="relative pt-28 sm:pt-32 pb-0 overflow-hidden border-b border-white/[0.08]">
        <CodeGlyphField className="absolute inset-0 w-full h-full opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_UI }}
              className="text-4xl sm:text-5xl lg:text-[60px] font-medium tracking-[-0.025em] text-[#ededed] leading-[1.06]"
            >
              Coding challenges, live execution, and verified credentials
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08, ease: EASE_UI }}
              className="text-base sm:text-lg text-[#a1a1a6] max-w-[34rem] mt-5 leading-relaxed"
            >
              Practice across 368+ tasks in Python, JavaScript, TypeScript, and C++, test solutions in an isolated sandbox, and issue SHA-256 verified PDF certificates.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14, ease: EASE_UI }}
              className="flex flex-wrap items-center gap-3 mt-8"
            >
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 h-11 px-5 text-sm font-medium text-[#141415] bg-[#ededed] hover:bg-white rounded-lg transition-[background-color,transform] duration-150 active:scale-[0.98]"
              >
                <span>Start building free</span>
                <ArrowRight strokeWidth={1.5} className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 text-sm font-medium text-[#ededed] bg-[#222225] hover:bg-[#2a2a2e] rounded-lg border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[background-color,transform] duration-150 active:scale-[0.98]"
              >
                <Code2 strokeWidth={1.5} className="w-4 h-4 text-[#a1a1a6]" />
                <span>Sign in</span>
              </Link>
            </motion.div>

            <p className="mt-6 text-xs font-mono text-[#85858b]">
              Python 3 · Node.js · TypeScript · C++20 · ReportLab PDF · Harbor 0.25
            </p>
          </div>

          {/* Product Preview rising from bottom edge of hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: EASE_UI }}
            className="mt-12 lg:mt-14 rounded-t-2xl bg-[#19191b] border border-b-0 border-white/[0.1] overflow-hidden shadow-2xl shadow-black/50"
          >
            {/* Window Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 h-12 bg-[#0f0f10] border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#323236]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#323236]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#323236]" />
                </div>
                <span className="text-xs font-mono text-[#a1a1a6] flex items-center gap-2">
                  <Terminal strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b]" />
                  <span>lru_cache.{heroLang === 'python' ? 'py' : heroLang === 'typescript' ? 'ts' : 'cpp'}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 bg-[#19191b] p-0.5 rounded-lg border border-white/[0.08] text-xs font-mono">
                  {(['python', 'typescript', 'cpp'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setHeroLang(lang)}
                      className={`px-2.5 py-1 rounded-md transition-colors capitalize ${
                        heroLang === lang
                          ? 'bg-[#222225] text-[#ededed] font-medium'
                          : 'text-[#85858b] hover:text-[#ededed]'
                      }`}
                    >
                      {lang === 'cpp' ? 'C++' : lang}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={runHeroSimulation}
                  disabled={simState === 'running'}
                  className="inline-flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-[background-color,transform] duration-150 active:scale-[0.98]"
                >
                  {simState === 'running' ? (
                    <>
                      <span className="w-3 h-3 border-2 border-[#141415]/30 border-t-[#141415] rounded-full animate-spin" />
                      <span>Running</span>
                    </>
                  ) : (
                    <>
                      <Play strokeWidth={1.5} className="w-3 h-3 fill-current" />
                      <span>Run tests</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Workbench Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Problem Spec */}
              <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#141415]/60 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[#e5a00d]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e5a00d]" />
                      Medium
                    </span>
                    <span className="text-[#85858b] tabular-nums">Target O(1) · 68.5% pass</span>
                  </div>

                  <h2 className="text-lg font-medium text-[#ededed] mb-2">LRU cache implementation</h2>
                  <p className="text-xs text-[#a1a1a6] leading-relaxed mb-4">
                    Design a cache supporting <code className="bg-[#222225] px-1.5 py-0.5 rounded text-[#ededed] font-mono">get(key)</code> and{' '}
                    <code className="bg-[#222225] px-1.5 py-0.5 rounded text-[#ededed] font-mono">put(key, val)</code> in constant average time.
                  </p>

                  <div className="p-3.5 rounded-lg bg-[#0f0f10] border border-white/[0.08] font-mono text-xs text-[#a1a1a6] space-y-1 tabular-nums">
                    <p className="text-[#85858b]">// Constraints</p>
                    <p>capacity: 1 &lt;= cap &lt;= 3000</p>
                    <p>eviction: drop least recently used key</p>
                    <p>time complexity: O(1) average</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#19191b] border border-white/[0.08] flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-[#ededed]">
                      <span className="font-mono text-[#4cc38a]">[PASS]</span>
                      <span>Complexity check</span>
                    </div>
                    <p className="text-xs text-[#85858b] mt-1 leading-relaxed">
                      Constant-time lookup and eviction verified across ordered hash nodes.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#ededed] tabular-nums shrink-0">98/100</span>
                </div>
              </div>

              {/* Code & Output */}
              <div className="lg:col-span-7 p-6 bg-[#19191b] font-mono text-xs flex flex-col justify-between">
                <pre className="text-[#ededed]/90 overflow-x-auto leading-relaxed max-h-60 custom-scrollbar">
                  {heroCodeSnippets[heroLang]}
                </pre>

                <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-medium ${
                          simState === 'running' ? 'text-[#e5a00d]' : 'text-[#4cc38a]'
                        }`}
                      >
                        {simState === 'running' ? '[RUN]' : '[PASS]'}
                      </span>
                      <span className="text-[#ededed]">
                        {simState === 'running'
                          ? `Running unit test ${simProgress} of 5`
                          : '5 of 5 unit tests passed'}
                      </span>
                    </div>
                    <span className="text-[#85858b] font-mono tabular-nums">
                      18 ms · 13.2 MB
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-[#85858b]">Switch language or run simulation above</span>
                    <Link
                      to="/app/workspace/c2-lru-cache"
                      className="inline-flex items-center gap-1.5 text-[#ededed] hover:text-[#e5a00d] font-medium transition-colors"
                    >
                      <span>Open in IDE</span>
                      <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Factual Platform Metrics Strip */}
      <section className="py-12 border-b border-white/[0.08] bg-[#0f0f10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { value: stats.coding_challenges, label: 'Coding challenges', note: '10 CS & ML domains' },
              { value: stats.supported_languages, label: 'Execution runtimes', note: 'Python, JS, TS, C++' },
              { value: '127', label: 'Academy lectures', note: 'ML & deep learning tracks' },
              { value: 'SHA-256', label: 'PDF credentials', note: 'QR & /verify registry' },
            ].map((item) => (
              <div
                key={item.label}
                className="p-5 rounded-xl bg-[#19191b] border border-white/[0.08]"
              >
                <p className="text-2xl sm:text-3xl font-medium text-[#ededed] font-mono tabular-nums tracking-tight">
                  {item.value}
                </p>
                <p className="text-sm text-[#a1a1a6] mt-1.5">{item.label}</p>
                <p className="text-xs text-[#85858b] mt-0.5">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-mono text-[#85858b] mb-2">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#ededed]">
              Everything needed to practice, assess, and verify code
            </h2>
            <p className="text-[#a1a1a6] text-base mt-3 leading-relaxed">
              Built as a single workbench for algorithmic training, coursework, and candidate evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08] hover:border-white/[0.14] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#222225] border border-white/[0.08] flex items-center justify-center mb-4">
                    <Icon strokeWidth={1.5} className="w-4 h-4 text-[#a1a1a6]" />
                  </div>
                  <h3 className="text-base font-medium text-[#ededed] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#85858b] leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-20 bg-[#0f0f10] border-y border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-mono text-[#85858b] mb-2">Workflow</p>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#ededed]">
              From problem selection to verified credential
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((s) => (
              <div
                key={s.num}
                className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08]"
              >
                <span className="text-sm font-mono font-medium text-[#e5a00d] tabular-nums">
                  {s.num}
                </span>
                <h3 className="text-base font-medium text-[#ededed] mt-3 mb-1.5">{s.title}</h3>
                <p className="text-sm text-[#85858b] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase Tabs */}
      <section id="challenges" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-mono text-[#85858b] mb-2">Workspace modules</p>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#ededed]">
                Inside Coding Task Factory
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-[#0f0f10] p-1 rounded-xl border border-white/[0.08]">
              {(
                [
                  { id: 'ide', label: 'Workspace IDE' },
                  { id: 'generator', label: 'Task generator' },
                  { id: 'dashboard', label: 'Dashboard' },
                  { id: 'review', label: 'Code review' },
                  { id: 'credentials', label: 'PDF credentials' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#222225] text-[#ededed] border border-white/[0.12]'
                      : 'text-[#85858b] hover:text-[#ededed]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6 sm:p-8 bg-[#19191b] border border-white/[0.08]">
            {activeTab === 'ide' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-medium text-[#ededed] mb-2">Monaco code editor</h3>
                  <p className="text-sm text-[#a1a1a6] mb-5 leading-relaxed">
                    Write code with syntax highlighting, keyboard shortcuts, and per-language local drafts. Execute sample or hidden test suites with stdout/stderr inspection.
                  </p>
                  <ul className="space-y-2 text-xs text-[#a1a1a6] font-mono mb-6">
                    <li className="flex items-center gap-2">
                      <Check strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a] shrink-0" />
                      <span>Python, JavaScript, TypeScript, and C++ runtimes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a] shrink-0" />
                      <span>Latency and memory profiling per test run</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a] shrink-0" />
                      <span>Hidden boundary vectors for verification</span>
                    </li>
                  </ul>
                  <Link
                    to="/app/workspace/c2-lru-cache"
                    className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] font-medium text-xs transition-colors"
                  >
                    <span>Open workspace</span>
                    <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-5 rounded-xl bg-[#141415] border border-white/[0.08] font-mono text-xs space-y-2 tabular-nums">
                  <p className="text-[#85858b]">// Execution report</p>
                  <p className="text-[#4cc38a]">[PASS] Case 1 · 14 ms · 12.8 MB</p>
                  <p className="text-[#4cc38a]">[PASS] Case 2 · 18 ms · 13.1 MB</p>
                  <p className="text-[#4cc38a]">[PASS] Case 3 · 12 ms · 12.4 MB</p>
                  <p className="text-[#4cc38a]">[PASS] Case 4 (hidden) · 22 ms</p>
                  <p className="text-[#4cc38a]">[PASS] Case 5 (hidden) · 19 ms</p>
                  <div className="mt-4 pt-3 border-t border-white/[0.08] flex justify-between text-[#a1a1a6]">
                    <span>Status: Accepted</span>
                    <span className="text-[#ededed]">100%</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'generator' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-medium text-[#ededed] mb-2">Custom challenge synthesis</h3>
                  <p className="text-sm text-[#a1a1a6] mb-5 leading-relaxed">
                    Specify a topic, difficulty tier, target runtime, and test case count. Save generated challenges directly into the library or launch them in the IDE.
                  </p>
                  <Link
                    to="/app/generator"
                    className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] font-medium text-xs transition-colors"
                  >
                    <span>Open generator</span>
                    <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="p-5 rounded-xl bg-[#141415] border border-white/[0.08] text-xs space-y-2.5">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[#a1a1a6]">Dynamic programming</span>
                    <span className="text-[#e5a00d]">Medium</span>
                  </div>
                  <p className="text-[#ededed] font-medium text-sm">Autonomous cache optimizer</p>
                  <p className="text-[#85858b] font-mono tabular-nums">1 &lt;= N &lt;= 10^5 · Time target O(N)</p>
                  <div className="p-3 bg-[#19191b] rounded-lg border border-white/[0.08] font-mono text-[#a1a1a6]">
                    Input: token stream array<br />
                    Output: maximum aggregated value
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-medium text-[#ededed] mb-2">Developer telemetry</h3>
                  <p className="text-sm text-[#a1a1a6] mb-5 leading-relaxed">
                    Monitor solved count, acceptance rate, active streak, and weekly submission volume alongside domain mastery breakdowns.
                  </p>
                  <Link
                    to="/app/dashboard"
                    className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] font-medium text-xs transition-colors"
                  >
                    <span>Open dashboard</span>
                    <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="p-5 rounded-xl bg-[#141415] border border-white/[0.08] grid grid-cols-2 gap-3 tabular-nums">
                  {[
                    { label: 'Solved tasks', val: '28' },
                    { label: 'Pass rate', val: '89.4%' },
                    { label: 'Current streak', val: '12d' },
                    { label: 'Total points', val: '2,450' },
                  ].map((m) => (
                    <div key={m.label} className="p-3.5 bg-[#19191b] rounded-lg border border-white/[0.08]">
                      <p className="text-xs text-[#85858b]">{m.label}</p>
                      <p className="text-xl font-medium text-[#ededed] font-mono mt-1">{m.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-medium text-[#ededed] mb-2">Complexity and code quality audit</h3>
                  <p className="text-sm text-[#a1a1a6] mb-5 leading-relaxed">
                    Submitted solutions receive automated Big-O estimates, style inspection, and edge-case notes powered by Gemini or static AST analysis.
                  </p>
                  <Link
                    to="/app/submissions"
                    className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] font-medium text-xs transition-colors"
                  >
                    <span>View submissions</span>
                    <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="p-5 rounded-xl bg-[#141415] border border-white/[0.08] text-xs space-y-3 tabular-nums">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#ededed]">Quality score</span>
                    <span className="text-[#4cc38a] font-mono">96 / 100</span>
                  </div>
                  <p className="text-[#85858b] font-mono">
                    Time: O(1) · Space: O(capacity)
                  </p>
                  <div className="p-3 bg-[#19191b] rounded-lg border border-white/[0.08] text-[#a1a1a6]">
                    Uses OrderedDict for constant-time eviction and key refresh without auxiliary node leaks.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'credentials' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-medium text-[#ededed] mb-2">Vector PDFs &amp; verification registry</h3>
                  <p className="text-sm text-[#a1a1a6] mb-5 leading-relaxed">
                    Completed tracks mint a landscape A4 PDF via ReportLab, a SHA-256 verification URL, and PNG social cards ready for LinkedIn, Instagram, Facebook, and WhatsApp.
                  </p>
                  <ul className="space-y-2 text-xs text-[#a1a1a6] font-mono mb-6">
                    <li className="flex items-center gap-2">
                      <Check strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a] shrink-0" />
                      <span>Public /verify/:credentialId &amp; 15×15 QR matrix</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a] shrink-0" />
                      <span>LinkedIn Add-to-Profile deep links</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a] shrink-0" />
                      <span>1080×1080 &amp; 1200×630 PNG card exports</span>
                    </li>
                  </ul>
                  <Link
                    to="/app/certificates"
                    className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] font-medium text-xs transition-colors"
                  >
                    <span>Explore credentials</span>
                    <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="p-5 rounded-xl bg-[#141415] border border-white/[0.1] text-xs space-y-3 tabular-nums">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[#e5a00d]">A4 vector PDF</span>
                    <span className="text-[#4cc38a]">[SHA-256 verified]</span>
                  </div>
                  <p className="text-[#ededed] font-medium text-sm">Mastery of algorithmic problem solving</p>
                  <div className="grid grid-cols-3 gap-2 font-mono">
                    <div className="p-2.5 rounded-lg bg-[#19191b] border border-white/[0.08] text-[#ededed]">98% score</div>
                    <div className="p-2.5 rounded-lg bg-[#19191b] border border-white/[0.08] text-[#ededed]">42+ tasks</div>
                    <div className="p-2.5 rounded-lg bg-[#19191b] border border-white/[0.08] text-[#ededed]">36 hours</div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[#85858b] font-mono">
                    <FileCheck2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>LinkedIn · Instagram · Facebook · WhatsApp</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Masterclasses & Academies */}
      <section id="videos" className="py-20 sm:py-24 bg-[#0f0f10] border-y border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="text-xs font-mono text-[#85858b] mb-2">Academies &amp; video library</p>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#ededed]">
                Learn the theory, then implement the solution
              </h2>
              <p className="text-[#a1a1a6] text-sm sm:text-base mt-3 leading-relaxed">
                Follow structured machine learning, deep learning, data science, entrepreneurship, and agentic AI tracks with lecture notes, quizzes, capstones, and camera-proctored exams.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                to="/app/lms"
                className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] font-medium text-xs transition-colors"
              >
                <span>LMS hub</span>
                <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/app/lms/ml"
                className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] border border-white/[0.08] font-medium text-xs transition-colors"
              >
                <BrainCircuit strokeWidth={1.5} className="w-3.5 h-3.5 text-[#a1a1a6]" />
                <span>ML track (106)</span>
              </Link>
              <Link
                to="/app/lms/dl"
                className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] border border-white/[0.08] font-medium text-xs transition-colors"
              >
                <GraduationCap strokeWidth={1.5} className="w-3.5 h-3.5 text-[#a1a1a6]" />
                <span>Stanford DL (21)</span>
              </Link>
              <Link
                to="/app/lms/ds"
                className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] border border-white/[0.08] font-medium text-xs transition-colors"
              >
                <BarChart3 strokeWidth={1.5} className="w-3.5 h-3.5 text-[#a1a1a6]" />
                <span>Data Science (14)</span>
              </Link>
              <Link
                to="/app/lms/biz"
                className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] border border-white/[0.08] font-medium text-xs transition-colors"
              >
                <Briefcase strokeWidth={1.5} className="w-3.5 h-3.5 text-[#a1a1a6]" />
                <span>IITM Business (66)</span>
              </Link>
              <Link
                to="/app/lms/agentic"
                className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] border border-white/[0.08] font-medium text-xs transition-colors"
              >
                <Cpu strokeWidth={1.5} className="w-3.5 h-3.5 text-[#a1a1a6]" />
                <span>Agentic AI (23)</span>
              </Link>
            </div>
          </div>

          {/* 3 Masterclass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Transformer self-attention visualized and coded',
                video_url: 'https://www.youtube-nocookie.com/embed/eMlx5fFNoYc?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&fs=1',
                instructor: 'Elena Rostova',
                category: 'Machine learning',
                duration: '18:00',
                challenge_id: 'c-ml-self-attention',
                image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
                description: 'Queries, keys, values, scaled dot-product similarity, causal masking, and multi-head projection.',
              },
              {
                title: 'Building a neural network from scratch in Python',
                video_url: 'https://www.youtube-nocookie.com/embed/aircAruvnKk?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&fs=1',
                instructor: 'Dr. Andrew Karpathy',
                category: 'Machine learning',
                duration: '22:00',
                challenge_id: 'c-ml-softmax-loss',
                image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80',
                description: 'Matrix forward passes, ReLU and Sigmoid activations, loss gradients, and weight updates.',
              },
              {
                title: 'LRU cache design with doubly linked lists and hash maps',
                video_url: 'https://www.youtube-nocookie.com/embed/7ABFKPK2hD4?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&fs=1',
                instructor: 'Marcus Vance',
                category: 'Data structures',
                duration: '15:00',
                challenge_id: 'c2-lru-cache',
                image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
                description: 'Dual-ended pointer mechanics for constant-time eviction in bounded memory.',
              },
            ].map((item) => (
              <div
                key={item.challenge_id}
                className="rounded-xl bg-[#19191b] border border-white/[0.08] overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => setPreviewVideo(item)}
                    className="relative aspect-video w-full overflow-hidden block text-left group"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141415]/90 via-[#141415]/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-[#141415]/90 border border-white/20 text-[#ededed] flex items-center justify-center">
                        <Play strokeWidth={1.5} className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#ededed]">{item.category}</span>
                      <span className="text-[#a1a1a6] tabular-nums">{item.duration}</span>
                    </div>
                  </button>

                  <div className="p-5 space-y-2">
                    <p className="text-xs text-[#85858b]">{item.instructor}</p>
                    <h3 className="text-base font-medium text-[#ededed] leading-snug">{item.title}</h3>
                    <p className="text-xs text-[#a1a1a6] line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewVideo(item)}
                    className="text-[#a1a1a6] hover:text-[#ededed] transition-colors"
                  >
                    Watch preview
                  </button>
                  <Link
                    to={`/app/workspace/${item.challenge_id}`}
                    className="inline-flex items-center gap-1.5 text-[#ededed] hover:text-[#e5a00d] font-medium transition-colors"
                  >
                    <span>Solve in IDE</span>
                    <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture & Security Verification (replaces unverified testimonials) */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-mono text-[#85858b] mb-2">Engineering guarantees</p>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#ededed]">
              Verifiable execution and credential integrity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {architecturePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08] flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 rounded-lg bg-[#222225] border border-white/[0.08] flex items-center justify-center">
                        <Icon strokeWidth={1.5} className="w-4 h-4 text-[#a1a1a6]" />
                      </div>
                      <span className="font-mono text-xs text-[#e5a00d] tabular-nums">{pillar.metric}</span>
                    </div>
                    <h3 className="text-base font-medium text-[#ededed] mb-2">{pillar.title}</h3>
                    <p className="text-sm text-[#85858b] leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-20 bg-[#0f0f10] border-y border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-mono text-[#85858b] mb-2">Use cases</p>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#ededed]">
              Built for developers, educators, and hiring teams
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {solutions.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="p-6 rounded-xl bg-[#19191b] border border-white/[0.08]"
                >
                  <Icon strokeWidth={1.5} className="w-4 h-4 text-[#85858b] mb-4" />
                  <h3 className="text-base font-medium text-[#ededed] mb-1.5">{s.title}</h3>
                  <p className="text-sm text-[#85858b] leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <p className="text-xs font-mono text-[#85858b] mb-2">Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#ededed]">
                Plans for practice and team screening
              </h2>
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#0f0f10] border border-white/[0.08] self-start">
              <button
                type="button"
                onClick={() => setAnnualBilling(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  !annualBilling ? 'bg-[#222225] text-[#ededed]' : 'text-[#85858b] hover:text-[#ededed]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setAnnualBilling(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  annualBilling ? 'bg-[#222225] text-[#ededed]' : 'text-[#85858b] hover:text-[#ededed]'
                }`}
              >
                Annual (20% off)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 tabular-nums">
            {[
              {
                name: 'Free',
                desc: 'Open individual practice',
                price: '$0',
                cadence: 'forever',
                cta: 'Get started',
                featured: false,
                perks: [
                  '10 generated challenges / month',
                  'Monaco coding workspace',
                  'Standard test suite runner',
                  'Leaderboard access',
                ],
              },
              {
                name: 'Pro',
                desc: 'Interview preparation and mastery',
                price: annualBilling ? '$15' : '$19',
                cadence: 'per month',
                cta: 'Start Pro trial',
                featured: true,
                perks: [
                  'Unlimited generated challenges',
                  'Deep complexity & code reviews',
                  'Verified PDF credentials',
                  'Analytics and competency radar',
                  'Custom Gemini API key support',
                ],
              },
              {
                name: 'Team',
                desc: 'Bootcamps and classrooms',
                price: annualBilling ? '$39' : '$49',
                cadence: 'per month',
                cta: 'Choose Team',
                featured: false,
                perks: [
                  'Everything in Pro',
                  'Up to 20 team seats',
                  'Custom assessment builder',
                  'Cohort gradebook export',
                ],
              },
              {
                name: 'Enterprise',
                desc: 'Hiring teams at scale',
                price: 'Custom',
                cadence: 'annual',
                cta: 'Contact sales',
                featured: false,
                perks: [
                  'Dedicated sandboxed cluster',
                  'ATS integration (Greenhouse, Lever)',
                  'Proctoring & integrity audit logs',
                  'Priority support SLA',
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-xl bg-[#19191b] border flex flex-col justify-between ${
                  plan.featured ? 'border-[#e5a00d]/55' : 'border-white/[0.08]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-[#ededed]">{plan.name}</h3>
                    {plan.featured && (
                      <span className="font-mono text-xs text-[#e5a00d]">Recommended</span>
                    )}
                  </div>
                  <p className="text-xs text-[#85858b] mt-1">{plan.desc}</p>
                  <div className="mt-5 mb-6 flex items-baseline gap-1.5">
                    <span className="text-3xl font-medium text-[#ededed] font-mono">{plan.price}</span>
                    <span className="text-xs text-[#85858b]">/ {plan.cadence}</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#a1a1a6]">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <Check strokeWidth={1.5} className="w-3.5 h-3.5 text-[#4cc38a] shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/register"
                  className={`mt-8 w-full text-center py-2.5 rounded-lg font-medium text-xs transition-colors ${
                    plan.featured
                      ? 'bg-[#ededed] hover:bg-white text-[#141415]'
                      : 'bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] border border-white/[0.08]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#0f0f10] border-y border-white/[0.08]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-mono text-[#85858b] mb-2">FAQ</p>
            <h2 className="text-3xl font-medium tracking-[-0.02em] text-[#ededed]">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className="rounded-xl bg-[#19191b] border border-white/[0.08] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-medium text-[#ededed] text-sm sm:text-base hover:bg-[#222225]/60 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    strokeWidth={1.5}
                    className={`w-4 h-4 text-[#85858b] shrink-0 transition-transform duration-150 ${
                      openFaq === idx ? 'rotate-180 text-[#ededed]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-[#a1a1a6] leading-relaxed border-t border-white/[0.08] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#19191b] border border-white/[0.1] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-lg">
              <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed]">
                Start coding in the workbench
              </h2>
              <p className="text-[#a1a1a6] text-sm mt-2 leading-relaxed">
                Create a free account to access 368+ tasks, the Monaco runner, and verified PDF credentials.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-5 h-11 text-sm font-medium text-[#141415] bg-[#ededed] hover:bg-white rounded-lg transition-colors shrink-0"
            >
              <span>Create free account</span>
              <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl bg-[#19191b] border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0f0f10]">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-[#e5a00d] shrink-0">{previewVideo.category}</span>
                <h3 className="text-sm font-medium text-[#ededed] truncate">{previewVideo.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-lg text-[#85858b] hover:text-[#ededed] hover:bg-[#222225] transition-colors"
                aria-label="Close preview"
              >
                <X strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/[0.08] bg-black">
                <iframe
                  src={`${previewVideo.video_url}?autoplay=1&rel=0`}
                  title={previewVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#141415] border border-white/[0.08]">
                <div>
                  <h4 className="text-sm font-medium text-[#ededed]">{previewVideo.instructor}</h4>
                  <p className="text-xs text-[#85858b] mt-0.5">{previewVideo.description}</p>
                </div>

                <Link
                  to={`/app/workspace/${previewVideo.challenge_id}`}
                  className="px-4 h-9 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] font-medium text-xs inline-flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Code2 strokeWidth={1.5} className="w-4 h-4" />
                  <span>Open in workspace</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
