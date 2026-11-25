import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Award,
  BookOpen,
  BrainCircuit,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Code2,
  Copy,
  Download,
  FileEdit,
  Filter,
  HelpCircle,
  Layers,
  ListChecks,
  Lock,
  Maximize2,
  PlayCircle,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth, useToast } from '../context/useContexts';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { ProctorCameraGuard } from '../components/lms/ProctorCameraGuard';
import {
  CapstoneWorkspacePanel,
  CourseReviewsPanel,
  CourseSyllabusRoadmapPanel,
} from '../components/lms/CourseAdvancedPanels';
import {
  MLCapstoneProject,
  MLCapstoneSubmission,
  MLCapstoneSubmitPayload,
  MLCourseOverview,
  MLCourseReviewsOverview,
  MLFinalExamResponse,
  MLFinalExamResultResponse,
  MLLessonItem,
  MLPracticeQuizResultDetail,
  MLPracticeQuizResultResponse,
  MLQuizAnswerResponse,
  MLQuizItem,
  MLQuizResultRecord,
  MLViolationEvent,
} from '../types';

type TopTab = 'course' | 'syllabus' | 'quiz-bank' | 'capstone' | 'reviews' | 'final-exam';
type LessonDeckTab = 'notes' | 'my-notes' | 'quiz';
type ExamPhase = 'preflight' | 'active' | 'submitted';
type CourseTrack = 'ml' | 'dl';

export const MLCoursePage: React.FC = () => <CourseLMSView key="ml" track="ml" />;

export const DLCoursePage: React.FC = () => <CourseLMSView key="dl" track="dl" />;

