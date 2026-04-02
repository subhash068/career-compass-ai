#!/usr/bin/env python3
"""Initialize database and create a test user."""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from models.database import create_tables, SessionLocal
from models.user import User
from dotenv import load_dotenv

load_dotenv()

def init_db():
    """Initialize database tables."""
    print("Creating database tables...")
    create_tables()
    print("[OK] Tables created successfully")

def create_test_user():
    """Create a test user for login."""
    db = SessionLocal()
    try:
        # Check if test user exists
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if test_user:
            print("[OK] Test user already exists (test@example.com / password123)")
            return

        # Create test user
        user = User(
            email="test@example.com",
            name="Test User",
            role="user",
            is_verified=True
        )
        user.set_password("password123")
        db.add(user)
        db.commit()
        print("[OK] Test user created: test@example.com / password123")
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing CareerCompass Database...\n")
    init_db()
    create_test_user()
    print("\nDatabase initialization complete!")
    print("\nYou can now login with:")
    print("  Email: test@example.com")
    print("  Password: password123")
