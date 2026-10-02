"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Tag,
  BarChart3,
  Layers,
  Sparkles,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  ArrowUpRight,
  UserCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useAuth } from "@/context/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  fetchAdminDashboard,
  createCategory,
  AdminDashboardData,
} from "@/lib/api/admin";

const CATEGORY_COLORS = ["#06b6d4", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#6366f1"];

export default function AdminDashboardPage() {
  const { user, role, switchRole } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "sellers" | "products" | "orders" | "categories">("overview");

  // Category creation modal state
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [submittingCat, setSubmittingCat] = useState(false);

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAdminDashboard();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load admin dashboard:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catSlug.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name and slug are required.",
        variant: "error",
      });
      return;
    }

    try {
      setSubmittingCat(true);
      const newCat = await createCategory({
        name: catName.trim(),
        slug: catSlug.trim().toLowerCase().replace(/\s+/g, "-"),
        description: catDesc.trim() || undefined,
      });

      toast({
        title: "Category Created",
        description: `Successfully added '${newCat.name}' to platform taxonomy.`,
        variant: "success",
      });

      setShowAddCatModal(false);
      setCatName("");
      setCatSlug("");
      setCatDesc("");
      loadData();
    } catch (err: any) {
      toast({
        title: "Creation Failed",
        description: err.message || "Could not create category",
        variant: "error",
      });
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleAutoSlug = (nameVal: string) => {
    setCatName(nameVal);
    setCatSlug(nameVal.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-800/80">
                <Shield className="w-3.5 h-3.5" />
                Superuser Console
              </span>
              <span className="text-xs text-slate-500 font-mono">Platform Admin Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Platform Administration & Intelligence
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time platform metrics, merchant performance, customer segments, and category governance.
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
              Refresh Telemetry
            </Button>
            {role !== "ADMIN" && (
              <Button
                onClick={() => {
                  switchRole("ADMIN");
                  toast({
                    title: "Admin Context Activated",
                    description: "You are viewing platform controls with full superuser privileges.",
                    variant: "info",
                  });
                }}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Switch to Admin Role
              </Button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && !data && (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Aggregating live platform analytics from PostgreSQL store...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={loadData} className="border-red-800 text-xs">
              Retry
            </Button>
          </div>
        )}

        {/* Active Admin Hub */}
        {data && (
          <>
            {/* Platform KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  Users
                </span>
                <div className="text-2xl font-black text-white">{data.total_users}</div>
                <div className="text-[10px] text-slate-500">Active accounts</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-cyan-400" />
                  Sellers
                </span>
                <div className="text-2xl font-black text-cyan-400">{data.total_sellers}</div>
                <div className="text-[10px] text-slate-500">Verified merchants</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-purple-400" />
                  Products
                </span>
                <div className="text-2xl font-black text-white">{data.total_products}</div>
                <div className="text-[10px] text-emerald-400">{data.active_products} published</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  Orders
                </span>
                <div className="text-2xl font-black text-white">{data.total_orders}</div>
                <div className="text-[10px] text-slate-500">Total volume</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1 sm:col-span-2 lg:col-span-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Platform Gross Revenue
                </span>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  ${data.total_revenue.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500">From active & completed transactions</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
              {[
                { id: "overview", label: "Overview & Charts", icon: BarChart3 },
                { id: "users", label: `Users (${data.users.length})`, icon: Users },
                { id: "sellers", label: `Sellers (${data.seller_performance.length})`, icon: Store },
                { id: "products", label: `Products (${data.products.length})`, icon: Package },
                { id: "orders", label: `Orders (${data.orders.length})`, icon: ShoppingBag },
                { id: "categories", label: `Categories (${data.categories.length})`, icon: Tag },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: OVERVIEW & CHARTS */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Visualizations Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Categories Chart */}
                  <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-cyan-400" />
                          Category Revenue Distribution
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Gross revenue aggregated by product taxonomy</p>
                      </div>
                    </div>

                    <div className="h-64 w-full">
                      {data.top_categories.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.top_categories} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="category_name" stroke="#64748b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                borderColor: "#334155",
                                borderRadius: "8px",
                                fontSize: "11px",
                                color: "#fff",
                              }}
                            />
                            <Bar dataKey="total_revenue" name="Revenue ($)" radius={[6, 6, 0, 0]}>
                              {data.top_categories.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500">
                          No category revenue recorded yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Segments Chart */}
                  <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          Customer RFM Segments (KMeans)
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Machine learning partition of shopper population</p>
                      </div>
                    </div>

                    <div className="h-64 w-full">
                      {data.customer_segments.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.customer_segments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="segment" stroke="#64748b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                borderColor: "#334155",
                                borderRadius: "8px",
                                fontSize: "11px",
                                color: "#fff",
                              }}
                            />
                            <Bar dataKey="count" name="Customers" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="avg_spending" name="Avg Spend ($)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500">
                          Insufficient customer data for segmentation.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Products Table */}
                <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Top Performing Platform Products
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Ranked by actual gross revenue</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-3">Product</th>
                          <th className="py-3 px-3">Merchant</th>
                          <th className="py-3 px-3 text-right">Price</th>
                          <th className="py-3 px-3 text-center">Stock</th>
                          <th className="py-3 px-3 text-right">Units Sold</th>
                          <th className="py-3 px-3 text-right">Gross Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {data.top_products.map((p) => (
                          <tr key={p.product_id} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-3">
                              <span className="font-semibold text-white block max-w-xs truncate" title={p.title}>
                                {p.title}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">ID: {p.product_id}</span>
                            </td>
                            <td className="py-3 px-3 text-slate-300">{p.seller_name}</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-200">${p.price.toFixed(2)}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                                {p.stock_quantity}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-white">{p.units_sold}</td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                              ${p.total_revenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Recommendation Engine Telemetry Box */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-cyan-950/30 border border-indigo-800/40 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">AI Recommendation Statistics & Machine Learning Health</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Architecture</span>
                      <p className="text-xs font-bold text-cyan-300 truncate" title={data.ai_recommendation_stats.model_architecture}>
                        TF-IDF Recommender
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Catalog Embeddings</span>
                      <p className="text-lg font-bold text-white">
                        {data.ai_recommendation_stats.active_catalog_embeddings}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Modeled Events</span>
                      <p className="text-lg font-bold text-white">
                        {data.ai_recommendation_stats.tracked_interactions_modeled}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Served Inferences</span>
                      <p className="text-lg font-bold text-indigo-300">
                        {data.ai_recommendation_stats.recommendation_events_served}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Mean Cosine Sim</span>
                      <p className="text-lg font-bold text-emerald-400 font-mono">
                        {data.ai_recommendation_stats.mean_cosine_similarity}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Clustering</span>
                      <p className="text-xs font-bold text-purple-300 truncate" title={data.ai_recommendation_stats.clustering_algorithm}>
                        KMeans (RFM)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: USERS */}
            {activeTab === "users" && (
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Registered Platform Accounts</h3>
                  <span className="text-xs text-slate-400">{data.users.length} accounts</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3">User ID</th>
                        <th className="py-3 px-3">Name</th>
                        <th className="py-3 px-3">Email</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {data.users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-3 font-mono text-slate-400">{u.id}</td>
                          <td className="py-3 px-3 font-semibold text-white">{u.name}</td>
                          <td className="py-3 px-3 text-slate-300">{u.email}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                u.role === "admin"
                                  ? "bg-red-950 text-red-300 border border-red-800"
                                  : u.role === "seller"
                                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 font-mono">{u.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: SELLERS */}
            {activeTab === "sellers" && (
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Merchant Stores & Performance</h3>
                  <span className="text-xs text-slate-400">{data.seller_performance.length} registered merchants</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3">Store Name</th>
                        <th className="py-3 px-3">Seller ID</th>
                        <th className="py-3 px-3 text-center">Products</th>
                        <th className="py-3 px-3 text-right">Units Sold</th>
                        <th className="py-3 px-3 text-right">Revenue</th>
                        <th className="py-3 px-3 text-center">Rating</th>
                        <th className="py-3 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {data.seller_performance.map((s) => (
                        <tr key={s.seller_id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-3 font-semibold text-white">{s.store_name}</td>
                          <td className="py-3 px-3 font-mono text-slate-400">{s.seller_id}</td>
                          <td className="py-3 px-3 text-center font-mono">{s.products_count}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-white">{s.units_sold}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                            ${s.total_revenue.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-center text-amber-400 font-semibold">{s.rating} ★</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: PRODUCTS */}
            {activeTab === "products" && (
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Full Platform Catalog</h3>
                  <span className="text-xs text-slate-400">{data.products.length} catalog items</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3">Title</th>
                        <th className="py-3 px-3">SKU</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3 text-right">Price</th>
                        <th className="py-3 px-3 text-center">Stock</th>
                        <th className="py-3 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {data.products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-3 font-semibold text-white max-w-xs truncate">{p.title}</td>
                          <td className="py-3 px-3 font-mono text-slate-400">{p.sku}</td>
                          <td className="py-3 px-3 text-slate-300">{p.category_name || "General"}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-200">
                            ${Number(p.price).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                p.stock_quantity <= 5
                                  ? "bg-red-950 text-red-300 border border-red-800"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {p.stock_quantity}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                              {p.status || "published"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: ORDERS */}
            {activeTab === "orders" && (
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Platform Customer Orders</h3>
                  <span className="text-xs text-slate-400">{data.orders.length} total orders</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3">Order Number</th>
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3 text-center">Items</th>
                        <th className="py-3 px-3 text-right">Amount</th>
                        <th className="py-3 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {data.orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-3 font-mono font-semibold text-white">
                            {o.order_number || o.id.slice(0, 8)}
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {o.customer_name || o.shipping_address?.full_name || "Customer"}
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono">
                            {o.created_at?.slice(0, 10) || "Recent"}
                          </td>
                          <td className="py-3 px-3 text-center font-mono">{o.items?.length || 1}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                            ${Number(o.total_amount).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: CATEGORIES & MANAGEMENT */}
            {activeTab === "categories" && (
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-cyan-400" />
                      Platform Taxonomy & Categories ({data.categories.length})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure merchandise categories used for search indexing and content-based AI recommendations.
                    </p>
                  </div>

                  <Button
                    onClick={() => setShowAddCatModal(true)}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Category</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {data.categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{cat.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">#{cat.display_order || 1}</span>
                      </div>
                      <div className="text-[11px] font-mono text-cyan-400">/{cat.slug}</div>
                      <p className="text-xs text-slate-400 line-clamp-2">{cat.description || "Active catalog category"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal: Add Category */}
        {showAddCatModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
              <div>
                <h3 className="text-lg font-bold text-white">Create Platform Category</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adds a new taxonomy tier for product indexing and AI embeddings.
                </p>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category Name</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => handleAutoSlug(e.target.value)}
                    placeholder="e.g. Brain-Computer Interfaces"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Slug URL Identifier</label>
                  <input
                    type="text"
                    required
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="e.g. brain-computer-interfaces"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Describe the product hardware scope in this category..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCatModal(false)}
                    className="border-slate-800 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submittingCat}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    {submittingCat ? "Creating..." : "Save Category"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
