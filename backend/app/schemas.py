"""Pydantic schemas shared by the LLM layer and the REST API."""
from typing import List, Literal

from pydantic import BaseModel, Field

Severity = Literal["Critical", "High", "Medium", "Low"]


class BugAnalysis(BaseModel):
    """Output of Node 1 - Bug Analysis."""
    title: str = Field(description="Short, specific bug title (max 12 words).")
    affected_feature: str = Field(description="The feature or module affected.")
    summary: str = Field(description="Two-sentence summary of the issue.")


class SeverityResult(BaseModel):
    """Output of Node 2 - Severity Detection."""
    severity: Severity
    reason: str = Field(description="One or two sentences justifying the severity.")


class RootCauses(BaseModel):
    """Output of Node 3 - Root Cause Suggestion."""
    causes: List[str] = Field(description="3 to 5 plausible root causes, most likely first.")


class ReportExtras(BaseModel):
    """Extra content generated while formatting the report (Node 4)."""
    steps_to_reproduce: List[str] = Field(description="3 to 5 concrete reproduction steps.")
    suggested_next_steps: List[str] = Field(description="3 to 4 recommended actions for developers.")


class AnalyzeRequest(BaseModel):
    description: str = Field(min_length=10, max_length=4000,
                             description="Bug description in natural language.")


class BugReport(BaseModel):
    title: str
    affected_feature: str
    summary: str
    severity: Severity
    severity_reason: str
    root_causes: List[str]
    steps_to_reproduce: List[str]
    suggested_next_steps: List[str]
    report_markdown: str
    engine: str
    generated_at: str
