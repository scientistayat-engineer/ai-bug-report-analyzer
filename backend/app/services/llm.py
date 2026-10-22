"""LLM service layer: Gemini via LangChain, with an offline fallback engine."""
import logging
from typing import Callable, Type, TypeVar

from pydantic import BaseModel

from app.config import settings
from app.graph import prompts
from app.schemas import BugAnalysis, ReportExtras, RootCauses, SeverityResult
from app.services import demo_engine

log = logging.getLogger("bug-analyzer.llm")
T = TypeVar("T", bound=BaseModel)

_model = None


def engine_name() -> str:
    return f"Gemini ({settings.gemini_model})" if settings.use_gemini else "Demo engine (offline)"


def _get_model():
    global _model
    if _model is None:
        from langchain_google_genai import ChatGoogleGenerativeAI
        _model = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.google_api_key,
            temperature=0.2,
        )
    return _model


def _ask(schema: Type[T], prompt: str, fallback: Callable[[], T]) -> T:
    """Call Gemini with structured output; fall back to the demo engine on any failure."""
    if not settings.use_gemini:
        return fallback()
    try:
        structured = _get_model().with_structured_output(schema)
        return structured.invoke(prompt)
    except Exception as exc:  # network, quota, parsing ...
        log.warning("Gemini call failed (%s); using fallback engine.", exc)
        return fallback()


def analyze_bug(description: str) -> BugAnalysis:
    return _ask(BugAnalysis, prompts.ANALYSIS_PROMPT.format(description=description),
                lambda: demo_engine.analyze(description))


def detect_severity(state: dict) -> SeverityResult:
    return _ask(SeverityResult,
                prompts.SEVERITY_PROMPT.format(description=state["bug_description"], title=state["title"],
                                               affected_feature=state["affected_feature"], summary=state["summary"]),
                lambda: demo_engine.detect_severity(state["bug_description"], state["affected_feature"]))


def suggest_causes(state: dict) -> RootCauses:
    return _ask(RootCauses,
                prompts.ROOT_CAUSE_PROMPT.format(description=state["bug_description"], title=state["title"],
                                                 affected_feature=state["affected_feature"],
                                                 summary=state["summary"], severity=state["severity"]),
                lambda: demo_engine.suggest_causes(state["bug_description"], state["affected_feature"],
                                                   state["severity"]))


def build_extras(state: dict) -> ReportExtras:
    return _ask(ReportExtras,
                prompts.EXTRAS_PROMPT.format(description=state["bug_description"], title=state["title"],
                                             affected_feature=state["affected_feature"], summary=state["summary"],
                                             severity=state["severity"], causes="; ".join(state["root_causes"])),
                lambda: demo_engine.build_extras(state["bug_description"], state["affected_feature"],
                                                 state["severity"]))
