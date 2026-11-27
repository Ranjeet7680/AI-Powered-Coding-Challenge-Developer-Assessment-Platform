import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  Gift,
  GraduationCap,
  MapPin,
  PackageCheck,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { api } from '../../services/api';
import {
  Certificate,
  MLCourseGoodiesClaim,
  MLCourseGoodiesClaimPayload,
} from '../../types';

/* ============================================================================
 * 1. DEDICATED CERTIFICATE & PDF CREDENTIAL STAGE
 * ==========================================================================*/
interface CertificateStageProps {
  courseTitle: string;
  certificate: Certificate | null;
  onGoToExam: () => void;
  onGoToGoodies: () => void;
}

export const CourseCertificateStagePanel: React.FC<CertificateStageProps> = ({
  courseTitle,
  certificate,
  onGoToExam,
  onGoToGoodies,
}) => {
  if (!certificate) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#19191b] p-8 text-center max-w-3xl mx-auto space-y-5">
        <div className="w-12 h-12 rounded-xl bg-[#e5a00d]/10 border border-[#e5a00d]/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6 text-[#e5a00d]" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[#ededed]">Certificate locked — final exam pending</h2>
          <p className="text-sm text-[#a1a1a6] max-w-xl mx-auto leading-relaxed">
            Pass the camera-proctored final examination (&ge;70% with verified webcam) to mint your
            official SHA-256 credential and Vector A4 PDF for{' '}
            <strong className="font-medium text-[#ededed]">{courseTitle}</strong>.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onGoToExam}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
          >
            <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
            Take proctored final exam
          </button>
          <button
            type="button"
            onClick={onGoToGoodies}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-[#ededed] text-xs font-medium transition-colors"
          >
            Preview goodies claim form
            <ArrowRight className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border border-[#e5a00d]/35 bg-[#19191b] p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#4cc38a]">
            <Award className="w-4 h-4" strokeWidth={1.5} />
            Official verified credential · A4 vector PDF ready
          </div>
          <span className="font-mono text-xs text-[#e5a00d] font-medium tabular-nums">
            {certificate.credential_id}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-mono text-[#a1a1a6]">
            Awarded to {certificate.recipient_name}
          </p>
          <h2 className="text-2xl font-semibold text-[#ededed] tracking-tight">
            {certificate.title}
          </h2>
          <p className="text-sm text-[#a1a1a6] leading-relaxed">{certificate.summary}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-[#141415] border border-white/[0.08] p-3.5">
            <div className="text-xs text-[#85858b]">Standing</div>
            <div className="text-sm font-medium text-[#4cc38a] mt-0.5">{certificate.grade}</div>
          </div>
          <div className="rounded-xl bg-[#141415] border border-white/[0.08] p-3.5">
            <div className="text-xs text-[#85858b]">Signatory</div>
            <div className="text-sm font-medium text-[#ededed] mt-0.5">{certificate.signatory_name}</div>
          </div>
          <div className="rounded-xl bg-[#141415] border border-white/[0.08] p-3.5">
            <div className="text-xs text-[#85858b]">Study hours</div>
            <div className="text-sm font-medium text-[#ededed] mt-0.5 tabular-nums">
              {certificate.completion_hours || 28} hrs
            </div>
          </div>
          <div className="rounded-xl bg-[#141415] border border-white/[0.08] p-3.5">
            <div className="text-xs text-[#85858b]">SHA-256 digest</div>
            <div className="text-xs font-mono text-[#a1a1a6] mt-1 truncate">
              {certificate.credential_hash?.slice(0, 16) || 'verified-hash'}
            </div>
          </div>
        </div>

        {certificate.skills_verified && certificate.skills_verified.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {certificate.skills_verified.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-md bg-[#141415] border border-white/[0.08] text-xs text-[#a1a1a6]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => api.downloadCertificatePdf(certificate.credential_id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
            >
              <Download className="w-4 h-4" strokeWidth={1.5} />
              Download landscape A4 PDF
            </button>
            <Link
              to={`/verify/${certificate.credential_id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-[#ededed] text-xs font-medium transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#4cc38a]" strokeWidth={1.5} />
              Public verify URL
            </Link>
            <Link
              to="/app/certificates"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-[#ededed] text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
              Share credential
            </Link>
          </div>

          <button
            type="button"
            onClick={onGoToGoodies}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e5a00d] hover:bg-[#f0b024] text-[#141415] text-xs font-medium transition-colors"
          >
            <Gift className="w-4 h-4" strokeWidth={1.5} />
            Claim graduate goodies
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. GRADUATE GOODIES & SWAG DISPATCH CLAIM FORM
 * ==========================================================================*/
const SWAG_BUNDLES = [
  {
    id: 'Complete Graduate Swag Box',
    badge: 'Complete kit',
    desc: 'Embroidered Dev Hoodie + Matte Steel Tumbler + Mechanical Keycap + Sticker Set',
  },
  {
    id: 'Academy Developer Hoodie Kit',
    badge: 'Apparel',
    desc: 'Heavyweight Dark Graphite Zip Hoodie with Stanford X Coding Task Factory Emblem + Stickers',
  },
  {
    id: 'Desk Pro Engineering Kit',
    badge: 'Hardware',
    desc: 'Laser-etched Aluminum Water Bottle + PBT Escape Keycap + Desk Reference Mat',
  },
];

interface GoodiesFormProps {
  courseTitle: string;
  defaultName: string;
  defaultEmail: string;
  existingClaim: MLCourseGoodiesClaim | null;
  onSubmitClaim: (payload: MLCourseGoodiesClaimPayload) => Promise<void>;
  isSubmitting: boolean;
  onProceedToDone: () => void;
}

export const CourseGoodiesFormPanel: React.FC<GoodiesFormProps> = ({
  courseTitle,
  defaultName,
  defaultEmail,
  existingClaim,
  onSubmitClaim,
  isSubmitting,
  onProceedToDone,
}) => {
  const [swagBundle, setSwagBundle] = useState<string>(
    existingClaim?.swag_bundle || SWAG_BUNDLES[0].id
  );
  const [tshirtSize, setTshirtSize] = useState<string>(existingClaim?.tshirt_size || 'L');
  const [fullName, setFullName] = useState<string>(existingClaim?.full_name || defaultName);
  const [email, setEmail] = useState<string>(existingClaim?.email || defaultEmail);
  const [phone, setPhone] = useState<string>(existingClaim?.phone || '');
  const [addressLine, setAddressLine] = useState<string>(existingClaim?.address_line || '');
  const [city, setCity] = useState<string>(existingClaim?.city || '');
  const [stateRegion, setStateRegion] = useState<string>(existingClaim?.state || '');
  const [postalCode, setPostalCode] = useState<string>(existingClaim?.postal_code || '');
  const [country, setCountry] = useState<string>(existingClaim?.country || 'India');
  const [linkedinUrl, setLinkedinUrl] = useState<string>(existingClaim?.linkedin_url || '');
  const [notes, setNotes] = useState<string>(existingClaim?.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitClaim({
      swag_bundle: swagBundle,
      tshirt_size: tshirtSize,
      full_name: fullName,
      email,
      phone,
      address_line: addressLine,
      city,
      state: stateRegion,
      postal_code: postalCode,
      country,
      linkedin_url: linkedinUrl,
      notes,
    });
  };

  const inputCls =
    'px-3.5 py-2.5 rounded-lg bg-[#141415] border border-white/[0.08] focus:border-[#e5a00d]/60 focus:outline-none text-xs text-[#ededed] placeholder:text-[#85858b]';

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Dispatch Summary + Active Claim Card */}
      <div className="lg:col-span-5 space-y-5">
        <div className="rounded-2xl border border-white/[0.08] bg-[#19191b] p-6 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#e5a00d]">
            <Gift className="w-3.5 h-3.5" strokeWidth={1.5} />
            Graduate goodies program
          </div>
          <h2 className="text-lg font-semibold text-[#ededed]">
            Claim your {courseTitle} swag kit (+50 XP)
          </h2>
          <p className="text-xs text-[#a1a1a6] leading-relaxed">
            Upon completing lectures, quizzes, capstone projects, and the proctored assessment, select
            your apparel or desk bundle and shipping destination.
          </p>

          {existingClaim && (
            <div className="rounded-xl border border-[#4cc38a]/30 bg-[#4cc38a]/[0.06] p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#4cc38a] flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4" strokeWidth={1.5} />
                  Dispatch claimed
                </span>
                <span className="font-mono font-medium text-[#ededed] tabular-nums">
                  {existingClaim.dispatch_code}
                </span>
              </div>
              <p className="text-xs text-[#a1a1a6]">
                Bundle: <strong className="font-medium text-[#ededed]">{existingClaim.swag_bundle}</strong> ({existingClaim.tshirt_size})
              </p>
              <p className="text-xs text-[#a1a1a6] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#85858b] shrink-0" strokeWidth={1.5} />
                {existingClaim.status} &mdash; {existingClaim.city}, {existingClaim.country}
              </p>
              <button
                type="button"
                onClick={onProceedToDone}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
              >
                View graduation summary <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Interactive Goodies Order Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#19191b] p-6 space-y-5"
      >
        <div className="space-y-2.5">
          <label className="block text-xs font-medium text-[#a1a1a6]">
            1. Choose your bundle
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {SWAG_BUNDLES.map((bundle) => {
              const selected = swagBundle === bundle.id;
              return (
                <button
                  key={bundle.id}
                  type="button"
                  onClick={() => setSwagBundle(bundle.id)}
                  className={`text-left p-3.5 rounded-xl border transition-colors ${
                    selected
                      ? 'bg-[#222225] border-[#e5a00d]/60 text-[#ededed]'
                      : 'bg-[#141415] border-white/[0.08] text-[#a1a1a6] hover:border-white/[0.16]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#ededed]">{bundle.id}</span>
                    <span className="px-2 py-0.5 rounded bg-[#19191b] border border-white/[0.08] text-[11px] font-mono text-[#e5a00d]">
                      {bundle.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#85858b] mt-1">{bundle.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#a1a1a6]">
            2. Hoodie / apparel size
          </label>
          <div className="flex flex-wrap gap-2">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setTshirtSize(sz)}
                className={`px-3.5 py-2 rounded-lg border text-xs font-mono font-medium transition-colors ${
                  tshirtSize === sz
                    ? 'bg-[#ededed] border-[#ededed] text-[#141415]'
                    : 'bg-[#141415] border-white/[0.08] text-[#a1a1a6] hover:text-[#ededed]'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#a1a1a6]">
            <MapPin className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
            3. Shipping details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Recipient full name *"
              className={inputCls}
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Confirmation email *"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number (for courier)"
              className={inputCls}
            />
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="LinkedIn / GitHub URL (optional)"
              className={inputCls}
            />
          </div>

          <input
            type="text"
            required
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            placeholder="Street address, building or apartment *"
            className={`w-full ${inputCls}`}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City *"
              className={inputCls}
            />
            <input
              type="text"
              value={stateRegion}
              onChange={(e) => setStateRegion(e.target.value)}
              placeholder="State"
              className={inputCls}
            />
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Postal code *"
              className={inputCls}
            />
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country *"
              className={inputCls}
            />
          </div>

          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Delivery instructions or note (optional)"
            className={`w-full ${inputCls}`}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-50 text-[#141415] text-xs font-medium transition-colors"
        >
          <Gift className="w-4 h-4" strokeWidth={1.5} />
          {isSubmitting
            ? 'Confirming dispatch...'
            : existingClaim
            ? 'Update goodies claim & view summary'
            : 'Submit goodies claim (+50 XP)'}
        </button>
      </form>
    </div>
  );
};

/* ============================================================================
 * 3. FINAL "DONE" GRADUATION SUMMARY SCREEN
 * ==========================================================================*/
interface CompletionDoneProps {
  courseTitle: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  quizzesPassedCount: number;
  capstoneCount: number;
  examScore: number | null;
  certificate: Certificate | null;
  goodiesClaim: MLCourseGoodiesClaim | null;
}

export const CourseCompletionDonePanel: React.FC<CompletionDoneProps> = ({
  courseTitle,
  completedLessonsCount,
  totalLessonsCount,
  quizzesPassedCount,
  capstoneCount,
  examScore,
  certificate,
  goodiesClaim,
}) => {
  const checklist = [
    {
      label: 'Video lectures & notes',
      detail: `${completedLessonsCount} / ${totalLessonsCount} completed`,
      ok: completedLessonsCount > 0,
    },
    {
      label: 'Comprehension quizzes passed',
      detail: `${quizzesPassedCount} / ${totalLessonsCount} mastered`,
      ok: quizzesPassedCount > 0,
    },
    {
      label: 'Capstone project assignments',
      detail: `${capstoneCount} submitted`,
      ok: capstoneCount > 0,
    },
    {
      label: 'Proctored final exam',
      detail: examScore !== null ? `${examScore}% scored` : 'Ready to take',
      ok: examScore !== null && examScore >= 70,
    },
    {
      label: 'Verified certificate & PDF',
      detail: certificate ? certificate.credential_id : 'Pending exam pass',
      ok: Boolean(certificate),
    },
    {
      label: 'Graduate goodies dispatch',
      detail: goodiesClaim ? goodiesClaim.dispatch_code : 'Ready to claim',
      ok: Boolean(goodiesClaim),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto rounded-2xl border border-white/[0.08] bg-[#19191b] p-6 sm:p-10 space-y-7">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-[#4cc38a]/15 border border-[#4cc38a]/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 text-[#4cc38a]" strokeWidth={1.5} />
        </div>
        <div className="text-xs font-medium text-[#4cc38a]">
          End-to-end track complete
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#ededed] tracking-tight">
          Track milestones recorded
        </h2>
        <p className="text-sm text-[#a1a1a6] max-w-2xl mx-auto leading-relaxed">
          Your completed lectures, proctored assessment, verified credential, course feedback, and
          swag dispatch for <strong className="font-medium text-[#ededed]">{courseTitle}</strong> are
          saved to your account.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {checklist.map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border p-4 space-y-1.5 ${
              item.ok
                ? 'bg-[#4cc38a]/[0.05] border-[#4cc38a]/25'
                : 'bg-[#141415] border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-[#ededed]">
              <span>{item.label}</span>
              <CheckCircle2
                className={`w-4 h-4 shrink-0 ${item.ok ? 'text-[#4cc38a]' : 'text-[#85858b]'}`}
                strokeWidth={1.5}
              />
            </div>
            <div className="text-xs font-mono text-[#a1a1a6] tabular-nums">{item.detail}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {certificate && (
          <button
            type="button"
            onClick={() => api.downloadCertificatePdf(certificate.credential_id)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            Download PDF certificate
          </button>
        )}
        <Link
          to="/app/lms"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-[#ededed] text-xs font-medium transition-colors"
        >
          <GraduationCap className="w-4 h-4 text-[#a1a1a6]" strokeWidth={1.5} />
          Browse LMS courses
        </Link>
        <Link
          to="/app/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#141415] hover:bg-[#222225] border border-white/[0.08] text-[#a1a1a6] hover:text-[#ededed] text-xs font-medium transition-colors"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
};
