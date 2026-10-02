import sys
from pathlib import Path

# Add backend and project root
_BACKEND_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _BACKEND_DIR.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from fastapi.testclient import TestClient
from app.main import app
from app.services.interaction_service import InteractionService
from app.schemas.interaction import InteractionCreate
from app.services.product_service import _PRODUCT_STORE
from app.services.order_service import _ORDER_STORE

client = TestClient(app)

def test_full_marketing_intelligence_and_admin():
    print("--- 1. Testing Seed Data and Interactions Setup ---")
    pids = list(_PRODUCT_STORE.keys())
    assert len(pids) >= 2, "Need at least 2 catalog products"
    p1 = pids[0]
    p2 = pids[1]

    # Log views and cart additions for testing conversion calculations
    InteractionService.record_interaction(InteractionCreate(
        user_id="usr-shopper-test",
        session_id="sess-shopper-test",
        interaction_type="product_view",
        product_id=p1,
    ))
    InteractionService.record_interaction(InteractionCreate(
        user_id="usr-shopper-test",
        session_id="sess-shopper-test",
        interaction_type="add_to_cart",
        product_id=p1,
    ))
    InteractionService.record_interaction(InteractionCreate(
        user_id="usr-shopper-test",
        session_id="sess-shopper-test",
        interaction_type="product_view",
        product_id=p2,
    ))

    print("--- 2. Testing Seller Marketing Insights Endpoint ---")
    res_insights = client.get("/api/v1/seller/marketing-insights")
    assert res_insights.status_code == 200, f"Failed: {res_insights.text}"
    insights_data = res_insights.json()
    assert "insights" in insights_data
    assert "product_metrics" in insights_data
    assert len(insights_data["product_metrics"]) > 0

    first_metric = insights_data["product_metrics"][0]
    for key in ["views", "add_to_cart_rate", "conversion_rate", "units_sold", "revenue", "average_selling_price", "stock_velocity"]:
        assert key in first_metric, f"Missing metric {key}"
        print(f"Verified metric {key}: {first_metric[key]}")

    # Verify insights structure: Metric -> Finding -> Suggested Action
    for ins in insights_data["insights"]:
        assert "metric" in ins
        assert "finding" in ins
        assert "suggested_action" in ins
        assert "severity" in ins
        print(f"Verified Insight ({ins['insight_type']}):\n  Metric: {ins['metric']}\n  Finding: {ins['finding']}\n  Suggested Action: {ins['suggested_action']}")

    # Verify demand prediction in metrics
    for pm in insights_data["product_metrics"]:
        fc = pm.get("demand_forecast", {})
        assert "has_sufficient_data" in fc
        assert "confidence" in fc
        assert "trend" in fc
        assert "message" in fc
        if not fc["has_sufficient_data"]:
            assert "Insufficient historical data for reliable prediction" in fc["message"]
            print(f"Verified un-fabricated insufficient data handling on {pm['title']}")

    print("--- 3. Testing Personalized In-App Offers Endpoint ---")
    res_offers = client.get("/api/v1/offers/personalized?user_id=usr-shopper-test")
    assert res_offers.status_code == 200, f"Failed: {res_offers.text}"
    offers_data = res_offers.json()
    assert "offers" in offers_data
    assert len(offers_data["offers"]) > 0
    for off in offers_data["offers"]:
        assert off.get("is_ai_generated") is True
        assert "title" in off
        assert "promo_code" in off
        assert "reason" in off
        print(f"Verified In-App Offer: {off['title']} [Promo: {off['promo_code']}] -> Reason: {off['reason']}")

    print("--- 4. Testing Admin Dashboard Endpoint ---")
    res_admin = client.get("/api/v1/admin/dashboard")
    assert res_admin.status_code == 200, f"Failed: {res_admin.text}"
    admin_data = res_admin.json()
    assert "total_users" in admin_data
    assert "total_sellers" in admin_data
    assert "total_products" in admin_data
    assert "total_orders" in admin_data
    assert "total_revenue" in admin_data
    assert "active_products" in admin_data
    assert "top_categories" in admin_data
    assert "top_products" in admin_data
    assert "seller_performance" in admin_data
    assert "customer_segments" in admin_data
    assert "ai_recommendation_stats" in admin_data
    assert "users" in admin_data
    assert "categories" in admin_data
    print(f"Admin Totals: Users={admin_data['total_users']}, Sellers={admin_data['total_sellers']}, Revenue=${admin_data['total_revenue']}, Products={admin_data['total_products']}")

    print("--- 5. Testing Category Creation Endpoint ---")
    cat_payload = {
        "name": "Neural Peripherals",
        "slug": "neural-peripherals",
        "description": "Brain-computer interfaces and precision neural tactile controls."
    }
    res_cat = client.post("/api/v1/admin/categories", json=cat_payload)
    assert res_cat.status_code == 201, f"Failed: {res_cat.text}"
    cat_created = res_cat.json()
    assert cat_created["name"] == "Neural Peripherals"
    assert cat_created["slug"] == "neural-peripherals"
    print(f"Created Category Successfully: ID={cat_created['id']}, Name={cat_created['name']}")

    print("ALL MARKETING INTELLIGENCE & ADMIN BACKEND TESTS PASSED 100%!")

if __name__ == "__main__":
    test_full_marketing_intelligence_and_admin()
