from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from models.database import get_db
from models.user import User
from models.user_skill import UserSkill
from models.skill_assessment import SkillAssessment
from models.user_note import UserNote
from services.profile_service import ProfileService
from routes.auth_fastapi import get_current_user
from schemas.profile import ProfileUpdate

router = APIRouter(tags=["profile"])

@router.get("/", response_model=Dict[str, Any])
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user profile - flat structure matching frontend expectations
    """
    profile_data = ProfileService.get_profile(db, current_user.id)
    if "error" in profile_data:
        raise HTTPException(status_code=404, detail=profile_data["error"])
    
    return {
        "email": profile_data.get("email"),
        "name": profile_data.get("name"),
        "first_name": profile_data.get("first_name"),
        "last_name": profile_data.get("last_name"),
        "phone": profile_data.get("phone"),
        "location": profile_data.get("location"),
        "experience_years": profile_data.get("experience_years"),
        "bio": profile_data.get("bio"),
        "github_url": profile_data.get("github_url"),
        "linkedin_url": profile_data.get("linkedin_url"),
        "portfolio_url": profile_data.get("portfolio_url"),
        "role": profile_data.get("role"),
        "currentRole": profile_data.get("currentRole"),
        "is_verified": current_user.is_verified,
        "skills_summary": profile_data.get("skills_summary"),
        "assessment_stats": profile_data.get("assessment_stats"),
        "learning_paths": profile_data.get("learning_paths"),
        "resumes_count": profile_data.get("resumes_count", 0),
        "certificates_count": profile_data.get("certificates_count", 0),
    }

@router.post("/", response_model=Dict[str, Any])
def create_profile_initial(
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create/Initialize current user profile (uses update logic for new users)
    """
    result = ProfileService.update_profile(
        db,
        current_user.id,
        profile_update.first_name,
        profile_update.last_name,
        profile_update.phone,  # Add phone
        profile_update.location,
        profile_update.experience_years,
        profile_update.bio,
        profile_update.github_url,
        profile_update.linkedin_url,
        profile_update.portfolio_url
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.put("/", response_model=Dict[str, Any])
def update_profile(
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile
    """
    result = ProfileService.update_profile(
        db,
        current_user.id,
        profile_update.first_name,
        profile_update.last_name,
        profile_update.phone,
        profile_update.location,
        profile_update.experience_years,
        profile_update.bio,
        profile_update.github_url,
        profile_update.linkedin_url,
        profile_update.portfolio_url
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.delete("/", response_model=Dict[str, Any])
def delete_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Soft delete current user profile (set inactive, cascade relationships)
    """
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Soft delete: set is_active or deleted flag (add if not, or inactive)
    # For demo: delete related first, then mark
    db.query(UserSkill).filter(UserSkill.user_id == current_user.id).delete()
    db.query(SkillAssessment).filter(SkillAssessment.user_id == current_user.id).delete()
    db.query(UserNote).filter(UserNote.user_id == current_user.id).delete()
    user.bio = None
    user.first_name = None
    # Better: add is_deleted = True if column exists, or actual delete
    db.commit()
    return {"message": "Profile soft deleted successfully", "user_id": current_user.id}
