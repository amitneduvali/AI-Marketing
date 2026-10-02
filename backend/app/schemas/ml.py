from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.product import ProductResponse


class RecommendedProductItem(BaseModel):
    product: ProductResponse
    score: float = Field(..., description="ML similarity / relevance score")
    reason: str = Field(..., description="Explainable rationale for recommendation")
    match_type: str = Field(..., description="personalized_content or trending_fallback")


class RecommendationResponse(BaseModel):
    recommended_product_ids: List[str]
    items: List[RecommendedProductItem]
    model_name: str = "Content-Based Scikit-Learn TF-IDF Recommender"
    is_fallback: bool = False


class CustomerSegmentSummary(BaseModel):
    segment: str
    count: int
    percentage: float
    avg_spending: float
    description: str


class CustomerSegmentProfile(BaseModel):
    customer_id: str
    customer_name: str
    customer_email: str
    total_spending: float
    purchase_frequency: int
    average_order_value: float
    product_views: int
    cart_additions: int
    recency_days: float
    segment: str
    cluster_id: int


class CustomerSegmentationResponse(BaseModel):
    model_metadata: Dict[str, Any]
    segments: List[CustomerSegmentSummary]
    customers: List[CustomerSegmentProfile]
    total_customers_analyzed: int
