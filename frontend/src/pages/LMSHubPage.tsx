import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Code2,
  Gift,
  GraduationCap,
  Lock,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { api } from '../services/api';
import { MLCourseOverview, MLCourseReviewsOverview } from '../types';

interface HubCourseEntry {
  track: 'ml' | 'dl';
  categoryTag: string;
  accentClass: string;
  badgeText: string;
  overview: MLCourseOverview;
  reviews: MLCourseReviewsOverview | null;
}

const FLOW_STAGES = [
  'Course Detail',
  'Lectures & Notes',
  'Quizzes',
  'Capstone',
  'Final Exam',
  'Feedback',
  'Certificate',
  'Goodies Form',
  'Done!',
];

export const LMSHubPage: React.FC = () => {
  const [entries, setEntries] = useState<HubCourseEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterTrack, setFilterTrack] = useState<'all' | 'ml' | 'dl'>('all');
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.courseLms('ml').getOverview(),
      api.courseLms('dl').getOverview(),
      api.courseLms('ml').getReviews().catch(() => null),
      api.courseLms('dl').getReviews().catch(() => null),
    ])
      .then(([mlOverview, dlOverview, mlReviews, dlReviews]) => {
        if (cancelled) return;
        setEntries([
          {
            track: 'ml',
            categoryTag: 'Applied Machine Learning • Complete Engineering LMS',
            accentClass: 'indigo',
            badgeText: '106 VIDEOS · 100+ QUIZZES · CAM PROCTORED',
            overview: mlOverview,
            reviews: mlReviews,
          },
          {
            track: 'dl',
            categoryTag: 'Stanford CS229 × Coding Task Factory Academy',
            accentClass: 'rose',
            badgeText: 'STANFORD × CTF · 21 VIDEOS · 20+ QUIZZES',
            overview: dlOverview,
            reviews: dlReviews,
          },
        ]);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (filterTrack !== 'all' && entry.track !== filterTrack) return false;
      if (!q) return true;
      return (
        entry.overview.title.toLowerCase().includes(q) ||
        entry.overview.instructor.toLowerCase().includes(q) ||
        entry.overview.modules.some((m) => m.title.toLowerCase().includes(q))
      );
    });
  }, [entries, filterTrack, query]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Course Landing Hero & End-to-End Flow Strip */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-[#0B1124] via-[#0F132A] to-[#08151D] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <GraduationCap className="w-4 h-4" />
              CODING TASK FACTORY ACADEMIES • LMS HUB
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Select Your Engineering Course &amp; Certification Track
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every course runs end-to-end inside one distraction-free platform: inspect the full
              syllabus, stream locked In-LMS video lectures with LaTeX notes, pass post-video quizzes,
              submit graded capstones, conquer the camera-proctored exam, submit feedback, download
              your Vector PDF Certificate, and claim physical graduate goodies!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="rounded-2xl bg-slate-950/75 border border-slate-800 px-4 py-3 text-center">
              <div className="text-2xl font-black text-white">127</div>
              <div className="text-[11px] text-indigo-300 font-semibold">In-LMS Lectures</div>
            </div>
            <div className="rounded-2xl bg-slate-950/75 border border-slate-800 px-4 py-3 text-center">
              <div className="text-2xl font-black text-emerald-400">2 Tracks</div>
              <div className="text-[11px] text-slate-400 font-semibold">PDF + Swag Enabled</div>
            </div>
          </div>
        </div>

        {/* Visual 9-Step End-to-End Journey Stepper */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
            Complete Guided End-to-End LMS Workflow
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {FLOW_STAGES.map((stage, idx) => (
              <React.Fragment key={stage}>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] font-semibold text-slate-200">
                  <span className="w-4 h-4 rounded bg-indigo-600/30 text-indigo-300 font-mono text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  {stage}
                </span>
                {idx < FLOW_STAGES.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses by title, instructor, neural nets, kernels, transformers..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs sm:text-sm text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all' as const, label: 'All Tracks (2)' },
            { id: 'ml' as const, label: 'ML Mastery (106)' },
            { id: 'dl' as const, label: 'Stanford × CTF DL (21)' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setFilterTrack(pill.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                filterTrack === pill.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Landing Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="h-[500px] rounded-3xl border border-slate-800 bg-slate-900/60 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((entry) => {
            const ov = entry.overview;
            const completedCount = ov.progress?.completed_lessons?.length || 0;
            const totalLessons = ov.total_lessons;
            const progressPct = Math.round((completedCount / Math.max(1, totalLessons)) * 100);
            const totalHours = ov.modules.reduce((acc, m) => acc + (m.estimated_hours || 2), 0);
            const isDL = entry.track === 'dl';
            const learnPath = isDL ? '/app/dl-course' : '/app/ml-course';

            return (
              <div
                key={ov.id}
                className={`group rounded-3xl border overflow-hidden bg-slate-900/80 flex flex-col justify-between shadow-2xl transition duration-300 ${
                  isDL
                    ? 'border-rose-500/35 hover:border-rose-400/70'
                    : 'border-indigo-500/35 hover:border-indigo-400/70'
                }`}
              >
                <div>
                  {/* Custom Official Course Thumbnail */}
                  <Link to={`/app/lms/${entry.track}`} className="block relative overflow-hidden">
                    <img
                      src={
                        ov.thumbnail_url ||
                        (isDL
                          ? '/thumbnails/stanford-ctf-dl-thumbnail.svg'
                          : '/thumbnails/ml-ctf-course-thumbnail.svg')
                      }
                      alt={ov.title}
                      className="w-full aspect-video object-cover group-hover:scale-[1.03] transition duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/85 border border-white/15 text-[10px] font-mono font-bold text-cyan-300 backdrop-blur-md">
                      {entry.badgeText}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1 backdrop-blur-md">
                      <Lock className="w-3 h-3" />
                      LMS-Only Player
                    </div>
                  </Link>

                  <div className="p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold border ${
                          isDL
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                            : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                        }`}
                      >
                        {entry.categoryTag}
                      </span>
                      {entry.reviews && (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {entry.reviews.average_rating.toFixed(1)} ({entry.reviews.total_reviews})
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                      {ov.title}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium text-slate-300">
                      <div className="px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                        <PlayCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{ov.total_lessons} Videos</span>
                      </div>
                      <div className="px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>~{totalHours} Hours</span>
                      </div>
                      <div className="px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{ov.capstone_projects?.length || 3} Capstones</span>
                      </div>
                      <div className="px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>PDF + Swag</span>
                      </div>
                    </div>

                    {/* Progress Tracker */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Your Progress: <strong className="text-white">{completedCount}/{totalLessons}</strong> lectures
                        </span>
                        <span className="font-mono font-bold text-emerald-400">{progressPct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isDL
                              ? 'bg-gradient-to-r from-rose-500 to-indigo-400'
                              : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Selection Actions */}
                <div className="px-6 pb-6 flex flex-wrap gap-3">
                  <Link
                    to={`/app/lms/${entry.track}`}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-xs font-extrabold transition shadow-lg ${
                      isDL
                        ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Select &amp; View Course Detail
                  </Link>
                  <Link
                    to={learnPath}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                  >
                    <PlayCircle className="w-4 h-4 text-cyan-400" />
                    {completedCount > 0 ? 'Resume' : 'Start Now'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Academy Guarantees Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-white">Camera Cheat-Protected Final Exams</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              WebRTC webcam verification, fullscreen lock, and 3-strike integrity ensure every issued
              credential carries genuine technical weight.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3">
          <Award className="w-6 h-6 text-cyan-400 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-white">Vector A4 PDF &amp; SHA-256 Verification</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Export high-DPI ReportLab certificates, share directly to LinkedIn/Instagram/Facebook,
              and verify via cryptographic credential IDs.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-white">Capstone Lab, Feedback &amp; Goodies Box</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Submit hands-on projects for automated rubric grading, post structured feedback, and
              claim your Graduate Goodies Bundle.
            </p>
          </div>
        </div>
      </div>

      {/* Unused BrainCircuit & CheckCircle2 safeguard */}
      <span className="hidden" aria-hidden="true">
        <BrainCircuit />
        <CheckCircle2 />
      </span>
    </div>
  );
};
