from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_interactions_recommendations_segmentation():
    print("=== 1. Testing Customer Interaction Tracking API ===")
    test_session = "sess-test-auto-999"
    test_user = "usr-test-shopper-1"

    # Track all 8 interaction types
    events = [
        {"interaction_type": "product_view", "product_id": "p1010101-0001-0000-0000-000000000001", "duration_seconds": 30},
        {"interaction_type": "product_click", "product_id": "p1010101-0001-0000-0000-000000000001"},
        {"interaction_type": "search", "search_query": "noise canceling headphones"},
        {"interaction_type": "category_view", "category_id": "c1111111-1111-1111-1111-111111111111"},
        {"interaction_type": "add_to_cart", "product_id": "p1010101-0001-0000-0000-000000000001", "metadata": {"quantity": 1}},
        {"interaction_type": "wishlist", "product_id": "p1010101-0002-0000-0000-000000000002"},
        {"interaction_type": "purchase", "product_id": "p1010101-0001-0000-0000-000000000001", "metadata": {"order_number": "CP-TEST-1"}},
        {"interaction_type": "review", "product_id": "p1010101-0001-0000-0000-000000000001", "metadata": {"rating": 5}},
    ]

    for ev in events:
        payload = {
            "user_id": test_user,
            "session_id": test_session,
            **ev,
        }
        res = client.post("/api/v1/interactions/track", json=payload)
        assert res.status_code == 201, f"Failed on {ev['interaction_type']}: {res.text}"
        data = res.json()
        assert data["interaction_type"] == ev["interaction_type"]
        print(f" Tracked event: {data['interaction_type']} (ID: {data['id']})")

    print("\n=== 2. Testing Interaction Analytics Functions ===")
    analytics_res = client.get("/api/v1/interactions/analytics")
    assert analytics_res.status_code == 200
    analytics = analytics_res.json()
    print(f"- Total Interactions: {analytics['total_interactions']}")
    print(f"- Most Viewed Categories: {[c['category_name'] for c in analytics['most_viewed_categories']]}")
    print(f"- Most Viewed Products: {[p['title'] for p in analytics['most_viewed_products']]}")
    print(f"- Frequently Purchased Categories: {analytics['frequently_purchased_categories']}")
    print(f"- Average Order Value: ${analytics['average_order_value']}")
    print(f"- Purchase Frequency: {analytics['purchase_frequency']}")
    assert len(analytics["most_viewed_categories"]) > 0
    assert len(analytics["most_viewed_products"]) > 0

    print("\n=== 3. Testing Personalized Product Recommendations (scikit-learn Content-Based) ===")
    # 3a. User with interaction history (audiophile user)
    rec_res = client.get(f"/api/v1/recommendations/personalized?user_id={test_user}&session_id={test_session}&limit=4")
    assert rec_res.status_code == 200
    recs = rec_res.json()
    print(f"Model used: {recs['model_name']}")
    print(f"Recommended product IDs: {recs['recommended_product_ids']}")
    assert len(recs["recommended_product_ids"]) > 0
    for item in recs["items"]:
        print(f"  * [{item['match_type']}] {item['product']['title']} (Score: {item['score']}) - Reason: {item['reason']}")

    # 3b. Cold Start User (No previous history) -> triggers trending fallback
    cold_res = client.get("/api/v1/recommendations/personalized?user_id=brand-new-visitor-without-history&session_id=sess-cold-1&limit=4")
    assert cold_res.status_code == 200
    cold_recs = cold_res.json()
    assert cold_recs["is_fallback"] is True
    print(f"Cold-start fallback returned {len(cold_recs['items'])} trending products:")
    for item in cold_recs["items"]:
        print(f"  * [Fallback] {item['product']['title']} - Reason: {item['reason']}")

    print("\n=== 4. Testing AI Customer Segmentation (scikit-learn KMeans Clustering) ===")
    seg_res = client.get("/api/v1/seller/analytics/customer-segments")
    assert seg_res.status_code == 200
    segmentation = seg_res.json()
    print("Model Metadata:")
    print(f"- Algorithm: {segmentation['model_metadata']['algorithm']}")
    print(f"- Features Used: {segmentation['model_metadata']['features_used']}")
    print(f"- Clusters Trained: {segmentation['model_metadata']['clusters_trained']}")
    print("\nLearned Customer Segments:")
    for seg in segmentation["segments"]:
        print(f"  * {seg['segment']}: {seg['count']} customers ({seg['percentage']}%) - Avg Spend: ${seg['avg_spending']}")

    print(f"\nTotal Analyzed Customers: {segmentation['total_customers_analyzed']}")
    assert segmentation["total_customers_analyzed"] > 0
    assert len(segmentation["segments"]) > 0

    print("\n ALL INTERACTIONS, ML RECOMMENDATIONS, AND CUSTOMER SEGMENTATION TESTS PASSED!")

if __name__ == "__main__":
    test_interactions_recommendations_segmentation()
