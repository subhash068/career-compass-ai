<div align="center">

# 🚀 Career Compass AI

<p align="center">
  <em>AI-Powered Career Guidance & Skill Analysis Platform</em>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-00a393?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-24+-2496ED?style=flat&logo=docker)](https://www.docker.com/)

---

[Features](#features) • [Tech Stack](#tech-stack) • [Architecture](#architecture) • [Getting Started](#getting-started) • [API Reference](#api-reference) • [Deployment](#deployment) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Local Development](#local-development)
   - [Docker Development](#docker-development)
6. [Environment Variables](#environment-variables)
7. [Project Structure](#project-structure)
8. [API Reference](#api-reference)
9. [Screenshots](#screenshots)
10. [Deployment](#deployment)
11. [Contributing](#contributing)
12. [License](#license)

---

## 🎯 Project Overview

Career Compass AI is an intelligent career guidance platform that helps users discover their potential, analyze skills gaps, and chart personalized learning paths. Leveraging advanced AI technologies including Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), and sophisticated skill inference algorithms, the platform provides personalized career recommendations and skill assessments.

### Key Highlights

- 🤖 **AI-Powered Career Guidance** - Intelligent recommendations using advanced ML/AI models
- 📊 **Skill Gap Analysis** - Identify strengths and areas for improvement
- 📚 **Personalized Learning Paths** - Customized roadmaps based on career goals
- 💬 **AI Chatbot Assistant** - 24/7 career guidance support
- 📄 **Resume Builder & ATS Checker** - Professional resume creation with compatibility analysis
- 👨‍💼 **Admin Dashboard** - Comprehensive platform management

---

## ✨ Features

### For Users
| Feature | Description |
|---------|-------------|
| **Skill Assessment** | Comprehensive quizzes to evaluate technical and soft skills |
| **Career Path Discovery** | AI-analyzed career recommendations based on skills and interests |
| **Gap Analysis** | Visual breakdown of skill gaps between current and target roles |
| **Learning Paths** | Curated step-by-step learning resources to bridge skill gaps |
| **AI Chatbot** | Intelligent conversational assistant for career queries |
| **Resume Builder** | Create professional resumes with guided templates |
| **ATS Checker** | Analyze resume compatibility with job descriptions |
| **Progress Tracking** | Track learning progress and assessment history |
| **Notes Management** | Personal notes for career planning and learning |

### For Administrators
| Feature | Description |
|---------|-------------|
| **Dashboard Analytics** | Overview of users, assessments, and platform metrics |
| **Domain Management** | Create and manage career domains and job roles |
| **Quiz Management** | Create and manage skill assessment questions |
| **Learning Resources** | Curate and manage learning materials |
| **Activity Logs** | Monitor user activities and system events |

---

## 🛠 Tech Stack

### Frontend
<div align="left">

![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-0.6+-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-5+-FF4154?style=for-the-badge&logo=react-query&logoColor=white)

</div>

### Backend
<div align="left">

![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-00a393?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-CC2927?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-2.0+-E92063?style=for-the-badge&logo=pydantic&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-012345?style=for-the-badge&logo=langchain&logoColor=white)

</div>

### Infrastructure & DevOps
<div align="left">

![Docker](https://img.shields.io/badge/Docker-24+-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-10+-269539?style=for-the-badge&logo=nginx&-logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-2.0+-E6522C?style=for-the-badge&logo=prometheus&- logoColor=true)
![MySQL](https://img.shields.io/badge/MySQL-8+-4479A1?style=&flat-square.logo=mysql.logoColor=white)

</div>

---

## 🏗 Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Career Compass AI                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────┐         ┌─────────────────────────────────┐   │
│  │      Frontend       │         │           Backend               │   │
│  │   (React + Vite)    │◄───────►│       (FastAPI + Python)       │   │
│  │                     │  REST   │                                 │   │
│  │  - Dashboard        │   API   │  - AI Services (RAG, LLM)      │   │
│  │  - Assessments      │         │  - Business Logic              │   │
│  │  - Learning Paths   │         │  - Database Operations         │   │
│  │  - Chatbot          │         │  - Authentication              │   │
│  │  - Resume Builder   │         │                                 │   │
│  └─────────────────────┘         └──────────────┬──────────────────┘   │
│                                                  │                       │
│                                                  ▼                       │
│                                    ┌──────────────────────────────┐   │
│                                    │      AI Engine               │   │
│                                    │  ┌────────────────────────┐  │   │
│                                    │  │  - Career Scoring      │  │   │
│                                    │  │  - Skill Inference    │  │   │
│                                    │  │  - RAG Service        │  │   │
│                                    │  │  - LLM Router         │  │   │
│                                    │  │  - Intent Classifier  │  │   │
│                                    │  └────────────────────────┘  │   │
│                                    └──────────────────────────────┘   │
│                                                  │                       │
│                                                  ▼                       │
│                                    ┌──────────────────────────────┐   │
│                                    │     Database Layer           │   │
│                                    │    (PostgreSQL + SQLAlchemy) │   │
│                                    └──────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     Infrastructure Layer                          │ │
│  │   Docker | Nginx Load Balancer | Prometheus | Monitoring           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### AI Pipeline Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Ingestion │───►│  Embedding  │───►│ Vector Store│───►│    RAG      │
│   (Resumes, │    │  Generation │    │  (Pinecone) │    │   Service   │
│  Jobs, etc)│    └─────────────┘    └─────────────┘    └──────┬──────┘
└─────────────┘                                              │
                                                             ▼
                              ┌──────────────────────────────────────┐
                              │         LLM Router                  │
                              │  (OpenAI, Anthropic, Local Models)  │
                              └──────────────────┬───────────────────┘
                                                 │
                              ┌──────────────────▼───────────────────┐
                              │        Career Services               │
                              │  - Career Scoring                    │
                              │  - Skill Gap Analysis                │
                              │  - Learning Optimization             │
                              └──────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Installation |
|------|---------|--------------|
| **Node.js** | 18+ | [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) |
| **Python** | 3.11+ | [Python.org](https://www.python.org/downloads/) |
| **Docker** | 24+ | [Docker Desktop](https://www.docker.com/products/docker-desktop) |
| **PostgreSQL** | 15+ | [PostgreSQL](https://www.postgresql.org/download/) |
| **Git** | 2.0+ | [Git](https://git-scm.com/) |

### Local Development

#### 1. Clone the Repository

```
bash
git clone https://github.com/your-repo/career-compass-ai.git
cd career-compass-ai
```

#### 2. Backend Setup

```
bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the backend server
python app.py
```

The backend will be available at `http://localhost:5000`

#### 3. Frontend Setup

```
bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Docker Development

#### Using Docker Compose

```
bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React development server |
| Backend | http://localhost:5000 | FastAPI server |
| PostgreSQL | localhost:5432 | Database |
| Nginx | http://localhost:8080 | Load balancer |

---

## 📝 Environment Variables

### Backend (.env)

```
env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/career_compass
DATABASE_URL_TEST=postgresql://user:password@localhost:5432/career_compass_test

# Authentication
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
LLM_PROVIDER=openai  # or anthropic, ollama

# Vector Store
VECTOR_STORE_PROVIDER=pinecone  # or qdrant, chroma
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=us-east-1

# Application
DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://localhost:8080
```

### Frontend (.env)

```
env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

---

## 📂 Project Structure

```
career-compass-ai/
├── backend/
│   ├── ai/                      # AI Services
│   │   ├── career_scoring.py    # Career path scoring algorithms
│   │   ├── intent_classifier.py # User intent classification
│   │   ├── skill_inference.py  # Skill inference engine
│   │   ├── skill_similarity.py  # Skill similarity matching
│   │   ├── config/              # AI configuration
│   │   ├── embeddings/          # Embedding generation
│   │   ├── evaluation/           # AI model evaluation
│   │   ├── ingestion/           # Data ingestion pipelines
│   │   ├── llm/                 # LLM routing and services
│   │   ├── memory/              # Conversation memory
│   │   └── rag/                 # RAG implementation
│   ├── models/                  # SQLAlchemy models
│   │   ├── user.py
│   │   ├── skill.py
│   │   ├── domain.py
│   │   ├── job_role.py
│   │   ├── learning_path.py
│   │   ├── assessment.py
│   │   ├── chat_session.py
│   │   └── resume.py
│   ├── routes/                  # API endpoints
│   │   ├── auth_fastapi.py
│   │   ├── skills.py
│   │   ├── assessment.py
│   │   ├── domains.py
│   │   ├── career.py
│   │   ├── learning.py
│   │   ├── chatbot.py
│   │   ├── admin.py
│   │   └── resume.py
│   ├── schemas/                 # Pydantic schemas
│   ├── services/                # Business logic
│   │   ├── auth_service.py
│   │   ├── assessment_service.py
│   │   ├── career_service.py
│   │   ├── learning_service.py
│   │   └── chatbot_service.py
│   ├── alembic/                 # Database migrations
│   ├── app.py                   # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client functions
│   │   ├── auth/                # Authentication context
│   │   ├── chatbot/             # Chatbot components
│   │   ├── components/          # Reusable components
│   │   │   ├── ui/              # shadcn-ui components
│   │   │   ├── layout/           # Layout components
│   │   │   └── admin/           # Admin components
│   │   ├── contexts/            # React contexts
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utility functions
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin pages
│   │   │   └── *.tsx
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── nginx/                       # Nginx configurations
│   ├── nginx.conf
│   └── nginx-loadbalancer.conf
│
├── scripts/                     # Setup scripts
│   ├── setup-loadbalancer.sh
│   └── setup-loadbalancer.ps1
│
├── docker-compose.yml
├── docker-compose.loadbalancer.yml
├── prometheus/
│   └── prometheus.yml
├── requirements.txt
└── README.md
```

---

## 📚 API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register a new user |
| `/auth/login` | POST | Login and get tokens |
| `/auth/me` | GET | Get current user |

### Skills

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/skills` | GET | List all skills |
| `/skills/{id}` | GET | Get skill details |
| `/skills/assessment` | POST | Submit skill assessment |

### Assessments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/assessment` | GET | Get assessment questions |
| `/assessment/submit` | POST | Submit assessment answers |
| `/assessment/history` | GET | Get assessment history |

### Career

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/career/recommendations` | GET | Get career recommendations |
| `/career/gap-analysis` | GET | Get skill gap analysis |
| `/career/paths` | GET | Get career paths |

### Learning

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/learning/paths` | GET | Get learning paths |
| `/learning/resources` | GET | Get learning resources |
| `/learning/progress` | GET | Get learning progress |

### Chatbot

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chatbot/message` | POST | Send message to chatbot |
| `/chatbot/session` | GET | Get chat sessions |

### Resume

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/resume` | GET, POST | Manage resumes |
| `/resume/builder` | POST | Build resume |
| `/resume/ats-check` | POST | Check ATS compatibility |

### Admin

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/dashboard` | GET | Dashboard statistics |
| `/admin/domains` | GET, POST | Manage domains |
| `/admin/quiz` | GET, POST | Manage quizzes |
| `/admin/logs` | GET | View activity logs |

### Example API Calls

```
bash
# Register a new user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Get skills
curl -X GET http://localhost:5000/skills \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get career recommendations
curl -X GET http://localhost:5000/career/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📸 Screenshots

### Dashboard
![Dashboard](frontend/public/placeholder.svg)
*Main dashboard showing career overview and progress*

### Skill Assessment
![Skill Assessment](frontend/public/placeholder.svg)
*Interactive skill assessment interface*

### Gap Analysis
![Gap Analysis](frontend/public/placeholder.svg)
*Visual skill gap analysis chart*

### AI Chatbot
![Chatbot](frontend/public/placeholder.svg)
*AI-powered career assistant*

### Admin Dashboard
![Admin Dashboard](frontend/public/placeholder.svg)
*Admin panel for platform management*

---

## 🚢 Deployment

### Production Deployment

#### Using Docker

```
bash
# Build production images
docker-compose -f docker-compose.yml build

# Run production services
docker-compose -f docker-compose.yml up -d

# Check status
docker-compose ps
```

#### Using Nginx Load Balancer

```
bash
# Set up load balancer
docker-compose -f docker-compose.loadbalancer.yml up -d

# Or use the setup script
bash scripts/setup-loadbalancer.sh
```

#### Environment-Specific Configurations

| Environment | Configuration |
|-------------|---------------|
| Development | `DEBUG=True`, Local services |
| Staging | `DEBUG=False`, Staging URLs |
| Production | `DEBUG=False`, Production URLs, SSL/TLS |

### Monitoring

Access Prometheus metrics at: `http://localhost:9090`

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/career-compass-ai.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes and commit: `git commit -m 'Add amazing feature'`
5. **Push** to the branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Code Style

- **Python**: Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- **TypeScript**: Follow [Airbnb Style Guide](https://github.com/airbnb/javascript)
- **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/)

### Running Tests

```
bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```

### Documentation

- Update API documentation in code comments
- Update README.md for significant changes
- Add TypeDoc for new TypeScript functions
- Add Docstrings for new Python functions

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Career Compass AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [OpenAI](https://openai.com/) - LLM capabilities
- [LangChain](https://www.langchain.com/) - AI framework
- All contributors and supporters

---

<div align="center">

Made with ❤️ by the Career Compass AI Team

[Back to Top](#-career-compass-ai)

</div>
