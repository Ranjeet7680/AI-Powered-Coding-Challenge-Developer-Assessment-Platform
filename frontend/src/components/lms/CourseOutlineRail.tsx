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
  GraduationCap,
  HelpCircle,
  ListChecks,
  PlayCircle,
  Search,
  ShieldCheck,
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
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    done: boolean;
  }[] = [
    {
      stage: 'quiz-bank',
      label: isDL ? '20+ practice quiz bank' : '100+ practice quiz bank',
      icon: ListChecks,
      done: Object.values(quizResults).filter((r) => r.correct).length >= 5,
    },
    {
      stage: 'capstone',
      label: 'Capstone project lab',
      icon: Code2,
      done: capstoneSubmittedCount > 0,
    },
    {
      stage: 'final-exam',
      label: 'Camera final exam',
      icon: ShieldCheck,
      done: examPassed,
    },
    {
      stage: 'reviews',
      label: 'Course feedback survey',
      icon: Star,
      done: hasFeedback,
    },
    {
      stage: 'certificate',
      label: 'Verified certificate & PDF',
      icon: Award,
      done: certificateEarned,
    },
    {
      stage: 'goodies',
      label: 'Claim graduate goodies',
      icon: Gift,
      done: goodiesClaimed,
    },
    {
      stage: 'done',
      label: 'Graduation summary',
      icon: GraduationCap,
      done: certificateEarned && goodiesClaimed,
    },
  ];

  return (
    <aside className="rounded-xl border border-white/[0.08] bg-[#0f0f10] overflow-hidden flex flex-col">
      {/* Rail Header + Filter */}
      <div className="p-3.5 border-b border-white/[0.08] space-y-2.5 bg-[#141415]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#a1a1a6]" strokeWidth={1.5} />
            <h3 className="text-xs font-medium text-[#ededed] tabular-nums">
              Course outline ({lessons.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIncompleteOnly((prev) => !prev)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              incompleteOnly
                ? 'bg-[#e5a00d]/15 border-[#e5a00d]/40 text-[#e5a00d]'
                : 'bg-[#19191b] border-white/[0.08] text-[#a1a1a6] hover:text-[#ededed]'
            }`}
          >
            <Filter className="w-3 h-3" strokeWidth={1.5} />
            {incompleteOnly ? 'Todo' : 'All'}
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#85858b] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isDL ? 'Find lecture (GLM, SVM, EM)...' : 'Find lecture (PCA, XGB, GPT)...'}
            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-[#19191b] border border-white/[0.08] focus:border-[#e5a00d]/60 focus:outline-none text-xs text-[#ededed] placeholder:text-[#85858b]"
          />
        </div>
      </div>

      {/* Scrollable Modules -> Sequential Video / Notes / Quiz Activities */}
      <div className="max-h-[460px] lg:max-h-[540px] overflow-y-auto divide-y divide-white/[0.06] custom-scrollbar">
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
            <div key={mod.id} className="bg-[#0f0f10]">
              <button
                type="button"
                onClick={() =>
                  setExpandedModules((prev) => ({
                    ...prev,
                    [mod.id]: !isExpanded,
                  }))
                }
                className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-[#19191b] transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-[#85858b] tabular-nums">
                    Module {mod.order} · {mod.lesson_start}–{mod.lesson_end}
                  </div>
                  <div className="text-xs font-medium text-[#ededed] truncate">{mod.title}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-mono text-[#85858b] tabular-nums">
                    {doneInMod}/{mod.lesson_count}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="bg-[#141415] divide-y divide-white/[0.05]">
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
                        className={`transition-colors ${
                          isSelectedLecture ? 'bg-[#19191b] border-l-2 border-[#e5a00d]' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectLessonActivity(lesson, 'watch')}
                          className="w-full px-3.5 py-2 flex items-start gap-2 text-left hover:bg-[#19191b] transition-colors"
                        >
                          <div className="pt-0.5 shrink-0">
                            {isWatched && isQuizOk ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#4cc38a]" strokeWidth={1.5} />
                            ) : (
                              <PlayCircle
                                className={`w-3.5 h-3.5 ${
                                  isSelectedLecture ? 'text-[#e5a00d]' : 'text-[#85858b]'
                                }`}
                                strokeWidth={1.5}
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-xs leading-snug line-clamp-2 ${
                                isSelectedLecture
                                  ? 'font-medium text-[#ededed]'
                                  : 'text-[#a1a1a6]'
                              }`}
                            >
                              {lesson.order}. {lesson.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-[#85858b] tabular-nums">
                              <span>{lesson.duration_label}</span>
                              {hasNote && <span className="text-[#a1a1a6]">Notes</span>}
                              {isQuizOk && <span className="text-[#4cc38a]">Quiz passed</span>}
                            </div>
                          </div>
                        </button>

                        {/* Sub-Steps inside active lecture */}
                        {isSelectedLecture && (
                          <div className="pl-8 pr-3 pb-2 space-y-1">
                            <button
                              type="button"
                              onClick={() => onSelectLessonActivity(lesson, 'watch')}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                activeStage === 'watch'
                                  ? 'bg-[#ededed] text-[#141415]'
                                  : 'text-[#a1a1a6] hover:bg-[#222225] hover:text-[#ededed]'
                              }`}
                            >
                              <PlayCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                              <span>1. Watch video</span>
                              {isWatched && (
                                <CheckCircle2
                                  className={`w-3.5 h-3.5 ml-auto ${
                                    activeStage === 'watch' ? 'text-[#141415]' : 'text-[#4cc38a]'
                                  }`}
                                  strokeWidth={1.5}
                                />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectLessonActivity(lesson, 'notes')}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                activeStage === 'notes'
                                  ? 'bg-[#ededed] text-[#141415]'
                                  : 'text-[#a1a1a6] hover:bg-[#222225] hover:text-[#ededed]'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                              <span>2. Study notes &amp; code</span>
                              {hasNote && (
                                <CheckCircle2
                                  className={`w-3.5 h-3.5 ml-auto ${
                                    activeStage === 'notes' ? 'text-[#141415]' : 'text-[#4cc38a]'
                                  }`}
                                  strokeWidth={1.5}
                                />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectLessonActivity(lesson, 'quiz')}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                activeStage === 'quiz'
                                  ? 'bg-[#ededed] text-[#141415]'
                                  : 'text-[#a1a1a6] hover:bg-[#222225] hover:text-[#ededed]'
                              }`}
                            >
                              <HelpCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                              <span>3. Solve quiz #{lesson.order}</span>
                              {isQuizOk && (
                                <CheckCircle2
                                  className={`w-3.5 h-3.5 ml-auto ${
                                    activeStage === 'quiz' ? 'text-[#141415]' : 'text-[#4cc38a]'
                                  }`}
                                  strokeWidth={1.5}
                                />
                              )}
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
      <div className="p-3 border-t border-white/[0.08] bg-[#141415] space-y-1">
        <div className="text-xs font-medium text-[#85858b] px-2 pb-1">
          Certification milestones
        </div>
        {milestones.map((m) => {
          const Icon = m.icon;
          const isCurrent = activeStage === m.stage;
          return (
            <button
              key={m.stage}
              type="button"
              onClick={() => onSelectMilestoneStage(m.stage)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent
                  ? 'bg-[#222225] text-[#ededed] border border-white/[0.12]'
                  : 'text-[#a1a1a6] hover:bg-[#19191b] hover:text-[#ededed] border border-transparent'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-[#e5a00d]' : 'text-[#85858b]'}`}
                strokeWidth={1.5}
              />
              <span className="truncate">{m.label}</span>
              {m.done && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-[#4cc38a] shrink-0" strokeWidth={1.5} />}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
