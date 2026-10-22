const fs = require("fs"), path = require("path"), sharp = require("sharp");
const D = require("docx");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, ImageRun, PageBreak, Footer, Header, PageNumber, LevelFormat, PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader, VerticalAlign } = D;
const SS = f => path.join(__dirname, "..", "screenshots", f);
const pages = fs.existsSync("pages.json") ? JSON.parse(fs.readFileSync("pages.json")) : {};
const ACC = "0F9E8E", INK = "0B0F17", MUT = "5B6B82", LINE = "D5DCE6", FONT = "Calibri";
const W = 9026; // A4 content width in DXA with 1" margins (11906-2880)

const p = (text, o = {}) => new Paragraph({ spacing: { after: 120, line: 300 }, alignment: o.align || AlignmentType.JUSTIFIED, ...o.p,
  children: Array.isArray(text) ? text : [new TextRun({ text, font: FONT, size: 22, ...o.r })] });
const b = t => new TextRun({ text: t, bold: true, font: FONT, size: 22 });
const r = t => new TextRun({ text: t, font: FONT, size: 22 });
const h1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun({ text: t, font: FONT })] });
const h2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t, font: FONT })] });
const bullet = (t, lvl = 0) => new Paragraph({ numbering: { reference: "bul", level: lvl }, spacing: { after: 80, line: 290 }, children: Array.isArray(t) ? t : [r(t)] });
const num = t => new Paragraph({ numbering: { reference: "num", level: 0 }, spacing: { after: 80, line: 290 }, children: [r(t)] });
const code = lines => lines.map((l, i) => new Paragraph({ spacing: { after: 0, line: 260 }, shading: { type: ShadingType.CLEAR, fill: "F1F5F9" }, indent: { left: 140, right: 140 },
  children: [new TextRun({ text: l || " ", font: "Consolas", size: 18, color: "1E293B" })] }));
const gap = () => new Paragraph({ spacing: { after: 120 }, children: [] });
const bd = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: bd, bottom: bd, left: bd, right: bd };
function table(rows, widths, headFill = INK) {
  return new Table({ width: { size: widths.reduce((a, c) => a + c, 0), type: WidthType.DXA }, columnWidths: widths,
    rows: rows.map((row, ri) => new TableRow({ tableHeader: ri === 0, cantSplit: true, children: row.map((c, ci) => new TableCell({
      width: { size: widths[ci], type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.CENTER,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      shading: { type: ShadingType.CLEAR, fill: ri === 0 ? headFill : (ri % 2 ? "FFFFFF" : "F6F8FB") },
      children: [new Paragraph({ children: [new TextRun({ text: c, font: FONT, size: 20, bold: ri === 0, color: ri === 0 ? "FFFFFF" : "1E293B" })] })] })) })) });
}
async function fig(file, caption, maxW = 560) {
  const m = await sharp(SS(file)).metadata(); const w = Math.min(maxW, m.width), h = Math.round(w * m.height / m.width);
  return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, keepNext: true,
    children: [new ImageRun({ type: "png", data: fs.readFileSync(SS(file)), transformation: { width: w, height: h }, altText: { title: caption, description: caption, name: file } })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: caption, italics: true, size: 18, color: MUT, font: FONT })] })];
}

const TOC = [["1", "Introduction"], ["2", "Objectives and Scope"], ["3", "Requirements Analysis"], ["4", "System Design"], ["5", "Backend Implementation"], ["6", "Frontend Implementation"], ["7", "Application Screenshots"], ["8", "Testing and Validation"], ["9", "Sample Input and Output"], ["10", "Challenges and Solutions"], ["11", "Limitations and Future Work"], ["12", "Conclusion"], ["", "References"]];

