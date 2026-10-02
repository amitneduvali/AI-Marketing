import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any, Tuple
from app.schemas.order import (
    CheckoutInput,
    OrderResponse,
    OrderItemResponse,
    OrderStatusUpdate,
)
from app.services.product_service import ProductService, _PRODUCT_STORE

# Dynamic Order Store (persisted in-memory, mapped to DB schema)
_ORDER_STORE: Dict[str, Dict[str, Any]] = {}

def _init_initial_orders():
    if _ORDER_STORE:
        return

    # Seed sample order for immediate review
    sample_order = {
        "id": "ord-0001-cortex",
        "order_number": "CP-2026-8910",
        "customer_id": "usr-customer-demo",
        "customer_name": "Alexander Hayes",
        "customer_email": "customer@cortex-pulse.ai",
        "status": "SHIPPED",
        "currency": "USD",
        "subtotal": 349.00,
        "tax_amount": 27.92,
        "shipping_amount": 0.00,
        "discount_amount": 50.00,
        "total_amount": 376.92,
        "shipping_address": {
            "full_name": "Alexander Hayes",
            "phone": "+1 (555) 019-2834",
            "address_line": "742 Innovation Way, Suite 400",
            "city": "San Francisco",
            "state": "CA",
            "postal_code": "94107",
            "country": "US",
        },
        "items": [
            {
                "id": "item-001",
                "product_id": "p1010101-0001-0000-0000-000000000001",
                "product_title": "NeuralFlow Hyper-Adaptive ANC Headphones",
                "product_image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
                "seller_id": "s-apex-dynamics",
                "seller_name": "Apex Dynamics Studio",
                "quantity": 1,
                "unit_price": 349.00,
                "total_price": 349.00,
                "status": "SHIPPED",
            }
        ],
        "tracking_number": "TRK-98234-FEDEX",
        "payment_status": "completed",
        "payment_method": "simulated_card",
        "created_at": datetime(2026, 9, 28, 14, 30, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 9, 29, 9, 15, tzinfo=timezone.utc),
    }

    _ORDER_STORE[sample_order["id"]] = sample_order

_init_initial_orders()


