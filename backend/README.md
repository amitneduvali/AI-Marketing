# CortexPulse AI - Backend Service

FastAPI-powered asynchronous backend for CortexPulse AI.

## Requirements
- Python 3.10+ (Tested on Python 3.12)
- Virtual environment (`venv` or `conda`)

## Setup & Running Locally

### 1. Create and Activate Virtual Environment
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate on Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Or Windows (CMD):
.venv\Scripts\activate.bat
# Or macOS/Linux:
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env` (a starter `.env` has already been generated):
```bash
cp .env.example .env
```

### 4. Run the Development Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Or directly with Python:
```bash
python -m app.main
```

## Endpoints
- **Health Check**: `GET http://127.0.0.1:8000/api/v1/health`
- **Interactive OpenAPI Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`
- **Service Index**: `http://127.0.0.1:8000/`
