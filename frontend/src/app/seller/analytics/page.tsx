"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Boxes,
  PieChart as PieChartIcon,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SellerNav } from "@/components/seller/seller-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchSellerAnalytics, SellerAnalytics } from "@/lib/api/seller";
import {
  fetchCustomerSegmentation,
  CustomerSegmentationResponse,
} from "@/lib/api/recommendations";
import {
  fetchMarketingInsights,
  MarketingInsightsResponse,
} from "@/lib/api/marketing";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  PROCESSING: "#8b5cf6",
  SHIPPED: "#06b6d4",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
};

const CATEGORY_COLORS = ["#06b6d4", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

const SEGMENT_BADGE_VARIANTS: Record<string, string> = {
  "High Value": "success",
  "Frequent Buyer": "cyan",
  "Occasional Buyer": "warning",
  "New Customer": "ai",
  "Low Engagement": "outline",
};

export default function SellerAnalyticsPage() {
  const [data, setData] = React.useState<SellerAnalytics | null>(null);
  const [segmentation, setSegmentation] = React.useState<CustomerSegmentationResponse | null>(null);
  const [marketingData, setMarketingData] = React.useState<MarketingInsightsResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadAnalytics = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, segRes, mRes] = await Promise.all([
        fetchSellerAnalytics(),
        fetchCustomerSegmentation().catch(() => null),
        fetchMarketingInsights().catch(() => null),
      ]);
      setData(res);
      setSegmentation(segRes);
      setMarketingData(mRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load seller analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Derived calculations from actual records
  const averageOrderValue =
    data && data.total_orders > 0 ? data.total_sales / data.total_orders : 0;

  const statusChartData = data?.order_status_counts
    ? Object.entries(data.order_status_counts).map(([name, count]) => ({
        status: name,
        orders: count,
        fill: STATUS_COLORS[name] || "#64748b",
      }))
    : [];

  const categoryPieData = data?.category_sales?.map((cat, i) => ({
    name: cat.category_name,
    value: cat.total_sales,
    units: cat.units_sold,
    fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  })) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <SellerNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="cyan" className="text-xs">
                Real-Time Database Analytics
              </Badge>
              <span className="text-xs text-slate-400">
                Recharts Visualizations & Calculations
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Seller Analytics & Performance
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Zero fabricated statistics. All metrics are computed dynamically from actual marketplace transactions and PostgreSQL inventory.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
            className="text-xs"
          >
            Recompute Analytics
          </Button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to render analytics"
            message={error}
            onRetry={loadAnalytics}
          />
        ) : !data ? (
          <EmptyState
            title="No data available"
            description="Could not compile performance records at this moment."
            actionLabel="Retry"
            onAction={loadAnalytics}
          />
        ) : (
          <>
            {/* Real Database KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gross Sales */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Gross Sales</span>
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  ${data.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Real Database Total
                </p>
              </div>

              {/* Total Orders */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Total Orders Placed</span>
                  <ShoppingBag className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-white">{data.total_orders}</div>
                <p className="text-[11px] text-slate-400">Across all fulfillment states</p>
              </div>

              {/* Units Fulfilled */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 transition space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Units Sold</span>
                  <Boxes className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">{data.units_sold}</div>
                <p className="text-[11px] text-slate-400">Physical units purchased</p>
              </div>

              {/* Average Order Value (AOV) */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Average Order Value</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  ${averageOrderValue.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400">Sales &divide; Total Orders</p>
              </div>
            </div>

            {/* Recharts Chart 1: Daily Revenue Timeline Area Chart */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Revenue Velocity Over Time
                  </h2>
                  <p className="text-xs text-slate-400">
                    Calculated from order creation timestamps in PostgreSQL
                  </p>
                </div>
                <Badge variant="cyan" className="text-[10px]">
                  Daily Aggregation
                </Badge>
              </div>

              <div className="h-72 w-full pt-2">
                {data.revenue_by_date && data.revenue_by_date.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.revenue_by_date}
                      margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="analyticsSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#fff",
                        }}
                        formatter={(val: any) => [`$${Number(val).toFixed(2)}`, "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        name="Gross Revenue"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#analyticsSales)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No order history recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Recharts Grid 2 & 3: Status Distribution & Category Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Order Status Distribution (7 cols) */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Order Fulfillment Pipeline
                    </h2>
                    <p className="text-xs text-slate-400">
                      Total order counts per status category
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {data.total_orders} total orders
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statusChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="status" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "10px",
                          fontSize: "11px",
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-status-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown (5 cols) */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Sales by Category
                  </h2>
                  <p className="text-xs text-slate-400">
                    Distribution of revenue across product verticals
                  </p>
                </div>

                <div className="h-56 w-full flex items-center justify-center">
                  {categoryPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          innerRadius={45}
                          paddingAngle={3}
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell key={`cell-cat-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "10px",
                            fontSize: "11px",
                            color: "#fff",
                          }}
                          formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Sales"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-xs text-slate-500">No category sales recorded.</div>
                  )}
                </div>

                {/* Category Legend */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  {categoryPieData.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.fill }}
                        />
                        <span className="truncate max-w-[150px]">{cat.name}</span>
                      </div>
                      <span className="font-semibold text-white">
                        ${cat.value.toFixed(2)} ({cat.units} sold)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Products Leaderboard Table */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Product Performance Leaderboard
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real units sold, gross sales revenue, and inventory balances from actual database
                  </p>
                </div>

                <Link
                  href="/seller/products"
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Manage Products <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Rank &amp; Product</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Remaining Stock</th>
                      <th className="py-3 px-4">Units Sold</th>
                      <th className="py-3 px-4 text-right">Gross Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.top_products.map((item, idx) => (
                      <tr key={item.product_id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-slate-500 w-4 text-center">
                              #{idx + 1}
                            </span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                item.image_url ||
                                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                              }
                              alt={item.title}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                            />
                            <div className="min-w-0 max-w-sm">
                              <Link
                                href={`/products/${item.product_id}`}
                                target="_blank"
                                className="font-semibold text-white hover:text-cyan-300 transition truncate block"
                              >
                                {item.title}
                              </Link>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-white">
                          ${item.price.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={
                              item.stock_quantity <= 5
                                ? "text-amber-400 font-bold"
                                : "text-slate-300"
                            }
                          >
                            {item.stock_quantity} units
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-emerald-400">
                          {item.units_sold} sold
                        </td>

                        <td className="py-3.5 px-4 text-right font-black text-white text-sm">
                          ${item.total_revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* AI CUSTOMER SEGMENTATION (SCIKIT-LEARN K-MEANS) */}
            {/* ========================================================================= */}
            {segmentation && (
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="ai" className="text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        ML-Generated Intelligence
                      </Badge>
                      <span className="text-xs text-slate-400 font-mono">
                        {segmentation.model_metadata.algorithm}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      AI Customer Behavioral Segmentation
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                      Trained dynamically on actual customer orders and interaction logs. Shoppers are partitioned into clusters using normalized RFM (Recency, Frequency, Monetary) vectors and browsing engagement.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300 max-w-xs shrink-0">
                    <span className="font-semibold block text-white mb-0.5">Algorithm Transparency</span>
                    Clustering features: <em>Spending, Frequency, AOV, Views, Cart additions, and Days Recency</em> via StandardScaler.
                  </div>
                </div>

                {/* Segment Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {segmentation.segments.map((seg) => {
                    const badgeVariant = (SEGMENT_BADGE_VARIANTS[seg.segment] || "outline") as any;

                    return (
                      <div
                        key={seg.segment}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant={badgeVariant} className="text-[10px]">
                            {seg.segment}
                          </Badge>
                          <span className="text-xs font-mono font-bold text-white">
                            {seg.count} ({seg.percentage}%)
                          </span>
                        </div>
                        <div className="text-lg font-black text-white">
                          ${seg.avg_spending.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Avg Customer Spend
                        </span>
                        <p className="text-[10px] text-slate-400 line-clamp-2 pt-1 border-t border-slate-900">
                          {seg.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Segment Distribution Chart */}
                <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Segment Revenue Potential vs Audience Count
                  </h3>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={segmentation.segments}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="segment" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "10px",
                            fontSize: "11px",
                            color: "#fff",
                          }}
                        />
                        <Bar dataKey="avg_spending" name="Avg Spend ($)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="count" name="Customers" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Segmented Customer Roster */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Customer Cluster Assignments ({segmentation.total_customers_analyzed})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">ML Segment</th>
                          <th className="py-2.5 px-3">Total Spend</th>
                          <th className="py-2.5 px-3">Orders</th>
                          <th className="py-2.5 px-3">AOV</th>
                          <th className="py-2.5 px-3">Views / Carts</th>
                          <th className="py-2.5 px-3">Recency</th>
                          <th className="py-2.5 px-3 text-right">Cluster ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {segmentation.customers.map((c) => (
                          <tr key={c.customer_id} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-3">
                              <span className="font-semibold text-white block">
                                {c.customer_name}
                              </span>
                              <span className="text-[11px] text-slate-400">{c.customer_email}</span>
                            </td>
                            <td className="py-3 px-3">
                              <Badge
                                variant={(SEGMENT_BADGE_VARIANTS[c.segment] || "outline") as any}
                                className="text-[10px]"
                              >
                                {c.segment}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 font-bold text-white">
                              ${c.total_spending.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-slate-300">
                              {c.purchase_frequency} orders
                            </td>
                            <td className="py-3 px-3 text-slate-300">
                              ${c.average_order_value.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-slate-400">
                              {c.product_views} views • {c.cart_additions} carts
                            </td>
                            <td className="py-3 px-3 text-slate-400">
                              {c.recency_days}d ago
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-500">
                              Cluster #{c.cluster_id}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Demand Prediction Module */}
            {marketingData && marketingData.product_metrics && (
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="cyan" className="text-[10px]">
                        Statistical ML Engine
                      </Badge>
                      <span className="text-xs text-slate-400 font-mono">
                        Explainable Linear Velocity Regression
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      Short-Term Product Demand Forecasting
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                      Projects short-term product demand where enough historical sales data exists. Explicitly flags products with insufficient data to guarantee zero fabricated forecasting.
                    </p>
                  </div>

                  <Link href="/seller/insights">
                    <Button variant="outline" size="sm" className="border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-cyan-400 text-xs flex items-center gap-1.5">
                      <span>View Funnel Insights</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {marketingData.product_metrics.map((pm) => {
                    const fc = pm.demand_forecast;
                    const hasData = fc && fc.has_sufficient_data;

                    return (
                      <div
                        key={pm.product_id}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3 flex flex-col justify-between hover:border-slate-700 transition"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-bold text-white truncate" title={pm.title}>
                              {pm.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              {pm.category_name}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs py-1.5 border-y border-slate-900">
                            <span className="text-slate-400">Historical Sales</span>
                            <span className="font-mono font-bold text-slate-200">
                              {fc ? fc.historical_sales_total : pm.units_sold} units
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-900">
                            <span className="text-slate-400">Trend Trajectory</span>
                            <span
                              className={`font-semibold font-mono ${
                                fc?.trend === "Increasing"
                                  ? "text-emerald-400"
                                  : fc?.trend === "Declining"
                                  ? "text-orange-400"
                                  : "text-slate-400"
                              }`}
                            >
                              {fc?.trend || "Stable"}
                            </span>
                          </div>
                        </div>

                        <div>
                          {hasData ? (
                            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-emerald-400 font-semibold">Predicted Demand</span>
                                <span className="text-xs font-bold text-emerald-300 font-mono">
                                  {fc.predicted_demand_units} units / 14d
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Confidence: {fc.confidence} • Daily: {fc.predicted_demand_daily_rate}/day
                              </p>
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                              <span className="text-[11px] font-semibold text-amber-400/90 block">
                                Insufficient historical data for reliable prediction.
                              </span>
                              <p className="text-[10px] text-slate-500">
                                Requires at least 2 distinct sales transaction periods to model without fabrication.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
