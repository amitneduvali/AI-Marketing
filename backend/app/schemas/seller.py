from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.order import OrderResponse


class TopProductItem(BaseModel):
    product_id: str
    title: str
    image_url: Optional[str] = None
    price: float
    stock_quantity: int
    units_sold: int
    total_revenue: float


class DailyMetric(BaseModel):
    date: str
    sales: float
    orders_count: int


class CategorySalesMetric(BaseModel):
    category_name: str
    units_sold: int
    total_sales: float


class SellerAnalyticsResponse(BaseModel):
    total_products: int = Field(..., description="Total products registered for this merchant")
    total_orders: int = Field(..., description="Total orders placed containing merchant products")
    total_sales: float = Field(..., description="Gross revenue from fulfilled/active orders")
    units_sold: int = Field(..., description="Total physical units sold across orders")
    low_stock_products: int = Field(..., description="Number of catalog products at or below threshold")
    recent_orders: List[OrderResponse] = Field(default_factory=list, description="Recent orders containing merchant items")
    top_products: List[TopProductItem] = Field(default_factory=list, description="Top performing products calculated from orders")
    revenue_by_date: List[DailyMetric] = Field(default_factory=list, description="Historical sales aggregated by day for charts")
    order_status_counts: Dict[str, int] = Field(default_factory=dict, description="Count of orders categorized by fulfillment status")
    category_sales: List[CategorySalesMetric] = Field(default_factory=list, description="Revenue and volume distribution by product category")


class InventoryUpdateInput(BaseModel):
    stock_quantity: int = Field(..., ge=0, description="New stock quantity")
