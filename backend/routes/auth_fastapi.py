from fastapi import APIRouter, Depends, HTTPException, Body, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
import jwt
import os
import json

from models.database import get_db
from models.user import User
from services.auth_service import AuthService
from schemas.profile import ProfileUpdate

router = APIRouter(tags=["Authentication"])
security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET_KEY is not set in environment variables")

# --------------------------------------------------
# REQUEST / RESPONSE SCHEMAS
# --------------------------------------------------
class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str
    role: Optional[str] = "user"


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    model_config = {'populate_by_name': True}
    
    id: int
    email: str
    name: str
    phone: Optional[str] = None
    role: str
    currentRole: Optional[str] = Field(None, serialization_alias='currentRole')




class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str





class SendOtpRequest(BaseModel):
    email: str
    purpose: str  # 'verify' or 'reset'

class VerifyOtpRequest(BaseModel):
    email: str
    code: str
    purpose: str  # 'verify' or 'reset'


# --------------------------------------------------
# AUTH DEPENDENCY
# --------------------------------------------------
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )
        user_id = int(payload.get("sub"))
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# --------------------------------------------------
# REGISTER
# --------------------------------------------------
@router.post("/register", response_model=dict, status_code=201)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        return AuthService.register_user(
            db=db,
            email=request.email,
            name=request.name,
            password=request.password,
            role=request.role,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"[REGISTER ERROR] {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Registration failed due to a server error")


# --------------------------------------------------
# LOGIN
# --------------------------------------------------
@router.post("/login", response_model=TokenResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    try:
        result = AuthService.authenticate_user(
            db=db,
            email=request.email,
            password=request.password,
        )

        # user = db.query(User).filter(User.email == request.email.lower().strip()).first()
        user = result["user"]  # ✅ USE RETURNED USER
        return TokenResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            token_type="bearer",
            user=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                phone=user.phone,
                role=user.role,
                currentRole=user.current_role,
            ),

        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        import traceback
        print(f"[LOGIN ERROR] {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Authentication failed - {str(e)}")


# --------------------------------------------------
# TOKEN REFRESH
# --------------------------------------------------
class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=dict)
def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(
            request.refresh_token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )
        user_id = int(payload.get("sub"))

        return AuthService.refresh_access_token(
            db=db,
            user_id=user_id,
            refresh_token=request.refresh_token,
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# --------------------------------------------------
# PROFILE
# --------------------------------------------------
# REMOVED: Legacy /auth/profile GET endpoint - use /profile/ instead


# REMOVED: Legacy /auth/profile PUT endpoint - use /profile/ instead


# --------------------------------------------------
# PASSWORD RESET
# --------------------------------------------------
@router.post("/forgot-password", response_model=dict)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    try:
        return AuthService.initiate_password_reset(
            db=db,
            email=request.email,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset-password", response_model=dict)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    try:
        return AuthService.reset_password(
            db=db,
            reset_token=request.reset_token,
            new_password=request.new_password,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --------------------------------------------------
# EMAIL OTP (verification & reset)
# --------------------------------------------------
@router.post("/send-otp", response_model=dict)
def send_otp(
    request: SendOtpRequest,
    db: Session = Depends(get_db),
):
    try:
        return AuthService.send_otp(
            db=db,
            email=request.email,
            purpose=request.purpose,
        )
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify-otp", response_model=dict)
def verify_otp(
    request: VerifyOtpRequest,
    db: Session = Depends(get_db),
):
    try:
        return AuthService.verify_otp(
            db=db,
            email=request.email,
            code=request.code,
            purpose=request.purpose,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
