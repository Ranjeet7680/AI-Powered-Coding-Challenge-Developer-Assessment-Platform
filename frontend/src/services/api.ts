import { Challenge, Submission, Assessment, Certificate, AnalyticsSummary, LeaderboardUser, ExecutionResult, User, VideoLesson } from '../types';

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

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) errorMsg = errJson.detail;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
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

  loginWithGoogle: () =>
    request<{ token: string; user: User }>('/auth/google', {
      method: 'POST',
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

  forgotPassword: (email: string) =>
    request<{ message: string }>(`/auth/forgot-password?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    }),

  updateProfile: (data: Partial<User>) =>
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
  getChallenges: (params?: { search?: string; difficulty?: string; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.difficulty) q.append('difficulty', params.difficulty);
    if (params?.category) q.append('category', params.category);
    return request<Challenge[]>(`/challenges?${q.toString()}`);
  },

  getChallenge: (id: string) => request<Challenge>(`/challenges/${id}`),

  createChallenge: (data: Partial<Challenge>) =>
    request<Challenge>('/challenges', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI Task Generator
  generateChallenge: (data: {
    topic: string;
    language?: string;
    difficulty?: string;
    problem_type?: string;
    test_case_count?: number;
    time_limit_ms?: number;
    custom_instructions?: string;
    api_key?: string;
  }) =>
    request<Challenge>('/generate-challenge', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Code Execution
  runCode: (data: {
    language: string;
    code: string;
    test_cases?: any[];
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

  // Analytics & Leaderboard
  getAnalytics: () => request<AnalyticsSummary>('/analytics'),

  getLeaderboard: () => request<LeaderboardUser[]>('/leaderboard'),

  getCertificates: () => request<Certificate[]>('/certificates'),

  // Video Masterclasses
  getVideos: (params?: { search?: string; category?: string; difficulty?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.category) q.append('category', params.category);
    if (params?.difficulty) q.append('difficulty', params.difficulty);
    return request<VideoLesson[]>(`/videos?${q.toString()}`);
  },

  getVideo: (id: string) => request<VideoLesson>(`/videos/${id}`),
};
