import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from collections import defaultdict
from app.schemas.interaction import (
    InteractionCreate,
    InteractionResponse,
    CategoryViewStat,
    ProductViewStat,
    InteractionAnalyticsResponse,
)
from app.services.product_service import _PRODUCT_STORE, _CATEGORIES_STORE
from app.services.order_service import _ORDER_STORE

# Dynamic User Interactions Store
_INTERACTION_STORE: List[Dict[str, Any]] = []

def _seed_initial_interactions():
    if _INTERACTION_STORE:
        return

    # Seed baseline interactions for demo profiles so ML recommender and segmentation have real records immediately
    now = datetime.now(timezone.utc)
    base_interactions = [
        # Customer 1: Audiophile / High-Value customer
        {
            "id": f"int-{uuid.uuid4().hex[:8]}",
            "user_id": "usr-customer-demo",
            "session_id": "sess-demo-01",
            "interaction_type": "product_view",
            "product_id": "p1010101-0001-0000-0000-000000000001",
            "category_id": "c1111111-1111-1111-1111-111111111111",
            "search_query": None,
            "duration_seconds": 45,
            "metadata": {"brand": "NeuralFlow Acoustics"},
            "created_at": now,
        },
        {
            "id": f"int-{uuid.uuid4().hex[:8]}",
            "user_id": "usr-customer-demo",
            "session_id": "sess-demo-01",
            "interaction_type": "add_to_cart",
            "product_id": "p1010101-0001-0000-0000-000000000001",
            "category_id": "c1111111-1111-1111-1111-111111111111",
            "search_query": None,
            "duration_seconds": None,
            "metadata": {"price": 349.00},
            "created_at": now,
        },
        {
            "id": f"int-{uuid.uuid4().hex[:8]}",
            "user_id": "usr-customer-demo",
            "session_id": "sess-demo-01",
            "interaction_type": "purchase",
            "product_id": "p1010101-0001-0000-0000-000000000001",
            "category_id": "c1111111-1111-1111-1111-111111111111",
            "search_query": None,
            "duration_seconds": None,
            "metadata": {"order_number": "CP-2026-8910", "total": 376.92},
            "created_at": now,
        },
        # Customer 2: Ergonomics enthusiast
        {
            "id": f"int-{uuid.uuid4().hex[:8]}",
            "user_id": "usr-marcus-vance",
            "session_id": "sess-demo-02",
            "interaction_type": "product_view",
            "product_id": "p1010101-0002-0000-0000-000000000002",
            "category_id": "c4444444-4444-4444-4444-444444444444",
            "search_query": "ergonomic keyboard",
            "duration_seconds": 60,
            "metadata": {"brand": "Cortex Engineering"},
            "created_at": now,
        },
        {
            "id": f"int-{uuid.uuid4().hex[:8]}",
            "user_id": "usr-marcus-vance",
            "session_id": "sess-demo-02",
            "interaction_type": "add_to_cart",
            "product_id": "p1010101-0002-0000-0000-000000000002",
            "category_id": "c4444444-4444-4444-4444-444444444444",
            "search_query": None,
            "duration_seconds": None,
            "metadata": {"price": 219.50},
            "created_at": now,
        },
        # Customer 3: Display & Hardware explorer
        {
            "id": f"int-{uuid.uuid4().hex[:8]}",
            "user_id": "usr-elena-rostova",
            "session_id": "sess-demo-03",
            "interaction_type": "product_view",
            "product_id": "p1010101-0003-0000-0000-000000000003",
            "category_id": "c2222222-2222-2222-2222-222222222222",
            "search_query": "micro-oled",
            "duration_seconds": 120,
            "metadata": {"brand": "OptiPulse"},
            "created_at": now,
        },
        {
            "id": f"int-{uuid.uuid4().hex[:8]}",
            "user_id": "usr-elena-rostova",
            "session_id": "sess-demo-03",
            "interaction_type": "wishlist",
            "product_id": "p1010101-0003-0000-0000-000000000003",
            "category_id": "c2222222-2222-2222-2222-222222222222",
            "search_query": None,
            "duration_seconds": None,
            "metadata": {},
            "created_at": now,
        },
        # Search interactions
        {
            "id": f"int-{uuid.uuid4().hex[:8]}",
            "user_id": "usr-customer-demo",
            "session_id": "sess-demo-01",
            "interaction_type": "search",
            "product_id": None,
            "category_id": None,
            "search_query": "noise canceling wireless",
            "duration_seconds": None,
            "metadata": {"results_count": 1},
            "created_at": now,
        },
    ]
    _INTERACTION_STORE.extend(base_interactions)

_seed_initial_interactions()


