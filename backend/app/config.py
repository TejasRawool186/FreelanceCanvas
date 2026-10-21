import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8010
    DEBUG: bool = True

    # Directories
    DATA_DIR: Path = BASE_DIR / "data"
    ARTIFACTS_DIR: Path = BASE_DIR / "data" / "artifacts"
    UPLOADS_DIR: Path = BASE_DIR / "data" / "uploads"
    PORTFOLIO_DIR: Path = BASE_DIR / "data" / "portfolio"

    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR / 'data' / 'freelance_desk.db'}"

    # Vector Store
    QDRANT_PATH: Path = BASE_DIR / "data" / "qdrant_storage"
    QDRANT_COLLECTION: str = "freelancer_portfolio"

    # Ollama Local LLM
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma3:1b"

    # Partner APIs
    SERPAPI_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM"
    SENTRY_DSN: str = ""

    # Security & CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,http://localhost:8010"
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_AI_BURST: int = 20
    RATE_LIMIT_DEFAULT_BURST: int = 150
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure directories exist
for folder in [settings.DATA_DIR, settings.ARTIFACTS_DIR, settings.UPLOADS_DIR, settings.PORTFOLIO_DIR, settings.QDRANT_PATH]:
    folder.mkdir(parents=True, exist_ok=True)
