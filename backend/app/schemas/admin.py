from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.product import CategoryResponse, ProductResponse
from app.schemas.order import OrderResponse
from app.schemas.ml import CustomerSegmentSummary


class TopCategoryStat(BaseModel):
    category_name: str
    units_sold: int
    total_revenue: float


class TopProductStat(BaseModel):
    product_id: str
    title: str
    seller_name: str
    price: float
    stock_quantity: int
    units_sold: int
    total_revenue: float


class SellerPerformanceStat(BaseModel):
    seller_id: str
    store_name: str
    products_count: int
    units_sold: int
    total_revenue: float
    rating: float = 4.9
    status: str = "active"


class UserItem(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str
    joined: str


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_sellers: int
    total_products: int
    active_products: int
    total_orders: int
    total_revenue: float
    top_categories: List[TopCategoryStat]
    top_products: List[TopProductStat]
    seller_performance: List[SellerPerformanceStat]
    customer_segments: List[CustomerSegmentSummary]
    ai_recommendation_stats: Dict[str, Any]
    users: List[UserItem]
    orders: List[Dict[str, Any]]
    products: List[Dict[str, Any]]
    categories: List[CategoryResponse]


class AddCategoryInput(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
