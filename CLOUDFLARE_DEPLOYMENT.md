# SkillPilot AI — Cloudflare Pages Deployment

## Architecture

- Frontend: Cloudflare Pages
- Production frontend URL: `https://skillpilot.pages.dev`
- Backend: Render (`https://skillpilot-api.onrender.com`, or your actual Render URL)
- Database: MongoDB Atlas
- AI: Gemini API

## Cloudflare Pages settings

Create a new **Pages** project and connect the GitHub repository. Use Git integration so pushes to `main` trigger deployments.

- Project name: `skillpilot`
- Production branch: `main`
- Framework preset: `Next.js (Static HTML Export)`
- Build command: `npx next build`
- Build output directory: `out`

The `output: 'export'` setting is already configured in `next.config.mjs`.

### Frontend environment variable

Add this in Cloudflare Pages → Settings → Environment variables → Production:

```text
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-BACKEND-URL/api
```

Replace the value with the actual Render backend URL.

## Render backend settings

Keep the existing Express backend on Render. Set:

```text
CLIENT_ORIGIN=https://skillpilot.pages.dev
```

Also configure the MongoDB and Gemini variables from `server/.env.example`.

## Important

Do not upload `.env`, `.env.local`, MongoDB credentials, JWT secrets, or Gemini API keys to GitHub.

## After deployment

1. Open `https://skillpilot.pages.dev`.
2. Register a test account.
3. Log in and refresh the page.
4. Test profile, skills, projects, notes and DSA persistence.
5. Test Job Analyzer, Resume Analyzer, Career Coach and Mock Interview.
6. Confirm browser requests use the Render API URL, not localhost.
7. Confirm Render's `/api/health` endpoint returns `{"ok":true,...}`.

## Note about this package

The Cloudflare static-export configuration has been prepared. A complete production `npm run build` could not be verified in this environment because dependency installation timed out, so run the first Cloudflare build and review its build log before treating the deployment as fully verified.
