const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const SESSION_STORAGE_KEY = "cortex_pulse_session_id_v1";

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server-session";
  try {
    let sess = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sess) {
      sess = `sess-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
      localStorage.setItem(SESSION_STORAGE_KEY, sess);
    }
    return sess;
  } catch {
    return "ephemeral-session";
  }
}

export type InteractionType =
  | "product_view"
  | "product_click"
  | "search"
  | "category_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "wishlist"
  | "purchase"
  | "review";

export interface InteractionPayload {
  user_id?: string;
  session_id?: string;
  interaction_type: InteractionType;
  product_id?: string;
  category_id?: string;
  search_query?: string;
  duration_seconds?: number;
  metadata?: Record<string, any>;
}

export interface InteractionAnalytics {
  total_interactions: number;
  most_viewed_categories: Array<{ category_id: string; category_name: string; views_count: number }>;
  most_viewed_products: Array<{ product_id: string; title: string; views_count: number; image_url?: string }>;
  frequently_purchased_categories: Array<{ category_name: string; purchase_count: number }>;
  average_order_value: number;
  purchase_frequency: number;
}

export async function trackInteraction(payload: InteractionPayload): Promise<void> {
  if (typeof window === "undefined") return;

  const sessionId = payload.session_id || getOrCreateSessionId();

  try {
    await fetch(`${API_BASE}/api/v1/interactions/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        session_id: sessionId,
      }),
    });
  } catch (err) {
    // Non-blocking telemetry tracking
    console.debug("Telemetry track error:", err);
  }
}

export async function fetchInteractionAnalytics(): Promise<InteractionAnalytics> {
  const res = await fetch(`${API_BASE}/api/v1/interactions/analytics`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch interaction analytics");
  }
  return res.json();
}
