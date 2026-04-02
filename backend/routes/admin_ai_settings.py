from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os

from models.database import get_db
from models.user import User
from routes.auth_fastapi import get_current_user
from ai.config.ai_settings import AISettings

router = APIRouter(prefix="/api/admin/ai-settings", tags=["Admin AI Settings"])


class AISettingsUpdate(BaseModel):
    enable_llm: Optional[bool] = None
    enable_rag: Optional[bool] = None
    enable_evaluation: Optional[bool] = None
    enable_memory: Optional[bool] = None
    llm_model: Optional[str] = None
    llm_temperature: Optional[float] = None
    rag_top_k: Optional[int] = None
    skill_inference_threshold: Optional[float] = None


@router.get("/")
def get_ai_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current AI settings - All authenticated users can view"""
    return {
        "enable_llm": AISettings.ENABLE_LLM,
        "enable_rag": AISettings.ENABLE_RAG,
        "enable_evaluation": AISettings.ENABLE_EVALUATION,
        "enable_memory": AISettings.ENABLE_MEMORY,
        "llm_model": AISettings.LLM_MODEL,
        "llm_temperature": AISettings.LLM_TEMPERATURE,
        "llm_max_tokens": AISettings.LLM_MAX_TOKENS,
        "rag_top_k": AISettings.RAG_TOP_K,
        "rag_similarity_threshold": AISettings.RAG_SIMILARITY_THRESHOLD,
        "skill_inference_threshold": AISettings.SKILL_INFERENCE_THRESHOLD,
        "embedding_model": AISettings.EMBEDDING_MODEL,
        "is_admin": current_user.role == "admin",
    }


@router.put("/")
def update_ai_settings(
    settings: AISettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update AI settings"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Update environment variables (these will apply to new requests)
    changes = {}
    
    if settings.enable_llm is not None:
        os.environ["ENABLE_LLM"] = "true" if settings.enable_llm else "false"
        AISettings.ENABLE_LLM = settings.enable_llm
        changes["enable_llm"] = settings.enable_llm
    
    if settings.enable_rag is not None:
        os.environ["ENABLE_RAG"] = "true" if settings.enable_rag else "false"
        AISettings.ENABLE_RAG = settings.enable_rag
        changes["enable_rag"] = settings.enable_rag
    
    if settings.enable_evaluation is not None:
        os.environ["ENABLE_EVALUATION"] = "true" if settings.enable_evaluation else "false"
        AISettings.ENABLE_EVALUATION = settings.enable_evaluation
        changes["enable_evaluation"] = settings.enable_evaluation
    
    if settings.enable_memory is not None:
        os.environ["ENABLE_MEMORY"] = "true" if settings.enable_memory else "false"
        AISettings.ENABLE_MEMORY = settings.enable_memory
        changes["enable_memory"] = settings.enable_memory
    
    if settings.llm_model is not None:
        os.environ["LLM_MODEL"] = settings.llm_model
        AISettings.LLM_MODEL = settings.llm_model
        changes["llm_model"] = settings.llm_model
    
    if settings.llm_temperature is not None:
        os.environ["LLM_TEMPERATURE"] = str(settings.llm_temperature)
        AISettings.LLM_TEMPERATURE = settings.llm_temperature
        changes["llm_temperature"] = settings.llm_temperature
    
    if settings.rag_top_k is not None:
        os.environ["RAG_TOP_K"] = str(settings.rag_top_k)
        AISettings.RAG_TOP_K = settings.rag_top_k
        changes["rag_top_k"] = settings.rag_top_k
    
    if settings.skill_inference_threshold is not None:
        os.environ["SKILL_INFERENCE_THRESHOLD"] = str(settings.skill_inference_threshold)
        AISettings.SKILL_INFERENCE_THRESHOLD = settings.skill_inference_threshold
        changes["skill_inference_threshold"] = settings.skill_inference_threshold
    
    return {
        "message": "AI settings updated successfully",
        "changes": changes,
        "current_settings": {
            "enable_llm": AISettings.ENABLE_LLM,
            "enable_rag": AISettings.ENABLE_RAG,
            "enable_evaluation": AISettings.ENABLE_EVALUATION,
            "enable_memory": AISettings.ENABLE_MEMORY,
        }
    }


@router.get("/status")
def get_ai_status():
    """Get simplified AI status for display"""
    return {
        "ai_enabled": AISettings.is_ai_enabled(),
        "llm_enabled": AISettings.should_use_llm(),
        "rag_enabled": AISettings.should_use_rag(),
        "features": {
            "llm": AISettings.ENABLE_LLM,
            "rag": AISettings.ENABLE_RAG,
            "evaluation": AISettings.ENABLE_EVALUATION,
            "memory": AISettings.ENABLE_MEMORY,
        }
    }
