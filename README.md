# TrueMeds

Medicine packaging intelligence: authenticity signals, chemical composition, and alternatives from a single image upload.

**Stack:** Next.js (Vercel) · FastAPI (Render) · Gemini Vision · light JWT auth

## Features

- Upload packaging → structured analysis (authenticity, composition, alternatives)
- Follow-up chat grounded in the uploaded image
- JWT signup / signin (SQLite locally, Postgres on Render)

Informational only — not medical advice or regulatory QC.

## Project layout

```
TrueMeds/
├── api/          # FastAPI backend
├── client/       # Next.js frontend
├── render.yaml   # Render Blueprint (API + Postgres)
├── docker-compose.yml
└── start-all.sh
```

## Local development

### 1. API

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # set GEMINI_API_KEY and JWT_SECRET
uvicorn main:app --reload --port 8000
```

Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Client

```bash
cd client
npm install
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

Or from the repo root: `./start-all.sh`

## Deploy

### Backend → Render

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → connect this repo (uses root [`render.yaml`](render.yaml))
2. Or **New Web Service** → root directory `api`, runtime Docker, health check `/health`
3. Set env vars (Blueprint prompts for sync:false ones):
   - `GEMINI_API_KEY`
   - `JWT_SECRET` (auto-generated if using Blueprint)
   - `CORS_ORIGINS` = your Vercel URL(s), comma-separated (e.g. `https://truemeds.vercel.app`)
   - `DATABASE_URL` (wired from Render Postgres in the Blueprint)
4. Copy the public HTTPS URL (e.g. `https://truemeds-api.onrender.com`)

### Frontend → Vercel

1. Import repo → **root directory `client`**
2. Set `NEXT_PUBLIC_API_URL` to the Render API URL (no trailing slash)
3. Deploy
4. Update Render `CORS_ORIGINS` to include the Vercel domain

## API surface

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/signup` | — | Create account |
| POST | `/api/auth/signin` | — | Login |
| POST | `/api/auth/refresh` | — | Refresh tokens |
| GET/PUT | `/api/auth/me` | JWT | Profile |
| POST | `/api/analyze` | JWT | Image → analysis |
| POST | `/api/analyze/chat` | JWT | Follow-up Q&A |

## License

Private / portfolio use unless otherwise noted.
