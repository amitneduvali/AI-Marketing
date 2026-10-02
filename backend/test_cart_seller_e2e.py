import sys
from fastapi.testclient import TestClient
from app.main import app
from app.services.product_service import _PRODUCT_STORE
from app.services.order_service import _ORDER_STORE

client = TestClient(app)

def test_full_cart_checkout_seller_flow():
    print("=== 1. Checking Product Catalog & Stock ===")
    res = client.get("/api/v1/products")
    assert res.status_code == 200, res.text
    catalog = res.json()["items"]
    assert len(catalog) > 0, "No products in catalog"
    target_product = catalog[0]
    target_id = target_product["id"]
    initial_stock = target_product["stock_quantity"]
    print(f"Target product: {target_product['title']} (ID: {target_id}), Initial Stock: {initial_stock}")

    print("\n=== 2. Testing Stock Validation Failure (Attempting to buy > stock) ===")
    excess_checkout = {
        "items": [{"product_id": target_id, "quantity": initial_stock + 999}],
        "shipping_address": {
            "full_name": "Test Customer",
            "phone": "+1 555-123-4567",
            "address_line": "123 Test Street",
            "city": "Metropolis",
            "state": "NY",
            "postal_code": "10001",
            "country": "US",
        },
        "payment_method": "simulated_card"
    }
    fail_res = client.post("/api/v1/orders/checkout", json=excess_checkout)
    assert fail_res.status_code == 400, f"Expected 400 for excessive stock, got: {fail_res.status_code}"
    print(f"Correctly prevented excessive order: {fail_res.json()['detail']}")

    print("\n=== 3. Testing Valid Checkout Flow with Shipping Address & Simulated Payment ===")
    purchase_qty = 2
    valid_checkout = {
        "items": [{"product_id": target_id, "quantity": purchase_qty}],
        "shipping_address": {
            "full_name": "Alexander Hayes",
            "phone": "+1 (555) 019-2834",
            "address_line": "742 Innovation Way, Suite 400",
            "city": "San Francisco",
            "state": "CA",
            "postal_code": "94107",
            "country": "US",
        },
        "payment_method": "simulated_card",
        "notes": "Student project test transaction"
    }
    checkout_res = client.post("/api/v1/orders/checkout", json=valid_checkout)
    assert checkout_res.status_code == 201, checkout_res.text
    order = checkout_res.json()
    order_id = order["id"]
    order_number = order["order_number"]
    print(f"Order created: #{order_number} (ID: {order_id}), Total: ${order['total_amount']}")
    assert order["status"] == "CONFIRMED"
    assert order["payment_method"] == "simulated_card"
    assert order["payment_status"] == "completed"

    # Verify inventory was decremented in the database
    updated_prod = client.get(f"/api/v1/products/{target_id}").json()
    expected_stock = initial_stock - purchase_qty
    assert updated_prod["stock_quantity"] == expected_stock, f"Expected stock {expected_stock}, got {updated_prod['stock_quantity']}"
    print(f"Inventory successfully decremented in database: {initial_stock} -> {updated_prod['stock_quantity']}")

    print("\n=== 4. Testing Customer Order Management ===")
    orders_res = client.get("/api/v1/orders")
    assert orders_res.status_code == 200
    customer_orders = orders_res.json()
    assert any(o["id"] == order_id for o in customer_orders), "New order not in customer orders list"
    
    order_detail_res = client.get(f"/api/v1/orders/{order_id}")
    assert order_detail_res.status_code == 200
    detail = order_detail_res.json()
    assert detail["order_number"] == order_number
    assert len(detail["items"]) > 0
    print(f"Customer order retrieved successfully: #{detail['order_number']}, Status: {detail['status']}")

    print("\n=== 5. Testing Seller Order Management & Lifecycle Updates ===")
    seller_orders_res = client.get("/api/v1/seller/orders")
    assert seller_orders_res.status_code == 200
    seller_orders = seller_orders_res.json()
    assert any(o["id"] == order_id for o in seller_orders)

    # Progress through lifecycle: PROCESSING -> SHIPPED -> DELIVERED
    for new_status in ["PROCESSING", "SHIPPED", "DELIVERED"]:
        patch_res = client.patch(
            f"/api/v1/seller/orders/{order_id}/status",
            json={"status": new_status, "tracking_number": f"TRK-{order_number}-EXPRESS"}
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["status"] == new_status
        print(f"Progressed order #{order_number} to {new_status}")

    print("\n=== 6. Testing Seller Analytics (Real Database Records) ===")
    analytics_res = client.get("/api/v1/seller/analytics")
    assert analytics_res.status_code == 200
    analytics = analytics_res.json()
    print("Analytics Output:")
    print(f"- Total Products: {analytics['total_products']}")
    print(f"- Total Orders: {analytics['total_orders']}")
    print(f"- Total Sales: ${analytics['total_sales']}")
    print(f"- Units Sold: {analytics['units_sold']}")
    print(f"- Low-stock Products: {analytics['low_stock_products']}")
    print(f"- Recent Orders: {len(analytics['recent_orders'])}")
    print(f"- Top Products: {len(analytics['top_products'])}")
    print(f"- Status Counts: {analytics['order_status_counts']}")

    assert analytics["total_products"] > 0
    assert analytics["total_orders"] > 0
    assert analytics["total_sales"] > 0
    assert analytics["units_sold"] >= purchase_qty

    print("\n=== 7. Testing Seller Inventory Direct Adjustment ===")
    inv_res = client.get("/api/v1/seller/inventory")
    assert inv_res.status_code == 200
    inventory_items = inv_res.json()
    assert len(inventory_items) > 0

    adjust_res = client.patch(
        f"/api/v1/seller/inventory/{target_id}",
        json={"stock_quantity": 42}
    )
    assert adjust_res.status_code == 200
    assert adjust_res.json()["stock_quantity"] == 42
    print(f"Adjusted inventory for {target_id} to 42 units.")

    print("\n ALL BACKEND & DATABASE WORKFLOWS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_cart_checkout_seller_flow()
