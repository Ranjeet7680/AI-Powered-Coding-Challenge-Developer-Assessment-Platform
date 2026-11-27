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
  Star,
} from 'lucide-react';
import { api } from '../services/api';
import { MLCourseOverview, MLCourseReviewsOverview } from '../types';

interface HubCourseEntry {
  track: 'ml' | 'dl';
  categoryTag: string;
  badgeText: string;
  overview: MLCourseOverview;
  reviews: MLCourseReviewsOverview | null;
}

const FLOW_STAGES = [
  'Course overview',
  'Lectures & notes',
  'Quizzes',
  'Capstone',
  'Final exam',
  'Feedback',
  'Certificate',
  'Goodies form',
  'Complete',
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
            categoryTag: 'Applied Machine Learning · Engineering LMS',
            badgeText: '106 videos · 100+ quizzes · Camera proctored',
            overview: mlOverview,
            reviews: mlReviews,
          },
          {
            track: 'dl',
            categoryTag: 'Stanford CS229 × Coding Task Factory',
            badgeText: '21 videos · 20+ quizzes · Camera proctored',
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#e5a00d]">
              <GraduationCap strokeWidth={1.5} className="w-4 h-4" />
              <span>Coding Task Factory Academies</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed]">
              Engineering courses and certification tracks
            </h1>
            <p className="text-sm text-[#a1a1a6] leading-relaxed">
              Inspect the syllabus, watch in-platform video lectures with LaTeX notes, complete quizzes and graded capstones, pass the camera-proctored exam, and download your SHA-256 PDF certificate.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 tabular-nums">
            <div className="rounded-lg bg-[#141415] border border-white/[0.08] px-4 py-3 text-center">
              <div className="text-2xl font-medium font-mono text-[#ededed]">127</div>
              <div className="text-xs text-[#85858b]">In-LMS lectures</div>
            </div>
            <div className="rounded-lg bg-[#141415] border border-white/[0.08] px-4 py-3 text-center">
              <div className="text-2xl font-medium font-mono text-[#4cc38a]">2</div>
              <div className="text-xs text-[#85858b]">Active tracks</div>
            </div>
          </div>
        </div>

        {/* End-to-End Flow */}
        <div className="pt-4 border-t border-white/[0.08] space-y-2">
          <p className="text-xs font-mono text-[#85858b]">Course completion sequence</p>
          <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-1.5 pb-1 tabular-nums">
            {FLOW_STAGES.map((stage, idx) => (
              <React.Fragment key={stage}>
                <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141415] border border-white/[0.08] text-xs text-[#a1a1a6] whitespace-nowrap">
                  <span className="font-mono text-[#85858b]">{idx + 1}.</span>
                  <span>{stage}</span>
                </span>
                {idx < FLOW_STAGES.length - 1 && (
                  <ArrowRight strokeWidth={1.5} className="w-3 h-3 text-[#85858b] shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#19191b] p-4">
        <div className="relative flex-1">
          <Search strokeWidth={1.5} className="w-4 h-4 text-[#85858b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses"
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-[#141415] border border-white/[0.08] focus:border-[#e5a00d] focus:outline-none text-xs sm:text-sm text-[#ededed] placeholder-[#85858b]"
          />
        </div>
        <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-[#141415] border border-white/[0.08]">
          {[
            { id: 'all' as const, label: 'All tracks (2)' },
            { id: 'ml' as const, label: 'ML mastery (106)' },
            { id: 'dl' as const, label: 'Stanford DL (21)' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setFilterTrack(pill.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors tabular-nums ${
                filterTrack === pill.id
                  ? 'bg-[#222225] text-[#ededed]'
                  : 'text-[#85858b] hover:text-[#ededed]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((idx) => (
            <div key={idx} className="h-[460px] rounded-xl border border-white/[0.08] bg-[#19191b] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 tabular-nums">
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
                className="rounded-xl border border-white/[0.08] hover:border-white/[0.14] overflow-hidden bg-[#19191b] flex flex-col justify-between transition-colors"
              >
                <div>
                  <Link to={`/app/lms/${entry.track}`} className="block relative overflow-hidden bg-[#141415]">
                    <img
                      src={
                        ov.thumbnail_url ||
                        (isDL
                          ? '/thumbnails/stanford-ctf-dl-thumbnail.svg'
                          : '/thumbnails/ml-ctf-course-thumbnail.svg')
                      }
                      alt={ov.title}
                      className="w-full aspect-video object-cover opacity-90 hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#141415]/90 border border-white/[0.1] text-xs font-mono text-[#ededed]">
                      {entry.badgeText}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#141415]/90 border border-white/[0.1] text-xs text-[#4cc38a] flex items-center gap-1.5">
                      <Lock strokeWidth={1.5} className="w-3 h-3" />
                      <span>In-LMS player</span>
                    </div>
                  </Link>

                  <div className="p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-[#85858b]">{entry.categoryTag}</span>
                      {entry.reviews && (
                        <span className="inline-flex items-center gap-1 font-mono text-[#e5a00d]">
                          <Star strokeWidth={1.5} className="w-3.5 h-3.5 fill-current" />
                          <span>
                            {entry.reviews.average_rating.toFixed(1)} ({entry.reviews.total_reviews})
                          </span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-medium text-[#ededed] leading-snug">{ov.title}</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#a1a1a6]">
                      <div className="px-2.5 py-2 rounded-lg bg-[#141415] border border-white/[0.08] flex items-center gap-1.5">
                        <PlayCircle strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b] shrink-0" />
                        <span>{ov.total_lessons} videos</span>
                      </div>
                      <div className="px-2.5 py-2 rounded-lg bg-[#141415] border border-white/[0.08] flex items-center gap-1.5">
                        <Clock strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b] shrink-0" />
                        <span>~{totalHours} hrs</span>
                      </div>
                      <div className="px-2.5 py-2 rounded-lg bg-[#141415] border border-white/[0.08] flex items-center gap-1.5">
                        <Code2 strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b] shrink-0" />
                        <span>{ov.capstone_projects?.length || 3} capstones</span>
                      </div>
                      <div className="px-2.5 py-2 rounded-lg bg-[#141415] border border-white/[0.08] flex items-center gap-1.5">
                        <Gift strokeWidth={1.5} className="w-3.5 h-3.5 text-[#85858b] shrink-0" />
                        <span>PDF + swag</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#85858b]">
                          Progress: <span className="text-[#ededed] font-mono">{completedCount}/{totalLessons}</span> lectures
                        </span>
                        <span className="font-mono text-[#4cc38a]">{progressPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#222225] overflow-hidden">
                        <div
                          className="h-full bg-[#e5a00d] transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 flex flex-wrap gap-2.5">
                  <Link
                    to={`/app/lms/${entry.track}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 h-9 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
                  >
                    <BookOpen strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>View syllabus</span>
                  </Link>
                  <Link
                    to={learnPath}
                    className="inline-flex items-center justify-center gap-1.5 px-4 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] border border-white/[0.08] text-xs font-medium transition-colors"
                  >
                    <PlayCircle strokeWidth={1.5} className="w-3.5 h-3.5 text-[#e5a00d]" />
                    <span>{completedCount > 0 ? 'Resume' : 'Start'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-4 flex items-start gap-3">
          <ShieldCheck strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-medium text-[#ededed]">Camera-proctored final exams</h3>
            <p className="text-xs text-[#85858b] mt-1 leading-relaxed">
              Webcam monitoring, fullscreen enforcement, and violation logging protect credential integrity.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-4 flex items-start gap-3">
          <Award strokeWidth={1.5} className="w-4 h-4 text-[#e5a00d] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-medium text-[#ededed]">Vector PDF &amp; SHA-256 registry</h3>
            <p className="text-xs text-[#85858b] mt-1 leading-relaxed">
              Download ReportLab A4 certificates and verify credential IDs on public registry URLs.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-4 flex items-start gap-3">
          <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 text-[#a1a1a6] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-medium text-[#ededed]">Capstone lab &amp; graduate kit</h3>
            <p className="text-xs text-[#85858b] mt-1 leading-relaxed">
              Submit rubric-graded capstone work, post course reviews, and submit graduate shipping details.
            </p>
          </div>
        </div>
      </div>

      <span className="hidden" aria-hidden="true">
        <BrainCircuit />
      </span>
    </div>
  );
};
