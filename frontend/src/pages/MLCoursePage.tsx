import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  FileEdit,
  Gift,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  PlayCircle,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth, useToast } from '../context/useContexts';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { ProctorCameraGuard, ProctorIntegrityState } from '../components/lms/ProctorCameraGuard';
import {
  CapstoneWorkspacePanel,
  CourseReviewsPanel,
} from '../components/lms/CourseAdvancedPanels';
import {
  CourseCertificateStagePanel,
  CourseCompletionDonePanel,
  CourseGoodiesFormPanel,
} from '../components/lms/CourseEndToEndPanels';
import { CourseOutlineRail, LMSPageStage } from '../components/lms/CourseOutlineRail';
import { InLMSVideoPlayer } from '../components/lms/InLMSVideoPlayer';
import { VideoShareButton } from '../components/videos/VideoShareButton';
import {
  Certificate,
  MLCapstoneProject,
  MLCapstoneSubmission,
  MLCapstoneSubmitPayload,
  MLCourseGoodiesClaim,
  MLCourseGoodiesClaimPayload,
  MLCourseOverview,
  MLCourseReviewsOverview,
  MLCourseReviewSubmitPayload,
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

type CourseTrack = 'ml' | 'dl';
type ExamPhase = 'preflight' | 'active' | 'submitted';

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

  // Google Cloud Skills Boost style Page-by-Page Stepper State
  const [pageStage, setPageStage] = useState<LMSPageStage>('watch');
  const [outlineOpen, setOutlineOpen] = useState<boolean>(true);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(isDL ? 'dl-001' : 'ml-001');
  const [videoJustFinished, setVideoJustFinished] = useState<boolean>(false);

  // Per-Lesson Progress, Notes & Quiz State
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [notesByLesson, setNotesByLesson] = useState<Record<string, string>>({});
  const [draftNote, setDraftNote] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [isCompletingLesson, setIsCompletingLesson] = useState<boolean>(false);
  const [quizResults, setQuizResults] = useState<Record<string, MLQuizResultRecord>>({});
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<MLQuizAnswerResponse | null>(null);
  const [isSubmittingLessonQuiz, setIsSubmittingLessonQuiz] = useState<boolean>(false);

  // Practice Quiz Bank State
  const [practiceModuleFilter, setPracticeModuleFilter] = useState<string>('ALL');
  const [practicePage, setPracticePage] = useState<number>(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const [practiceResult, setPracticeResult] = useState<MLPracticeQuizResultResponse | null>(null);
  const [bestPracticeScore, setBestPracticeScore] = useState<number>(0);
  const [isSubmittingPractice, setIsSubmittingPractice] = useState<boolean>(false);

  // Capstone, Feedback, Certificate & Goodies State
  const [capstoneProjects, setCapstoneProjects] = useState<MLCapstoneProject[]>([]);
  const [capstoneSubmissions, setCapstoneSubmissions] = useState<MLCapstoneSubmission[]>([]);
  const [isSubmittingCapstone, setIsSubmittingCapstone] = useState<boolean>(false);
  const [reviewsData, setReviewsData] = useState<MLCourseReviewsOverview | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [earnedCertificate, setEarnedCertificate] = useState<Certificate | null>(null);
  const [goodiesClaim, setGoodiesClaim] = useState<MLCourseGoodiesClaim | null>(null);
  const [isSubmittingGoodies, setIsSubmittingGoodies] = useState<boolean>(false);

  // Proctored Final Exam State
  const [examPhase, setExamPhase] = useState<ExamPhase>('preflight');
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [proctorIntegrity, setProctorIntegrity] = useState<ProctorIntegrityState>({
    status: 'ok',
    headline: 'Awaiting Webcam',
    reason: '',
    engineMode: 'initializing',
    faceCount: null,
    detectedObjects: [],
  });
  const [examQuestionIdx, setExamQuestionIdx] = useState<number>(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examRemainingSec, setExamRemainingSec] = useState<number>(45 * 60);
  const [examViolations, setExamViolations] = useState<number>(0);
  const [examViolationLog, setExamViolationLog] = useState<MLViolationEvent[]>([]);
  const [examResult, setExamResult] = useState<MLFinalExamResultResponse | null>(null);
  const [savedExamScore, setSavedExamScore] = useState<number | null>(null);
  const [savedExamPassed, setSavedExamPassed] = useState<boolean>(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState<boolean>(false);

  const stageTopRef = useRef<HTMLDivElement | null>(null);
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
      courseClient.getEarnedCertificate().catch(() => null),
      courseClient.getGoodies().catch(() => null),
    ])
      .then(([overview, bankRes, examRes, capstoneRes, revRes, certRes, goodiesRes]) => {
        if (cancelled) return;
        setCourse(overview);
        setQuizBank(bankRes.questions || []);
        setFinalExam(examRes);
        setCapstoneProjects(capstoneRes?.projects || overview.capstone_projects || []);
        setCapstoneSubmissions(capstoneRes?.submissions || []);
        if (revRes) setReviewsData(revRes);
        if (certRes?.certificate) setEarnedCertificate(certRes.certificate);
        if (goodiesRes?.claim) setGoodiesClaim(goodiesRes.claim);

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

  const scrollToStageTop = () => {
    stageTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openLessonStage = useCallback(
    (lesson: MLLessonItem, stage: 'watch' | 'notes' | 'quiz') => {
      setSelectedLessonId(lesson.id);
      setPageStage(stage);
      setVideoJustFinished(false);
      setDraftNote(notesByLesson[lesson.id] ?? '');
      const prevQ = quizResults[lesson.id];
      setSelectedQuizOption(prevQ ? prevQ.selected : null);
      setQuizFeedback(null);
      navigate(`${basePath}/${lesson.id}`, { replace: true });
      scrollToStageTop();
    },
    [basePath, navigate, notesByLesson, quizResults]
  );

  const openMilestoneStage = useCallback(
    (
      stage: 'quiz-bank' | 'capstone' | 'final-exam' | 'reviews' | 'certificate' | 'goodies' | 'done'
    ) => {
      setPageStage(stage);
      scrollToStageTop();
    },
    []
  );

  const markLessonWatched = useCallback(
    async (silent = false) => {
      if (!activeLesson) return;
      if (completedLessons.includes(activeLesson.id)) {
        if (!silent) {
          showToast(`Lecture #${activeLesson.order} already watched.`, 'info');
        }
        return;
      }
      setIsCompletingLesson(true);
      try {
        const res = await courseClient.completeLesson(activeLesson.id);
        setCompletedLessons(res.completed_lessons);
        if (res.points_awarded > 0) {
          refreshUser().catch(() => {});
          showToast(
            `Lecture #${activeLesson.order} watched! +${res.points_awarded} XP earned.`,
            'success'
          );
        }
      } catch (err: unknown) {
        if (!silent) {
          const msg = err instanceof Error ? err.message : 'Could not update lesson status.';
          showToast(msg, 'error');
        }
      } finally {
        setIsCompletingLesson(false);
      }
    },
    [activeLesson, completedLessons, courseClient, refreshUser, showToast]
  );

  const handleVideoEnded = useCallback(() => {
    if (!activeLesson) return;
    setVideoJustFinished(true);
    markLessonWatched(true);
    showToast(
      `Lecture #${activeLesson.order} finished! Click Next to read Notes or solve Quiz.`,
      'success'
    );
  }, [activeLesson, markLessonWatched, showToast]);

  const handleWatchNextAction = async (target: 'notes' | 'quiz') => {
    if (activeLesson && !completedLessons.includes(activeLesson.id)) {
      await markLessonWatched(true);
    }
    setPageStage(target);
    scrollToStageTop();
  };

  const handleSaveNotes = async () => {
    if (!activeLesson) return;
    setIsSavingNote(true);
    try {
      const res = await courseClient.saveLessonNotes(activeLesson.id, draftNote);
      setNotesByLesson(res.lesson_notes);
      showToast(`Saved personal notes for Lecture #${activeLesson.order}.`, 'success');
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
            ? `Correct! +${res.points_awarded} XP — ready for the next lecture!`
            : 'Quiz passed! Continue to the next lecture.',
          'success'
        );
      } else {
        showToast('Not quite right — review the explanation below.', 'info');
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

  const handleSubmitReview = async (payload: MLCourseReviewSubmitPayload) => {
    setIsSubmittingReview(true);
    try {
      await courseClient.submitReview(payload);
      const updated = await courseClient.getReviews();
      setReviewsData(updated);
      refreshUser().catch(() => {});
      showToast('Published your feedback! Next: Claim Certificate or Goodies.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish feedback.';
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

  const handleSubmitGoodies = async (payload: MLCourseGoodiesClaimPayload) => {
    setIsSubmittingGoodies(true);
    try {
      const claim = await courseClient.submitGoodies(payload);
      setGoodiesClaim(claim);
      if ((claim.points_awarded || 0) > 0) {
        refreshUser().catch(() => {});
      }
      setPageStage('done');
      scrollToStageTop();
      showToast(`Goodies order confirmed (${claim.dispatch_code})!`, 'success');
      try {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      } catch {
        // decorative
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to claim goodies bundle.';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingGoodies(false);
    }
  };

  // Practice Quiz Bank pagination
  const filteredPracticeQuestions = useMemo(() => {
    if (practiceModuleFilter === 'ALL') return quizBank;
    return quizBank.filter((q) => q.module_id === practiceModuleFilter);
  }, [quizBank, practiceModuleFilter]);

  const PRACTICE_PAGE_SIZE = 20;
  const totalPracticePages = Math.max(
    1,
    Math.ceil(filteredPracticeQuestions.length / PRACTICE_PAGE_SIZE)
  );
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
          if (res.certificate) setEarnedCertificate(res.certificate);
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

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-5">
        <div className="h-16 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 h-[540px] rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          <div className="lg:col-span-9 h-[540px] rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (loadError || !course || !activeLesson) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8">
          <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Unable to load LMS Course</h2>
          <p className="text-sm text-slate-400 mb-5">{loadError || 'Catalog unavailable.'}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition"
          >
            Reload Classroom
          </button>
        </div>
      </div>
    );
  }

  const totalLessons = course.total_lessons;
  const completedCount = completedLessons.length;
  const quizzesPassedCount = Object.values(quizResults).filter((r) => r.correct).length;
  const completionPct = Math.round((completedCount / Math.max(1, totalLessons)) * 100);
  const activeIndex = course.lessons.findIndex((l) => l.id === activeLesson.id);
  const prevLesson = activeIndex > 0 ? course.lessons[activeIndex - 1] : null;
  const nextLesson =
    activeIndex >= 0 && activeIndex < course.lessons.length - 1
      ? course.lessons[activeIndex + 1]
      : null;

  const isLessonCompleted = completedLessons.includes(activeLesson.id);
  const activeQuizRecord = quizResults[activeLesson.id];
  const hasOwnReview = Boolean(reviewsData?.reviews.some((r) => r.is_own_review));

  // Pure metadata descriptor for Google Cloud Skills Boost Bottom Stepper Pager (event handlers kept out of render values)
  const pagerMeta = (() => {
    if (pageStage === 'watch') {
      return {
        label: `Lecture ${activeLesson.order} of ${totalLessons} · Step 1 of 3 (Watch Video)`,
        prevText: prevLesson ? `← Lecture #${prevLesson.order} Quiz` : '← Course Detail',
        nextText: `Next: Solve Quiz #${activeLesson.order} →`,
        secondaryText: 'Study Notes & Code →',
      };
    }
    if (pageStage === 'notes') {
      return {
        label: `Lecture ${activeLesson.order} of ${totalLessons} · Step 2 of 3 (Study Notes & Code)`,
        prevText: '← Watch Video',
        nextText: `Next: Solve Quiz #${activeLesson.order} →`,
        secondaryText: '',
      };
    }
    if (pageStage === 'quiz') {
      return {
        label: `Lecture ${activeLesson.order} of ${totalLessons} · Step 3 of 3 (Comprehension Quiz)`,
        prevText: '← Study Notes',
        nextText: nextLesson
          ? `Next: Watch Lecture #${nextLesson.order} →`
          : 'Next: Full Quiz Practice Bank →',
        secondaryText: 'Back to Video',
      };
    }
    if (pageStage === 'quiz-bank') {
      return {
        label: `Milestone 1 · Cumulative Quiz Practice (${quizBank.length} Questions)`,
        prevText: `← Lecture #${activeLesson.order}`,
        nextText: 'Next: Capstone Project Lab →',
        secondaryText: '',
      };
    }
    if (pageStage === 'capstone') {
      return {
        label: 'Milestone 2 · Graded Capstone Lab',
        prevText: '← Quiz Practice Bank',
        nextText: 'Next: Camera Final Exam →',
        secondaryText: '',
      };
    }
    if (pageStage === 'final-exam') {
      return {
        label: 'Milestone 3 · Camera Cheat-Protected Final Exam',
        prevText: '← Capstone Lab',
        nextText: 'Next: Course Feedback →',
        secondaryText: '',
      };
    }
    if (pageStage === 'reviews') {
      return {
        label: 'Milestone 4 · Course Feedback Survey',
        prevText: '← Final Exam',
        nextText: 'Next: Verified Certificate →',
        secondaryText: '',
      };
    }
    if (pageStage === 'certificate') {
      return {
        label: 'Milestone 5 · Verified Certificate & Vector PDF',
        prevText: '← Feedback Survey',
        nextText: 'Next: Claim Goodies Form →',
        secondaryText: '',
      };
    }
    if (pageStage === 'goodies') {
      return {
        label: 'Milestone 6 · Graduate Goodies Dispatch Form',
        prevText: '← Certificate',
        nextText: 'Next: Done Summary →',
        secondaryText: '',
      };
    }
    return {
      label: 'Graduation Complete!',
      prevText: '← Goodies Form',
      nextText: 'Browse All Courses →',
      secondaryText: '',
    };
  })();

  const handlePagerPrev = () => {
    if (pageStage === 'watch') {
      if (prevLesson) openLessonStage(prevLesson, 'quiz');
      else navigate(`/app/lms/${track}`);
    } else if (pageStage === 'notes') {
      setPageStage('watch');
      scrollToStageTop();
    } else if (pageStage === 'quiz') {
      setPageStage('notes');
      scrollToStageTop();
    } else if (pageStage === 'quiz-bank') {
      openLessonStage(activeLesson, 'quiz');
    } else if (pageStage === 'capstone') {
      openMilestoneStage('quiz-bank');
    } else if (pageStage === 'final-exam') {
      openMilestoneStage('capstone');
    } else if (pageStage === 'reviews') {
      openMilestoneStage('final-exam');
    } else if (pageStage === 'certificate') {
      openMilestoneStage('reviews');
    } else if (pageStage === 'goodies') {
      openMilestoneStage('certificate');
    } else {
      openMilestoneStage('goodies');
    }
  };

  const handlePagerNext = () => {
    if (pageStage === 'watch') {
      handleWatchNextAction('quiz');
    } else if (pageStage === 'notes') {
      setPageStage('quiz');
      scrollToStageTop();
    } else if (pageStage === 'quiz') {
      if (nextLesson) openLessonStage(nextLesson, 'watch');
      else openMilestoneStage('quiz-bank');
    } else if (pageStage === 'quiz-bank') {
      openMilestoneStage('capstone');
    } else if (pageStage === 'capstone') {
      openMilestoneStage('final-exam');
    } else if (pageStage === 'final-exam') {
      openMilestoneStage('reviews');
    } else if (pageStage === 'reviews') {
      openMilestoneStage('certificate');
    } else if (pageStage === 'certificate') {
      openMilestoneStage('goodies');
    } else if (pageStage === 'goodies') {
      openMilestoneStage('done');
    } else {
      navigate('/app/lms');
    }
  };

  const handlePagerSecondary = () => {
    if (pageStage === 'watch') {
      handleWatchNextAction('notes');
    } else if (pageStage === 'quiz') {
      setPageStage('watch');
      scrollToStageTop();
    }
  };

  return (
    <div ref={stageTopRef} className="max-w-7xl mx-auto p-3 sm:p-5 space-y-4">
      {/* Compact Google Cloud Skills Boost Classroom Top Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#0A0F1D] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <Link
            to={`/app/lms/${track}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs font-bold text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Course Detail
          </Link>

          <button
            type="button"
            onClick={() => setOutlineOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-cyan-300 transition"
          >
            {outlineOpen ? (
              <>
                <PanelLeftClose className="w-3.5 h-3.5" />
                Hide Outline
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-3.5 h-3.5" />
                Show Outline
              </>
            )}
          </button>

          <div className="hidden sm:block h-4 w-px bg-slate-800" />
          <span className="text-xs sm:text-sm font-extrabold text-white truncate max-w-xs md:max-w-md">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            <Link
              to="/app/ml-course"
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                !isDL ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ML (106)
            </Link>
            <Link
              to="/app/dl-course"
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                isDL ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Stanford DL (21)
            </Link>
          </div>

          <div className="w-32 hidden md:block">
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>{completedCount}/{totalLessons}</span>
              <span className="text-emerald-400 font-bold">{completionPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Guided Classroom Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Collapsible Outline Rail */}
        {outlineOpen && (
          <div className="lg:col-span-3 lg:sticky lg:top-4">
            <CourseOutlineRail
              modules={course.modules}
              lessons={course.lessons}
              activeLessonId={activeLesson.id}
              activeStage={pageStage}
              completedLessons={completedLessons}
              notesByLesson={notesByLesson}
              quizResults={quizResults}
              capstoneSubmittedCount={capstoneSubmissions.length}
              examPassed={savedExamPassed}
              hasFeedback={hasOwnReview}
              certificateEarned={Boolean(earnedCertificate)}
              goodiesClaimed={Boolean(goodiesClaim)}
              isDL={isDL}
              onSelectLessonActivity={openLessonStage}
              onSelectMilestoneStage={openMilestoneStage}
            />
          </div>
        )}

        {/* Right Single-Focus Page Canvas + Bottom Pager */}
        <div className={`${outlineOpen ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-4`}>
          {/* Sub-Stepper Pill Header when viewing any Lecture Activity (Watch / Notes / Quiz) */}
          {(pageStage === 'watch' || pageStage === 'notes' || pageStage === 'quiz') && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold">
                    Module {activeLesson.module_order}: {activeLesson.module_title}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-mono">
                    Lecture #{activeLesson.order} / {totalLessons}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {activeLesson.duration_label}
                  </span>
                </div>
                {isLessonCompleted && activeQuizRecord?.correct && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Lecture Completed
                  </span>
                )}
              </div>

              <h1 className="text-lg sm:text-2xl font-extrabold text-white leading-snug">
                {activeLesson.title}
              </h1>

              {/* 3-Step Sequential Activity Switcher Inside Current Lecture */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => openLessonStage(activeLesson, 'watch')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    pageStage === 'watch'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-indigo-500/40'
                  }`}
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Step 1: Watch Video
                  {isLessonCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                </button>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <button
                  type="button"
                  onClick={() => openLessonStage(activeLesson, 'notes')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    pageStage === 'notes'
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-cyan-500/40'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Step 2: Study Notes &amp; Code
                </button>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <button
                  type="button"
                  onClick={() => openLessonStage(activeLesson, 'quiz')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    pageStage === 'quiz'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-emerald-500/40'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Step 3: Solve Quiz #{activeLesson.order}
                  {activeQuizRecord?.correct && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ===================== PAGE 1: WATCH VIDEO ===================== */}
          {pageStage === 'watch' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 sm:p-5 space-y-4">
              <InLMSVideoPlayer
                key={activeLesson.id}
                lesson={activeLesson}
                isCompleted={isLessonCompleted}
                isDL={isDL}
                onVideoEnded={handleVideoEnded}
              />

              {videoJustFinished && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-emerald-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    Video finished! Continue to read the study notes or solve Quiz #{activeLesson.order}.
                  </div>
                  <button
                    type="button"
                    onClick={() => handleWatchNextAction('quiz')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition"
                  >
                    Solve Quiz #{activeLesson.order} Now →
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isCompletingLesson}
                    onClick={() => markLessonWatched(false)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      isLessonCompleted
                        ? 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isLessonCompleted
                      ? 'Video Watched ✓'
                      : isCompletingLesson
                      ? 'Saving...'
                      : 'Mark Video Watched (+15 XP)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWatchNextAction('notes')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600/20 border border-cyan-500/35 hover:bg-cyan-600/30 text-cyan-200 text-xs font-bold transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Next: Read Notes &amp; Code
                  </button>
                  <VideoShareButton
                    title={activeLesson.title}
                    sharePath={`/app/${track}-course/${activeLesson.id}`}
                    subtitle={course.title}
                    align="left"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleWatchNextAction('quiz')}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-lg shadow-emerald-500/20"
                >
                  After Watch: Next Solve Quiz #{activeLesson.order}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ===================== PAGE 2: STUDY NOTES & CODE ===================== */}
          {pageStage === 'notes' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6 space-y-5">
                <div className="rounded-2xl border border-indigo-500/25 bg-indigo-950/25 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 mb-1">
                    Core Formula &amp; Conceptual Anchor
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
                      <button
                        type="button"
                        onClick={() => handleCopySnippet(activeLesson.code_snippet)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition"
                      >
                        <Copy className="w-3 h-3" />
                        Copy Code
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
                      <code>{activeLesson.code_snippet}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Personal Cloud Notebook */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileEdit className="w-4 h-4 text-cyan-400" />
                    My Personal Study Notes — Lecture #{activeLesson.order}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftNote((prev) =>
                        prev.trim()
                          ? prev
                          : `# ${activeLesson.title}\n- Key Equation: \n- Edge Cases: \n- Summary: `
                      )
                    }
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                  >
                    Insert Template
                  </button>
                </div>
                <textarea
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  rows={5}
                  placeholder={`Record your personal notes for "${activeLesson.title}"...`}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none p-3.5 text-xs text-slate-200 font-mono leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{draftNote.length} chars</span>
                  <button
                    type="button"
                    disabled={isSavingNote}
                    onClick={handleSaveNotes}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSavingNote ? 'Saving...' : 'Save Notes to Cloud'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== PAGE 3: SOLVE QUIZ #X ===================== */}
          {pageStage === 'quiz' && (
            <div className="rounded-2xl border border-emerald-500/25 bg-slate-900/80 p-5 sm:p-7 space-y-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  After-Video Quiz #{activeLesson.order} · {activeLesson.module_title}
                </span>
                {activeQuizRecord && (
                  <span className="text-xs text-slate-400">
                    Attempts: {activeQuizRecord.attempts} ·{' '}
                    <strong
                      className={activeQuizRecord.correct ? 'text-emerald-400' : 'text-amber-300'}
                    >
                      {activeQuizRecord.correct ? 'Passed ✓' : 'Try Again'}
                    </strong>
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                {activeLesson.quiz.question}
              </h2>

              <div className="space-y-2.5">
                {activeLesson.quiz.options.map((opt, idx) => {
                  const isSelected = selectedQuizOption === idx;
                  const revealCorrect = quizFeedback && quizFeedback.correct_index === idx;
                  const revealWrong = quizFeedback && isSelected && !quizFeedback.correct;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedQuizOption(idx);
                        setQuizFeedback(null);
                      }}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition flex items-start gap-3 ${
                        revealCorrect
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-100'
                          : revealWrong
                          ? 'bg-rose-500/15 border-rose-500 text-rose-100'
                          : isSelected
                          ? 'bg-indigo-600/20 border-indigo-400 text-white'
                          : 'bg-slate-950/75 border-slate-800 text-slate-300 hover:border-slate-600'
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
                  className={`rounded-2xl border p-4 text-sm space-y-1.5 ${
                    quizFeedback.correct
                      ? 'bg-emerald-950/35 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {quizFeedback.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-400" />
                    )}
                    {quizFeedback.correct
                      ? `Correct! Lecture #${activeLesson.order} Quiz Mastered.`
                      : 'Review the explanation and select the right option'}
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{quizFeedback.explanation}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  disabled={selectedQuizOption === null || isSubmittingLessonQuiz}
                  onClick={handleSubmitLessonQuiz}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 text-white text-xs font-extrabold transition shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  {isSubmittingLessonQuiz ? 'Checking Answer...' : 'Check Quiz Answer (+10 XP)'}
                </button>

                {nextLesson ? (
                  <button
                    type="button"
                    onClick={() => openLessonStage(nextLesson, 'watch')}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
                      quizFeedback?.correct || activeQuizRecord?.correct
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    Next: Watch Lecture #{nextLesson.order} ({nextLesson.title.slice(0, 28)}...)
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openMilestoneStage('quiz-bank')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition"
                  >
                    Next Milestone: Full Quiz Practice Bank →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ===================== MILESTONE: QUIZ PRACTICE BANK ===================== */}
          {pageStage === 'quiz-bank' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {quizBank.length} Comprehension Quizzes ({isDL ? '20+ Bank' : '100+ Bank'})
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Best Mastery Score: <strong className="text-cyan-300">{bestPracticeScore}%</strong> · Answer &amp; grade all modules before your Capstone &amp; Final Exam.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
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
                        All-time Best Score: {practiceResult.best_score}%
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openMilestoneStage('capstone')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                  >
                    Continue to Capstone Project Lab →
                  </button>
                </div>
              )}

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
                      M{m.order} ({m.lesson_count}Q)
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
                        {Math.min(
                          (idx + 1) * PRACTICE_PAGE_SIZE,
                          filteredPracticeQuestions.length
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
                              if (target) openLessonStage(target, 'watch');
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
                                <span className="font-bold mr-2">
                                  {String.fromCharCode(65 + idx)}.
                                </span>
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

          {/* ===================== MILESTONE: CAPSTONE LAB ===================== */}
          {pageStage === 'capstone' && (
            <CapstoneWorkspacePanel
              courseTitle={course.title}
              projects={capstoneProjects}
              submissions={capstoneSubmissions}
              onSubmitCapstone={handleCapstoneSubmit}
              isSubmitting={isSubmittingCapstone}
            />
          )}

          {/* ===================== MILESTONE: CAMERA FINAL EXAM ===================== */}
          {pageStage === 'final-exam' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              <div className="xl:col-span-8 space-y-5">
                {examPhase === 'preflight' && (
                  <div className="rounded-3xl border border-emerald-500/25 bg-slate-900/80 p-6 sm:p-7 space-y-5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Proctored Certification Exam
                      </span>
                      <h2 className="text-2xl font-extrabold text-white mt-0.5">
                        {finalExam?.title || `${course.title} — Final Exam`}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 mt-2">
                        Pass with ≥{finalExam?.passing_score || 70}% under active webcam guard to
                        unlock your SHA-256 Vector PDF Certificate &amp; Graduate Goodies Bundle.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3">
                        <div className="text-[11px] text-slate-400">Length</div>
                        <div className="text-base font-extrabold text-white">
                          {finalExam?.total_questions || (isDL ? 20 : 35)} Qs
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3">
                        <div className="text-[11px] text-slate-400">Timer</div>
                        <div className="text-base font-extrabold text-white">
                          {finalExam?.duration_minutes || (isDL ? 30 : 45)} Min
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3">
                        <div className="text-[11px] text-slate-400">Pass Score</div>
                        <div className="text-base font-extrabold text-emerald-400">
                          {finalExam?.passing_score || 70}%
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3">
                        <div className="text-[11px] text-slate-400">Strike Limit</div>
                        <div className="text-base font-extrabold text-rose-400">3 Max</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
                      <span
                        className={`text-xs font-bold ${
                          cameraReady ? 'text-emerald-400' : 'text-amber-300'
                        }`}
                      >
                        {cameraReady
                          ? '✓ AI Face & Object Guard Verified — Ready to begin'
                          : proctorIntegrity.status !== 'ok' && proctorIntegrity.faceCount !== null
                          ? `⚠ ${proctorIntegrity.headline}: Center uncovered face in camera to unlock`
                          : 'Enable Webcam Guard and center your uncovered face in the side panel first'}
                      </span>
                      <button
                        type="button"
                        disabled={!cameraReady}
                        onClick={handleStartExam}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 text-white text-xs sm:text-sm font-extrabold transition shadow-xl shadow-emerald-500/20"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Start Proctored Final Exam
                      </button>
                    </div>
                  </div>
                )}

                {examPhase === 'active' && finalExam && finalExam.questions.length > 0 && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm font-bold text-cyan-300">
                          {formatCountdown(examRemainingSec)}
                        </span>
                        <span className="text-xs text-slate-300 font-semibold">
                          {Object.keys(examAnswers).length} / {finalExam.questions.length} Answered
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={isSubmittingExam}
                        onClick={() => submitFinalExam(false)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition"
                      >
                        {isSubmittingExam ? 'Submitting...' : 'Submit Final Exam'}
                      </button>
                    </div>

                    {(() => {
                      const q = finalExam.questions[examQuestionIdx];
                      if (!q) return null;
                      const picked = examAnswers[q.id];
                      const shieldLocked = proctorIntegrity.status !== 'ok';

                      return (
                        <div
                          onDragStart={(e) => e.preventDefault()}
                          className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 select-none overflow-hidden"
                        >
                          {shieldLocked && (
                            <div className="absolute inset-0 z-20 bg-[#050814]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 border-2 border-rose-500/50 rounded-2xl">
                              <ShieldAlert className="w-10 h-10 text-rose-400 animate-pulse" />
                              <div className="space-y-1 max-w-md">
                                <div className="text-xs font-mono uppercase tracking-wider text-rose-300 font-bold">
                                  Anti-Cheat Shield Locked · Strikes {examViolations}/3
                                </div>
                                <h3 className="text-lg font-extrabold text-white">
                                  {proctorIntegrity.headline}
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                  {proctorIntegrity.reason} Questions remain blurred until your uncovered face is centered cleanly in camera view.
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 font-bold">
                              Question {examQuestionIdx + 1} / {finalExam.questions.length}
                            </span>
                            <span className="text-slate-400">{q.module_title}</span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white">{q.question}</h3>
                          <div className="space-y-2">
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
                                className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-start gap-3 ${
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
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white"
                            >
                              ← Previous
                            </button>
                            <button
                              type="button"
                              disabled={examQuestionIdx >= finalExam.questions.length - 1}
                              onClick={() =>
                                setExamQuestionIdx((i) =>
                                  Math.min(finalExam.questions.length - 1, i + 1)
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white"
                            >
                              Save &amp; Next →
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 flex flex-wrap gap-1.5">
                      {finalExam.questions.map((q, idx) => {
                        const isAnswered = examAnswers[q.id] !== undefined;
                        const isCurrent = idx === examQuestionIdx;
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setExamQuestionIdx(idx)}
                            className={`w-8 h-8 rounded-lg text-xs font-mono font-bold border ${
                              isCurrent
                                ? 'bg-indigo-600 border-indigo-300 text-white'
                                : isAnswered
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {examPhase === 'submitted' && examResult && (
                  <div
                    className={`rounded-3xl border p-6 space-y-5 ${
                      examResult.passed
                        ? 'border-emerald-500/40 bg-emerald-950/25'
                        : 'border-rose-500/40 bg-rose-950/25'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {examResult.passed ? (
                        <Award className="w-10 h-10 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-10 h-10 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <h2 className="text-xl font-extrabold text-white">
                          {examResult.disqualified
                            ? 'Disqualified — Anti-Cheat Triggered'
                            : examResult.passed
                            ? `Passed (${examResult.score_percent}%) — Certificate Earned!`
                            : `Scored ${examResult.score_percent}% — Review & Retry`}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1">{examResult.message}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {examResult.passed && (
                        <>
                          <button
                            type="button"
                            onClick={() => openMilestoneStage('reviews')}
                            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition"
                          >
                            Next Page: Submit Course Feedback →
                          </button>
                          <button
                            type="button"
                            onClick={() => openMilestoneStage('certificate')}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                          >
                            View Certificate Stage →
                          </button>
                          <button
                            type="button"
                            onClick={() => openMilestoneStage('goodies')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            Claim Goodies Form →
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setExamPhase('preflight');
                          setExamResult(null);
                          setExamViolations(0);
                          setExamViolationLog([]);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
                      >
                        Retake Exam
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="xl:col-span-4 sticky top-4">
                <ProctorCameraGuard
                  active={examPhase === 'active'}
                  maxViolations={3}
                  violationsCount={examViolations}
                  violationLog={examViolationLog}
                  onCameraReadyChange={setCameraReady}
                  onIntegrityStateChange={setProctorIntegrity}
                  onViolation={handleProctorViolation}
                  onMaxViolationsReached={handleMaxViolationsReached}
                />
              </div>
            </div>
          )}

          {/* ===================== MILESTONE: FEEDBACK PAGE ===================== */}
          {pageStage === 'reviews' && (
            <CourseReviewsPanel
              courseTitle={course.title}
              reviewsData={reviewsData}
              onSubmitReview={handleSubmitReview}
              onToggleHelpful={handleToggleReviewHelpful}
              onProceedToCertificate={() => openMilestoneStage('certificate')}
              isSubmittingReview={isSubmittingReview}
            />
          )}

          {/* ===================== MILESTONE: CERTIFICATE PAGE ===================== */}
          {pageStage === 'certificate' && (
            <CourseCertificateStagePanel
              courseTitle={course.title}
              certificate={earnedCertificate}
              onGoToExam={() => openMilestoneStage('final-exam')}
              onGoToGoodies={() => openMilestoneStage('goodies')}
            />
          )}

          {/* ===================== MILESTONE: GOODIES CLAIM FORM ===================== */}
          {pageStage === 'goodies' && (
            <CourseGoodiesFormPanel
              courseTitle={course.title}
              defaultName={user?.full_name || ''}
              defaultEmail={user?.email || ''}
              existingClaim={goodiesClaim}
              onSubmitClaim={handleSubmitGoodies}
              isSubmitting={isSubmittingGoodies}
              onProceedToDone={() => openMilestoneStage('done')}
            />
          )}

          {/* ===================== MILESTONE: DONE GRADUATION SCREEN ===================== */}
          {pageStage === 'done' && (
            <CourseCompletionDonePanel
              courseTitle={course.title}
              completedLessonsCount={completedCount}
              totalLessonsCount={totalLessons}
              quizzesPassedCount={quizzesPassedCount}
              capstoneCount={capstoneSubmissions.length}
              examScore={savedExamScore}
              certificate={earnedCertificate}
              goodiesClaim={goodiesClaim}
            />
          )}

          {/* Pinned Google Cloud Skills Boost Bottom Page-by-Page Navigator */}
          <div className="rounded-2xl border border-slate-800 bg-[#0A0F1D] p-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <button
              type="button"
              onClick={handlePagerPrev}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              {pagerMeta.prevText}
            </button>

            <span className="text-[11px] font-mono text-slate-400 text-center hidden md:inline">
              {pagerMeta.label}
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {pagerMeta.secondaryText && (
                <button
                  type="button"
                  onClick={handlePagerSecondary}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-300 transition"
                >
                  {pagerMeta.secondaryText}
                </button>
              )}
              <button
                type="button"
                onClick={handlePagerNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition shadow-lg shadow-indigo-500/20"
              >
                {pagerMeta.nextText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
