# SkillPilot AI — Deployment Readiness

This project is prepared for separate frontend/backend deployment. Nothing is deployed by this package.

## Architecture
- Frontend: Next.js → Vercel (recommended)
- Backend: Express → Render (recommended; `render.yaml` included)
- Database: MongoDB Atlas
- AI: Gemini API, server-side only

## 1. MongoDB Atlas
Create a production database and a least-privilege database user. Allow the backend host to connect. Keep the URI private.

## 2. Deploy backend
Create a Render Web Service from this repository. Render can use `render.yaml`, or set:
- Build: `npm install`
- Start: `npm run server`
- Health check: `/api/health`

Backend environment variables:
```
MONGODB_URI=...
MONGODB_DB=skillpilot
JWT_SECRET=<long-random-secret>
CLIENT_ORIGIN=https://YOUR-FRONTEND-DOMAIN
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
PORT=10000
NODE_ENV=production
```

## 3. Deploy frontend
Import the repository into Vercel. Framework: Next.js. Build command: `npm run build`.
Set the Vercel environment variable:
```
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN/api
```
Redeploy after changing environment variables because `NEXT_PUBLIC_*` values are bundled into the browser build.

## 4. CORS
After the Vercel domain is known, set backend `CLIENT_ORIGIN` to that exact origin, e.g. `https://skillpilot.vercel.app`. Multiple origins can be comma-separated.

## 5. Gemini
Never put `GEMINI_API_KEY` in a `NEXT_PUBLIC_*` variable. It must exist only on the backend.

## 6. Smoke test after deployment
1. Open frontend.
2. Register a new test account.
3. Sign in and refresh the page.
4. Add a skill and target role.
5. Update a DSA problem.
6. Create a note/project.
7. Complete a resource/task.
8. Run Job Analyzer.
9. Upload a small text-based PDF resume.
10. Run AI Career Coach and Mock Interview.
11. Open `https://YOUR-BACKEND-DOMAIN/api/health` and confirm `{ "ok": true }`.

## Security checklist
- Do not commit `.env` files or API keys.
- Use a long random JWT secret.
- Use a dedicated MongoDB user with only the required database permissions.
- Restrict `CLIENT_ORIGIN` to the real frontend domain.
- Keep Gemini credentials server-side.
- Use HTTPS on both services.
