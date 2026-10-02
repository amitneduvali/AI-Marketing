from typing import Dict, Any
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user, require_role, AuthUser

router = APIRouter()


@router.get("/me", summary="Get Current Authenticated User")
async def get_me(current_user: AuthUser = Depends(get_current_user)) -> Dict[str, Any]:
    """Retrieve profile and role information for the currently authenticated user."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.upper(),
        "metadata": current_user.metadata,
    }


@router.get("/seller-only", summary="Seller Verification Check")
async def seller_only_check(
    current_user: AuthUser = Depends(require_role(["seller", "admin"])),
) -> Dict[str, Any]:
    """Verification route accessible only to merchant/seller or admin accounts."""
    return {
        "status": "authorized",
        "message": "Welcome to the Seller Console API",
        "seller_id": current_user.id,
        "role": current_user.role.upper(),
    }


@router.get("/admin-only", summary="Admin Verification Check")
async def admin_only_check(
    current_user: AuthUser = Depends(require_role(["admin"])),
) -> Dict[str, Any]:
    """Verification route accessible only to superuser/admin accounts."""
    return {
        "status": "authorized",
        "message": "Welcome to the Admin Governance API",
        "admin_id": current_user.id,
        "role": current_user.role.upper(),
    }
