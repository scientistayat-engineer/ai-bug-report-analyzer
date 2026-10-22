# 🚀 Deployment Guide - Vercel (backend) + Firebase Hosting (frontend)

```
Browser ──► Firebase Hosting (frontend/)  ──fetch──►  Vercel (backend/ FastAPI + LangGraph) ──► Gemini
```

## 0. Push the project to GitHub
```bash
cd ai-bug-report-analyzer
git init
git add .
git commit -m "AI Bug Report Analyzer"
git branch -M main
git remote add origin https://github.com/<your-username>/ai-bug-report-analyzer.git
git push -u origin main
```
`.env` is git-ignored - **never** push your API key.

## 1. Deploy the backend on Vercel
**Option A - Dashboard (easiest)**
1. Go to <https://vercel.com/new> and import your GitHub repo.
2. **Root Directory → `backend`** (important).
3. Framework preset: *Other* / auto-detected FastAPI. Leave build settings empty.
4. Open **Environment Variables** and add:
   - `GOOGLE_API_KEY` = your Gemini key
   - `GEMINI_MODEL` = `gemini-3.6-flash`
5. Click **Deploy**. You will get a URL like `https://ai-bug-report-analyzer.vercel.app`.

**Option B - CLI**
```bash
npm i -g vercel
cd backend
vercel login
vercel                      # preview deploy (answer the prompts)
vercel env add GOOGLE_API_KEY
vercel env add GEMINI_MODEL
vercel --prod               # production deploy
```

**Test it:** open `https://<your-app>.vercel.app/api/health` - you should see
`"engine": "Gemini (gemini-3.6-flash)"`. If it says *Demo engine*, the env variable is missing - add it and redeploy.
Interactive docs: `https://<your-app>.vercel.app/docs`.

## 2. Point the frontend to the backend
Edit `frontend/js/config.js`:
```js
window.BUGLENS_API = "https://<your-app>.vercel.app";
```
(no trailing slash)

## 3. Deploy the frontend on Firebase Hosting
```bash
npm i -g firebase-tools
firebase login
cd ai-bug-report-analyzer        # project root (where firebase.json is)
firebase init hosting            # choose existing/new project; public dir = frontend; SPA = No; don't overwrite index.html
firebase deploy --only hosting
```
Firebase prints the live URL, e.g. `https://<project-id>.web.app`.
(You can also copy `.firebaserc.example` to `.firebaserc` and put your project id there.)

## 4. Final checklist
- [ ] `/api/health` on Vercel shows the Gemini engine
- [ ] Firebase site loads and the navbar badge says **Gemini ...** (not "backend offline")
- [ ] Analyze a sample bug - all 4 workflow steps turn green
- [ ] Take new screenshots of the live site for your report if you like

## Troubleshooting
| Problem | Fix |
|---|---|
| Badge says *backend offline* | `config.js` URL wrong, has a trailing slash, or Vercel deploy failed - open `/api/health` directly |
| CORS error in browser console | Redeploy backend; CORS is already set to `*` in `app/main.py` |
| Badge says *Demo engine* | Add `GOOGLE_API_KEY` in Vercel → Settings → Environment Variables, then redeploy |
| Vercel build fails / not detected | Make sure Root Directory is `backend` and `index.py` exists there |
| Slow first request | Serverless cold start - the next requests are faster |
| 404 on Firebase | Run `firebase deploy` from the project root and check `"public": "frontend"` |

> Vercel's deployment details can change; if a step looks different, check the official docs: <https://vercel.com/docs/frameworks/backend/fastapi> and <https://firebase.google.com/docs/hosting>.
