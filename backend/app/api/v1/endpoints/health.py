from datetime import datetime, timezone
from fastapi import APIRouter
from sqlalchemy import text
from app.core.config import settings
from app.db.session import engine
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="System Health Check")
async def health_check() -> HealthResponse:
    """Check the operational health of the backend API and database connectivity."""
    db_status = "unconfigured"
    details = "DATABASE_URL not set. Running in decoupled mode."

    if engine is not None:
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            db_status = "connected"
            details = "PostgreSQL / Supabase connection healthy"
        except Exception as exc:
            db_status = "disconnected"
            details = f"Database connection error: {str(exc)}"

    return HealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version="0.1.0",
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc),
        database=db_status,
        details=details,
    )
