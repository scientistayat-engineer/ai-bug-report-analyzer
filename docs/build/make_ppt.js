const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const path = require("path");
const SS = p => path.join(__dirname, "..", "screenshots", p);

const BG = "0B0F17", PANEL = "131A27", LINE = "233047", TXT = "E8EDF5", MUT = "8B9BB4", ACC = "2DD4BF";
const SEV = { Critical: "F43F5E", High: "FB923C", Medium: "FACC15", Low: "4ADE80" };
const F = "Calibri", FM = "Consolas";

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625
  pres.author = "Anushay Ayat"; pres.title = "AI Bug Report Analyzer (LangGraph)";
  pres.defineSlideMaster({
    title: "CONTENT", background: { color: BG },
    objects: [
      { rect: { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: ACC } } },
      { text: { text: "AI Bug Report Analyzer  |  Anushay Ayat  |  SMIT Batch 12", options: { x: 0.5, y: 5.28, w: 7, h: 0.25, fontFace: F, fontSize: 9, color: MUT, margin: 0 } } },
    ],
    slideNumber: { x: 9.1, y: 5.28, w: 0.5, h: 0.25, fontFace: F, fontSize: 9, color: MUT, align: "right" },
  });
  const T = (s, text, sub) => {
    s.addText(text, { x: 0.5, y: 0.32, w: 9, h: 0.6, fontFace: F, fontSize: 28, bold: true, color: TXT, margin: 0, isTextBox: true });
    if (sub) s.addText(sub, { x: 0.5, y: 0.9, w: 9, h: 0.3, fontFace: F, fontSize: 13, color: ACC, margin: 0, isTextBox: true });
  };
  const content = (title, sub) => { const s = pres.addSlide({ masterName: "CONTENT" }); T(s, title, sub); return s; };
  const card = (s, x, y, w, h, head, body, opts = {}) => {
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: PANEL }, line: { color: LINE, width: 1 }, rectRadius: 0.08 });
    s.addText(head, { x: x + 0.2, y: y + 0.14, w: w - 0.4, h: 0.32, fontFace: F, fontSize: opts.hs || 14, bold: true, color: opts.hc || ACC, margin: 0, isTextBox: true });
    s.addText(body, { x: x + 0.2, y: y + 0.5, w: w - 0.4, h: h - 0.62, fontFace: F, fontSize: opts.bs || 11.5, color: "CBD5E1", valign: "top", margin: 0, isTextBox: true });
  };
  const bullets = (arr, size = 14) => arr.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < arr.length - 1, paraSpaceAfter: 6, fontSize: size } }));
  const shot = async (s, file, x, y, w, h) => {
    const m = await sharp(SS(file)).metadata(); const r = m.width / m.height;
    let iw = w, ih = w / r; if (ih > h) { ih = h; iw = h * r; }
    s.addShape(pres.ShapeType.roundRect, { x: x + (w - iw) / 2 - 0.04, y: y + (h - ih) / 2 - 0.04, w: iw + 0.08, h: ih + 0.08, fill: { color: LINE }, line: { color: LINE }, rectRadius: 0.05 });
    s.addImage({ path: SS(file), x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih });
  };

  /* 1 COVER */
  let s = pres.addSlide(); s.background = { color: BG };
  s.addShape(pres.ShapeType.ellipse, { x: 6.2, y: -1.6, w: 5.5, h: 5.5, fill: { color: ACC, transparency: 90 }, line: { color: ACC, transparency: 90 } });
  s.addShape(pres.ShapeType.ellipse, { x: 7.6, y: 2.9, w: 3.8, h: 3.8, fill: { color: "0EA5E9", transparency: 92 }, line: { color: "0EA5E9", transparency: 92 } });
  s.addShape(pres.ShapeType.rect, { x: 0.6, y: 0.7, w: 0.5, h: 0.5, fill: { color: ACC }, line: { color: ACC } });
  s.addText("B", { x: 0.6, y: 0.7, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: F, fontSize: 22, bold: true, color: "04211D", margin: 0 });
  s.addText("SMIT  |  AI & DATA SCIENCE", { x: 1.25, y: 0.7, w: 5, h: 0.5, valign: "middle", fontFace: FM, fontSize: 12, color: ACC, charSpacing: 3, margin: 0 });
  s.addText("AI Bug Report Analyzer", { x: 0.6, y: 1.55, w: 8, h: 0.9, fontFace: F, fontSize: 46, bold: true, color: TXT, margin: 0 });
  s.addText("Built with LangGraph, Gemini and FastAPI", { x: 0.6, y: 2.4, w: 8, h: 0.45, fontFace: F, fontSize: 20, color: ACC, margin: 0 });
  s.addShape(pres.ShapeType.line, { x: 0.6, y: 3.15, w: 1.2, h: 0, line: { color: ACC, width: 2 } });
  const info = [["Submitted by", "Anushay Ayat"], ["Course", "AI and Data Science"], ["Batch", "12"], ["Submission date", "22 / 10 / 2026"]];
  info.forEach(([k, v], i) => {
    const x = 0.6 + (i % 2) * 3.3, y = 3.4 + Math.floor(i / 2) * 0.72;
    s.addText(k.toUpperCase(), { x, y, w: 3, h: 0.25, fontFace: FM, fontSize: 9, color: MUT, charSpacing: 2, margin: 0 });
    s.addText(v, { x, y: y + 0.25, w: 3, h: 0.35, fontFace: F, fontSize: 16, bold: true, color: TXT, margin: 0 });
  });
  s.addNotes("Introduce yourself, the course and the assignment title.");

  /* 2 AGENDA */
  s = content("Agenda", "What this presentation covers");
  const ag = ["Problem & objective", "Solution overview", "LangGraph workflow", "System architecture", "Backend implementation", "Frontend & user experience", "Screenshots / demo", "Testing & challenges", "Future scope & conclusion"];
  ag.forEach((a, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.5 + col * 3.05, y = 1.5 + row * 1.15;
    s.addShape(pres.ShapeType.roundRect, { x, y, w: 2.85, h: 0.95, fill: { color: PANEL }, line: { color: LINE }, rectRadius: 0.08 });
    s.addText(String(i + 1).padStart(2, "0"), { x: x + 0.15, y, w: 0.6, h: 0.95, fontFace: FM, fontSize: 20, bold: true, color: ACC, valign: "middle", margin: 0 });
    s.addText(a, { x: x + 0.8, y, w: 1.95, h: 0.95, fontFace: F, fontSize: 13, color: TXT, valign: "middle", margin: 0 });
  });

  /* 3 PROBLEM */
  s = content("Problem & Objective", "Why a bug report analyzer?");
  card(s, 0.5, 1.45, 4.35, 3.4, "The problem", bullets(["Bug reports are written in free-form, unstructured language", "Developers waste time asking for missing details", "Severity is judged inconsistently between reporters", "Root-cause hunting starts from zero every time"], 12.5), { hs: 16, bs: 12.5 });
  card(s, 5.15, 1.45, 4.35, 3.4, "The objective", bullets(["Accept a bug description in natural language", "Extract title, feature and summary automatically", "Classify severity: Critical, High, Medium, Low", "Suggest likely root causes", "Produce one clean, structured bug report"], 12.5), { hs: 16, bs: 12.5 });

  /* 4 SOLUTION */
  s = content("Solution Overview", "A multi-step AI workflow instead of a single prompt");
  [["Input", "User pastes a bug description in the web app"], ["LangGraph", "4 specialised nodes pass a shared typed state"], ["Gemini", "Structured (Pydantic) output keeps every step reliable"], ["Output", "Readable report + JSON, copy / download ready"]].forEach(([h, b], i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 1.6, 2.15, 2.0, h, b, { hs: 16, bs: 12 });
    if (i < 3) s.addText("→", { x: x + 2.12, y: 2.3, w: 0.2, h: 0.4, fontSize: 16, color: ACC, align: "center", margin: 0 });
  });
  s.addText("Why LangGraph? Each task is isolated, testable and easy to extend - e.g. adding a duplicate-detection node later needs only one new node and one edge.", { x: 0.5, y: 3.95, w: 9, h: 0.7, fontFace: F, fontSize: 13, color: MUT, italic: true, margin: 0 });

  /* 5 WORKFLOW */
  s = content("LangGraph Workflow", "START → 4 nodes → END");
  const nodes = [["Node 1", "Bug Analysis", "Title, affected feature, issue summary"], ["Node 2", "Severity Detection", "Critical / High / Medium / Low + reason"], ["Node 3", "Root Cause", "3-5 possible technical causes"], ["Node 4", "Format Report", "Steps to reproduce, next steps, final report"]];
  s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.55, w: 1.1, h: 0.6, fill: { color: BG }, line: { color: ACC, dashType: "dash" }, rectRadius: 0.3 });
  s.addText("Bug text", { x: 0.5, y: 1.55, w: 1.1, h: 0.6, align: "center", valign: "middle", fontFace: F, fontSize: 11, color: ACC, margin: 0 });
  nodes.forEach(([k, h, b], i) => {
    const x = 0.5 + i * 2.3, y = 2.5;
    card(s, x, y, 2.1, 1.75, h, b, { hs: 14, bs: 11.5 });
    s.addText(k, { x: x + 0.2, y: y - 0.3, w: 1.2, h: 0.25, fontFace: FM, fontSize: 9, color: MUT, charSpacing: 2, margin: 0 });
    if (i < 3) s.addText("→", { x: x + 2.08, y: y + 0.6, w: 0.24, h: 0.4, fontSize: 16, color: ACC, align: "center", margin: 0 });
  });
  s.addText("↓", { x: 0.9, y: 2.05, w: 0.3, h: 0.35, fontSize: 16, color: ACC, align: "center", margin: 0 });
  s.addText("Shared state:  bug_description → title, affected_feature, summary → severity, severity_reason → root_causes → steps, next_steps, final_report", { x: 0.5, y: 4.5, w: 9, h: 0.5, fontFace: FM, fontSize: 10, color: MUT, margin: 0 });

  /* 6 TECH STACK */
  s = content("Technology Stack", "Modern, lightweight and easy to deploy");
  [["Backend", "Python 3.10+, FastAPI, Uvicorn"], ["AI orchestration", "LangGraph (StateGraph), LangChain"], ["LLM", "Google Gemini via langchain-google-genai"], ["Validation", "Pydantic v2 structured output"], ["Frontend", "HTML5, CSS3, vanilla JavaScript"], ["Streaming", "Server-Sent Events (SSE)"]].forEach(([h, b], i) => {
    card(s, 0.5 + (i % 3) * 3.05, 1.5 + Math.floor(i / 3) * 1.7, 2.85, 1.45, h, b, { hs: 15, bs: 12.5 });
  });

  /* 7 STRUCTURE */
  s = content("Project Structure", "Clean separation of concerns");
  s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.4, w: 5.3, h: 3.7, fill: { color: PANEL }, line: { color: LINE }, rectRadius: 0.08 });
  s.addText([
    "ai-bug-report-analyzer/", "├── backend/app/", "│   ├── main.py        FastAPI entry", "│   ├── config.py      settings (.env)", "│   ├── schemas.py     Pydantic models", "│   ├── api/routes.py  REST + SSE", "│   ├── graph/", "│   │   ├── state.py   BugState", "│   │   ├── prompts.py prompts", "│   │   ├── nodes.py   4 nodes", "│   │   └── workflow.py graph", "│   └── services/  llm + demo", "├── frontend/  (html, css, js)", "├── tests/    docs/    README.md"
  ].map((t, i, a) => ({ text: t, options: { breakLine: i < a.length - 1 } })), { x: 0.7, y: 1.5, w: 5, h: 3.5, fontFace: FM, fontSize: 10.5, color: "CBD5E1", valign: "top", margin: 0, isTextBox: true });
  card(s, 6.1, 1.4, 3.4, 3.7, "Design principles", bullets(["Prompts separated from logic", "One file per responsibility", "LLM access isolated in services/", "Graph wiring in one place", "Frontend served by FastAPI", "Config via environment variables"], 12), { hs: 15, bs: 12 });

  /* 8 STATE & NODES */
  s = content("State & Node Implementation", "Each node returns a partial state update");
  s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.4, w: 4.6, h: 3.7, fill: { color: "0A0E15" }, line: { color: LINE }, rectRadius: 0.08 });
  s.addText("class BugState(TypedDict, total=False):\n    bug_description: str\n    title: str\n    affected_feature: str\n    summary: str\n    severity: str\n    severity_reason: str\n    root_causes: List[str]\n    steps_to_reproduce: List[str]\n    suggested_next_steps: List[str]\n    final_report: str\n\ng.add_edge(START, \"bug_analysis\")\ng.add_edge(\"bug_analysis\",\n           \"severity_detection\")\n...  g.add_edge(\"format_report\", END)", { x: 0.7, y: 1.5, w: 4.3, h: 3.5, fontFace: FM, fontSize: 9.5, color: "A7F3D0", valign: "top", margin: 0, isTextBox: true });
  card(s, 5.3, 1.4, 4.2, 3.7, "How it works", bullets(["Node calls Gemini with a focused prompt", "with_structured_output(Schema) returns validated Pydantic objects", "Result is merged into shared state", "Format node renders the final Markdown report", "Any LLM failure falls back to the offline engine"], 12), { hs: 15, bs: 12 });

  /* 9 SEVERITY */
  s = content("Severity Classification", "Four levels with clear definitions");
  [["Critical", "Crash, data loss, security hole or payments fully blocked"], ["High", "Major feature broken, no reasonable workaround"], ["Medium", "Feature degraded or inconsistent, workaround exists"], ["Low", "Cosmetic issue or minor inconvenience"]].forEach(([h, b], i) => {
    const y = 1.45 + i * 0.92;
    s.addShape(pres.ShapeType.roundRect, { x: 0.5, y, w: 9, h: 0.78, fill: { color: PANEL }, line: { color: LINE }, rectRadius: 0.08 });
    s.addShape(pres.ShapeType.roundRect, { x: 0.5, y, w: 0.12, h: 0.78, fill: { color: SEV[h] }, line: { color: SEV[h] }, rectRadius: 0.02 });
    s.addText(h, { x: 0.85, y, w: 1.6, h: 0.78, fontFace: F, fontSize: 18, bold: true, color: SEV[h], valign: "middle", margin: 0 });
    s.addText(b, { x: 2.5, y, w: 6.8, h: 0.78, fontFace: F, fontSize: 14, color: "CBD5E1", valign: "middle", margin: 0 });
  });

  /* 10 API */
  s = content("REST API", "Interactive docs available at /docs");
  const rows = [["Method", "Endpoint", "Purpose"], ["GET", "/api/health", "Status, version and active engine"], ["GET", "/api/samples", "Sample bug descriptions for the UI"], ["POST", "/api/analyze", "Run workflow, return full JSON report"], ["POST", "/api/analyze/stream", "Stream one SSE event per finished node"]];
  s.addTable(rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: { bold: ri === 0, color: ri === 0 ? "04211D" : (ci === 1 ? ACC : "CBD5E1"), fill: { color: ri === 0 ? ACC : (ri % 2 ? PANEL : "0F1520") }, fontFace: ci === 1 ? FM : F, fontSize: 12.5 } }))),
    { x: 0.5, y: 1.5, w: 9, colW: [1.2, 3, 4.8], rowH: 0.5, border: { type: "solid", color: LINE, pt: 1 }, valign: "middle" });
  s.addText("Request body:  { \"description\": \"Users cannot log in after the latest update...\" }   (10 - 4000 characters, validated by Pydantic)", { x: 0.5, y: 4.3, w: 9, h: 0.5, fontFace: FM, fontSize: 10.5, color: MUT, margin: 0 });

  /* SCREENSHOTS */
  const shots = [["Home page", "Hero section with clear call to action", "01-home.png"], ["Bug analyzer workspace", "Input, sample bugs and workflow tracker", "02-analyzer-empty.png"], ["Live workflow & report", "Nodes finish one by one; report appears on the right", "04-report-result.png"], ["Markdown & JSON output", "Developer-ready exports", "05-markdown-tab.png"], ["Architecture & features", "Workflow explainer section", "07-workflow-architecture.png"]];
  for (const [h, sub, f] of shots) { s = content(h, sub); await shot(s, f, 0.5, 1.3, 9, 3.85); }
  s = content("Responsive design", "Works on phones as well as desktops");
  await shot(s, "11-mobile-home.png", 0.5, 1.3, 2.6, 3.85);
  card(s, 3.5, 1.5, 6, 3.4, "Frontend highlights", bullets(["Dark, professional design system with CSS variables", "Fully responsive grid (desktop, tablet, mobile)", "Real-time stepper driven by Server-Sent Events", "Severity badges: red, orange, yellow, green", "Copy, .md and .json export buttons", "Local history of the last six analyses"], 13), { hs: 16, bs: 13 });

  /* SAMPLE OUTPUT */
  s = content("Sample Output", "Input → structured bug report");
  card(s, 0.5, 1.45, 3.6, 3.5, "Input", "Customers are being charged twice at checkout when they click the Pay button and the network is slow. Orders show duplicated payments in the billing dashboard.", { hs: 15, bs: 12.5 });
  s.addText("→", { x: 4.1, y: 2.9, w: 0.4, h: 0.4, fontSize: 20, color: ACC, align: "center", margin: 0 });
  card(s, 4.5, 1.45, 5, 3.5, "Output (excerpt)", [
    { text: "Severity: ", options: { bold: true, color: TXT } }, { text: "Critical", options: { bold: true, color: SEV.Critical, breakLine: true } },
    { text: "Feature: ", options: { bold: true, color: TXT } }, { text: "Payments / Checkout", options: { breakLine: true } },
    { text: "Root causes:", options: { bold: true, color: TXT, breakLine: true } },
    { text: "1. Gateway callback not handled idempotently", options: { breakLine: true } },
    { text: "2. Race condition between order creation and payment confirmation", options: { breakLine: true } },
    { text: "Next steps: ", options: { bold: true, color: TXT } }, { text: "escalate to on-call, reproduce on staging, add regression test" },
  ], { hs: 15, bs: 12.5 });

  /* TESTING */
  s = content("Testing & Quality", "Automated tests with pytest");
  card(s, 0.5, 1.45, 4.35, 3.4, "What is tested", bullets(["Full graph run returns every state field", "Critical vs Low severity classification", "/api/health and /api/analyze endpoints", "Input validation (too-short text → 422)"], 13), { hs: 16, bs: 13 });
  card(s, 5.15, 1.45, 4.35, 3.4, "Reliability measures", bullets(["Pydantic validates all LLM output", "Fallback engine if Gemini fails or key missing", "Input length limits on the API", "Clear error messages shown in the UI"], 13), { hs: 16, bs: 13 });

  /* CHALLENGES */
  s = content("Challenges & Solutions");
  [["Unreliable free-text LLM output", "Used structured output with Pydantic schemas for every node"], ["App unusable without API key", "Built an offline rule-based fallback engine"], ["Users wait without feedback", "Streamed node-by-node progress with SSE"], ["Keeping nodes independent", "Typed shared state + partial updates per node"]].forEach(([c, sol], i) => {
    const y = 1.3 + i * 0.95;
    s.addShape(pres.ShapeType.roundRect, { x: 0.5, y, w: 9, h: 0.8, fill: { color: PANEL }, line: { color: LINE }, rectRadius: 0.08 });
    s.addText(c, { x: 0.7, y, w: 3.8, h: 0.8, fontFace: F, fontSize: 13.5, bold: true, color: TXT, valign: "middle", margin: 0 });
    s.addText("→", { x: 4.45, y, w: 0.4, h: 0.8, fontSize: 16, color: ACC, align: "center", valign: "middle", margin: 0 });
    s.addText(sol, { x: 4.95, y, w: 4.4, h: 0.8, fontFace: F, fontSize: 12.5, color: "CBD5E1", valign: "middle", margin: 0 });
  });

  /* FUTURE */
  s = content("Future Enhancements", "Where the project can grow");
  ["Duplicate bug detection with embeddings", "Direct export to Jira / GitHub Issues", "Screenshot and log-file analysis (multimodal)", "User accounts and a persistent database", "Team dashboards with severity analytics", "Docker deployment and CI pipeline"].forEach((t, i) => {
    card(s, 0.5 + (i % 2) * 4.6, 1.45 + Math.floor(i / 2) * 1.15, 4.4, 0.95, "", "");
    s.addText(t, { x: 0.75 + (i % 2) * 4.6, y: 1.45 + Math.floor(i / 2) * 1.15, w: 4, h: 0.95, fontFace: F, fontSize: 13.5, color: TXT, valign: "middle", margin: 0 });
  });

  /* CONCLUSION */
  s = content("Conclusion", "What was achieved");
  s.addText(bullets(["Implemented the complete 4-node LangGraph workflow from the assignment", "Delivered a professional full-stack application: FastAPI backend + responsive website", "Structured Gemini output, live progress, exports and history go beyond the brief", "Clean folder structure, documentation, tests and screenshots included", "Ready to extend with more nodes and integrations"], 15), { x: 0.5, y: 1.5, w: 9, h: 3.3, fontFace: F, color: "CBD5E1", valign: "top", margin: 0, isTextBox: true });

  /* THANK YOU */
  s = pres.addSlide(); s.background = { color: BG };
  s.addShape(pres.ShapeType.ellipse, { x: 3, y: -2, w: 5.5, h: 5.5, fill: { color: ACC, transparency: 92 }, line: { color: ACC, transparency: 92 } });
  s.addText("Thank You", { x: 0, y: 1.7, w: 10, h: 1, align: "center", fontFace: F, fontSize: 54, bold: true, color: TXT, margin: 0 });
  s.addText("Questions?", { x: 0, y: 2.7, w: 10, h: 0.5, align: "center", fontFace: F, fontSize: 22, color: ACC, margin: 0 });
  s.addText("Anushay Ayat  |  AI and Data Science  |  Batch 12  |  SMIT", { x: 0, y: 3.7, w: 10, h: 0.4, align: "center", fontFace: F, fontSize: 14, color: MUT, margin: 0 });

  await pres.writeFile({ fileName: path.join(__dirname, "AI_Bug_Report_Analyzer_Presentation.pptx") });
  console.log("pptx written");
})();
