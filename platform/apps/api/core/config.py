"""
WARIS API Configuration
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Application
    APP_NAME: str = "WARIS API"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Security
    SECRET_KEY: str = "change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    # Database - PostgreSQL
    DATABASE_URL: str = "postgresql+asyncpg://waris:waris@localhost:5432/waris"

    # Database - MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "waris"

    # Database - Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Vector Database - Milvus
    MILVUS_HOST: str = "localhost"
    MILVUS_PORT: int = 19530

    # LLM Server
    LLM_SERVER_URL: str = "http://localhost:8080"
    LLM_MODEL_NAME: str = "openthaigpt-r1"

    # DMAMA Integration
    DMAMA_API_URL: str = ""
    DMAMA_API_KEY: str = ""


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
