"""Shared state that flows through the LangGraph workflow."""
from typing import List, TypedDict


class BugState(TypedDict, total=False):
    # input
    bug_description: str
    # node 1
    title: str
    affected_feature: str
    summary: str
    # node 2
    severity: str
    severity_reason: str
    # node 3
    root_causes: List[str]
    # node 4
    steps_to_reproduce: List[str]
    suggested_next_steps: List[str]
    final_report: str
