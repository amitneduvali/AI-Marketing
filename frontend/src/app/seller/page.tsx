"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  Boxes,
  BarChart3,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
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
import { Order } from "@/lib/api/orders";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  PROCESSING: "#8b5cf6",
  SHIPPED: "#06b6d4",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
};

export default function SellerOverviewDashboard() {
  const [data, setData] = React.useState<SellerAnalytics | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadDashboard = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSellerAnalytics();
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load seller analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="secondary" className="text-[10px]">Confirmed</Badge>;
      case "PROCESSING":
        return <Badge variant="warning" className="text-[10px]">Processing</Badge>;
      case "SHIPPED":
        return <Badge variant="cyan" className="text-[10px]">Shipped</Badge>;
      case "DELIVERED":
        return <Badge variant="success" className="text-[10px]">Delivered</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive" className="text-[10px]">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  // Prepare order status chart data
  const statusChartData = data?.order_status_counts
    ? Object.entries(data.order_status_counts).map(([name, count]) => ({
        status: name,
        count,
        fill: STATUS_COLORS[name] || "#64748b",
      }))
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <SellerNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="cyan" className="text-xs">
                Merchant Operations Hub
              </Badge>
              <span className="text-xs text-slate-400">Real Database Records</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Seller Dashboard & Store Overview
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Live operational metrics, database inventory balances, and order performance tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboard}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
              className="text-xs"
            >
              Refresh
            </Button>
            <Link href="/seller/products/new">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="text-xs font-semibold shadow-lg shadow-cyan-500/20"
              >
                Add New Product
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load dashboard metrics"
            message={error}
            onRetry={loadDashboard}
          />
        ) : !data ? (
          <EmptyState
            title="No store data"
            description="Unable to compute seller analytics at this moment."
            actionLabel="Try Again"
            onAction={loadDashboard}
          />
        ) : (
          <>
            {/* Top 5 Primary KPI Cards - Real Database Records */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Sales */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition space-y-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition" />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Total Sales</span>
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-white tracking-tight">
                  ${data.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Live Gross Revenue
                </p>
              </div>

              {/* Total Orders */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition space-y-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition" />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-white tracking-tight">
                  {data.total_orders}
                </div>
                <Link
                  href="/seller/orders"
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Manage orders <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Units Sold */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 transition space-y-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition" />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Units Sold</span>
                  <Boxes className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white tracking-tight">
                  {data.units_sold}
                </div>
                <p className="text-[11px] text-slate-400">Physical units fulfilled</p>
              </div>

              {/* Total Products */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition space-y-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Total Products</span>
                  <Package className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white tracking-tight">
                  {data.total_products}
                </div>
                <Link
                  href="/seller/products"
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                >
                  View catalog <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Low-stock Products */}
              <div className={`p-5 rounded-2xl border transition space-y-2 relative overflow-hidden group ${
                data.low_stock_products > 0
                  ? "bg-amber-950/20 border-amber-800/60 hover:border-amber-600"
                  : "bg-slate-900/70 border-slate-800"
              }`}>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Low-Stock Alerts</span>
                  <AlertTriangle className={`w-4 h-4 ${data.low_stock_products > 0 ? "text-amber-400" : "text-slate-500"}`} />
                </div>
                <div className={`text-2xl font-black tracking-tight ${data.low_stock_products > 0 ? "text-amber-400" : "text-white"}`}>
                  {data.low_stock_products}
                </div>
                <Link
                  href="/seller/inventory"
                  className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 font-medium"
                >
                  {data.low_stock_products > 0 ? "Restock items" : "All stocks healthy"} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Charts Section using Recharts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Revenue & Sales Trend (8 cols) */}
              <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Sales Activity & Order Volume
                    </h2>
                    <p className="text-xs text-slate-400">
                      Calculated from chronological order records in database
                    </p>
                  </div>
                  <Badge variant="cyan" className="text-[10px]">
                    Recharts Live
                  </Badge>
                </div>

                <div className="h-64 w-full pt-2">
                  {data.revenue_by_date && data.revenue_by_date.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data.revenue_by_date}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "#fff",
                          }}
                          formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Sales"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#06b6d4"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorSales)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No timestamped transactions recorded yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Order Status Distribution (4 cols) */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Order Status Breakdown
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time fulfillment pipeline counts
                  </p>
                </div>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statusChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={11} />
                      <YAxis
                        type="category"
                        dataKey="status"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        width={70}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "10px",
                          fontSize: "11px",
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Total Managed Orders:</span>
                  <span className="font-bold text-white">{data.total_orders}</span>
                </div>
              </div>
            </div>

            {/* Bottom Section: Top Products & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Top Products (6 cols) */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-base font-bold text-white">
                      Top Products (Units & Sales)
                    </h2>
                  </div>
                  <Link
                    href="/seller/products"
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    All Products <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {data.top_products.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No products cataloged yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.top_products.slice(0, 5).map((item, idx) => (
                      <div
                        key={item.product_id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-xs font-bold text-slate-500 w-4 text-center">
                            #{idx + 1}
                          </span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              item.image_url ||
                              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                            }
                            alt={item.title}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-900 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Stock: {item.stock_quantity} left • ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-3">
                          <span className="text-xs font-bold text-white block">
                            ${item.total_revenue.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-emerald-400">
                            {item.units_sold} sold
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders (6 cols) */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-base font-bold text-white">
                      Recent Orders
                    </h2>
                  </div>
                  <Link
                    href="/seller/orders"
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    View All Orders <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {data.recent_orders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No orders placed yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.recent_orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">
                              #{ord.order_number}
                            </span>
                            {getStatusBadge(ord.status)}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Buyer: {ord.customer_name} • {new Date(ord.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-white block">
                            ${ord.total_amount.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {ord.items.length} {ord.items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