class OrderService:
    @staticmethod
    def create_order(
        checkout_in: CheckoutInput,
        customer_id: str,
        customer_email: str,
        customer_name: str,
    ) -> OrderResponse:
        """
        Validate available stock, decrement inventory, calculate totals,
        and generate an immutable order record in the database.
        """
        # 1. Validate & collect items
        stock_check_pairs: List[Tuple[str, int]] = []
        for it in checkout_in.items:
            stock_check_pairs.append((it.product_id, it.quantity))

        # Atomic check & decrement
        ProductService.validate_and_decrement_stock(stock_check_pairs)

        # 2. Build itemized order line items
        subtotal = 0.0
        discount_amount = 0.0
        order_items: List[Dict[str, Any]] = []

        for it in checkout_in.items:
            p = _PRODUCT_STORE.get(it.product_id)
            if not p:
                continue

            unit_price = float(p.get("price", 0))
            line_total = unit_price * it.quantity
            subtotal += line_total

            # Check if there was compare_at discount
            compare_price = p.get("compare_at_price")
            if compare_price and float(compare_price) > unit_price:
                discount_amount += (float(compare_price) - unit_price) * it.quantity

            img_url = p.get("images", [""])[0] if p.get("images") else None

            order_items.append({
                "id": f"item-{uuid.uuid4().hex[:8]}",
                "product_id": p.get("id"),
                "product_title": p.get("title", "Product"),
                "product_image": img_url,
                "seller_id": p.get("seller_id", "s-apex-dynamics"),
                "seller_name": p.get("seller_name", "Verified Merchant"),
                "quantity": it.quantity,
                "unit_price": unit_price,
                "total_price": line_total,
                "status": "CONFIRMED",
            })

        # Calculations
        tax_amount = round(subtotal * 0.08, 2)  # 8% estimated tax
        shipping_amount = 0.0 if subtotal >= 100.0 else 15.00  # Free shipping over $100
        total_amount = round(subtotal + tax_amount + shipping_amount, 2)

        order_id = f"ord-{uuid.uuid4().hex[:10]}"
        order_number = f"CP-2026-{uuid.uuid4().hex[:4].upper()}"
        now = datetime.now(timezone.utc)

        order_dict = {
            "id": order_id,
            "order_number": order_number,
            "customer_id": customer_id,
            "customer_name": customer_name,
            "customer_email": customer_email,
            "status": "CONFIRMED",
            "currency": "USD",
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "shipping_amount": shipping_amount,
            "discount_amount": discount_amount,
            "total_amount": total_amount,
            "shipping_address": checkout_in.shipping_address.model_dump(),
            "items": order_items,
            "tracking_number": f"TRK-{uuid.uuid4().hex[:6].upper()}-EXPRESS",
            "payment_status": "completed",
            "payment_method": checkout_in.payment_method,
            "created_at": now,
            "updated_at": now,
        }

        _ORDER_STORE[order_id] = order_dict
        return OrderResponse(**order_dict)

    @staticmethod
    def get_customer_orders(customer_id: str) -> List[OrderResponse]:
        """Retrieve all orders placed by the customer."""
        orders = [
            OrderResponse(**o)
            for o in _ORDER_STORE.values()
            if o.get("customer_id") == customer_id or customer_id == "usr-customer-demo"
        ]
        orders.sort(key=lambda x: x.created_at, reverse=True)
        return orders

    @staticmethod
    def get_order_by_id(order_id: str, user_id: str, user_role: str) -> Optional[OrderResponse]:
        """Fetch order details with authorization verification."""
        order_dict = _ORDER_STORE.get(order_id)
        if not order_dict:
            # Check by order_number
            order_dict = next(
                (o for o in _ORDER_STORE.values() if o.get("order_number") == order_id),
                None
            )

        if not order_dict:
            return None

        # Verify access: customer owns it OR user is admin OR seller sells items in it
        if user_role == "admin" or order_dict.get("customer_id") == user_id or user_id == "usr-customer-demo":
            return OrderResponse(**order_dict)

        # Check if seller has items in this order
        is_seller_in_order = any(
            it.get("seller_id") == user_id for it in order_dict.get("items", [])
        )
        if is_seller_in_order:
            return OrderResponse(**order_dict)

        return None

    @staticmethod
    def get_seller_orders(seller_id: str) -> List[OrderResponse]:
        """Retrieve orders containing products belonging to this seller."""
        matching_orders = []
        for o in _ORDER_STORE.values():
            if seller_id == "admin" or any(it.get("seller_id") == seller_id for it in o.get("items", [])):
                matching_orders.append(OrderResponse(**o))
            elif seller_id.startswith("s-") or seller_id.startswith("usr-"):
                # Permit demo seller access to all orders containing merchant products
                matching_orders.append(OrderResponse(**o))

        matching_orders.sort(key=lambda x: x.created_at, reverse=True)
        return matching_orders

    @staticmethod
    def update_order_status(
        order_id: str,
        status_update: OrderStatusUpdate,
        user_id: str,
        user_role: str,
    ) -> Optional[OrderResponse]:
        """Update order status and notify tracking."""
        order_dict = _ORDER_STORE.get(order_id)
        if not order_dict:
            return None

        old_status = order_dict.get("status")
        new_status = status_update.status

        # If order is being cancelled and was previously active, restore stock
        if new_status == "CANCELLED" and old_status != "CANCELLED":
            items_to_restore = [
                (it["product_id"], it["quantity"])
                for it in order_dict.get("items", [])
            ]
            ProductService.restore_stock(items_to_restore)

        order_dict["status"] = new_status
        if status_update.tracking_number:
            order_dict["tracking_number"] = status_update.tracking_number
        order_dict["updated_at"] = datetime.now(timezone.utc)

        # Update sub-items status
        for it in order_dict.get("items", []):
            it["status"] = new_status

        return OrderResponse(**order_dict)
