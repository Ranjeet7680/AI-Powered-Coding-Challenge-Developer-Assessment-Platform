import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useContexts';
import { BrandLogo } from '../components/common/BrandLogo';
import { Footer } from '../components/layout/Footer';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  KeyRound,
  Check,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const emailPrefix = email.trim().split('@')[0]?.toLowerCase() || '';
  const reqLength = password.length >= 10;
  const reqUpper = /[A-Z]/.test(password);
  const reqLower = /[a-z]/.test(password);
  const reqNumber = /[0-9]/.test(password);
  const reqSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const reqNoEmailPart = !emailPrefix || !password.toLowerCase().includes(emailPrefix);
  const reqMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const passedCount = [reqLength, reqUpper, reqLower, reqNumber, reqSpecial].filter(Boolean).length;
  const isUnhackable = passedCount === 5 && reqNoEmailPart && reqMatch;

  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Strong', 'Unhackable Shield'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!reqLength) {
      setError('Security requirement: Password must be at least 10 characters long.');
      return;
    }
    if (!reqUpper || !reqLower || !reqNumber || !reqSpecial) {
      setError('Security requirement: Password must contain uppercase, lowercase, numbers, and special symbols.');
      return;
    }
    if (!reqNoEmailPart) {
      setError('Security requirement: Password cannot contain your email username.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }
    if (!agreeTerms) {
      setError('You must accept the terms of service to continue.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName.trim(), email.trim().toLowerCase(), password);
      navigate('/onboarding');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. That email might already be registered.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070E] flex flex-col">
      <div className="flex-1 flex">
      {/* Left split screen - Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-[#0B1020] via-[#070B15] to-[#080B14] border-r border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-35 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <BrandLogo size="lg" />
          <div className="mt-12 space-y-4 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Zero-Trust Enterprise Account Security Active</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
              Build Smarter. Code Better. Get Evaluated Faster.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Create your verified developer workstation. All accounts are protected with 100,000-round salted PBKDF2 cryptography, HMAC-SHA256 tokens, and automated brute-force defenses.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3 max-w-md">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Salted PBKDF2 Password Hashing</p>
              <p className="text-[11px] text-slate-400">100,000 key-derivation iterations immune to rainbow-table attacks.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Brute-Force & Credential Stuffing Shield</p>
              <p className="text-[11px] text-slate-400">Automatic account lockout defense with constant-time verification.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Status: Fully Operational & Guarded</span>
        </div>
      </div>

      {/* Right split screen - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden">
            <BrandLogo />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Create Strong Account</h1>
            <p className="text-xs text-slate-400 mt-1">
              Set up your high-security developer credentials to access the workspace.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work or Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="alex.chen@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Unhackable Strong Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 10 chars, Aa, 123, !@#"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/70 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-2.5 space-y-2">
                  <div className="flex gap-1.5 h-1.5">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                          passedCount >= step ? strengthColors[passedCount - 1] : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-mono">Entropy Security Level:</span>
                    <span
                      className={`font-bold font-mono ${
                        passedCount === 5 ? 'text-emerald-400' : passedCount >= 3 ? 'text-yellow-400' : 'text-rose-400'
                      }`}
                    >
                      {strengthLabels[passedCount - 1] || 'Insecure'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/90 space-y-1.5 text-[11px] font-mono">
                    {[
                      { ok: reqLength, label: `At least 10 characters length (${password.length}/10)` },
                      { ok: reqUpper, label: 'At least one uppercase letter (A-Z)' },
                      { ok: reqLower, label: 'At least one lowercase letter (a-z)' },
                      { ok: reqNumber, label: 'At least one numeric digit (0-9)' },
                      { ok: reqSpecial, label: 'At least one special symbol (!@#$%^&*...)' },
                      { ok: reqNoEmailPart, label: 'Does not contain your email username' },
                    ].map((req) => (
                      <div key={req.label} className="flex items-center gap-2">
                        {req.ok ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                        <span className={req.ok ? 'text-slate-200' : 'text-slate-500'}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your strong password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-slate-900/70 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
                    confirmPassword && !reqMatch
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-slate-700/80 focus:border-indigo-500'
                  }`}
                />
                {confirmPassword && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {reqMatch ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-800"
              />
              <label htmlFor="terms" className="cursor-pointer">
                I agree to the Terms of Service & Security Protocol
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || (password.length > 0 && !isUnhackable)}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition active:scale-95 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
                isUnhackable
                  ? 'bg-gradient-to-r from-emerald-600 via-indigo-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 shadow-emerald-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Create Strong Account & Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Sign In to Workstation
            </Link>
          </p>
        </div>
      </div>
      </div>
      <Footer compact />
    </div>
  );
};
