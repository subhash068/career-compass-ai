#!/usr/bin/env python3
"""
Startup script for Career Compass AI Backend
Ensures proper environment setup and database initialization
"""
import os
import sys
import subprocess

# Resolve project paths from this file location.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(BACKEND_DIR)

# Add backend to import path
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from dotenv import load_dotenv

# Load backend .env first (primary), then root .env as fallback.
load_dotenv(dotenv_path=os.path.join(BACKEND_DIR, ".env"), override=True)
load_dotenv(dotenv_path=os.path.join(REPO_ROOT, ".env"), override=False)

# Verify environment setup
print("Environment Configuration:")
print(f"  ENVIRONMENT: {os.getenv('ENVIRONMENT', '')}")
print(f"  DATABASE_URL_DEV: {os.getenv('DATABASE_URL_DEV', 'NOT SET')}")
print(f"  JWT_SECRET_KEY: {'SET' if os.getenv('JWT_SECRET_KEY') else 'NOT SET'}")

# Verify database connection
from models.database import DATABASE_URL, get_database_url
print(f"\nDatabase URL being used: {DATABASE_URL}")

# Initialize database
print("\nInitializing database...")
from models.database import create_tables, SessionLocal
from models.user import User

try:
    create_tables()
    print("  [OK] Tables verified/created")

    # Verify test user
    db = SessionLocal()
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if test_user:
        print("  [OK] Test user exists (test@example.com / password123)")
    else:
        print("  [WARN] Test user NOT found, creating...")
        user = User(
            email="test@example.com",
            name="Test User",
            role="user",
            is_verified=True
        )
        user.set_password("password123")
        db.add(user)
        db.commit()
        print("  [OK] Test user created")
    db.close()

except Exception as e:
    print(f"  [ERROR] {e}")
    sys.exit(1)

print("\n" + "="*60)
print("Starting Backend Server...")
print("="*60 + "\n")

# Start uvicorn
port = os.getenv("PORT", "8000")
environment = os.getenv("ENVIRONMENT", "development").lower()
reload_default = "false" if environment == "production" else "true"
reload_enabled = os.getenv("UVICORN_RELOAD", reload_default).lower() == "true"
os.chdir(BACKEND_DIR)
uvicorn_cmd = [
    sys.executable,
    "-m",
    "uvicorn",
    "app:app",
    "--host",
    "0.0.0.0",
    "--port",
    str(port),
]
if reload_enabled:
    uvicorn_cmd.append("--reload")

subprocess.run(uvicorn_cmd)
