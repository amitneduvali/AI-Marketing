# CortexPulse AI

> **CortexPulse AI** is a premium, AI-powered e-commerce marketplace platform built with a high-performance modern tech stack.

---

## 🏛️ Monorepo Architecture

```
CortexPulseAI /
├── frontend/             # Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
├── backend/              # Python FastAPI, SQLAlchemy 2.0, Pydantic v2
├── ml/                   # Machine learning pipelines (NumPy, Pandas, Scikit-learn)
├── docs/                 # Architecture, API specifications, and roadmap
├── .gitignore            # Root gitignore rules
└── README.md             # Project documentation and developer quickstart
```

---

## ⚡ Quickstart

### Prerequisites
- **Node.js**: v18.0+ (Tested with v24)
- **Python**: 3.10+ (Tested with 3.12)
- **Package Managers**: `npm`, `pip`

---

### 1. Running the Backend (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (CMD):
.venv\Scripts\activate.bat
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **Health Check**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)
- **Interactive API Documentation (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### 2. Running the Frontend (Next.js)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (already initialized)
npm install

# Start development server
npm run dev
```

- **Frontend URL**: [http://localhost:3000](http://localhost:3000)

---

### 3. Machine Learning Module (`ml/`)

```bash
cd ml
python -m venv .venv
# Activate venv & install dependencies
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PROJECT_NAME` | Name of the service | `CortexPulse AI` |
| `ENVIRONMENT` | Runtime environment | `development` |
| `DEBUG` | Enable debug logs and reload | `True` |
| `HOST` | Binding address | `127.0.0.1` |
| `PORT` | Listening port | `8000` |
| `API_V1_STR` | API prefix string | `/api/v1` |
| `BACKEND_CORS_ORIGINS` | Permitted browser origins | `["http://localhost:3000"]` |
| `DATABASE_URL` | Supabase / PostgreSQL async connection string | `postgresql+asyncpg://user:pass@host:5432/db` |
| `SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase public anonymous key | `your-anon-key` |
| `SECRET_KEY` | Secret key for JWT generation | `cortex_pulse_development_secret...` |

### Frontend (`frontend/.env.local`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://127.0.0.1:8000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Anonymous Key | `your-supabase-anon-key` |

---

## 🔐 Authentication & Role-Based Access Control (RBAC)

The application enforces strict role segregation across three personas:

- **CUSTOMER**: Access to buyer discovery, cart, wishlist, and `/customer/dashboard`. Restricted from merchant & admin features.
- **SELLER**: Access to merchant analytics, inventory alerts, and `/seller/dashboard`. Restricted from admin controls.
- **ADMIN**: Access to full platform governance, audit metrics, and `/admin/dashboard`.

### Routes
- `/login` — Sign in with credentials or one-click role demo testing
- `/signup` — Register as Customer or Seller (with custom store slug)
- `/profile` — Authenticated profile management and role configurations
- `/customer/dashboard` — Customer portal (Protected)
- `/seller/dashboard` — Merchant portal (Protected)
- `/admin/dashboard` — Administrator console (Protected)

---

## 📌 Foundation Status
- **Core backend structure**: FastAPI application with modular settings, health-check endpoint, async SQLAlchemy models, and Supabase JWT verification.
- **Core frontend structure**: Next.js (App Router), Tailwind CSS, TypeScript, Framer Motion, and Lucide icons.
- **Auth & Security**: Supabase Auth integration, session persistence, RoleGuard route protection, and 403 Access Denied views.
- **Database layer**: PostgreSQL schema with 16 entities, triggers, constraints, and Row Level Security.
- **ML directory**: Clean directory layout for feature engineering, model training, and pipelines.
- **Documentation**: Architectural overview, roadmap, and API specifications under `docs/`.
