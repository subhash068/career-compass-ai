from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, text, Integer as SQLInteger
from sqlalchemy.orm import relationship
import bcrypt

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    name = Column(
        String(255),
        nullable=False
    )

    first_name = Column(
        String(100),
        nullable=True
    )

    last_name = Column(
        String(100),
        nullable=True
    )

    phone = Column(
        String(20),
        nullable=True
    )

    location = Column(
        String(200),
        nullable=True
    )

    experience_years = Column(
        SQLInteger,
        nullable=False,
        default=0
    )

    bio = Column(
        Text,
        nullable=True
    )

    github_url = Column(
        String(255),
        nullable=True
    )

    linkedin_url = Column(
        String(255),
        nullable=True
    )

    portfolio_url = Column(
        String(255),
        nullable=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(50),
        nullable=False,
        server_default=text("'user'")
    )

    current_role = Column(
        String(255),
        nullable=False,
        server_default=text("''")
    )

    is_verified = Column(
        Boolean,
        nullable=False,
        server_default=text("'0'")
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP")
    )

    # -------------------------
    # Relationships (recommended)
    # -------------------------
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("SkillAssessment", back_populates="user", cascade="all, delete-orphan")
    assessment_records = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    learning_paths = relationship("LearningPath", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("UserNote", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="user", cascade="all, delete-orphan")


    # -------------------------
    # Password helpers
    # -------------------------

    def set_password(self, password: str) -> None:
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        self.password_hash = hashed.decode("utf-8")

    def verify_password(self, password: str) -> bool:
        try:
            return bcrypt.checkpw(
                password.encode("utf-8"),
                self.password_hash.encode("utf-8")
            )
        except ValueError:
            # Handle invalid salt/hash gracefully
            return False

    def to_dict(self) -> dict:
        full_name = f"{self.first_name or ''} {self.last_name or self.name or ''}".strip()
        return {
            "id": self.id,
            "email": self.email,
            "name": full_name or self.name,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "location": self.location,
            "experience_years": self.experience_years,
            "bio": self.bio,
            "github_url": getattr(self, "github_url", None),
            "linkedin_url": getattr(self, "linkedin_url", None),
            "portfolio_url": getattr(self, "portfolio_url", None),
            "role": self.role,
            "currentRole": self.current_role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    @classmethod
    def create(cls, db, email, name, password, role='user', current_role=''):
        user = cls(email=email, name=name, role=role, current_role=current_role)
        user.set_password(password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @classmethod
    def find_by_email(cls, db, email):
        return db.query(cls).filter(cls.email == email).first()

    @classmethod
    def find_by_id(cls, db, user_id):
        return db.query(cls).filter(cls.id == user_id).first()
