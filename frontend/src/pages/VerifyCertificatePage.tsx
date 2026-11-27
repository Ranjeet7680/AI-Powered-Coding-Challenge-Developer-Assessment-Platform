import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Copy,
  FileText,
  Lock,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api';
import { BrandLogo } from '../components/common/BrandLogo';
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
    showToast('Verification link copied.', 'success');
  };

  const handleDownloadPdf = async () => {
    if (!cert) return;
    setDownloadingPdf(true);
    try {
      await api.downloadCertificatePdf(cert.credential_id);
      showToast('Downloaded verified PDF certificate.', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to download PDF.', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141415] text-[#ededed] flex flex-col">
      <header className="border-b border-white/[0.08] bg-[#0f0f10]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="hidden sm:inline text-xs font-mono text-[#85858b]">
              / Credential registry
            </span>
          </div>

          <Link
            to="/app/certificates"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a1a1a6] hover:text-[#ededed] px-3 h-8 rounded-lg bg-[#19191b] border border-white/[0.08] transition-colors"
          >
            <ArrowLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
            <span>Certificates</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6">
        {loading ? (
          <div className="h-96 rounded-2xl bg-[#19191b] border border-white/[0.08] animate-pulse p-8" />
        ) : error || !cert ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#19191b] border border-[#e5484d]/40 text-center space-y-4">
            <ShieldCheck strokeWidth={1.5} className="w-10 h-10 text-[#e5484d] mx-auto" />
            <h1 className="text-xl font-medium text-[#ededed]">Credential record not found</h1>
            <p className="text-sm text-[#85858b] max-w-md mx-auto">
              {error || `No verified credential matching ID "${credentialId}" was found.`}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
            >
              Return home
            </Link>
          </div>
        ) : (
          <>
            <div className="p-4 sm:p-5 rounded-xl bg-[#19191b] border border-[#4cc38a]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#222225] border border-white/[0.08] flex items-center justify-center text-[#4cc38a] shrink-0">
                  <CheckCircle2 strokeWidth={1.5} className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-medium text-[#ededed]">Verified credential</h1>
                    <span className="text-xs font-mono text-[#4cc38a]">[Authentic]</span>
                  </div>
                  <p className="text-xs text-[#85858b] mt-0.5">
                    Issued by {cert.issuer_name || 'Coding Task Factory Academy'} ·{' '}
                    <span className="font-mono text-[#ededed]">{cert.credential_id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={handleCopyVerifyLink}
                  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-[#ededed] bg-[#222225] border border-white/[0.08] hover:bg-[#2a2a2e] transition-colors"
                >
                  <Copy strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="inline-flex items-center gap-1.5 px-4 h-8 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors disabled:opacity-50"
                >
                  <FileText strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>{downloadingPdf ? 'Generating' : 'Download PDF'}</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-10 rounded-2xl bg-[#19191b] border border-[#e5a00d]/45">
              <div className="border border-white/[0.08] rounded-xl p-6 sm:p-8 space-y-6 bg-[#141415]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-2.5">
                    <Award strokeWidth={1.5} className="w-5 h-5 text-[#e5a00d]" />
                    <div>
                      <p className="text-xs font-mono text-[#e5a00d]">
                        Certificate of Engineering Mastery
                      </p>
                      <p className="text-xs text-[#85858b]">{cert.issuer_name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#a1a1a6]">{cert.category}</span>
                </div>

                <div className="text-center space-y-2 py-2">
                  <p className="text-xs text-[#85858b] font-mono">Awarded to</p>
                  <h2 className="text-3xl sm:text-4xl font-medium font-serif text-[#ededed]">
                    {cert.recipient_name}
                  </h2>
                  <p className="text-xs text-[#85858b] pt-1">For verified engineering mastery in</p>
                  <h3 className="text-lg sm:text-xl font-medium text-[#ededed]">{cert.title}</h3>
                  {cert.summary && (
                    <p className="text-xs sm:text-sm text-[#a1a1a6] max-w-2xl mx-auto leading-relaxed pt-2">
                      {cert.summary}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
                  <div className="p-3 rounded-lg bg-[#19191b] border border-white/[0.08] text-center">
                    <p className="text-[11px] font-mono text-[#85858b]">Standing</p>
                    <p className="text-xs font-medium text-[#4cc38a] mt-1">{cert.grade}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#19191b] border border-white/[0.08] text-center">
                    <p className="text-[11px] font-mono text-[#85858b]">Score</p>
                    <p className="text-sm font-medium text-[#ededed] mt-1">{cert.score_percent ?? 98}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#19191b] border border-white/[0.08] text-center">
                    <p className="text-[11px] font-mono text-[#85858b]">Challenges</p>
                    <p className="text-sm font-medium text-[#ededed] mt-1">
                      {cert.challenges_completed ?? 12}+ verified
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#19191b] border border-white/[0.08] text-center">
                    <p className="text-[11px] font-mono text-[#85858b]">Lab time</p>
                    <p className="text-sm font-medium text-[#ededed] mt-1">
                      {cert.completion_hours ?? 24} hours
                    </p>
                  </div>
                </div>

                {cert.skills_verified && cert.skills_verified.length > 0 && (
                  <div className="space-y-2 text-center">
                    <p className="text-xs font-mono text-[#85858b]">Verified competencies</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {cert.skills_verified.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-3 py-1 rounded-md bg-[#19191b] text-[#a1a1a6] border border-white/[0.08]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs space-y-1 text-center sm:text-left font-mono text-[#85858b]">
                    <p>
                      Issued: <span className="text-[#ededed]">{formatCertificateDate(cert.issue_date)}</span>
                    </p>
                    <p className="flex items-center justify-center sm:justify-start gap-1">
                      <Lock strokeWidth={1.5} className="w-3 h-3 text-[#4cc38a]" />
                      <span>SHA-256: </span>
                      <span className="text-[#4cc38a]">
                        {cert.credential_hash ? `${cert.credential_hash.slice(0, 28)}...` : 'Verified'}
                      </span>
                    </p>
                    <p className="font-sans">
                      Signatory:{' '}
                      <span className="text-[#ededed] font-medium">
                        {cert.signatory_name || 'Dr. Aris Thorne'}
                      </span>{' '}
                      <span className="text-[#85858b]">
                        ({cert.signatory_title || 'Chief Curriculum Architect'})
                      </span>
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-[#ededed] shrink-0">
                    <div
                      className="grid gap-[1px]"
                      style={{ gridTemplateColumns: `repeat(${qrCells.length}, 4px)` }}
                    >
                      {qrCells.flatMap((row, r) =>
                        row.map((on, c) => (
                          <div
                            key={`${r}-${c}`}
                            className={`w-[4px] h-[4px] ${on ? 'bg-[#141415]' : 'bg-transparent'}`}
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
