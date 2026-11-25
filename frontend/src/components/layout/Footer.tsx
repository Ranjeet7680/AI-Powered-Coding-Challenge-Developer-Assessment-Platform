import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { Terminal, X, ShieldCheck, BookOpen } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

interface FooterProps {
  compact?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ compact = false }) => {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const legalModalNode = legalModal && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn no-print"
      onClick={() => setLegalModal(null)}
    >
      <div
        className="w-full max-w-lg bg-[#0B101D] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            {legalModal === 'privacy' ? 'Privacy & Data Protection Policy' : 'Terms of Service'}
          </h3>
          <button
            onClick={() => setLegalModal(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed space-y-3">
          {legalModal === 'privacy' ? (
            <>
              <p>
                Coding Task Factory stores account credentials using salted PBKDF2-HMAC-SHA256 (100,000 iterations) and signs session tokens with HMAC-SHA256.
              </p>
              <p>
                Optional Gemini API keys saved in Platform Settings are stored exclusively for your user-initiated challenge generation and code review requests and are never returned in plaintext API responses.
              </p>
            </>
          ) : (
            <>
              <p>
                All code executions run in isolated temporary subprocesses with strict execution timeouts. Users must not submit malicious payloads designed to exhaust host resources.
              </p>
              <p>
                Assessment credentials and Harbor 0.25 task packages are open-sourced under the MIT License for educational, benchmarking, and technical evaluation workflows.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <footer className="mt-10 rounded-2xl border border-slate-800/80 bg-[#070B14]/95 px-5 py-6 sm:px-7 no-print shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-5 border-b border-slate-800/75 text-xs">
          {/* Group 1: Workspace & Coding */}
          <div className="space-y-2.5">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Workspace &amp; Coding
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/" className="hover:text-white transition">Home Overview</Link></li>
              <li><Link to="/app/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              <li><Link to="/app/challenges" className="hover:text-white transition">Challenges (368+)</Link></li>
              <li><Link to="/app/workspace/c2-lru-cache" className="hover:text-white transition">Monaco Coding IDE</Link></li>
              <li><Link to="/app/generator" className="hover:text-white transition">AI Task Generator</Link></li>
            </ul>
          </div>

          {/* Group 2: AI & Deep Learning LMS */}
          <div className="space-y-2.5">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-300">
              AI &amp; DL Academies
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link to="/app/ml-course" className="text-emerald-300 hover:text-emerald-200 font-semibold transition">
                  ML Course LMS (106)
                </Link>
              </li>
              <li>
                <Link to="/app/dl-course" className="text-rose-300 hover:text-rose-200 font-semibold transition">
                  Stanford × CTF DL (21)
                </Link>
              </li>
              <li><Link to="/app/videos" className="hover:text-white transition">Video Masterclasses</Link></li>
              <li><Link to="/app/submissions" className="hover:text-white transition">My Submissions</Link></li>
            </ul>
          </div>

          {/* Group 3: Assessments & Growth */}
          <div className="space-y-2.5">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              Growth &amp; Credentials
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/app/assessments" className="hover:text-white transition">Technical Assessments</Link></li>
              <li><Link to="/app/certificates" className="hover:text-white transition">PDF Certificates &amp; Share</Link></li>
              <li><Link to="/app/analytics" className="hover:text-white transition">Developer Analytics</Link></li>
              <li><Link to="/app/leaderboard" className="hover:text-white transition">Global Leaderboard</Link></li>
            </ul>
          </div>

          {/* Group 4: Wiki, Settings & Legal */}
          <div className="space-y-2.5">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Platform Wiki &amp; Legal
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link to="/wiki" className="text-cyan-300 hover:text-cyan-200 font-semibold transition inline-flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Platform Wiki
                </Link>
              </li>
              <li><Link to="/app/settings" className="hover:text-white transition">API &amp; Key Settings</Link></li>
              <li>
                <button type="button" onClick={() => setLegalModal('privacy')} className="hover:text-white transition text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setLegalModal('terms')} className="hover:text-white transition text-left">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Status Strip */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2.5">
            <BrandLogo size="sm" />
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Services Online
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-500">
            © {CURRENT_YEAR} Coding Task Factory • MIT License
          </p>
        </div>
        {legalModalNode}
      </footer>
    );
  }

  return (
    <footer className="border-t border-slate-800/80 bg-[#060911] pt-14 pb-10 relative overflow-hidden no-print">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-gradient-to-t from-indigo-900/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Brand & Social Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-10 mb-10 border-b border-slate-800/80">
          <div className="max-w-xl">
            <BrandLogo size="md" className="mb-3" />
            <p className="text-slate-400 text-sm leading-relaxed">
              An intelligent AI-powered platform with 368+ multi-language challenges, real-time Monaco IDE &amp; AI Copilot, automated technical assessments, and verifiable vector PDF credentials.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://github.com/Ranjeet7680/AI-Powered-Coding-Challenge-Developer-Assessment-Platform"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition"
              aria-label="GitHub Repository"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-slate-700 transition"
              aria-label="X / Twitter"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-slate-700 transition"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Complete 5-Column All-Pages Sitemap */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Workspace & Coding */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-4 whitespace-nowrap">
              Workspace &amp; Coding
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-white transition">Home Overview</Link></li>
              <li><Link to="/app/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              <li><Link to="/app/challenges" className="hover:text-white transition">Explore 368+ Challenges</Link></li>
              <li><Link to="/app/workspace/c2-lru-cache" className="hover:text-white transition">Coding Workspace IDE</Link></li>
              <li><Link to="/app/generator" className="hover:text-white transition">AI Task Generator</Link></li>
              <li><Link to="/app/ml-course" className="hover:text-emerald-300 transition">ML Course LMS (106 Videos)</Link></li>
              <li><Link to="/app/dl-course" className="hover:text-rose-300 transition">Stanford × CTF Deep Learning (21)</Link></li>
              <li><Link to="/app/videos" className="hover:text-white transition">Video Masterclasses</Link></li>
            </ul>
          </div>

          {/* Col 2: Assessments & Growth */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-4 whitespace-nowrap">
              Growth &amp; Credentials
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/app/submissions" className="hover:text-white transition">My Submissions</Link></li>
              <li><Link to="/app/assessments" className="hover:text-white transition">Technical Assessments</Link></li>
              <li><Link to="/app/leaderboard" className="hover:text-white transition">Global Leaderboard</Link></li>
              <li><Link to="/app/analytics" className="hover:text-white transition">Developer Analytics</Link></li>
              <li><Link to="/app/certificates" className="hover:text-white transition">PDF Certificates &amp; Share</Link></li>
              <li><Link to="/onboarding" className="hover:text-white transition">Onboarding Wizard</Link></li>
            </ul>
          </div>

          {/* Col 3: Platform Wiki */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 font-mono mb-4 flex items-center gap-1.5 whitespace-nowrap">
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              Platform Wiki
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/wiki" className="hover:text-white transition">Wiki Home &amp; Map</Link></li>
              <li><Link to="/wiki/architecture" className="hover:text-white transition">Architecture &amp; ER Schema</Link></li>
              <li><Link to="/wiki/challenge-bank" className="hover:text-white transition">368+ Bank &amp; Sandbox</Link></li>
              <li><Link to="/wiki/security-credentials" className="hover:text-white transition">Security &amp; PDFs</Link></li>
              <li><Link to="/wiki/taskforge" className="hover:text-white transition">TaskForge Harbor 0.25</Link></li>
              <li>
                <a
                  href="https://github.com/Ranjeet7680/AI-Powered-Coding-Challenge-Developer-Assessment-Platform/tree/main/wiki"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  GitHub Markdown Wiki
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Account & Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-4 whitespace-nowrap">
              Account &amp; Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Create Free Account</Link></li>
              <li><Link to="/forgot-password" className="hover:text-white transition">Reset Password</Link></li>
              <li>
                <Link to="/app/settings" className="hover:text-white transition flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>API &amp; Key Settings</span>
                </Link>
              </li>
              <li><a href="/#features" className="hover:text-white transition">Platform Features</a></li>
              <li><a href="/#pricing" className="hover:text-white transition">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Col 5: Solutions & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-4 whitespace-nowrap">
              Solutions &amp; Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="/#solutions" className="hover:text-white transition">Individual Developers</a></li>
              <li><a href="/#solutions" className="hover:text-white transition">Students &amp; Bootcamps</a></li>
              <li><a href="/#solutions" className="hover:text-white transition">Technical Recruiters</a></li>
              <li><a href="/#faq" className="hover:text-white transition">FAQ &amp; Support</a></li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal('privacy')}
                  className="hover:text-white transition text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal('terms')}
                  className="hover:text-white transition text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {CURRENT_YEAR} Coding Task Factory. All rights reserved.</p>
          <p>Engineered with precision for developers worldwide</p>
        </div>
      </div>

      {legalModalNode}
    </footer>
  );
};