(async () => {
  /* ---------- COVER ---------- */
  const cw = 11906 - 1000, light = "E8EDF5";
  const cl = (text, o = {}) => new Paragraph({ spacing: { before: o.before || 0, after: o.after || 0 }, alignment: o.align || AlignmentType.LEFT, indent: { left: 700, right: 700 },
    children: [new TextRun({ text, font: o.font || FONT, size: o.size || 24, bold: o.bold, color: o.color || light, characterSpacing: o.cs })] });
  const infoRow = (k, v) => new Paragraph({ spacing: { before: 40, after: 150 }, indent: { left: 700 }, tabStops: [{ type: "left", position: 3300 }], children: [
    new TextRun({ text: k.toUpperCase() + "\t", font: "Consolas", size: 18, color: "8B9BB4", characterSpacing: 40 }), new TextRun({ text: v, font: FONT, size: 28, bold: true, color: "FFFFFF" })] });
  const coverCell = new TableCell({ width: { size: cw, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: INK }, verticalAlign: VerticalAlign.TOP,
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.SINGLE, size: 48, color: "2DD4BF" }, right: { style: BorderStyle.NONE } },
    children: [
      cl("SMIT  |  AI & DATA SCIENCE", { before: 900, font: "Consolas", size: 22, color: "2DD4BF", cs: 60 }),
      cl("PROJECT REPORT", { before: 1500, size: 24, color: "8B9BB4", cs: 80 }),
      cl("AI Bug Report", { before: 200, size: 88, bold: true, color: "FFFFFF" }),
      cl("Analyzer", { size: 88, bold: true, color: "2DD4BF" }),
      cl("An intelligent multi-step workflow built with LangGraph, Google Gemini and FastAPI", { before: 300, after: 1200, size: 28, color: "CBD5E1" }),
      infoRow("Submitted by", "Anushay Ayat"), infoRow("Course", "AI and Data Science"), infoRow("Batch", "12"),
      infoRow("Institute", "SMIT"), infoRow("Submission date", "22 / 10 / 2026"),
      cl("Assignment: AI Bug Report Analyzer (LangGraph)", { before: 1100, after: 800, size: 20, color: "8B9BB4" }),
    ] });
  const cover = new Table({ width: { size: cw, type: WidthType.DXA }, columnWidths: [cw], rows: [new TableRow({ height: { value: 15700, rule: "exact" }, children: [coverCell] })] });

  /* ---------- CONTENTS ---------- */
  const tocLine = ([n, t]) => new Paragraph({ spacing: { after: 140 }, tabStops: [{ type: "right", position: W, leader: "dot" }], children: [
    new TextRun({ text: (n ? n + ".  " : "") + t, font: FONT, size: 24 }),
    new TextRun({ text: "\t" + String(pages[t] || ""), font: FONT, size: 24 })] });
  const front = [
    new Paragraph({ children: [new TextRun({ text: "Table of Contents", font: FONT, bold: true, size: 40, color: INK })], spacing: { after: 100 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "2DD4BF", space: 6 } } }),
    gap(), ...TOC.map(tocLine),
    new Paragraph({ pageBreakBefore: true, children: [new TextRun({ text: "Abstract", font: FONT, bold: true, size: 40, color: INK })], spacing: { after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "2DD4BF", space: 6 } } }),
    p("Software teams receive bug reports written in many different styles: some are long and vague, others are a single sentence with no context. Triaging them manually is slow and inconsistent. This project presents the AI Bug Report Analyzer, a full-stack web application that converts a plain-English bug description into a structured, developer-ready bug report."),
    p("The core of the system is a four-node LangGraph workflow. Node 1 extracts the bug title, the affected feature and a concise summary. Node 2 classifies the severity as Critical, High, Medium or Low and explains the decision. Node 3 proposes plausible technical root causes. Node 4 assembles everything, together with steps to reproduce and recommended next steps, into a clean Markdown report. Each node calls Google Gemini through LangChain using Pydantic structured output so that the results are validated and predictable."),
    p("The backend is implemented with FastAPI and exposes both a standard JSON endpoint and a Server-Sent Events endpoint that streams progress node by node. The frontend is a responsive, professionally designed website that shows live workflow progress, colour-coded severity, tabbed report views, copy and download options and a local analysis history. An offline rule-based engine guarantees that the application keeps working when no API key is configured. The project is accompanied by automated tests, API documentation and a detailed README."),
    p([b("Keywords: "), r("LangGraph, Gemini, FastAPI, bug triage, severity classification, root cause analysis, structured output.")], { align: AlignmentType.LEFT }),
  ];

  /* ---------- BODY ---------- */
  const body = [];
  body.push(h1("1. Introduction"),
    h2("1.1 Background"),
    p("Bug tracking is a daily activity in every software team. The quality of a bug report strongly affects how quickly a defect is understood and fixed. Reports that lack a clear title, an identified feature, a severity and a first set of hypotheses force developers to ask follow-up questions and slow the whole process down."),
    h2("1.2 Problem Statement"),
    p("Users and testers describe bugs in natural language. There is no consistent way to turn this free text into a uniform, structured artefact that contains the information developers need. The assignment asks for an AI assistant that takes a bug description and produces such a structured report using Gemini and LangGraph."),
    h2("1.3 Proposed Solution"),
    p("The proposed solution decomposes the task into four small, specialised steps arranged as a LangGraph state graph. Splitting the work this way produces more focused prompts, makes each step independently testable and allows the pipeline to grow easily. The result is delivered through a modern web interface so that non-technical users can use it without any setup."));

  body.push(h1("2. Objectives and Scope"),
    h2("2.1 Objectives"),
    bullet("Accept a bug description written in natural language."),
    bullet("Extract the bug title, affected feature and issue summary (Node 1)."),
    bullet("Classify severity as Critical, High, Medium or Low (Node 2)."),
    bullet("Suggest possible root causes (Node 3)."),
    bullet("Generate a clean, readable structured bug report (Node 4)."),
    bullet("Provide a professional frontend, a well-organised backend and clear documentation."),
    h2("2.2 Scope"),
    p("The project covers the complete workflow from text input to final report, a REST and streaming API, a single-page web interface, automated tests and documentation. Persistent storage, user accounts and direct integration with issue trackers are outside the current scope and are listed as future work."));

  body.push(h1("3. Requirements Analysis"),
    h2("3.1 Functional Requirements"),
    table([["ID", "Requirement"], ["FR-1", "The user can enter a bug description (10 to 4000 characters)."], ["FR-2", "The system runs a four-node LangGraph workflow in a fixed order."],
      ["FR-3", "The system returns title, feature, summary, severity, root causes, steps and next steps."], ["FR-4", "The user sees live progress for every node."],
      ["FR-5", "The user can copy the report and download it as Markdown or JSON."], ["FR-6", "Recent analyses are available in a history list."]], [1200, 7826]), gap(),
    h2("3.2 Non-Functional Requirements"),
    bullet([b("Reliability: "), r("invalid input is rejected with clear errors; LLM failures fall back to an offline engine.")]),
    bullet([b("Usability: "), r("responsive layout, clear colour coding and one-click actions.")]),
    bullet([b("Maintainability: "), r("modular folder structure, prompts separated from logic, typed state and schemas.")]),
    bullet([b("Performance: "), r("progress is streamed so users get feedback while the workflow runs.")]),
    h2("3.3 Technology Choices"),
    table([["Layer", "Technology", "Reason"], ["Orchestration", "LangGraph", "Explicit, typed state machine for multi-step LLM flows"], ["LLM", "Google Gemini", "Strong structured-output support and a free tier"],
      ["Backend", "FastAPI + Uvicorn", "Fast, async-ready, automatic OpenAPI docs"], ["Validation", "Pydantic v2", "Schemas for LLM output and API payloads"], ["Frontend", "HTML, CSS, JavaScript", "No build step, easy to deploy and review"]], [1900, 2300, 4826]));

  body.push(h1("4. System Design"),
    h2("4.1 High-Level Architecture"),
    p("The browser sends the bug description to the FastAPI server. The server invokes the compiled LangGraph workflow, which uses the LLM service layer to call Gemini. Results are returned as JSON or streamed as Server-Sent Events. FastAPI also serves the static frontend, so the whole application runs from a single command."),
    ...code(["Browser (HTML/CSS/JS)", "   |  POST /api/analyze/stream", "   v", "FastAPI (routes.py)", "   |  build_graph().stream()", "   v", "LangGraph StateGraph", "   START -> bug_analysis -> severity_detection -> root_cause -> format_report -> END", "                 |  each node calls", "                 v", "LLM service (llm.py) --> Gemini (structured output)", "                 '--> Demo engine (fallback)"]), gap(),
    h2("4.2 Workflow Design"),
    table([["Node", "Input fields", "Output fields", "Purpose"], ["bug_analysis", "bug_description", "title, affected_feature, summary", "Understand and summarise the bug"], ["severity_detection", "title, feature, summary", "severity, severity_reason", "Classify impact"],
      ["root_cause", "all previous fields", "root_causes", "Suggest likely causes"], ["format_report", "all previous fields", "steps_to_reproduce, suggested_next_steps, final_report", "Build the final report"]], [1800, 2100, 2800, 2326]), gap(),
    h2("4.3 Shared State"),
    p("All nodes communicate through a single typed dictionary. A node never calls another node; it only reads from the state and returns the keys it adds. LangGraph merges the returned values, which keeps nodes independent and easy to test."),
    ...code(["class BugState(TypedDict, total=False):", "    bug_description: str", "    title: str; affected_feature: str; summary: str", "    severity: str; severity_reason: str", "    root_causes: List[str]", "    steps_to_reproduce: List[str]; suggested_next_steps: List[str]", "    final_report: str"]), gap(),
    h2("4.4 Severity Model"),
    table([["Level", "Definition"], ["Critical", "Crash, data loss, security vulnerability or payments completely blocked."], ["High", "A major feature is broken and there is no reasonable workaround."], ["Medium", "A feature is degraded or inconsistent but a workaround exists."], ["Low", "Cosmetic issue or minor inconvenience."]], [1600, 7426]));

  body.push(h1("5. Backend Implementation"),
    h2("5.1 Folder Structure"),
    ...code(["backend/app/", "  main.py            FastAPI app, CORS, static frontend", "  config.py          environment settings", "  schemas.py         Pydantic models", "  api/routes.py      /api/health, /samples, /analyze, /analyze/stream", "  graph/state.py     BugState", "  graph/prompts.py   prompt templates", "  graph/nodes.py     the four nodes", "  graph/workflow.py  graph wiring", "  services/llm.py    Gemini + fallback", "  services/demo_engine.py  offline engine"]), gap(),
    h2("5.2 LangGraph Workflow"),
    p("The graph is created with StateGraph(BugState). Each node is registered by name and connected with sequential edges from START to END. The compiled graph is cached so it is built only once."),
    ...code(["g = StateGraph(BugState)", "g.add_node(\"bug_analysis\", bug_analysis_node)", "g.add_node(\"severity_detection\", severity_detection_node)", "g.add_node(\"root_cause\", root_cause_node)", "g.add_node(\"format_report\", format_report_node)", "g.add_edge(START, \"bug_analysis\")", "g.add_edge(\"bug_analysis\", \"severity_detection\")", "g.add_edge(\"severity_detection\", \"root_cause\")", "g.add_edge(\"root_cause\", \"format_report\")", "g.add_edge(\"format_report\", END)", "return g.compile()"]), gap(),
    h2("5.3 Gemini Integration and Structured Output"),
    p("The LLM service wraps ChatGoogleGenerativeAI and calls with_structured_output() with a Pydantic schema for every node. Gemini therefore returns validated objects (BugAnalysis, SeverityResult, RootCauses, ReportExtras) instead of free text that would need fragile parsing. The model name and API key are read from the .env file."),
    h2("5.4 Prompt Design"),
    p("Prompts are stored separately in prompts.py. Each prompt gives the model a role (for example senior QA engineer), a precise task, the allowed output values and only the context fields that the step needs. The severity prompt contains explicit definitions of the four levels to keep classification consistent."),
    h2("5.5 Fallback Engine"),
    p("If no valid API key is configured, or a Gemini call fails because of network or quota problems, the service falls back to a rule-based engine. It detects the feature from keywords, assigns severity from impact keywords and returns curated root-cause suggestions. The navbar badge in the UI shows which engine is active. This engine is a heuristic and is not a replacement for the LLM; it exists for offline demonstrations and graceful degradation."),
    h2("5.6 REST and Streaming API"),
    table([["Method", "Endpoint", "Description"], ["GET", "/api/health", "Status, version and active engine"], ["GET", "/api/samples", "Sample bug descriptions"], ["POST", "/api/analyze", "Run the workflow and return the report"], ["POST", "/api/analyze/stream", "SSE: one event per node, then the final report"]], [1200, 2800, 5026]),
    p("The streaming endpoint uses graph.stream(stream_mode=\"updates\") and emits an event after each node completes. The frontend consumes the stream with fetch and a ReadableStream reader."));

  body.push(h1("6. Frontend Implementation"),
    p("The frontend is written in plain HTML, CSS and JavaScript so that it needs no build tools. It is served directly by FastAPI, which also avoids cross-origin issues."),
    h2("6.1 Page Sections"),
    bullet([b("Hero: "), r("title, short explanation and call-to-action buttons.")]),
    bullet([b("Analyzer workspace: "), r("input area with sample bug chips, character counter, workflow progress tracker and result panel.")]),
    bullet([b("Workflow section: "), r("visual explanation of the four nodes.")]),
    bullet([b("Features and History: "), r("capability cards and the list of recent analyses.")]),
    h2("6.2 User Experience Features"),
    bullet("Live stepper: each node changes from Waiting to Running to Done as events arrive."),
    bullet("Severity badges coloured red, orange, yellow and green."),
    bullet("Report, Markdown and JSON tabs for different audiences."),
    bullet("Copy to clipboard, download as .md and download as .json."),
    bullet("History stored in localStorage; selecting an item re-opens the report."),
    bullet("Responsive layout that collapses to a single column on tablets and phones."),
    h2("6.3 Design System"),
    p("The interface uses a dark graphite palette with a teal accent, defined as CSS custom properties. Typography relies on a system font stack with a monospace face for technical labels. Spacing, border radius and colours are reused consistently across components."));

  body.push(h1("7. Application Screenshots"),
    p("The figures below show the running application. They were captured automatically with Playwright using the offline engine."),
    ...await fig("01-home.png", "Figure 7.1 - Home page", 520),
    ...await fig("02-analyzer-empty.png", "Figure 7.2 - Analyzer workspace before analysis", 520),
    ...await fig("04-report-result.png", "Figure 7.3 - Completed workflow and structured report", 470),
    ...await fig("05-markdown-tab.png", "Figure 7.4 - Markdown export view", 470),
    ...await fig("07-workflow-architecture.png", "Figure 7.5 - Workflow architecture section", 520),
    ...await fig("11-mobile-home.png", "Figure 7.6 - Mobile layout", 190));

  body.push(h1("8. Testing and Validation"),
    p("Automated tests are written with pytest and FastAPI's TestClient and run against the offline engine so they are deterministic."),
    table([["Test", "Checks", "Result"], ["test_graph_produces_full_state", "Graph returns all state fields; crash with data loss is Critical", "Pass"], ["test_low_severity_for_cosmetic_bug", "Spelling mistake is classified Low", "Pass"], ["test_api_health_and_analyze", "Health and analyze endpoints respond correctly", "Pass"], ["test_validation_rejects_short_input", "Too-short description returns HTTP 422", "Pass"]], [3200, 4326, 1500]), gap(),
    p("Manual testing covered all sample bugs, an empty input, a very long input, backend-offline behaviour and the mobile layout. Testing with a live Gemini key depends on the user's own API credentials and should be repeated after configuring .env."));

  body.push(h1("9. Sample Input and Output"),
    h2("9.1 Input"),
    p("Customers are being charged twice at checkout when they click the Pay button and the network is slow. Orders show duplicated payments in the billing dashboard.", { p: { indent: { left: 400 } }, r: { italics: true } }),
    h2("9.2 Generated Report (excerpt)"),
    table([["Field", "Value"], ["Affected feature", "Payments / Checkout"], ["Severity", "Critical"], ["Root cause 1", "Payment gateway callback or webhook not being handled idempotently."], ["Root cause 2", "Race condition between order creation and payment confirmation."], ["Next step", "Escalate to the on-call engineer and reproduce the issue in staging."]], [2400, 6626]),
    p("This example was produced by the offline engine. With Gemini enabled the wording of the title, summary and causes is generated by the model and is usually more specific to the description."));

  body.push(h1("10. Challenges and Solutions"),
    table([["Challenge", "Solution"], ["LLM output varies in format", "Structured output with Pydantic schemas on every node"], ["Application unusable without an API key", "Offline rule-based fallback engine"], ["Users see nothing while the workflow runs", "Server-Sent Events with a live stepper"], ["Keeping steps independent and testable", "Typed shared state and partial updates per node"], ["Inconsistent severity ratings", "Explicit severity definitions inside the prompt"]], [3800, 5226]));

  body.push(h1("11. Limitations and Future Work"),
    h2("11.1 Limitations"),
    bullet("Root causes are hypotheses; they must be verified by an engineer."),
    bullet("History is stored only in the user's browser."),
    bullet("The fallback engine is keyword based and less accurate than Gemini."),
    h2("11.2 Future Work"),
    bullet("Duplicate-bug detection using embeddings and a vector database."),
    bullet("Export to Jira, GitHub Issues or Linear."),
    bullet("Multimodal input: screenshots and log files."),
    bullet("User accounts, a database and team analytics."),
    bullet("Docker packaging and a CI/CD pipeline."));

  body.push(h1("12. Conclusion"),
    p("The AI Bug Report Analyzer meets every requirement of the assignment: it implements the four-node LangGraph workflow using Gemini and returns a clear structured bug report. Beyond the brief it adds streaming progress, structured output validation, exports, history, tests and documentation. The modular design makes it straightforward to add new nodes such as duplicate detection or ticket creation. The project shows how LangGraph can turn a single vague prompt into a reliable, explainable multi-step AI pipeline."),
    new Paragraph({ spacing: { before: 400, after: 160 }, children: [new TextRun({ text: "References", font: FONT, bold: true, size: 32, color: INK })], keepNext: true }));
  ["LangGraph documentation - https://langchain-ai.github.io/langgraph/", "Google AI Studio and Gemini API - https://ai.google.dev/", "LangChain Google GenAI integration - https://python.langchain.com/docs/integrations/chat/google_generative_ai/", "FastAPI documentation - https://fastapi.tiangolo.com/", "Pydantic documentation - https://docs.pydantic.dev/", "MDN Web Docs: Server-sent events - https://developer.mozilla.org/docs/Web/API/Server-sent_events"].forEach(t => body.push(num(t)));

  const mkFooter = () => new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 6 } }, tabStops: [{ type: "right", position: W }],
    children: [new TextRun({ text: "AI Bug Report Analyzer  |  Anushay Ayat  |  SMIT Batch 12", font: FONT, size: 17, color: MUT }), new TextRun({ children: ["\t", PageNumber.CURRENT], font: FONT, size: 17, color: MUT })] })] });
  const styles = { default: { document: { run: { font: FONT, size: 22 } } }, paragraphStyles: [
    { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 40, bold: true, color: INK, font: FONT }, paragraph: { spacing: { before: 0, after: 220 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "2DD4BF", space: 6 } } } },
    { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, color: ACC, font: FONT }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1, keepNext: true } }] };
  const numbering = { config: [
    { reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 620, hanging: 300 } } } }] },
    { reference: "num", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "[%1]", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 620, hanging: 500 } } } }] }] };
  const A4 = { width: 11906, height: 16838 };
  const doc = new Document({ creator: "Anushay Ayat", title: "AI Bug Report Analyzer - Project Report", styles, numbering, sections: [
    { properties: { page: { size: A4, margin: { top: 500, bottom: 500, left: 500, right: 500 } } }, children: [cover] },
    { properties: { page: { size: A4, margin: { top: 1440, bottom: 1300, left: 1440, right: 1440 } } }, footers: { default: mkFooter() }, children: [...front, ...body] }] });
  fs.writeFileSync("AI_Bug_Report_Analyzer_Report.docx", await Packer.toBuffer(doc)); console.log("docx ok");
})();
