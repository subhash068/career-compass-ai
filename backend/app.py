import sys
import os
from fastapi import FastAPI, Depends, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from prometheus_client import Counter, Gauge, generate_latest, CONTENT_TYPE_LATEST


# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from models.database import get_db

# Import models
from models.user import User
from models.skill import Skill
from models.domain import Domain
from models.job_role import JobRole
from models.role_skill_requirement import RoleSkillRequirement
from models.learning_path_step import LearningPathStep
from models.learning_path import LearningPath, LearningPathStepAssociation
from models.learning_resource import LearningResource
from models.chat_session import ChatSession
from models.chat_message import ChatMessage
from models.skill_assessment import SkillAssessment
from models.user_skill import UserSkill
from models.certificate import Certificate

# Routers
from routes import auth_fastapi as auth
from routes.skills import router as skills_router
from routes.assessment import router as assessment_router
from routes.domains import router as domains_router
from routes.career import router as career_router
from routes.learning import router as learning_router
from routes.chatbot import router as chatbot_router
from routes.admin import router as admin_router
from routes.admin_quiz import router as admin_quiz_router
from routes.admin_logs import router as admin_logs_router
from routes.admin_domains import router as admin_domains_router
from routes.user_notes import router as user_notes_router
from routes.resume import router as resume_router
from routes.certificate import router as certificate_router
from routes.admin_ai_settings import router as admin_ai_settings_router
from dotenv import load_dotenv
load_dotenv()
from routes import admin_chat
from routes.profile import router as profile_router


# DATABASE_URL from models.database

# -----------------------------
# Create FastAPI app
# -----------------------------
app = FastAPI(
    title="A Multi-Layered Skill Gap Analysis and Career Recommendation System",
    description="A multi-layered skill gap analysis and career recommendation system",
    version="1.0.0",
)

HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status"],
)
HTTP_REQUEST_ERRORS_TOTAL = Counter(
    "http_request_errors_total",
    "Total number of HTTP requests resulting in server-side errors",
    ["method", "endpoint"],
)
HTTP_REQUESTS_IN_PROGRESS = Gauge(
    "http_requests_in_progress",
    "Current number of in-progress HTTP requests",
)

# print(f"DEBUG: DATABASE_URL = {DATABASE_URL}")

# -----------------------------
# CORS helpers
# -----------------------------
def _parse_env_list(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip().rstrip("/") for item in value.split(",") if item.strip()]


def _build_cors_origins() -> list[str]:
    static_origins = [
        "http://localhost:8080",
        "https://localhost:8080",
        "http://localhost:8081",
        "http://localhost:5000",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5173",
        "http://0.0.0.0:5000",
    ]
    env_origins = []
    env_origins.extend(_parse_env_list(os.getenv("CORS_ORIGINS")))
    env_origins.extend(_parse_env_list(os.getenv("FRONTEND_URL")))
    env_origins.extend(_parse_env_list(os.getenv("FRONTEND_ORIGIN")))

    # Keep order stable while removing duplicates.
    return list(dict.fromkeys([*static_origins, *env_origins]))


CORS_ORIGINS = _build_cors_origins()

# -----------------------------
# CORS middleware (CORRECT)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"^https:\/\/([a-zA-Z0-9-]+\.)*(vercel\.app|onrender\.com|netlify\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    method = request.method
    endpoint = request.url.path
    HTTP_REQUESTS_IN_PROGRESS.inc()
    try:
        response = await call_next(request)
        route = request.scope.get("route")
        if route and hasattr(route, "path"):
            endpoint = route.path
        status_code = str(response.status_code)
        HTTP_REQUESTS_TOTAL.labels(method=method, endpoint=endpoint, status=status_code).inc()
        if response.status_code >= 500:
            HTTP_REQUEST_ERRORS_TOTAL.labels(method=method, endpoint=endpoint).inc()
        return response
    except Exception:
        route = request.scope.get("route")
        if route and hasattr(route, "path"):
            endpoint = route.path
        HTTP_REQUESTS_TOTAL.labels(method=method, endpoint=endpoint, status="500").inc()
        HTTP_REQUEST_ERRORS_TOTAL.labels(method=method, endpoint=endpoint).inc()
        raise
    finally:
        HTTP_REQUESTS_IN_PROGRESS.dec()

