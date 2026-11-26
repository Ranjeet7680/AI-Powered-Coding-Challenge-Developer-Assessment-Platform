import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  GitBranch,
  Layers,
  Lock,
  PlayCircle,
  Send,
  Sparkles,
  Star,
  ThumbsUp,
  Unlock,
} from 'lucide-react';
import {
  MLCapstoneProject,
  MLCapstoneSubmission,
  MLCapstoneSubmitPayload,
  MLCourseReviewsOverview,
  MLCourseReviewSubmitPayload,
  MLLessonItem,
  MLModuleInfo,
  MLQuizResultRecord,
} from '../../types';

/* ============================================================================
 * 1. ADVANCED COURSE SYLlABUS & PREREQUISITE ROADMAP PANEL
 * ==========================================================================*/
interface SyllabusRoadmapProps {
  modules: MLModuleInfo[];
  lessons: MLLessonItem[];
  completedLessons: string[];
  quizResults: Record<string, MLQuizResultRecord>;
  capstoneCount: number;
  examPassed: boolean;
  onJumpToLesson: (lesson: MLLessonItem) => void;
  onJumpToTab: (tab: 'capstone' | 'final-exam') => void;
}

export const CourseSyllabusRoadmapPanel: React.FC<SyllabusRoadmapProps> = ({
  modules,
  lessons,
  completedLessons,
  quizResults,
  capstoneCount,
  examPassed,
  onJumpToLesson,
  onJumpToTab,
}) => {
  const totalCompleted = completedLessons.length;
  const quizzesDone = Object.values(quizResults).filter((r) => r.correct).length;

  const milestones = [
    { label: 'In-LMS Video Stream', status: totalCompleted > 0 ? 'Active' : 'Start Now', ok: totalCompleted > 0 },
    { label: 'Study Notes & Math', status: `${totalCompleted}/${lessons.length} Topics`, ok: totalCompleted > 0 },
    { label: 'After-Video Quizzes', status: `${quizzesDone}/${lessons.length} Passed`, ok: quizzesDone > 0 },
    { label: 'Capstone Project', status: capstoneCount > 0 ? `${capstoneCount} Submitted` : 'Required Stage', ok: capstoneCount > 0 },
    { label: 'Proctored Exam & PDF', status: examPassed ? 'Certified ✓' : '70% Pass Target', ok: examPassed },
  ];

  const isModuleCompleted = (modId: string) => {
    const modLessons = lessons.filter((l) => l.module_id === modId);
    return modLessons.length > 0 && modLessons.every((l) => completedLessons.includes(l.id));
  };

  return (
    <div className="space-y-6">
      {/* 5-Stage Mastery Pipeline */}
      <div className="rounded-3xl border border-indigo-500/25 bg-slate-900/80 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              Structured Mastery Blueprint
            </span>
            <h2 className="text-xl font-extrabold text-white mt-0.5">
              5-Stage End-to-End Learning Architecture
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onJumpToTab('capstone')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
            >
              Open Capstone Lab →
            </button>
            <button
              type="button"
              onClick={() => onJumpToTab('final-exam')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
            >
              Final Proctored Exam →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {milestones.map((m, idx) => (
            <div
              key={m.label}
              className={`rounded-2xl border p-3.5 transition ${
                m.ok
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : 'border-slate-800 bg-slate-950/70'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-mono text-slate-400">STEP 0{idx + 1}</span>
                {m.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                )}
              </div>
              <div className="text-xs font-bold text-white">{m.label}</div>
              <div className="text-[11px] text-cyan-300 font-semibold mt-0.5">{m.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Module Prerequisite Tree Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {modules.map((mod) => {
          const modLessons = lessons.filter((l) => l.module_id === mod.id);
          const doneInMod = modLessons.filter((l) => completedLessons.includes(l.id)).length;
          const pct = Math.round((doneInMod / Math.max(1, modLessons.length)) * 100);
          const prereqs = mod.prerequisite_module_ids || [];
          const prereqsMet = prereqs.every((pid) => isModuleCompleted(pid));
          const targetLesson =
            modLessons.find((l) => !completedLessons.includes(l.id)) || modLessons[0];

          return (
            <div
              key={mod.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 flex flex-col justify-between gap-4 hover:border-indigo-500/40 transition"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                    <Layers className="w-3.5 h-3.5" />
                    Module {mod.order} · Lectures {mod.lesson_start}–{mod.lesson_end}
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-cyan-400" />~{mod.estimated_hours || 2}h
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border ${
                        prereqs.length === 0 || prereqsMet
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      {prereqs.length === 0 || prereqsMet ? (
                        <>
                          <Unlock className="w-3 h-3" /> Ready
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" /> Prereq M{mod.order - 1}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-white leading-snug">{mod.title}</h3>
                {mod.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{mod.description}</p>
                )}

                {mod.learning_objectives && mod.learning_objectives.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {mod.learning_objectives.map((obj) => (
                      <li key={obj} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {mod.key_topics && mod.key_topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mod.key_topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Module Progress ({doneInMod}/{modLessons.length})
                  </span>
                  <span className="font-bold text-emerald-400">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {targetLesson && (
                  <button
                    type="button"
                    onClick={() => onJumpToLesson(targetLesson)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-xs font-bold text-white transition"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    {doneInMod > 0 && doneInMod < modLessons.length
                      ? `Resume Lecture #${targetLesson.order}`
                      : doneInMod === modLessons.length
                      ? `Review Module #${mod.order}`
                      : `Start Module #${mod.order}`}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. GRADED CAPSTONE PROJECT ASSIGNMENT WORKSPACE
 * ==========================================================================*/
interface CapstoneWorkspaceProps {
  courseTitle: string;
  projects: MLCapstoneProject[];
  submissions: MLCapstoneSubmission[];
  onSubmitCapstone: (payload: MLCapstoneSubmitPayload) => Promise<void>;
  isSubmitting: boolean;
}

export const CapstoneWorkspacePanel: React.FC<CapstoneWorkspaceProps> = ({
  courseTitle,
  projects,
  submissions,
  onSubmitCapstone,
  isSubmitting,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  const [repoUrl, setRepoUrl] = useState<string>('');
  const [demoUrl, setDemoUrl] = useState<string>('');
  const [architectureNotes, setArchitectureNotes] = useState<string>('');
  const [codeSubmission, setCodeSubmission] = useState<string>(
    projects[0]?.starter_template || ''
  );

  const handleSelectProject = (proj: MLCapstoneProject) => {
    setSelectedProjectId(proj.id);
    setCodeSubmission(proj.starter_template || '');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    await onSubmitCapstone({
      project_id: activeProject.id,
      title: activeProject.title,
      repo_url: repoUrl,
      demo_url: demoUrl,
      architecture_notes: architectureNotes,
      code_submission: codeSubmission,
    });
  };

  if (!activeProject) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-8 text-center text-sm text-slate-400">
        No capstone assignments configured for this track.
      </div>
    );
  }

  const approvedIds = new Set(
    submissions.filter((s) => s.status === 'Approved').map((s) => s.project_id)
  );

  return (
    <div className="space-y-6">
      {/* Project Brief Picker Cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Hands-On Applied Engineering Assignments
            </span>
            <h2 className="text-xl font-extrabold text-white">
              {courseTitle} — Capstone Projects
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            {approvedIds.size}/{projects.length} Approved (+120 XP each)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {projects.map((proj, idx) => {
            const isSelected = proj.id === activeProject.id;
            const isApproved = approvedIds.has(proj.id);
            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => handleSelectProject(proj)}
                className={`text-left p-4 rounded-2xl border transition space-y-2 ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-400 shadow-lg shadow-indigo-500/15'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-indigo-300">PROJECT 0{idx + 1}</span>
                  {isApproved ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  ) : (
                    <span className="text-amber-300 font-semibold">{proj.difficulty}</span>
                  )}
                </div>
                <div className="text-xs font-bold text-white line-clamp-2">{proj.title}</div>
                <div className="text-[11px] text-slate-400">~{proj.estimated_hours} hrs</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Brief + Submission Form Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Brief, Deliverables & Rubric */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-5">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
              {activeProject.difficulty} · {activeProject.estimated_hours} Hours
            </span>
            <h3 className="text-lg font-extrabold text-white mt-2">{activeProject.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">{activeProject.summary}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Required Deliverables
            </h4>
            <ul className="space-y-2 text-xs text-slate-200">
              {activeProject.deliverables.map((del) => (
                <li key={del} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{del}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Grading Rubric (100 Points)
            </h4>
            <div className="space-y-2">
              {activeProject.rubric.map((r) => (
                <div
                  key={r.criterion}
                  className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <span className="text-slate-300">{r.criterion}</span>
                  <span className="font-mono font-bold text-cyan-300">{r.max_points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Capstone Submission Studio + Evaluated History */}
        <div className="lg:col-span-7 space-y-5">
          <form
            onSubmit={handleFormSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                Submit Capstone Artifact &amp; Write-Up
              </h4>
              <button
                type="button"
                onClick={() => setCodeSubmission(activeProject.starter_template)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition"
              >
                Reset Starter Template
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  GitHub Repository URL (optional)
                </label>
                <div className="relative">
                  <GitBranch className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/capstone"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Live Notebook / Demo Link (optional)
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://colab.research.google.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Architecture Notes, Trade-Offs &amp; Validation Metrics (min 20 chars)
              </label>
              <textarea
                required
                minLength={20}
                rows={4}
                value={architectureNotes}
                onChange={(e) => setArchitectureNotes(e.target.value)}
                placeholder="Document your mathematical formulation, feature scaling/regularization decisions, error analysis observations, and held-out metrics..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none p-3 text-xs text-slate-200 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Python Implementation Code
              </label>
              <textarea
                rows={8}
                value={codeSubmission}
                onChange={(e) => setCodeSubmission(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none p-3 text-xs font-mono text-cyan-200 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Evaluating Rubric...' : 'Submit Capstone Assignment (+120 XP)'}
            </button>
          </form>

          {/* Submission Evaluation History */}
          {submissions.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Graded Capstone Submissions ({submissions.length})
              </h4>
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-bold text-white">{sub.title}</div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          sub.status === 'Approved'
                            ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                            : 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                        }`}
                      >
                        {sub.status} · {sub.overall_score}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{sub.ai_feedback}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(sub.rubric_scores).map(([crit, pts]) => (
                        <span
                          key={crit}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-300"
                        >
                          {crit}: {pts} pts
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. COURSE FEEDBACK PAGE, SURVEY METRICS & PEER REVIEWS SYSTEM PANEL
 * ==========================================================================*/
interface CourseReviewsPanelProps {
  courseTitle: string;
  reviewsData: MLCourseReviewsOverview | null;
  onSubmitReview: (payload: MLCourseReviewSubmitPayload) => Promise<void>;
  onToggleHelpful: (reviewId: string) => Promise<void>;
  onProceedToCertificate?: () => void;
  isSubmittingReview: boolean;
}

export const CourseReviewsPanel: React.FC<CourseReviewsPanelProps> = ({
  courseTitle,
  reviewsData,
  onSubmitReview,
  onToggleHelpful,
  onProceedToCertificate,
  isSubmittingReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [contentRating, setContentRating] = useState<number>(5);
  const [quizRating, setQuizRating] = useState<number>(5);
  const [npsScore, setNpsScore] = useState<number>(10);
  const [headline, setHeadline] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [improvementSuggestion, setImprovementSuggestion] = useState<string>('');
  const [submittedJustNow, setSubmittedJustNow] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || !comment.trim()) return;
    await onSubmitReview({
      rating,
      content_rating: contentRating,
      quiz_rating: quizRating,
      nps_score: npsScore,
      headline,
      comment,
      improvement_suggestion: improvementSuggestion,
    });
    setHeadline('');
    setComment('');
    setImprovementSuggestion('');
    setSubmittedJustNow(true);
  };

  const total = reviewsData?.total_reviews || 0;
  const avg = reviewsData?.average_rating?.toFixed(1) || '5.0';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Rating Summary + Structured Feedback Survey Form */}
      <div className="lg:col-span-5 space-y-5">
        <div className="rounded-2xl border border-amber-500/25 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Course Feedback &amp; Verified Ratings
              </div>
              <div className="text-4xl font-black text-white mt-1 flex items-center gap-2">
                {avg}
                <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Based on {total} learner feedback submissions for {courseTitle}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewsData?.rating_breakdown?.[String(star)] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2.5 text-xs">
                  <span className="w-8 font-mono text-slate-300">{star}★</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-slate-400">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Submit Course Feedback &amp; Review</h3>
            {submittedJustNow && onProceedToCertificate && (
              <button
                type="button"
                onClick={onProceedToCertificate}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                Next: Certificate →
              </button>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Overall Rating</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  aria-label={`Rate ${starVal} stars`}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-400/50 transition"
                >
                  <Star
                    className={`w-5 h-5 ${
                      starVal <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-amber-300">{rating}.0 / 5.0</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-xl bg-slate-950/75 border border-slate-800 p-2.5 space-y-1.5">
              <div className="text-slate-400 font-semibold">Lecture Clarity ({contentRating}/5)</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setContentRating(v)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold ${
                      v <= contentRating ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-slate-950/75 border border-slate-800 p-2.5 space-y-1.5">
              <div className="text-slate-400 font-semibold">Quizzes &amp; Exam ({quizRating}/5)</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setQuizRating(v)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold ${
                      v <= quizRating ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Recommend Score (NPS)</span>
              <span className="font-mono font-bold text-emerald-300">{npsScore}/10</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setNpsScore(val)}
                  className={`flex-1 py-1 rounded text-[10px] font-mono font-bold ${
                    val <= npsScore
                      ? 'bg-emerald-600/80 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-500'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Feedback headline (e.g. Crystal clear derivations & capstones)"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:outline-none text-xs text-white"
          />

          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience across lectures, after-video quizzes, capstone & camera exam..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:outline-none text-xs text-slate-200 leading-relaxed"
          />

          <input
            type="text"
            value={improvementSuggestion}
            onChange={(e) => setImprovementSuggestion(e.target.value)}
            placeholder="What could make future cohorts even better? (optional)"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs text-slate-300"
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-extrabold transition"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmittingReview ? 'Submitting Feedback...' : 'Submit Feedback (+20 XP)'}
            </button>
            {onProceedToCertificate && (
              <button
                type="button"
                onClick={onProceedToCertificate}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Next: Certificate <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right: Peer Reviews List */}
      <div className="lg:col-span-7 space-y-3">
        {(reviewsData?.reviews || []).map((rev) => (
          <div
            key={rev.id}
            className={`rounded-2xl border p-5 space-y-3 ${
              rev.is_own_review
                ? 'border-amber-500/40 bg-amber-950/15'
                : 'border-slate-800 bg-slate-900/75'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-white">{rev.author_name}</span>
                  <span className="text-[11px] text-slate-400">{rev.author_role}</span>
                  {rev.verified_learner && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Verified Learner
                    </span>
                  )}
                  {rev.is_own_review && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      Your Feedback
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-100 mt-1">{rev.headline}</h4>
              </div>

              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

            {(rev.content_rating || rev.quiz_rating) && (
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                <span>Clarity: {rev.content_rating ?? 5}/5</span>
                <span>•</span>
                <span>Quizzes: {rev.quiz_rating ?? 5}/5</span>
                <span>•</span>
                <span>NPS: {rev.nps_score ?? 10}/10</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-[11px]">
              <span className="text-slate-500 font-mono">
                {rev.created_at.slice(0, 10)}
              </span>
              <button
                type="button"
                onClick={() => onToggleHelpful(rev.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition ${
                  rev.viewer_has_voted
                    ? 'bg-indigo-600/25 border-indigo-400 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Helpful ({rev.helpful_count})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
