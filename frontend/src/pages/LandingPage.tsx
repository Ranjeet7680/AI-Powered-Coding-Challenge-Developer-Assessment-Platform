import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { api } from '../services/api';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  CheckCircle2,
  Layers,
  BarChart3,
  Award,
  Play,
  Terminal,
  ShieldCheck,
  Zap,
  Users,
  GraduationCap,
  Building,
  Briefcase,
  ChevronDown,
  Check,
  Star,
  Quote,
  Flame,
  CheckCheck,
  Video,
  BrainCircuit,
  Clock,
  Eye,
  X,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState({
    coding_challenges: '500+',
    active_developers: '14,200+',
    successful_submissions: '182,500+',
    supported_languages: '12+',
  });

  const [activeTab, setActiveTab] = useState<'ide' | 'generator' | 'dashboard' | 'review'>('ide');
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

  // Hero Interactive Simulator State
  const [heroLang, setHeroLang] = useState<'python' | 'typescript' | 'cpp'>('python');
  const [simState, setSimState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [simProgress, setSimProgress] = useState(0);

  useEffect(() => {
    api.getPlatformStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const runHeroSimulation = () => {
    setSimState('running');
    setSimProgress(1);

    setTimeout(() => setSimProgress(3), 500);
    setTimeout(() => setSimProgress(5), 1000);
    setTimeout(() => {
      setSimState('completed');
    }, 1400);
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
            self.cache.popitem(last=False)  # Evict least recently used`,
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
    this.cache.set(key, val); // Refresh order
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
        order.splice(order.begin(), order, lookup[key]); // O(1) move to front
        return lookup[key]->second;
    }
};`
  };

  const features = [
    {
      title: 'AI Challenge Generator',
      description: 'Generate production-grade coding problems instantly with Google Gemini. Customize topics, difficulty levels, and realistic edge cases.',
      icon: Sparkles,
      color: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'Smart Code Evaluation',
      description: 'Run automated test suites against isolated sandboxes. Verify time complexity, memory allocation, and hidden boundary conditions.',
      icon: Cpu,
      color: 'from-violet-500 to-purple-500',
    },
    {
      title: 'Online Coding IDE',
      description: 'A full-featured Monaco-powered browser IDE with intelligent auto-completion, multi-language support, custom test cases, and dark theme.',
      icon: Code2,
      color: 'from-cyan-500 to-teal-500',
    },
    {
      title: 'AI Code Review',
      description: 'Receive real-time algorithmic critiques, big-O time & space complexity breakdowns, and actionable refactoring suggestions.',
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Developer Analytics',
      description: 'Track coding velocity, problem-solving accuracy, language proficiencies, and streak heatmaps through interactive charts.',
      icon: BarChart3,
      color: 'from-emerald-500 to-green-500',
    },
    {
      title: 'Technical Assessments',
      description: 'Design timed candidate screenings, administer hackathons, and evaluate students with verifiable certificates and scoring rubrics.',
      icon: Award,
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const steps = [
    { num: '01', title: 'Choose Topic', desc: 'Select algorithms, system design, data structures, or API patterns.' },
    { num: '02', title: 'Generate AI Challenge', desc: 'Gemini constructs problems with input/output format and test suites.' },
    { num: '03', title: 'Write Code in IDE', desc: 'Implement your solution in Python, TypeScript, JavaScript, or C++.' },
    { num: '04', title: 'Run Test Cases', desc: 'Verify your code against public and hidden unit test vectors.' },
    { num: '05', title: 'Receive AI Feedback', desc: 'Get automated big-O complexity insights and refactoring suggestions.' },
    { num: '06', title: 'Track Performance', desc: 'Climb the global leaderboard and collect verified skill certificates.' },
  ];

  const testimonials = [
    {
      name: 'Sarah Lin',
      role: 'Principal Engineer @ Databricks',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      text: 'The AI Challenge Generator is simply unparalleled. It synthesizes problems that mirror actual production distributed system bottlenecks rather than textbook trivia.',
      rating: 5,
    },
    {
      name: 'Marcus Vance',
      role: 'Senior Systems Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      text: 'Having Monaco Editor paired with instant sandboxed Python & Node execution and automated Big-O feedback makes interview prep genuinely enjoyable.',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'AI Research Engineer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      text: 'We screen 200+ engineers monthly. Coding Task Factory eliminated leaked interview solutions overnight with customized AI challenges.',
      rating: 5,
    },
  ];

  const solutions = [
    { title: 'Individual Developers', desc: 'Sharpen problem-solving skills and prepare for top-tier FAANG engineering interviews.', icon: Users },
    { title: 'Students & Learners', desc: 'Learn programming fundamentals and algorithms with instant AI explanations.', icon: GraduationCap },
    { title: 'Educators & Universities', desc: 'Automate student homework grading and design tailored weekly problem sets.', icon: Terminal },
    { title: 'Coding Bootcamps', desc: 'Deliver realistic technical exercises with automated test cases and feedback.', icon: Terminal },
    { title: 'Technical Recruiters', desc: 'Screen candidates with customized, ungoogleable, timed coding challenges.', icon: Briefcase },
    { title: 'Enterprise Teams', desc: 'Upskill engineering departments and standardise internal technical benchmarks.', icon: Building },
  ];

  const faqs = [
    {
      q: 'How does AI challenge generation work?',
      a: 'Coding Task Factory leverages Google Gemini to synthesize realistic, original programming challenges based on your selected topic, difficulty, and language. Every generated challenge includes a detailed problem statement, constraints, example input/output, starter code, and verified unit tests.'
    },
    {
      q: 'Which programming languages are supported?',
      a: 'We natively support Python 3, JavaScript (Node.js), TypeScript, and C++, with ongoing extensions for Java, Go, Rust, and SQL. Code execution runs in isolated sandboxes with strict timeouts.'
    },
    {
      q: 'Is code execution safe and secure?',
      a: 'Yes. All user submissions run in isolated, sandboxed environments with memory boundaries, execution timeouts, and restricted network/filesystem permissions to guarantee maximum security.'
    },
    {
      q: 'Can companies create customized assessments for candidate screening?',
      a: 'Yes! The Assessments module allows hiring managers and bootcamps to assemble multi-question timed assessments, set passing criteria, and receive comprehensive candidate scoring reports with AI code reviews.'
    },
    {
      q: 'Are certificates verifiable by employers?',
      a: 'Every completed certificate features a unique cryptographic Credential ID and issue date that can be independently verified on the platform.'
    },
    {
      q: 'Can I connect my own Google Gemini API key?',
      a: 'Yes. You can input your custom Gemini API key in Platform Settings to enjoy unrestricted custom model generation (Gemini 1.5 Flash / Pro).'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col selection:bg-indigo-500/30">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Background Gradients & Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-cyan-500/10 blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-cyan-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-lg shadow-indigo-950/40">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Next-Generation AI Developer Assessment Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-cyan-300 font-mono">v2.0 Active</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto mb-6">
            Build Smarter.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300">
              Code Better.
            </span>{' '}
            Get Evaluated Faster.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Generate intelligent coding challenges with AI, solve real-world programming problems in our full-featured online IDE, and evaluate developer skills through automated assessments.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200 active:scale-95 border border-indigo-400/30"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              Start Building Free
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all duration-200"
            >
              <Code2 className="w-4 h-4 text-indigo-400" />
              Demo Developer Login (Instant Access)
            </Link>
          </div>

          {/* Trust badges */}
          <p className="text-xs uppercase tracking-wider text-slate-500 font-mono mb-4">
            Trusted by developers, educators, and engineering teams from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-75 grayscale hover:grayscale-0 transition-all duration-300 text-slate-400 text-sm font-semibold">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-400" /> Google Developer Groups</span>
            <span className="flex items-center gap-1.5"><Terminal className="w-4 h-4 text-cyan-400" /> Stanford Code Club</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-violet-400" /> MIT Hackers</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Innodata AI Labs</span>
          </div>

          {/* Hero Visual: Interactive Product Preview & Simulator */}
          <div className="mt-16 relative max-w-5xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-indigo-500/30 via-slate-800/40 to-transparent shadow-2xl shadow-indigo-950/60">
            <div className="rounded-[23px] bg-[#0A0D17] border border-slate-800/90 overflow-hidden text-left">
              {/* Window Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950/90 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-3 text-xs font-mono text-slate-300 flex items-center gap-1.5 font-semibold">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    lru_cache_engine.{heroLang === 'python' ? 'py' : heroLang === 'typescript' ? 'ts' : 'cpp'}
                  </span>
                </div>

                {/* Language Switcher and Live Run Button */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
                    {(['python', 'typescript', 'cpp'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setHeroLang(lang)}
                        className={`px-2.5 py-1 rounded-md transition capitalize ${
                          heroLang === lang ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang === 'cpp' ? 'C++' : lang}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={runHeroSimulation}
                    disabled={simState === 'running'}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-sm active:scale-95"
                  >
                    {simState === 'running' ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Running Tests...
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        Run Simulation
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mock IDE Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
                {/* Left: Problem Statement & AI Review Badge */}
                <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#090C16] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Medium
                      </span>
                      <span className="text-xs text-slate-500 font-mono">Target: O(1) Time</span>
                      <span className="text-xs text-emerald-400 font-mono ml-auto">Accepted: 68.5%</span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">LRU Cache Implementation</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      Design a data structure that implements a <strong>Least Recently Used (LRU)</strong> cache with O(1) <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300 font-mono">get(key)</code> and <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300 font-mono">put(key, val)</code> operations.
                    </p>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 mb-4">
                      <p className="text-indigo-400 font-semibold">// Constraints:</p>
                      <p>capacity: 1 &lt;= cap &lt;= 3000</p>
                      <p>eviction: remove oldest when full</p>
                      <p>complexity: O(1) average time</p>
                    </div>
                  </div>

                  {/* AI Feedback Badge */}
                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-white">Gemini AI Code Review</p>
                        <span className="text-[10px] font-mono font-bold text-emerald-400">Score: 98/100</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        "Constant-time eviction achieved with double hashing. Memory profile is optimal."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Code Viewer + Test Output */}
                <div className="lg:col-span-7 p-6 bg-[#0B0F19] font-mono text-xs flex flex-col justify-between">
                  <pre className="text-slate-300 overflow-x-auto leading-relaxed max-h-64 custom-scrollbar">
                    {heroCodeSnippets[heroLang]}
                  </pre>

                  {/* Execution footer bar */}
                  <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${simState === 'running' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                        <span className="text-slate-300 font-semibold">
                          {simState === 'running'
                            ? `Running unit test case ${simProgress} of 5...`
                            : 'All 5 Unit Tests Passed'}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Latency: 18ms | RAM: 13.2MB
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] text-slate-500 font-sans">
                        Click "Run Simulation" to test compiler execution
                      </span>
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold"
                      >
                        Launch in Live Workspace <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics Section */}
      <section className="py-14 border-y border-slate-800/80 bg-[#090C16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-mono">
                {stats.coding_challenges}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                Coding Challenges
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 font-mono">
                {stats.active_developers}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                Active Developers
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
                {stats.successful_submissions}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                Successful Submissions
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 font-mono">
                {stats.supported_languages}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                Supported Languages
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-3">
              Autonomous Developer Platform
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Create, Code & Evaluate
            </h3>
            <p className="text-slate-400 text-base">
              Engineered with modern full-stack tools to elevate individual coding practice and automate enterprise technical hiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden shadow-xl"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5 shadow-lg shadow-indigo-950/50`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {f.title}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[#090C16] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
              Streamlined Flow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How Coding Task Factory Works
            </h3>
            <p className="text-slate-400 text-base">
              From challenge conception to AI-powered code evaluation in six seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div
                key={s.num}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-mono">
                  {s.num}
                </span>
                <h4 className="text-base font-bold text-white mt-3 mb-2">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase Tabs */}
      <section id="challenges" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-3">
              Application Preview
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Explore the Unified SaaS Experience
            </h3>
          </div>

          {/* Tab Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: 'ide', label: 'Coding Workspace IDE' },
              { id: 'generator', label: 'AI Challenge Generator' },
              { id: 'dashboard', label: 'Desktop Dashboard' },
              { id: 'review', label: 'Evaluation Report' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Preview Container */}
          <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/60 border border-slate-800 shadow-2xl">
            {activeTab === 'ide' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Monaco-Powered Code Editor</h4>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    Write code with full syntax highlighting, bracket matching, and hotkeys. Run single test cases or execute full suites with immediate stdout/stderr feedback.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 font-mono mb-6">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Python, JavaScript, TypeScript, C++ support</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Real-time execution time & memory measurement</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Hidden test cases to prevent hardcoded solutions</li>
                  </ul>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30"
                  >
                    Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                  <p className="text-indigo-400">// Test Case Execution Vector</p>
                  <p className="text-emerald-400">✓ Test Case 1: Passed (14ms, 12.8MB)</p>
                  <p className="text-emerald-400">✓ Test Case 2: Passed (18ms, 13.1MB)</p>
                  <p className="text-emerald-400">✓ Test Case 3: Passed (12ms, 12.4MB)</p>
                  <p className="text-emerald-400">✓ Test Case 4 (Hidden): Passed (22ms)</p>
                  <p className="text-emerald-400">✓ Test Case 5 (Hidden): Passed (19ms)</p>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    Status: <span className="text-emerald-400 font-bold">ACCEPTED</span> (100% Score)
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'generator' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Google Gemini Challenge Synthesis</h4>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    Craft tailored problems in seconds. Specify your domain: graph algorithms, system concurrency, dynamic programming, or microservice architecture.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs"
                  >
                    Launch AI Generator <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-indigo-400 font-mono">
                    <span>Target: Dynamic Programming</span>
                    <span className="text-amber-400">Difficulty: Medium</span>
                  </div>
                  <p className="text-white font-semibold">Autonomous Cache Optimizer</p>
                  <p className="text-slate-400 text-[11px]">Constraints: 1 &lt;= N &lt;= 10^5, Time Target: O(N)</p>
                  <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300">
                    Input Format: Tokens array stream<br />
                    Output Format: Max aggregated token value
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Centralized Desktop Dashboard</h4>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    Track your streak, accuracy rate, skill radar, and active submissions in a responsive workstation layout.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
                  >
                    Enter Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-900/60 rounded-xl">
                    <p className="text-xl font-bold text-indigo-400 font-mono">28</p>
                    <p className="text-[11px] text-slate-400">Solved Challenges</p>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl">
                    <p className="text-xl font-bold text-emerald-400 font-mono">89.4%</p>
                    <p className="text-[11px] text-slate-400">Success Rate</p>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl">
                    <p className="text-xl font-bold text-amber-400 font-mono">12 Days</p>
                    <p className="text-[11px] text-slate-400">Current Streak</p>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl">
                    <p className="text-xl font-bold text-cyan-400 font-mono">2,450</p>
                    <p className="text-[11px] text-slate-400">Total Points</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Automated Code Quality & Complexity Review</h4>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    Every submitted solution receives automated big-O complexity analysis, clean code scoring, and security reviews.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
                  >
                    View Sample Review <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Overall Quality Score</span>
                    <span className="text-emerald-400 font-mono font-bold">96/100</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Time Complexity: <strong className="text-indigo-300">O(1)</strong> | Space Complexity: <strong className="text-indigo-300">O(capacity)</strong>
                  </p>
                  <div className="p-3 bg-slate-900 rounded-xl text-slate-300 text-[11px]">
                    "Exemplary usage of OrderedDict to achieve constant-time eviction and retrieval."
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Masterclasses & Interactive Explanations Section */}
      <section id="videos" className="py-24 relative overflow-hidden bg-gradient-to-b from-[#090C16] via-[#0B0D1E] to-[#090C16] border-t border-slate-800/80">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[140px] pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                <span>Coding Masterclasses & Visual Intuition</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Learn the Architecture. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
                  Code the Solution.
                </span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
                Watch mathematical intuition and deep learning walkthroughs by elite engineers.
                Then jump directly into the integrated Monaco IDE to code and verify the solution against automated test vectors.
              </p>
            </div>

            <Link
              to="/app/videos"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs sm:text-sm transition shrink-0"
            >
              <span>Explore All Masterclasses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3 Masterclass Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Transformer Self-Attention */}
            <div className="group rounded-3xl bg-[#080B15] border border-purple-500/30 hover:border-purple-500/60 transition duration-300 overflow-hidden shadow-2xl flex flex-col justify-between">
              <div>
                <div
                  onClick={() =>
                    setPreviewVideo({
                      title: 'Transformer Self-Attention Mechanism Visualized & Coded',
                      video_url: 'https://www.youtube.com/embed/wjZofJX0v4U',
                      instructor: 'Elena Rostova (AI Lead)',
                      category: 'Machine Learning',
                      duration: '18 min',
                      challenge_id: 'c-ml-self-attention',
                      description: 'Understand Queries, Keys, and Values, dot-product similarity, scaling by sqrt(d_k), causal masking, and parallel head computation.',
                    })
                  }
                  className="relative aspect-video w-full overflow-hidden cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
                    alt="Transformer Attention"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-purple-500 transition border border-white/20">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-600/90 text-white backdrop-blur-md">
                    Machine Learning
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] text-white backdrop-blur-md">
                    18:00
                  </div>
                </div>

                <div className="p-6 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-purple-300 font-semibold">Elena Rostova</span>
                    <span className="font-mono">14.2k Views</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition">
                    Transformer Self-Attention Mechanism Visualized & Coded
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    Step-by-step breakdown of the core engine behind modern LLMs (GPT, Gemini, Claude).
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() =>
                    setPreviewVideo({
                      title: 'Transformer Self-Attention Mechanism Visualized & Coded',
                      video_url: 'https://www.youtube.com/embed/wjZofJX0v4U',
                      instructor: 'Elena Rostova (AI Lead)',
                      category: 'Machine Learning',
                      duration: '18 min',
                      challenge_id: 'c-ml-self-attention',
                      description: 'Understand Queries, Keys, and Values, dot-product similarity, scaling by sqrt(d_k), causal masking, and parallel head computation.',
                    })
                  }
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
                >
                  Watch Preview
                </button>
                <Link
                  to="/app/workspace/c-ml-self-attention"
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <span>Solve in IDE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Neural Network From Scratch */}
            <div className="group rounded-3xl bg-[#080B15] border border-slate-800/80 hover:border-indigo-500/50 transition duration-300 overflow-hidden shadow-2xl flex flex-col justify-between">
              <div>
                <div
                  onClick={() =>
                    setPreviewVideo({
                      title: 'Building a Neural Network from Scratch in Python',
                      video_url: 'https://www.youtube.com/embed/aircAruvnKk',
                      instructor: 'Dr. Andrew Karpathy',
                      category: 'Machine Learning',
                      duration: '22 min',
                      challenge_id: 'c-ml-softmax-loss',
                      description: 'Complete masterclass detailing matrix operations, forward propagation, calculating loss gradients, and updating model weights.',
                    })
                  }
                  className="relative aspect-video w-full overflow-hidden cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80"
                    alt="Neural Network"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-indigo-500 transition border border-white/20">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600/90 text-white backdrop-blur-md">
                    Machine Learning
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] text-white backdrop-blur-md">
                    22:00
                  </div>
                </div>

                <div className="p-6 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-indigo-300 font-semibold">Dr. Andrew Karpathy</span>
                    <span className="font-mono">8.9k Views</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                    Building a Neural Network from Scratch in Python
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    Learn matrix operations, activation functions (ReLU, Sigmoid), forward pass, and backpropagation.
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() =>
                    setPreviewVideo({
                      title: 'Building a Neural Network from Scratch in Python',
                      video_url: 'https://www.youtube.com/embed/aircAruvnKk',
                      instructor: 'Dr. Andrew Karpathy',
                      category: 'Machine Learning',
                      duration: '22 min',
                      challenge_id: 'c-ml-softmax-loss',
                      description: 'Complete masterclass detailing matrix operations, forward propagation, calculating loss gradients, and updating model weights.',
                    })
                  }
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                >
                  Watch Preview
                </button>
                <Link
                  to="/app/workspace/c-ml-softmax-loss"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <span>Solve in IDE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: LRU Cache Design */}
            <div className="group rounded-3xl bg-[#080B15] border border-slate-800/80 hover:border-cyan-500/50 transition duration-300 overflow-hidden shadow-2xl flex flex-col justify-between">
              <div>
                <div
                  onClick={() =>
                    setPreviewVideo({
                      title: 'LRU Cache Deep Dive: Doubly Linked Lists & Hash Maps',
                      video_url: 'https://www.youtube.com/embed/7V35oxV9_j0',
                      instructor: 'Marcus Vance',
                      category: 'Data Structures',
                      duration: '15 min',
                      challenge_id: 'c2-lru-cache',
                      description: 'Comprehensive visual breakdown of the LRU Cache pattern. Explore why O(1) eviction demands a doubly linked list and hash table.',
                    })
                  }
                  className="relative aspect-video w-full overflow-hidden cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80"
                    alt="LRU Cache"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-cyan-500 transition border border-white/20">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-600/90 text-white backdrop-blur-md">
                    Data Structures
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] text-white backdrop-blur-md">
                    15:00
                  </div>
                </div>

                <div className="p-6 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-cyan-300 font-semibold">Marcus Vance</span>
                    <span className="font-mono">19.6k Views</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                    LRU Cache Deep Dive: Doubly Linked Lists & Hash Maps
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    Learn the dual-ended pointer design for constant time eviction and retrieval in memory-constrained systems.
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() =>
                    setPreviewVideo({
                      title: 'LRU Cache Deep Dive: Doubly Linked Lists & Hash Maps',
                      video_url: 'https://www.youtube.com/embed/7V35oxV9_j0',
                      instructor: 'Marcus Vance',
                      category: 'Data Structures',
                      duration: '15 min',
                      challenge_id: 'c2-lru-cache',
                      description: 'Comprehensive visual breakdown of the LRU Cache pattern. Explore why O(1) eviction demands a doubly linked list and hash table.',
                    })
                  }
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                >
                  Watch Preview
                </button>
                <Link
                  to="/app/workspace/c2-lru-cache"
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <span>Solve in IDE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#090C16] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
              Developer Endorsements
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for Engineers. Proven in Production.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mb-6">
                    "{t.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white">{t.name}</h5>
                    <p className="text-[11px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-3">
              Versatile Platform
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Tailored for Developers, Educators & Recruiters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition"
                >
                  <Icon className="w-6 h-6 text-indigo-400 mb-4" />
                  <h4 className="text-base font-bold text-white mb-2">{s.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#090C16] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
              Simple, Transparent Pricing
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Configurable Plans for Every Stage
            </h3>
            <p className="text-slate-400 text-sm">
              Free forever for open practice. Upgrade for unlimited AI challenges and enterprise candidate assessments.
            </p>

            {/* Monthly / Annual toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-full bg-slate-900 border border-slate-800 mt-6">
              <button
                onClick={() => setAnnualBilling(false)}
                className={`px-3.5 py-1 text-xs font-semibold rounded-full transition ${
                  !annualBilling ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnualBilling(true)}
                className={`px-3.5 py-1 text-xs font-semibold rounded-full transition ${
                  annualBilling ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Annual (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free */}
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white">Free</h4>
                <p className="text-xs text-slate-400 mt-1">For curious developers</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-white font-mono">$0</span>
                  <span className="text-xs text-slate-500"> / forever</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 10 AI Challenges / month</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Full Monaco Coding Workspace</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Standard Test Case Runner</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Community Leaderboard</li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-8 w-full text-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
              >
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border-2 border-indigo-500/80 flex flex-col justify-between relative shadow-xl shadow-indigo-950/40">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Most Popular
              </span>
              <div>
                <h4 className="text-lg font-bold text-white">Pro</h4>
                <p className="text-xs text-slate-400 mt-1">For interview prep & mastery</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {annualBilling ? '$15' : '$19'}
                  </span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited AI Challenges</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Deep AI Code Reviews & Big-O</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Verified Skill Certificates</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Advanced Analytics & Radar</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Connect Custom Gemini API Key</li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-8 w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30"
              >
                Start Pro Trial
              </Link>
            </div>

            {/* Team */}
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white">Team</h4>
                <p className="text-xs text-slate-400 mt-1">For bootcamps & classrooms</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {annualBilling ? '$39' : '$49'}
                  </span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Everything in Pro</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 20 Team Seats</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Custom Assessment Builder</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Cohort Gradebook & Export</li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-8 w-full text-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
              >
                Choose Team
              </Link>
            </div>

            {/* Enterprise */}
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white">Enterprise</h4>
                <p className="text-xs text-slate-400 mt-1">For technical recruiters & scale</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-white font-mono">Custom</span>
                  <span className="text-xs text-slate-500"> / annual</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Dedicated Sandboxed Cluster</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> ATS Integration (Greenhouse, Lever)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Anti-Cheating & Plagiarism Engine</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 24/7 Priority Support & SLA</li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-8 w-full text-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-3">
              Got Questions?
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-semibold text-white text-sm sm:text-base hover:text-indigo-300 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final High-Converting CTA */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#090C16] to-[#070A12] border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-indigo-900/30 to-slate-900/80 border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-cyan-300 mx-auto mb-6 shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Your Next Coding Challenge Starts Here.
            </h2>
            <p className="text-slate-300 text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Join thousands of developers solving AI-generated algorithmic challenges and certifying their skills today.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 transition-all duration-200 active:scale-95 border border-indigo-400/40"
            >
              Create Your Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal Preview */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#090C16] border border-purple-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {previewVideo.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                  {previewVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-xl">
                <iframe
                  src={`${previewVideo.video_url}?autoplay=1&rel=0`}
                  title={previewVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white">{previewVideo.instructor}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {previewVideo.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to={`/app/workspace/${previewVideo.challenge_id}`}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition"
                  >
                    <Code2 className="w-4 h-4 text-cyan-300" />
                    <span>Open in Workspace</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
