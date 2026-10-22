"""Offline heuristic engine.

Used automatically when no Gemini API key is configured, so the whole
project (UI + LangGraph workflow) can be demonstrated without network access.
It is rule-based and NOT an LLM - production use should configure Gemini.
"""
import re
from typing import List, Tuple

from app.schemas import BugAnalysis, ReportExtras, RootCauses, SeverityResult

FEATURES: List[Tuple[str, List[str]]] = [
    ("Authentication / Login", ["login", "log in", "sign in", "signin", "password", "otp", "2fa", "session", "logout"]),
    ("Payments / Checkout", ["payment", "checkout", "card", "invoice", "refund", "charge", "billing", "order"]),
    ("File Upload / Storage", ["upload", "attachment", "file", "image", "download", "pdf"]),
    ("Search", ["search", "filter", "sort", "query"]),
    ("Notifications", ["notification", "email", "push", "sms", "reminder"]),
    ("User Profile / Settings", ["profile", "avatar", "settings", "account", "preferences"]),
    ("Dashboard / Reporting", ["dashboard", "chart", "report", "analytics", "graph"]),
    ("Mobile App", ["android", "ios", "iphone", "mobile", "app crashes"]),
    ("API / Backend", ["api", "endpoint", "500", "timeout", "server", "database", "query"]),
    ("User Interface", ["button", "layout", "alignment", "css", "font", "color", "page", "screen", "ui", "display"]),
]

CRITICAL = ["crash", "data loss", "lost data", "deleted", "security", "leak", "breach", "unauthorized",
            "payment fail", "charged twice", "double charge", "cannot pay", "corrupt", "production down", "outage"]
HIGH = ["cannot", "can't", "unable", "fails", "failed", "broken", "not working", "doesn't work", "500", "error",
        "blocked", "stuck", "freeze", "frozen", "no response"]
MEDIUM = ["slow", "delay", "wrong", "incorrect", "missing", "intermittent", "sometimes", "lag", "duplicate"]
LOW = ["typo", "spelling", "alignment", "color", "colour", "font", "cosmetic", "misaligned", "padding", "tooltip"]

CAUSES = {
    "Authentication / Login": [
        "Session or JWT token expiring early or not being refreshed correctly.",
        "Password hash comparison or credential validation logic failing for specific inputs.",
        "Cookie / CORS configuration blocking the session from being stored.",
        "Rate limiting or account lock rules being triggered unexpectedly.",
    ],
    "Payments / Checkout": [
        "Payment gateway callback or webhook not being handled idempotently.",
        "Race condition between order creation and payment confirmation.",
        "Incorrect currency, rounding or amount calculation before the gateway call.",
        "Missing error handling for declined or timed-out gateway responses.",
    ],
    "File Upload / Storage": [
        "File size or MIME-type validation rejecting valid files.",
        "Request timeout or reverse-proxy body-size limit hit during upload.",
        "Storage bucket permissions or signed-URL expiry misconfigured.",
        "Stream not fully read or closed before processing begins.",
    ],
    "Search": [
        "Query is not sanitised or tokenised correctly, so valid terms return nothing.",
        "Search index is stale or not updated after data changes.",
        "Pagination or sorting parameters conflicting with the filter logic.",
    ],
    "Notifications": [
        "Background job / queue worker failing silently or not running.",
        "Email or push provider credentials expired or rate limited.",
        "Notification preferences not being checked consistently.",
    ],
    "User Profile / Settings": [
        "Update endpoint not persisting all fields to the database.",
        "Client-side cache showing stale profile data after a save.",
        "Validation rules differing between frontend and backend.",
    ],
    "Dashboard / Reporting": [
        "Aggregation query using the wrong time range or timezone.",
        "Cached results not invalidated when source data changes.",
        "Chart component receiving null or unexpected data shapes.",
    ],
    "Mobile App": [
        "Unhandled null or lifecycle event (background / resume) on the device.",
        "Platform-specific permission or OS-version incompatibility.",
        "Memory pressure causing the app process to be terminated.",
    ],
    "API / Backend": [
        "Unhandled exception in the request handler returning a 500 response.",
        "Slow or unindexed database query causing timeouts under load.",
        "Missing input validation allowing malformed payloads through.",
        "Dependency or downstream service being unavailable.",
    ],
    "User Interface": [
        "CSS rule or responsive breakpoint overriding the intended layout.",
        "Component state not updating after the triggering event.",
        "Browser-specific rendering difference not covered by testing.",
    ],
}
DEFAULT_CAUSES = [
    "Unhandled edge case in the business logic for the reported scenario.",
    "Recent code change introducing a regression in this module.",
    "Missing validation or error handling for unexpected input.",
]


