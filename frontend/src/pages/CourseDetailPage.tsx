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
  Sparkles,
  Star,
} from 'lucide-react';
import { api } from '../services/api';
import { MLCourseOverview, MLCourseReviewsOverview } from '../types';

export const CourseDetailPage: React.FC = () => {
  const { track: routeTrack } = useParams<{ track?: string }>();
  const track: 'ml' | 'dl' = routeTrack === 'dl' ? 'dl' : 'ml';
  const isDL = track === 'dl';
  const learnBasePath = isDL ? '/app/dl-course' : '/app/ml-course';

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
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        <div className="h-96 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
      </div>
    );
  }

  const completed = course.progress?.completed_lessons || [];
  const nextLecture =
    course.lessons.find((l) => !completed.includes(l.id)) || course.lessons[0];
  const totalHours = course.modules.reduce((acc, m) => acc + (m.estimated_hours || 2), 0);
  const completionPct = Math.round((completed.length / Math.max(1, course.total_lessons)) * 100);

  const expandAllModules = () => {
    const next: Record<string, boolean> = {};
    course.modules.forEach((m) => {
      next[m.id] = true;
    });
    setExpandedModules(next);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Breadcrumb Back Link */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/app/lms"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All LMS Courses
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/app/lms/ml"
            className={`px-3 py-1 rounded-lg font-bold transition ${
              !isDL ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            ML (106)
          </Link>
          <Link
            to="/app/lms/dl"
            className={`px-3 py-1 rounded-lg font-bold transition ${
              isDL ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Stanford DL (21)
          </Link>
        </div>
      </div>

      {/* Course Detail Hero Banner */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
          isDL
            ? 'border-rose-500/35 bg-gradient-to-br from-[#160913] via-slate-900 to-[#0B1226]'
            : 'border-indigo-500/35 bg-gradient-to-br from-[#0A1026] via-slate-900 to-[#081A20]'
        }`}
      >
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isDL
                  ? 'bg-rose-500/15 border-rose-500/35 text-rose-300'
                  : 'bg-indigo-500/15 border-indigo-500/35 text-indigo-300'
              }`}
            >
              {isDL ? 'STANFORD × CODING TASK FACTORY ACADEMY' : 'FLAGSHIP ENGINEERING ACADEMY'}
            </span>
            {reviews && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {reviews.average_rating.toFixed(1)}★ ({reviews.total_reviews} Reviews)
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {course.title}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Instructor Track: <strong className="text-white">{course.instructor}</strong>. Scroll
            below to inspect every module, prerequisite, capstone assignment, and lecture before
            launching into the distraction-free In-LMS classroom.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to={nextLecture ? `${learnBasePath}/${nextLecture.id}` : learnBasePath}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-xs sm:text-sm font-extrabold transition shadow-xl ${
                isDL
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              {completed.length > 0
                ? `Resume Lecture #${nextLecture.order}`
                : 'Start Lectures in LMS'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#scroll-syllabus"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-bold transition"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              Scroll Full Curriculum ({course.total_lessons})
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          {course.thumbnail_url && (
            <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full aspect-video object-cover"
              />
              <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <Lock className="w-3.5 h-3.5" /> In-LMS Locked Player
                </span>
                <span>{course.total_lessons} HD Lectures</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Course Content + Sticky Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Scrollable Body */}
        <div className="lg:col-span-8 space-y-8">
          {/* End-to-End Certification Outcomes */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              What This Academy Includes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
              <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800 flex items-start gap-2.5">
                <PlayCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{course.total_lessons} In-LMS Video Lectures with Math Notes &amp; Code</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{course.total_quizzes}+ After-Video &amp; Cumulative Mastery Quizzes</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800 flex items-start gap-2.5">
                <Code2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{course.capstone_projects?.length || 3} Rubric-Evaluated Capstone Assignments</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Camera Cheat-Protected Final Exam + Verified PDF &amp; Swag</span>
              </div>
            </div>
          </div>

          {/* Scrollable Full Syllabus */}
          <div id="scroll-syllabus" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Complete Scrollable Course Curriculum
                </h2>
                <p className="text-xs text-slate-400">
                  Click any module or lecture below to launch directly at that exact lesson inside the LMS.
                </p>
              </div>
              <button
                type="button"
                onClick={expandAllModules}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              >
                Expand All {course.modules.length} Modules
              </button>
            </div>

            <div className="space-y-3">
              {course.modules.map((mod) => {
                const modLessons = course.lessons.filter((l) => l.module_id === mod.id);
                const doneInMod = modLessons.filter((l) => completed.includes(l.id)).length;
                const isOpen = Boolean(expandedModules[mod.id]);

                return (
                  <div
                    key={mod.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/75 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedModules((prev) => ({
                          ...prev,
                          [mod.id]: !isOpen,
                        }))
                      }
                      className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-slate-800/40 transition"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold">
                            Module {mod.order}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {modLessons.length} Lectures · ~{mod.estimated_hours || 2} hrs
                          </span>
                          <span className="text-emerald-400 font-bold">
                            {doneInMod}/{modLessons.length} Done
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">{mod.title}</h3>
                        {mod.description && (
                          <p className="text-xs text-slate-400 leading-relaxed">{mod.description}</p>
                        )}
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-800 bg-slate-950/60 divide-y divide-slate-800/60">
                        {modLessons.map((lesson) => {
                          const done = completed.includes(lesson.id);
                          return (
                            <Link
                              key={lesson.id}
                              to={`${learnBasePath}/${lesson.id}`}
                              className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-indigo-600/10 transition group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {done ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <PlayCircle className="w-4 h-4 text-indigo-400 group-hover:text-cyan-300 shrink-0" />
                                )}
                                <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                                  #{lesson.order}. {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono text-slate-500">
                                <span>{lesson.duration_label}</span>
                                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                                  +Quiz
                                </span>
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

          {/* Capstones Preview Section */}
          {course.capstone_projects && course.capstone_projects.length > 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  Included Capstone Project Assignments
                </h2>
                <Link
                  to={learnBasePath}
                  className="text-xs font-bold text-cyan-300 hover:underline"
                >
                  Open Capstone Lab →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {course.capstone_projects.map((cap) => (
                  <div
                    key={cap.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4 space-y-2"
                  >
                    <span className="text-[10px] font-mono font-bold text-amber-300">
                      {cap.difficulty} · ~{cap.estimated_hours}h
                    </span>
                    <h3 className="text-xs font-bold text-white leading-snug">{cap.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-3">{cap.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Right Course Enrollment & Flow Card */}
        <aside className="lg:col-span-4 sticky top-6 rounded-3xl border border-slate-800 bg-slate-900/85 p-6 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Course Readiness
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
              Enrolled Free
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Overall Progress</span>
              <span className="font-mono font-bold text-white">{completionPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 border-t border-b border-slate-800 py-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-cyan-400" /> Estimated Study
              </span>
              <span className="font-bold text-white">~{totalHours} Hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <BookOpen className="w-4 h-4 text-indigo-400" /> Quizzes &amp; Notes
              </span>
              <span className="font-bold text-white">{course.total_quizzes}+ Included</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <Award className="w-4 h-4 text-emerald-400" /> PDF Certificate
              </span>
              <span className="font-bold text-emerald-300">SHA-256 Verified</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <Gift className="w-4 h-4 text-amber-400" /> Graduate Goodies
              </span>
              <span className="font-bold text-amber-300">Eligible on Finish</span>
            </div>
          </div>

          <Link
            to={nextLecture ? `${learnBasePath}/${nextLecture.id}` : learnBasePath}
            className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white text-xs sm:text-sm font-extrabold transition shadow-xl ${
              isDL
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            {completed.length > 0 ? 'Continue Lectures & Quizzes' : 'Begin Full Course Flow'}
          </Link>
        </aside>
      </div>
    </div>
  );
};