# -----------------------------
# Routers
# -----------------------------
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(skills_router, prefix="/skills", tags=["Skills"])
app.include_router(assessment_router, tags=["Assessment"])
app.include_router(domains_router, prefix="/api", tags=["Domains"])
app.include_router(career_router, tags=["Career"])
app.include_router(learning_router, tags=["Learning"])
app.include_router(chatbot_router, tags=["Chatbot"])
app.include_router(admin_router, tags=["Admin"])
app.include_router(admin_quiz_router, tags=["Admin Quiz"])
app.include_router(admin_logs_router, tags=["Admin Logs"])
app.include_router(admin_domains_router, tags=["Admin Domains & Skills"])
app.include_router(user_notes_router, tags=["User Notes"])
app.include_router(resume_router, tags=["Resumes"])
app.include_router(certificate_router, tags=["Certificate"])
app.include_router(admin_ai_settings_router, tags=["Admin AI Settings"])
app.include_router(admin_chat.router, prefix="/api/admin", tags=["Admin Chat"])
app.include_router(profile_router, prefix="/profile", tags=["Profile"])

# Privacy router
from routes.privacy import router as privacy_router
app.include_router(privacy_router, tags=["Privacy"])

# -----------------------------
# Static files for Open Badges
# -----------------------------
# Serve badge JSON files
@app.get("/badge/{badge_name}.json")
async def get_badge_json(badge_name: str):
    """Serve badge class JSON files for Open Badges"""
    badge_path = os.path.join(backend_dir, "static", "badge", f"{badge_name}.json")
    if os.path.exists(badge_path):
        return FileResponse(badge_path, media_type="application/json")
    return {"error": "Badge not found"}


# -----------------------------
# Open Badge verification endpoints
# -----------------------------
@app.get("/.well-known/issuer.json")
async def get_issuer_well_known():
    """Serve issuer metadata for Open Badges"""
    issuer_path = os.path.join(backend_dir, "static", "issuer.json")
    if os.path.exists(issuer_path):
        return FileResponse(issuer_path, media_type="application/json")
    # Fallback to dynamic response
    from services.open_badge_service import OpenBadgeService
    return OpenBadgeService.get_well_known_issuer()


@app.get("/career-logo.png")
async def get_career_logo():
    """Serve logo when requests hit backend origin."""
    candidates = [
        os.path.join(backend_dir, "static", "career-logo.png"),
        os.path.join(os.path.dirname(backend_dir), "frontend", "public", "career-logo.png"),
    ]
    for path in candidates:
        if os.path.exists(path):
            return FileResponse(path, media_type="image/png")
    return {"error": "Logo not found"}


@app.api_route(
    "/assessment/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
)
async def assessment_compat_redirect(path: str, request: Request):
    """
    Backward-compat route: some clients hit /assessment/*.
    Redirect them to the canonical /api/assessment/* routes.
    """
    target = f"/api/assessment/{path}"
    if request.url.query:
        target = f"{target}?{request.url.query}"
    return RedirectResponse(url=target, status_code=307)



# -----------------------------
# Health check
# -----------------------------
@app.get("/health")
def get_health():
    """
    Lightweight liveness endpoint for platform health checks (Railway/Render/etc).
    Must not depend on external services so deploy health checks can pass quickly.
    """
    return {"status": "ok"}


@app.get("/status")
def get_status(db: Session = Depends(get_db)):
    """
    Readiness-style status endpoint that includes database connectivity.
    """
    try:
        db.execute(text("SELECT 1"))
        return {"status": "running", "database": "connected"}
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail={"status": "degraded", "database": "unavailable", "error": str(exc)},
        )


@app.get("/metrics", include_in_schema=False)
def get_metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

# -----------------------------
# Debug users
# -----------------------------
@app.get("/debug/users")
def debug_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": u.id, "email": u.email, "name": u.name} for u in users]

# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