def _lower(text: str) -> str:
    return text.lower()


def _first_sentence(text: str) -> str:
    text = re.sub(r"\s+", " ", text.strip())
    m = re.split(r"(?<=[.!?])\s", text, maxsplit=1)
    return m[0] if m else text


def detect_feature(text: str) -> str:
    t = _lower(text)
    best, score = "General Application", 0
    for name, words in FEATURES:
        s = sum(1 for w in words if w in t)
        if s > score:
            best, score = name, s
    return best


def analyze(description: str) -> BugAnalysis:
    feature = detect_feature(description)
    first = _first_sentence(description).rstrip(".!?")
    words = first.split()
    title = " ".join(words[:12]) + ("..." if len(words) > 12 else "")
    title = title[:1].upper() + title[1:]
    sentences = re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", description.strip()))
    summary = " ".join(sentences[:2]).strip()
    if len(summary) > 320:
        summary = summary[:317].rstrip() + "..."
    return BugAnalysis(title=title, affected_feature=feature, summary=summary)


def detect_severity(description: str, feature: str) -> SeverityResult:
    t = _lower(description)
    if any(k in t for k in CRITICAL):
        return SeverityResult(severity="Critical",
                              reason="The report mentions a crash, data loss, security or payment-integrity problem that "
                                     "directly harms users or the business and needs immediate attention.")
    if any(k in t for k in HIGH) and feature not in ("User Interface",):
        return SeverityResult(severity="High",
                              reason=f"A core capability of {feature} is failing and users have no clear workaround, "
                                     "so the issue should be fixed in the current sprint.")
    if any(k in t for k in LOW) and not any(k in t for k in MEDIUM):
        return SeverityResult(severity="Low",
                              reason="The problem is cosmetic or a minor inconvenience and does not block any "
                                     "user workflow.")
    if any(k in t for k in MEDIUM) or any(k in t for k in HIGH):
        return SeverityResult(severity="Medium",
                              reason="The feature is degraded or behaves inconsistently, but users can still "
                                     "complete their task with a workaround.")
    return SeverityResult(severity="Low",
                          reason="No evidence of data loss or a blocked workflow was described; treating it as a "
                                 "low-priority defect.")


def suggest_causes(description: str, feature: str, severity: str) -> RootCauses:
    causes = list(CAUSES.get(feature, DEFAULT_CAUSES))
    t = _lower(description)
    if "after" in t and ("update" in t or "deploy" in t or "release" in t):
        causes.insert(0, "A regression introduced by the most recent deployment or dependency update.")
    if "sometimes" in t or "intermittent" in t or "random" in t:
        causes.append("A timing or concurrency issue (race condition) that only appears intermittently.")
    return RootCauses(causes=causes[:5])


def build_extras(description: str, feature: str, severity: str) -> ReportExtras:
    steps = [
        f"Open the application and navigate to the {feature} area.",
        "Perform the action described in the bug report using the same input or data.",
        "Observe the behaviour and compare it with the expected result.",
        "Repeat on another browser or device to check whether the problem is consistent.",
    ]
    nxt = [
        "Reproduce the issue in a staging environment and capture logs / screenshots.",
        "Review recent commits and deployments touching this feature.",
        "Add an automated regression test once the root cause is confirmed.",
    ]
    if severity in ("Critical", "High"):
        nxt.insert(0, "Escalate to the on-call engineer and notify stakeholders immediately.")
    return ReportExtras(steps_to_reproduce=steps, suggested_next_steps=nxt[:4])
