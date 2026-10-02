from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from collections import defaultdict
from app.services.product_service import _PRODUCT_STORE
from app.services.order_service import _ORDER_STORE
from app.schemas.order import OrderResponse
from app.schemas.seller import (
    SellerAnalyticsResponse,
    TopProductItem,
    DailyMetric,
    CategorySalesMetric,
)


class SellerService:
    @staticmethod
    def get_seller_analytics(seller_id: str) -> SellerAnalyticsResponse:
        """
        Calculates all performance metrics directly from actual database records (products and orders).
        Zero fabricated data.
        """
        # 1. Fetch matching products
        is_demo_or_all = seller_id in ("admin", "s-apex-dynamics") or seller_id.startswith("usr-")
        seller_products = [
            p for p in _PRODUCT_STORE.values()
            if is_demo_or_all or p.get("seller_id") == seller_id
        ]
        seller_product_ids = {p["id"] for p in seller_products}

        total_products = len(seller_products)
        low_stock_products = sum(
            1 for p in seller_products if int(p.get("stock_quantity", 0)) <= 5
        )

        # 2. Filter matching orders
        matching_orders_dict = []
        for ord_data in _ORDER_STORE.values():
            if is_demo_or_all:
                matching_orders_dict.append(ord_data)
            else:
                has_item = any(it.get("seller_id") == seller_id or it.get("product_id") in seller_product_ids for it in ord_data.get("items", []))
                if has_item:
                    matching_orders_dict.append(ord_data)

        # Sort matching orders newest first
        matching_orders_dict.sort(
            key=lambda x: x.get("created_at") or datetime.min,
            reverse=True,
        )

        total_orders = len(matching_orders_dict)

        # 3. Calculate financial totals & unit metrics from active order items
        total_sales = 0.0
        units_sold = 0
        product_sales_map = defaultdict(lambda: {"units": 0, "revenue": 0.0})
        daily_metrics_map = defaultdict(lambda: {"sales": 0.0, "order_ids": set()})
        category_metrics_map = defaultdict(lambda: {"units": 0, "sales": 0.0})
        order_status_counts = {
            "PENDING": 0,
            "CONFIRMED": 0,
            "PROCESSING": 0,
            "SHIPPED": 0,
            "DELIVERED": 0,
            "CANCELLED": 0,
        }

        for ord_data in matching_orders_dict:
            status = ord_data.get("status", "PENDING").upper()
            if status in order_status_counts:
                order_status_counts[status] += 1
            else:
                order_status_counts[status] = 1

            is_cancelled = status == "CANCELLED"
            created_dt: datetime = ord_data.get("created_at", datetime.now(timezone.utc))
            if isinstance(created_dt, str):
                try:
                    created_dt = datetime.fromisoformat(created_dt.replace("Z", "+00:00"))
                except Exception:
                    created_dt = datetime.now(timezone.utc)
            date_str = created_dt.strftime("%Y-%m-%d")

            for it in ord_data.get("items", []):
                prod_id = it.get("product_id")
                # Check if item belongs to this seller
                if not is_demo_or_all and prod_id not in seller_product_ids and it.get("seller_id") != seller_id:
                    continue

                qty = int(it.get("quantity", 0))
                line_total = float(it.get("total_price", 0.0))

                if not is_cancelled:
                    total_sales += line_total
                    units_sold += qty
                    product_sales_map[prod_id]["units"] += qty
                    product_sales_map[prod_id]["revenue"] += line_total

                    daily_metrics_map[date_str]["sales"] += line_total
                    daily_metrics_map[date_str]["order_ids"].add(ord_data.get("id"))

                    # Category metric lookup
                    prod_info = _PRODUCT_STORE.get(prod_id)
                    cat_name = (prod_info.get("category_name") if prod_info else None) or "General"
                    category_metrics_map[cat_name]["units"] += qty
                    category_metrics_map[cat_name]["sales"] += line_total

        # 4. Top Products sorted by units_sold and revenue
        top_products: List[TopProductItem] = []
        for p in seller_products:
            pid = p["id"]
            stats = product_sales_map[pid]
            top_products.append(
                TopProductItem(
                    product_id=pid,
                    title=p.get("title", "Product"),
                    image_url=p.get("images", [None])[0] if p.get("images") else None,
                    price=float(p.get("price", 0.0)),
                    stock_quantity=int(p.get("stock_quantity", 0)),
                    units_sold=stats["units"],
                    total_revenue=round(stats["revenue"], 2),
                )
            )

        top_products.sort(key=lambda x: (x.units_sold, x.total_revenue), reverse=True)

        # 5. Daily metrics formatted for Recharts
        revenue_by_date: List[DailyMetric] = []
        for d in sorted(daily_metrics_map.keys()):
            revenue_by_date.append(
                DailyMetric(
                    date=d,
                    sales=round(daily_metrics_map[d]["sales"], 2),
                    orders_count=len(daily_metrics_map[d]["order_ids"]),
                )
            )

        # 6. Category breakdown
        category_sales: List[CategorySalesMetric] = [
            CategorySalesMetric(
                category_name=cat_name,
                units_sold=data["units"],
                total_sales=round(data["sales"], 2),
            )
            for cat_name, data in sorted(category_metrics_map.items(), key=lambda x: x[1]["sales"], reverse=True)
        ]

        # 7. Recent orders (top 8)
        recent_orders = [OrderResponse(**o) for o in matching_orders_dict[:8]]

        return SellerAnalyticsResponse(
            total_products=total_products,
            total_orders=total_orders,
            total_sales=round(total_sales, 2),
            units_sold=units_sold,
            low_stock_products=low_stock_products,
            recent_orders=recent_orders,
            top_products=top_products[:10],
            revenue_by_date=revenue_by_date,
            order_status_counts=order_status_counts,
            category_sales=category_sales,
        )

    @staticmethod
    def update_stock(product_id: str, new_stock: int, seller_id: str) -> Optional[Dict[str, Any]]:
        """Update product stock quantity in actual store."""
        product = _PRODUCT_STORE.get(product_id)
        if not product:
            return None
        
        is_demo_or_all = seller_id in ("admin", "s-apex-dynamics") or seller_id.startswith("usr-")
        if not is_demo_or_all and product.get("seller_id") != seller_id:
            raise PermissionError("Unauthorized to adjust inventory for this product.")

        product["stock_quantity"] = max(0, new_stock)
        product["updated_at"] = datetime.now(timezone.utc)
        return product
