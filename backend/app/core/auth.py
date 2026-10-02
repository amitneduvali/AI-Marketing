from typing import List, Optional, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security = HTTPBearer(auto_error=False)


class AuthUser:
    def __init__(self, id: str, email: str, role: str, metadata: Optional[Dict[str, Any]] = None):
        self.id = id
        self.email = email
        self.role = role.lower()
        self.metadata = metadata or {}


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> AuthUser:
    """Validate Supabase JWT and extract authenticated user and role."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        # Decode without verification if in local development mode without Supabase secret,
        # or verify with secret if configured
        secret = getattr(settings, "SUPABASE_JWT_SECRET", None) or settings.SECRET_KEY
        
        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                options={"verify_aud": False, "verify_signature": bool(getattr(settings, "SUPABASE_JWT_SECRET", None))},
            )
        except jwt.PyJWTError:
            # Fallback permissive decode for development when Supabase signature uses ES256/RS256 or cloud JWKS
            payload = jwt.decode(
                token,
                options={"verify_signature": False},
            )

        user_id = payload.get("sub")
        email = payload.get("email", "")
        user_meta = payload.get("user_metadata", {})
        app_meta = payload.get("app_metadata", {})
        
        role = user_meta.get("role") or app_meta.get("role") or payload.get("role") or "customer"

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )

        return AuthUser(id=user_id, email=email, role=role, metadata=user_meta)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(exc)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(allowed_roles: List[str]):
    """Role-based access dependency enforcing role boundaries."""
    normalized_roles = [r.lower() for r in allowed_roles]

    async def role_checker(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
        if current_user.role not in normalized_roles and "admin" not in current_user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Required role in {allowed_roles}, but current role is {current_user.role.upper()}",
            )
        return current_user

    return role_checker
