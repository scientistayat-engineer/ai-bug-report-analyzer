"""Prompt templates for every LLM-backed node."""

ANALYSIS_PROMPT = """You are a senior QA engineer. Read the bug description and extract:
- a short, specific bug title (max 12 words)
- the affected feature/module
- a clear two-sentence summary of the issue.

Bug description:
\"\"\"{description}\"\"\""""

SEVERITY_PROMPT = """You are a QA triage lead. Classify the severity of this bug as exactly one of:
Critical (crash, data loss, security hole, payments/core flow fully blocked),
High (major feature broken, no reasonable workaround),
Medium (feature partly broken or degraded, workaround exists),
Low (cosmetic or minor inconvenience).
Give a one or two sentence reason.

Title: {title}
Feature: {affected_feature}
Summary: {summary}
Original description: {description}"""

ROOT_CAUSE_PROMPT = """You are a senior software engineer. Suggest 3 to 5 plausible technical root causes
for this bug, most likely first. Be specific and concise (one sentence each).

Title: {title}
Feature: {affected_feature}
Summary: {summary}
Severity: {severity}
Original description: {description}"""

EXTRAS_PROMPT = """You are preparing a developer-ready bug report. Based on the bug below, write:
- 3 to 5 concrete steps to reproduce
- 3 to 4 recommended next steps for the engineering team.

Title: {title}
Feature: {affected_feature}
Summary: {summary}
Severity: {severity}
Likely causes: {causes}
Original description: {description}"""
