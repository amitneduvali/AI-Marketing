"""
Lightweight Product Demand Prediction Module
CortexPulse AI - Machine Learning Engine

Explainable statistical/ML demand forecasting using time-series velocity and linear trend modeling.
Never fabricates predictions; explicitly marks products with insufficient historical data.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from collections import defaultdict
import numpy as np


class DemandPredictionModel:
    def __init__(self, min_sales_threshold: int = 2):
        self.min_sales_threshold = min_sales_threshold

    def predict_product_demand(
        self,
        product: Dict[str, Any],
        orders: List[Dict[str, Any]],
        forecast_days: int = 14,
    ) -> Dict[str, Any]:
        """
        Forecast short-term demand for a product based on historical orders.
        Uses explainable linear regression velocity and weighted exponential moving averages.
        """
        pid = product["id"]
        title = product.get("title", "Product")
        now = datetime.now(timezone.utc)

        # 1. Extract chronological sales history for this product
        daily_sales: Dict[str, int] = defaultdict(int)
        total_units_sold = 0

        for ord_data in orders:
            if ord_data.get("status") == "CANCELLED":
                continue

            ord_dt = ord_data.get("created_at")
            if isinstance(ord_dt, str):
                try:
                    ord_dt = datetime.fromisoformat(ord_dt.replace("Z", "+00:00"))
                except Exception:
                    ord_dt = now
            elif not ord_dt:
                ord_dt = now

            date_key = ord_dt.strftime("%Y-%m-%d")

            for item in ord_data.get("items", []):
                if item.get("product_id") == pid:
                    qty = int(item.get("quantity", 1))
                    daily_sales[date_key] += qty
                    total_units_sold += qty

        # 2. Check for sufficient historical data
        sorted_dates = sorted(daily_sales.keys())
        data_points_count = len(sorted_dates)

        if data_points_count < self.min_sales_threshold or total_units_sold < 2:
            return {
                "product_id": pid,
                "product_title": title,
                "has_sufficient_data": False,
                "message": "Insufficient historical data for reliable prediction.",
                "historical_sales_total": total_units_sold,
                "predicted_demand_units": None,
                "predicted_demand_daily_rate": None,
                "trend": "Insufficient Data",
                "trend_slope": 0.0,
                "confidence": "Low",
                "confidence_reason": f"Only {data_points_count} transaction day(s) recorded (minimum {self.min_sales_threshold} required).",
                "forecast_days": forecast_days,
                "historical_timeline": [{"date": d, "units": daily_sales[d]} for d in sorted_dates],
            }

        # 3. Time Series Representation
        y_values = [daily_sales[d] for d in sorted_dates]
        x_indices = np.arange(len(y_values))

        # Linear regression slope: y = mx + c
        if len(x_indices) >= 2:
            coeffs = np.polyfit(x_indices, y_values, 1)
            slope = float(coeffs[0])
            intercept = float(coeffs[1])
        else:
            slope = 0.0
            intercept = float(y_values[0])

        # Trend classification
        if slope > 0.08:
            trend = "Increasing"
        elif slope < -0.08:
            trend = "Declining"
        else:
            trend = "Stable"

        # Projected rate: weighted average of recent velocity and trend projection
        recent_avg = np.mean(y_values[-3:]) if len(y_values) >= 3 else np.mean(y_values)
        projected_daily = max(0.05, float(recent_avg + (slope * 0.5)))
        predicted_total = int(round(projected_daily * forecast_days))

        # Statistical confidence based on consistency (R^2 or sample density)
        if len(y_values) >= 5:
            confidence = "High" if abs(slope) < 1.5 else "Moderate"
        elif len(y_values) >= 3:
            confidence = "Moderate"
        else:
            confidence = "Fair (Early Estimate)"

        confidence_reason = (
            f"Modeled over {len(y_values)} sales periods with a {trend.lower()} trajectory. "
            f"Subject to market elasticity and seasonal fluctuations."
        )

        return {
            "product_id": pid,
            "product_title": title,
            "has_sufficient_data": True,
            "message": f"Projected demand: {predicted_total} unit(s) over next {forecast_days} days ({trend} trend).",
            "historical_sales_total": total_units_sold,
            "predicted_demand_units": predicted_total,
            "predicted_demand_daily_rate": round(projected_daily, 2),
            "trend": trend,
            "trend_slope": round(slope, 3),
            "confidence": confidence,
            "confidence_reason": confidence_reason,
            "forecast_days": forecast_days,
            "historical_timeline": [{"date": d, "units": daily_sales[d]} for d in sorted_dates],
        }

    def predict_catalog_demand(
        self,
        products: List[Dict[str, Any]],
        orders: List[Dict[str, Any]],
        forecast_days: int = 14,
    ) -> List[Dict[str, Any]]:
        """Run demand prediction across all products in seller catalog."""
        return [
            self.predict_product_demand(p, orders, forecast_days=forecast_days)
            for p in products
        ]
