# SkillPilot AI backend setup

## 1. Install dependencies

```bash
pnpm install
```

## 2. MongoDB

Create a MongoDB Atlas cluster (or use local MongoDB) and copy `.env.example` to `.env` inside the project root. Set `MONGODB_URI`, `MONGODB_DB`, and a long random `JWT_SECRET`.

## 3. Start API

```bash
pnpm server:dev
```

API: `http://localhost:4000`
Health check: `GET /api/health`

## 4. Connect frontend

Copy `.env.local.example` to `.env.local` and keep:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Then run:

```bash
pnpm dev
```

## Implemented API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/dsa/progress`
- `PUT /api/dsa/problems/:problemId/progress`
- `PUT /api/dsa/problems/:problemId/notes`
- `GET /api/skills`
- `POST /api/skills`
- `DELETE /api/skills/:skillId`
- `GET /api/profile/target-role`
- `PUT /api/profile/target-role`
- `GET /api/roadmap/progress`
- `PUT /api/roadmap/progress/:stepId`

Passwords are hashed with bcrypt. Sessions use signed JWT access tokens. DSA, skills, target-role, and roadmap records are scoped by MongoDB user ID.

The frontend retains a local-storage fallback when `NEXT_PUBLIC_API_URL` is not configured, so the UI can still be previewed without a backend.

## AI layer
Add `GEMINI_API_KEY` and optionally `GEMINI_MODEL` to `server/.env`. Never expose this key in `NEXT_PUBLIC_*` variables. AI endpoints are authenticated and run on the Express server. If no key is configured, Job/Resume Analyzer uses a limited local preview and Mock Interview keeps its local fallback; real AI interview generation/evaluation requires the key.

AI endpoints:
- POST `/api/ai/job-analyze`
- POST `/api/ai/resume-analyze`
- POST `/api/ai/skill-gap`
- POST `/api/ai/roadmap`
- GET `/api/ai/history`
- POST `/api/ai/interview/question`
- POST `/api/ai/interview/evaluate`
- POST `/api/ai/interview/session`
- GET `/api/ai/interview/history`
