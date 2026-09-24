# SkillPilot AI — Production Deployment Checklist

## Architecture
- Frontend: Next.js → Vercel
- Backend: Express → Render
- Database: MongoDB Atlas
- AI: Gemini API (server-side only)

## Before deployment
1. Create a production MongoDB Atlas database and least-privilege user.
2. Create the Render backend service using `render.yaml`.
3. Set `MONGODB_URI`, `MONGODB_DB=skillpilot`, `JWT_SECRET`, `CLIENT_ORIGIN`, `GEMINI_API_KEY`, and `GEMINI_MODEL` on Render.
4. Deploy the Next.js app to Vercel.
5. Set Vercel `NEXT_PUBLIC_API_URL` to the Render API URL ending in `/api`.
6. Redeploy Vercel after changing environment variables.

## Smoke test
- `/api/health` returns `{ "ok": true, ... }`.
- Register and sign in.
- Refresh the browser and confirm the session persists.
- Save profile, skills, target role, notes and projects.
- Update DSA progress.
- Run Job Analyzer and Resume Analyzer.
- Test AI Career Coach and Mock Interview with a configured Gemini key.

## Security
- Never commit `.env` files or API keys.
- Use a long random `JWT_SECRET`.
- Restrict `CLIENT_ORIGIN` to the production frontend origin.
- Keep `GEMINI_API_KEY` server-side.
- Use HTTPS for both services.

## Current verification
- Node.js syntax checks: passed.
- Environment/secret scan: passed; no real secret files included.
- API route structure: prepared for production deployment.
- Full dependency install/build could not be completed in the packaging environment because `npm install` timed out. Run `npm install` (or your platform's normal install step) and `npm run build` in Vercel/CI before the first public release.
