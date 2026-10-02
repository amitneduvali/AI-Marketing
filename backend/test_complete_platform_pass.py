import sys
import io
import uuid
from pathlib import Path

# Add backend and project root
_BACKEND_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _BACKEND_DIR.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

import jwt
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.services.product_service import _PRODUCT_STORE, ProductService
from app.services.order_service import _ORDER_STORE, OrderService
from app.services.interaction_service import InteractionService
from app.schemas.interaction import InteractionCreate

client = TestClient(app)

def create_mock_jwt(user_id: str, email: str, role: str) -> dict:
    payload = {
        "sub": user_id,
        "email": email,
        "user_metadata": {
            "role": role,
            "name": email.split("@")[0],
        },
    }
    secret = getattr(settings, "SUPABASE_JWT_SECRET", None) or settings.SECRET_KEY
    token = jwt.encode(payload, secret, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}

def test_complete_platform_pass():
    print("\n=======================================================")
    print("STARTING COMPLETE COMPREHENSIVE PLATFORM TEST PASS")
    print("=======================================================\n")

    # -----------------------------------------------------------------
    # 1. AUTHENTICATION & ROLE PROTECTION
    # -----------------------------------------------------------------
    print("--- [1/6] Testing Authentication, Tokens & Role Protection ---")
    customer_headers = create_mock_jwt("usr-test-cust-1", "cust1@cortex-pulse.ai", "customer")
    seller_headers = create_mock_jwt("usr-test-seller-1", "seller1@cortex-pulse.ai", "seller")
    admin_headers = create_mock_jwt("usr-test-admin-1", "admin1@cortex-pulse.ai", "admin")

    # Customer profile check
    res_me = client.get("/api/v1/auth/me", headers=customer_headers)
    assert res_me.status_code == 200, f"Auth /me failed: {res_me.text}"
    assert res_me.json()["role"] == "CUSTOMER"

    # Role protection: Customer accessing seller route -> 403
    res_cust_seller = client.get("/api/v1/auth/seller-only", headers=customer_headers)
    assert res_cust_seller.status_code == 403, "Customer should be forbidden on seller-only route"

    # Role protection: Customer accessing admin route -> 403
    res_cust_admin = client.get("/api/v1/auth/admin-only", headers=customer_headers)
    assert res_cust_admin.status_code == 403, "Customer should be forbidden on admin-only route"

    # Role protection: Seller accessing seller route -> 200
    res_seller_ok = client.get("/api/v1/auth/seller-only", headers=seller_headers)
    assert res_seller_ok.status_code == 200, "Seller should have access to seller-only route"

    # Role protection: Seller accessing admin route -> 403
    res_seller_admin = client.get("/api/v1/auth/admin-only", headers=seller_headers)
    assert res_seller_admin.status_code == 403, "Seller should be forbidden on admin-only route"

    # Role protection: Admin accessing admin route -> 200
    res_admin_ok = client.get("/api/v1/auth/admin-only", headers=admin_headers)
    assert res_admin_ok.status_code == 200, "Admin should have access to admin-only route"

    # Unauthenticated access to protected route -> 403/401
    res_unauth = client.get("/api/v1/auth/admin-only")
    assert res_unauth.status_code in (401, 403), "Unauthenticated access must be rejected"
    print("[OK] Authentication & role boundaries verified successfully.")

    # -----------------------------------------------------------------
    # 2. PRODUCTS (ADD, EDIT, DELETE, IMAGE UPLOAD, STOCK)
    # -----------------------------------------------------------------
    print("\n--- [2/6] Testing Products Management & Image Upload ---")

    # Image upload
    fake_img = io.BytesIO(b"fake image bytes content")
    res_upload = client.post(
        "/api/v1/upload/image",
        headers=seller_headers,
        files={"file": ("test_lens.jpg", fake_img, "image/jpeg")},
    )
    assert res_upload.status_code == 200, f"Image upload failed: {res_upload.text}"
    uploaded_url = res_upload.json()["url"]
    assert "http" in uploaded_url
    print(f"[OK] Image upload successful: {uploaded_url}")

    # Add Product
    prod_payload = {
        "title": "Quantum Neural Optical Visor",
        "description": "Next-generation augmented optical headset with micro-OLED waveguide lenses.",
        "category_id": "c-audio-sound",
        "price": 499.00,
        "compare_at_price": 599.00,
        "stock_quantity": 8,
        "sku": f"VISOR-{uuid.uuid4().hex[:6].upper()}",
        "images": [uploaded_url],
        "brand": "Cortex Optics",
        "tags": ["visor", "optics", "neural", "wearable"],
        "status": "published",
        "specifications": {"FOV": "110 degrees", "Weight": "210g"},
    }
    res_add = client.post("/api/v1/seller/products", headers=seller_headers, json=prod_payload)
    assert res_add.status_code == 201, f"Product creation failed: {res_add.text}"
    created_prod = res_add.json()
    new_pid = created_prod["id"]
    assert created_prod["title"] == prod_payload["title"]
    assert created_prod["stock_quantity"] == 8
    print(f"[OK] Product created: ID={new_pid}, Title='{created_prod['title']}'")

    # Edit Product
    edit_payload = {
        "title": "Quantum Neural Optical Visor Pro",
        "price": 479.00,
        "stock_quantity": 10,
    }
    res_edit = client.put(f"/api/v1/seller/products/{new_pid}", headers=seller_headers, json=edit_payload)
    assert res_edit.status_code == 200, f"Product edit failed: {res_edit.text}"
    edited_prod = res_edit.json()
    assert edited_prod["title"] == "Quantum Neural Optical Visor Pro"
    assert edited_prod["price"] == 479.00
    assert edited_prod["stock_quantity"] == 10
    print(f"[OK] Product edited: New Price=${edited_prod['price']}, Stock={edited_prod['stock_quantity']}")

    # Stock update endpoint (Seller Inventory adjustment)
    res_stock = client.patch(
        f"/api/v1/seller/inventory/{new_pid}",
        headers=seller_headers,
        json={"stock_quantity": 15},
    )
    assert res_stock.status_code == 200
    assert res_stock.json()["stock_quantity"] == 15
    print("[OK] Stock quantity updated via inventory endpoint to 15.")

    # -----------------------------------------------------------------
    # 3. MARKETPLACE (SEARCH, FILTERS, DETAILS, WISHLIST / INTERACTIONS)
    # -----------------------------------------------------------------
    print("\n--- [3/6] Testing Marketplace Search, Filters & Product Details ---")

    # Search by keyword
    res_search = client.get("/api/v1/products?search=Visor")
    assert res_search.status_code == 200
    search_results = res_search.json()
    assert search_results["total"] >= 1
    assert any("Visor" in p["title"] for p in search_results["items"])
    print(f"[OK] Search query 'Visor' returned {search_results['total']} product(s).")

    # Filter by price range
    res_price_filter = client.get("/api/v1/products?min_price=400&max_price=500")
    assert res_price_filter.status_code == 200
    for p in res_price_filter.json()["items"]:
        assert 400 <= p["price"] <= 500
    print("[OK] Price range filter (400-500) validated.")

    # Product details endpoint
    res_detail = client.get(f"/api/v1/products/{new_pid}")
    assert res_detail.status_code == 200
    assert res_detail.json()["id"] == new_pid
    print("[OK] Product details endpoint verified.")

    # Wishlist / interaction tracking
    res_it = client.post(
        "/api/v1/interactions",
        json={
            "user_id": "usr-test-cust-1",
            "session_id": "sess-test-cust-1",
            "interaction_type": "wishlist",
            "product_id": new_pid,
        },
    )
    assert res_it.status_code == 200
    assert res_it.json()["status"] == "recorded"
    print("[OK] Wishlist interaction successfully tracked.")

    # -----------------------------------------------------------------
    # 4. CART & ORDERS (STOCK VALIDATION, CHECKOUT, ORDER LIFECYCLE)
    # -----------------------------------------------------------------
    print("\n--- [4/6] Testing Cart, Stock Validation & Order Lifecycle ---")

    # Stock boundary: Attempting checkout with quantity exceeding stock
    insufficient_stock_payload = {
        "items": [{"product_id": new_pid, "quantity": 9999}],
        "shipping_address": {
            "full_name": "Dr. Sarah Connor",
            "phone": "+1-555-0199",
            "address_line1": "742 Evergreen Terrace",
            "city": "Cyber City",
            "state": "California",
            "postal_code": "90210",
            "country": "United States",
        },
        "shipping_method": "express",
        "notes": "Testing stock boundary rejection",
    }
    res_overstock = client.post(
        "/api/v1/orders/checkout",
        headers=customer_headers,
        json=insufficient_stock_payload,
    )
    assert res_overstock.status_code == 400, "Must reject checkout when requested qty exceeds available inventory"
    assert "exceeds available stock" in res_overstock.json()["detail"].lower()
    print("[OK] Insufficient stock boundary correctly rejected with HTTP 400.")

    # Successful checkout
    valid_checkout_payload = {
        "items": [{"product_id": new_pid, "quantity": 2}],
        "shipping_address": {
            "full_name": "Dr. Sarah Connor",
            "phone": "+1-555-0199",
            "address_line1": "742 Evergreen Terrace",
            "city": "Cyber City",
            "state": "California",
            "postal_code": "90210",
            "country": "United States",
        },
        "shipping_method": "standard",
        "notes": "Simulated sandbox payment",
    }
    res_order = client.post(
        "/api/v1/orders/checkout",
        headers=customer_headers,
        json=valid_checkout_payload,
    )
    assert res_order.status_code == 201, f"Checkout failed: {res_order.text}"
    order_data = res_order.json()
    order_id = order_data["id"]
    assert order_data["status"] == "PENDING"
    assert order_data["payment_status"] == "PAID"
    assert order_data["total_amount"] > 0
    print(f"[OK] Order created successfully: ID={order_id}, Total=${order_data['total_amount']}")

    # Verify inventory was decremented from 15 to 13
    res_post_stock = client.get(f"/api/v1/products/{new_pid}")
    assert res_post_stock.json()["stock_quantity"] == 13
    print("[OK] Product inventory decremented accurately after checkout (15 -> 13).")

    # Customer order history
    res_history = client.get("/api/v1/orders", headers=customer_headers)
    assert res_history.status_code == 200
    assert any(o["id"] == order_id for o in res_history.json())
    print("[OK] Customer order history retrieved successfully.")

    # Order details by ID
    res_order_get = client.get(f"/api/v1/orders/{order_id}")
    assert res_order_get.status_code == 200
    assert res_order_get.json()["id"] == order_id
    print("[OK] Order details by ID verified.")

    # Seller updates status through order lifecycle: PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED
    for next_status in ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"]:
        res_update_status = client.patch(
            f"/api/v1/orders/{order_id}/status",
            headers=seller_headers,
            json={"status": next_status},
        )
        assert res_update_status.status_code == 200
        assert res_update_status.json()["status"] == next_status
    print("[OK] Seller order lifecycle progression (CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED) verified.")

    # Cancellation with stock restoration
    # Create another order to test cancellation
    res_cancel_order = client.post(
        "/api/v1/orders/checkout",
        headers=customer_headers,
        json={
            "items": [{"product_id": new_pid, "quantity": 3}],
            "shipping_address": valid_checkout_payload["shipping_address"],
            "shipping_method": "standard",
        },
    )
    assert res_cancel_order.status_code == 201
    cancel_order_id = res_cancel_order.json()["id"]
    # Stock went from 13 down to 10
    assert client.get(f"/api/v1/products/{new_pid}").json()["stock_quantity"] == 10

    # Cancel order
    res_cancelled = client.patch(
        f"/api/v1/orders/{cancel_order_id}/status",
        headers=seller_headers,
        json={"status": "CANCELLED"},
    )
    assert res_cancelled.status_code == 200
    assert res_cancelled.json()["status"] == "CANCELLED"
    # Stock should be restored from 10 back to 13
    assert client.get(f"/api/v1/products/{new_pid}").json()["stock_quantity"] == 13
    print("[OK] Order cancellation and automatic inventory restoration verified (10 restored to 13).")

    # -----------------------------------------------------------------
    # 5. AI / ML INTELLIGENCE
    # -----------------------------------------------------------------
    print("\n--- [5/6] Testing AI/ML Engine, Marketing Insights & Demand Prediction ---")

    # Personalized Recommendations (Content-based TF-IDF + user history)
    res_recs = client.get(f"/api/v1/recommendations/personalized?user_id=usr-test-cust-1&limit=4")
    assert res_recs.status_code == 200
    recs_data = res_recs.json()
    assert "items" in recs_data
    assert len(recs_data["items"]) > 0
    first_rec = recs_data["items"][0]
    assert "product" in first_rec
    assert "score" in first_rec
    assert "reason" in first_rec
    print(f"[OK] AI Personalized Recommendation served: '{first_rec['product']['title']}' (Score: {first_rec['score']}, Reason: '{first_rec['reason']}')")

    # Customer Segmentation (KMeans)
    res_seg = client.get("/api/v1/segmentation/customers")
    assert res_seg.status_code == 200
    seg_data = res_seg.json()
    assert "segments" in seg_data
    assert len(seg_data["segments"]) > 0
    print(f"[OK] AI Customer Segmentation verified: {len(seg_data['segments'])} segment categories identified.")

    # Seller Marketing Insights (Metric -> Finding -> Suggested Action)
    res_mkt = client.get("/api/v1/seller/marketing-insights", headers=seller_headers)
    assert res_mkt.status_code == 200
    mkt_data = res_mkt.json()
    assert "insights" in mkt_data
    assert "product_metrics" in mkt_data
    for ins in mkt_data["insights"]:
        assert "metric" in ins
        assert "finding" in ins
        assert "suggested_action" in ins
    print(f"[OK] Seller Marketing Insights verified: {len(mkt_data['insights'])} insights generated.")

    # Demand Prediction (Zero-fabrication check)
    has_insufficient_flag = False
    for pm in mkt_data["product_metrics"]:
        fc = pm.get("demand_forecast", {})
        if not fc.get("has_sufficient_data"):
            assert "Insufficient historical data for reliable prediction" in fc.get("message", "")
            has_insufficient_flag = True
    assert has_insufficient_flag, "Should have verified zero-fabrication message on products with sparse data"
    print("[OK] Demand prediction zero-fabrication fallback verified on sparse catalog data.")

    # Personalized In-App Offers
    res_offers = client.get("/api/v1/offers/personalized?user_id=usr-test-cust-1")
    assert res_offers.status_code == 200
    offers_data = res_offers.json()
    assert len(offers_data["offers"]) > 0
    for off in offers_data["offers"]:
        assert off.get("is_ai_generated") is True
        assert "promo_code" in off
        assert "reason" in off
    print(f"[OK] In-app personalized marketing offers verified ({len(offers_data['offers'])} active offers).")

    # -----------------------------------------------------------------
    # 6. EDGE CASES & ERROR RESILIENCE
    # -----------------------------------------------------------------
    print("\n--- [6/6] Testing Edge Cases, Negative Boundaries & Error Handling ---")

    # Non-existent product 404
    res_bad_prod = client.get("/api/v1/products/p-non-existent-999999")
    assert res_bad_prod.status_code == 404, "Must return 404 for non-existent product"
    print("[OK] Non-existent product correctly returns 404.")

    # Non-existent order 404
    res_bad_order = client.get("/api/v1/orders/ord-non-existent-999999")
    assert res_bad_order.status_code == 404, "Must return 404 for non-existent order"
    print("[OK] Non-existent order correctly returns 404.")

    # Invalid input: Negative price in product creation
    bad_price_payload = {
        "title": "Faulty Product",
        "description": "Invalid negative price test",
        "category_id": "c-audio-sound",
        "price": -50.00,
        "stock_quantity": 5,
        "sku": "BAD-PRICE-1",
        "images": ["https://example.com/bad.jpg"],
    }
    res_bad_price = client.post("/api/v1/seller/products", headers=seller_headers, json=bad_price_payload)
    assert res_bad_price.status_code == 422, "Pydantic must reject negative price with 422 Unprocessable Entity"
    print("[OK] Invalid input (negative price) rejected with 422.")

    # Cold start user recommendations (Brand new user with zero interactions)
    brand_new_user_id = f"usr-new-{uuid.uuid4().hex[:8]}"
    res_cold_rec = client.get(f"/api/v1/recommendations/personalized?user_id={brand_new_user_id}")
    assert res_cold_rec.status_code == 200
    cold_data = res_cold_rec.json()
    assert cold_data["is_fallback"] is True, "Brand new user should receive trending fallback recommendations"
    assert len(cold_data["items"]) > 0
    print("[OK] Cold start / brand-new user recommendations fallback gracefully without errors.")

    # Search with no matching items (empty database query)
    res_empty_search = client.get("/api/v1/products?search=xyz_unmatchable_gibberish_9999")
    assert res_empty_search.status_code == 200
    empty_res_data = res_empty_search.json()
    assert empty_res_data["total"] == 0
    assert len(empty_res_data["items"]) == 0
    print("[OK] Empty search query handled gracefully (returns total: 0, items: []).")

    # Clean up: Delete created product
    res_del = client.delete(f"/api/v1/seller/products/{new_pid}", headers=seller_headers)
    assert res_del.status_code == 200
    assert res_del.json()["status"] == "success"
    # Verify it is gone
    res_verify_del = client.get(f"/api/v1/products/{new_pid}")
    assert res_verify_del.status_code == 404
    print(f"[OK] Product '{new_pid}' deleted and verified 404.")

    print("\n=======================================================")
    print("COMPLETE TESTING PASS SUCCEEDED 100%! ALL TESTS PASSED.")
    print("=======================================================\n")

if __name__ == "__main__":
    test_complete_platform_pass()
