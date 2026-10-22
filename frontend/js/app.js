/* BugLens frontend - talks to the FastAPI backend (SSE streaming). */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const API = (window.BUGLENS_API || "").replace(/\/$/, "") || (location.protocol === "file:" ? "http://127.0.0.1:8000" : "");
const HKEY = "buglens.history.v1";
let current = null;

const input = $("#bugInput"), btn = $("#analyzeBtn");

function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 1800); }
function showError(msg) { const e = $("#error"); e.textContent = msg; e.hidden = !msg; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- init ---------- */
async function init() {
  try {
    const h = await (await fetch(`${API}/api/health`)).json();
    const b = $("#engineBadge"); b.classList.add("on"); $("span", b).textContent = h.engine;
  } catch { const b = $("#engineBadge"); b.classList.add("off"); $("span", b).textContent = "backend offline"; }
  try {
    const samples = await (await fetch(`${API}/api/samples`)).json();
    $("#samples").innerHTML = samples.map(s => `<button class="chip" type="button" data-t="${esc(s.text)}">${esc(s.label)}</button>`).join("");
    $$(".chip").forEach(c => c.onclick = () => { input.value = c.dataset.t; updateCount(); input.focus(); });
  } catch {}
  renderHistory();
  updateCount();
}
function updateCount() { $("#count").textContent = `${input.value.length} / 4000`; }
input.addEventListener("input", updateCount);
$("#clearBtn").onclick = () => { input.value = ""; updateCount(); resetPipeline(); showError(""); };

/* ---------- pipeline ---------- */
function resetPipeline() { $$(".pipeline li").forEach(li => { li.className = ""; $("em", li).textContent = "Waiting"; }); }
function setNode(name, state) {
  const li = $(`.pipeline li[data-node="${name}"]`); if (!li) return;
  li.className = state; $("em", li).textContent = state === "running" ? "Running..." : state === "done" ? "Done" : "Waiting";
}

/* ---------- analyze ---------- */
btn.onclick = async () => {
  const description = input.value.trim();
  if (description.length < 10) return showError("Please describe the bug in at least 10 characters.");
  showError(""); resetPipeline(); btn.disabled = true; btn.classList.add("loading");
  $(".btn-t", btn).textContent = "Analyzing...";
  const order = ["bug_analysis", "severity_detection", "root_cause", "format_report"];
  setNode(order[0], "running");
  try {
    const res = await fetch(`${API}/api/analyze/stream`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description }) });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `Server error ${res.status}`);
    const reader = res.body.getReader(), dec = new TextDecoder(); let buf = "";
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      const parts = buf.split("\n\n"); buf = parts.pop();
      for (const p of parts) {
        if (!p.startsWith("data: ")) continue;
        const ev = JSON.parse(p.slice(6));
        if (ev.type === "node") { await sleep(350); setNode(ev.node, "done"); const nx = order[order.indexOf(ev.node) + 1]; if (nx) setNode(nx, "running"); }
        else if (ev.type === "done") { render(ev.report); saveHistory(ev.report); }
        else if (ev.type === "error") throw new Error(ev.message);
      }
    }
  } catch (e) { showError(e.message || "Something went wrong."); resetPipeline(); }
  finally { btn.disabled = false; btn.classList.remove("loading"); $(".btn-t", btn).textContent = "Analyze bug"; }
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- render ---------- */
function render(r) {
  current = r;
  $("#empty").hidden = true; $("#result").hidden = false;
  const sev = $("#sevBadge"); sev.textContent = r.severity; sev.className = `sev ${r.severity}`;
  $("#rTitle").textContent = r.title;
  $("#rMeta").textContent = `${r.engine} · ${new Date(r.generated_at).toLocaleString()}`;
  $("#rFeature").textContent = r.affected_feature; $("#rReason").textContent = r.severity_reason; $("#rSummary").textContent = r.summary;
  $("#rCauses").innerHTML = r.root_causes.map(c => `<li>${esc(c)}</li>`).join("");
  $("#rSteps").innerHTML = r.steps_to_reproduce.map(c => `<li>${esc(c)}</li>`).join("");
  $("#rNext").innerHTML = r.suggested_next_steps.map(c => `<li>${esc(c)}</li>`).join("");
  $("#tab-markdown").textContent = r.report_markdown;
  $("#tab-json").textContent = JSON.stringify(r, null, 2);
  activateTab("report");
  if (innerWidth < 960) $("#resultPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}
function activateTab(n) { $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === n)); ["report", "markdown", "json"].forEach(k => $(`#tab-${k}`).hidden = k !== n); }
$$(".tab").forEach(t => t.onclick = () => activateTab(t.dataset.tab));

/* ---------- export ---------- */
function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href); }
const slug = () => (current.title || "bug-report").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
$("#copyBtn").onclick = async () => { await navigator.clipboard.writeText(current.report_markdown); toast("Report copied to clipboard"); };
$("#mdBtn").onclick = () => download(`${slug()}.md`, current.report_markdown, "text/markdown");
$("#jsonBtn").onclick = () => download(`${slug()}.json`, JSON.stringify(current, null, 2), "application/json");

/* ---------- history ---------- */
const getHist = () => { try { return JSON.parse(localStorage.getItem(HKEY)) || []; } catch { return []; } };
function saveHistory(r) { const h = [r, ...getHist().filter(x => x.generated_at !== r.generated_at)].slice(0, 6); try { localStorage.setItem(HKEY, JSON.stringify(h)); } catch {} renderHistory(); }
function renderHistory() {
  const h = getHist(), box = $("#histList");
  if (!h.length) { box.innerHTML = `<p class="hempty">No analyses yet. Your recent reports will be listed here.</p>`; return; }
  box.innerHTML = h.map((r, i) => `<button class="hitem" data-i="${i}"><span class="sev ${r.severity}">${r.severity}</span><h4>${esc(r.title)}</h4><p>${esc(r.affected_feature)} · ${new Date(r.generated_at).toLocaleDateString()}</p></button>`).join("");
  $$(".hitem").forEach(b => b.onclick = () => { render(h[b.dataset.i]); $("#analyzer").scrollIntoView({ behavior: "smooth" }); });
}
$("#clearHistory").onclick = () => { try { localStorage.removeItem(HKEY); } catch {} renderHistory(); toast("History cleared"); };

init();
