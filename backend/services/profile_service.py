from sqlalchemy.orm import Session, joinedload
from typing import Dict, Any, Optional, List
from datetime import datetime
from models.user import User
from models.database import get_db
from models.user_skill import UserSkill
from models.skill_assessment import SkillAssessment
from models.learning_path import LearningPath
from models.resume import Resume
from models.certificate import Certificate
import logging

logger = logging.getLogger(__name__)

class ProfileService:
    @staticmethod
    def get_profile(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Get complete user profile data including aggregated data from related models.
        Extends user.to_dict() with skills, assessments, learning paths, resumes, certificates.
        """
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"error": "User not found"}
            
            # Base user data
            profile_data = user.to_dict()
        except Exception as e:
            logger.error(f"Profile query error for user {user_id}: {str(e)}")
            return {"error": "Profile query failed"}
        
        # Skills summary: top 5 skills + total count
        try:
            skills = db.query(UserSkill).options(joinedload(UserSkill.skill)).filter(UserSkill.user_id == user_id).order_by(UserSkill.score.desc()).limit(5).all()
            profile_data["skills_summary"] = {
                "top_skills": [skill.to_dict() for skill in skills if hasattr(skill, "to_dict")],
                "total_skills": db.query(UserSkill).filter(UserSkill.user_id == user_id).count()
            }
        except Exception as e:
            logger.warning(f"Skills summary error for user {user_id}: {str(e)}")
            profile_data["skills_summary"] = {"top_skills": [], "total_skills": 0}
        
        # Assessment stats
        # Assessment stats - safe handling
        try:
            assessments = db.query(SkillAssessment).filter(SkillAssessment.user_id == user_id).all()
            profile_data["assessment_stats"] = {
                "completed_count": len(assessments),
                "avg_score": 0.0
            }
            if assessments:
                total_score = 0
                valid_assessments = 0
                for ass in assessments:
                    try:
                        ass_dict = ass.to_dict()
                        if "skills" in ass_dict and ass_dict["skills"]:
                            skill_scores = [s.get("score", 0) for s in ass_dict["skills"] if isinstance(s.get("score"), (int, float))]
                            if skill_scores:
                                total_score += sum(skill_scores)
                                valid_assessments += 1
                    except (AttributeError, KeyError, IndexError) as e:
                        logger.warning(f"Skipping invalid assessment {ass.id}: {str(e)}")
                        continue
                if valid_assessments > 0:
                    profile_data["assessment_stats"]["avg_score"] = round(total_score / valid_assessments, 2)
        except Exception as e:
            logger.warning(f"Assessment stats error for user {user_id}: {str(e)}")
            profile_data["assessment_stats"] = {"completed_count": 0, "avg_score": 0.0}
        
        # Learning paths
        # Learning paths - safe
        try:
            paths_count = db.query(LearningPath).filter(LearningPath.user_id == user_id).count()
            paths = db.query(LearningPath).filter(LearningPath.user_id == user_id).limit(10).all()
            avg_progress = 0.0
            if paths:
                total_progress = 0
                for path in paths:
                    try:
                        progress = getattr(path, 'progress', 0) or 0.0
                        total_progress += float(progress)
                    except (AttributeError, ValueError, TypeError):
                        total_progress += 0.0
                avg_progress = round(total_progress / len(paths), 2)
            profile_data["learning_paths"] = {
                "count": paths_count,
                "avg_progress": avg_progress
            }
        except Exception as e:
            logger.warning(f"Learning paths error for user {user_id}: {str(e)}")
            profile_data["learning_paths"] = {"count": 0, "avg_progress": 0.0}
        
        # Resumes and certificates counts
        profile_data["resumes_count"] = db.query(Resume).filter(Resume.user_id == user_id).count()
        profile_data["certificates_count"] = db.query(Certificate).filter(Certificate.user_id == user_id).count()
        
        logger.info(f"Profile retrieved for user {user_id} with aggregates")
        return profile_data

    @staticmethod
    def update_profile(
        db: Session, 
        user_id: int, 
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        phone: Optional[str] = None,
        location: Optional[str] = None,
        experience_years: Optional[int] = None,
        bio: Optional[str] = None,
        github_url: Optional[str] = None,
        linkedin_url: Optional[str] = None,
        portfolio_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update user profile fields with validation.
        Aligns with ProfileUpdate schema + phone from User model.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        updated = False
        
        if first_name is not None:
            user.first_name = first_name.strip() if first_name.strip() else None
            updated = True
        
        if last_name is not None:
            user.last_name = last_name.strip() if last_name.strip() else None
            updated = True
        
        if phone is not None:
            # Basic phone validation (simple regex or length)
            if len(phone.strip()) <= 20:
                user.phone = phone.strip() if phone.strip() else None
                updated = True
        
        if location is not None:
            user.location = location.strip() if location.strip() else None
            updated = True
        
        if experience_years is not None:
            if 0 <= experience_years <= 50:
                user.experience_years = experience_years
                updated = True
        
        if bio is not None:
            user.bio = bio.strip()[:1000] if bio.strip() else None
            updated = True
            
        if github_url is not None:
            user.github_url = github_url.strip()[:255] if github_url.strip() else None
            updated = True
            
        if linkedin_url is not None:
            user.linkedin_url = linkedin_url.strip()[:255] if linkedin_url.strip() else None
            updated = True
            
        if portfolio_url is not None:
            user.portfolio_url = portfolio_url.strip()[:255] if portfolio_url.strip() else None
            updated = True
        
        if updated:
            user.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(user)
            logger.info(f"Profile updated for user {user_id}")
        
        # Return with aggregates for consistency
        return ProfileService.get_profile(db, user_id)

