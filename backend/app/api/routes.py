"""REST + streaming endpoints."""
import json
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app import __version__
from app.graph.workflow import NODE_ORDER, build_graph
from app.schemas import AnalyzeRequest, BugReport
from app.services import llm

router = APIRouter(prefix="/api")

SAMPLES = [
    {"label": "Login fails", "text": "Users cannot log in after the latest update. The login button shows a spinner "
     "forever and the console shows a 401 error even with the correct password."},
    {"label": "Double charge", "text": "Customers are being charged twice at checkout when they click the Pay button "
     "and the network is slow. Orders show duplicated payments in the billing dashboard."},
    {"label": "Upload slow", "text": "Uploading profile pictures is very slow and sometimes times out for files above "
     "2MB on mobile networks."},
    {"label": "UI typo", "text": "There is a spelling mistake on the pricing page header and the Contact button is "
     "slightly misaligned on small screens."},
]


def _to_report(state: dict) -> BugReport:
    return BugReport(
        title=state["title"], affected_feature=state["affected_feature"], summary=state["summary"],
        severity=state["severity"], severity_reason=state["severity_reason"],
        root_causes=state["root_causes"], steps_to_reproduce=state["steps_to_reproduce"],
        suggested_next_steps=state["suggested_next_steps"], report_markdown=state["final_report"],
        engine=llm.engine_name(), generated_at=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/health")
def health():
    return {"status": "ok", "version": __version__, "engine": llm.engine_name(), "nodes": NODE_ORDER}


@router.get("/samples")
def samples():
    return SAMPLES


@router.post("/analyze", response_model=BugReport)
def analyze(req: AnalyzeRequest):
    """Run the full workflow and return the structured report."""
    try:
        state = build_graph().invoke({"bug_description": req.description.strip()})
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Workflow failed: {exc}") from exc
    return _to_report(state)


@router.post("/analyze/stream")
def analyze_stream(req: AnalyzeRequest):
    """Server-Sent Events: emits one event per finished node, then the final report."""
    def events():
        state = {"bug_description": req.description.strip()}
        try:
            yield f"data: {json.dumps({'type': 'start', 'nodes': NODE_ORDER})}\n\n"
            for update in build_graph().stream(state, stream_mode="updates"):
                for node, data in update.items():
                    state.update(data)
                    yield f"data: {json.dumps({'type': 'node', 'node': node, 'data': {k: v for k, v in data.items() if k != 'final_report'}})}\n\n"
            report = _to_report(state)
            yield f"data: {json.dumps({'type': 'done', 'report': report.model_dump()})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"
    return StreamingResponse(events(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
