import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Trophy,
  X,
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

  // Google Cloud Skills Boost style Page-by-Page Stepper State (auto-collapsed on <1024px mobile)
  const [pageStage, setPageStage] = useState<LMSPageStage>('watch');
  const [outlineOpen, setOutlineOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
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
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setOutlineOpen(false);
      }
      scrollToStageTop();
    },
    [basePath, navigate, notesByLesson, quizResults]
  );

  const openMilestoneStage = useCallback(
    (
      stage: 'quiz-bank' | 'capstone' | 'final-exam' | 'reviews' | 'certificate' | 'goodies' | 'done'
    ) => {
      setPageStage(stage);
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setOutlineOpen(false);
      }
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
        <div className="h-14 rounded-xl bg-[#19191b] border border-white/[0.08] animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 h-[540px] rounded-xl bg-[#19191b] border border-white/[0.08] animate-pulse" />
          <div className="lg:col-span-9 h-[540px] rounded-xl bg-[#19191b] border border-white/[0.08] animate-pulse" />
        </div>
      </div>
    );
  }

  if (loadError || !course || !activeLesson) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <div className="rounded-xl border border-[#e5484d]/30 bg-[#19191b] p-8">
          <ShieldAlert className="w-8 h-8 text-[#e5484d] mx-auto mb-3" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold text-[#ededed] mb-2">Unable to load LMS course</h2>
          <p className="text-sm text-[#a1a1a6] mb-5">{loadError || 'Catalog unavailable.'}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
          >
            Reload classroom
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

  const pagerMeta = (() => {
    if (pageStage === 'watch') {
      return {
        label: `Lecture ${activeLesson.order} of ${totalLessons} · Step 1 of 3 (Watch video)`,
        prevText: prevLesson ? `Lecture #${prevLesson.order} quiz` : 'Course detail',
        nextText: `Next: Solve quiz #${activeLesson.order}`,
        secondaryText: 'Study notes & code',
      };
    }
    if (pageStage === 'notes') {
      return {
        label: `Lecture ${activeLesson.order} of ${totalLessons} · Step 2 of 3 (Study notes & code)`,
        prevText: 'Watch video',
        nextText: `Next: Solve quiz #${activeLesson.order}`,
        secondaryText: '',
      };
    }
    if (pageStage === 'quiz') {
      return {
        label: `Lecture ${activeLesson.order} of ${totalLessons} · Step 3 of 3 (Comprehension quiz)`,
        prevText: 'Study notes',
        nextText: nextLesson
          ? `Next: Watch lecture #${nextLesson.order}`
          : 'Next: Quiz practice bank',
        secondaryText: 'Back to video',
      };
    }
    if (pageStage === 'quiz-bank') {
      return {
        label: `Milestone 1 · Cumulative quiz practice (${quizBank.length} questions)`,
        prevText: `Lecture #${activeLesson.order}`,
        nextText: 'Next: Capstone project lab',
        secondaryText: '',
      };
    }
    if (pageStage === 'capstone') {
      return {
        label: 'Milestone 2 · Graded capstone lab',
        prevText: 'Quiz practice bank',
        nextText: 'Next: Camera final exam',
        secondaryText: '',
      };
    }
    if (pageStage === 'final-exam') {
      return {
        label: 'Milestone 3 · Camera-proctored final exam',
        prevText: 'Capstone lab',
        nextText: 'Next: Course feedback',
        secondaryText: '',
      };
    }
    if (pageStage === 'reviews') {
      return {
        label: 'Milestone 4 · Course feedback survey',
        prevText: 'Final exam',
        nextText: 'Next: Verified certificate',
        secondaryText: '',
      };
    }
    if (pageStage === 'certificate') {
      return {
        label: 'Milestone 5 · Verified certificate & vector PDF',
        prevText: 'Feedback survey',
        nextText: 'Next: Graduate goodies form',
        secondaryText: '',
      };
    }
    if (pageStage === 'goodies') {
      return {
        label: 'Milestone 6 · Graduate goodies dispatch form',
        prevText: 'Certificate',
        nextText: 'Next: Graduation summary',
        secondaryText: '',
      };
    }
    return {
      label: 'Track milestones recorded',
      prevText: 'Goodies form',
      nextText: 'Browse all courses',
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
      {/* Compact Classroom Top Bar */}
      <div className="rounded-xl border border-white/[0.08] bg-[#19191b] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <Link
            to={`/app/lms/${track}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222225] border border-white/[0.08] hover:border-white/[0.16] text-xs font-medium text-[#ededed] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
            Course detail
          </Link>

          <button
            type="button"
            onClick={() => setOutlineOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222225] border border-white/[0.08] hover:border-white/[0.16] text-xs font-medium text-[#ededed] transition-colors"
          >
            {outlineOpen ? (
              <>
                <PanelLeftClose className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
                Hide outline
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-3.5 h-3.5 text-[#e5a00d]" strokeWidth={1.5} />
                Show outline
              </>
            )}
          </button>

          <div className="hidden sm:block h-4 w-px bg-white/[0.08]" />
          <span className="text-xs sm:text-sm font-medium text-[#ededed] truncate max-w-xs md:max-w-md">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#141415] p-1 rounded-lg border border-white/[0.08] text-xs">
            <Link
              to="/app/ml-course"
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                !isDL ? 'bg-[#ededed] text-[#141415]' : 'text-[#85858b] hover:text-[#ededed]'
              }`}
            >
              ML (106)
            </Link>
            <Link
              to="/app/dl-course"
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                isDL ? 'bg-[#ededed] text-[#141415]' : 'text-[#85858b] hover:text-[#ededed]'
              }`}
            >
              Stanford DL (21)
            </Link>
          </div>

          <div className="w-32 hidden md:block">
            <div className="flex justify-between text-[11px] font-mono text-[#85858b] mb-1 tabular-nums">
              <span>{completedCount}/{totalLessons}</span>
              <span className="text-[#ededed] font-medium">{completionPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#141415] overflow-hidden">
              <div
                className="h-full bg-[#e5a00d] transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Guided Classroom Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {outlineOpen && (
          <div className="fixed inset-0 z-50 flex lg:static lg:inset-auto lg:z-auto lg:block lg:col-span-3 lg:sticky lg:top-4">
            <div
              className="fixed inset-0 bg-black/75 lg:hidden"
              onClick={() => setOutlineOpen(false)}
            />
            <div className="relative z-10 w-[86vw] max-w-sm lg:w-full h-full lg:h-auto overflow-y-auto bg-[#0f0f10] lg:bg-transparent p-3 lg:p-0 border-r border-white/[0.08] lg:border-none">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/[0.08] lg:hidden">
                <span className="text-xs font-medium text-[#e5a00d]">
                  Curriculum navigator
                </span>
                <button
                  type="button"
                  onClick={() => setOutlineOpen(false)}
                  className="p-1.5 rounded-lg bg-[#222225] text-[#a1a1a6] hover:text-[#ededed]"
                  aria-label="Close course outline"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
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
          </div>
        )}

        {/* Right Single-Focus Page Canvas + Bottom Pager */}
        <motion.div
          key={`${pageStage}-${pageStage === 'watch' || pageStage === 'notes' || pageStage === 'quiz' ? activeLesson.id : 'milestone'}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={`${outlineOpen ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-4`}
        >
          {/* Sub-Stepper Header when viewing any Lecture Activity (Watch / Notes / Quiz) */}
          {(pageStage === 'watch' || pageStage === 'notes' || pageStage === 'quiz') && (
            <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs tabular-nums">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#222225] border border-white/[0.08] text-[#ededed] font-medium">
                    Module {activeLesson.module_order}: {activeLesson.module_title}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#141415] border border-white/[0.08] text-[#a1a1a6] font-mono">
                    Lecture #{activeLesson.order} / {totalLessons}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#85858b] font-mono">
                    <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {activeLesson.duration_label}
                  </span>
                </div>
                {isLessonCompleted && activeQuizRecord?.correct && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#4cc38a]/10 border border-[#4cc38a]/30 text-[#4cc38a] text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Lecture completed
                  </span>
                )}
              </div>

              <h1 className="text-lg sm:text-xl font-semibold text-[#ededed] leading-snug tracking-tight">
                {activeLesson.title}
              </h1>

              {/* 3-Step Sequential Activity Switcher Inside Current Lecture */}
              <div className="flex items-center overflow-x-auto no-scrollbar gap-2 pt-2 pb-1 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => openLessonStage(activeLesson, 'watch')}
                  className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pageStage === 'watch'
                      ? 'bg-[#ededed] text-[#141415]'
                      : 'bg-[#141415] border border-white/[0.08] text-[#a1a1a6] hover:text-[#ededed]'
                  }`}
                >
                  <PlayCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Step 1: Watch video
                  {isLessonCompleted && (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${pageStage === 'watch' ? 'text-[#141415]' : 'text-[#4cc38a]'}`}
                      strokeWidth={1.5}
                    />
                  )}
                </button>
                <ArrowRight className="w-3.5 h-3.5 text-[#85858b] shrink-0" strokeWidth={1.5} />
                <button
                  type="button"
                  onClick={() => openLessonStage(activeLesson, 'notes')}
                  className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pageStage === 'notes'
                      ? 'bg-[#ededed] text-[#141415]'
                      : 'bg-[#141415] border border-white/[0.08] text-[#a1a1a6] hover:text-[#ededed]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Step 2: Study notes &amp; code
                </button>
                <ArrowRight className="w-3.5 h-3.5 text-[#85858b] shrink-0" strokeWidth={1.5} />
                <button
                  type="button"
                  onClick={() => openLessonStage(activeLesson, 'quiz')}
                  className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors tabular-nums ${
                    pageStage === 'quiz'
                      ? 'bg-[#ededed] text-[#141415]'
                      : 'bg-[#141415] border border-white/[0.08] text-[#a1a1a6] hover:text-[#ededed]'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Step 3: Solve quiz #{activeLesson.order}
                  {activeQuizRecord?.correct && (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${pageStage === 'quiz' ? 'text-[#141415]' : 'text-[#4cc38a]'}`}
                      strokeWidth={1.5}
                    />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ===================== PAGE 1: WATCH VIDEO ===================== */}
          {pageStage === 'watch' && (
            <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-4 sm:p-5 space-y-4">
              <InLMSVideoPlayer
                key={activeLesson.id}
                lesson={activeLesson}
                isCompleted={isLessonCompleted}
                isDL={isDL}
                onVideoEnded={handleVideoEnded}
              />

              {videoJustFinished && (
                <div className="rounded-xl border border-[#4cc38a]/35 bg-[#4cc38a]/[0.06] p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#ededed]">
                    <CheckCircle2 className="w-4 h-4 text-[#4cc38a] shrink-0" strokeWidth={1.5} />
                    Video finished. Continue to study notes or solve Quiz #{activeLesson.order}.
                  </div>
                  <button
                    type="button"
                    onClick={() => handleWatchNextAction('quiz')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
                  >
                    Solve quiz #{activeLesson.order}
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isCompletingLesson}
                    onClick={() => markLessonWatched(false)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      isLessonCompleted
                        ? 'bg-[#4cc38a]/15 border-[#4cc38a]/35 text-[#4cc38a]'
                        : 'bg-[#222225] hover:bg-[#2a2a2e] border-white/[0.08] text-[#ededed]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                    {isLessonCompleted
                      ? 'Video watched'
                      : isCompletingLesson
                      ? 'Saving...'
                      : 'Mark video watched (+15 XP)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWatchNextAction('notes')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-[#ededed] text-xs font-medium transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
                    Read notes &amp; code
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors tabular-nums"
                >
                  Next: Solve quiz #{activeLesson.order}
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          {/* ===================== PAGE 2: STUDY NOTES & CODE ===================== */}
          {pageStage === 'notes' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 sm:p-6 space-y-5">
                <div className="rounded-xl border border-white/[0.08] border-l-2 border-l-[#e5a00d] bg-[#141415] p-4">
                  <div className="text-xs font-medium text-[#e5a00d] mb-1">
                    Core formula &amp; conceptual anchor
                  </div>
                  <div className="text-sm font-mono text-[#ededed] break-words">
                    <MarkdownRenderer content={activeLesson.key_formula} />
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-sm text-[#a1a1a6]">
                  <MarkdownRenderer content={activeLesson.notes_markdown} />
                </div>

                {activeLesson.code_snippet && (
                  <div className="rounded-xl border border-white/[0.08] bg-[#0f0f10] overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-white/[0.08] bg-[#141415] flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ededed]">
                        <Code2 className="w-3.5 h-3.5 text-[#e5a00d]" strokeWidth={1.5} />
                        Python reference implementation
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySnippet(activeLesson.code_snippet)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
                      >
                        <Copy className="w-3 h-3 text-[#85858b]" strokeWidth={1.5} />
                        Copy code
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-[#ededed] overflow-x-auto leading-relaxed">
                      <code>{activeLesson.code_snippet}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Personal Cloud Notebook */}
              <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-[#ededed] flex items-center gap-2 tabular-nums">
                    <FileEdit className="w-4 h-4 text-[#85858b]" strokeWidth={1.5} />
                    Personal study notes &mdash; Lecture #{activeLesson.order}
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
                    className="px-3 py-1 rounded-md bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#a1a1a6] hover:text-[#ededed] transition-colors"
                  >
                    Insert template
                  </button>
                </div>
                <textarea
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  rows={5}
                  placeholder={`Record your personal notes for "${activeLesson.title}"...`}
                  className="w-full rounded-lg bg-[#141415] border border-white/[0.08] focus:border-[#e5a00d]/60 focus:outline-none p-3.5 text-xs text-[#ededed] placeholder:text-[#85858b] font-mono leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#85858b] font-mono tabular-nums">{draftNote.length} chars</span>
                  <button
                    type="button"
                    disabled={isSavingNote}
                    onClick={handleSaveNotes}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-50 text-[#141415] text-xs font-medium transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {isSavingNote ? 'Saving...' : 'Save notes to cloud'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== PAGE 3: SOLVE QUIZ #X ===================== */}
          {pageStage === 'quiz' && (
            <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 sm:p-7 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#222225] border border-white/[0.08] text-[#ededed] text-xs font-medium tabular-nums">
                  After-video quiz #{activeLesson.order} · {activeLesson.module_title}
                </span>
                {activeQuizRecord && (
                  <span className="text-xs text-[#85858b] tabular-nums">
                    Attempts: {activeQuizRecord.attempts} ·{' '}
                    <strong
                      className={`font-medium ${activeQuizRecord.correct ? 'text-[#4cc38a]' : 'text-[#e5a00d]'}`}
                    >
                      {activeQuizRecord.correct ? 'Passed' : 'Try again'}
                    </strong>
                  </span>
                )}
              </div>

              <h2 className="text-lg font-semibold text-[#ededed] leading-snug">
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
                      className={`w-full text-left p-3.5 rounded-lg border text-sm transition-colors flex items-start gap-3 ${
                        revealCorrect
                          ? 'bg-[#4cc38a]/15 border-[#4cc38a]/60 text-[#ededed]'
                          : revealWrong
                          ? 'bg-[#e5484d]/15 border-[#e5484d]/60 text-[#ededed]'
                          : isSelected
                          ? 'bg-[#222225] border-[#e5a00d]/60 text-[#ededed]'
                          : 'bg-[#141415] border-white/[0.08] text-[#a1a1a6] hover:border-white/[0.16]'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-medium shrink-0 ${
                          isSelected
                            ? 'bg-[#e5a00d] text-[#141415]'
                            : 'bg-[#222225] text-[#85858b]'
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
                  className={`rounded-xl border p-4 text-sm space-y-1.5 ${
                    quizFeedback.correct
                      ? 'bg-[#4cc38a]/[0.08] border-[#4cc38a]/35 text-[#ededed]'
                      : 'bg-[#e5a00d]/[0.08] border-[#e5a00d]/35 text-[#ededed]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {quizFeedback.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-[#4cc38a]" strokeWidth={1.5} />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#e5a00d]" strokeWidth={1.5} />
                    )}
                    {quizFeedback.correct
                      ? `Correct — Lecture #${activeLesson.order} quiz passed.`
                      : 'Review the explanation and select the right option.'}
                  </div>
                  <p className="text-xs leading-relaxed text-[#a1a1a6]">{quizFeedback.explanation}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  disabled={selectedQuizOption === null || isSubmittingLessonQuiz}
                  onClick={handleSubmitLessonQuiz}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-45 text-[#141415] text-xs font-medium transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                  {isSubmittingLessonQuiz ? 'Checking answer...' : 'Check quiz answer (+10 XP)'}
                </button>

                {nextLesson ? (
                  <button
                    type="button"
                    onClick={() => openLessonStage(nextLesson, 'watch')}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                      quizFeedback?.correct || activeQuizRecord?.correct
                        ? 'bg-[#e5a00d] hover:bg-[#f0b024] text-[#141415]'
                        : 'bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-[#ededed]'
                    }`}
                  >
                    Next: Lecture #{nextLesson.order} ({nextLesson.title.slice(0, 26)}...)
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openMilestoneStage('quiz-bank')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e5a00d] hover:bg-[#f0b024] text-[#141415] text-xs font-medium transition-colors"
                  >
                    Next milestone: Practice quiz bank
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ===================== MILESTONE: QUIZ PRACTICE BANK ===================== */}
          {pageStage === 'quiz-bank' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#ededed] tabular-nums">
                    {quizBank.length} comprehension quizzes ({isDL ? '20+ bank' : '100+ bank'})
                  </h2>
                  <p className="text-xs text-[#a1a1a6] mt-1 tabular-nums">
                    Best score: <strong className="font-medium text-[#ededed]">{bestPracticeScore}%</strong> · Grade all modules before capstone &amp; final exam.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="px-3 py-1.5 rounded-lg bg-[#141415] border border-white/[0.08] text-xs text-[#a1a1a6] tabular-nums">
                    Answered:{' '}
                    <span className="font-mono font-medium text-[#ededed]">
                      {Object.keys(practiceAnswers).length}/{quizBank.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPracticeAnswers({});
                      setPracticeResult(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
                    Reset
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingPractice}
                    onClick={handleSubmitPracticeBank}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-50 text-[#141415] text-xs font-medium transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                    {isSubmittingPractice ? 'Grading...' : 'Grade practice submission'}
                  </button>
                </div>
              </div>

              {practiceResult && (
                <div className="rounded-xl border border-[#4cc38a]/35 bg-[#4cc38a]/[0.06] p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-[#e5a00d]" strokeWidth={1.5} />
                    <div>
                      <div className="text-sm font-medium text-[#ededed] tabular-nums">
                        Practice score: {practiceResult.score_percent}% ({practiceResult.correct_count}/
                        {practiceResult.total_answered} correct)
                      </div>
                      <div className="text-xs text-[#a1a1a6] tabular-nums">
                        All-time best score: {practiceResult.best_score}%
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openMilestoneStage('capstone')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
                  >
                    Continue to capstone lab
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors tabular-nums ${
                      practiceModuleFilter === 'ALL'
                        ? 'bg-[#ededed] text-[#141415]'
                        : 'bg-[#19191b] border border-white/[0.08] text-[#85858b] hover:text-[#ededed]'
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors tabular-nums ${
                        practiceModuleFilter === m.id
                          ? 'bg-[#ededed] text-[#141415]'
                          : 'bg-[#19191b] border border-white/[0.08] text-[#85858b] hover:text-[#ededed]'
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
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors tabular-nums ${
                          safePracticePage === idx
                            ? 'bg-[#e5a00d] text-[#141415]'
                            : 'bg-[#19191b] border border-white/[0.08] text-[#85858b] hover:text-[#ededed]'
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
                      className="rounded-xl border border-white/[0.08] bg-[#19191b] p-4 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded bg-[#222225] border border-white/[0.08] text-[#ededed] font-mono tabular-nums">
                            Q#{q.lesson_order} · {q.module_title}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const target = course.lessons.find((l) => l.id === q.lesson_id);
                              if (target) openLessonStage(target, 'watch');
                            }}
                            className="inline-flex items-center gap-1 text-[#e5a00d] hover:underline font-medium"
                          >
                            Review video
                            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                          </button>
                        </div>
                        <h4 className="text-sm font-medium text-[#ededed] leading-snug">{q.question}</h4>
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
                                className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                                  isRight
                                    ? 'bg-[#4cc38a]/15 border-[#4cc38a]/60 text-[#ededed]'
                                    : isWrong
                                    ? 'bg-[#e5484d]/15 border-[#e5484d]/60 text-[#ededed]'
                                    : isPicked
                                    ? 'bg-[#222225] border-[#e5a00d]/60 text-[#ededed]'
                                    : 'bg-[#141415] border-white/[0.08] text-[#a1a1a6] hover:border-white/[0.16]'
                                }`}
                              >
                                <span className="font-mono font-medium mr-2 text-[#85858b]">
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
                          className={`text-xs rounded-lg p-2.5 border ${
                            graded.correct
                              ? 'bg-[#4cc38a]/[0.08] border-[#4cc38a]/30 text-[#ededed]'
                              : 'bg-[#e5484d]/[0.08] border-[#e5484d]/30 text-[#ededed]'
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
                  <div className="rounded-2xl border border-white/[0.08] bg-[#19191b] p-6 sm:p-7 space-y-5">
                    <div>
                      <span className="text-xs font-medium text-[#4cc38a]">
                        Proctored certification exam
                      </span>
                      <h2 className="text-xl font-semibold text-[#ededed] mt-0.5 tracking-tight">
                        {finalExam?.title || `${course.title} — Final Exam`}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#a1a1a6] mt-2 tabular-nums">
                        Pass with &ge;{finalExam?.passing_score || 70}% under active webcam guard to
                        unlock your SHA-256 Vector PDF Certificate and Graduate Goodies Bundle.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-xl bg-[#141415] border border-white/[0.08] p-3">
                        <div className="text-xs text-[#85858b]">Length</div>
                        <div className="text-base font-medium text-[#ededed] tabular-nums">
                          {finalExam?.total_questions || (isDL ? 20 : 35)} Qs
                        </div>
                      </div>
                      <div className="rounded-xl bg-[#141415] border border-white/[0.08] p-3">
                        <div className="text-xs text-[#85858b]">Timer</div>
                        <div className="text-base font-medium text-[#ededed] tabular-nums">
                          {finalExam?.duration_minutes || (isDL ? 30 : 45)} min
                        </div>
                      </div>
                      <div className="rounded-xl bg-[#141415] border border-white/[0.08] p-3">
                        <div className="text-xs text-[#85858b]">Pass score</div>
                        <div className="text-base font-medium text-[#4cc38a] tabular-nums">
                          {finalExam?.passing_score || 70}%
                        </div>
                      </div>
                      <div className="rounded-xl bg-[#141415] border border-white/[0.08] p-3">
                        <div className="text-xs text-[#85858b]">Strike limit</div>
                        <div className="text-base font-medium text-[#e5484d] tabular-nums">3 max</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/[0.06]">
                      <span
                        className={`text-xs font-medium ${
                          cameraReady ? 'text-[#4cc38a]' : 'text-[#e5a00d]'
                        }`}
                      >
                        {cameraReady
                          ? 'Face & object guard verified — Ready to begin'
                          : proctorIntegrity.status !== 'ok' && proctorIntegrity.faceCount !== null
                          ? `${proctorIntegrity.headline}: Center uncovered face in camera to unlock`
                          : 'Enable webcam guard and center your uncovered face in the side panel first'}
                      </span>
                      <button
                        type="button"
                        disabled={!cameraReady}
                        onClick={handleStartExam}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-45 text-[#141415] text-xs font-medium transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                        Start proctored final exam
                      </button>
                    </div>
                  </div>
                )}

                {examPhase === 'active' && finalExam && finalExam.questions.length > 0 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-lg bg-[#141415] border border-white/[0.08] font-mono text-sm font-medium text-[#e5a00d] tabular-nums">
                          {formatCountdown(examRemainingSec)}
                        </span>
                        <span className="text-xs text-[#a1a1a6] font-medium tabular-nums">
                          {Object.keys(examAnswers).length} / {finalExam.questions.length} answered
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={isSubmittingExam}
                        onClick={() => submitFinalExam(false)}
                        className="px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-50 text-[#141415] text-xs font-medium transition-colors"
                      >
                        {isSubmittingExam ? 'Submitting...' : 'Submit final exam'}
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
                          className="relative rounded-xl border border-white/[0.08] bg-[#19191b] p-5 space-y-4 select-none overflow-hidden"
                        >
                          {shieldLocked && (
                            <div className="absolute inset-0 z-20 bg-[#0f0f10]/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 border-2 border-[#e5484d]/50 rounded-xl">
                              <ShieldAlert className="w-8 h-8 text-[#e5484d]" strokeWidth={1.5} />
                              <div className="space-y-1 max-w-md">
                                <div className="text-xs font-mono text-[#e5484d] font-medium tabular-nums">
                                  Anti-cheat shield locked · Strikes {examViolations}/3
                                </div>
                                <h3 className="text-base font-semibold text-[#ededed]">
                                  {proctorIntegrity.headline}
                                </h3>
                                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                                  {proctorIntegrity.reason} Questions remain hidden until your uncovered face is centered cleanly in camera view.
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs tabular-nums">
                            <span className="px-2.5 py-1 rounded-md bg-[#222225] border border-white/[0.08] text-[#ededed] font-mono">
                              Question {examQuestionIdx + 1} / {finalExam.questions.length}
                            </span>
                            <span className="text-[#85858b]">{q.module_title}</span>
                          </div>
                          <h3 className="text-base font-medium text-[#ededed]">{q.question}</h3>
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
                                className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm transition-colors flex items-start gap-3 ${
                                  picked === idx
                                    ? 'bg-[#222225] border-[#e5a00d]/60 text-[#ededed]'
                                    : 'bg-[#141415] border-white/[0.08] text-[#a1a1a6] hover:border-white/[0.16]'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-medium shrink-0 ${
                                    picked === idx
                                      ? 'bg-[#e5a00d] text-[#141415]'
                                      : 'bg-[#222225] text-[#85858b]'
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
                              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] disabled:opacity-40 border border-white/[0.08] text-xs font-medium text-[#ededed]"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
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
                              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white disabled:opacity-40 text-xs font-medium text-[#141415]"
                            >
                              Save &amp; next
                              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-4 flex flex-wrap gap-1.5">
                      {finalExam.questions.map((q, idx) => {
                        const isAnswered = examAnswers[q.id] !== undefined;
                        const isCurrent = idx === examQuestionIdx;
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setExamQuestionIdx(idx)}
                            className={`w-8 h-8 rounded-md text-xs font-mono font-medium border tabular-nums ${
                              isCurrent
                                ? 'bg-[#ededed] border-[#ededed] text-[#141415]'
                                : isAnswered
                                ? 'bg-[#4cc38a]/15 border-[#4cc38a]/35 text-[#4cc38a]'
                                : 'bg-[#141415] border-white/[0.08] text-[#85858b]'
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
                    className={`rounded-2xl border bg-[#19191b] p-6 space-y-5 ${
                      examResult.passed
                        ? 'border-[#4cc38a]/40'
                        : 'border-[#e5484d]/40'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {examResult.passed ? (
                        <Award className="w-8 h-8 text-[#4cc38a] shrink-0" strokeWidth={1.5} />
                      ) : (
                        <ShieldAlert className="w-8 h-8 text-[#e5484d] shrink-0" strokeWidth={1.5} />
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-[#ededed] tabular-nums">
                          {examResult.disqualified
                            ? 'Disqualified — proctoring threshold exceeded'
                            : examResult.passed
                            ? `Passed (${examResult.score_percent}%) — Certificate earned`
                            : `Scored ${examResult.score_percent}% — Review and retry`}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#a1a1a6] mt-1">{examResult.message}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {examResult.passed && (
                        <>
                          <button
                            type="button"
                            onClick={() => openMilestoneStage('reviews')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e5a00d] hover:bg-[#f0b024] text-[#141415] text-xs font-medium transition-colors"
                          >
                            Submit course feedback
                            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openMilestoneStage('certificate')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
                          >
                            View certificate
                            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openMilestoneStage('goodies')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-[#ededed] text-xs font-medium transition-colors"
                          >
                            <Gift className="w-3.5 h-3.5 text-[#85858b]" strokeWidth={1.5} />
                            Claim goodies
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
                        className="px-4 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
                      >
                        Retake exam
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="xl:col-span-4 xl:sticky xl:top-4 order-first xl:order-last">
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

          {/* Bottom Page-by-Page Navigator */}
          <div className="rounded-xl border border-white/[0.08] bg-[#19191b] p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handlePagerPrev}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 shrink-0 text-[#85858b]" strokeWidth={1.5} />
              <span className="truncate">{pagerMeta.prevText.replace(/^←\s*/, '')}</span>
            </button>

            <span className="text-xs font-mono text-[#85858b] text-center hidden md:inline tabular-nums">
              {pagerMeta.label}
            </span>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {pagerMeta.secondaryText && (
                <button
                  type="button"
                  onClick={handlePagerSecondary}
                  className="px-3.5 py-2 rounded-lg bg-[#222225] hover:bg-[#2a2a2e] border border-white/[0.08] text-xs font-medium text-[#ededed] transition-colors text-center"
                >
                  {pagerMeta.secondaryText}
                </button>
              )}
              <button
                type="button"
                onClick={handlePagerNext}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#ededed] hover:bg-white text-[#141415] text-xs font-medium transition-colors"
              >
                <span className="truncate">{pagerMeta.nextText.replace(/\s*→$/, '')}</span>
                <ChevronRight className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
