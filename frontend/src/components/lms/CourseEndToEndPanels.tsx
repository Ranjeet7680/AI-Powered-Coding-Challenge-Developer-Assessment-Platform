import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
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
  Sparkles,
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
      <div className="rounded-3xl border border-amber-500/30 bg-slate-900/80 p-8 text-center max-w-3xl mx-auto space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Certificate Locked — Final Exam Pending</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Pass the camera-proctored final examination (≥70% with verified webcam) to mint your
            official SHA-256 credential and Vector A4 PDF for <strong>{courseTitle}</strong>.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onGoToExam}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20"
          >
            <ShieldCheck className="w-4 h-4" />
            Take Camera-Proctored Final Exam
          </button>
          <button
            type="button"
            onClick={onGoToGoodies}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Preview Goodies Claim Form →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Ornate Credential Card Preview */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-[#0B1226] via-slate-900 to-emerald-950/25 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-bold">
            <Award className="w-4 h-4" />
            OFFICIAL VERIFIED CREDENTIAL • A4 VECTOR PDF READY
          </div>
          <span className="font-mono text-xs text-cyan-300 font-bold">
            {certificate.credential_id}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-indigo-300">
            Awarded with Verified Distinction to {certificate.recipient_name}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-white">{certificate.title}</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{certificate.summary}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5">
            <div className="text-[11px] text-slate-400">Standing</div>
            <div className="text-sm font-bold text-emerald-300 mt-0.5">{certificate.grade}</div>
          </div>
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5">
            <div className="text-[11px] text-slate-400">Signatory</div>
            <div className="text-sm font-bold text-white mt-0.5">{certificate.signatory_name}</div>
          </div>
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5">
            <div className="text-[11px] text-slate-400">Study Hours</div>
            <div className="text-sm font-bold text-cyan-300 mt-0.5">
              {certificate.completion_hours || 28} hrs
            </div>
          </div>
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5">
            <div className="text-[11px] text-slate-400">SHA-256 Digest</div>
            <div className="text-xs font-mono text-slate-300 mt-1 truncate">
              {certificate.credential_hash?.slice(0, 16) || 'verified-hash'}
            </div>
          </div>
        </div>

        {certificate.skills_verified && certificate.skills_verified.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {certificate.skills_verified.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-indigo-200 font-medium"
              >
                ✓ {skill}
              </span>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => api.downloadCertificatePdf(certificate.credential_id)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              Download Landscape A4 PDF
            </button>
            <Link
              to={`/verify/${certificate.credential_id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Public Verify URL
            </Link>
            <Link
              to="/app/certificates"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600/25 border border-indigo-500/35 hover:bg-indigo-600/35 text-indigo-200 text-xs font-bold transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Share to LinkedIn / IG / FB
            </Link>
          </div>

          <button
            type="button"
            onClick={onGoToGoodies}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 text-xs font-black transition shadow-lg"
          >
            <Gift className="w-4 h-4" />
            Next: Claim Graduate Goodies →
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
    badge: 'POPULAR',
    desc: 'Embroidered Dev Hoodie + Matte Steel Tumbler + Mechanical Keycap + Holographic Stickers',
  },
  {
    id: 'Academy Developer Hoodie Kit',
    badge: 'APPAREL',
    desc: 'Heavyweight Dark Navy Zip Hoodie with Stanford X Coding Task Factory Emblem + Sticker Pack',
  },
  {
    id: 'Desk Pro Engineering Kit',
    badge: 'HARDWARE',
    desc: 'Laser-etched Aluminum Water Bottle + PBT Escape Keycap + Desk Cheat-Sheet Mat',
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

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Dispatch Summary + Active Claim Card */}
      <div className="lg:col-span-5 space-y-5">
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 p-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Gift className="w-3.5 h-3.5" />
            GRADUATE GOODIES &amp; SWAG PROGRAM
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Claim Your {courseTitle} Swag Box (+50 XP)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Celebrate completing lectures, quizzes, capstone projects, and proctored assessment by
            selecting your official apparel/desk bundle and delivery destination.
          </p>

          {existingClaim && (
            <div className="rounded-2xl border border-emerald-500/35 bg-emerald-950/30 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4" />
                  Order Claimed!
                </span>
                <span className="font-mono font-bold text-white">{existingClaim.dispatch_code}</span>
              </div>
              <p className="text-[11px] text-emerald-200/80">
                Bundle: <strong>{existingClaim.swag_bundle}</strong> ({existingClaim.tshirt_size})
              </p>
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                {existingClaim.status} → {existingClaim.city}, {existingClaim.country}
              </p>
              <button
                type="button"
                onClick={onProceedToDone}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Finish &amp; View Done Summary <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Interactive Goodies Order Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-5"
      >
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Choose Your Goodies Bundle
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {SWAG_BUNDLES.map((bundle) => {
              const selected = swagBundle === bundle.id;
              return (
                <button
                  key={bundle.id}
                  type="button"
                  onClick={() => setSwagBundle(bundle.id)}
                  className={`text-left p-3.5 rounded-2xl border transition ${
                    selected
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/75 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">{bundle.id}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-300">
                      {bundle.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{bundle.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            2. Hoodie / Apparel Size
          </label>
          <div className="flex flex-wrap gap-2">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setTshirtSize(sz)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition ${
                  tshirtSize === sz
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            3. Shipping Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Recipient Full Name *"
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Confirmation Email *"
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number (for courier)"
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white"
            />
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="LinkedIn / GitHub Profile URL (optional)"
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white"
            />
          </div>

          <input
            type="text"
            required
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            placeholder="Street Address, Building / Apartment *"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City *"
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white"
            />
            <input
              type="text"
              value={stateRegion}
              onChange={(e) => setStateRegion(e.target.value)}
              placeholder="State"
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white"
            />
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Postal Code *"
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white"
            />
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country *"
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white"
            />
          </div>

          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Delivery instructions or personalized message note (optional)"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-white"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 disabled:opacity-50 text-slate-950 text-xs sm:text-sm font-black transition shadow-xl"
        >
          <Gift className="w-4 h-4" />
          {isSubmitting
            ? 'Confirming Swag Dispatch...'
            : existingClaim
            ? 'Update Goodies Claim & View Done Page →'
            : 'Submit Goodies Form & Complete Course (+50 XP) →'}
        </button>
      </form>
    </div>
  );
};

/* ============================================================================
 * 3. FINAL "DONE" GRADUATION CELEBRATION SUMMARY SCREEN
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
    { label: 'In-LMS Video Lectures & Notes', detail: `${completedLessonsCount} / ${totalLessonsCount} completed`, ok: completedLessonsCount > 0 },
    { label: 'Comprehension Quizzes Passed', detail: `${quizzesPassedCount} / ${totalLessonsCount} mastered`, ok: quizzesPassedCount > 0 },
    { label: 'Capstone Project Assignments', detail: `${capstoneCount} submitted`, ok: capstoneCount > 0 },
    { label: 'Camera-Proctored Final Exam', detail: examScore !== null ? `${examScore}% scored` : 'Ready to take', ok: examScore !== null && examScore >= 70 },
    { label: 'Verified Certificate & Vector PDF', detail: certificate ? certificate.credential_id : 'Pending Exam Pass', ok: Boolean(certificate) },
    { label: 'Graduate Goodies & Swag Box', detail: goodiesClaim ? goodiesClaim.dispatch_code : 'Ready to claim', ok: Boolean(goodiesClaim) },
  ];

  return (
    <div className="max-w-4xl mx-auto rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-[#071318] via-slate-900 to-indigo-950/35 p-6 sm:p-10 space-y-7 shadow-2xl">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          END-TO-END LMS JOURNEY COMPLETE
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white">
          Congratulations! You Completed the Flow
        </h2>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Your milestones, verified credential, course feedback, and graduate goodies dispatch for{' '}
          <strong className="text-white">{courseTitle}</strong> are safely recorded in your account.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {checklist.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-4 space-y-1 ${
              item.ok
                ? 'bg-emerald-950/25 border-emerald-500/35'
                : 'bg-slate-950/75 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>{item.label}</span>
              <CheckCircle2
                className={`w-4 h-4 shrink-0 ${item.ok ? 'text-emerald-400' : 'text-slate-600'}`}
              />
            </div>
            <div className="text-xs font-mono text-cyan-300">{item.detail}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {certificate && (
          <button
            type="button"
            onClick={() => api.downloadCertificatePdf(certificate.credential_id)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            Download PDF Certificate
          </button>
        )}
        <Link
          to="/app/lms"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20"
        >
          <GraduationCap className="w-4 h-4" />
          Browse More LMS Courses
        </Link>
        <Link
          to="/app/dashboard"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
        >
          Back to Overview Dashboard
        </Link>
      </div>
    </div>
  );
};
