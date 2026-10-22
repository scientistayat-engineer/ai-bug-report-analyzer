"""Application settings loaded from environment variables."""
import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    google_api_key: str = os.getenv("GOOGLE_API_KEY", "").strip()
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    force_demo: bool = os.getenv("FORCE_DEMO_MODE", "false").lower() == "true"
    frontend_dir: Path = BASE_DIR.parent / "frontend"

    @property
    def use_gemini(self) -> bool:
        placeholder = self.google_api_key in ("", "your_gemini_api_key_here")
        return not placeholder and not self.force_demo


settings = Settings()
