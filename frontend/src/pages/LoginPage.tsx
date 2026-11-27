import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useContexts';
import { BrandLogo } from '../components/common/BrandLogo';
import { Footer } from '../components/layout/Footer';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Terminal, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/app/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('Enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(normalizedEmail, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Sign in failed. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('developer@codingtaskfactory.io');
    setPassword('Developer@2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#141415] flex flex-col text-[#ededed]">
      <div className="flex-1 flex">
        {/* Left Panel: Technical Bench Context */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#0f0f10] border-r border-white/[0.08]">
          <div>
            <BrandLogo size="lg" />
            <div className="mt-12 space-y-4 max-w-lg">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#a1a1a6]">
                <Shield strokeWidth={1.5} className="w-4 h-4 text-[#e5a00d]" />
                <span>Salted PBKDF2 (100k rounds) · HS256 JWT</span>
              </div>
              <h1 className="text-3xl font-medium tracking-[-0.02em] text-[#ededed] leading-snug">
                Algorithmic practice, isolated execution, and verifiable assessment
              </h1>
              <p className="text-[#85858b] text-sm leading-relaxed">
                Sign in to access 368+ multi-language coding problems, timed evaluations, ML/DL coursework, and SHA-256 PDF credentials.
              </p>
            </div>
          </div>

          <div className="my-8 p-5 rounded-xl bg-[#19191b] border border-white/[0.08]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] text-xs font-mono">
              <div className="flex items-center gap-2 text-[#a1a1a6]">
                <Terminal strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b]" />
                <span>sandbox_runner.py</span>
              </div>
              <span className="text-[#4cc38a]">[PASS] 100%</span>
            </div>
            <div className="font-mono text-xs text-[#a1a1a6] space-y-1">
              <p className="text-[#85858b]"># Complexity verification: O(1)</p>
              <p className="text-[#ededed]">def evaluate_submission(code):</p>
              <p className="pl-4">report = sandbox.execute_tests(code)</p>
              <p className="pl-4 text-[#4cc38a]">return report.sha256_attestation</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#19191b] border border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#85858b]">
            <span>Runtimes: Python 3 · Node · TS · C++20</span>
            <span className="text-[#4cc38a]">Ready</span>
          </div>
        </div>

        {/* Right Panel: Sign-In Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-6">
                <BrandLogo size="md" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed]">
                Sign in
              </h2>
              <p className="text-xs sm:text-sm text-[#85858b] mt-1.5">
                Protected with PBKDF2 hashing and constant-time verification
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-[#19191b] border border-[#e5484d]/50 text-[#e5484d] text-xs flex items-start gap-2.5 animate-shake">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e5484d] mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-medium">{error}</p>
                  {error.includes('locked') && (
                    <p className="text-[11px] text-[#e5484d]/80">
                      Account temporarily locked after repeated attempts.
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail strokeWidth={1.5} className="w-4 h-4 text-[#85858b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 bg-[#19191b] border border-white/[0.1] rounded-lg pl-10 pr-4 text-sm text-[#ededed] placeholder-[#85858b] focus:outline-none focus:border-[#e5a00d] transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#a1a1a6]">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#a1a1a6] hover:text-[#ededed] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock strokeWidth={1.5} className="w-4 h-4 text-[#85858b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 bg-[#19191b] border border-white/[0.1] rounded-lg pl-10 pr-10 text-sm text-[#ededed] placeholder-[#85858b] focus:outline-none focus:border-[#e5a00d] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85858b] hover:text-[#ededed]"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff strokeWidth={1.5} className="w-4 h-4" /> : <Eye strokeWidth={1.5} className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#a1a1a6]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-[#19191b] accent-[#e5a00d]"
                  />
                  <span>Keep session active (7 days)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 px-4 rounded-lg text-sm font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-[#141415]/30 border-t-[#141415] rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="space-y-2.5 text-center text-xs text-[#85858b]">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-[#a1a1a6] hover:text-[#ededed] font-mono underline underline-offset-4 transition-colors"
              >
                Use demo credentials (developer@codingtaskfactory.io)
              </button>
              <p>
                No account yet?{' '}
                <Link to="/register" className="font-medium text-[#ededed] hover:text-[#e5a00d] transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl w-full mx-auto px-4 pb-6">
        <Footer compact />
      </div>
    </div>
  );
};
