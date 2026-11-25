from fastapi import APIRouter, Depends, HTTPException
from ..schemas import GenerateChallengeRequest, CopilotRequest, CopilotResponse
from ..services.gemini_service import generate_challenge_with_gemini, generate_copilot_reply
from ..models import User
from .auth import get_current_user

router = APIRouter(tags=["AI Generator & Copilot"])


@router.post("/api/generate-challenge")
def generate_challenge(
    payload: GenerateChallengeRequest,
    user: User = Depends(get_current_user),
):
    try:
        effective_key = payload.api_key or user.gemini_api_key
        return generate_challenge_with_gemini(
            topic=payload.topic,
            language=payload.language,
            difficulty=payload.difficulty,
            problem_type=payload.problem_type,
            test_case_count=payload.test_case_count,
            time_limit_ms=payload.time_limit_ms,
            custom_instructions=payload.custom_instructions or "",
            model=payload.model or "gemini-2.0-flash",
            api_key=effective_key,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate challenge: {str(e)}")


@router.post("/api/ai-copilot", response_model=CopilotResponse)
def ask_copilot(
    payload: CopilotRequest,
    user: User = Depends(get_current_user),
):
    effective_key = payload.api_key or user.gemini_api_key
    result = generate_copilot_reply(
        message=payload.message,
        language=payload.language,
        code=payload.code,
        challenge_title=payload.challenge_title,
        challenge_description=payload.challenge_description,
        last_error=payload.last_error,
        api_key=effective_key,
    )
    return CopilotResponse(**result)
