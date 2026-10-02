"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { SellerNav } from "@/components/seller/seller-nav";
import {
  fetchMarketingInsights,
  MarketingInsightsResponse,
  MarketingInsightItem,
  ProductMarketingMetric,
} from "@/lib/api/marketing";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Eye,
  ShoppingCart,
  Percent,
  DollarSign,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Info,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SellerMarketingInsightsPage() {
  const [data, setData] = useState<MarketingInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<ProductMarketingMetric | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchMarketingInsights();
      setData(res);
      if (res.product_metrics.length > 0 && !selectedProduct) {
        setSelectedProduct(res.product_metrics[0]);
      }
    } catch (err: any) {
      console.error("Failed to load marketing insights:", err);
      setError(err.message || "Failed to load marketing insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInsights = React.useMemo(() => {
    if (!data) return [];
    if (filterSeverity === "all") return data.insights;
    return data.insights.filter((ins) => ins.severity === filterSeverity || ins.insight_type === filterSeverity);
  }, [data, filterSeverity]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SellerNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                <Sparkles className="w-3.5 h-3.5" />
                Gadgets World Intelligence
              </span>
              <span className="text-xs text-slate-400">Strictly Non-Fabricated Telemetry</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              AI Marketing Intelligence
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Data-driven product conversion funnel diagnostics, real behavioral observations, and automated strategic recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
              Re-analyze Telemetry
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && !data && (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <p className="text-sm text-slate-400">Running behavioral attribution models & conversion audits...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={loadData} className="border-red-800 text-xs">
              Retry
            </Button>
          </div>
        )}

        {/* Active Dashboard */}
        {data && (
          <>
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
                <span className="text-xs font-medium text-slate-400">Catalog Analyzed</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{data.total_products_analyzed}</span>
                  <span className="text-xs text-slate-500">active products</span>
                </div>
                <div className="mt-2 text-[11px] text-cyan-400">100% verified DB records</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
                <span className="text-xs font-medium text-slate-400">Actionable Findings</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-cyan-400">{data.insights_count}</span>
                  <span className="text-xs text-slate-500">rule triggers</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">Metric → Finding → Action</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
                <span className="text-xs font-medium text-slate-400">Average Cart Addition Rate</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {data.product_metrics.length > 0
                      ? (
                          data.product_metrics.reduce((acc, m) => acc + m.add_to_cart_rate, 0) /
                          data.product_metrics.length
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">Shopper intent proxy</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
                <span className="text-xs font-medium text-slate-400">Average Purchase Conversion</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-400">
                    {data.product_metrics.length > 0
                      ? (
                          data.product_metrics.reduce((acc, m) => acc + m.conversion_rate, 0) /
                          data.product_metrics.length
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">Completed checkout / views</div>
              </div>
            </div>

            {/* Strategic Insights Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    Data-Driven Strategic Marketing Insights
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Clear separation between empirical data observations and strategic suggested actions.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {[
                    { id: "all", label: "All Insights" },
                    { id: "urgent", label: "Critical Stock" },
                    { id: "high", label: "Cart Drop-off" },
                    { id: "medium", label: "Low Conversion" },
                    { id: "positive", label: "High Performers" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterSeverity(f.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        filterSeverity === f.id
                          ? "bg-cyan-500 text-slate-950 font-semibold"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredInsights.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-900/30 border border-slate-800/60 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-slate-300">No anomalies or critical triggers found</p>
                  <p className="text-xs text-slate-500 mt-1">All catalog items operate within healthy baseline metrics.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredInsights.map((ins) => {
                    const isUrgent = ins.severity === "urgent";
                    const isHigh = ins.severity === "high";
                    const isPositive = ins.severity === "positive";
                    const isWarning = ins.severity === "warning";

                    const badgeColor = isUrgent
                      ? "bg-red-950/80 text-red-400 border-red-800/80"
                      : isHigh
                      ? "bg-amber-950/80 text-amber-300 border-amber-800/80"
                      : isPositive
                      ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                      : isWarning
                      ? "bg-orange-950/80 text-orange-400 border-orange-800/80"
                      : "bg-cyan-950/80 text-cyan-400 border-cyan-800/80";

                    return (
                      <div
                        key={ins.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
                      >
                        {/* Header */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-semibold text-slate-300 truncate">
                              {ins.product_title}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor} uppercase tracking-wider`}>
                              {ins.insight_type.replace(/_/g, " ")}
                            </span>
                          </div>

                          {/* 1. Concrete Metric */}
                          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 text-xs">
                            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                              <Eye className="w-3 h-3 text-cyan-400" />
                              Empirical Metric
                            </div>
                            <p className="font-mono text-cyan-300 text-xs font-semibold">{ins.metric}</p>
                          </div>
                        </div>

                        {/* 2. Analytical Finding */}
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Behavioral Finding
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/30 p-2 rounded-lg border border-slate-800/40">
                            {ins.finding}
                          </p>
                        </div>

                        {/* 3. Suggested Action */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/70">
                          <div className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-emerald-400" />
                            Suggested Action
                          </div>
                          <p className="text-xs text-emerald-300/90 leading-relaxed font-medium bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40">
                            {ins.suggested_action}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Performance & Conversion Funnel Table */}
            <div className="space-y-4 pt-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <BarChartIcon className="w-5 h-5 text-cyan-400" />
                  Product Conversion Funnel & Sales Velocity
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed breakdown of page views, cart addition rate, purchase conversion, average selling price (ASP), and stock turnover velocity.
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40 backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Product</th>
                        <th className="py-3.5 px-3 text-right">Price / ASP</th>
                        <th className="py-3.5 px-3 text-center">Stock</th>
                        <th className="py-3.5 px-3 text-right">Views</th>
                        <th className="py-3.5 px-3 text-right">Cart Add %</th>
                        <th className="py-3.5 px-3 text-right">Conv %</th>
                        <th className="py-3.5 px-3 text-right">Sold</th>
                        <th className="py-3.5 px-3 text-right">Revenue</th>
                        <th className="py-3.5 px-3 text-center">Velocity</th>
                        <th className="py-3.5 px-4 text-center">Demand Forecast</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-slate-300">
                      {data.product_metrics.map((pm) => {
                        const fc = pm.demand_forecast;
                        return (
                          <tr key={pm.product_id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-100 max-w-xs truncate" title={pm.title}>
                                {pm.title}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                SKU: {pm.sku} • {pm.category_name}
                              </div>
                            </td>

                            <td className="py-3 px-3 text-right font-mono">
                              <div className="text-slate-200">${pm.price.toFixed(2)}</div>
                              <div className="text-[10px] text-slate-400">ASP: ${pm.average_selling_price.toFixed(2)}</div>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  pm.stock_quantity <= 5
                                    ? "bg-red-950 text-red-300 border border-red-800"
                                    : "bg-slate-800 text-slate-300"
                                }`}
                              >
                                {pm.stock_quantity}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right font-mono text-slate-300">{pm.views}</td>

                            <td className="py-3 px-3 text-right font-mono">
                              <span
                                className={`font-semibold ${
                                  pm.add_to_cart_rate >= 40
                                    ? "text-cyan-400"
                                    : pm.add_to_cart_rate > 0
                                    ? "text-slate-300"
                                    : "text-slate-500"
                                }`}
                              >
                                {pm.add_to_cart_rate.toFixed(1)}%
                              </span>
                              <div className="text-[10px] text-slate-500">{pm.cart_additions} adds</div>
                            </td>

                            <td className="py-3 px-3 text-right font-mono">
                              <span
                                className={`font-semibold ${
                                  pm.conversion_rate >= 20
                                    ? "text-emerald-400"
                                    : pm.conversion_rate > 0
                                    ? "text-amber-400"
                                    : "text-slate-500"
                                }`}
                              >
                                {pm.conversion_rate.toFixed(1)}%
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right font-mono text-slate-200 font-semibold">
                              {pm.units_sold}
                            </td>

                            <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-400">
                              ${pm.revenue.toFixed(2)}
                            </td>

                            <td className="py-3 px-3 text-center font-mono">
                              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                                {pm.stock_velocity.toFixed(2)}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-center">
                              {fc && !fc.has_sufficient_data ? (
                                <div
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-slate-800/60 text-slate-400 border border-slate-700/60"
                                  title={fc.message}
                                >
                                  <Info className="w-3 h-3 text-slate-400" />
                                  <span>Insufficient Data</span>
                                </div>
                              ) : fc && fc.has_sufficient_data ? (
                                <div
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold border ${
                                    fc.trend === "Increasing"
                                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                                      : fc.trend === "Declining"
                                      ? "bg-orange-950/80 text-orange-300 border-orange-800"
                                      : "bg-cyan-950/80 text-cyan-300 border-cyan-800"
                                  }`}
                                  title={`${fc.message} | Confidence: ${fc.confidence}`}
                                >
                                  {fc.trend === "Increasing" ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  <span>
                                    {fc.predicted_demand_units} units / 14d ({fc.trend})
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-[10px]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Demand Prediction Module Explanation Banner */}
            <div className="p-5 rounded-xl border border-cyan-900/40 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-slate-900/40 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Transparent Demand Prediction Architecture
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Forecasts are computed using a lightweight, explainable linear velocity regression model calibrated over historical order timeline slices. In accordance with zero-fabrication standards, products with fewer than 2 chronological transaction periods explicitly report{" "}
                    <span className="text-slate-200 font-semibold">
                      &quot;Insufficient historical data for reliable prediction&quot;
                    </span>{" "}
                    rather than synthesizing artificial forecast points.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
