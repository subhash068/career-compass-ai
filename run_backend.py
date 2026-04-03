#!/usr/bin/env python3
"""
Startup script for Career Compass AI Backend
Ensures proper environment setup and database initialization
"""
import os
import sys
import subprocess

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from dotenv import load_dotenv

# Load .env file explicitly
load_dotenv(override=True)

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
os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))
subprocess.run([
    sys.executable,
    "-m",
    "uvicorn",
    "app:app",
    "--host",
    "0.0.0.0",
    "--port",
    str(port),
    "--reload",
])
