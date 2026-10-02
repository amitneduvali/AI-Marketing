from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from app.schemas.interaction import (
    InteractionCreate,
    InteractionResponse,
    InteractionAnalyticsResponse,
    CategoryViewStat,
    ProductViewStat,
)
from app.services.interaction_service import InteractionService

router = APIRouter()


@router.post("", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED, summary="Track Customer Interaction")
@router.post("/track", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED, summary="Track Customer Interaction (Alias)")
async def track_interaction(interaction_in: InteractionCreate) -> InteractionResponse:
    """
    Log an interaction event (product_view, product_click, search, category_view, add_to_cart, wishlist, purchase, review).
    Stores events without collecting unnecessary PII.
    """
    return InteractionService.record_interaction(interaction_in)


@router.get("/analytics", response_model=InteractionAnalyticsResponse, summary="Get Interaction Analytics")
async def get_interaction_analytics() -> InteractionAnalyticsResponse:
    """
    Calculate most viewed categories, most viewed products, frequently purchased categories,
    average order value, and purchase frequency.
    """
    return InteractionService.get_interaction_analytics()


@router.get("/history", response_model=List[InteractionResponse], summary="Get Customer Interactions")
async def get_customer_interactions(
    user_id: Optional[str] = Query(None),
    session_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
) -> List[InteractionResponse]:
    """Retrieve recent interaction stream for user or session."""
    return InteractionService.get_recent_interactions(user_id=user_id, session_id=session_id, limit=limit)
