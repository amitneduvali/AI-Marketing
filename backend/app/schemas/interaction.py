from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class InteractionCreate(BaseModel):
    user_id: Optional[str] = None
    session_id: str = Field(..., min_length=1, description="Client session identifier")
    interaction_type: str = Field(
        ...,
        pattern="^(product_view|product_click|search|category_view|add_to_cart|remove_from_cart|wishlist|purchase|review)$",
        description="Type of user interaction",
    )
    product_id: Optional[str] = None
    category_id: Optional[str] = None
    search_query: Optional[str] = None
    duration_seconds: Optional[int] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class InteractionResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    session_id: str
    interaction_type: str
    product_id: Optional[str] = None
    category_id: Optional[str] = None
    search_query: Optional[str] = None
    duration_seconds: Optional[int] = None
    metadata: Dict[str, Any]
    created_at: datetime


class CategoryViewStat(BaseModel):
    category_id: str
    category_name: str
    views_count: int


class ProductViewStat(BaseModel):
    product_id: str
    title: str
    views_count: int
    image_url: Optional[str] = None


class InteractionAnalyticsResponse(BaseModel):
    total_interactions: int
    most_viewed_categories: List[CategoryViewStat]
    most_viewed_products: List[ProductViewStat]
    frequently_purchased_categories: List[Dict[str, Any]]
    average_order_value: float
    purchase_frequency: float
    recent_interactions: List[InteractionResponse]
