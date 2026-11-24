from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import GenerateChallengeRequest
from ..services.gemini_service import generate_challenge_with_gemini
from ..models import User
from .auth import get_current_user

router = APIRouter(prefix="/api/generate-challenge", tags=["AI Generator"])

@router.post("")
def generate_challenge(payload: GenerateChallengeRequest, db: Session = Depends(get_db)):
    try:
        result = generate_challenge_with_gemini(
            topic=payload.topic,
            language=payload.language,
            difficulty=payload.difficulty,
            problem_type=payload.problem_type,
            test_case_count=payload.test_case_count,
            custom_instructions=payload.custom_instructions or "",
            api_key=payload.api_key
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate challenge: {str(e)}")
