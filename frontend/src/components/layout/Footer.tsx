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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn no-print"
      onClick={() => setLegalModal(null)}
    >
      <div
        className="w-full max-w-lg bg-[#19191b] border border-white/[0.12] rounded-2xl p-6 shadow-2xl space-y-4 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 className="text-sm font-medium text-[#ededed] flex items-center gap-2">
            <ShieldCheck strokeWidth={1.5} className="w-4 h-4 text-[#a1a1a6]" />
            <span>{legalModal === 'privacy' ? 'Privacy and data protection' : 'Terms of service'}</span>
          </h3>
          <button
            type="button"
            onClick={() => setLegalModal(null)}
            className="p-1.5 text-[#85858b] hover:text-[#ededed] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm text-[#a1a1a6] leading-relaxed space-y-3">
          {legalModal === 'privacy' ? (
            <>
              <p>
                Coding Task Factory stores account credentials using salted PBKDF2-HMAC-SHA256 (100,000 iterations) and signs session tokens with HMAC-SHA256.
              </p>
              <p>
                Optional Gemini API keys saved in Settings are stored server-side solely for your user-initiated generation and review requests and are never returned in plaintext API responses.
              </p>
            </>
          ) : (
            <>
              <p>
                Code executions run in isolated temporary subprocesses with strict execution timeouts. Do not submit payloads designed to exhaust host resources.
              </p>
              <p>
                Assessment credentials and Harbor 0.25 task packages are available under the MIT License for educational, benchmarking, and technical evaluation workflows.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <footer className="mt-8 rounded-xl border border-white/[0.08] bg-[#0f0f10] px-5 py-5 sm:px-6 no-print">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-5 border-b border-white/[0.08] text-xs">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-[#ededed]">Workspace</h4>
            <ul className="space-y-1.5 text-[#85858b]">
              <li><Link to="/" className="hover:text-[#ededed] transition-colors">Home</Link></li>
              <li><Link to="/app/dashboard" className="hover:text-[#ededed] transition-colors">Overview</Link></li>
              <li><Link to="/app/challenges" className="hover:text-[#ededed] transition-colors">Challenge library (368+)</Link></li>
              <li><Link to="/app/workspace/c2-lru-cache" className="hover:text-[#ededed] transition-colors">Coding IDE</Link></li>
              <li><Link to="/app/generator" className="hover:text-[#ededed] transition-colors">Task generator</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-[#ededed]">Academies</h4>
            <ul className="space-y-1.5 text-[#85858b]">
              <li><Link to="/app/lms" className="hover:text-[#ededed] transition-colors">LMS courses hub</Link></li>
              <li><Link to="/app/ml-course" className="hover:text-[#ededed] transition-colors">ML course (106)</Link></li>
              <li><Link to="/app/dl-course" className="hover:text-[#ededed] transition-colors">Stanford DL (21)</Link></li>
              <li><Link to="/app/videos" className="hover:text-[#ededed] transition-colors">Video library</Link></li>
              <li><Link to="/app/submissions" className="hover:text-[#ededed] transition-colors">Submissions</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-[#ededed]">Credentials</h4>
            <ul className="space-y-1.5 text-[#85858b]">
              <li><Link to="/app/assessments" className="hover:text-[#ededed] transition-colors">Assessments</Link></li>
              <li><Link to="/app/certificates" className="hover:text-[#ededed] transition-colors">PDF certificates</Link></li>
              <li><Link to="/app/analytics" className="hover:text-[#ededed] transition-colors">Analytics</Link></li>
              <li><Link to="/app/leaderboard" className="hover:text-[#ededed] transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-[#ededed]">Documentation &amp; legal</h4>
            <ul className="space-y-1.5 text-[#85858b]">
              <li>
                <Link to="/wiki" className="hover:text-[#ededed] transition-colors inline-flex items-center gap-1.5">
                  <BookOpen strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>Platform wiki</span>
                </Link>
              </li>
              <li><Link to="/app/settings" className="hover:text-[#ededed] transition-colors">Settings</Link></li>
              <li>
                <button type="button" onClick={() => setLegalModal('privacy')} className="hover:text-[#ededed] transition-colors text-left">
                  Privacy policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setLegalModal('terms')} className="hover:text-[#ededed] transition-colors text-left">
                  Terms of service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#85858b]">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a1a1a6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cc38a]" />
              Services online
            </span>
          </div>
          <p className="font-mono text-xs tabular-nums">
            © {CURRENT_YEAR} Coding Task Factory · MIT License
          </p>
        </div>
        {legalModalNode}
      </footer>
    );
  }

  return (
    <footer className="border-t border-white/[0.08] bg-[#0f0f10] pt-16 pb-10 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-10 mb-10 border-b border-white/[0.08]">
          <div className="max-w-xl">
            <BrandLogo size="md" className="mb-3" />
            <p className="text-[#a1a1a6] text-sm leading-relaxed">
              Multi-language coding challenge bench with isolated test execution, structured ML/DL coursework, timed assessments, and SHA-256 verifiable PDF certificates.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://github.com/Ranjeet7680/AI-Powered-Coding-Challenge-Developer-Assessment-Platform"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-lg bg-[#19191b] border border-white/[0.08] flex items-center justify-center text-[#85858b] hover:text-[#ededed] transition-colors"
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
              className="w-9 h-9 rounded-lg bg-[#19191b] border border-white/[0.08] flex items-center justify-center text-[#85858b] hover:text-[#ededed] transition-colors"
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
              className="w-9 h-9 rounded-lg bg-[#19191b] border border-white/[0.08] flex items-center justify-center text-[#85858b] hover:text-[#ededed] transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          <div>
            <h4 className="text-xs font-medium text-[#ededed] mb-3">Workspace</h4>
            <ul className="space-y-2 text-sm text-[#85858b]">
              <li><Link to="/" className="hover:text-[#ededed] transition-colors">Home</Link></li>
              <li><Link to="/app/dashboard" className="hover:text-[#ededed] transition-colors">Dashboard</Link></li>
              <li><Link to="/app/challenges" className="hover:text-[#ededed] transition-colors">368+ Challenges</Link></li>
              <li><Link to="/app/workspace/c2-lru-cache" className="hover:text-[#ededed] transition-colors">Coding IDE</Link></li>
              <li><Link to="/app/generator" className="hover:text-[#ededed] transition-colors">Task generator</Link></li>
              <li><Link to="/app/ml-course" className="hover:text-[#ededed] transition-colors">ML course (106)</Link></li>
              <li><Link to="/app/dl-course" className="hover:text-[#ededed] transition-colors">Stanford DL (21)</Link></li>
              <li><Link to="/app/videos" className="hover:text-[#ededed] transition-colors">Video library</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium text-[#ededed] mb-3">Credentials</h4>
            <ul className="space-y-2 text-sm text-[#85858b]">
              <li><Link to="/app/submissions" className="hover:text-[#ededed] transition-colors">Submissions</Link></li>
              <li><Link to="/app/assessments" className="hover:text-[#ededed] transition-colors">Assessments</Link></li>
              <li><Link to="/app/leaderboard" className="hover:text-[#ededed] transition-colors">Leaderboard</Link></li>
              <li><Link to="/app/analytics" className="hover:text-[#ededed] transition-colors">Analytics</Link></li>
              <li><Link to="/app/certificates" className="hover:text-[#ededed] transition-colors">PDF certificates</Link></li>
              <li><Link to="/onboarding" className="hover:text-[#ededed] transition-colors">Onboarding</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium text-[#ededed] mb-3">Platform wiki</h4>
            <ul className="space-y-2 text-sm text-[#85858b]">
              <li><Link to="/wiki" className="hover:text-[#ededed] transition-colors">Wiki overview</Link></li>
              <li><Link to="/wiki/architecture" className="hover:text-[#ededed] transition-colors">Architecture &amp; schema</Link></li>
              <li><Link to="/wiki/challenge-bank" className="hover:text-[#ededed] transition-colors">Challenge bank &amp; runner</Link></li>
              <li><Link to="/wiki/security-credentials" className="hover:text-[#ededed] transition-colors">Security &amp; PDFs</Link></li>
              <li><Link to="/wiki/taskforge" className="hover:text-[#ededed] transition-colors">TaskForge Harbor 0.25</Link></li>
              <li>
                <a
                  href="https://github.com/Ranjeet7680/AI-Powered-Coding-Challenge-Developer-Assessment-Platform/tree/main/wiki"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#ededed] transition-colors"
                >
                  GitHub markdown wiki
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium text-[#ededed] mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-[#85858b]">
              <li><Link to="/login" className="hover:text-[#ededed] transition-colors">Sign in</Link></li>
              <li><Link to="/register" className="hover:text-[#ededed] transition-colors">Create account</Link></li>
              <li><Link to="/forgot-password" className="hover:text-[#ededed] transition-colors">Reset password</Link></li>
              <li>
                <Link to="/app/settings" className="hover:text-[#ededed] transition-colors inline-flex items-center gap-1.5">
                  <Terminal strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>API &amp; key settings</span>
                </Link>
              </li>
              <li><a href="/#features" className="hover:text-[#ededed] transition-colors">Features</a></li>
              <li><a href="/#pricing" className="hover:text-[#ededed] transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium text-[#ededed] mb-3">Solutions &amp; legal</h4>
            <ul className="space-y-2 text-sm text-[#85858b]">
              <li><a href="/#solutions" className="hover:text-[#ededed] transition-colors">Individual developers</a></li>
              <li><a href="/#solutions" className="hover:text-[#ededed] transition-colors">Students &amp; bootcamps</a></li>
              <li><a href="/#solutions" className="hover:text-[#ededed] transition-colors">Technical recruiters</a></li>
              <li><a href="/#faq" className="hover:text-[#ededed] transition-colors">FAQ</a></li>
              <li>
                <button type="button" onClick={() => setLegalModal('privacy')} className="hover:text-[#ededed] transition-colors text-left">
                  Privacy policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setLegalModal('terms')} className="hover:text-[#ededed] transition-colors text-left">
                  Terms of service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs text-[#85858b] gap-4">
          <p className="tabular-nums">© {CURRENT_YEAR} Coding Task Factory. All rights reserved.</p>
          <p className="font-mono">Python 3 · Node.js · TypeScript · C++20</p>
        </div>
      </div>

      {legalModalNode}
    </footer>
  );
};
