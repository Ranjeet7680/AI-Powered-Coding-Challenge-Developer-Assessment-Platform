import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

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

  const rawFrom = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const from = typeof rawFrom === 'string' && rawFrom.startsWith('/') && !rawFrom.startsWith('//')
    ? rawFrom
    : '/app/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] flex">
      {/* Split-Screen Left: Brand Showcase & Testimonial */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-[#0B0F1E] via-[#080C17] to-[#0A0D18] border-r border-slate-800/80 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <BrandLogo size="lg" />
          <div className="mt-12 space-y-4 max-w-lg">
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
              Master Algorithmic Thinking with AI-Engineered Precision.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Experience the unified platform where developers solve bespoke challenges, receive real-time code reviews, and automate technical assessments.
            </p>
          </div>
        </div>

        {/* Live Code Card Snippet Visual */}
        <div className="relative z-10 my-8 p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>automated_evaluation.py</span>
            </div>
            <span className="text-emerald-400 font-bold">100% Score</span>
          </div>
          <div className="font-mono text-xs text-slate-300 space-y-1">
            <p className="text-indigo-400">// Time complexity: O(1) optimal</p>
            <p className="text-cyan-300">def evaluate_candidate(solution):</p>
            <p className="pl-4 text-slate-300">result = sandbox.run_tests(solution)</p>
            <p className="pl-4 text-emerald-400">return "Candidate Ready for Staff Engineering"</p>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
          <p className="text-xs text-slate-300 italic leading-relaxed">
            "Coding Task Factory transformed our technical interview pipeline. Candidates solve dynamic AI-synthesized problems that prevent regurgitated answers."
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center font-bold text-xs text-indigo-300">
              DK
            </div>
            <div>
              <p className="text-xs font-semibold text-white">David Kumar</p>
              <p className="text-[10px] text-slate-400">Head of Engineering @ CloudScale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Split-Screen Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <BrandLogo size="md" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In to Workstation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Protected by Salted PBKDF2 (100,000 rounds) & HMAC-SHA256 Token Encryption.
            </p>
          </div>

          {/* Error Banner with Lockout Indicator */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <span className="w-2 h-2 rounded-full bg-rose-400 mt-1 shrink-0" />
              <div className="space-y-0.5">
                <p className="font-semibold">{error}</p>
                {error.includes("locked") && (
                  <p className="text-[11px] text-rose-400/80">Account temporarily locked by security defense policy.</p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-800"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition active:scale-98 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
