import os
import redis
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import QueuePool, NullPool

from dotenv import load_dotenv

# DATABASE_URL = os.getenv("DATABASE_URL_DEV", "mysql+mysqlconnector://root:kali@localhost/career_compass")

load_dotenv()

# -------------------------
# Declarative Base
# -------------------------
Base = declarative_base()

# -------------------------
# Database URL (single source of truth)
# -------------------------
def get_database_url() -> str:
    env = os.getenv("ENVIRONMENT", "development").lower()

    if env == "production":
        return os.getenv(
            "DATABASE_URL_PROD",
            "mysql+mysqlconnector://root:kali@localhost/career_compass",
        )
    elif env == "test":
        return os.getenv(
            "DATABASE_URL_TEST",
            "sqlite:///./test_career_compass.db",
        )
    else:
        return os.getenv(
            "DATABASE_URL_DEV",
            "sqlite:///./career_compass.db",
        )


DATABASE_URL = get_database_url()
IS_SQLITE = DATABASE_URL.startswith("sqlite")

# -------------------------
# SQLAlchemy Engine
# -------------------------
if IS_SQLITE:
    pool_kwargs = {
        "pool_pre_ping": False,
        "pool_reset_on_return": "rollback",
        "poolclass": NullPool
    }
else:
    pool_kwargs = {
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_reset_on_return": "rollback",
        "poolclass": QueuePool
    }

engine = create_engine(
    DATABASE_URL,
echo=os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true",  # Disable verbose logging
    connect_args={"check_same_thread": False} if IS_SQLITE else {},
    **pool_kwargs
)





# -------------------------
# Session Factory
# -------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# -------------------------
# Redis Singleton
# -------------------------
class RedisConnection:
    _instance = None
    _redis_client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def connect(self):
        if self._redis_client is None:
            try:
                client = redis.Redis(
                    host='redis-19426.c239.us-east-1-2.ec2.cloud.redislabs.com',
                    port=19426,
                    decode_responses=True,
                    username="default",
                    password="8cWErxIfAC2l8PjEAfYLLp339h6Ekv2m",
                    socket_connect_timeout=5
                )
                client.ping()
                self._redis_client = client
                print("[INFO] Redis Cloud connected successfully")
            except Exception as e:
                print(f"[WARN] Redis unavailable: {e}")
                self._redis_client = None
        return self._redis_client



redis_client = RedisConnection()


def get_redis():
    return redis_client.connect()

# -------------------------
# FastAPI DB Dependency
# -------------------------
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

# -------------------------
# Dev/Test ONLY
# -------------------------
def create_tables():
    """
    ⚠️ Dev/Test ONLY - Creates tables if they don't exist
    Use Alembic migrations in production.
    """
    try:
        Base.metadata.create_all(bind=engine)
        print("[INFO] Tables created/verified successfully")
    except Exception as e:
        print(f"[ERROR] Table creation failed: {e}")
