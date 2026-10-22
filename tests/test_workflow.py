"""Run with:  cd backend && pytest ../tests -q   (uses the offline demo engine)."""
import os, sys
os.environ["FORCE_DEMO_MODE"] = "true"
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.graph.workflow import build_graph

client = TestClient(app)


def test_graph_produces_full_state():
    s = build_graph().invoke({"bug_description": "App crashes and user data is lost after saving the profile."})
    assert s["severity"] == "Critical"
    assert {"title", "affected_feature", "summary", "root_causes", "final_report"} <= s.keys()


def test_low_severity_for_cosmetic_bug():
    s = build_graph().invoke({"bug_description": "Spelling mistake on the footer text of the pricing page."})
    assert s["severity"] == "Low"


def test_api_health_and_analyze():
    assert client.get("/api/health").json()["status"] == "ok"
    r = client.post("/api/analyze", json={"description": "Users cannot log in after the latest update."})
    assert r.status_code == 200 and r.json()["severity"] in ("Critical", "High", "Medium", "Low")


def test_validation_rejects_short_input():
    assert client.post("/api/analyze", json={"description": "bug"}).status_code == 422
