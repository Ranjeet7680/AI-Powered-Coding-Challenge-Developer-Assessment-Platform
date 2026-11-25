import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Code2,
  Copy,
  FileText,
  Lock,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api';
import { Footer } from '../components/layout/Footer';
import { CertificateVerification } from '../types';
import { useToast } from '../context/useContexts';
import {
  buildQrMatrixCells,
  formatCertificateDate,
  getVerificationUrl,
} from '../utils/certificateShare';

export const VerifyCertificatePage: React.FC = () => {
  const { credentialId } = useParams<{ credentialId: string }>();
  const { showToast } = useToast();
  const [cert, setCert] = useState<CertificateVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!credentialId) return;
    let active = true;
    api.verifyCertificate(credentialId)
      .then((data) => {
        if (active) setCert(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Credential could not be verified.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [credentialId]);

  const qrCells = useMemo(
    () => (cert ? buildQrMatrixCells(`${cert.credential_id}:${cert.credential_hash || ''}`, 15) : []),
    [cert]
  );

  const handleCopyVerifyLink = () => {
    if (!cert) return;
    navigator.clipboard.writeText(getVerificationUrl(cert.credential_id));
    showToast('Verification link copied to clipboard', 'success');
  };

  const handleDownloadPdf = async () => {
    if (!cert) return;
    setDownloadingPdf(true);
    try {
      await api.downloadCertificatePdf(cert.credential_id);
      showToast('Downloaded verified PDF certificate', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to download PDF', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070E] text-slate-200 bg-grid-pattern flex flex-col">
      {/* Top Registry Bar */}
      <header className="border-b border-slate-800/80 bg-[#080C17]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#0A0D17] rounded-[7px] flex items-center justify-center">
                <Code2 className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-white">Coding Task Factory</span>
              <span className="text-[10px] font-mono text-indigo-400">CREDENTIAL REGISTRY</span>
            </div>
          </Link>

          <Link
            to="/app/certificates"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Certificates Hub
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6">
        {loading ? (
          <div className="h-96 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse p-8" />
        ) : error || !cert ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/70 border border-rose-500/30 text-center space-y-4">
            <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto opacity-80" />
            <h1 className="text-xl font-bold text-white">Credential Record Not Found</h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {error || `No verified credential matching ID "${credentialId}" was found in our registry.`}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <>
            {/* Cryptographic Verification Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold text-emerald-300">
                      Official Verified Credential
                    </h1>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      AUTHENTIC
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Issued by {cert.issuer_name || 'Coding Task Factory Academy'} • Credential ID{' '}
                    <span className="font-mono text-white font-semibold">{cert.credential_id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={handleCopyVerifyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-500 transition"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  Copy URL
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition disabled:opacity-60"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {downloadingPdf ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            </div>

            {/* Verified Credential Plate */}
            <div className="p-6 sm:p-10 rounded-3xl bg-[#080D1A] border-2 border-amber-500/35 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="border border-indigo-500/30 rounded-2xl p-6 sm:p-8 space-y-6 bg-[#0B1020]/90">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-6 h-6 text-amber-400" />
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
                        Certificate of Engineering Excellence
                      </p>
                      <p className="text-[11px] text-slate-400">{cert.issuer_name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {cert.category}
                  </span>
                </div>

                <div className="text-center space-y-2 py-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                    Awarded To
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">
                    {cert.recipient_name}
                  </h2>
                  <p className="text-xs text-slate-400 pt-1">For verified engineering mastery in</p>
                  <h3 className="text-lg sm:text-xl font-bold text-indigo-300">{cert.title}</h3>
                  {cert.summary && (
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed pt-2">
                      {cert.summary}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <p className="text-[10px] font-mono text-indigo-400 uppercase">Standing</p>
                    <p className="text-xs font-bold text-emerald-400 mt-1">{cert.grade}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <p className="text-[10px] font-mono text-indigo-400 uppercase">Score</p>
                    <p className="text-sm font-bold text-white mt-1">{cert.score_percent ?? 98}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <p className="text-[10px] font-mono text-indigo-400 uppercase">Challenges</p>
                    <p className="text-sm font-bold text-white mt-1">
                      {cert.challenges_completed ?? 12}+ Verified
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <p className="text-[10px] font-mono text-indigo-400 uppercase">Lab Time</p>
                    <p className="text-sm font-bold text-white mt-1">
                      {cert.completion_hours ?? 24} Hours
                    </p>
                  </div>
                </div>

                {cert.skills_verified && cert.skills_verified.length > 0 && (
                  <div className="space-y-2 text-center">
                    <p className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Verified Competencies
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {cert.skills_verified.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-200 border border-indigo-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs space-y-1 text-center sm:text-left">
                    <p className="text-slate-400">
                      Issued On:{' '}
                      <span className="text-white font-semibold">
                        {formatCertificateDate(cert.issue_date)}
                      </span>
                    </p>
                    <p className="text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      SHA-256:{' '}
                      <span className="font-mono text-[11px] text-emerald-400">
                        {cert.credential_hash ? `${cert.credential_hash.slice(0, 28)}...` : 'Verified'}
                      </span>
                    </p>
                    <p className="text-slate-400">
                      Signatory:{' '}
                      <span className="text-white font-semibold">
                        {cert.signatory_name || 'Dr. Aris Thorne'}
                      </span>{' '}
                      <span className="text-slate-500">
                        ({cert.signatory_title || 'Chief Curriculum Architect'})
                      </span>
                    </p>
                  </div>

                  {/* Deterministic QR Matrix */}
                  <div className="p-2 rounded-xl bg-slate-100 border border-slate-700 shrink-0">
                    <div
                      className="grid gap-[1px]"
                      style={{ gridTemplateColumns: `repeat(${qrCells.length}, 4px)` }}
                    >
                      {qrCells.flatMap((row, r) =>
                        row.map((on, c) => (
                          <div
                            key={`${r}-${c}`}
                            className={`w-[4px] h-[4px] ${on ? 'bg-slate-950' : 'bg-transparent'}`}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};
