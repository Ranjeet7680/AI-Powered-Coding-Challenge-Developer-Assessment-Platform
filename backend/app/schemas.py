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
    category: str
    difficulty: str
    instructor: str
    instructor_avatar: Optional[str] = None
    related_challenge_id: Optional[str] = None
    chapters: List[Dict[str, Any]] = []
    key_takeaways: List[str] = []
    code_snippet: Optional[str] = None
    views_count: int
    created_at: datetime.datetime


AssessmentCompleteResponse.model_rebuild()
