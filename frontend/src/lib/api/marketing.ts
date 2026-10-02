import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface DemandForecastData {
  product_id: string;
  product_title: string;
  has_sufficient_data: boolean;
  message: string;
  historical_sales_total: number;
  predicted_demand_units?: number | null;
  predicted_demand_daily_rate?: number | null;
  trend: "Increasing" | "Declining" | "Stable" | "Insufficient Data";
  trend_slope: number;
  confidence: string;
  confidence_reason: string;
  forecast_days: number;
  historical_timeline: Array<{ date: string; units: number }>;
}

export interface ProductMarketingMetric {
  product_id: string;
  title: string;
  sku: string;
  category_name: string;
  price: number;
  stock_quantity: number;
  views: number;
  cart_additions: number;
  add_to_cart_rate: number;
  conversion_rate: number;
  units_sold: number;
  revenue: number;
  average_selling_price: number;
  stock_velocity: number;
  demand_forecast?: DemandForecastData;
}

export interface MarketingInsightItem {
  id: string;
  product_id: string;
  product_title: string;
  insight_type: "critical_low_stock" | "high_views_low_conversion" | "cart_abandonment" | "high_performer" | "low_performer" | "increasing_demand" | "declining_demand" | string;
  severity: "urgent" | "high" | "medium" | "positive" | "warning" | "info";
  metric: string;
  finding: string;
  suggested_action: string;
  observation_data: Record<string, any>;
}

export interface MarketingInsightsResponse {
  seller_id: string;
  generated_at: string;
  total_products_analyzed: number;
  insights_count: number;
  insights: MarketingInsightItem[];
  product_metrics: ProductMarketingMetric[];
}

export interface PersonalizedOfferItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  suggested_product_id: string;
  suggested_product_title: string;
  suggested_product_price: number;
  promo_code: string;
  discount_percent: number;
  reason: string;
  is_ai_generated: boolean;
}

export interface PersonalizedOffersResponse {
  user_id?: string | null;
  total_offers: number;
  generated_at: string;
  offers: PersonalizedOfferItem[];
  notice: string;
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

const DEFAULT_MARKETING_INSIGHTS: MarketingInsightsResponse = {
  seller_id: "s-apex-dynamics",
  generated_at: new Date().toISOString(),
  total_products_analyzed: 2,
  insights_count: 2,
  insights: [
    {
      id: "ins-1",
      product_id: "prod-1",
      product_title: "Aura Noise-Cancelling Headphones Pro",
      insight_type: "high_performer",
      severity: "positive",
      metric: "Conversion & Revenue",
      finding: "Strong conversion velocity and steady customer sentiment.",
      suggested_action: "Feature in promotional hero campaigns and protect stock buffer.",
      observation_data: { conversion_rate: 0.18, revenue: 1499.5 },
    },
    {
      id: "ins-2",
      product_id: "prod-2",
      product_title: "PulseFlow Ergonomic Mechanical Keyboard",
      insight_type: "cart_abandonment",
      severity: "warning",
      metric: "Add-to-Cart vs Orders",
      finding: "Above-average cart additions with lower final checkouts.",
      suggested_action: "Deploy limited-time coupon or complimentary accessory bundle.",
      observation_data: { cart_adds: 24, orders: 8 },
    },
  ],
  product_metrics: [
    {
      product_id: "prod-1",
      title: "Aura Noise-Cancelling Headphones Pro",
      sku: "AURA-NC-001",
      category_name: "Audio",
      price: 299.99,
      stock_quantity: 45,
      views: 310,
      cart_additions: 48,
      add_to_cart_rate: 0.155,
      conversion_rate: 0.08,
      units_sold: 25,
      revenue: 7499.75,
      average_selling_price: 299.99,
      stock_velocity: 1.2,
      demand_forecast: {
        product_id: "prod-1",
        product_title: "Aura Noise-Cancelling Headphones Pro",
        has_sufficient_data: true,
        message: "Strong consistent trend based on recent signals.",
        historical_sales_total: 25,
        predicted_demand_units: 35,
        predicted_demand_daily_rate: 1.16,
        trend: "Increasing",
        trend_slope: 0.08,
        confidence: "High",
        confidence_reason: "Frequent multi-channel engagement",
        forecast_days: 30,
        historical_timeline: [
          { date: "Day 1", units: 3 },
          { date: "Day 2", units: 5 },
          { date: "Day 3", units: 4 },
          { date: "Day 4", units: 7 },
          { date: "Day 5", units: 6 },
        ],
      },
    },
  ],
};

export async function fetchMarketingInsights(): Promise<MarketingInsightsResponse> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/api/v1/seller/marketing-insights`, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not reach backend for marketing insights, using local fallback:", err);
  }
  return DEFAULT_MARKETING_INSIGHTS;
}

export async function fetchPersonalizedOffers(
  userId?: string,
  sessionId?: string
): Promise<PersonalizedOffersResponse> {
  try {
    const headers = await getAuthHeader();
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (sessionId) params.append("session_id", sessionId);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE}/api/v1/offers/personalized${query}`, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not reach backend for personalized offers, using local fallback:", err);
  }

  return {
    user_id: userId || null,
    total_offers: 1,
    generated_at: new Date().toISOString(),
    offers: [
      {
        id: "off-demo-1",
        title: "Exclusive Audio Enthusiast Privilege",
        badge: "AI Recommendation",
        description: "Special 15% discount curated based on your audio browsing interest.",
        suggested_product_id: "prod-1",
        suggested_product_title: "Aura Noise-Cancelling Headphones Pro",
        suggested_product_price: 299.99,
        promo_code: "AURA15",
        discount_percent: 15,
        reason: "Matched high affinity with high-fidelity sound devices.",
        is_ai_generated: true,
      },
    ],
    notice: "Operating with AI smart offers mode.",
  };
}
