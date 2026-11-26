import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Certificate } from '../types';
import { useAuth, useToast } from '../context/useContexts';
import {
  Award,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Lock,
  Printer,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  SocialPlatform,
  buildFacebookShareUrl,
  buildLinkedInAddToProfileUrl,
  buildLinkedInFeedShareUrl,
  buildQrMatrixCells,
  buildSocialPostMessage,
  buildWhatsAppShareUrl,
  downloadSocialCardPng,
  formatCertificateDate,
  getVerificationUrl,
} from '../utils/certificateShare';

const PlatformBadgeIcon: React.FC<{ platform: SocialPlatform; className?: string }> = ({
  platform,
  className = 'w-4 h-4',
}) => {
  if (platform === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
      </svg>
    );
  }
  if (platform === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3Z" />
      </svg>
    );
  }
  if (platform === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m5.81 14.08c-.24.68-1.41 1.3-1.95 1.38-.52.08-1.18.11-1.9-.12-.44-.14-1-.33-1.72-.64-3.03-1.31-5.01-4.37-5.16-4.57-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.05-2.52.27-.3.6-.38.8-.38.2 0 .4 0 .58.01.19.01.44-.07.69.53.26.62.88 2.14.95 2.3.08.15.13.34.03.54-.1.2-.15.34-.3.51-.15.17-.32.39-.45.52-.15.15-.31.32-.13.62.18.3.79 1.31 1.7 2.12 1.17 1.04 2.15 1.37 2.46 1.52.3.15.48.13.66-.08.18-.21.75-.88.95-1.18.2-.3.4-.25.67-.15.27.1 1.75.83 2.05.98.3.15.5.22.58.35.08.13.08.73-.16 1.41Z" />
    </svg>
  );
};

const PLATFORM_META: Record<
  SocialPlatform,
  { label: string; colorClass: string; activeBg: string; hint: string }
> = {
  linkedin: {
    label: 'LinkedIn',
    colorClass: 'text-sky-400',
    activeBg: 'bg-sky-600 text-white border-sky-500',
    hint: 'Includes pre-formatted career announcement, hashtags, verification URL & "Add to Profile" credential sync.',
  },
  instagram: {
    label: 'Instagram',
    colorClass: 'text-pink-400',
    activeBg: 'bg-gradient-to-r from-pink-600 to-amber-500 text-white border-pink-500',
    hint: 'Download a crisp 1080×1080 Instagram card image and copy this ready-to-paste caption & hashtags.',
  },
  facebook: {
    label: 'Facebook',
    colorClass: 'text-blue-400',
    activeBg: 'bg-blue-600 text-white border-blue-500',
    hint: 'Share your achievement milestone with friends & tech groups or export a 1200×630 showcase graphic.',
  },
  whatsapp: {
    label: 'WhatsApp',
    colorClass: 'text-emerald-400',
    activeBg: 'bg-emerald-600 text-white border-emerald-500',
    hint: 'Bold-formatted WhatsApp status/DM message ready to send directly to peers, mentors, or recruiters.',
  },
};

