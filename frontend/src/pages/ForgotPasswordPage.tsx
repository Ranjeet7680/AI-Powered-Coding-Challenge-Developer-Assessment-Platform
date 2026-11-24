import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { api } from '../services/api';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.forgotPassword(email);
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <BrandLogo size="md" />
        </div>

        {!isSubmitted ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-xs text-slate-400 mb-6">
              Enter your email address and we'll send you a secure verification link to recover access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Check Your Inbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We have dispatched a password reset link to <strong className="text-slate-200">{email}</strong>. Please click the link within 15 minutes to configure a new password.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Didn't receive email? Try another address
            </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-800">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
