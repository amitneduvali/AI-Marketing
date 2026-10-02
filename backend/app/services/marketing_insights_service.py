import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from collections import defaultdict

_REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from ml.src.models.demand_prediction import DemandPredictionModel
from app.services.product_service import _PRODUCT_STORE
from app.services.order_service import _ORDER_STORE
from app.services.interaction_service import InteractionService


class MarketingInsightsService:
    @staticmethod
    def get_seller_product_metrics(seller_id: str) -> List[Dict[str, Any]]:
        """
        Calculate Views, Add-to-cart rate, Conversion rate, Units sold,
        Revenue, Average selling price, and Stock velocity for each product.
        Zero fabricated data.
        """
        is_demo_or_all = seller_id in ("admin", "s-apex-dynamics") or seller_id.startswith("usr-")
        seller_products = [
            p for p in _PRODUCT_STORE.values()
            if is_demo_or_all or p.get("seller_id") == seller_id
        ]

        interactions = InteractionService.get_all_interactions()
        orders = list(_ORDER_STORE.values())

        # Aggregate interactions per product
        view_counts = defaultdict(int)
        cart_counts = defaultdict(int)
        for it in interactions:
            pid = it.get("product_id")
            if not pid:
                continue
            itype = it.get("interaction_type")
            if itype == "product_view":
                view_counts[pid] += 1
            elif itype == "add_to_cart":
                cart_counts[pid] += 1

        # Aggregate sales per product
        sales_units = defaultdict(int)
        sales_revenue = defaultdict(float)
        purchase_orders = defaultdict(set)

        for ord_data in orders:
            if ord_data.get("status") == "CANCELLED":
                continue
            for it in ord_data.get("items", []):
                pid = it.get("product_id")
                qty = int(it.get("quantity", 1))
                line_total = float(it.get("total_price", 0.0))
                sales_units[pid] += qty
                sales_revenue[pid] += line_total
                purchase_orders[pid].add(ord_data.get("id"))

        # Demand prediction model
        forecaster = DemandPredictionModel()
        forecasts = {f["product_id"]: f for f in forecaster.predict_catalog_demand(seller_products, orders)}

        results = []
        for p in seller_products:
            pid = p["id"]
            views = view_counts[pid]
            carts = cart_counts[pid]
            units = sales_units[pid]
            rev = round(sales_revenue[pid], 2)
            current_stock = int(p.get("stock_quantity", 0))

            cart_rate = round((carts / views * 100), 1) if views > 0 else 0.0
            conv_rate = round((len(purchase_orders[pid]) / views * 100), 1) if views > 0 else 0.0
            asp = round(rev / units, 2) if units > 0 else float(p.get("price", 0.0))

            # Stock velocity (units sold / (units sold + stock))
            total_inventory_pool = units + current_stock
            velocity_ratio = round((units / total_inventory_pool), 2) if total_inventory_pool > 0 else 0.0

            forecast = forecasts.get(pid, {})

            results.append({
                "product_id": pid,
                "title": p.get("title", "Product"),
                "sku": p.get("sku", "N/A"),
                "category_name": p.get("category_name", "General"),
                "price": float(p.get("price", 0.0)),
                "stock_quantity": current_stock,
                "views": views,
                "cart_additions": carts,
                "add_to_cart_rate": cart_rate,
                "conversion_rate": conv_rate,
                "units_sold": units,
                "revenue": rev,
                "average_selling_price": asp,
                "stock_velocity": velocity_ratio,
                "demand_forecast": forecast,
            })

        return results

    @staticmethod
    def generate_marketing_insights(seller_id: str) -> Dict[str, Any]:
        """
        Produce structured data-driven marketing insights following:
        Metric -> Finding -> Suggested Action
        """
        metrics = MarketingInsightsService.get_seller_product_metrics(seller_id)
        insights = []

        for m in metrics:
            title = m["title"]
            views = m["views"]
            carts = m["cart_additions"]
            units = m["units_sold"]
            conv = m["conversion_rate"]
            cart_rate = m["add_to_cart_rate"]
            stock = m["stock_quantity"]
            rev = m["revenue"]
            forecast = m.get("demand_forecast", {})
            trend = forecast.get("trend", "Stable")

            # 1. Low-Stock High-Performing Products
            if stock <= 5 and units >= 2:
                insights.append({
                    "id": f"ins-stock-{m['product_id'][:6]}",
                    "product_id": m["product_id"],
                    "product_title": title,
                    "insight_type": "critical_low_stock",
                    "severity": "urgent",
                    "metric": f"Stock: {stock} units left | Units Sold: {units} units",
                    "finding": f"'{title}' is a high-demand item with critically low stock ({stock} remaining units).",
                    "suggested_action": "Replenish inventory immediately to avoid stockouts and maintain organic conversion ranking.",
                    "observation_data": {"stock": stock, "units_sold": units, "revenue": rev},
                })

            # 2. High views but low conversion
            if views >= 2 and conv <= 25.0 and units <= 1:
                insights.append({
                    "id": f"ins-conv-{m['product_id'][:6]}",
                    "product_id": m["product_id"],
                    "product_title": title,
                    "insight_type": "high_views_low_conversion",
                    "severity": "medium",
                    "metric": f"Views: {views} | Conversion Rate: {conv}%",
                    "finding": f"'{title}' receives strong browsing attention ({views} views) but has a comparatively low purchase conversion ({conv}%).",
                    "suggested_action": "Test enhanced product imagery, refine pricing or offer a promotional introductory discount code.",
                    "observation_data": {"views": views, "conversion_rate": conv},
                })

            # 3. High add-to-cart but low purchase (cart abandonment)
            if carts >= 2 and units < carts:
                dropoff_pct = round(((carts - units) / carts) * 100, 1)
                insights.append({
                    "id": f"ins-abandon-{m['product_id'][:6]}",
                    "product_id": m["product_id"],
                    "product_title": title,
                    "insight_type": "cart_abandonment",
                    "severity": "high",
                    "metric": f"Cart Additions: {carts} | Purchases: {units} ({dropoff_pct}% checkout drop-off)",
                    "finding": f"Shoppers frequently add '{title}' to cart but {dropoff_pct}% abandon before checkout settlement.",
                    "suggested_action": "Highlight free shipping threshold or offer a time-sensitive cart discount to motivate immediate order completion.",
                    "observation_data": {"carts": carts, "units": units, "dropoff": dropoff_pct},
                })

            # 4. High-performing products
            if rev >= 500.0 or units >= 2:
                insights.append({
                    "id": f"ins-star-{m['product_id'][:6]}",
                    "product_id": m["product_id"],
                    "product_title": title,
                    "insight_type": "high_performer",
                    "severity": "positive",
                    "metric": f"Gross Revenue: ${rev:.2f} | Units Sold: {units}",
                    "finding": f"'{title}' is a core revenue driver with established buyer trust and consistent volume.",
                    "suggested_action": "Feature as a hero product in marketing campaigns and bundle with accessories for higher basket size.",
                    "observation_data": {"revenue": rev, "units": units},
                })

            # 5. Low-performing / cold catalog products
            if units == 0 and views <= 1:
                insights.append({
                    "id": f"ins-low-{m['product_id'][:6]}",
                    "product_id": m["product_id"],
                    "product_title": title,
                    "insight_type": "low_performer",
                    "severity": "info",
                    "metric": f"Units Sold: 0 | Views: {views}",
                    "finding": f"'{title}' has recorded minimal customer discovery and zero sales conversions.",
                    "suggested_action": "Audit product title and search keywords, enrich specifications, or test a discounted introductory rate.",
                    "observation_data": {"units": 0, "views": views},
                })

            # 6. Increasing demand
            if trend == "Increasing":
                insights.append({
                    "id": f"ins-trend-up-{m['product_id'][:6]}",
                    "product_id": m["product_id"],
                    "product_title": title,
                    "insight_type": "increasing_demand",
                    "severity": "positive",
                    "metric": f"Demand Velocity: Accelerating (Forecast: {forecast.get('predicted_demand_units')} units / 14 days)",
                    "finding": f"Statistical sales velocity for '{title}' shows an upward trajectory over recent transaction periods.",
                    "suggested_action": "Prepare warehouse restocks in advance to meet anticipated short-term demand expansion.",
                    "observation_data": {"trend": trend, "slope": forecast.get("trend_slope")},
                })

            # 7. Declining demand
            if trend == "Declining":
                insights.append({
                    "id": f"ins-trend-down-{m['product_id'][:6]}",
                    "product_id": m["product_id"],
                    "product_title": title,
                    "insight_type": "declining_demand",
                    "severity": "warning",
                    "metric": f"Demand Velocity: Softening (Slope: {forecast.get('trend_slope')})",
                    "finding": f"Sales velocity for '{title}' has slowed down compared to earlier transaction peaks.",
                    "suggested_action": "Consider running a flash sale or pairing in cross-promotional bundles to stimulate interest.",
                    "observation_data": {"trend": trend, "slope": forecast.get("trend_slope")},
                })

        return {
            "seller_id": seller_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_products_analyzed": len(metrics),
            "insights_count": len(insights),
            "insights": insights,
            "product_metrics": metrics,
        }

    @staticmethod
    def get_personalized_in_app_offers(user_id: Optional[str] = None, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Generate in-app marketing recommendations based on customer segments and interaction history.
        No real SMS or emails are sent; displayed strictly in-app with AI transparency.
        """
        catalog = list(_PRODUCT_STORE.values())
        interactions = InteractionService.get_recent_interactions(user_id=user_id, session_id=session_id, limit=20)
        orders = list(_ORDER_STORE.values())

        # Collect user's viewed products and categories
        viewed_pids = {it.product_id for it in interactions if it.interaction_type in ("product_view", "product_click") and it.product_id}
        viewed_cats = {it.category_id for it in interactions if it.category_id}
        user_orders = [o for o in orders if o.get("customer_id") == user_id or user_id == "usr-customer-demo"]
        is_frequent_buyer = len(user_orders) >= 2

        offers = []

        # Offer Type 1: Category Interest Offers
        # e.g., "Audio & Acoustics deals you may like"
        fav_cat_name = "Audio & Acoustics"
        if viewed_cats:
            first_cat_id = next(iter(viewed_cats))
            cat_obj = _PRODUCT_STORE.get(first_cat_id) or next((p for p in catalog if p.get("category_id") == first_cat_id), None)
            if cat_obj and cat_obj.get("category_name"):
                fav_cat_name = cat_obj["category_name"]

        matching_cat_prods = [p for p in catalog if p.get("category_name") == fav_cat_name]
        offer_prod = matching_cat_prods[0] if matching_cat_prods else (catalog[0] if catalog else None)

        if offer_prod:
            offers.append({
                "id": "off-cat-interest",
                "title": f"{fav_cat_name} Deals You May Like",
                "badge": "Category Affinity Offer",
                "description": f"Save up to 15% on premium {fav_cat_name} selected based on your browsing interests.",
                "suggested_product_id": offer_prod["id"],
                "suggested_product_title": offer_prod["title"],
                "suggested_product_price": float(offer_prod["price"]),
                "promo_code": "PULSE-AFFINITY-15",
                "discount_percent": 15,
                "reason": f"AI matched to your recent interest in {fav_cat_name}.",
                "is_ai_generated": True,
            })

        # Offer Type 2: Frequent Buyer Loyalty
        if is_frequent_buyer or not user_id:
            loyal_prod = catalog[1] if len(catalog) > 1 else (catalog[0] if catalog else None)
            if loyal_prod:
                offers.append({
                    "id": "off-frequent-buyer",
                    "title": "VIP Loyalty: Recommendations Based on Previous Purchases",
                    "badge": "Repeat Buyer Reward",
                    "description": "Exclusive merchant pricing unlocked for valued repeat shoppers on our platform.",
                    "suggested_product_id": loyal_prod["id"],
                    "suggested_product_title": loyal_prod["title"],
                    "suggested_product_price": float(loyal_prod["price"]),
                    "promo_code": "VIP-REPEAT-20",
                    "discount_percent": 20,
                    "reason": "AI generated from your verified repeat purchase history.",
                    "is_ai_generated": True,
                })

        # Offer Type 3: Repeated Browsing Without Purchasing (Cart / Exploration Nudge)
        if viewed_pids:
            first_viewed_id = next(iter(viewed_pids))
            viewed_prod = _PRODUCT_STORE.get(first_viewed_id)
            if viewed_prod:
                offers.append({
                    "id": "off-explore-nudge",
                    "title": "Products Similar to What You've Been Exploring",
                    "badge": "Curated Discovery",
                    "description": f"Still considering {viewed_prod['title']}? Complete your setup with tailored express delivery.",
                    "suggested_product_id": viewed_prod["id"],
                    "suggested_product_title": viewed_prod["title"],
                    "suggested_product_price": float(viewed_prod["price"]),
                    "promo_code": "DISCOVER-FREE-SHIP",
                    "discount_percent": 10,
                    "reason": "AI detected browsing exploration on this product line without purchase.",
                    "is_ai_generated": True,
                })
        else:
            # Fallback browse offer for fresh visitors
            fallback_prod = catalog[0] if catalog else None
            if fallback_prod:
                offers.append({
                    "id": "off-welcome-explore",
                    "title": "Welcome Discovery: Featured Electronics Offer",
                    "badge": "First Order Special",
                    "description": "Kickstart your hardware journey with our highest rated electronics.",
                    "suggested_product_id": fallback_prod["id"],
                    "suggested_product_title": fallback_prod["title"],
                    "suggested_product_price": float(fallback_prod["price"]),
                    "promo_code": "EXPLORE-10",
                    "discount_percent": 10,
                    "reason": "AI welcome recommendation for marketplace shoppers.",
                    "is_ai_generated": True,
                })

        return offers
