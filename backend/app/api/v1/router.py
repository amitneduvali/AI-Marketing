from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, products, orders, seller, interactions, ml, admin

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(products.router, tags=["Products & Catalog"])
api_router.include_router(orders.router, tags=["Orders & Checkout"])
api_router.include_router(seller.router, prefix="/seller", tags=["Seller Hub"])
api_router.include_router(interactions.router, prefix="/interactions", tags=["Customer Interactions"])
api_router.include_router(ml.router, tags=["Machine Learning Intelligence"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Portal"])



