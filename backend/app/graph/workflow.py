"""LangGraph workflow definition:  START -> analysis -> severity -> root cause -> format -> END."""
from functools import lru_cache

from langgraph.graph import END, START, StateGraph

from app.graph.nodes import (bug_analysis_node, format_report_node, root_cause_node,
                             severity_detection_node)
from app.graph.state import BugState

NODE_ORDER = ["bug_analysis", "severity_detection", "root_cause", "format_report"]


@lru_cache(maxsize=1)
def build_graph():
    g = StateGraph(BugState)
    g.add_node("bug_analysis", bug_analysis_node)
    g.add_node("severity_detection", severity_detection_node)
    g.add_node("root_cause", root_cause_node)
    g.add_node("format_report", format_report_node)
    g.add_edge(START, "bug_analysis")
    g.add_edge("bug_analysis", "severity_detection")
    g.add_edge("severity_detection", "root_cause")
    g.add_edge("root_cause", "format_report")
    g.add_edge("format_report", END)
    return g.compile()
