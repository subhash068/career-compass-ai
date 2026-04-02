from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from models.database import get_db
from models.user import User
from services.privacy_service import privacy_service

from .auth_fastapi import get_current_user  # Reuse auth dependency

router = APIRouter(prefix="/privacy", tags=["Privacy"])

class PrivacyRequest(BaseModel):
    type: str  # 'export', 'delete', 'inquiry'
    details: Optional[str] = None

@router.post("/request")
def create_privacy_request(
    request: PrivacyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create privacy request for data export, account deletion, or inquiry.
    """
    valid_types = ['export', 'delete', 'inquiry']
    if request.type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid request type. Must be one of: {valid_types}")
    
    result = privacy_service.handle_privacy_request(
        db, 
        current_user.id, 
        request.type, 
        request.details or ""
    )
    
    return result