const CourseLMSView: React.FC<{ track: CourseTrack }> = ({ track }) => {
  const isDL = track === 'dl';
  const basePath = isDL ? '/app/dl-course' : '/app/ml-course';
  const courseClient = useMemo(() => api.courseLms(track), [track]);

  const { lessonId: routeLessonId } = useParams<{ lessonId?: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  // Course data & loading
  const [course, setCourse] = useState<MLCourseOverview | null>(null);
  const [quizBank, setQuizBank] = useState<MLQuizItem[]>([]);
  const [finalExam, setFinalExam] = useState<MLFinalExamResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');
  const [theaterMode, setTheaterMode] = useState<boolean>(false);

  // Capstone & Reviews State
  const [capstoneProjects, setCapstoneProjects] = useState<MLCapstoneProject[]>([]);
  const [capstoneSubmissions, setCapstoneSubmissions] = useState<MLCapstoneSubmission[]>([]);
  const [isSubmittingCapstone, setIsSubmittingCapstone] = useState<boolean>(false);
  const [reviewsData, setReviewsData] = useState<MLCourseReviewsOverview | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Navigation & Player State
  const [activeTab, setActiveTab] = useState<TopTab>('course');
  const [lessonDeckTab, setLessonDeckTab] = useState<LessonDeckTab>('notes');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(isDL ? 'dl-001' : 'ml-001');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [incompleteOnly, setIncompleteOnly] = useState<boolean>(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Progress & Per-Lesson State
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [notesByLesson, setNotesByLesson] = useState<Record<string, string>>({});
  const [draftNote, setDraftNote] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [isCompletingLesson, setIsCompletingLesson] = useState<boolean>(false);
  const [quizResults, setQuizResults] = useState<Record<string, MLQuizResultRecord>>({});
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<MLQuizAnswerResponse | null>(null);
  const [isSubmittingLessonQuiz, setIsSubmittingLessonQuiz] = useState<boolean>(false);

  // 100+ Practice Quiz Bank State
  const [practiceModuleFilter, setPracticeModuleFilter] = useState<string>('ALL');
  const [practicePage, setPracticePage] = useState<number>(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const [practiceResult, setPracticeResult] = useState<MLPracticeQuizResultResponse | null>(null);
  const [bestPracticeScore, setBestPracticeScore] = useState<number>(0);
  const [isSubmittingPractice, setIsSubmittingPractice] = useState<boolean>(false);

  // Proctored Final Exam State
  const [examPhase, setExamPhase] = useState<ExamPhase>('preflight');
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [examQuestionIdx, setExamQuestionIdx] = useState<number>(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examRemainingSec, setExamRemainingSec] = useState<number>(45 * 60);
  const [examViolations, setExamViolations] = useState<number>(0);
  const [examViolationLog, setExamViolationLog] = useState<MLViolationEvent[]>([]);
  const [examResult, setExamResult] = useState<MLFinalExamResultResponse | null>(null);
  const [savedExamScore, setSavedExamScore] = useState<number | null>(null);
  const [savedExamPassed, setSavedExamPassed] = useState<boolean>(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState<boolean>(false);

  const playerTopRef = useRef<HTMLDivElement | null>(null);
  const examAnswersRef = useRef(examAnswers);
  const examViolationsRef = useRef(examViolations);
  const examViolationLogRef = useRef(examViolationLog);
  const examRemainingSecRef = useRef(examRemainingSec);
  const cameraReadyRef = useRef(cameraReady);
  const examStartedWithCameraRef = useRef(false);
  const finalExamRef = useRef(finalExam);
  const isSubmittingExamRef = useRef(false);

  useEffect(() => {
    examAnswersRef.current = examAnswers;
  }, [examAnswers]);

  useEffect(() => {
    examViolationsRef.current = examViolations;
  }, [examViolations]);

  useEffect(() => {
    examViolationLogRef.current = examViolationLog;
  }, [examViolationLog]);

  useEffect(() => {
    examRemainingSecRef.current = examRemainingSec;
  }, [examRemainingSec]);

  useEffect(() => {
    cameraReadyRef.current = cameraReady;
  }, [cameraReady]);

  useEffect(() => {
    finalExamRef.current = finalExam;
  }, [finalExam]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      courseClient.getOverview(),
      courseClient.getQuizBank(),
      courseClient.getFinalExam().catch(() => null),
      courseClient.getCapstone().catch(() => null),
      courseClient.getReviews().catch(() => null),
    ])
      .then(([overview, bankRes, examRes, capstoneRes, revRes]) => {
        if (cancelled) return;
        setCourse(overview);
        setQuizBank(bankRes.questions || []);
        setFinalExam(examRes);
        setCapstoneProjects(capstoneRes?.projects || overview.capstone_projects || []);
        setCapstoneSubmissions(capstoneRes?.submissions || []);
        if (revRes) {
          setReviewsData(revRes);
        }

        const prog = overview.progress;
        const completed = prog?.completed_lessons || [];
        const notes = prog?.lesson_notes || {};
        const qResults = prog?.quiz_results || {};

        setCompletedLessons(completed);
        setNotesByLesson(notes);
        setQuizResults(qResults);
        setBestPracticeScore(prog?.practice_quiz_best_score || 0);
        setSavedExamScore(prog?.final_exam_score ?? null);
        setSavedExamPassed(Boolean(prog?.final_exam_passed));

        const matchedByRoute = routeLessonId
          ? overview.lessons.find((l) => l.id === routeLessonId || String(l.order) === routeLessonId)
          : undefined;
        const firstIncomplete = overview.lessons.find((l) => !completed.includes(l.id));
        const initialLesson = matchedByRoute || firstIncomplete || overview.lessons[0];

        if (initialLesson) {
          setSelectedLessonId(initialLesson.id);
          setExpandedModules({ [initialLesson.module_id]: true });
          setDraftNote(notes[initialLesson.id] ?? '');
          const prevQ = qResults[initialLesson.id];
          setSelectedQuizOption(prevQ ? prevQ.selected : null);
        }
        if (examRes) {
          setExamRemainingSec(examRes.duration_minutes * 60);
        }
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Failed to load Course LMS.';
        setLoadError(msg);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseClient, routeLessonId]);

  const activeLesson: MLLessonItem | null = useMemo(() => {
    if (!course || course.lessons.length === 0) return null;
    return course.lessons.find((l) => l.id === selectedLessonId) || course.lessons[0];
  }, [course, selectedLessonId]);

  const selectLesson = useCallback(
    (lesson: MLLessonItem) => {
      setSelectedLessonId(lesson.id);
      setExpandedModules((prev) => ({ ...prev, [lesson.module_id]: true }));
      setDraftNote(notesByLesson[lesson.id] ?? '');
      const prevQ = quizResults[lesson.id];
      setSelectedQuizOption(prevQ ? prevQ.selected : null);
      setQuizFeedback(null);
      navigate(`${basePath}/${lesson.id}`, { replace: true });
      playerTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [basePath, navigate, notesByLesson, quizResults]
  );

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setIsCompletingLesson(true);
    try {
      const res = await courseClient.completeLesson(activeLesson.id);
      setCompletedLessons(res.completed_lessons);
      if (res.points_awarded > 0) {
        refreshUser().catch(() => {});
        showToast(
          `Lecture #${activeLesson.order} completed! +${res.points_awarded} XP earned.`,
          'success'
        );
      } else {
        showToast(`Lecture #${activeLesson.order} marked completed.`, 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update lesson status.';
      showToast(msg, 'error');
    } finally {
      setIsCompletingLesson(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeLesson) return;
    setIsSavingNote(true);
    try {
      const res = await courseClient.saveLessonNotes(activeLesson.id, draftNote);
      setNotesByLesson(res.lesson_notes);
      showToast(`Saved personal study notes for Lecture #${activeLesson.order}.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save notes.';
      showToast(msg, 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSubmitLessonQuiz = async () => {
    if (!activeLesson || selectedQuizOption === null) return;
    setIsSubmittingLessonQuiz(true);
    try {
      const res = await courseClient.submitLessonQuiz(activeLesson.id, selectedQuizOption);
      setQuizFeedback(res);
      setQuizResults((prev) => {
        const old = prev[activeLesson.id];
        return {
          ...prev,
          [activeLesson.id]: {
            selected: selectedQuizOption,
            correct: Boolean(old?.correct) || res.correct,
            last_correct: res.correct,
            attempts: (old?.attempts || 0) + 1,
          },
        };
      });
      if (res.correct) {
        if (!completedLessons.includes(activeLesson.id)) {
          setCompletedLessons((prev) => [...prev, activeLesson.id]);
        }
        refreshUser().catch(() => {});
        showToast(
          res.points_awarded > 0
            ? `Correct! +${res.points_awarded} XP awarded & lecture marked complete.`
            : 'Correct! Concept mastered.',
          'success'
        );
      } else {
        showToast('Not quite right — review the explanation and try again.', 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not grade quiz answer.';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingLessonQuiz(false);
    }
  };

  const handleCopySnippet = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('Python reference code copied to clipboard!', 'success');
    } catch {
      showToast('Could not access clipboard.', 'error');
    }
  };

  const handleCapstoneSubmit = async (payload: MLCapstoneSubmitPayload) => {
    setIsSubmittingCapstone(true);
    try {
      const res = await courseClient.submitCapstone(payload);
      setCapstoneSubmissions((prev) => [res, ...prev]);
      if ((res.points_awarded || 0) > 0) {
        refreshUser().catch(() => {});
        showToast(
          `Capstone evaluated (${res.overall_score}%)! +${res.points_awarded} XP awarded.`,
          'success'
        );
      } else {
        showToast(`Capstone evaluated: ${res.status} (${res.overall_score}%).`, 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit capstone project.';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingCapstone(false);
    }
  };

  const handleSubmitReview = async (payload: {
    rating: number;
    headline: string;
    comment: string;
  }) => {
    setIsSubmittingReview(true);
    try {
      await courseClient.submitReview(payload);
      const updated = await courseClient.getReviews();
      setReviewsData(updated);
      refreshUser().catch(() => {});
      showToast('Published your course review! Thank you for the feedback.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish review.';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleToggleReviewHelpful = async (reviewId: string) => {
    try {
      const res = await courseClient.toggleReviewHelpful(reviewId);
      setReviewsData((prev) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.map((r) =>
                r.id === reviewId
                  ? {
                      ...r,
                      helpful_count: res.helpful_count,
                      viewer_has_voted: res.viewer_has_voted,
                    }
                  : r
              ),
            }
          : prev
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update vote.';
      showToast(msg, 'error');
    }
  };

  // Filtered Quiz Bank pagination (20 per page)
  const filteredPracticeQuestions = useMemo(() => {
    if (practiceModuleFilter === 'ALL') return quizBank;
    return quizBank.filter((q) => q.module_id === practiceModuleFilter);
  }, [quizBank, practiceModuleFilter]);

  const PRACTICE_PAGE_SIZE = 20;
  const totalPracticePages = Math.max(1, Math.ceil(filteredPracticeQuestions.length / PRACTICE_PAGE_SIZE));
  const safePracticePage = Math.min(practicePage, totalPracticePages - 1);
  const currentPracticeSlice = useMemo(() => {
    const start = safePracticePage * PRACTICE_PAGE_SIZE;
    return filteredPracticeQuestions.slice(start, start + PRACTICE_PAGE_SIZE);
  }, [filteredPracticeQuestions, safePracticePage]);

  const practiceDetailMap = useMemo(() => {
    const map: Record<string, MLPracticeQuizResultDetail> = {};
    if (practiceResult) {
      practiceResult.details.forEach((d) => {
        map[d.quiz_id] = d;
      });
    }
    return map;
  }, [practiceResult]);

  const handleSubmitPracticeBank = async () => {
    const answeredCount = Object.keys(practiceAnswers).length;
    if (answeredCount === 0) {
      showToast('Select at least one quiz answer before submitting.', 'info');
      return;
    }
    setIsSubmittingPractice(true);
    try {
      const res = await courseClient.submitQuizBank(practiceAnswers);
      setPracticeResult(res);
      setBestPracticeScore(res.best_score);
      const updatedMap: Record<string, MLQuizResultRecord> = { ...quizResults };
      res.details.forEach((d) => {
        const old = updatedMap[d.lesson_id];
        updatedMap[d.lesson_id] = {
          selected: d.selected,
          correct: Boolean(old?.correct) || d.correct,
          last_correct: d.correct,
          attempts: (old?.attempts || 0) + 1,
        };
      });
      setQuizResults(updatedMap);
      refreshUser().catch(() => {});
      showToast(
        `Scored ${res.score_percent}% (${res.correct_count}/${res.total_answered} answered)!`,
        res.score_percent >= 70 ? 'success' : 'info'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit quiz bank.';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingPractice(false);
    }
  };

  // Proctored Final Exam submission
  const submitFinalExam = useCallback(
    async (autoTerminated: boolean) => {
      if (isSubmittingExamRef.current) return;
      isSubmittingExamRef.current = true;
      setIsSubmittingExam(true);

      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }

      const totalSec = (finalExamRef.current?.duration_minutes || 45) * 60;
      const elapsed = Math.max(0, totalSec - examRemainingSecRef.current);

      try {
        const res = await courseClient.submitFinalExam({
          answers: examAnswersRef.current,
          violations: examViolationsRef.current,
          violation_log: examViolationLogRef.current,
          elapsed_seconds: elapsed,
          camera_verified:
            examStartedWithCameraRef.current &&
            examViolationLogRef.current.every((e) => e.type !== 'CAMERA_DISCONNECTED'),
          auto_terminated: autoTerminated,
        });
        setExamResult(res);
        setExamPhase('submitted');
        setSavedExamScore(res.score_percent);
        if (res.passed) {
          setSavedExamPassed(true);
          refreshUser().catch(() => {});
          showToast('Passed Proctored Final Exam! Official Certificate issued.', 'success');
          try {
            confetti({ particleCount: 130, spread: 75, origin: { y: 0.6 } });
          } catch {
            // decorative
          }
        } else {
          showToast(res.message, 'error');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Could not submit final exam.';
        showToast(msg, 'error');
      } finally {
        isSubmittingExamRef.current = false;
        setIsSubmittingExam(false);
      }
    },
    [courseClient, refreshUser, showToast]
  );

  // Countdown timer when examPhase === 'active'
  useEffect(() => {
    if (examPhase !== 'active') return;
    const timer = window.setInterval(() => {
      setExamRemainingSec((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          submitFinalExam(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [examPhase, submitFinalExam]);

  const handleStartExam = () => {
    if (!cameraReady) {
      showToast('Enable and verify your webcam guard first before starting the final exam.', 'error');
      return;
    }
    if (!finalExam) {
      showToast('Final exam payload is unavailable right now. Please refresh.', 'error');
      return;
    }
    isSubmittingExamRef.current = false;
    examStartedWithCameraRef.current = true;
    setExamAnswers({});
    setExamQuestionIdx(0);
    setExamViolations(0);
    setExamViolationLog([]);
    setExamResult(null);
    setExamRemainingSec(finalExam.duration_minutes * 60);
    setExamPhase('active');
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const handleProctorViolation = useCallback(
    (event: MLViolationEvent) => {
      setExamViolations((prev) => prev + 1);
      setExamViolationLog((prev) => [...prev, event]);
      showToast(`Proctor Alert (${event.type}): ${event.detail}`, 'error');
    },
    [showToast]
  );

  const handleMaxViolationsReached = useCallback(() => {
    showToast('3 proctoring strikes recorded — auto-submitting disqualified exam.', 'error');
    submitFinalExam(true);
  }, [showToast, submitFinalExam]);

  // Derived counters
  const totalLessons = course?.total_lessons || 106;
  const completedCount = completedLessons.length;
  const quizzesPassedCount = Object.values(quizResults).filter((r) => r.correct).length;
  const completionPct = Math.round((completedCount / Math.max(1, totalLessons)) * 100);

  const filteredSidebarLessons = useMemo(() => {
    if (!course) return [];
    const q = searchQuery.trim().toLowerCase();
    return course.lessons.filter((l) => {
      if (incompleteOnly && completedLessons.includes(l.id)) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.module_title.toLowerCase().includes(q) ||
        `#${l.order}`.includes(q)
      );
    });
  }, [course, searchQuery, incompleteOnly, completedLessons]);

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="h-36 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-[460px] rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          <div className="lg:col-span-4 h-[460px] rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (loadError || !course) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8">
          <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Unable to load ML Course LMS</h2>
          <p className="text-sm text-slate-400 mb-5">{loadError || 'Catalog unavailable.'}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition"
          >
            Reload Curriculum
          </button>
        </div>
      </div>
    );
  }

  const activeIndex = activeLesson
    ? course.lessons.findIndex((l) => l.id === activeLesson.id)
    : 0;
  const prevLesson = activeIndex > 0 ? course.lessons[activeIndex - 1] : null;
  const nextLesson =
    activeIndex >= 0 && activeIndex < course.lessons.length - 1
      ? course.lessons[activeIndex + 1]
      : null;

  const isLessonCompleted = activeLesson ? completedLessons.includes(activeLesson.id) : false;
  const activeQuizRecord = activeLesson ? quizResults[activeLesson.id] : undefined;

  return (
    <div ref={playerTopRef} className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top LMS Hero Header */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-5 sm:p-7 shadow-2xl ${
          isDL
            ? 'border-rose-500/30 bg-gradient-to-br from-slate-900 via-rose-950/25 to-slate-900'
            : 'border-indigo-500/25 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900'
        }`}
      >
        {/* Track Switcher Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800/70">
          <div className="inline-flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Select LMS Track:
            </span>
            <Link
              to="/app/ml-course"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                !isDL
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-950/75 text-slate-300 border border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              ML Mastery (106 Videos)
            </Link>
            <Link
              to="/app/dl-course"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                isDL
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25'
                  : 'bg-slate-950/75 text-slate-300 border border-slate-800 hover:border-rose-500/40'
              }`}
            >
              Stanford × CTF Deep Learning (21 Videos)
            </Link>
          </div>
          {course.thumbnail_url && (
            <a
              href={course.thumbnail_url}
              download={isDL ? 'stanford-ctf-deep-learning-thumbnail.svg' : 'ml-ctf-course-thumbnail.svg'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-cyan-300 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download Course Thumbnail
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isDL
                    ? 'bg-rose-500/15 border-rose-500/35 text-rose-300'
                    : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                {isDL ? 'STANFORD × CODING TASK FACTORY ACADEMY' : 'FULL ML LMS CURRICULUM'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                {course.total_lessons} Videos · {course.modules.length} Modules · {isDL ? '20+' : `${course.total_quizzes}+`} Quizzes
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {course.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Curated from <span className="text-indigo-300 font-semibold">{course.instructor}</span>.{' '}
              {isDL
                ? 'Master optimization, GLMs, SVMs & Mercer kernels, neural networks, backpropagation, EM, PCA/ICA, MDPs, LQR & RL diagnostics with structured notes, personal notebooks, 20+ comprehension quizzes, and a camera-proctored certification exam.'
                : `Master regression, PCA, trees, boosting, neural nets, transformers, PyTorch & RLHF with structured notes, personal notebooks, ${course.total_quizzes}+ comprehension quizzes, and a camera-proctored final certification exam.`}
            </p>

            {/* Live Mastery Telemetry Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="rounded-2xl bg-slate-950/75 border border-slate-800 px-3.5 py-2.5">
                <div className="text-[11px] text-slate-400">Lectures Done</div>
                <div className="text-base sm:text-lg font-extrabold text-white">
                  {completedCount}
                  <span className="text-xs font-semibold text-slate-500">/{totalLessons}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-950/75 border border-slate-800 px-3.5 py-2.5">
                <div className="text-[11px] text-slate-400">Quizzes Passed</div>
                <div className="text-base sm:text-lg font-extrabold text-emerald-400">
                  {quizzesPassedCount}
                  <span className="text-xs font-semibold text-slate-500">/{course.total_quizzes}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-950/75 border border-slate-800 px-3.5 py-2.5">
                <div className="text-[11px] text-slate-400">
                  {isDL ? '20+ Quiz Best' : '100+ Quiz Best'}
                </div>
                <div className="text-base sm:text-lg font-extrabold text-cyan-400">
                  {bestPracticeScore}%
                </div>
              </div>
              <div className="rounded-2xl bg-slate-950/75 border border-slate-800 px-3.5 py-2.5">
                <div className="text-[11px] text-slate-400">Final Exam</div>
                <div className="text-base sm:text-lg font-extrabold text-amber-300">
                  {savedExamPassed
                    ? `Passed (${savedExamScore ?? 100}%)`
                    : savedExamScore !== null
                    ? `${savedExamScore}%`
                    : 'Proctored'}
                </div>
              </div>
            </div>
          </div>

          {/* Official Co-Branded Course Thumbnail Artwork Preview */}
          {course.thumbnail_url && (
            <div className="lg:col-span-4">
              <div className="group relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl">
                <img
                  src={course.thumbnail_url}
                  alt={`${course.title} Official Thumbnail`}
                  className="w-full aspect-video object-cover group-hover:scale-[1.02] transition duration-300"
                />
                <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-mono font-semibold text-cyan-300">OFFICIAL COURSE THUMBNAIL</span>
                  <span>1280×720 HD</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Overall Course Progress Bar + Primary Mode Tabs */}
        <div className="mt-5 pt-5 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('course')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'course'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              Course Player &amp; Notes ({totalLessons})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('syllabus')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'syllabus'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:border-violet-500/40'
              }`}
            >
              <Layers className="w-4 h-4" />
              Syllabus &amp; Roadmap
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quiz-bank')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'quiz-bank'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              {isDL ? '20+ Quiz Bank' : '100+ Quiz Bank'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('capstone')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'capstone'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              <Code2 className="w-4 h-4" />
              Capstone Projects ({capstoneProjects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'reviews'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                  : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:border-amber-500/40'
              }`}
            >
              <Star className="w-4 h-4" />
              Reviews ({reviewsData ? `${reviewsData.average_rating.toFixed(1)}★` : '5.0★'})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('final-exam')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'final-exam'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Proctored Final Exam (Camera Guard)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-40 sm:w-52">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Curriculum Progress</span>
                <span className="font-bold text-indigo-300">{completionPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
              <Lock className="w-3.5 h-3.5" />
              LMS-Only Playback
            </span>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: COURSE PLAYER, STUDY NOTES & AFTER-VIDEO QUIZ ================= */}
      {activeTab === 'course' && activeLesson && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Player & Interactive Learning Deck */}
          <div className={`${theaterMode ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-5`}>
            {/* Lecture Metadata Bar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold">
                    Module {activeLesson.module_order}: {activeLesson.module_title}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                    Lecture #{activeLesson.order} / {totalLessons}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {activeLesson.duration_label}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 font-semibold">
                    {activeLesson.difficulty}
                  </span>
                </div>
                {isLessonCompleted && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {activeLesson.title}
              </h2>

              {/* Responsive 16:9 Locked In-LMS Player Shell */}
              <div
                onContextMenu={(e) => e.preventDefault()}
                className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl"
              >
                <iframe
                  key={activeLesson.video_id}
                  src={activeLesson.video_url}
                  title={activeLesson.title}
                  className="w-full h-full"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
                {/* Top-right In-LMS Lock Overlay covering YouTube share/watch-later outbound chrome */}
                <div
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-indigo-500/40 text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1.5 backdrop-blur-md shadow-lg select-none"
                  title="Playback locked to LMS workspace"
                >
                  <Lock className="w-3 h-3 text-emerald-400" />
                  IN-LMS SECURE STREAM · #{activeLesson.order}
                </div>
              </div>

              {/* Player Controls Footer (Strictly In-LMS Controls — Zero External Redirects) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!prevLesson}
                    onClick={() => prevLesson && selectLesson(prevLesson)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={!nextLesson}
                    onClick={() => nextLesson && selectLesson(nextLesson)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 transition"
                  >
                    Next Lecture
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTheaterMode((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                      theaterMode
                        ? 'bg-cyan-600/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    {theaterMode ? 'Standard View' : 'Theater Mode'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('capstone')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-xs font-semibold text-indigo-300 transition"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Capstone Lab
                  </button>
                  <button
                    type="button"
                    disabled={isCompletingLesson}
                    onClick={handleMarkComplete}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      isLessonCompleted
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isLessonCompleted
                      ? 'Lecture Completed'
                      : isCompletingLesson
                      ? 'Saving...'
                      : 'Mark Completed (+15 XP)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Study Notes, Personal Notebook & After-Video Quiz Deck */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/75 overflow-hidden">
              <div className="flex flex-wrap border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLessonDeckTab('notes')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    lessonDeckTab === 'notes'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Study Notes &amp; Code
                </button>
                <button
                  type="button"
                  onClick={() => setLessonDeckTab('my-notes')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    lessonDeckTab === 'my-notes'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  My Personal Notes
                  {notesByLesson[activeLesson.id]?.trim() && (
                    <span className="w-2 h-2 rounded-full bg-cyan-300" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setLessonDeckTab('quiz')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    lessonDeckTab === 'quiz'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  After-Video Quiz #{activeLesson.order}
                  {activeQuizRecord?.correct && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-200 text-[10px]">
                      Passed
                    </span>
                  )}
                </button>
              </div>

              <div className="p-5">
                {/* Subtab 1: Curated Study Notes + Math + Python Snippet */}
                {lessonDeckTab === 'notes' && (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-950/20 p-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 mb-1">
                        Core Formula / Intuition Anchor
                      </div>
                      <div className="text-sm font-mono text-white break-words">
                        <MarkdownRenderer content={activeLesson.key_formula} />
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none text-sm text-slate-200">
                      <MarkdownRenderer content={activeLesson.notes_markdown} />
                    </div>

                    {activeLesson.code_snippet && (
                      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300">
                            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                            Python Reference Implementation
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopySnippet(activeLesson.code_snippet)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition"
                            >
                              <Copy className="w-3 h-3" />
                              Copy
                            </button>
                            <Link
                              to="/app/challenges"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-[11px] font-semibold text-indigo-300 transition"
                            >
                              Practice Challenges
                            </Link>
                          </div>
                        </div>
                        <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
                          <code>{activeLesson.code_snippet}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Subtab 2: Persistent Personal Notes */}
                {lessonDeckTab === 'my-notes' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Personal Study Notebook — Lecture #{activeLesson.order}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Saved directly to your cloud account ({user?.email || 'session'}) for exam revision.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftNote((prev) =>
                            prev.trim()
                              ? prev
                              : `# ${activeLesson.title}\n- Key Formula: \n- Edge Cases & Assumptions: \n- Real-world Interview Tip: `
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                      >
                        Insert Template
                      </button>
                    </div>
                    <textarea
                      value={draftNote}
                      onChange={(e) => setDraftNote(e.target.value)}
                      rows={8}
                      placeholder={`Write your personal takeaways, formulas, or exam reminders for "${activeLesson.title}"...`}
                      className="w-full rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none p-4 text-sm text-slate-200 placeholder:text-slate-600 font-mono leading-relaxed"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">{draftNote.length} characters</span>
                      <button
                        type="button"
                        disabled={isSavingNote}
                        onClick={handleSaveNotes}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-cyan-500/20"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {isSavingNote ? 'Saving to Cloud...' : 'Save My Notes'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Subtab 3: After-Video Comprehension Quiz */}
                {lessonDeckTab === 'quiz' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                        Comprehension Check #{activeLesson.order}
                      </span>
                      {activeQuizRecord && (
                        <span className="text-xs text-slate-400">
                          Attempts: {activeQuizRecord.attempts} · Status:{' '}
                          <span
                            className={
                              activeQuizRecord.correct
                                ? 'text-emerald-400 font-bold'
                                : 'text-amber-300 font-semibold'
                            }
                          >
                            {activeQuizRecord.correct ? 'Mastered ✓' : 'Needs Review'}
                          </span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      {activeLesson.quiz.question}
                    </h3>

                    <div className="space-y-2.5">
                      {activeLesson.quiz.options.map((opt, idx) => {
                        const isSelected = selectedQuizOption === idx;
                        const revealCorrect = quizFeedback && quizFeedback.correct_index === idx;
                        const revealWrong =
                          quizFeedback && isSelected && !quizFeedback.correct;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedQuizOption(idx);
                              setQuizFeedback(null);
                            }}
                            className={`w-full text-left p-3.5 rounded-xl border text-sm transition flex items-start gap-3 ${
                              revealCorrect
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-100'
                                : revealWrong
                                ? 'bg-rose-500/15 border-rose-500 text-rose-100'
                                : isSelected
                                ? 'bg-indigo-600/20 border-indigo-400 text-white'
                                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizFeedback && (
                      <div
                        className={`rounded-2xl border p-4 text-sm ${
                          quizFeedback.correct
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                            : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold mb-1">
                          {quizFeedback.correct ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-amber-400" />
                          )}
                          {quizFeedback.correct
                            ? 'Correct Answer!'
                            : 'Incorrect — Review Explanation'}
                        </div>
                        <p className="text-xs leading-relaxed opacity-90">
                          {quizFeedback.explanation}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        disabled={selectedQuizOption === null || isSubmittingLessonQuiz}
                        onClick={handleSubmitLessonQuiz}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {isSubmittingLessonQuiz ? 'Checking...' : 'Check Answer (+10 XP)'}
                      </button>
                      {nextLesson && (
                        <button
                          type="button"
                          onClick={() => selectLesson(nextLesson)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                        >
                          Continue to Lecture #{nextLesson.order}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Module & Lecture Navigator */}
          <div
            className={`${
              theaterMode ? 'lg:col-span-12' : 'lg:col-span-4'
            } rounded-2xl border border-slate-800 bg-slate-900/75 overflow-hidden sticky top-4`}
          >
            <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/60">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Curriculum ({totalLessons} Lectures)
                </h3>
                <button
                  type="button"
                  onClick={() => setIncompleteOnly((prev) => !prev)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                    incompleteOnly
                      ? 'bg-indigo-600/20 border-indigo-400 text-indigo-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  {incompleteOnly ? 'Incomplete' : 'All'}
                </button>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isDL
                      ? 'Search 21 lectures (GLM, SVM, Backprop, EM, MDP)...'
                      : 'Search 106 topics (PCA, XGBoost, GPT)...'
                  }
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-xs text-slate-200 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="max-h-[680px] overflow-y-auto divide-y divide-slate-800/80">
              {course.modules.map((mod) => {
                const modLessons = filteredSidebarLessons.filter((l) => l.module_id === mod.id);
                if (modLessons.length === 0) return null;

                const allModLessons = course.lessons.filter((l) => l.module_id === mod.id);
                const modCompleted = allModLessons.filter((l) =>
                  completedLessons.includes(l.id)
                ).length;
                const isExpanded =
                  Boolean(searchQuery.trim()) ||
                  Boolean(expandedModules[mod.id]) ||
                  activeLesson.module_id === mod.id;

                return (
                  <div key={mod.id} className="bg-slate-900/40">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedModules((prev) => ({
                          ...prev,
                          [mod.id]: !isExpanded,
                        }))
                      }
                      className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-slate-800/50 transition"
                    >
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                          Module {mod.order} · Lectures {mod.lesson_start}–{mod.lesson_end}
                        </div>
                        <div className="text-xs font-bold text-slate-200">{mod.title}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-slate-400">
                          {modCompleted}/{mod.lesson_count}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="bg-slate-950/50 divide-y divide-slate-800/50">
                        {modLessons.map((lesson) => {
                          const isCurrent = lesson.id === activeLesson.id;
                          const isDone = completedLessons.includes(lesson.id);
                          const quizDone = quizResults[lesson.id]?.correct;

                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => selectLesson(lesson)}
                              className={`w-full px-4 py-2.5 flex items-start gap-2.5 text-left transition ${
                                isCurrent
                                  ? 'bg-indigo-600/20 border-l-2 border-indigo-400'
                                  : 'hover:bg-slate-800/40'
                              }`}
                            >
                              <div className="pt-0.5 shrink-0">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <PlayCircle
                                    className={`w-4 h-4 ${
                                      isCurrent ? 'text-indigo-400' : 'text-slate-500'
                                    }`}
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`text-xs leading-snug line-clamp-2 ${
                                    isCurrent ? 'font-bold text-white' : 'font-medium text-slate-300'
                                  }`}
                                >
                                  {lesson.order}. {lesson.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                                  <span>{lesson.duration_label}</span>
                                  {quizDone && (
                                    <span className="text-emerald-400 font-semibold">Quiz ✓</span>
                                  )}
                                  {notesByLesson[lesson.id]?.trim() && (
                                    <span className="text-cyan-400 font-semibold">Notes</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: 100+ QUIZ MASTERY PRACTICE BANK ================= */}
      {activeTab === 'quiz-bank' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                {quizBank.length} {isDL ? 'Deep Learning' : 'Machine Learning'} Comprehension Quizzes (
                {isDL ? '20+ Bank' : '100+ Bank'})
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Every lecture has a dedicated conceptual check. Practice across all modules or focus on a weak area.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                Answered:{' '}
                <span className="font-bold text-cyan-300">
                  {Object.keys(practiceAnswers).length}/{quizBank.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPracticeAnswers({});
                  setPracticeResult(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                type="button"
                disabled={isSubmittingPractice}
                onClick={handleSubmitPracticeBank}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-cyan-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmittingPractice ? 'Grading...' : 'Grade Practice Submission'}
              </button>
            </div>
          </div>

          {practiceResult && (
            <div className="rounded-2xl border border-cyan-500/35 bg-cyan-950/25 p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-cyan-400" />
                <div>
                  <div className="text-base font-bold text-white">
                    Practice Score: {practiceResult.score_percent}% ({practiceResult.correct_count}/
                    {practiceResult.total_answered} correct)
                  </div>
                  <div className="text-xs text-cyan-200/80">
                    All-time Best Recorded Score: {practiceResult.best_score}%
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('final-exam')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Ready for Proctored Final Exam →
              </button>
            </div>
          )}

          {/* Module Filter Pills & Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPracticeModuleFilter('ALL');
                  setPracticePage(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  practiceModuleFilter === 'ALL'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All ({quizBank.length})
              </button>
              {course.modules.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setPracticeModuleFilter(m.id);
                    setPracticePage(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    practiceModuleFilter === m.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  M{m.order}: {m.lesson_count}Q
                </button>
              ))}
            </div>

            {totalPracticePages > 1 && (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPracticePages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPracticePage(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      safePracticePage === idx
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {idx * PRACTICE_PAGE_SIZE + 1}–
                    {Math.min((idx + 1) * PRACTICE_PAGE_SIZE, filteredPracticeQuestions.length)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Question Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPracticeSlice.map((q) => {
              const selectedIdx = practiceAnswers[q.id];
              const graded = practiceDetailMap[q.id];

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold">
                        Q#{q.lesson_order} · {q.module_title}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const target = course.lessons.find((l) => l.id === q.lesson_id);
                          if (target) {
                            setActiveTab('course');
                            selectLesson(target);
                          }
                        }}
                        className="text-cyan-400 hover:underline font-semibold"
                      >
                        Review Video →
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug">{q.question}</h4>
                    <div className="space-y-1.5">
                      {q.options.map((opt, idx) => {
                        const isPicked = selectedIdx === idx;
                        const isRight = graded && graded.correct_index === idx;
                        const isWrong = graded && isPicked && !graded.correct;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setPracticeAnswers((prev) => ({
                                ...prev,
                                [q.id]: idx,
                              }))
                            }
                            className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition ${
                              isRight
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-100'
                                : isWrong
                                ? 'bg-rose-500/15 border-rose-500 text-rose-100'
                                : isPicked
                                ? 'bg-cyan-600/20 border-cyan-400 text-white'
                                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {graded && (
                    <div
                      className={`text-[11px] rounded-xl p-2.5 border ${
                        graded.correct
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                          : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                      }`}
                    >
                      {graded.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB: ADVANCED SYLLABUS & ROADMAP ================= */}
      {activeTab === 'syllabus' && (
        <CourseSyllabusRoadmapPanel
          modules={course.modules}
          lessons={course.lessons}
          completedLessons={completedLessons}
          quizResults={quizResults}
          capstoneCount={capstoneSubmissions.length}
          examPassed={savedExamPassed}
          onJumpToLesson={(lesson) => {
            setActiveTab('course');
            selectLesson(lesson);
          }}
          onJumpToTab={(targetTab) => setActiveTab(targetTab)}
        />
      )}

      {/* ================= TAB: CAPSTONE PROJECTS & RUBRIC GRADING ================= */}
      {activeTab === 'capstone' && (
        <CapstoneWorkspacePanel
          courseTitle={course.title}
          projects={capstoneProjects}
          submissions={capstoneSubmissions}
          onSubmitCapstone={handleCapstoneSubmit}
          isSubmitting={isSubmittingCapstone}
        />
      )}

      {/* ================= TAB: PEER REVIEWS & RATINGS ================= */}
      {activeTab === 'reviews' && (
        <CourseReviewsPanel
          courseTitle={course.title}
          reviewsData={reviewsData}
          onSubmitReview={handleSubmitReview}
          onToggleHelpful={handleToggleReviewHelpful}
          isSubmittingReview={isSubmittingReview}
        />
      )}

      {/* ================= TAB 3: CAMERA CHEAT-PROTECTED FINAL EXAM ================= */}
      {activeTab === 'final-exam' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Exam Workspace */}
          <div className="lg:col-span-8 space-y-5">
            {examPhase === 'preflight' && (
              <div className="rounded-3xl border border-emerald-500/25 bg-slate-900/80 p-6 sm:p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Proctored Certification Assessment
                    </span>
                    <h2 className="text-2xl font-extrabold text-white mt-0.5">
                      {finalExam?.title || `${course.title} — Proctored Final Exam`}
                    </h2>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      Earn an official cryptographically signed{' '}
                      <strong className="text-white">
                        {isDL
                          ? '[Stanford X Coding Task Factory Academy] Deep Learning Certificate'
                          : 'Coding Task Factory ML Certificate'}
                      </strong>{' '}
                      with Downloadable Landscape A4 Vector PDF &amp; Public Verification URL.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5">
                    <div className="text-[11px] text-slate-400">Exam Length</div>
                    <div className="text-lg font-extrabold text-white">
                      {finalExam?.total_questions || (isDL ? 20 : 35)} Questions
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5">
                    <div className="text-[11px] text-slate-400">Time Limit</div>
                    <div className="text-lg font-extrabold text-white">
                      {finalExam?.duration_minutes || (isDL ? 30 : 45)} Minutes
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5">
                    <div className="text-[11px] text-slate-400">Pass Score</div>
                    <div className="text-lg font-extrabold text-emerald-400">
                      {finalExam?.passing_score || 70}%
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5">
                    <div className="text-[11px] text-slate-400">Cheat Limit</div>
                    <div className="text-lg font-extrabold text-rose-400">3 Strikes Max</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-white text-sm mb-1">
                    Camera Cheat-Protection Rules
                  </div>
                  <p>
                    1. Click <strong>Enable Webcam Guard</strong> in the right panel until{' '}
                    <span className="text-emerald-400 font-semibold">CAM READY</span> appears.
                  </p>
                  <p>
                    2. Covering your webcam, leaving the camera frame, or having multiple faces
                    triggers a strike.
                  </p>
                  <p>
                    3. Switching tabs, minimizing the browser, exiting fullscreen, right-clicking, or
                    copy/pasting adds a strike. Reaching <strong>3 strikes</strong> automatically
                    terminates and disqualifies the attempt.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="text-xs">
                    {cameraReady ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Webcam Verified — Ready to begin proctored session
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold">
                        <Camera className="w-4 h-4" />
                        Enable Webcam Guard on the right to unlock the start button
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={!cameraReady}
                    onClick={handleStartExam}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 disabled:cursor-not-allowed text-white text-sm font-extrabold transition shadow-xl shadow-emerald-500/25"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Start Proctored Final Exam
                  </button>
                </div>
              </div>
            )}

            {examPhase === 'active' && finalExam && finalExam.questions.length > 0 && (
              <div className="space-y-4">
                {/* Sticky Timer & Submit Bar */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm font-bold text-cyan-300">
                      {formatCountdown(examRemainingSec)}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">
                      Answered {Object.keys(examAnswers).length} / {finalExam.questions.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isSubmittingExam}
                    onClick={() => submitFinalExam(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20"
                  >
                    {isSubmittingExam ? 'Submitting...' : 'Submit Final Exam'}
                  </button>
                </div>

                {/* Focused Question Card */}
                {(() => {
                  const q = finalExam.questions[examQuestionIdx];
                  if (!q) return null;
                  const picked = examAnswers[q.id];

                  return (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold">
                          Exam Question {examQuestionIdx + 1} of {finalExam.questions.length}
                        </span>
                        <span className="text-slate-400">{q.module_title}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white leading-snug">{q.question}</h3>

                      <div className="space-y-2.5">
                        {q.options.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setExamAnswers((prev) => ({
                                ...prev,
                                [q.id]: idx,
                              }))
                            }
                            className={`w-full text-left p-4 rounded-xl border text-sm transition flex items-start gap-3 ${
                              picked === idx
                                ? 'bg-indigo-600/20 border-indigo-400 text-white'
                                : 'bg-slate-950/75 border-slate-800 text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                picked === idx
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          disabled={examQuestionIdx === 0}
                          onClick={() => setExamQuestionIdx((i) => Math.max(0, i - 1))}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={examQuestionIdx >= finalExam.questions.length - 1}
                          onClick={() =>
                            setExamQuestionIdx((i) =>
                              Math.min(finalExam.questions.length - 1, i + 1)
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white transition"
                        >
                          Save &amp; Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Question Palette */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Question Navigator
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {finalExam.questions.map((q, idx) => {
                      const isAnswered = examAnswers[q.id] !== undefined;
                      const isCurrent = idx === examQuestionIdx;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setExamQuestionIdx(idx)}
                          className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition border ${
                            isCurrent
                              ? 'bg-indigo-600 border-indigo-300 text-white'
                              : isAnswered
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {examPhase === 'submitted' && examResult && (
              <div
                className={`rounded-3xl border p-6 sm:p-8 space-y-6 ${
                  examResult.passed
                    ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/35 to-slate-900'
                    : 'border-rose-500/40 bg-gradient-to-br from-rose-950/30 to-slate-900'
                }`}
              >
                <div className="flex items-start gap-4">
                  {examResult.passed ? (
                    <Award className="w-12 h-12 text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-12 h-12 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">
                      {examResult.disqualified
                        ? 'Exam Disqualified — Anti-Cheat Triggered'
                        : examResult.passed
                        ? 'Final Exam Passed! Certificate Earned'
                        : 'Final Exam Not Passed Yet'}
                    </h2>
                    <p className="text-sm text-slate-300 mt-1">{examResult.message}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                    <div className="text-xs text-slate-400">Final Score</div>
                    <div className="text-2xl font-extrabold text-white">
                      {examResult.score_percent}%
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                    <div className="text-xs text-slate-400">Correct Answers</div>
                    <div className="text-2xl font-extrabold text-cyan-300">
                      {examResult.correct_count}/{examResult.total_questions}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                    <div className="text-xs text-slate-400">Proctor Strikes</div>
                    <div className="text-2xl font-extrabold text-amber-300">
                      {examResult.violations}/3
                    </div>
                  </div>
                </div>

                {examResult.passed && examResult.certificate && (
                  <div className="rounded-2xl bg-slate-950/85 border border-emerald-500/35 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Verified Credential Issued
                        </div>
                        <div className="text-lg font-bold text-white">
                          {examResult.certificate.title}
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          ID: {examResult.certificate.credential_id} · Hash:{' '}
                          {examResult.certificate.credential_hash?.slice(0, 12)}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                        {examResult.certificate.grade}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          examResult.certificate &&
                          api.downloadCertificatePdf(examResult.certificate.credential_id)
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Official PDF
                      </button>
                      <Link
                        to={`/verify/${examResult.certificate.credential_id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        Verify Credential
                      </Link>
                      <Link
                        to="/app/certificates"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                      >
                        Open Certificates &amp; Social Share
                      </Link>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setExamPhase('preflight');
                    setExamResult(null);
                    setExamViolations(0);
                    setExamViolationLog([]);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Return to Pre-Flight Check
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Live Camera Proctor Guard */}
          <div className="lg:col-span-4 sticky top-4">
            <ProctorCameraGuard
              active={examPhase === 'active'}
              maxViolations={3}
              violationsCount={examViolations}
              violationLog={examViolationLog}
              onCameraReadyChange={setCameraReady}
              onViolation={handleProctorViolation}
              onMaxViolationsReached={handleMaxViolationsReached}
            />
          </div>
        </div>
      )}
    </div>
  );
};