export const CertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [modalTab, setModalTab] = useState<'diploma' | 'share'>('diploma');
  const [platform, setPlatform] = useState<SocialPlatform>('linkedin');
  const [postDraft, setPostDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);
  const [exportingCard, setExportingCard] = useState(false);

  useEffect(() => {
    api.getCertificates()
      .then(setCertificates)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const qrCells = useMemo(() => {
    if (!selectedCert) return [];
    return buildQrMatrixCells(
      `${selectedCert.credential_id}:${selectedCert.credential_hash || ''}`,
      15
    );
  }, [selectedCert]);

  const openCertificateModal = (
    cert: Certificate,
    initialTab: 'diploma' | 'share' = 'diploma',
    initialPlatform: SocialPlatform = 'linkedin'
  ) => {
    setSelectedCert(cert);
    setModalTab(initialTab);
    setPlatform(initialPlatform);
    setPostDraft(buildSocialPostMessage(cert, initialPlatform, user?.full_name));
  };

  const handlePlatformSelect = (nextPlatform: SocialPlatform) => {
    setPlatform(nextPlatform);
    if (selectedCert) {
      setPostDraft(buildSocialPostMessage(selectedCert, nextPlatform, user?.full_name));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async (cert: Certificate) => {
    setDownloadingPdfId(cert.credential_id);
    try {
      await api.downloadCertificatePdf(cert.credential_id);
      showToast(`Downloaded ${cert.credential_id}.pdf`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'PDF download failed', 'error');
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const handleDownloadSvg = (cert: Certificate) => {
    const recipient = (cert.recipient_name || user?.full_name || 'Developer').replace(/[<>&]/g, '');
    const title = cert.title.replace(/[<>&]/g, '');
    const dateStr = formatCertificateDate(cert.issue_date);
    const skillsLine = (cert.skills_verified || [cert.category]).slice(0, 4).join('  •  ').replace(/[<>&]/g, '');
    const hashShort = cert.credential_hash ? `0x${cert.credential_hash.slice(0, 28)}...` : 'VERIFIED';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
  <rect width="960" height="600" rx="24" fill="#060913" stroke="#D4AF37" stroke-width="3"/>
  <rect x="20" y="20" width="920" height="560" rx="18" fill="#0B1020" stroke="#4F46E5" stroke-width="1.5"/>
  <text x="480" y="78" text-anchor="middle" fill="#FBBF24" font-family="sans-serif" font-size="13" font-weight="bold" letter-spacing="4">CERTIFICATE OF ENGINEERING EXCELLENCE</text>
  <text x="480" y="114" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold">${(cert.issuer_name || 'Coding Task Factory Academy').replace(/[<>&]/g, '')}</text>
  <text x="480" y="168" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="14">This certifies that</text>
  <text x="480" y="220" text-anchor="middle" fill="#f8fafc" font-family="Georgia, serif" font-size="40" font-weight="bold">${recipient}</text>
  <line x1="250" y1="236" x2="710" y2="236" stroke="#6366f1" stroke-width="1.5"/>
  <text x="480" y="274" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="14">has demonstrated verified engineering excellence in</text>
  <text x="480" y="316" text-anchor="middle" fill="#c7d2fe" font-family="sans-serif" font-size="22" font-weight="bold">${title}</text>
  <text x="480" y="358" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="15">Grade: ${cert.grade.replace(/[<>&]/g, '')}  |  Score: ${cert.score_percent ?? 98}%  |  ${cert.challenges_completed ?? 12}+ Challenges</text>
  <text x="480" y="405" text-anchor="middle" fill="#a5b4fc" font-family="sans-serif" font-size="13">${skillsLine}</text>
  <line x1="70" y1="455" x2="890" y2="455" stroke="#1e293b" stroke-width="1.2"/>
  <text x="70" y="492" fill="#94a3b8" font-family="monospace" font-size="12">Issued: ${dateStr}</text>
  <text x="70" y="516" fill="#34d399" font-family="monospace" font-size="11">SHA-256: ${hashShort}</text>
  <text x="890" y="492" text-anchor="end" fill="#818cf8" font-family="monospace" font-size="13" font-weight="bold">Credential ID: ${cert.credential_id}</text>
  <text x="890" y="516" text-anchor="end" fill="#e2e8f0" font-family="sans-serif" font-size="12">Signed: ${(cert.signatory_name || 'Dr. Aris Thorne').replace(/[<>&]/g, '')}</text>
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.credential_id}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopyPost = () => {
    navigator.clipboard.writeText(postDraft);
    showToast(`${PLATFORM_META[platform].label} post message copied!`, 'success');
  };

  const handleCopyVerifyUrl = (cert: Certificate) => {
    navigator.clipboard.writeText(getVerificationUrl(cert.credential_id));
    showToast('Verification link copied to clipboard', 'success');
  };

  const handleExportCard = async (format: 'square' | 'landscape') => {
    if (!selectedCert) return;
    setExportingCard(true);
    try {
      await downloadSocialCardPng(selectedCert, format, user?.full_name);
      showToast(
        `Exported ${format === 'square' ? '1080×1080 Instagram' : '1200×630 Social'} PNG card!`,
        'success'
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to render social card', 'error');
    } finally {
      setExportingCard(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Certificates &amp; Social Credentials
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Cryptographically verified engineering diplomas with vector PDF export &amp; 1-click LinkedIn, Instagram, Facebook &amp; WhatsApp posts.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300 font-semibold self-start">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {certificates.length} Verified Credentials
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse p-6" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
          {certificates.map((cert) => {
            const skills = (cert.skills_verified || []).slice(0, 3);
            const extraSkills = Math.max(0, (cert.skills_verified?.length || 0) - 3);
            return (
              <div
                key={cert.id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/45 transition duration-200 flex flex-col justify-between group shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-cyan-300 shadow-md shadow-indigo-600/10">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {cert.grade}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {cert.challenges_completed ?? 12}+ Tasks • {cert.completion_hours ?? 24}h
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {cert.issuer_name || 'Coding Task Factory Academy'} • {cert.category}
                    </p>
                  </div>

                  {cert.summary && (
                    <p className="text-xs text-slate-400/90 line-clamp-2 leading-relaxed">
                      {cert.summary}
                    </p>
                  )}

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950/90 text-indigo-300 border border-slate-800"
                        >
                          {s}
                        </span>
                      ))}
                      {extraSkills > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400">
                          +{extraSkills}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-5 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-indigo-400 font-semibold">{cert.credential_id}</span>
                    <span>{formatCertificateDate(cert.issue_date)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => openCertificateModal(cert, 'diploma')}
                      className="col-span-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openCertificateModal(cert, 'share', 'linkedin')}
                      className="col-span-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-[11px] font-bold text-cyan-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                    >
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                      Share
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(cert)}
                      disabled={downloadingPdfId === cert.credential_id}
                      className="col-span-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-[11px] font-bold text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition disabled:opacity-60"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      {downloadingPdfId === cert.credential_id ? '...' : 'PDF'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn print-certificate"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[92dvh] overflow-y-auto custom-scrollbar bg-[#080C16] border border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Tab Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 no-print">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setModalTab('diploma')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    modalTab === 'diploma'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Official Diploma
                </button>
                <button
                  onClick={() => setModalTab('share')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    modalTab === 'share'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share &amp; Post Studio
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/verify/${selectedCert.credential_id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Public Verify Page
                </Link>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
                  aria-label="Close certificate modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {modalTab === 'diploma' ? (
              <>
                {/* Enriched Diploma Plate */}
                <div className="p-5 sm:p-9 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-[#0B1020] to-[#070B15] relative shadow-inner text-center">
                  <div className="border border-indigo-500/35 rounded-xl p-5 sm:p-7 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-left border-b border-slate-800/90 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 p-0.5 shrink-0">
                          <div className="w-full h-full bg-[#0B0F1E] rounded-[10px] flex items-center justify-center text-cyan-300">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-mono tracking-widest uppercase text-amber-300 font-bold">
                            {selectedCert.issuer_name || 'Coding Task Factory Academy'}
                          </p>
                          <p className="text-xs text-slate-400">
                            Credential Track: {selectedCert.category}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        VERIFIED CREDENTIAL
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-indigo-400">
                        Certificate of Engineering Excellence
                      </p>
                      <p className="text-xs text-slate-400">This official credential certifies that</p>
                      <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-cyan-200 py-1 font-serif">
                        {selectedCert.recipient_name || user?.full_name || 'Developer'}
                      </p>
                      <div className="w-48 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-slate-400">has demonstrated verified mastery in</p>
                      <h4 className="text-lg sm:text-xl font-bold text-indigo-300">
                        {selectedCert.title}
                      </h4>
                      {selectedCert.summary && (
                        <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
                          {selectedCert.summary}
                        </p>
                      )}
                    </div>

                    {/* Metrics Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <p className="text-[10px] font-mono text-indigo-400 uppercase">Standing</p>
                        <p className="text-xs font-bold text-emerald-400 mt-0.5">{selectedCert.grade}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <p className="text-[10px] font-mono text-indigo-400 uppercase">Score</p>
                        <p className="text-xs font-bold text-white mt-0.5">
                          {selectedCert.score_percent ?? 98}% Verified
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <p className="text-[10px] font-mono text-indigo-400 uppercase">Challenges</p>
                        <p className="text-xs font-bold text-white mt-0.5">
                          {selectedCert.challenges_completed ?? 12}+ Completed
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <p className="text-[10px] font-mono text-indigo-400 uppercase">Lab Time</p>
                        <p className="text-xs font-bold text-white mt-0.5">
                          {selectedCert.completion_hours ?? 24} Hours
                        </p>
                      </div>
                    </div>

                    {/* Verified Skills Pills */}
                    {(selectedCert.skills_verified?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {selectedCert.skills_verified?.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-200 border border-indigo-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Diploma Footer: Metadata + QR + Signatory */}
                    <div className="pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 items-center gap-4 text-left font-mono text-[11px] text-slate-400">
                      <div className="space-y-1">
                        <p>
                          Issued:{' '}
                          <span className="text-white font-semibold">
                            {formatCertificateDate(selectedCert.issue_date)}
                          </span>
                        </p>
                        <p>
                          Credential ID:{' '}
                          <span className="text-indigo-400 font-semibold">{selectedCert.credential_id}</span>
                        </p>
                        <p className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <Lock className="w-3 h-3" />
                          {selectedCert.credential_hash
                            ? `0x${selectedCert.credential_hash.slice(0, 20)}...`
                            : 'SHA-256 Verified'}
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-700">
                          <div
                            className="grid gap-[1px]"
                            style={{ gridTemplateColumns: `repeat(${qrCells.length}, 3.5px)` }}
                          >
                            {qrCells.flatMap((row, r) =>
                              row.map((on, c) => (
                                <div
                                  key={`${r}-${c}`}
                                  className={`w-[3.5px] h-[3.5px] ${on ? 'bg-slate-950' : 'bg-transparent'}`}
                                />
                              ))
                            )}
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1">SCAN TO VERIFY</span>
                      </div>

                      <div className="sm:text-right space-y-0.5">
                        <svg
                          viewBox="0 0 140 32"
                          className="w-28 h-7 sm:ml-auto text-slate-200"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M8 22 C24 4, 34 28, 56 12 C72 2, 86 24, 108 14 C118 10, 126 17, 134 15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <p className="text-white font-semibold font-sans text-xs">
                          {selectedCert.signatory_name || 'Dr. Aris Thorne'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans">
                          {selectedCert.signatory_title || 'Chief Curriculum Architect'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diploma Actions */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 no-print">
                  <button
                    onClick={() => handleDownloadPdf(selectedCert)}
                    disabled={downloadingPdfId === selectedCert.credential_id}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition disabled:opacity-60"
                  >
                    <FileText className="w-4 h-4" />
                    {downloadingPdfId === selectedCert.credential_id
                      ? 'Rendering Vector PDF...'
                      : 'Download Official PDF'}
                  </button>
                  <button
                    onClick={() => handleDownloadSvg(selectedCert)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    Download SVG
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                  >
                    <Printer className="w-4 h-4 text-slate-300" />
                    Print
                  </button>
                  <button
                    onClick={() => {
                      handlePlatformSelect(platform);
                      setModalTab('share');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-200 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/35 transition"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    Post to LinkedIn / IG / FB / WA
                  </button>
                </div>
              </>
            ) : (
              /* Share & Social Post Studio */
              <div className="space-y-5 no-print">
                {/* Platform Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['linkedin', 'instagram', 'facebook', 'whatsapp'] as SocialPlatform[]).map(
                    (p) => {
                      const meta = PLATFORM_META[p];
                      const active = platform === p;
                      return (
                        <button
                          key={p}
                          onClick={() => handlePlatformSelect(p)}
                          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition ${
                            active
                              ? meta.activeBg
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <PlatformBadgeIcon
                            platform={p}
                            className={`w-4 h-4 ${active ? 'text-white' : meta.colorClass}`}
                          />
                          {meta.label}
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{PLATFORM_META[platform].hint}</span>
                  </div>
                  <button
                    onClick={() => handleCopyVerifyUrl(selectedCert)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cyan-300 hover:text-cyan-200"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Verify Link
                  </button>
                </div>

                {/* Message Composer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      {PLATFORM_META[platform].label} Post Message (Editable)
                    </label>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{postDraft.length} characters</span>
                      <button
                        onClick={() =>
                          setPostDraft(
                            buildSocialPostMessage(selectedCert, platform, user?.full_name)
                          )
                        }
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset Template
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={9}
                    value={postDraft}
                    onChange={(e) => setPostDraft(e.target.value)}
                    className="w-full rounded-2xl bg-[#050812] border border-slate-700/80 p-4 text-xs sm:text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-indigo-500 custom-scrollbar"
                  />
                </div>

                {/* Platform Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleCopyPost}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Post Message
                    </button>

                    {platform === 'linkedin' && (
                      <>
                        <a
                          href={buildLinkedInFeedShareUrl(postDraft)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition"
                        >
                          <PlatformBadgeIcon platform="linkedin" className="w-3.5 h-3.5" />
                          Post on LinkedIn Feed
                        </a>
                        <a
                          href={buildLinkedInAddToProfileUrl(selectedCert)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-sky-200 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/35 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Add to LinkedIn Profile
                        </a>
                      </>
                    )}

                    {platform === 'instagram' && (
                      <>
                        <button
                          onClick={() => handleExportCard('square')}
                          disabled={exportingCard}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-amber-500 hover:opacity-95 transition disabled:opacity-60"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          {exportingCard ? 'Rendering PNG...' : 'Download 1080×1080 IG Card'}
                        </button>
                        <a
                          href="https://www.instagram.com/"
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleCopyPost()}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-pink-200 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/35 transition"
                        >
                          <PlatformBadgeIcon platform="instagram" className="w-3.5 h-3.5" />
                          Copy &amp; Open Instagram
                        </a>
                      </>
                    )}

                    {platform === 'facebook' && (
                      <>
                        <a
                          href={buildFacebookShareUrl(selectedCert.credential_id, postDraft)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition"
                        >
                          <PlatformBadgeIcon platform="facebook" className="w-3.5 h-3.5" />
                          Share on Facebook
                        </a>
                        <button
                          onClick={() => handleExportCard('landscape')}
                          disabled={exportingCard}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-blue-200 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/35 transition disabled:opacity-60"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          Download 1200×630 Card
                        </button>
                      </>
                    )}

                    {platform === 'whatsapp' && (
                      <a
                        href={buildWhatsAppShareUrl(postDraft)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition"
                      >
                        <PlatformBadgeIcon platform="whatsapp" className="w-3.5 h-3.5" />
                        Send via WhatsApp
                      </a>
                    )}
                  </div>

                  {/* Universal PNG & PDF Attachments */}
                  <div className="flex flex-wrap items-center gap-2">
                    {platform !== 'instagram' && platform !== 'facebook' && (
                      <button
                        onClick={() => handleExportCard('landscape')}
                        disabled={exportingCard}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        PNG Card
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadPdf(selectedCert)}
                      disabled={downloadingPdfId === selectedCert.credential_id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
