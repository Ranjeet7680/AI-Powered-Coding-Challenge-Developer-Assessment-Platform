from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict
import datetime


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Optional[str] = "Developer"
    experience: Optional[str] = "Intermediate"
    preferred_languages: Optional[List[str]] = []
    goals: Optional[List[str]] = []
    avatar_url: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UserOnboardingUpdate(BaseModel):
    role: str
    experience: str
    preferred_languages: List[str]
    goals: List[str]


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    experience: Optional[str] = None
    preferred_languages: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    gemini_api_key: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: str
    experience: str
    preferred_languages: List[str]
    goals: List[str]
    avatar_url: Optional[str] = None
    points: int
    streak: int
    solved_count: int
    has_completed_onboarding: bool
    has_gemini_api_key: bool = False
    gemini_api_key_preview: Optional[str] = None
    created_at: datetime.datetime


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


# Challenge Schemas
class TestCaseSchema(BaseModel):
    input: str
    expected_output: str
    is_hidden: bool = False


class ExampleSchema(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = ""


class ComplexitySchema(BaseModel):
    time: str = "O(N)"
    space: str = "O(1)"


class ChallengeCreate(BaseModel):
    title: str
    description: str
    difficulty: str
    category: str
    problem_type: Optional[str] = "Algorithm"
    time_limit_ms: Optional[int] = 2000
    memory_limit_mb: Optional[int] = 256
    constraints: List[str] = []
    input_format: Optional[str] = ""
    output_format: Optional[str] = ""
    examples: List[ExampleSchema] = []
    starter_code: Dict[str, str] = {}
    test_cases: List[TestCaseSchema] = []
    hints: List[str] = []
    expected_complexity: Optional[ComplexitySchema] = None
    tags: List[str] = []
    is_ai_generated: bool = False


class ChallengeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    slug: str
    description: str
    difficulty: str
    category: str
    problem_type: str
    time_limit_ms: int
    memory_limit_mb: int
    constraints: List[str]
    input_format: Optional[str] = ""
    output_format: Optional[str] = ""
    examples: List[ExampleSchema]
    starter_code: Dict[str, str]
    test_cases: List[TestCaseSchema]
    hints: List[str]
    expected_complexity: Dict[str, Any]
    is_ai_generated: bool
    tags: List[str]
    acceptance_rate: float
    total_submissions: int
    created_at: datetime.datetime


# AI Generation & Copilot Schemas
class GenerateChallengeRequest(BaseModel):
    topic: str
    language: str = "python"
    difficulty: str = "Medium"
    problem_type: str = "Algorithm"
    test_case_count: int = 5
    time_limit_ms: int = 2000
    custom_instructions: Optional[str] = ""
    model: Optional[str] = "gemini-2.0-flash"
    api_key: Optional[str] = None


class CopilotRequest(BaseModel):
    message: str
    challenge_id: Optional[str] = None
    challenge_title: Optional[str] = None
    challenge_description: Optional[str] = None
    language: str = "python"
    code: str = ""
    last_error: Optional[str] = None
    api_key: Optional[str] = None


class CopilotResponse(BaseModel):
    reply: str
    source: str = "heuristic"


# Code Execution & Submission Schemas
class RunCodeRequest(BaseModel):
    language: str
    code: str
    test_cases: List[TestCaseSchema] = []
    custom_input: Optional[str] = None
    challenge_id: Optional[str] = None


class TestCaseResult(BaseModel):
    test_case_index: int
    input: str
    expected_output: str
    actual_output: str
    passed: bool
    runtime_ms: int
    is_hidden: bool
    error: Optional[str] = None


class RunCodeResponse(BaseModel):
    status: str  # "Accepted", "Wrong Answer", "Runtime Error", "Compilation Error", "Time Limit Exceeded"
    stdout: str
    stderr: str
    runtime_ms: int
    memory_mb: float
    passed_count: int
    total_count: int
    test_results: List[TestCaseResult]
    ai_feedback: Optional[Dict[str, Any]] = None


class SubmitCodeRequest(BaseModel):
    challenge_id: str
    language: str
    code: str
    api_key: Optional[str] = None


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    challenge_id: str
    challenge_title: Optional[str] = None
    language: str
    code: str
    status: str
    runtime_ms: int
    memory_mb: float
    score: int
    test_cases_passed: int
    total_test_cases: int
    test_results: List[TestCaseResult]
    ai_feedback: Dict[str, Any]
    created_at: datetime.datetime


# Assessment Schemas
class AssessmentCreate(BaseModel):
    title: str
    description: str
    duration_minutes: int = 60
    passing_score: int = 70
    challenge_ids: List[str]
    category: str = "Technical Assessment"


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    duration_minutes: int
    passing_score: int
    challenge_ids: List[str]
    is_active: bool
    category: str
    candidates_count: int
    created_at: datetime.datetime


class AssessmentCompleteRequest(BaseModel):
    score: int
    solved_challenge_ids: List[str] = []
    elapsed_seconds: int = 0


class AssessmentCompleteResponse(BaseModel):
    assessment_id: str
    score: int
    passed: bool
    certificate: Optional["CertificateResponse"] = None


# Certificate Schemas
class CertificateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    recipient_name: str
    issue_date: datetime.datetime
    credential_id: str
    badge_icon: str
    category: str
    grade: str
    issuer_name: str = "Coding Task Factory Academy"
    signatory_name: str = "Dr. Aris Thorne"
    signatory_title: str = "Chief Curriculum Architect"
    score_percent: int = 98
    skills_verified: List[str] = []
    challenges_completed: int = 12
    completion_hours: int = 24
    summary: str = ""
    credential_hash: Optional[str] = None


class CertificateVerifyResponse(CertificateResponse):
    verified: bool = True
    verification_url: str
    platform: str = "Coding Task Factory"


# Analytics Schemas
class AnalyticsSummary(BaseModel):
    total_challenges_solved: int
    success_rate: float
    current_streak: int
    total_points: int
    global_rank: int
    weekly_activity: List[Dict[str, Any]]
    difficulty_breakdown: Dict[str, int]
    language_breakdown: Dict[str, int]
    skills_radar: List[Dict[str, Any]]


# Video Schemas
class VideoLessonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    slug: str
    description: str
    video_url: str
    thumbnail_url: str
    duration_minutes: int
    duration_label: Optional[str] = None
    category: str
    difficulty: str
    instructor: str
    instructor_avatar: Optional[str] = None
    related_challenge_id: Optional[str] = None
    playlist_id: Optional[str] = None
    playlist_title: Optional[str] = None
    episode_order: Optional[int] = None
    chapters: List[Dict[str, Any]] = []
    key_takeaways: List[str] = []
    code_snippet: Optional[str] = None
    views_count: int
    created_at: Optional[datetime.datetime] = None


class VideoPlaylistSummaryResponse(BaseModel):
    playlist_id: str
    title: str
    channel: str
    category: str
    difficulty: str
    video_count: int
    first_video_id: Optional[str] = None
    thumbnail_url: str


class VideoWatchContextResponse(BaseModel):
    video: VideoLessonResponse
    series: Optional[VideoPlaylistSummaryResponse] = None
    series_videos: List[VideoLessonResponse] = []
    prev_video: Optional[VideoLessonResponse] = None
    next_video: Optional[VideoLessonResponse] = None
    platform_share_path: str


# ML LMS Course Schemas
class MLQuizAnswerRequest(BaseModel):
    selected_index: int


class MLQuizAnswerResponse(BaseModel):
    lesson_id: str
    quiz_id: str
    correct: bool
    correct_index: int
    explanation: str
    points_awarded: int = 0


class MLLessonNoteUpdate(BaseModel):
    notes: str


class MLPracticeQuizSubmitRequest(BaseModel):
    answers: Dict[str, int]


class MLPracticeQuizResultResponse(BaseModel):
    total_answered: int
    total_questions: int
    correct_count: int
    score_percent: int
    best_score: int
    details: List[Dict[str, Any]] = []


class MLFinalExamSubmitRequest(BaseModel):
    answers: Dict[str, int]
    violations: int = 0
    violation_log: List[Dict[str, Any]] = []
    elapsed_seconds: int = 0
    camera_verified: bool = False
    auto_terminated: bool = False


class MLFinalExamResultResponse(BaseModel):
    score_percent: int
    correct_count: int
    total_questions: int
    passed: bool
    disqualified: bool = False
    violations: int
    message: str
    certificate: Optional[CertificateResponse] = None


class CapstoneSubmitRequest(BaseModel):
    project_id: str
    title: str
    repo_url: Optional[str] = ""
    demo_url: Optional[str] = ""
    architecture_notes: str
    code_submission: Optional[str] = ""


class CapstoneSubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    user_id: str
    project_id: str
    title: str
    repo_url: str = ""
    demo_url: str = ""
    architecture_notes: str
    code_submission: str = ""
    rubric_scores: Dict[str, int] = {}
    overall_score: int
    status: str
    ai_feedback: str
    points_awarded: int = 0
    created_at: datetime.datetime


class CourseReviewCreateRequest(BaseModel):
    rating: int
    headline: str
    comment: str
    content_rating: int = 5
    quiz_rating: int = 5
    nps_score: int = 10
    improvement_suggestion: str = ""


class CourseReviewItem(BaseModel):
    id: str
    course_id: str
    author_name: str
    author_role: str
    rating: int
    content_rating: int = 5
    quiz_rating: int = 5
    nps_score: int = 10
    improvement_suggestion: str = ""
    headline: str
    comment: str
    verified_learner: bool = False
    helpful_count: int = 0
    viewer_has_voted: bool = False
    is_own_review: bool = False
    created_at: datetime.datetime


class CourseReviewsOverviewResponse(BaseModel):
    course_id: str
    average_rating: float
    total_reviews: int
    rating_breakdown: Dict[str, int]
    reviews: List[CourseReviewItem]


class CourseGoodiesClaimRequest(BaseModel):
    full_name: str
    email: str
    phone: str = ""
    tshirt_size: str = "L"
    swag_bundle: str
    address_line: str
    city: str
    state: str = ""
    postal_code: str
    country: str
    linkedin_url: str = ""
    notes: str = ""


class CourseGoodiesClaimResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    dispatch_code: str
    full_name: str
    email: str
    phone: str = ""
    tshirt_size: str = "L"
    swag_bundle: str
    address_line: str
    city: str
    state: str = ""
    postal_code: str
    country: str
    linkedin_url: str = ""
    notes: str = ""
    status: str
    points_awarded: int = 0
    created_at: datetime.datetime


AssessmentCompleteResponse.model_rebuild()
