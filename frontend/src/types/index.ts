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
