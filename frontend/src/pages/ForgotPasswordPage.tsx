import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { Footer } from '../components/layout/Footer';
import { api } from '../services/api';
import { useToast } from '../context/useContexts';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      showToast(res.message, 'info');
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141415] flex flex-col text-[#ededed]">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#19191b] border border-white/[0.1] text-center">
          <div className="flex justify-center mb-6">
            <BrandLogo size="md" />
          </div>

          {!isSubmitted ? (
            <>
              <h1 className="text-2xl font-medium tracking-[-0.02em] text-[#ededed] mb-2">
                Reset password
              </h1>
              <p className="text-xs text-[#85858b] mb-6">
                Enter your account email to receive password recovery instructions.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
                      className="w-full h-10 bg-[#141415] border border-white/[0.1] rounded-lg pl-10 pr-4 text-sm text-[#ededed] placeholder-[#85858b] focus:outline-none focus:border-[#e5a00d] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 px-4 rounded-lg text-sm font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-[#141415]/30 border-t-[#141415] rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send reset link</span>
                      <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-lg bg-[#222225] border border-white/[0.1] flex items-center justify-center text-[#4cc38a] mx-auto">
                <CheckCircle2 strokeWidth={1.5} className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-medium text-[#ededed]">Check your inbox</h2>
              <p className="text-xs text-[#85858b] leading-relaxed">
                If an account exists for <strong className="font-medium text-[#ededed]">{email}</strong>, verification instructions have been sent.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-[#a1a1a6] hover:text-[#ededed] transition-colors"
              >
                Try another email
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#85858b] hover:text-[#ededed] transition-colors"
            >
              <ArrowLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl w-full mx-auto px-4 pb-6">
        <Footer compact />
      </div>
    </div>
  );
};