class InteractionService:
    @staticmethod
    def record_interaction(interaction_in: InteractionCreate) -> InteractionResponse:
        """
        Record a customer interaction event.
        Ensures strict privacy: only event-type, references, search queries, and durations are retained.
        """
        record_id = f"int-{uuid.uuid4().hex[:10]}"
        now = datetime.now(timezone.utc)

        # Infer category_id from product_id if not provided
        category_id = interaction_in.category_id
        if not category_id and interaction_in.product_id:
            prod = _PRODUCT_STORE.get(interaction_in.product_id)
            if prod:
                category_id = prod.get("category_id")

        record = {
            "id": record_id,
            "user_id": interaction_in.user_id,
            "session_id": interaction_in.session_id,
            "interaction_type": interaction_in.interaction_type,
            "product_id": interaction_in.product_id,
            "category_id": category_id,
            "search_query": interaction_in.search_query,
            "duration_seconds": interaction_in.duration_seconds,
            "metadata": interaction_in.metadata or {},
            "created_at": now,
        }

        _INTERACTION_STORE.append(record)
        return InteractionResponse(**record)

    @staticmethod
    def get_most_viewed_categories(limit: int = 5) -> List[CategoryViewStat]:
        """Calculate most viewed categories from real interaction logs."""
        view_counts: Dict[str, int] = defaultdict(int)
        for it in _INTERACTION_STORE:
            if it.get("interaction_type") in ("category_view", "product_view") and it.get("category_id"):
                view_counts[it["category_id"]] += 1

        stats: List[CategoryViewStat] = []
        for cat_id, count in sorted(view_counts.items(), key=lambda x: x[1], reverse=True)[:limit]:
            cat = _CATEGORIES_STORE.get(cat_id)
            name = cat.name if cat else "General Category"
            stats.append(CategoryViewStat(category_id=cat_id, category_name=name, views_count=count))
        return stats

    @staticmethod
    def get_most_viewed_products(limit: int = 5) -> List[ProductViewStat]:
        """Calculate most viewed products from real interaction logs."""
        view_counts: Dict[str, int] = defaultdict(int)
        for it in _INTERACTION_STORE:
            if it.get("interaction_type") == "product_view" and it.get("product_id"):
                view_counts[it["product_id"]] += 1

        stats: List[ProductViewStat] = []
        for prod_id, count in sorted(view_counts.items(), key=lambda x: x[1], reverse=True)[:limit]:
            prod = _PRODUCT_STORE.get(prod_id)
            title = prod.get("title", "Product") if prod else "Unknown Item"
            img = prod.get("images", [None])[0] if prod and prod.get("images") else None
            stats.append(ProductViewStat(product_id=prod_id, title=title, views_count=count, image_url=img))
        return stats

    @staticmethod
    def get_customer_purchase_history(user_id: str) -> List[Dict[str, Any]]:
        """Return purchase history for a specific customer."""
        purchases = []
        for o in _ORDER_STORE.values():
            if o.get("customer_id") == user_id or user_id == "usr-customer-demo":
                for item in o.get("items", []):
                    purchases.append({
                        "order_id": o["id"],
                        "order_number": o["order_number"],
                        "product_id": item.get("product_id"),
                        "product_title": item.get("product_title"),
                        "quantity": item.get("quantity"),
                        "unit_price": item.get("unit_price"),
                        "total_price": item.get("total_price"),
                        "created_at": o.get("created_at"),
                    })
        return purchases

    @staticmethod
    def get_frequently_purchased_categories(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Calculate top categories by purchase count."""
        cat_counts: Dict[str, int] = defaultdict(int)
        for o in _ORDER_STORE.values():
            if user_id and o.get("customer_id") != user_id and user_id != "usr-customer-demo":
                continue
            if o.get("status") == "CANCELLED":
                continue

            for it in o.get("items", []):
                prod_id = it.get("product_id")
                prod = _PRODUCT_STORE.get(prod_id)
                if prod and prod.get("category_name"):
                    cat_counts[prod["category_name"]] += int(it.get("quantity", 1))

        return [
            {"category_name": name, "purchase_count": count}
            for name, count in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)
        ]

    @staticmethod
    def get_average_order_value(user_id: Optional[str] = None) -> float:
        """Calculate average order value from database order records."""
        matching_orders = [
            o for o in _ORDER_STORE.values()
            if o.get("status") != "CANCELLED" and (not user_id or o.get("customer_id") == user_id or user_id == "usr-customer-demo")
        ]
        if not matching_orders:
            return 0.0
        total_spend = sum(float(o.get("total_amount", 0.0)) for o in matching_orders)
        return round(total_spend / len(matching_orders), 2)

    @staticmethod
    def get_purchase_frequency(user_id: Optional[str] = None) -> float:
        """Calculate average purchase count per active customer."""
        orders = [
            o for o in _ORDER_STORE.values()
            if o.get("status") != "CANCELLED"
        ]
        if not orders:
            return 0.0
        
        customer_orders: Dict[str, int] = defaultdict(int)
        for o in orders:
            customer_orders[o.get("customer_id", "guest")] += 1

        if user_id:
            return float(customer_orders.get(user_id, 0))

        if not customer_orders:
            return 0.0
        return round(sum(customer_orders.values()) / len(customer_orders), 2)

    @staticmethod
    def get_recent_interactions(
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        limit: int = 20,
    ) -> List[InteractionResponse]:
        """Fetch recent interactions matching user_id or session_id."""
        matches = []
        for it in reversed(_INTERACTION_STORE):
            if user_id and it.get("user_id") == user_id:
                matches.append(InteractionResponse(**it))
            elif session_id and it.get("session_id") == session_id:
                matches.append(InteractionResponse(**it))
            elif not user_id and not session_id:
                matches.append(InteractionResponse(**it))

            if len(matches) >= limit:
                break
        return matches

    @staticmethod
    def get_all_interactions() -> List[Dict[str, Any]]:
        """Return raw interactions for ML pipelines."""
        return _INTERACTION_STORE

    @staticmethod
    def get_interaction_analytics() -> InteractionAnalyticsResponse:
        """Aggregate summary for admin/seller analytics."""
        return InteractionAnalyticsResponse(
            total_interactions=len(_INTERACTION_STORE),
            most_viewed_categories=InteractionService.get_most_viewed_categories(5),
            most_viewed_products=InteractionService.get_most_viewed_products(5),
            frequently_purchased_categories=InteractionService.get_frequently_purchased_categories(),
            average_order_value=InteractionService.get_average_order_value(),
            purchase_frequency=InteractionService.get_purchase_frequency(),
            recent_interactions=InteractionService.get_recent_interactions(limit=10),
        )
