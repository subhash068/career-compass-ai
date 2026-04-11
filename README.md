# A Multi-Layered Skill Gap Analysis and Career Recommendation System

AI-powered career guidance and skill analysis platform with assessments, learning paths, resume analysis, certificates, and an admin operations panel.

## Project Overview

Career Compass AI helps users:
- assess current skills
- discover matching career roles
- identify skill gaps
- follow personalized learning paths
- track progress across assessments and learning

It includes a full admin suite for user/domain/quiz/content management, AI runtime controls, and system monitoring.

## Core Features

### User Features
- Authentication: register, login, JWT access/refresh, forgot/reset password, OTP verification.
- Skills and assessments: skill selection, per-skill assessment lifecycle, results, completed history.
- Career intelligence: role listing, career matches, role comparisons, trending roles.
- Gap analysis and learning: personalized learning paths, step completion, step-level assessments.
- AI assistant: conversational chatbot with sessions and history.
- Profile management: personal details, bio, experience, contact, social links.
- Notes: create/read/update/delete, search, and tags.
- Resume tools: resume CRUD, file upload, ATS scoring, ATS analysis.
- Privacy workflows: export data request and account deletion request.

### OTP Authentication
- OTP is supported for email verification and password reset flows.
- OTP endpoints:
- `POST /auth/send-otp` with payload: `email`, `purpose` (`verify` or `reset`)
- `POST /auth/verify-otp` with payload: `email`, `code`, `purpose`
- Environment variables for OTP/email:
- `EMAIL_DISABLED` (`true` for local/dev without SMTP)
- `OTP_LENGTH` (clamped to 4..8)
- `OTP_EXPIRY_MINUTES` (clamped to 1..60)
- Optional dev-only testing code: `OTP_FIXED_CODE`
- SMTP settings required when `EMAIL_DISABLED=false`:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

### Certification and Verification
- Completion certificates for learning paths with unique IDs, signatures, and verification URLs.
- QR-based certificate verification.
- Public verification endpoints.
- Open Badges support (issuer, badge class, assertions, badge JSON package).
- Optional blockchain anchoring and blockchain verification endpoints.

### Admin Features
- User management: list/view/create/update/delete users and update roles.
- Domain and skill management: full CRUD.
- Quiz management: question CRUD, bulk delete, Excel upload, template download, stats.
- Learning content operations: learning paths/steps and learning resources CRUD.
- Admin AI assistant with tool-enabled actions (users, skills, domains).
- Monitoring: logs, errors, service status, system metrics, overview metrics.
- Runtime AI controls: enable/disable LLM, RAG, evaluation, memory and tune model parameters.
- Frontend security control: global right-click protection toggle.

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui + Radix UI
- React Router
- TanStack React Query
- Vitest

### Backend
- FastAPI
- SQLAlchemy + Alembic
- MySQL (default containerized setup) or SQLite (development fallback)
- Redis (optional/cached services)
- JWT authentication
- Prometheus metrics

### AI Layer
- LLM routing and configurable model selection
- RAG services
- Skill inference and similarity modules
- Career scoring and intent classification
- Embeddings and vector-store abstraction

## Architecture

- `frontend/`: React application with user and admin experiences
- `backend/`: FastAPI application with modular routes/services/models
- `backend/ai/`: AI and retrieval logic
- `nginx/`: reverse-proxy and load balancer config
- `prometheus/`: monitoring configuration
- `docker-compose.yml`: multi-service local stack

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- pip
- (Optional) MySQL and Redis for non-SQLite setup

### 1) Configure Environment

Copy and edit environment file:

```bash
cp .env.example .env
```

Minimum required values:
- `JWT_SECRET_KEY`
- database variables (`DATABASE_URL` or `DATABASE_URL_DEV`)

### 2) Run Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_backend.py
```

Backend runs on `http://localhost:8000` by default.

Useful endpoints:
- `GET /health`
- `GET /status`
- `GET /metrics`
- `GET /docs` (FastAPI Swagger UI)

### 3) Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Docker Compose

To run the full stack (API, frontend, MySQL, Redis, Prometheus, Grafana, Nginx):

```bash
docker compose up -d --build
```

Primary exposed services in current config:
- Nginx: `http://localhost:80`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`

## Configuration Notes

- `backend/models/database.py` resolves DB URLs from env with SQLite fallback in development.
- CORS supports local origins and common deployment domains (`vercel.app`, `onrender.com`, `netlify.app`).
- AI runtime settings are editable via admin API and admin UI.

## API Surface (High-Level)

Main route groups:
- `/auth`
- `/skills`
- `/api/assessment` (with backward-compatible redirect from `/assessment/*`)
- `/career`
- `/learning`
- `/chatbot`
- `/profile`
- `/resume`
- `/certificate`
- `/admin`
- `/admin/quiz`
- `/admin/logs`
- `/admin/domains`
- `/api/admin/ai-settings`
- `/api/admin/chat`

## Project Structure

```text
career-compass-ai-main/
|-- backend/
|   |-- ai/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- alembic/
|   |-- app.py
|   `-- run_backend.py
|-- frontend/
|   |-- src/
|   |   |-- pages/
|   |   |-- components/
|   |   |-- api/
|   |   `-- auth/
|   `-- package.json
|-- nginx/
|-- prometheus/
|-- docker-compose.yml
`-- README.md
```

## Monitoring and Health

- Prometheus middleware tracks request totals, errors, and in-flight requests.
- `GET /health` (liveness)
- `GET /status` (readiness + DB check)

## License

MIT License.
