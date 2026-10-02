from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    service: str = Field(..., example="CortexPulse AI Backend")
    version: str = Field(..., example="0.1.0")
    environment: str = Field(..., example="development")
    timestamp: datetime
    database: str = Field(..., example="configured / not connected")
    details: Optional[str] = None
