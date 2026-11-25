import {
  Challenge,
  Submission,
  Assessment,
  AssessmentCompleteResponse,
  Certificate,
  CertificateVerification,
  ChallengeStats,
  AnalyticsSummary,
  LeaderboardUser,
  ExecutionResult,
  User,
  VideoLesson,
  CopilotResponse,
  TestCase,
  MLCourseOverview,
  MLQuizAnswerResponse,
  MLQuizItem,
  MLPracticeQuizResultResponse,
  MLFinalExamResponse,
  MLFinalExamSubmitPayload,
  MLFinalExamResultResponse,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('ctf_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
    window.dispatchEvent(new CustomEvent('ctf:unauthorized'));
  }

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) errorMsg = errJson.detail;
    } catch {
      // Fallback to HTTP status text
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // System health & capabilities
  getHealth: () =>
    request<{
      status: string;
      service: string;
      version: string;
      runtimes?: Record<string, boolean>;
    }>('/health'),

  // Auth
  register: (data: { email: string; password: string; full_name: string }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => request<User>('/auth/me'),

  completeOnboarding: (data: {
    role: string;
    experience: string;
    preferred_languages: string[];
    goals: string[];
  }) =>
    request<User>('/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { current_password: string; new_password: string }) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>(`/auth/forgot-password?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    }),

  updateProfile: (data: Partial<User> & { gemini_api_key?: string }) =>
    request<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Platform stats
  getPlatformStats: () =>
    request<{
      coding_challenges: string;
      active_developers: string;
      successful_submissions: string;
      supported_languages: string;
    }>('/platform-stats'),

  // Challenges
  getChallenges: (params?: {
    search?: string;
    difficulty?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.difficulty) q.append('difficulty', params.difficulty);
    if (params?.category) q.append('category', params.category);
    if (params?.limit !== undefined) q.append('limit', String(params.limit));
    if (params?.offset !== undefined) q.append('offset', String(params.offset));
    return request<Challenge[]>(`/challenges?${q.toString()}`);
  },

  getChallengeStats: () => request<ChallengeStats>('/challenges/stats'),

  getChallenge: (id: string) => request<Challenge>(`/challenges/${id}`),

  createChallenge: (data: Partial<Challenge>) =>
    request<Challenge>('/challenges', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI Task Generator & Copilot
  generateChallenge: (data: {
    topic: string;
    language?: string;
    difficulty?: string;
    problem_type?: string;
    test_case_count?: number;
    time_limit_ms?: number;
    custom_instructions?: string;
    model?: string;
    api_key?: string;
  }) =>
    request<Challenge>('/generate-challenge', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  askCopilot: (data: {
    message: string;
    challenge_id?: string;
    challenge_title?: string;
    challenge_description?: string;
    language: string;
    code: string;
    last_error?: string;
  }) =>
    request<CopilotResponse>('/ai-copilot', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Code Execution
  runCode: (data: {
    language: string;
    code: string;
    test_cases?: TestCase[];
    custom_input?: string;
    challenge_id?: string;
  }) =>
    request<ExecutionResult>('/run-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitSolution: (data: {
    challenge_id: string;
    language: string;
    code: string;
    api_key?: string;
  }) =>
    request<Submission>('/submit-solution', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Submissions
  getSubmissions: () => request<Submission[]>('/submissions'),

  getSubmission: (id: string) => request<Submission>(`/submissions/${id}`),

  // Assessments
  getAssessments: () => request<Assessment[]>('/assessments'),

  getAssessment: (id: string) => request<Assessment>(`/assessments/${id}`),

  createAssessment: (data: {
    title: string;
    description: string;
    duration_minutes: number;
    passing_score: number;
    challenge_ids: string[];
    category?: string;
  }) =>
    request<Assessment>('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completeAssessment: (
    assessmentId: string,
    data: { score: number; solved_challenge_ids: string[]; elapsed_seconds: number }
  ) =>
    request<AssessmentCompleteResponse>(`/assessments/${assessmentId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Analytics & Leaderboard
  getAnalytics: () => request<AnalyticsSummary>('/analytics'),

  getLeaderboard: (period: 'all' | 'weekly' = 'all') =>
    request<LeaderboardUser[]>(`/leaderboard?period=${period}`),

  getCertificates: () => request<Certificate[]>('/certificates'),

  verifyCertificate: (credentialId: string) =>
    request<CertificateVerification>(`/certificates/${encodeURIComponent(credentialId)}/verify`),

  downloadCertificatePdf: async (credentialId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/certificates/${encodeURIComponent(credentialId)}/pdf`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!response.ok) {
      let msg = `Failed to generate PDF (HTTP ${response.status})`;
      try {
        const err = await response.json();
        if (err.detail) msg = err.detail;
      } catch {
        // fallback message
      }
      throw new Error(msg);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CodingTaskFactory-${credentialId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  // Video Masterclasses
  getVideos: (params?: { search?: string; category?: string; difficulty?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.category) q.append('category', params.category);
    if (params?.difficulty) q.append('difficulty', params.difficulty);
    return request<VideoLesson[]>(`/videos?${q.toString()}`);
  },

  getVideo: (id: string) => request<VideoLesson>(`/videos/${id}`),

  // Parameterized LMS Course Client (supports both ML 106-video and Stanford X CTF DL 21-video)
  courseLms: (track: 'ml' | 'dl') => createCourseClient(track === 'dl' ? '/dl-course' : '/ml-course'),

  // Machine Learning 106-Video Full LMS (direct convenience aliases)
  getMLCourseOverview: () => createCourseClient('/ml-course').getOverview(),

  completeMLLesson: (lessonId: string) => createCourseClient('/ml-course').completeLesson(lessonId),

  saveMLLessonNotes: (lessonId: string, notes: string) =>
    createCourseClient('/ml-course').saveLessonNotes(lessonId, notes),

  submitMLLessonQuiz: (lessonId: string, selectedIndex: number) =>
    createCourseClient('/ml-course').submitLessonQuiz(lessonId, selectedIndex),

  getMLQuizBank: () => createCourseClient('/ml-course').getQuizBank(),

  submitMLQuizBank: (answers: Record<string, number>) =>
    createCourseClient('/ml-course').submitQuizBank(answers),

  getMLFinalExam: () => createCourseClient('/ml-course').getFinalExam(),

  submitMLFinalExam: (payload: MLFinalExamSubmitPayload) =>
    createCourseClient('/ml-course').submitFinalExam(payload),
};

function createCourseClient(basePath: '/ml-course' | '/dl-course') {
  return {
    getOverview: () => request<MLCourseOverview>(basePath),

    completeLesson: (lessonId: string) =>
      request<{
        lesson_id: string;
        completed_lessons: string[];
        points_awarded: number;
        total_points: number;
      }>(`${basePath}/lessons/${encodeURIComponent(lessonId)}/complete`, {
        method: 'POST',
      }),

    saveLessonNotes: (lessonId: string, notes: string) =>
      request<{
        lesson_id: string;
        saved: boolean;
        lesson_notes: Record<string, string>;
      }>(`${basePath}/lessons/${encodeURIComponent(lessonId)}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      }),

    submitLessonQuiz: (lessonId: string, selectedIndex: number) =>
      request<MLQuizAnswerResponse>(`${basePath}/lessons/${encodeURIComponent(lessonId)}/quiz`, {
        method: 'POST',
        body: JSON.stringify({ selected_index: selectedIndex }),
      }),

    getQuizBank: () => request<{ total: number; questions: MLQuizItem[] }>(`${basePath}/quiz-bank`),

    submitQuizBank: (answers: Record<string, number>) =>
      request<MLPracticeQuizResultResponse>(`${basePath}/quiz-bank/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }),

    getFinalExam: () => request<MLFinalExamResponse>(`${basePath}/final-exam`),

    submitFinalExam: (payload: MLFinalExamSubmitPayload) =>
      request<MLFinalExamResultResponse>(`${basePath}/final-exam/submit`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  };
}
