import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock,
  Code2,
  GitBranch,
  Layers,
  Lock,
  PlayCircle,
  Send,
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
 * 1. ADVANCED COURSE SYLLABUS & PREREQUISITE ROADMAP PANEL
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
    {
      label: 'In-LMS video stream',
      status: totalCompleted > 0 ? 'Active' : 'Start now',
      ok: totalCompleted > 0,
    },
    {
      label: 'Study notes & math',
      status: `${totalCompleted}/${lessons.length} topics`,
      ok: totalCompleted > 0,
    },
    {
      label: 'After-video quizzes',
      status: `${quizzesDone}/${lessons.length} passed`,
      ok: quizzesDone > 0,
    },
    {
      label: 'Capstone project',
      status: capstoneCount > 0 ? `${capstoneCount} submitted` : 'Required stage',
      ok: capstoneCount > 0,
    },
    {
      label: 'Proctored exam & PDF',
      status: examPassed ? 'Certified' : '70% pass target',
      ok: examPassed,
    },
  ];

  const isModuleCompleted = (modId: string) => {
    const modLessons = lessons.filter((l) => l.module_id === modId);
    return modLessons.length > 0 && modLessons.every((l) => completedLessons.includes(l.id));
  };

  return (
    <div className="space-y-6">
      {/* 5-Stage Mastery Pipeline */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#19191b] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-medium text-[#e5a00d]">
              Structured mastery blueprint
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-[#ededed] mt-0.5 tracking-tight">
              5-stage end-to-end learning architecture
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onJumpToTab('capstone')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-[#ededed] text-xs font-medium transition-colors"
            >
              Open capstone lab
              <ArrowRight className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => onJumpToTab('final-exam')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
            >
              Final proctored exam
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {milestones.map((m, idx) => (
            <div
              key={m.label}
              className={`rounded-xl border p-3.5 transition-colors ${
                m.ok
                  ? 'border-[#4cc38a]/30 bg-[#4cc38a]/[0.05]'
                  : 'border-white/[0.08] bg-[#141415]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5 tabular-nums">
                <span className="font-mono text-[#85858b]">Step 0{idx + 1}</span>
                {m.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-[#4cc38a]" strokeWidth={1.5} />
                ) : (
                  <CircleDot className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
                )}
              </div>
              <div className="text-xs font-medium text-[#ededed]">{m.label}</div>
              <div className="text-xs text-[#a1a1a6] mt-0.5 tabular-nums font-mono">{m.status}</div>
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
              className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col justify-between gap-4 hover:border-white/[0.16] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#222225] border border-white/[0.08] text-[#ededed] text-xs font-medium tabular-nums">
                    <Layers className="w-3.5 h-3.5 text-[#e5a00d]" strokeWidth={1.5} />
                    Module {mod.order} · Lectures {mod.lesson_start}–{mod.lesson_end}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-[#85858b] font-mono tabular-nums">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />~{mod.estimated_hours || 2}h
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border ${
                        prereqs.length === 0 || prereqsMet
                          ? 'bg-[#4cc38a]/10 border-[#4cc38a]/30 text-[#4cc38a]'
                          : 'bg-[#e5a00d]/10 border-[#e5a00d]/30 text-[#e5a00d]'
                      }`}
                    >
                      {prereqs.length === 0 || prereqsMet ? (
                        <>
                          <Unlock className="w-3 h-3" strokeWidth={1.5} /> Ready
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" strokeWidth={1.5} /> Prereq M{mod.order - 1}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-medium text-[#ededed] leading-snug">{mod.title}</h3>
                {mod.description && (
                  <p className="text-xs text-[#a1a1a6] leading-relaxed">{mod.description}</p>
                )}

                {mod.learning_objectives && mod.learning_objectives.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-[#a1a1a6]">
                    {mod.learning_objectives.map((obj) => (
                      <li key={obj} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4cc38a] shrink-0 mt-0.5" strokeWidth={1.5} />
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
                        className="px-2 py-0.5 rounded bg-[#141415] border border-white/[0.08] text-[11px] font-mono text-[#a1a1a6]"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
                <div className="flex items-center justify-between text-xs tabular-nums">
                  <span className="text-[#85858b]">
                    Progress ({doneInMod}/{modLessons.length})
                  </span>
                  <span className="font-mono font-medium text-[#ededed]">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#141415] overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      pct === 100 ? 'bg-[#4cc38a]' : 'bg-[#e5a00d]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {targetLesson && (
                  <button
                    type="button"
                    onClick={() => onJumpToLesson(targetLesson)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#222225] hover:bg-[#ededed] text-[#ededed] hover:text-[#141415] border border-white/[0.08] text-xs font-medium transition-colors"
                  >
                    <PlayCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {doneInMod > 0 && doneInMod < modLessons.length
                      ? `Resume lecture #${targetLesson.order}`
                      : doneInMod === modLessons.length
                      ? `Review module #${mod.order}`
                      : `Start module #${mod.order}`}
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
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
      <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-8 text-center text-sm text-[#85858b]">
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
      <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-medium text-[#e5a00d]">
              Applied engineering assignments
            </span>
            <h2 className="text-lg font-semibold text-[#ededed] tracking-tight">
              {courseTitle} &mdash; Capstone projects
            </h2>
          </div>
          <span className="px-3 py-1 rounded-md bg-[#4cc38a]/10 border border-[#4cc38a]/30 text-[#4cc38a] text-xs font-medium tabular-nums">
            {approvedIds.size}/{projects.length} approved (+120 XP each)
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
                className={`text-left p-4 rounded-xl border transition-colors space-y-2 ${
                  isSelected
                    ? 'bg-[#222225] border-[#e5a00d]/60'
                    : 'bg-[#141415] border-white/[0.08] hover:border-white/[0.16]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] tabular-nums">
                  <span className="font-mono text-[#85858b]">Project 0{idx + 1}</span>
                  {isApproved ? (
                    <span className="text-[#4cc38a] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Approved
                    </span>
                  ) : (
                    <span className="text-[#e5a00d] font-medium">{proj.difficulty}</span>
                  )}
                </div>
                <div className="text-xs font-medium text-[#ededed] line-clamp-2">{proj.title}</div>
                <div className="text-xs text-[#85858b] font-mono tabular-nums">~{proj.estimated_hours} hrs</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Brief + Submission Form Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Brief, Deliverables & Rubric */}
        <div className="lg:col-span-5 rounded-xl border border-white/[0.08] bg-[#19191b] p-5 space-y-5">
          <div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#222225] border border-white/[0.08] text-[#e5a00d] text-xs font-medium tabular-nums">
              {activeProject.difficulty} · {activeProject.estimated_hours} hours
            </span>
            <h3 className="text-base font-semibold text-[#ededed] mt-2">{activeProject.title}</h3>
            <p className="text-xs text-[#a1a1a6] leading-relaxed mt-2">{activeProject.summary}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-[#85858b]">
              Required deliverables
            </h4>
            <ul className="space-y-2 text-xs text-[#ededed]">
              {activeProject.deliverables.map((del) => (
                <li key={del} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4cc38a] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="text-[#a1a1a6]">{del}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/[0.06]">
            <h4 className="text-xs font-medium text-[#85858b]">
              Grading rubric (100 points)
            </h4>
            <div className="space-y-2">
              {activeProject.rubric.map((r) => (
                <div
                  key={r.criterion}
                  className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-[#141415] border border-white/[0.08] tabular-nums"
                >
                  <span className="text-[#a1a1a6]">{r.criterion}</span>
                  <span className="font-mono font-medium text-[#ededed]">{r.max_points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Capstone Submission Studio + Evaluated History */}
        <div className="lg:col-span-7 space-y-5">
          <form
            onSubmit={handleFormSubmit}
            className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-[#ededed] flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#e5a00d]" strokeWidth={1.5} />
                Submit capstone artifact
              </h4>
              <button
                type="button"
                onClick={() => setCodeSubmission(activeProject.starter_template)}
                className="px-2.5 py-1 rounded-md bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
              >
                Reset template
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#85858b] mb-1">
                  GitHub repository URL (optional)
                </label>
                <div className="relative">
                  <GitBranch className="w-3.5 h-3.5 text-[#85858b] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/capstone"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#141415] border border-white/[0.08] focus:border-[#e5a00d]/60 focus:outline-none text-xs text-[#ededed] placeholder:text-[#85858b]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#85858b] mb-1">
                  Live notebook / demo link (optional)
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://colab.research.google.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-[#141415] border border-white/[0.08] focus:border-[#e5a00d]/60 focus:outline-none text-xs text-[#ededed] placeholder:text-[#85858b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#85858b] mb-1">
                Architecture notes, trade-offs &amp; validation metrics (min 20 chars)
              </label>
              <textarea
                required
                minLength={20}
                rows={4}
                value={architectureNotes}
                onChange={(e) => setArchitectureNotes(e.target.value)}
                placeholder="Document your mathematical formulation, feature scaling/regularization decisions, error analysis observations, and held-out metrics..."
                className="w-full rounded-lg bg-[#141415] border border-white/[0.08] focus:border-[#e5a00d]/60 focus:outline-none p-3 text-xs text-[#ededed] placeholder:text-[#85858b] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#85858b] mb-1">
                Python implementation code
              </label>
              <textarea
                rows={8}
                value={codeSubmission}
                onChange={(e) => setCodeSubmission(e.target.value)}
                className="w-full rounded-lg bg-[#0f0f10] border border-white/[0.08] focus:border-[#e5a00d]/60 focus:outline-none p-3 text-xs font-mono text-[#ededed] leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-50 text-[#141415] text-xs font-medium transition-colors"
            >
              <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
              {isSubmitting ? 'Evaluating rubric...' : 'Submit capstone assignment (+120 XP)'}
            </button>
          </form>

          {/* Submission Evaluation History */}
          {submissions.length > 0 && (
            <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 space-y-4">
              <h4 className="text-sm font-medium text-[#ededed] flex items-center gap-2 tabular-nums">
                <Award className="w-4 h-4 text-[#4cc38a]" strokeWidth={1.5} />
                Graded capstone submissions ({submissions.length})
              </h4>
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-white/[0.08] bg-[#141415] p-4 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-medium text-[#ededed]">{sub.title}</div>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-medium border tabular-nums ${
                          sub.status === 'Approved'
                            ? 'bg-[#4cc38a]/10 border-[#4cc38a]/30 text-[#4cc38a]'
                            : 'bg-[#e5a00d]/10 border-[#e5a00d]/30 text-[#e5a00d]'
                        }`}
                      >
                        {sub.status} · {sub.overall_score}%
                      </span>
                    </div>
                    <p className="text-xs text-[#a1a1a6] leading-relaxed">{sub.ai_feedback}</p>
                    <div className="flex flex-wrap gap-1.5 tabular-nums">
                      {Object.entries(sub.rubric_scores).map(([crit, pts]) => (
                        <span
                          key={crit}
                          className="px-2 py-0.5 rounded bg-[#19191b] border border-white/[0.08] text-[11px] font-mono text-[#a1a1a6]"
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
        <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-[#e5a00d]">
                Course feedback &amp; verified ratings
              </div>
              <div className="text-3xl font-semibold text-[#ededed] mt-1 flex items-center gap-2 tabular-nums">
                {avg}
                <Star className="w-6 h-6 text-[#e5a00d] fill-[#e5a00d]" strokeWidth={1.5} />
              </div>
              <div className="text-xs text-[#85858b] mt-1 tabular-nums">
                Based on {total} learner feedback submissions for {courseTitle}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 tabular-nums">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewsData?.rating_breakdown?.[String(star)] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2.5 text-xs">
                  <span className="w-9 inline-flex items-center gap-1 font-mono text-[#a1a1a6]">
                    {star}
                    <Star className="w-3 h-3 text-[#e5a00d] fill-[#e5a00d]" strokeWidth={1.5} />
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-[#141415] overflow-hidden">
                    <div
                      className="h-full bg-[#e5a00d] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-[#85858b]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#ededed]">Submit course feedback</h3>
            {submittedJustNow && onProceedToCertificate && (
              <button
                type="button"
                onClick={onProceedToCertificate}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#4cc38a] hover:underline"
              >
                Next: Certificate
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-[#85858b]">Overall rating</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  aria-label={`Rate ${starVal} stars`}
                  className="p-1.5 rounded-lg bg-[#141415] border border-white/[0.08] hover:border-[#e5a00d]/50 transition-colors"
                >
                  <Star
                    className={`w-4 h-4 ${
                      starVal <= rating ? 'text-[#e5a00d] fill-[#e5a00d]' : 'text-[#85858b]'
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-mono text-[#ededed] tabular-nums">{rating}.0 / 5.0</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-[#141415] border border-white/[0.08] p-2.5 space-y-1.5">
              <div className="text-[#85858b] font-medium tabular-nums">Lecture clarity ({contentRating}/5)</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setContentRating(v)}
                    className={`flex-1 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                      v <= contentRating ? 'bg-[#ededed] text-[#141415]' : 'bg-[#222225] text-[#85858b]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-[#141415] border border-white/[0.08] p-2.5 space-y-1.5">
              <div className="text-[#85858b] font-medium tabular-nums">Quizzes &amp; exam ({quizRating}/5)</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setQuizRating(v)}
                    className={`flex-1 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                      v <= quizRating ? 'bg-[#ededed] text-[#141415]' : 'bg-[#222225] text-[#85858b]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs tabular-nums">
              <span className="text-[#85858b] font-medium">Recommend score (NPS)</span>
              <span className="font-mono font-medium text-[#4cc38a]">{npsScore}/10</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setNpsScore(val)}
                  className={`flex-1 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                    val <= npsScore
                      ? 'bg-[#e5a00d] text-[#141415]'
                      : 'bg-[#141415] border border-white/[0.08] text-[#85858b]'
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
            placeholder="Feedback headline (e.g. Clear derivations and capstones)"
            className="w-full px-3.5 py-2 rounded-lg bg-[#141415] border border-white/[0.08] focus:border-[#e5a00d]/60 focus:outline-none text-xs text-[#ededed] placeholder:text-[#85858b]"
          />

          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience across lectures, after-video quizzes, capstone, and proctored exam..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#141415] border border-white/[0.08] focus:border-[#e5a00d]/60 focus:outline-none text-xs text-[#ededed] placeholder:text-[#85858b] leading-relaxed"
          />

          <input
            type="text"
            value={improvementSuggestion}
            onChange={(e) => setImprovementSuggestion(e.target.value)}
            placeholder="What could improve future cohorts? (optional)"
            className="w-full px-3.5 py-2 rounded-lg bg-[#141415] border border-white/[0.08] focus:border-[#e5a00d]/60 focus:outline-none text-xs text-[#ededed] placeholder:text-[#85858b]"
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-50 text-[#141415] text-xs font-medium transition-colors"
            >
              <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
              {isSubmittingReview ? 'Submitting feedback...' : 'Submit feedback (+20 XP)'}
            </button>
            {onProceedToCertificate && (
              <button
                type="button"
                onClick={onProceedToCertificate}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-[#ededed] text-xs font-medium transition-colors"
              >
                Certificate <ChevronRight className="w-4 h-4 text-[#85858b]" strokeWidth={1.5} />
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
            className={`rounded-xl border p-5 space-y-3 ${
              rev.is_own_review
                ? 'border-[#e5a00d]/45 bg-[#222225]'
                : 'border-white/[0.08] bg-[#19191b]'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[#ededed]">{rev.author_name}</span>
                  <span className="text-xs text-[#85858b]">{rev.author_role}</span>
                  {rev.verified_learner && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#4cc38a]/10 border border-[#4cc38a]/30 text-[#4cc38a] text-[11px] font-medium">
                      <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> Verified learner
                    </span>
                  )}
                  {rev.is_own_review && (
                    <span className="px-2 py-0.5 rounded-md bg-[#e5a00d]/15 border border-[#e5a00d]/35 text-[#e5a00d] text-[11px] font-medium">
                      Your feedback
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-medium text-[#ededed] mt-1">{rev.headline}</h4>
              </div>

              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= rev.rating ? 'text-[#e5a00d] fill-[#e5a00d]' : 'text-[#2a2a2e]'
                    }`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-[#a1a1a6] leading-relaxed">{rev.comment}</p>

            {(rev.content_rating || rev.quiz_rating) && (
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-[#85858b] tabular-nums">
                <span>Clarity: {rev.content_rating ?? 5}/5</span>
                <span>·</span>
                <span>Quizzes: {rev.quiz_rating ?? 5}/5</span>
                <span>·</span>
                <span>NPS: {rev.nps_score ?? 10}/10</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs">
              <span className="text-[#85858b] font-mono tabular-nums">
                {rev.created_at.slice(0, 10)}
              </span>
              <button
                type="button"
                onClick={() => onToggleHelpful(rev.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-medium transition-colors tabular-nums ${
                  rev.viewer_has_voted
                    ? 'bg-[#e5a00d]/15 border-[#e5a00d]/45 text-[#e5a00d]'
                    : 'bg-[#141415] border-white/[0.08] text-[#a1a1a6] hover:text-[#ededed]'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                Helpful ({rev.helpful_count})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
