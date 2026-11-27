import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Gift,
  GraduationCap,
  Layers,
  Lock,
  PlayCircle,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { api } from '../services/api';
import { MLCourseOverview, MLCourseReviewsOverview } from '../types';
import {
  COURSE_TRACK_META,
  COURSE_TRACK_ORDER,
  resolveCourseTrack,
} from '../constants/courseTracks';
import { CourseShareButton } from '../components/lms/CourseShareButton';
import { syncCourseOpenGraphMeta } from '../utils/courseShare';

export const CourseDetailPage: React.FC = () => {
  const { track: routeTrack } = useParams<{ track?: string }>();
  const track = resolveCourseTrack(routeTrack);
  const learnBasePath = COURSE_TRACK_META[track].learnBasePath;

  const [course, setCourse] = useState<MLCourseOverview | null>(null);
  const [reviews, setReviews] = useState<MLCourseReviewsOverview | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const client = api.courseLms(track);
    Promise.all([client.getOverview(), client.getReviews().catch(() => null)])
      .then(([ov, rev]) => {
        if (cancelled) return;
        setCourse(ov);
        setReviews(rev);
        syncCourseOpenGraphMeta({
          track,
          title: ov.title,
          instructor: ov.instructor,
          lectureCount: ov.total_lessons,
          moduleCount: ov.modules.length,
          thumbnailUrl: ov.thumbnail_url,
        });
        const initialExpanded: Record<string, boolean> = {};
        if (ov.modules.length > 0) {
          initialExpanded[ov.modules[0].id] = true;
        }
        setExpandedModules(initialExpanded);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [track]);

  if (isLoading || !course) {
    return (
      <div className="space-y-6">
        <div className="h-56 rounded-xl bg-[#19191b] border border-white/[0.08] animate-pulse" />
        <div className="h-80 rounded-xl bg-[#19191b] border border-white/[0.08] animate-pulse" />
      </div>
    );
  }

  const completed = course.progress?.completed_lessons || [];
  const nextLecture =
    course.lessons.find((l) => !completed.includes(l.id)) || course.lessons[0];
  const totalHours = Number(
    course.modules.reduce((acc, m) => acc + (m.estimated_hours || 2), 0).toFixed(1)
  );
  const completionPct = Math.round((completed.length / Math.max(1, course.total_lessons)) * 100);

  const expandAllModules = () => {
    const next: Record<string, boolean> = {};
    course.modules.forEach((m) => {
      next[m.id] = true;
    });
    setExpandedModules(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/app/lms"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#85858b] hover:text-[#ededed] transition-colors shrink-0 whitespace-nowrap"
        >
          <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
          <span>All courses</span>
        </Link>
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#19191b] border border-white/[0.08] text-xs font-mono tabular-nums">
          {COURSE_TRACK_ORDER.map((id) => (
            <Link
              key={id}
              to={COURSE_TRACK_META[id].lmsDetailPath}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                track === id ? 'bg-[#222225] text-[#ededed]' : 'text-[#85858b] hover:text-[#ededed]'
              }`}
            >
              {COURSE_TRACK_META[id].switcherLabel}
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Card */}
      <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="text-[#e5a00d]">
              {COURSE_TRACK_META[track].eyebrowLabel}
            </span>
            {reviews && (
              <span className="inline-flex items-center gap-1 text-[#a1a1a6] tabular-nums">
                <Star strokeWidth={1.5} className="w-3.5 h-3.5 fill-current text-[#e5a00d]" />
                <span>
                  {reviews.average_rating.toFixed(1)} ({reviews.total_reviews} reviews)
                </span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#ededed] leading-snug">
            {course.title}
          </h1>

          <p className="text-sm text-[#a1a1a6] leading-relaxed">
            Instructor: <span className="text-[#ededed]">{course.instructor}</span>. Inspect modules, prerequisites, capstones, and lectures below before entering the classroom.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <Link
              to={nextLecture ? `${learnBasePath}/${nextLecture.id}` : learnBasePath}
              className="inline-flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-medium text-[#141415] bg-[#ededed] hover:bg-white transition-colors"
            >
              <PlayCircle strokeWidth={1.5} className="w-4 h-4" />
              <span>
                {completed.length > 0 ? `Resume lecture #${nextLecture.order}` : 'Start lectures'}
              </span>
              <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
            </Link>
            <a
              href="#scroll-syllabus"
              className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] text-[#ededed] border border-white/[0.08] text-xs font-medium transition-colors tabular-nums"
            >
              <Layers strokeWidth={1.5} className="w-3.5 h-3.5 text-[#a1a1a6]" />
              <span>Syllabus ({course.total_lessons})</span>
            </a>
            <CourseShareButton
              track={track}
              title={course.title}
              instructor={course.instructor}
              lectureCount={course.total_lessons}
              moduleCount={course.modules.length}
              thumbnailUrl={course.thumbnail_url}
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          {course.thumbnail_url && (
            <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#141415]">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full aspect-video object-cover"
              />
              <div className="px-4 py-2.5 bg-[#0f0f10] border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#a1a1a6] tabular-nums">
                <span className="flex items-center gap-1.5 text-[#4cc38a]">
                  <Lock strokeWidth={1.5} className="w-3.5 h-3.5" />
                  <span>In-LMS player</span>
                </span>
                <span>{course.total_lessons} lectures</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-6 space-y-4">
            <h2 className="text-base font-medium text-[#ededed]">Included in this track</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#a1a1a6] tabular-nums">
              <div className="p-3.5 rounded-lg bg-[#141415] border border-white/[0.08] flex items-start gap-2.5">
                <PlayCircle strokeWidth={1.5} className="w-4 h-4 text-[#85858b] shrink-0 mt-0.5" />
                <span>{course.total_lessons} video lectures with notes and code</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#141415] border border-white/[0.08] flex items-start gap-2.5">
                <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a] shrink-0 mt-0.5" />
                <span>{course.total_quizzes}+ post-lecture and mastery quizzes</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#141415] border border-white/[0.08] flex items-start gap-2.5">
                <Code2 strokeWidth={1.5} className="w-4 h-4 text-[#85858b] shrink-0 mt-0.5" />
                <span>{course.capstone_projects?.length || 3} rubric-graded capstones</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#141415] border border-white/[0.08] flex items-start gap-2.5">
                <ShieldCheck strokeWidth={1.5} className="w-4 h-4 text-[#e5a00d] shrink-0 mt-0.5" />
                <span>Camera-proctored final exam and PDF credential</span>
              </div>
            </div>
          </div>

          <div id="scroll-syllabus" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-medium text-[#ededed]">Course curriculum</h2>
                <p className="text-xs text-[#85858b]">
                  Select any lecture to open it directly inside the LMS
                </p>
              </div>
              <button
                type="button"
                onClick={expandAllModules}
                className="px-3 h-8 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
              >
                Expand all ({course.modules.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {course.modules.map((mod) => {
                const modLessons = course.lessons.filter((l) => l.module_id === mod.id);
                const doneInMod = modLessons.filter((l) => completed.includes(l.id)).length;
                const isOpen = Boolean(expandedModules[mod.id]);

                return (
                  <div
                    key={mod.id}
                    className="rounded-xl border border-white/[0.08] bg-[#19191b] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedModules((prev) => ({
                          ...prev,
                          [mod.id]: !isOpen,
                        }))
                      }
                      className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-[#222225]/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums">
                          <span className="text-[#e5a00d]">Module {mod.order}</span>
                          <span className="text-[#85858b]">
                            {modLessons.length} lectures · ~{mod.estimated_hours || 2}h
                          </span>
                          <span className="text-[#4cc38a]">
                            {doneInMod}/{modLessons.length} done
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-[#ededed]">{mod.title}</h3>
                        {mod.description && (
                          <p className="text-xs text-[#85858b] leading-relaxed">{mod.description}</p>
                        )}
                      </div>
                      {isOpen ? (
                        <ChevronUp strokeWidth={1.5} className="w-4 h-4 text-[#85858b] shrink-0 mt-1" />
                      ) : (
                        <ChevronDown strokeWidth={1.5} className="w-4 h-4 text-[#85858b] shrink-0 mt-1" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/[0.08] bg-[#141415] divide-y divide-white/[0.06]">
                        {modLessons.map((lesson) => {
                          const done = completed.includes(lesson.id);
                          return (
                            <Link
                              key={lesson.id}
                              to={`${learnBasePath}/${lesson.id}`}
                              className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#222225]/60 transition-colors group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {done ? (
                                  <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a] shrink-0" />
                                ) : (
                                  <PlayCircle strokeWidth={1.5} className="w-4 h-4 text-[#85858b] group-hover:text-[#ededed] shrink-0" />
                                )}
                                <span className="text-xs text-[#a1a1a6] group-hover:text-[#ededed] truncate tabular-nums">
                                  #{lesson.order}. {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 text-xs font-mono text-[#85858b] tabular-nums">
                                <span>{lesson.duration_label}</span>
                                <span className="text-[#a1a1a6]">Quiz</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {course.capstone_projects && course.capstone_projects.length > 0 && (
            <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium text-[#ededed]">Capstone projects</h2>
                <Link to={learnBasePath} className="text-xs text-[#a1a1a6] hover:text-[#ededed]">
                  Open capstone lab →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {course.capstone_projects.map((cap) => (
                  <div
                    key={cap.id}
                    className="rounded-lg border border-white/[0.08] bg-[#141415] p-4 space-y-1.5"
                  >
                    <span className="text-xs font-mono text-[#e5a00d] tabular-nums">
                      {cap.difficulty} · ~{cap.estimated_hours}h
                    </span>
                    <h3 className="text-xs font-medium text-[#ededed] leading-snug">{cap.title}</h3>
                    <p className="text-xs text-[#85858b] line-clamp-3">{cap.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Sidebar */}
        <aside className="lg:col-span-4 sticky top-6 rounded-xl border border-white/[0.08] bg-[#19191b] p-6 space-y-5 tabular-nums">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#a1a1a6]">Track progress</span>
            <span className="text-[#4cc38a]">Enrolled</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#85858b]">Completion</span>
              <span className="font-mono text-[#ededed]">{completionPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#222225] overflow-hidden">
              <div className="h-full bg-[#e5a00d]" style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          <div className="space-y-2.5 text-xs border-t border-b border-white/[0.08] py-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#85858b]">
                <Clock strokeWidth={1.5} className="w-4 h-4" />
                <span>Estimated study</span>
              </span>
              <span className="font-mono text-[#ededed]">~{totalHours} hrs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#85858b]">
                <BookOpen strokeWidth={1.5} className="w-4 h-4" />
                <span>Quizzes &amp; notes</span>
              </span>
              <span className="font-mono text-[#ededed]">{course.total_quizzes}+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#85858b]">
                <Award strokeWidth={1.5} className="w-4 h-4" />
                <span>PDF certificate</span>
              </span>
              <span className="font-mono text-[#4cc38a]">SHA-256</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#85858b]">
                <Gift strokeWidth={1.5} className="w-4 h-4" />
                <span>Graduate kit</span>
              </span>
              <span className="font-mono text-[#e5a00d]">Included</span>
            </div>
          </div>

          <Link
            to={nextLecture ? `${learnBasePath}/${nextLecture.id}` : learnBasePath}
            className="w-full inline-flex items-center justify-center gap-2 px-4 h-10 rounded-lg text-[#141415] bg-[#ededed] hover:bg-white text-xs font-medium transition-colors"
          >
            <GraduationCap strokeWidth={1.5} className="w-4 h-4" />
            <span>{completed.length > 0 ? 'Continue coursework' : 'Start coursework'}</span>
          </Link>
        </aside>
      </div>
    </div>
  );
};
