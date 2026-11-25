export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  experience: string;
  preferred_languages: string[];
  goals: string[];
  avatar_url?: string;
  points: number;
  streak: number;
  solved_count: number;
  has_completed_onboarding: boolean;
  has_gemini_api_key?: boolean;
  gemini_api_key_preview?: string | null;
  created_at?: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expected_output: string;
  is_hidden?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  category: string;
  problem_type: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  constraints: string[];
  input_format?: string;
  output_format?: string;
  examples: Example[];
  starter_code: Record<string, string>;
  test_cases: TestCase[];
  hints: string[];
  expected_complexity: {
    time: string;
    space: string;
  };
  is_ai_generated: boolean;
  tags: string[];
  acceptance_rate: number;
  total_submissions: number;
  created_at?: string;
}

export interface TestCaseResult {
  test_case_index: number;
  input: string;
  expected_output: string;
  actual_output: string;
  passed: boolean;
  runtime_ms: number;
  is_hidden: boolean;
  error?: string;
}

export interface ExecutionResult {
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded';
  stdout: string;
  stderr: string;
  runtime_ms: number;
  memory_mb: number;
  passed_count: number;
  total_count: number;
  test_results: TestCaseResult[];
  ai_feedback?: AIFeedback;
}

export interface AIFeedback {
  overall_score: number;
  summary: string;
  time_complexity: string;
  space_complexity: string;
  cleanliness_score: number;
  efficiency_score: number;
  highlights: string[];
  suggestions: string[];
  security_assessment: string;
}

export interface Submission {
  id: string;
  user_id: string;
  challenge_id: string;
  challenge_title?: string;
  language: string;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded';
  runtime_ms: number;
  memory_mb: number;
  score: number;
  test_cases_passed: number;
  total_test_cases: number;
  test_results: TestCaseResult[];
  ai_feedback: AIFeedback;
  created_at: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  passing_score: number;
  challenge_ids: string[];
  is_active: boolean;
  category: string;
  candidates_count: number;
  created_at?: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  recipient_name: string;
  issue_date: string;
  credential_id: string;
  badge_icon: string;
  category: string;
  grade: string;
  issuer_name?: string;
  signatory_name?: string;
  signatory_title?: string;
  score_percent?: number;
  skills_verified?: string[];
  challenges_completed?: number;
  completion_hours?: number;
  summary?: string;
  credential_hash?: string | null;
}

export interface CertificateVerification extends Certificate {
  verified: boolean;
  verification_url: string;
  platform: string;
}

export interface ChallengeStats {
  total: number;
  by_difficulty: Record<string, number>;
  by_category: Record<string, number>;
}

export interface AssessmentCompleteResponse {
  assessment_id: string;
  score: number;
  passed: boolean;
  certificate?: Certificate | null;
}

export interface AnalyticsSummary {
  total_challenges_solved: number;
  success_rate: number;
  current_streak: number;
  total_points: number;
  global_rank: number;
  weekly_activity: { day: string; submissions: number; solved: number; score: number }[];
  difficulty_breakdown: Record<string, number>;
  language_breakdown: Record<string, number>;
  skills_radar: { subject: string; score: number; fullMark: number }[];
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  role: string;
  points: number;
  solved: number;
  streak: number;
  badge: string;
  win_rate: string;
  is_current_user?: boolean;
}

export interface VideoChapter {
  title: string;
  time: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_minutes: number;
  category: string;
  difficulty: string;
  instructor: string;
  instructor_avatar?: string;
  related_challenge_id?: string;
  chapters: VideoChapter[];
  key_takeaways: string[];
  code_snippet?: string;
  views_count: number;
  created_at?: string;
}

export interface CopilotResponse {
  reply: string;
  source: string;
}

export interface MLModuleInfo {
  id: string;
  order: number;
  title: string;
  lesson_start: number;
  lesson_end: number;
  lesson_count: number;
}

export interface MLQuizItem {
  id: string;
  lesson_id: string;
  lesson_order: number;
  lesson_title: string;
  module_id: string;
  module_title: string;
  question: string;
  options: string[];
  correct_index?: number;
  explanation?: string;
  exam_number?: number;
}

export interface MLLessonItem {
  id: string;
  order: number;
  video_id: string;
  title: string;
  module_id: string;
  module_order: number;
  module_title: string;
  difficulty: string;
  duration_label: string;
  duration_minutes: number;
  video_url: string;
  youtube_watch_url: string;
  thumbnail_url: string;
  notes_markdown: string;
  key_formula: string;
  code_snippet: string;
  quiz: MLQuizItem;
}

export interface MLQuizResultRecord {
  selected: number;
  correct: boolean;
  last_correct?: boolean;
  attempts: number;
}

export interface MLCourseProgressData {
  completed_lessons: string[];
  lesson_notes: Record<string, string>;
  quiz_results: Record<string, MLQuizResultRecord>;
  practice_quiz_best_score: number;
  final_exam_score: number | null;
  final_exam_passed: boolean;
  final_exam_violations: number;
}

export interface MLCourseOverview {
  id: string;
  title: string;
  playlist_id: string;
  playlist_url: string;
  instructor: string;
  total_lessons: number;
  total_quizzes: number;
  modules: MLModuleInfo[];
  lessons: MLLessonItem[];
  progress: MLCourseProgressData | null;
}

export interface MLQuizAnswerResponse {
  lesson_id: string;
  quiz_id: string;
  correct: boolean;
  correct_index: number;
  explanation: string;
  points_awarded: number;
}

export interface MLPracticeQuizResultDetail {
  quiz_id: string;
  lesson_id: string;
  selected: number;
  correct_index: number;
  correct: boolean;
  explanation: string;
}

export interface MLPracticeQuizResultResponse {
  total_answered: number;
  total_questions: number;
  correct_count: number;
  score_percent: number;
  best_score: number;
  details: MLPracticeQuizResultDetail[];
}

export interface MLFinalExamResponse {
  exam_id: string;
  title: string;
  total_questions: number;
  duration_minutes: number;
  passing_score: number;
  max_violations_allowed: number;
  proctoring_required: boolean;
  candidate: string;
  questions: MLQuizItem[];
}

export interface MLViolationEvent {
  timestamp: string;
  type: string;
  detail: string;
}

export interface MLFinalExamSubmitPayload {
  answers: Record<string, number>;
  violations: number;
  violation_log: MLViolationEvent[];
  elapsed_seconds: number;
  camera_verified: boolean;
  auto_terminated: boolean;
}

export interface MLFinalExamResultResponse {
  score_percent: number;
  correct_count: number;
  total_questions: number;
  passed: boolean;
  disqualified: boolean;
  violations: number;
  message: string;
  certificate?: Certificate | null;
}
