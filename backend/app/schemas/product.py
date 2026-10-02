from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

    model_config = {"from_attributes": True}


class ProductImageSchema(BaseModel):
    id: Optional[str] = None
    image_url: str
    alt_text: Optional[str] = None
    display_order: int = 0
    is_thumbnail: bool = False

    model_config = {"from_attributes": True}


class ProductReviewSummary(BaseModel):
    id: str
    customer_name: str
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    is_verified_purchase: bool = True
    created_at: datetime


class ProductResponse(BaseModel):
    id: str
    seller_id: str
    seller_name: str = "Verified Merchant"
    seller_slug: str = "store"
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    title: str
    slug: str
    description: Optional[str] = None
    brand: Optional[str] = None
    price: float
    compare_at_price: Optional[float] = None
    sku: Optional[str] = None
    status: str = "published"
    stock_quantity: int = 0
    is_featured: bool = False
    attributes: Dict[str, Any] = Field(default_factory=dict)
    specifications: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    image_details: List[ProductImageSchema] = Field(default_factory=list)
    avg_rating: float = 0.0
    review_count: int = 0
    reviews: List[ProductReviewSummary] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ProductCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    slug: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = Field(None, max_length=100)
    category_id: Optional[str] = None
    price: float = Field(..., gt=0, description="Price must be strictly positive")
    compare_at_price: Optional[float] = Field(None, ge=0, description="Optional discount compare-at price")
    sku: Optional[str] = Field(None, max_length=100)
    stock_quantity: int = Field(default=0, ge=0, description="Inventory quantity on hand")
    status: str = Field(default="published", pattern="^(draft|published|archived)$")
    is_featured: bool = False
    specifications: Optional[Dict[str, Any]] = None
    attributes: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    images: Optional[List[str]] = None

    @field_validator("compare_at_price")
    @classmethod
    def validate_compare_price(cls, v: Optional[float], info) -> Optional[float]:
        # compare_at_price should ideally be higher than price for a discount
        return v


class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    slug: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = None
    category_id: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    compare_at_price: Optional[float] = Field(None, ge=0)
    sku: Optional[str] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    status: Optional[str] = Field(None, pattern="^(draft|published|archived)$")
    is_featured: Optional[bool] = None
    specifications: Optional[Dict[str, Any]] = None
    attributes: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    images: Optional[List[str]] = None


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=180)
    comment: Optional[str] = Field(None, min_length=3)
