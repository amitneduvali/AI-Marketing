import { Product } from "@/lib/api/products";
import { Order } from "@/lib/api/orders";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface TopProduct {
  product_id: string;
  title: string;
  image_url?: string;
  price: number;
  stock_quantity: number;
  units_sold: number;
  total_revenue: number;
}

export interface DailyMetric {
  date: string;
  sales: number;
  orders_count: number;
}

export interface CategorySalesMetric {
  category_name: string;
  units_sold: number;
  total_sales: number;
}

export interface SellerAnalytics {
  total_products: number;
  total_orders: number;
  total_sales: number;
  units_sold: number;
  low_stock_products: number;
  recent_orders: Order[];
  top_products: TopProduct[];
  revenue_by_date: DailyMetric[];
  order_status_counts: Record<string, number>;
  category_sales: CategorySalesMetric[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function getAuthHeader(): Promise<Record<string, string>> {
  if (isSupabaseConfigured) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      return { Authorization: `Bearer ${data.session.access_token}` };
    }
  }
  return {};
}

export async function fetchSellerAnalytics(): Promise<SellerAnalytics> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/api/v1/seller/analytics`, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not reach backend for seller analytics, using fallback:", err);
  }

  return {
    total_products: 4,
    total_orders: 12,
    total_sales: 3420.5,
    units_sold: 18,
    low_stock_products: 1,
    recent_orders: [],
    top_products: [
      {
        product_id: "prod-1",
        title: "Aura Noise-Cancelling Headphones Pro",
        price: 299.99,
        stock_quantity: 45,
        units_sold: 25,
        total_revenue: 7499.75,
      },
    ],
    revenue_by_date: [
      { date: "Mon", sales: 450, orders_count: 2 },
      { date: "Tue", sales: 780, orders_count: 3 },
      { date: "Wed", sales: 1200, orders_count: 4 },
      { date: "Thu", sales: 990, orders_count: 3 },
    ],
    order_status_counts: { DELIVERED: 8, PROCESSING: 3, PENDING: 1 },
    category_sales: [{ category_name: "Electronics", units_sold: 18, total_sales: 3420.5 }],
  };
}

export async function fetchSellerInventory(): Promise<Product[]> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/api/v1/seller/inventory`, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not reach backend for seller inventory, using fallback:", err);
  }

  const { fetchSellerProducts } = await import("@/lib/api/products");
  const p = await fetchSellerProducts();
  return p.items;
}

export async function updateInventoryStock(
  productId: string,
  stockQuantity: number
): Promise<Product> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await getAuthHeader()),
  };

  const res = await fetch(`${API_BASE}/api/v1/seller/inventory/${productId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ stock_quantity: stockQuantity }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to update stock" }));
    throw new Error(err.detail || "Stock update failed");
  }

  return res.json();
}
