import sys
from pathlib import Path
from typing import List, Dict, Any, Optional

# Ensure ml package is resolvable
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from ml.src.models.recommender import ContentBasedRecommender
from ml.src.models.segmentation import CustomerSegmentationModel
from app.services.product_service import _PRODUCT_STORE
from app.services.order_service import _ORDER_STORE
from app.services.interaction_service import InteractionService
from app.schemas.product import ProductResponse
from app.schemas.ml import (
    RecommendationResponse,
    RecommendedProductItem,
    CustomerSegmentationResponse,
    CustomerSegmentSummary,
    CustomerSegmentProfile,
)


class MLService:
    @staticmethod
    def get_personalized_recommendations(
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        limit: int = 8,
    ) -> RecommendationResponse:
        """
        Generate content-based recommendations combining TF-IDF product attributes
        with customer interaction events.
        """
        catalog_products = list(_PRODUCT_STORE.values())
        if not catalog_products:
            return RecommendationResponse(
                recommended_product_ids=[],
                items=[],
                is_fallback=True,
            )

        # 1. Gather User Interactions
        all_interactions = InteractionService.get_all_interactions()
        user_interactions = [
            it for it in all_interactions
            if (user_id and it.get("user_id") == user_id)
            or (session_id and it.get("session_id") == session_id)
            or (not user_id and not session_id and it.get("user_id") == "usr-customer-demo")
        ]

        # 2. Gather Previous Purchases
        user_purchases = []
        for o in _ORDER_STORE.values():
            is_match = (
                (user_id and o.get("customer_id") == user_id)
                or (not user_id and o.get("customer_id") == "usr-customer-demo")
            )
            if is_match and o.get("status") != "CANCELLED":
                for item in o.get("items", []):
                    user_purchases.append({"product_id": item.get("product_id")})

        # 3. Fit Recommender & Predict
        recommender = ContentBasedRecommender()
        recommender.fit(catalog_products)
        raw_recommendations = recommender.recommend(
            user_interactions=user_interactions,
            user_purchases=user_purchases,
            top_n=limit,
        )

        recommended_items: List[RecommendedProductItem] = []
        recommended_ids: List[str] = []
        is_fallback = True

        for rec in raw_recommendations:
            pid = rec["product_id"]
            prod_dict = _PRODUCT_STORE.get(pid)
            if not prod_dict:
                continue

            recommended_ids.append(pid)
            if rec.get("match_type") == "personalized_content":
                is_fallback = False

            recommended_items.append(
                RecommendedProductItem(
                    product=ProductResponse(**prod_dict),
                    score=rec["score"],
                    reason=rec["reason"],
                    match_type=rec["match_type"],
                )
            )

        return RecommendationResponse(
            recommended_product_ids=recommended_ids,
            items=recommended_items,
            model_name="Content-Based Scikit-Learn TF-IDF Recommender",
            is_fallback=is_fallback,
        )

    @staticmethod
    def get_customer_segmentation() -> CustomerSegmentationResponse:
        """
        Train and evaluate KMeans clustering model across customer RFM and interaction data.
        """
        orders = list(_ORDER_STORE.values())
        interactions = InteractionService.get_all_interactions()

        model = CustomerSegmentationModel(n_clusters=5)
        results = model.train_and_segment(orders=orders, interactions=interactions)

        segments = [CustomerSegmentSummary(**s) for s in results.get("segments", [])]
        customers = [CustomerSegmentProfile(**c) for c in results.get("customers", [])]

        return CustomerSegmentationResponse(
            model_metadata=results.get("model_metadata", {}),
            segments=segments,
            customers=customers,
            total_customers_analyzed=len(customers),
        )
