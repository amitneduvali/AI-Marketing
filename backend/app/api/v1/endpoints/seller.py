from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.auth import get_current_user, AuthUser, security
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.seller import (
    SellerAnalyticsResponse,
    InventoryUpdateInput,
)
from app.schemas.product import ProductResponse
from app.services.seller_service import SellerService
from app.services.product_service import _PRODUCT_STORE

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


@router.get("/analytics", response_model=SellerAnalyticsResponse, summary="Get Live Seller Analytics")
async def get_seller_analytics(
    optional_user: Optional[AuthUser] = Depends(get_optional_user),
) -> SellerAnalyticsResponse:
    """
    Retrieve real database metrics: Total products, Total orders, Total sales,
    Units sold, Low-stock products, Recent orders, and Top products.
    """
    seller_id = optional_user.id if optional_user else "s-apex-dynamics"
    return SellerService.get_seller_analytics(seller_id)


@router.get("/inventory", response_model=List[ProductResponse], summary="Get Merchant Inventory")
async def get_merchant_inventory(
    optional_user: Optional[AuthUser] = Depends(get_optional_user),
) -> List[ProductResponse]:
    """List all inventory items with current stock quantities and threshold warnings."""
    seller_id = optional_user.id if optional_user else "s-apex-dynamics"
    is_demo_or_all = seller_id in ("admin", "s-apex-dynamics") or seller_id.startswith("usr-")
    
    items = [
        ProductResponse(**p)
        for p in _PRODUCT_STORE.values()
        if is_demo_or_all or p.get("seller_id") == seller_id
    ]
    items.sort(key=lambda x: x.stock_quantity)
    return items


@router.patch("/inventory/{product_id}", response_model=ProductResponse, summary="Update Stock Quantity")
async def update_inventory_stock(
    product_id: str,
    update_in: InventoryUpdateInput,
    optional_user: Optional[AuthUser] = Depends(get_optional_user),
) -> ProductResponse:
    """Adjust inventory stock quantity in real database store."""
    seller_id = optional_user.id if optional_user else "s-apex-dynamics"
    try:
        updated = SellerService.update_stock(
            product_id=product_id,
            new_stock=update_in.stock_quantity,
            seller_id=seller_id,
        )
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{product_id}' not found",
            )
        return ProductResponse(**updated)
    except PermissionError as pe:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(pe),
        )


@router.get("/marketing-insights", summary="Get AI Marketing Intelligence & Product Conversion Funnel")
async def get_seller_marketing_insights(
    optional_user: Optional[AuthUser] = Depends(get_optional_user),
) -> Dict[str, Any]:
    """
    Computes data-driven marketing metrics: Views, Add-to-cart rate,
    Conversion rate, Units sold, Revenue, Average Selling Price (ASP), Stock Velocity,
    and Demand Forecast with zero fabricated numbers. Generates structured insights:
    Metric -> Finding -> Suggested Action.
    """
    from app.services.marketing_insights_service import MarketingInsightsService
    seller_id = optional_user.id if optional_user else "s-apex-dynamics"
    return MarketingInsightsService.generate_marketing_insights(seller_id)

