from typing import Dict, Any, Optional, List
from datetime import datetime
import json
import re

from sqlalchemy.orm import Session

from models.chat_session import ChatSession
from models.chat_message import ChatMessage
from models.user_skill import UserSkill

from services.skills_service import SkillsService
from services.career_service import CareerService
from ai.intent_classifier import IntentClassifier
from ai.rag.rag_service import RAGService
from ai.embeddings.vector_store import VectorStore


# Global vector store (in production, this would be persisted)
GLOBAL_VECTOR_STORE = VectorStore()


class ChatbotService:
    """
    Rule-based chatbot service with intent detection.
    Can be extended to LLM-based responses later.
    """

    # --------------------------------------------------
    # PUBLIC ENTRY POINT (USED BY ROUTES)
    # --------------------------------------------------
    @staticmethod
    def process_query(
        db: Session,
        user_id: int,
        query: str,
        session_id: Optional[int] = None
    ) -> Dict[str, Any]:

        # -------------------------
        # Get or create chat session
        # -------------------------
        session = None
        if session_id:
            session = db.query(ChatSession).filter(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id
            ).first()

        if not session:
            session = ChatSession(user_id=user_id)
            db.add(session)
            db.flush()

        # -------------------------
        # Detect intent
        # -------------------------
        intent_result = IntentClassifier.classify_intent(query)
        if isinstance(intent_result, dict):
            intent = intent_result.get("intent", "general")
        else:
            intent = str(intent_result or "general")

        # -------------------------
        # Build user context
        # -------------------------
        try:
            context = ChatbotService._build_user_context(db, user_id)
        except Exception:
            # Keep chat available even if analytics context fails.
            context = {
                "skills_count": 0,
                "average_skill_score": 0,
                "top_skills": [],
                "career_matches": [],
                "inferred_skills": [],
                "skill_insights": {},
                "recent_skills": [],
            }

        # -------------------------
        # Generate response
        # -------------------------
        if intent in {"career", "learning"}:
            if GLOBAL_VECTOR_STORE.index.ntotal == 0:
                response_text = ChatbotService._fallback_without_vector_store(intent, context)
            else:
                response_payload = RAGService.answer(
                    query=query,
                    vector_store=GLOBAL_VECTOR_STORE,
                    structured_context=context,
                )
                response_text = ChatbotService._to_text_response(response_payload)
        else:
            response_text = ChatbotService._generate_response(
                intent=intent,
                query=query,
                context=context
            )

        # -------------------------
        # Persist messages
        # -------------------------
        user_message = ChatMessage(
            session_id=session.id,
            role="user",
            content=query,
            context=ChatbotService._safe_json_dumps({
                "intent": intent,
                "intent_result": intent_result if isinstance(intent_result, dict) else {}
            })
        )

        assistant_message = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=response_text,
            context=ChatbotService._safe_json_dumps(context)
        )

        db.add(user_message)
        db.add(assistant_message)
        db.commit()

        return {
            "session_id": session.id,
            "intent": intent,
            "message": response_text,
            "timestamp": assistant_message.timestamp,
        }



    # --------------------------------------------------
    # CONTEXT BUILDER
    # --------------------------------------------------
    @staticmethod
    def _build_user_context(
        db: Session,
        user_id: int
    ) -> Dict[str, Any]:

        skills_analysis = SkillsService.analyze_skills(db, user_id)
        career_matches = CareerService.recommend_careers(db, user_id)

        # Enhanced context with AI insights
        context = {
            "skills_count": skills_analysis.get("total_skills", 0),
            "average_skill_score": skills_analysis.get("average_score", 0),
            "top_skills": skills_analysis.get("top_skills", [])[:3],
            "career_matches": career_matches[:3] if career_matches else [],
            "inferred_skills": skills_analysis.get("inferred_skills", []),
            "skill_insights": skills_analysis.get("skill_insights", {}),
            "recent_skills": [s["skill_id"] for s in skills_analysis.get("top_skills", [])[:3]]
        }

        return context

    # --------------------------------------------------
    # RESPONSE GENERATOR
    # --------------------------------------------------
    @staticmethod
    def _generate_response(
        intent: str,
        query: str,
        context: Dict[str, Any]
    ) -> str:

        if intent in {"career", "learning"}:
            # Check if vector store has data
            if GLOBAL_VECTOR_STORE.index.ntotal == 0:
                return ChatbotService._fallback_without_vector_store(intent, context)
            rag_response = RAGService.answer(
                query=query,
                vector_store=GLOBAL_VECTOR_STORE,
                structured_context=context,
            )
            return ChatbotService._to_text_response(rag_response)

        if intent == "skills":
            return ChatbotService._skills_response(context)

        if intent == "assessment":
            return ChatbotService._assessment_response()

        return ChatbotService._general_response()

    # --------------------------------------------------
    # RESPONSE HANDLERS
    # --------------------------------------------------
    @staticmethod
    def _career_response(context: Dict[str, Any]) -> str:
        matches = context.get("career_matches", [])

        if not matches:
            return (
                "I need more information about your skills before suggesting careers. "
                "Please complete a skill assessment first."
            )

        top = matches[0]
        score = top.get("match_percentage", 0)

        msg = f"Your top career match is **{top['title']}** with a {score:.1f}% match. "

        if score >= 80:
            msg += "This is an excellent fit for your current skill set."
        elif score >= 60:
            msg += "This is a good match, with some skills to improve."
        else:
            msg += "This role could be a future target with focused learning."

        return msg

    @staticmethod
    def _skills_response(context: Dict[str, Any]) -> str:
        count = context.get("skills_count", 0)
        avg = context.get("average_skill_score", 0)

        if count == 0:
            return (
                "You haven't completed any skill assessments yet. "
                "Start with an assessment so I can analyze your strengths."
            )

        msg = f"You have assessed {count} skills with an average score of {avg:.1f}%. "

        top = context.get("top_skills", [])
        if top:
            names = [str(s["skill_id"]) for s in top]
            msg += f"Your strongest skills are IDs: {', '.join(names)}."

        return msg

    @staticmethod
    def _learning_response(context: Dict[str, Any]) -> str:
        matches = context.get("career_matches", [])

        if not matches:
            return (
                "Tell me which career you're aiming for, "
                "and I can generate a learning path for you."
            )

        role = matches[0]["title"]
        return (
            f"To become a {role}, you should focus on closing your skill gaps. "
            "I can generate a personalized learning path when you're ready."
        )

    @staticmethod
    def _assessment_response() -> str:
        return (
            "Skill assessments help me understand your abilities. "
            "You can assess multiple skills and update them over time."
        )

    @staticmethod
    def _general_response() -> str:
        return (
            "I can help with career recommendations, skill analysis, "
            "learning paths, and assessments. What would you like to explore?"
        )

    @staticmethod
    def _fallback_without_vector_store(intent: str, context: Dict[str, Any]) -> str:
        if intent == "learning":
            top_skills = context.get("top_skills", [])[:3]
            skill_labels = []
            for item in top_skills:
                if isinstance(item, dict):
                    skill_labels.append(
                        item.get("skill_name")
                        or item.get("name")
                        or f"Skill {item.get('skill_id', '')}".strip()
                    )
                else:
                    skill_labels.append(str(item))
            skill_labels = [s for s in skill_labels if s]

            focus_line = (
                f"Based on your current profile, start with: {', '.join(skill_labels)}."
                if skill_labels else
                "Start with one core technical skill, one project skill, and one communication skill."
            )

            return (
                f"{focus_line}\n\n"
                "Recommended resources:\n"
                "1. Coursera/edX: structured beginner-to-advanced tracks\n"
                "2. YouTube + docs: fast concept refresh and practical examples\n"
                "3. GitHub projects: build one portfolio project per skill\n"
                "4. LeetCode/HackerRank: weekly practice for problem solving\n\n"
                "If you share your target role, I can generate a week-by-week learning plan."
            )

        if intent == "career":
            matches = context.get("career_matches", []) or []
            if matches and isinstance(matches[0], dict):
                top_title = matches[0].get("title") or matches[0].get("role", {}).get("title")
                score = matches[0].get("match_percentage")
                if top_title:
                    score_text = f" ({score:.1f}% match)" if isinstance(score, (int, float)) else ""
                    return (
                        f"Your current top career direction is {top_title}{score_text}.\n\n"
                        "Next steps:\n"
                        "1. Identify your top 3 skill gaps for this role\n"
                        "2. Complete one portfolio project mapped to the role\n"
                        "3. Practice interview questions weekly\n"
                        "4. Update your resume with measurable outcomes"
                    )

            return (
                "I can still guide your career path without indexed documents.\n\n"
                "Try this quick plan:\n"
                "1. Choose a target role (e.g., Frontend Developer, Data Analyst)\n"
                "2. Assess current skills vs required skills\n"
                "3. Build 2 role-relevant projects\n"
                "4. Prepare resume and interview answers for that role"
            )

        return "I can help with learning and career guidance. Tell me your goal and current skill level."

    @staticmethod
    def _to_text_response(response: Any) -> str:
        """Normalize mixed chatbot/RAG responses to plain text for storage and UI."""
        if isinstance(response, str):
            return response
        if isinstance(response, dict):
            answer = response.get("answer")
            if isinstance(answer, str):
                return answer
            try:
                return ChatbotService._safe_json_dumps(response)
            except Exception:
                return str(response)
        return str(response)

    @staticmethod
    def _safe_json_dumps(value: Any) -> str:
        return json.dumps(value, default=ChatbotService._json_default)

    @staticmethod
    def _json_default(value: Any) -> Any:
        # Handles numpy, datetime, Decimal, and any custom objects gracefully.
        if hasattr(value, "item"):
            try:
                return value.item()
            except Exception:
                pass
        if hasattr(value, "isoformat"):
            try:
                return value.isoformat()
            except Exception:
                pass
        return str(value)

    # --------------------------------------------------
    # SESSION MANAGEMENT METHODS (Required by Routes)
    # --------------------------------------------------
    @staticmethod
    def get_sessions(db: Session, user_id: int) -> List[Dict[str, Any]]:
        """Get all chat sessions for a user"""
        sessions = db.query(ChatSession).filter(
            ChatSession.user_id == user_id
        ).order_by(ChatSession.created_at.desc()).all()
        
        return [
            {
                "id": session.id,
                "user_id": session.user_id,
                "created_at": session.created_at.isoformat() if session.created_at else None,
                "updated_at": session.updated_at.isoformat() if session.updated_at else None,
            }
            for session in sessions
        ]

    @staticmethod
    def get_messages(db: Session, user_id: int, session_id: int) -> List[Dict[str, Any]]:
        """Get all messages for a specific session"""
        # Verify session belongs to user
        session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id
        ).first()
        
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.timestamp.asc()).all()
        
        return [
            {
                "id": msg.id,
                "session_id": msg.session_id,
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else None,
                "context": msg.context,
            }
            for msg in messages
        ]

    @staticmethod
    def clear_session(db: Session, user_id: int, session_id: int) -> Dict[str, Any]:
        """Clear all messages from a session"""
        # Verify session belongs to user
        session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id
        ).first()
        
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        # Delete all messages in the session
        db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).delete()
        
        db.commit()
        
        return {
            "message": f"Session {session_id} cleared successfully",
            "session_id": session_id
        }
