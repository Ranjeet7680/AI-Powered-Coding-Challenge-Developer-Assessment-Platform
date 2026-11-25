from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserProfileUpdate, UserResponse
from .auth import get_current_user, serialize_user

router = APIRouter(prefix="/api/user", tags=["User Profile"])


@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.role is not None:
        user.role = payload.role.strip()
    if payload.experience is not None:
        user.experience = payload.experience
    if payload.preferred_languages is not None:
        user.preferred_languages = payload.preferred_languages
    if payload.goals is not None:
        user.goals = payload.goals
    if payload.gemini_api_key is not None:
        user.gemini_api_key = payload.gemini_api_key.strip()
    if payload.avatar_url is not None:
        user.avatar_url = payload.avatar_url

    db.commit()
    db.refresh(user)
    return serialize_user(user)
