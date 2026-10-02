from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.auth import get_current_user, require_role, AuthUser, security
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.order import (
    CheckoutInput,
    OrderResponse,
    OrderItemResponse,
    OrderStatusUpdate,
)
from app.services.order_service import OrderService

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


# =============================================================================
# CHECKOUT & CUSTOMER ORDERS
# =============================================================================

@router.post("/orders/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED, summary="Execute Checkout")
async def checkout_order(
    checkout_in: CheckoutInput,
    optional_user: Optional[AuthUser] = Depends(get_optional_user),
) -> OrderResponse:
    """
    Validate item stock availability, calculate taxes & shipping, decrement inventory,
    and persist order record. Supports simulated sandbox payment.
    """
    if optional_user:
        customer_id = optional_user.id
        customer_email = optional_user.email
        customer_name = optional_user.metadata.get("name") or checkout_in.shipping_address.full_name
    else:
        # Fallback to guest / demo profile derived from shipping input
        customer_id = "usr-customer-demo"
        customer_email = f"{checkout_in.shipping_address.full_name.lower().replace(' ', '.')}@example.com"
        customer_name = checkout_in.shipping_address.full_name

    try:
        order = OrderService.create_order(
            checkout_in=checkout_in,
            customer_id=customer_id,
            customer_email=customer_email,
            customer_name=customer_name,
        )
        return order
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Order creation failed: {str(e)}",
        )


@router.get("/orders", response_model=List[OrderResponse], summary="List Customer Orders")
async def list_customer_orders(
    optional_user: Optional[AuthUser] = Depends(get_optional_user),
) -> List[OrderResponse]:
    """Retrieve all orders placed by the current customer."""
    customer_id = optional_user.id if optional_user else "usr-customer-demo"
    return OrderService.get_customer_orders(customer_id)


@router.get("/orders/{order_id}", response_model=OrderResponse, summary="Get Order Details")
async def get_order_details(
    order_id: str,
    optional_user: Optional[AuthUser] = Depends(get_optional_user),
) -> OrderResponse:
    """Retrieve full order details with status tracking and line items."""
    user_id = optional_user.id if optional_user else "usr-customer-demo"
    user_role = optional_user.role if optional_user else "customer"

    order = OrderService.get_order_by_id(order_id, user_id=user_id, user_role=user_role)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found or access unauthorized",
        )
    return order


# =============================================================================
# SELLER ORDER MANAGEMENT
# =============================================================================

@router.get("/seller/orders", response_model=List[OrderResponse], summary="List Seller Orders")
async def list_seller_orders(
    optional_user: Optional[AuthUser] = Depends(get_optional_user),
) -> List[OrderResponse]:
    """Retrieve orders containing products manufactured or sold by this merchant."""
    seller_id = optional_user.id if optional_user else "s-apex-dynamics"
    return OrderService.get_seller_orders(seller_id)


@router.patch("/seller/orders/{order_id}/status", response_model=OrderResponse, summary="Update Order Status (Seller/Admin)")
@router.patch("/orders/{order_id}/status", response_model=OrderResponse, summary="Update Order Status")
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    optional_user: Optional[AuthUser] = Depends(get_optional_user),
) -> OrderResponse:
    """Update fulfillment status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED) and tracking info."""
    user_id = optional_user.id if optional_user else "s-apex-dynamics"
    user_role = optional_user.role if optional_user else "seller"

    updated = OrderService.update_order_status(
        order_id=order_id,
        status_update=status_update,
        user_id=user_id,
        user_role=user_role,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found",
        )
    return updated
