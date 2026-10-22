"""The four LangGraph nodes. Each takes the state and returns a partial update."""
from datetime import datetime

from app.graph.state import BugState
from app.services import llm

SEVERITY_ICON = {"Critical": "🔴", "High": "🟠", "Medium": "🟡", "Low": "🟢"}


def bug_analysis_node(state: BugState) -> dict:
    """Node 1 - extract title, affected feature and summary."""
    result = llm.analyze_bug(state["bug_description"])
    return {"title": result.title, "affected_feature": result.affected_feature, "summary": result.summary}


def severity_detection_node(state: BugState) -> dict:
    """Node 2 - classify as Critical / High / Medium / Low."""
    result = llm.detect_severity(state)
    return {"severity": result.severity, "severity_reason": result.reason}


def root_cause_node(state: BugState) -> dict:
    """Node 3 - suggest possible root causes."""
    result = llm.suggest_causes(state)
    return {"root_causes": result.causes}


def format_report_node(state: BugState) -> dict:
    """Node 4 - assemble the final, readable bug report (Markdown)."""
    extras = llm.build_extras(state)
    now = datetime.now().strftime("%d %b %Y, %H:%M")
    icon = SEVERITY_ICON.get(state["severity"], "")
    causes = "\n".join(f"{i}. {c}" for i, c in enumerate(state["root_causes"], 1))
    steps = "\n".join(f"{i}. {s}" for i, s in enumerate(extras.steps_to_reproduce, 1))
    nxt = "\n".join(f"- {s}" for s in extras.suggested_next_steps)
    report = f"""# Bug Report: {state['title']}

| Field | Details |
|---|---|
| **Severity** | {icon} {state['severity']} |
| **Affected Feature** | {state['affected_feature']} |
| **Generated** | {now} |

## Summary
{state['summary']}

## Severity Assessment
**{state['severity']}** - {state['severity_reason']}

## Possible Root Causes
{causes}

## Steps to Reproduce
{steps}

## Recommended Next Steps
{nxt}
"""
    return {"steps_to_reproduce": extras.steps_to_reproduce,
            "suggested_next_steps": extras.suggested_next_steps,
            "final_report": report}
