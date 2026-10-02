from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0, description="Quantity to purchase")


class ShippingAddressInput(BaseModel):
    full_name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=5)
    address_line: str = Field(..., min_length=3)
    city: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    postal_code: str = Field(..., min_length=2)
    country: str = Field(default="US")


class CheckoutInput(BaseModel):
    items: List[OrderItemCreate] = Field(..., min_length=1)
    shipping_address: ShippingAddressInput
    payment_method: str = Field(default="simulated_card")
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_title: str
    product_image: Optional[str] = None
    seller_id: str
    seller_name: str
    quantity: int
    unit_price: float
    total_price: float
    status: str


class OrderResponse(BaseModel):
    id: str
    order_number: str
    customer_id: str
    customer_name: str
    customer_email: str
    status: str  # PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    currency: str = "USD"
    subtotal: float
    tax_amount: float
    shipping_amount: float
    discount_amount: float
    total_amount: float
    shipping_address: Dict[str, Any]
    items: List[OrderItemResponse]
    tracking_number: Optional[str] = None
    payment_status: str = "completed"
    payment_method: str = "simulated_card"
    created_at: datetime
    updated_at: datetime


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(PENDING|CONFIRMED|PROCESSING|SHIPPED|DELIVERED|CANCELLED)$")
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
