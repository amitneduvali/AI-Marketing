from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.auth import get_current_user, AuthUser, security
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.admin import AdminDashboardResponse, AddCategoryInput
from app.schemas.product import CategoryResponse
from app.services.admin_service import AdminService
from app.services.product_service import _CATEGORIES_STORE, _PRODUCT_STORE
from app.services.order_service import _ORDER_STORE

router = APIRouter()


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[AuthUser]:
    """Retrieve authenticated user if bearer token is present, else None."""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except Exception:
        return None


@router.get("/dashboard", response_model=AdminDashboardResponse, summary="Get Full Admin Platform Analytics")
async def get_admin_dashboard(
    optional_user: Optional[AuthUser] = Depends(get_optional_user),
) -> AdminDashboardResponse:
    """
    Returns aggregated marketplace data from real database records:
    Users, sellers, products, orders, revenue, top categories, top products,
    seller performance rankings, AI customer segments, and recommendation model telemetry.
    """
    return AdminService.get_admin_dashboard_metrics()


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, summary="Create Platform Category")
async def create_category(
    category_in: AddCategoryInput,
    optional_user: Optional[AuthUser] = Depends(get_optional_user),
) -> CategoryResponse:
    """
    Create a new product catalog category in PostgreSQL / in-memory store.
    """
    return AdminService.add_category(
        name=category_in.name,
        slug=category_in.slug,
        description=category_in.description,
    )


@router.get("/categories", response_model=List[CategoryResponse], summary="List Platform Categories")
async def list_categories() -> List[CategoryResponse]:
    """List all categories available for product categorization."""
    return list(_CATEGORIES_STORE.values())
