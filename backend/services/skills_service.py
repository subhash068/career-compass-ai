from typing import Dict, Any, List, Optional

from datetime import datetime

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from sqlalchemy.orm import Session, joinedload

from models.user_skill import UserSkill
from models.skill import Skill
from models.skill_assessment import SkillAssessment, SkillAssessmentSkill
from models.job_role import JobRole
from models.role_skill_requirement import RoleSkillRequirement
from ai.skill_similarity import SkillSimilarity
from ai.skill_inference import SkillInference



class SkillsService:
    """
    Handles:
    - Skill assessment submission
    - User skill updates with versioning
    - Skill analysis
    - Similar skill discovery (TF-IDF)
    """

    # -----------------------------------------------------
    # SUBMIT FULL SKILL ASSESSMENT
    # -----------------------------------------------------
    @staticmethod
    def submit_assessment(
        db: Session,
        user_id: int,
        assessment_payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        skills_data = assessment_payload.get("skills", [])

        if not skills_data:
            raise ValueError("No skills provided for assessment")

        valid_levels = {"beginner", "intermediate", "advanced", "expert"}

        # INPUT VALIDATION (STRICT)
        for item in skills_data:
            if "skill_id" not in item or "level" not in item:
                raise ValueError("Each skill must contain skill_id and level")

            skill = db.query(Skill).filter(Skill.id == item["skill_id"]).first()
            if not skill:
                raise ValueError(f"Skill {item['skill_id']} does not exist")

            if item["level"] not in valid_levels:
                raise ValueError(f"Invalid level: {item['level']}")

            confidence = item.get("confidence", 50)
            if not isinstance(confidence, int) or not (0 <= confidence <= 100):
                raise ValueError("Confidence must be integer between 0 and 100")

        # CREATE ASSESSMENT SESSION
        assessment = SkillAssessment(user_id=user_id)
        db.add(assessment)
        db.flush()

        # PROCESS EACH SKILL
        for item in skills_data:
            skill_id = item["skill_id"]
            level = item["level"]
            confidence = item.get("confidence", 50)

            # Calculate base score from level
            base_score = SkillsService._level_to_score(level)

            # Apply AI confidence calibration
            calibration_result = SkillInference.calibrate_confidence(
                base_score, confidence
            )
            calibrated_score = calibration_result["calibrated_score"]

            # Create or update user skill
            user_skill = db.query(UserSkill).filter_by(
                user_id=user_id, skill_id=skill_id
            ).first()

            if user_skill:
                user_skill.score = calibrated_score
                user_skill.confidence = confidence
                user_skill.assessed_at = datetime.utcnow()
            else:
                user_skill = UserSkill(
                    user_id=user_id,
                    skill_id=skill_id,
                    score=calibrated_score,
                    confidence=confidence,
                )
                db.add(user_skill)

            # Record in assessment session
            assessment_skill = SkillAssessmentSkill(
                assessment_id=assessment.id,
                skill_id=skill_id,
                level=level,
                confidence=confidence,
                score=calibrated_score,
            )
            db.add(assessment_skill)

        db.commit()

        return {
            "message": "Assessment submitted successfully",
            "assessment_id": assessment.id,
            "skills_processed": len(skills_data),
        }

    # -----------------------------------------------------
    # UPDATE SINGLE SKILL
    # -----------------------------------------------------
    @staticmethod
    def update_single_skill(
        db: Session,
        user_id: int,
        skill_id: int,
        level: str,
        confidence: int,
    ) -> Dict[str, Any]:
        valid_levels = {"beginner", "intermediate", "advanced", "expert"}

        if level not in valid_levels:
            raise ValueError(f"Invalid level: {level}")

        if not isinstance(confidence, int) or not (0 <= confidence <= 100):
            raise ValueError("Confidence must be integer between 0 and 100")

        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        if not skill:
            raise ValueError(f"Skill {skill_id} does not exist")

        base_score = SkillsService._level_to_score(level)

        calibration_result = SkillInference.calibrate_confidence(
            base_score, confidence
        )
        calibrated_score = calibration_result["calibrated_score"]

        user_skill = db.query(UserSkill).filter_by(
            user_id=user_id, skill_id=skill_id
        ).first()

        if user_skill:
            user_skill.score = calibrated_score
            user_skill.confidence = confidence
            user_skill.assessed_at = datetime.utcnow()
        else:
            user_skill = UserSkill(
                user_id=user_id,
                skill_id=skill_id,
                score=calibrated_score,
                confidence=confidence,
            )
            db.add(user_skill)

        db.commit()
        db.refresh(user_skill)

        return {
            "message": "Skill updated successfully",
            "skill_id": skill_id,
            "skill_name": skill.name,
            "score": calibrated_score,
            "confidence": confidence,
        }

    # -----------------------------------------------------
    # GET USER SKILLS
    # -----------------------------------------------------
    @staticmethod
    def get_user_skills(
        db: Session,
        user_id: int
    ) -> Dict[str, Any]:
        user_skills = (
            db.query(UserSkill)
            .options(joinedload(UserSkill.skill))
            .filter_by(user_id=user_id)
            .all()
        )

        skills_data = []
        for user_skill in user_skills:
            skills_data.append({
                "skill_id": user_skill.skill_id,
                "skill_name": user_skill.skill.name,
                "category": user_skill.skill.category,
                "score": user_skill.score,
                "confidence": user_skill.confidence,
                "assessed_at": user_skill.assessed_at.isoformat() if user_skill.assessed_at else None,
            })

        return {
            "user_id": user_id,
            "total_skills": len(skills_data),
            "skills": skills_data,
        }

    # -----------------------------------------------------
    # ANALYZE SKILLS (AI ENHANCED)
    # -----------------------------------------------------
    @staticmethod
    def analyze_skills(
        db: Session,
        user_id: int
    ) -> Dict[str, Any]:
        from sqlalchemy import func
        from models.skill_assessment import SkillAssessmentSkill, SkillAssessment
        
        # Get the latest assessment for each skill
        subquery = db.query(
            SkillAssessmentSkill.skill_id,
            func.max(SkillAssessmentSkill.id).label('max_id')
        ).join(SkillAssessment).filter(
            SkillAssessment.user_id == user_id
        ).group_by(SkillAssessmentSkill.skill_id).subquery()
        
        latest_assessments = db.query(SkillAssessmentSkill).join(
            subquery,
            SkillAssessmentSkill.id == subquery.c.max_id
        ).all()

        # Get user's assessed domain from their actual skills
        user_domain_id = None
        if latest_assessments:
            first_skill_id = latest_assessments[0].skill_id
            first_skill = db.query(Skill).filter_by(id=first_skill_id).first()
            if first_skill and first_skill.domain_id:
                user_domain_id = first_skill.domain_id
            else:
                latest_assessment = db.query(SkillAssessment).filter(
                    SkillAssessment.user_id == user_id
                ).order_by(SkillAssessment.created_at.desc()).first()
                if latest_assessment:
                    user_domain_id = latest_assessment.domain_id

        # Use assessment skills if found, otherwise fallback to UserSkill
        if latest_assessments:
            enhanced_skills = latest_assessments
            user_skills = latest_assessments
        else:
            user_skills = (
                db.query(UserSkill)
                .options(joinedload(UserSkill.skill))
                .filter_by(user_id=user_id)
                .all()
            )
            
            if not user_skills:
                return {
                    "user_id": user_id,
                    "message": "No skills found for analysis",
                    "insights": {},
                    "skills": [],
                    "gaps": [],
                    "recommendations": []
                }
            
            enhanced_skills = user_skills

        # Detect hidden/inferred skills - only run if AI is enabled
        inferred_skills = []
        try:
            from ai.config.ai_settings import AISettings
            if AISettings.is_ai_enabled():
                hidden_skills_result = SkillInference.detect_hidden_skills(db, user_id)
                inferred_skills = hidden_skills_result.get("inferred_skills", [])
        except Exception:
            inferred_skills = []

        # Generate insights
        insights = SkillsService._generate_skill_insights(enhanced_skills, inferred_skills)

        # Calculate detailed skill gaps
        detailed_gaps = SkillsService._calculate_skill_gaps_with_unattempted(
            db, enhanced_skills, user_domain_id
        )

        # Format skills for frontend
        skills_data = []
        for skill_record in enhanced_skills:
            skill_name = skill_record.skill.name if skill_record.skill else f"Skill {skill_record.skill_id}"
            category = skill_record.skill.category if skill_record.skill else None
            
            if hasattr(skill_record, 'assessed_at'):
                assessed_at = skill_record.assessed_at.isoformat() if skill_record.assessed_at else None
            else:
                assessed_at = skill_record.created_at.isoformat() if skill_record.created_at else None
            
            skills_data.append({
                "skill_id": skill_record.skill_id,
                "skill_name": skill_name,
                "category": category,
                "score": skill_record.score,
                "confidence": skill_record.confidence,
                "level": skill_record.level,
                "assessed_at": assessed_at,
            })

        return {
            "user_id": user_id,
            "total_skills": len(user_skills),
            "inferred_skills": len(inferred_skills),
            "insights": insights,
            "skill_breakdown": {
                "strengths": insights["strengths"],
                "gaps": [gap["skill"]["name"] for gap in detailed_gaps],
            },
            "skills": skills_data,
            "gaps": detailed_gaps,
            "recommendations": insights["recommendations"]
        }


    # -----------------------------------------------------
    # FIND SIMILAR SKILLS (TF-IDF)
    # -----------------------------------------------------
    @staticmethod
    def find_similar_skills(
        db: Session,
        skill_id: int,
        top_n: int = 5
    ) -> List[Dict[str, Any]]:
        all_skills = db.query(Skill).all()
        if not all_skills:
            return []

        target_skill = db.query(Skill).filter(Skill.id == skill_id).first()
        if not target_skill:
            raise ValueError(f"Skill {skill_id} not found")

        skill_texts = [
            f"{s.name} {s.description or ''} {s.category or ''}"
            for s in all_skills
        ]
        target_text = f"{target_skill.name} {target_skill.description or ''} {target_skill.category or ''}"

        try:
            vectorizer = TfidfVectorizer(stop_words="english")
            tfidf_matrix = vectorizer.fit_transform(skill_texts + [target_text])

            similarity_scores = cosine_similarity(
                tfidf_matrix[-1:], tfidf_matrix[:-1]
            )[0]

            similar_indices = np.argsort(similarity_scores)[::-1]
            results = []

            for idx in similar_indices:
                if all_skills[idx].id == skill_id:
                    continue
                if len(results) >= top_n:
                    break

                score = float(similarity_scores[idx])
                if score > 0.1:
                    results.append({
                        "skill_id": all_skills[idx].id,
                        "skill_name": all_skills[idx].name,
                        "similarity_score": score,
                        "category": all_skills[idx].category,
                    })

            return results
        except Exception:
            return []

    # -----------------------------------------------------
    # AI ENHANCED HELPERS
    # -----------------------------------------------------
    @staticmethod
    def _generate_skill_insights(
        user_skills: List[UserSkill],
        inferred_skills: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        insights = {
            "strengths": [],
            "gaps": [],
            "recommendations": []
        }

        for skill in user_skills:
            if skill.score >= 75:
                insights["strengths"].append(skill.skill.name)

        for skill in user_skills:
            if skill.score < 50:
                insights["gaps"].append(skill.skill.name)

        if inferred_skills:
            insights["recommendations"] = [
                f"Consider assessing {inf['name']} (inferred from {inf['inferred_from']})"
                for inf in inferred_skills[:3]
            ]

        return insights

    @staticmethod
    def _calculate_skill_gaps(
        db: Session,
        user_skills: List[UserSkill]
    ) -> List[Dict[str, Any]]:
        return SkillsService._calculate_skill_gaps_with_unattempted(db, user_skills, None)

    @staticmethod
    def _calculate_skill_gaps_with_unattempted(
        db: Session,
        user_skills: List[UserSkill],
        user_domain_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        # Build user skill map
        user_skill_map = {us.skill_id: us for us in user_skills}

        # Get all job roles and their requirements
        roles = db.query(JobRole).all()

        all_requirements = {}
        for role in roles:
            requirements = db.query(RoleSkillRequirement).filter_by(role_id=role.id).all()
            for req in requirements:
                if req.skill_id not in all_requirements:
                    all_requirements[req.skill_id] = req.required_level
                else:
                    current_level = all_requirements[req.skill_id]
                    level_scores = {"beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4}
                    if level_scores.get(req.required_level, 0) > level_scores.get(current_level, 0):
                        all_requirements[req.skill_id] = req.required_level

        # Get all skills in user's domain
        domain_skills = []
        if user_domain_id:
            domain_skills = db.query(Skill).filter_by(domain_id=user_domain_id).all()

        gaps = []
        processed_skill_ids = set()

        for domain_skill in domain_skills:
            skill_id = domain_skill.id
            
            if skill_id in processed_skill_ids:
                continue
            processed_skill_ids.add(skill_id)

            user_skill = user_skill_map.get(skill_id)
            
            if user_skill:
                current_score = user_skill.score
                current_level = SkillsService._score_to_level(current_score)
                
                if skill_id in all_requirements:
                    required_level = all_requirements[skill_id]
                else:
                    required_level = "advanced"
                
                required_score = SkillsService._level_to_score(required_level)
                gap_score = required_score - current_score
                
                if gap_score > 50:
                    severity = "high"
                    priority = 10
                elif gap_score > 25:
                    severity = "medium"
                    priority = 7
                elif gap_score > 5:
                    severity = "low"
                    priority = 4
                else:
                    severity = "none"
                    priority = 0
                    gap_score = 0
            else:
                current_score = 0
                current_level = "none"
                
                if skill_id in all_requirements:
                    required_level = all_requirements[skill_id]
                else:
                    required_level = "advanced"
                
                required_score = SkillsService._level_to_score(required_level)
                gap_score = required_score
                severity = "high"
                priority = 10

            gaps.append({
                "skillId": str(skill_id),
                "skill": {
                    "id": str(skill_id),
                    "name": domain_skill.name,
                    "description": domain_skill.description or "",
                    "categoryId": domain_skill.domain_id if domain_skill.domain_id else None,
                    "demandLevel": 5
                },
                "currentLevel": current_level,
                "requiredLevel": required_level,
                "currentScore": current_score,
                "requiredScore": required_score,
                "gapScore": gap_score,
                "severity": severity,
                "priority": priority,
                "isUnattempted": user_skill is None
            })

        # Fallback: process only user skills
        if not user_domain_id:
            for user_skill in user_skills:
                skill_id = user_skill.skill_id
                
                if skill_id in processed_skill_ids:
                    continue
                processed_skill_ids.add(skill_id)

                current_score = user_skill.score
                current_level = SkillsService._score_to_level(current_score)
                
                if skill_id in all_requirements:
                    required_level = all_requirements[skill_id]
                else:
                    required_level = "advanced"
                
                required_score = SkillsService._level_to_score(required_level)
                gap_score = required_score - current_score
                
                if gap_score > 50:
                    severity = "high"
                    priority = 10
                elif gap_score > 25:
                    severity = "medium"
                    priority = 7
                elif gap_score > 5:
                    severity = "low"
                    priority = 4
                else:
                    severity = "none"
                    priority = 0
                    gap_score = 0

                try:
                    skill = db.query(Skill).filter_by(id=skill_id).first()
                    if skill:
                        gaps.append({
                            "skillId": str(skill_id),
                            "skill": {
                                "id": str(skill_id),
                                "name": skill.name,
                                "description": skill.description or "",
                                "categoryId": skill.domain_id if skill.domain_id else None,
                                "demandLevel": 5
                            },
                            "currentLevel": current_level,
                            "requiredLevel": required_level,
                            "currentScore": current_score,
                            "requiredScore": required_score,
                            "gapScore": gap_score,
                            "severity": severity,
                            "priority": priority,
                            "isUnattempted": False
                        })
                except Exception:
                    pass

        gaps.sort(key=lambda x: (-x["priority"], -x["gapScore"]))

        return gaps


    @staticmethod
    def _score_to_level(score: float) -> str:
        if score >= 87.5:
            return "expert"
        elif score >= 62.5:
            return "advanced"
        elif score >= 37.5:
            return "intermediate"
        else:
            return "beginner"

    # -----------------------------------------------------
    # GET QUIZ QUESTIONS FOR SKILLS
    # -----------------------------------------------------
    @staticmethod
    def get_quiz_questions(
        db: Session,
        skill_ids: List[int]
    ) -> Dict[str, Any]:
        from models.skill_question import SkillQuestion
        
        questions_by_skill = {}

        for skill_id in skill_ids:
            skill = db.query(Skill).filter(Skill.id == skill_id).first()
            if not skill:
                continue

            questions = SkillQuestion.find_random_by_skill(db, skill_id, limit=10)

            questions_by_skill[str(skill_id)] = {
                "skill_name": skill.name,
                "questions": [q.to_dict() for q in questions]
            }

        return {
            "total_skills": len(questions_by_skill),
            "questions": questions_by_skill
        }

    # -----------------------------------------------------
    # SUBMIT QUIZ ANSWERS
    # -----------------------------------------------------
    @staticmethod
    def submit_quiz_answers(
        db: Session,
        user_id: int,
        quiz_answers: Dict[str, Any]
    ) -> Dict[str, Any]:
        from models.skill_question import SkillQuestion
        
        skill_answers = quiz_answers.get("answers", {})
        skill_scores = {}

        for skill_id_str, answers in skill_answers.items():
            skill_id = int(skill_id_str)
            correct_count = 0
            total_questions = len(answers)

            for answer_data in answers:
                question_id = answer_data["question_id"]
                user_answer = answer_data["answer"]

                question = db.query(SkillQuestion).filter(SkillQuestion.id == question_id).first()
                if question and question.correct_answer == user_answer:
                    correct_count += 1

            score = (correct_count / total_questions) * 100 if total_questions > 0 else 0
            level = SkillsService._score_to_level(score)
            confidence = min(100, correct_count * 10)

            skill_scores[str(skill_id)] = {
                "score": score,
                "level": level,
                "confidence": confidence,
                "correct_answers": correct_count,
                "total_questions": total_questions
            }

        assessment_data = []
        for skill_id_str, score_data in skill_scores.items():
            assessment_data.append({
                "skill_id": int(skill_id_str),
                "level": score_data["level"],
                "confidence": score_data["confidence"],
                "score": score_data["score"]
            })

        assessment_result = SkillsService.submit_assessment(
            db=db,
            user_id=user_id,
            assessment_payload={"skills": assessment_data}
        )

        return {
            "message": "Quiz submitted successfully",
            "assessment_id": assessment_result["assessment_id"],
            "skill_scores": skill_scores,
            "overall_score": sum(s["score"] for s in skill_scores.values()) / len(skill_scores) if skill_scores else 0
        }

    # -----------------------------------------------------
    # INTERNAL HELPER
    # -----------------------------------------------------
    @staticmethod
    def _level_to_score(level: str) -> float:
        return {
            "beginner": 25,
            "intermediate": 50,
            "advanced": 75,
            "expert": 100
        }.get(level, 25)

    @staticmethod
    def _score_to_level(score: float) -> str:
        if score >= 87.5:
            return "expert"
        elif score >= 62.5:
            return "advanced"
        elif score >= 37.5:
            return "intermediate"
        else:
            return "beginner"
