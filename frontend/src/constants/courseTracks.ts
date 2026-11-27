export type CourseTrack = 'ml' | 'dl' | 'ds' | 'biz' | 'agentic';

export const COURSE_TRACK_ORDER: readonly CourseTrack[] = [
  'ml',
  'dl',
  'ds',
  'biz',
  'agentic',
] as const;

export interface CourseTrackMeta {
  track: CourseTrack;
  shortLabel: string;
  switcherLabel: string;
  eyebrowLabel: string;
  hubCategoryTag: string;
  hubBadgeText: string;
  cardTitle: string;
  cardSummary: string;
  apiBasePath: '/ml-course' | '/dl-course' | '/ds-course' | '/biz-course' | '/agentic-course';
  learnBasePath: string;
  lmsDetailPath: string;
  defaultLessonId: string;
  defaultThumbnail: string;
  lectureCount: number;
  quizBankLabel: string;
  quizBankShort: string;
  searchPlaceholder: string;
  defaultExamQuestions: number;
  defaultExamMinutes: number;
  accentDot: boolean;
}

export const COURSE_TRACK_META: Record<CourseTrack, CourseTrackMeta> = {
  ml: {
    track: 'ml',
    shortLabel: 'ML course',
    switcherLabel: 'ML (106)',
    eyebrowLabel: 'Engineering Academy',
    hubCategoryTag: 'Applied Machine Learning · Engineering LMS',
    hubBadgeText: '106 videos · 100+ quizzes · Camera proctored',
    cardTitle: 'Complete Machine Learning LMS',
    cardSummary: 'Full StatQuest 106-video sequence with study notes, capstones, and verified certificate.',
    apiBasePath: '/ml-course',
    learnBasePath: '/app/ml-course',
    lmsDetailPath: '/app/lms/ml',
    defaultLessonId: 'ml-001',
    defaultThumbnail: '/thumbnails/ml-ctf-course-thumbnail.svg',
    lectureCount: 106,
    quizBankLabel: '100+ practice quiz bank',
    quizBankShort: '100+ bank',
    searchPlaceholder: 'Find lecture (PCA, XGB, GPT)...',
    defaultExamQuestions: 35,
    defaultExamMinutes: 45,
    accentDot: false,
  },
  dl: {
    track: 'dl',
    shortLabel: 'Stanford DL',
    switcherLabel: 'Stanford DL (21)',
    eyebrowLabel: 'Stanford × Coding Task Factory',
    hubCategoryTag: 'Stanford CS229 × Coding Task Factory',
    hubBadgeText: '21 videos · 20+ quizzes · Camera proctored',
    cardTitle: 'Stanford × CTF Deep Learning',
    cardSummary: 'CNNs, Transformers, Sequence Models, camera-proctored final exam, and verified certificate.',
    apiBasePath: '/dl-course',
    learnBasePath: '/app/dl-course',
    lmsDetailPath: '/app/lms/dl',
    defaultLessonId: 'dl-001',
    defaultThumbnail: '/thumbnails/stanford-ctf-dl-thumbnail.svg',
    lectureCount: 21,
    quizBankLabel: '20+ practice quiz bank',
    quizBankShort: '20+ bank',
    searchPlaceholder: 'Find lecture (GLM, SVM, EM)...',
    defaultExamQuestions: 20,
    defaultExamMinutes: 30,
    accentDot: true,
  },
  ds: {
    track: 'ds',
    shortLabel: 'Data Science',
    switcherLabel: 'Data Science (14)',
    eyebrowLabel: 'Python Data Science & Big Data',
    hubCategoryTag: 'Python Data Science & Big Data',
    hubBadgeText: '14 videos · 14 quizzes · Camera proctored',
    cardTitle: 'Python Data Science & Big Data',
    cardSummary: 'Jupyter Notebook, vectorized NumPy, Pandas ETL merges, CSV/JSON, and Matplotlib charts.',
    apiBasePath: '/ds-course',
    learnBasePath: '/app/ds-course',
    lmsDetailPath: '/app/lms/ds',
    defaultLessonId: 'ds-001',
    defaultThumbnail: '/thumbnails/ds-ctf-course-thumbnail.svg',
    lectureCount: 14,
    quizBankLabel: '14 practice quiz bank',
    quizBankShort: '14 quiz bank',
    searchPlaceholder: 'Find lecture (NumPy, Pandas, CSV)...',
    defaultExamQuestions: 14,
    defaultExamMinutes: 25,
    accentDot: true,
  },
  biz: {
    track: 'biz',
    shortLabel: 'IITM Business',
    switcherLabel: 'IITM Business (66)',
    eyebrowLabel: 'IIT Madras × Coding Task Factory',
    hubCategoryTag: 'IIT Madras × CTF · Entrepreneurship',
    hubBadgeText: '66 videos · 66 quizzes · Camera proctored',
    cardTitle: 'Business Fundamentals for Entrepreneurs',
    cardSummary: 'Pricing elasticity, Bayes, VIF regression, DEA efficiency frontiers, and conjoint strategy.',
    apiBasePath: '/biz-course',
    learnBasePath: '/app/biz-course',
    lmsDetailPath: '/app/lms/biz',
    defaultLessonId: 'biz-001',
    defaultThumbnail: '/thumbnails/iitm-ctf-biz-thumbnail.svg',
    lectureCount: 66,
    quizBankLabel: '66 practice quiz bank',
    quizBankShort: '66 quiz bank',
    searchPlaceholder: 'Find lecture (Elasticity, DEA, Conjoint)...',
    defaultExamQuestions: 30,
    defaultExamMinutes: 40,
    accentDot: true,
  },
  agentic: {
    track: 'agentic',
    shortLabel: 'Agentic AI',
    switcherLabel: 'Agentic AI (23)',
    eyebrowLabel: 'Autonomous Agents & MCP Engineering',
    hubCategoryTag: 'Agentic AI, LangGraph & MCP Systems',
    hubBadgeText: '23 videos · 23 quizzes · Camera proctored',
    cardTitle: 'Agentic AI & MCP Engineering',
    cardSummary: 'Q-learning agents, LangGraph, CrewAI, Agno RAG, custom cloud MCP servers, and OpenAI Agents SDK.',
    apiBasePath: '/agentic-course',
    learnBasePath: '/app/agentic-course',
    lmsDetailPath: '/app/lms/agentic',
    defaultLessonId: 'agentic-001',
    defaultThumbnail: '/thumbnails/agentic-ctf-course-thumbnail.svg',
    lectureCount: 23,
    quizBankLabel: '23 practice quiz bank',
    quizBankShort: '23 quiz bank',
    searchPlaceholder: 'Find lecture (LangGraph, CrewAI, MCP)...',
    defaultExamQuestions: 20,
    defaultExamMinutes: 30,
    accentDot: true,
  },
};

export function resolveCourseTrack(raw?: string): CourseTrack {
  if (raw && raw in COURSE_TRACK_META) {
    return raw as CourseTrack;
  }
  return 'ml';
}
