import React, { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  FileText,
  Filter,
  Gift,
  HelpCircle,
  ListChecks,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { MLLessonItem, MLModuleInfo, MLQuizResultRecord } from '../../types';

export type LMSPageStage =
  | 'watch'
  | 'notes'
  | 'quiz'
  | 'quiz-bank'
  | 'capstone'
  | 'final-exam'
  | 'reviews'
  | 'certificate'
  | 'goodies'
  | 'done';

interface CourseOutlineRailProps {
  modules: MLModuleInfo[];
  lessons: MLLessonItem[];
  activeLessonId: string;
  activeStage: LMSPageStage;
  completedLessons: string[];
  notesByLesson: Record<string, string>;
  quizResults: Record<string, MLQuizResultRecord>;
  capstoneSubmittedCount: number;
  examPassed: boolean;
  hasFeedback: boolean;
  certificateEarned: boolean;
  goodiesClaimed: boolean;
  isDL: boolean;
  onSelectLessonActivity: (lesson: MLLessonItem, stage: 'watch' | 'notes' | 'quiz') => void;
  onSelectMilestoneStage: (
    stage: 'quiz-bank' | 'capstone' | 'final-exam' | 'reviews' | 'certificate' | 'goodies' | 'done'
  ) => void;
}

export const CourseOutlineRail: React.FC<CourseOutlineRailProps> = ({
  modules,
  lessons,
  activeLessonId,
  activeStage,
  completedLessons,
  notesByLesson,
  quizResults,
  capstoneSubmittedCount,
  examPassed,
  hasFeedback,
  certificateEarned,
  goodiesClaimed,
  isDL,
  onSelectLessonActivity,
  onSelectMilestoneStage,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [incompleteOnly, setIncompleteOnly] = useState<boolean>(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) || lessons[0],
    [lessons, activeLessonId]
  );

  const filteredLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return lessons.filter((l) => {
      if (incompleteOnly && completedLessons.includes(l.id)) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.module_title.toLowerCase().includes(q) ||
        `#${l.order}`.includes(q)
      );
    });
  }, [lessons, searchQuery, incompleteOnly, completedLessons]);

  const milestones: {
    stage: 'quiz-bank' | 'capstone' | 'final-exam' | 'reviews' | 'certificate' | 'goodies' | 'done';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    done: boolean;
  }[] = [
    {
      stage: 'quiz-bank',
      label: isDL ? '20+ Practice Quiz Bank' : '100+ Practice Quiz Bank',
      icon: ListChecks,
      done: Object.values(quizResults).filter((r) => r.correct).length >= 5,
    },
    {
      stage: 'capstone',
      label: 'Capstone Project Lab',
      icon: Code2,
      done: capstoneSubmittedCount > 0,
    },
    {
      stage: 'final-exam',
      label: 'Camera Final Exam',
      icon: ShieldCheck,
      done: examPassed,
    },
    {
      stage: 'reviews',
      label: 'Course Feedback Survey',
      icon: Star,
      done: hasFeedback,
    },
    {
      stage: 'certificate',
      label: 'Verified Certificate & PDF',
      icon: Award,
      done: certificateEarned,
    },
    {
      stage: 'goodies',
      label: 'Claim Graduate Goodies',
      icon: Gift,
      done: goodiesClaimed,
    },
    {
      stage: 'done',
      label: 'Graduation Complete',
      icon: Sparkles,
      done: certificateEarned && goodiesClaimed,
    },
  ];

  return (
    <aside className="rounded-2xl border border-slate-800 bg-[#0A0F1D] overflow-hidden shadow-xl flex flex-col">
      {/* Rail Header + Filter */}
      <div className="p-3.5 border-b border-slate-800 space-y-2.5 bg-slate-950/70">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Course Outline ({lessons.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIncompleteOnly((prev) => !prev)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
              incompleteOnly
                ? 'bg-indigo-600/20 border-indigo-400 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3 h-3" />
            {incompleteOnly ? 'Todo' : 'All'}
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isDL ? 'Find lecture (GLM, SVM, EM)...' : 'Find lecture (PCA, XGB, GPT)...'}
            className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-slate-200 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Scrollable Modules -> Sequential Video / Notes / Quiz Activities */}
      <div className="max-h-[460px] lg:max-h-[540px] overflow-y-auto divide-y divide-slate-800/80 custom-scrollbar">
        {modules.map((mod) => {
          const modLessons = filteredLessons.filter((l) => l.module_id === mod.id);
          if (modLessons.length === 0) return null;

          const allMod = lessons.filter((l) => l.module_id === mod.id);
          const doneInMod = allMod.filter((l) => completedLessons.includes(l.id)).length;
          const isLessonInMod =
            (activeStage === 'watch' || activeStage === 'notes' || activeStage === 'quiz') &&
            activeLesson?.module_id === mod.id;
          const isExpanded =
            Boolean(searchQuery.trim()) ||
            (expandedModules[mod.id] ?? isLessonInMod);

          return (
            <div key={mod.id} className="bg-slate-900/35">
              <button
                type="button"
                onClick={() =>
                  setExpandedModules((prev) => ({
                    ...prev,
                    [mod.id]: !isExpanded,
                  }))
                }
                className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-800/50 transition"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Module {mod.order} · {mod.lesson_start}–{mod.lesson_end}
                  </div>
                  <div className="text-xs font-bold text-slate-200 truncate">{mod.title}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">
                    {doneInMod}/{mod.lesson_count}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="bg-slate-950/60 divide-y divide-slate-800/50">
                  {modLessons.map((lesson) => {
                    const isSelectedLecture =
                      (activeStage === 'watch' || activeStage === 'notes' || activeStage === 'quiz') &&
                      lesson.id === activeLessonId;
                    const isWatched = completedLessons.includes(lesson.id);
                    const hasNote = Boolean(notesByLesson[lesson.id]?.trim());
                    const isQuizOk = Boolean(quizResults[lesson.id]?.correct);

                    return (
                      <div
                        key={lesson.id}
                        className={`transition ${
                          isSelectedLecture ? 'bg-indigo-600/15 border-l-2 border-indigo-400' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectLessonActivity(lesson, 'watch')}
                          className="w-full px-3.5 py-2 flex items-start gap-2 text-left hover:bg-slate-800/40 transition"
                        >
                          <div className="pt-0.5 shrink-0">
                            {isWatched && isQuizOk ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <PlayCircle
                                className={`w-3.5 h-3.5 ${
                                  isSelectedLecture ? 'text-indigo-300' : 'text-slate-500'
                                }`}
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-[11px] leading-snug line-clamp-2 ${
                                isSelectedLecture
                                  ? 'font-bold text-white'
                                  : 'font-medium text-slate-300'
                              }`}
                            >
                              {lesson.order}. {lesson.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-500">
                              <span>{lesson.duration_label}</span>
                              {hasNote && <span className="text-cyan-400">Notes</span>}
                              {isQuizOk && <span className="text-emerald-400">Quiz ✓</span>}
                            </div>
                          </div>
                        </button>

                        {/* Google Cloud Skills Boost style Page Sub-Steps inside active lecture */}
                        {isSelectedLecture && (
                          <div className="pl-8 pr-3 pb-2 space-y-1">
                            <button
                              type="button"
                              onClick={() => onSelectLessonActivity(lesson, 'watch')}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                                activeStage === 'watch'
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-slate-300 hover:bg-slate-800/70'
                              }`}
                            >
                              <PlayCircle className="w-3 h-3 shrink-0" />
                              <span>1. Watch Video</span>
                              {isWatched && <CheckCircle2 className="w-3 h-3 ml-auto text-emerald-300" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectLessonActivity(lesson, 'notes')}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                                activeStage === 'notes'
                                  ? 'bg-cyan-600 text-white'
                                  : 'text-slate-300 hover:bg-slate-800/70'
                              }`}
                            >
                              <FileText className="w-3 h-3 shrink-0" />
                              <span>2. Study Notes &amp; Code</span>
                              {hasNote && <CheckCircle2 className="w-3 h-3 ml-auto text-cyan-300" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectLessonActivity(lesson, 'quiz')}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                                activeStage === 'quiz'
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-slate-300 hover:bg-slate-800/70'
                              }`}
                            >
                              <HelpCircle className="w-3 h-3 shrink-0" />
                              <span>3. Solve Quiz #{lesson.order}</span>
                              {isQuizOk && <CheckCircle2 className="w-3 h-3 ml-auto text-emerald-300" />}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Course Graduation & Certification Milestones */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-1">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 px-1.5 pb-1">
          Certification Milestones
        </div>
        {milestones.map((m) => {
          const Icon = m.icon;
          const isCurrent = activeStage === m.stage;
          return (
            <button
              key={m.stage}
              type="button"
              onClick={() => onSelectMilestoneStage(m.stage)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition ${
                isCurrent
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{m.label}</span>
              {m.done && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
