"""FastAPI application entrypoint. Run:  uvicorn app.main:app --reload"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import __version__
from app.api.routes import router
from app.config import settings

app = FastAPI(title="AI Bug Report Analyzer", version=__version__,
              description="Turns a natural-language bug description into a structured bug report "
                          "using a 4-node LangGraph workflow powered by Gemini.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(router)

if settings.frontend_dir.exists():
    app.mount("/", StaticFiles(directory=settings.frontend_dir, html=True), name="frontend")
