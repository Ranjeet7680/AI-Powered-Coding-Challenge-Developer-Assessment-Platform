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
  const isStrong = passedCount === 5 && reqNoEmailPart && reqMatch;

  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Strong', 'Complete'];
  const strengthColors = [
    'bg-[#e5484d]',
    'bg-[#e5a00d]',
    'bg-[#e5a00d]',
    'bg-[#4cc38a]',
    'bg-[#4cc38a]',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Provide a valid email address.');
      return;
    }
    if (!reqLength) {
      setError('Password must be at least 10 characters long.');
      return;
    }
    if (!reqUpper || !reqLower || !reqNumber || !reqSpecial) {
      setError('Password must contain uppercase, lowercase, numeric, and symbol characters.');
      return;
    }
    if (!reqNoEmailPart) {
      setError('Password cannot contain your email username.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('Accept the terms of service to continue.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName.trim(), email.trim().toLowerCase(), password);
      navigate('/onboarding');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Registration failed. That email may already exist.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141415] flex flex-col text-[#ededed]">
      <div className="flex-1 flex">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#0f0f10] border-r border-white/[0.08]">
          <div>
            <BrandLogo size="lg" />
            <div className="mt-12 space-y-4 max-w-lg">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#a1a1a6]">
                <Shield strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a]" />
                <span>Account security policy active</span>
              </div>
              <h2 className="text-3xl font-medium tracking-[-0.02em] text-[#ededed] leading-snug">
                Create your developer workbench account
              </h2>
              <p className="text-[#85858b] text-sm leading-relaxed">
                Credentials are protected with 100,000-round salted PBKDF2 key derivation, HMAC-SHA256 session tokens, and brute-force lockout protection.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#19191b] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-lg bg-[#222225] border border-white/[0.08] flex items-center justify-center text-[#a1a1a6] shrink-0">
                <KeyRound strokeWidth={1.5} className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#ededed]">Salted PBKDF2 hashing</p>
                <p className="text-xs text-[#85858b] mt-0.5">100,000 derivation iterations per credential</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#19191b] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-lg bg-[#222225] border border-white/[0.08] flex items-center justify-center text-[#a1a1a6] shrink-0">
                <Shield strokeWidth={1.5} className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#ededed]">Lockout protection</p>
                <p className="text-xs text-[#85858b] mt-0.5">Constant-time checks and rate limiting</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#85858b] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4cc38a]" />
            <span>Authentication service operational</span>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
          <div className="w-full max-w-md space-y-6">
            <div className="lg:hidden">
              <BrandLogo />
            </div>

            <div>
              <h1 className="text-2xl font-medium tracking-[-0.02em] text-[#ededed]">Create account</h1>
              <p className="text-xs sm:text-sm text-[#85858b] mt-1">
                Set up your credentials to access the coding workbench
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-[#19191b] border border-[#e5484d]/50 flex items-start gap-2.5 text-xs text-[#e5484d] animate-shake">
                <AlertCircle strokeWidth={1.5} className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">Full name</label>
                <div className="relative">
                  <User strokeWidth={1.5} className="w-4 h-4 text-[#85858b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Chen"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 bg-[#19191b] border border-white/[0.1] rounded-lg pl-10 pr-4 text-sm text-[#ededed] placeholder-[#85858b] focus:outline-none focus:border-[#e5a00d] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">Email</label>
                <div className="relative">
                  <Mail strokeWidth={1.5} className="w-4 h-4 text-[#85858b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 bg-[#19191b] border border-white/[0.1] rounded-lg pl-10 pr-4 text-sm text-[#ededed] placeholder-[#85858b] focus:outline-none focus:border-[#e5a00d] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">Password</label>
                <div className="relative">
                  <Lock strokeWidth={1.5} className="w-4 h-4 text-[#85858b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="10+ chars, Aa, 0-9, symbol"
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

                {password && (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex gap-1.5 h-1">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 rounded-full transition-colors ${
                            passedCount >= step ? strengthColors[passedCount - 1] : 'bg-[#222225]'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#85858b]">Strength</span>
                      <span className={passedCount === 5 ? 'text-[#4cc38a]' : 'text-[#e5a00d]'}>
                        {strengthLabels[passedCount - 1] || 'Weak'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0f0f10] border border-white/[0.08] space-y-1.5 text-xs font-mono">
                      {[
                        { ok: reqLength, label: `At least 10 characters (${password.length}/10)` },
                        { ok: reqUpper, label: 'Uppercase letter (A-Z)' },
                        { ok: reqLower, label: 'Lowercase letter (a-z)' },
                        { ok: reqNumber, label: 'Numeric digit (0-9)' },
                        { ok: reqSpecial, label: 'Special symbol (!@#$...)' },
                        { ok: reqNoEmailPart, label: 'Excludes email username' },
                      ].map((req) => (
                        <div key={req.label} className="flex items-center gap-2 tabular-nums">
                          {req.ok ? (
                            <Check strokeWidth={1.5} className="w-3.5 h-3.5 text-[#4cc38a] shrink-0" />
                          ) : (
                            <XCircle strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b] shrink-0" />
                          )}
                          <span className={req.ok ? 'text-[#ededed]' : 'text-[#85858b]'}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1a6] mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock strokeWidth={1.5} className="w-4 h-4 text-[#85858b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full h-10 bg-[#19191b] border rounded-lg pl-10 pr-10 text-sm text-[#ededed] placeholder-[#85858b] focus:outline-none transition-colors ${
                      confirmPassword && !reqMatch
                        ? 'border-[#e5484d]/80 focus:border-[#e5484d]'
                        : 'border-white/[0.1] focus:border-[#e5a00d]'
                    }`}
                  />
                  {confirmPassword && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {reqMatch ? (
                        <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a]" />
                      ) : (
                        <XCircle strokeWidth={1.5} className="w-4 h-4 text-[#e5484d]" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-[#a1a1a6]">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-white/20 bg-[#19191b] accent-[#e5a00d]"
                />
                <label htmlFor="terms" className="cursor-pointer">
                  I agree to the terms of service and security policy
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || (password.length > 0 && !isStrong)}
                className="w-full h-10 px-4 rounded-lg text-sm font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-[#141415]/30 border-t-[#141415] rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-[#85858b]">
              Already registered?{' '}
              <Link to="/login" className="font-medium text-[#ededed] hover:text-[#e5a00d] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl w-full mx-auto px-4 pb-6">
        <Footer compact />
      </div>
    </div>
  );
};
