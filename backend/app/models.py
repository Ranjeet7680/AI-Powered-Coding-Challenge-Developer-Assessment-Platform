import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, nullable=False)
    role = Column(String, default="Developer")  # Student, Developer, Educator, Recruiter
    experience = Column(String, default="Intermediate")  # Beginner, Intermediate, Advanced, Expert
    preferred_languages = Column(JSON, default=list)  # ["Python", "JavaScript", ...]
    goals = Column(JSON, default=list)  # ["Improve problem-solving", "Prepare for interviews", ...]
    avatar_url = Column(String, nullable=True)
    points = Column(Integer, default=1250)
    streak = Column(Integer, default=7)
    solved_count = Column(Integer, default=14)
    has_completed_onboarding = Column(Boolean, default=False)
    gemini_api_key = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    submissions = relationship("Submission", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String, default="Medium")  # Easy, Medium, Hard, Expert
    category = Column(String, default="Algorithms")  # Algorithms, Data Structures, System Design, Bug Fix
    problem_type = Column(String, default="Algorithm")
    time_limit_ms = Column(Integer, default=2000)
    memory_limit_mb = Column(Integer, default=256)
    constraints = Column(JSON, default=list)  # List of constraint strings
    input_format = Column(Text, nullable=True)
    output_format = Column(Text, nullable=True)
    examples = Column(JSON, default=list)  # List of {input, output, explanation}
    starter_code = Column(JSON, default=dict)  # {"python": "...", "javascript": "...", "typescript": "...", "cpp": "..."}
    test_cases = Column(JSON, default=list)  # List of {input: "...", expected_output: "...", is_hidden: bool}
    hints = Column(JSON, default=list)  # List of hint strings
    expected_complexity = Column(JSON, default=dict)  # {"time": "O(N)", "space": "O(1)"}
    is_ai_generated = Column(Boolean, default=False)
    tags = Column(JSON, default=list)
    author_id = Column(String, nullable=True)
    acceptance_rate = Column(Float, default=68.5)
    total_submissions = Column(Integer, default=120)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    submissions = relationship("Submission", back_populates="challenge")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(String, ForeignKey("challenges.id"), nullable=False)
    language = Column(String, nullable=False)
    code = Column(Text, nullable=False)
    status = Column(String, default="Accepted")  # Accepted, Wrong Answer, Time Limit Exceeded, Runtime Error
    runtime_ms = Column(Integer, default=24)
    memory_mb = Column(Float, default=14.2)
    score = Column(Integer, default=100)
    test_cases_passed = Column(Integer, default=5)
    total_test_cases = Column(Integer, default=5)
    test_results = Column(JSON, default=list)
    ai_feedback = Column(JSON, default=dict)  # { "summary": "...", "time_complexity": "...", "suggestions": [...] }
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="submissions")
    challenge = relationship("Challenge", back_populates="submissions")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    duration_minutes = Column(Integer, default=60)
    passing_score = Column(Integer, default=70)
    challenge_ids = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    category = Column(String, default="Technical Assessment")
    candidates_count = Column(Integer, default=42)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    recipient_name = Column(String, nullable=False)
    issue_date = Column(DateTime, default=datetime.datetime.utcnow)
    credential_id = Column(String, unique=True, nullable=False)
    badge_icon = Column(String, default="Award")
    category = Column(String, default="Algorithm Mastery")
    grade = Column(String, default="Distinction (98%)")
    issuer_name = Column(String, default="Coding Task Factory Academy")
    signatory_name = Column(String, default="Dr. Aris Thorne")
    signatory_title = Column(String, default="Chief Curriculum Architect")
    score_percent = Column(Integer, default=98)
    skills_verified = Column(JSON, default=list)
    challenges_completed = Column(Integer, default=12)
    completion_hours = Column(Integer, default=24)
    summary = Column(
        Text,
        default="Verified mastery across algorithmic problem solving, production complexity analysis, and automated multi-language test suites.",
    )
    credential_hash = Column(String, nullable=True)

    user = relationship("User", back_populates="certificates")

class VideoLesson(Base):
    __tablename__ = "video_lessons"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    video_url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=False)
    duration_minutes = Column(Integer, default=15)
    category = Column(String, default="Machine Learning")  # Machine Learning, Algorithms, System Design, Data Structures
    difficulty = Column(String, default="Intermediate")
    instructor = Column(String, default="Dr. Aris Thorne")
    instructor_avatar = Column(String, nullable=True)
    related_challenge_id = Column(String, nullable=True)
    chapters = Column(JSON, default=list)  # [{"title": "Intuition", "time": "00:00"}]
    key_takeaways = Column(JSON, default=list)
    code_snippet = Column(Text, nullable=True)
    views_count = Column(Integer, default=1420)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

