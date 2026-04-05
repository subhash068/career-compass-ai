from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    current_role: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=200)
    experience_years: Optional[int] = Field(None, ge=0, le=50)
    bio: Optional[str] = Field(None, max_length=1000)
    github_url: Optional[str] = Field(None, max_length=255)
    linkedin_url: Optional[str] = Field(None, max_length=255)
    portfolio_url: Optional[str] = Field(None, max_length=255)

    class Config:
        from_attributes = True

class ProfileBasicResponse(BaseModel):
    id: int
    email: str
    name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    role: str
    currentRole: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AccountDetails(BaseModel):
    role: str
    currentRole: str
    is_verified: bool

class UserSkill(BaseModel):
    id: int
    user_id: int
    skill_id: int
    level: int
    confidence: int
    score: float

class SkillsSummary(BaseModel):
    top_skills: list[UserSkill]
    total_skills: int

class AssessmentStats(BaseModel):
    completed_count: int
    avg_score: float

class LearningPathsSummary(BaseModel):
    count: int
    avg_progress: float

class FullProfileResponse(BaseModel):
    basic_information: ProfileBasicResponse
    account_details: AccountDetails
    skills_summary: SkillsSummary
    assessment_stats: AssessmentStats
    learning_paths: LearningPathsSummary
    resumes_count: int
    certificates_count: int

    class Config:
        from_attributes = True
