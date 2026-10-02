"use client";

import * as React from "react";
import Link from "next/link";
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Search,
  Filter,
  Save,
  RotateCcw,
  DollarSign,
  TrendingDown,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SellerNav } from "@/components/seller/seller-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import {
  fetchSellerInventory,
  updateInventoryStock,
} from "@/lib/api/seller";
import { Product } from "@/lib/api/products";

export default function SellerInventoryPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Local draft quantities for instant editing
  const [stockDrafts, setStockDrafts] = React.useState<Record<string, number>>({});
  const [savingId, setSavingId] = React.useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterLevel, setFilterLevel] = React.useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");

  const loadInventory = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSellerInventory();
      setItems(data);
      const drafts: Record<string, number> = {};
      data.forEach((p) => {
        drafts[p.id] = p.stock_quantity;
      });
      setStockDrafts(drafts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load inventory";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleAdjustDraft = (productId: string, delta: number) => {
    setStockDrafts((prev) => {
      const current = prev[productId] !== undefined ? prev[productId] : 0;
      return { ...prev, [productId]: Math.max(0, current + delta) };
    });
  };

  const handleDraftChange = (productId: string, value: string) => {
    const num = parseInt(value, 10);
    setStockDrafts((prev) => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleSaveStock = async (productId: string) => {
    const newStock = stockDrafts[productId];
    if (newStock === undefined) return;

    setSavingId(productId);
    try {
      const updated = await updateInventoryStock(productId, newStock);
      setItems((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      setStockDrafts((prev) => ({ ...prev, [productId]: updated.stock_quantity }));
      toast({
        title: "Stock Updated",
        description: `Inventory for "${updated.title}" set to ${updated.stock_quantity} units.`,
        variant: "default",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update stock";
      toast({
        title: "Update Error",
        description: msg,
        variant: "error",
      });
    } finally {
      setSavingId(null);
    }
  };

  // Metrics calculations from real database records
  const totalUnits = items.reduce((sum, p) => sum + p.stock_quantity, 0);
  const totalValuation = items.reduce((sum, p) => sum + Number(p.price) * p.stock_quantity, 0);
  const lowStockCount = items.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
  const outOfStockCount = items.filter((p) => p.stock_quantity === 0).length;
  const inStockCount = items.filter((p) => p.stock_quantity > 5).length;

  const filteredItems = items.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesLevel = true;
    if (filterLevel === "in_stock") matchesLevel = p.stock_quantity > 5;
    else if (filterLevel === "low_stock") matchesLevel = p.stock_quantity > 0 && p.stock_quantity <= 5;
    else if (filterLevel === "out_of_stock") matchesLevel = p.stock_quantity === 0;

    return matchesSearch && matchesLevel;
  });

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
                Real-Time Stock Depletion & Allocation
              </Badge>
              <span className="text-xs text-slate-400">PostgreSQL Store</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Inventory & Warehouse Management
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Live stock levels adjust automatically with checkouts. Update on-hand quantities instantly below.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadInventory}
            leftIcon={<RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
            className="text-xs"
          >
            Sync Inventory
          </Button>
        </div>

        {/* 4 Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Units */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total On-Hand Units</span>
            <div className="text-2xl font-black text-white">{totalUnits}</div>
            <p className="text-[11px] text-slate-500">Across {items.length} unique catalog items</p>
          </div>

          {/* In Stock */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Healthy Stock (&gt;5)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{inStockCount}</div>
            <p className="text-[11px] text-emerald-500/80">Available for customer checkout</p>
          </div>

          {/* Low Stock Alerts */}
          <div className={`p-5 rounded-2xl border space-y-1 ${
            lowStockCount > 0 ? "bg-amber-950/20 border-amber-800/60" : "bg-slate-900/60 border-slate-800"
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Low-Stock Warnings (&le;5)</span>
              <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? "text-amber-400" : "text-slate-500"}`} />
            </div>
            <div className={`text-2xl font-black ${lowStockCount > 0 ? "text-amber-400" : "text-white"}`}>
              {lowStockCount}
            </div>
            <p className="text-[11px] text-amber-400/80">Needs warehouse restocking</p>
          </div>

          {/* Out of Stock */}
          <div className={`p-5 rounded-2xl border space-y-1 ${
            outOfStockCount > 0 ? "bg-rose-950/20 border-rose-800/60" : "bg-slate-900/60 border-slate-800"
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Out of Stock (0)</span>
              <XCircle className={`w-4 h-4 ${outOfStockCount > 0 ? "text-rose-400" : "text-slate-500"}`} />
            </div>
            <div className={`text-2xl font-black ${outOfStockCount > 0 ? "text-rose-400" : "text-white"}`}>
              {outOfStockCount}
            </div>
            <p className="text-[11px] text-rose-400/80">Prevents checkout until restocked</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product title or SKU..."
              className="pl-10 text-xs bg-slate-950 border-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-medium shrink-0">Level:</span>
            <Select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as any)}
              options={[
                { value: "all", label: `All Items (${items.length})` },
                { value: "in_stock", label: `Healthy Stock (${inStockCount})` },
                { value: "low_stock", label: `Low Stock (${lowStockCount})` },
                { value: "out_of_stock", label: `Out of Stock (${outOfStockCount})` },
              ]}
              className="text-xs bg-slate-950 border-slate-800 w-48"
            />
          </div>
        </div>

        {/* Inventory Items List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <Skeleton className="h-6 w-52" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState title="Failed to load inventory" message={error} onRetry={loadInventory} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No matching inventory"
            description="No items match your active inventory filter."
            actionLabel="Reset Filter"
            onAction={() => setFilterLevel("all")}
          />
        ) : (
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Product</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                    <th className="py-3.5 px-4">Current Units</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Quick Stock Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredItems.map((p) => {
                    const currentDraft = stockDrafts[p.id] !== undefined ? stockDrafts[p.id] : p.stock_quantity;
                    const hasChanged = currentDraft !== p.stock_quantity;
                    const isLow = p.stock_quantity <= 5 && p.stock_quantity > 0;
                    const isOut = p.stock_quantity === 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition">
                        {/* Product Info */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                p.images?.[0] ||
                                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                              }
                              alt={p.title}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                            />
                            <div className="min-w-0 max-w-xs sm:max-w-md">
                              <Link
                                href={`/products/${p.id}`}
                                target="_blank"
                                className="font-semibold text-white hover:text-cyan-300 transition block truncate text-sm"
                              >
                                {p.title}
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                <span>SKU: {p.sku || "N/A"}</span>
                                {p.category_name && <span>• {p.category_name}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-white text-sm">
                            ${Number(p.price).toFixed(2)}
                          </span>
                        </td>

                        {/* Stock Badge */}
                        <td className="py-4 px-4">
                          {isOut ? (
                            <Badge variant="destructive" className="text-[10px]">
                              Out of Stock
                            </Badge>
                          ) : isLow ? (
                            <Badge variant="warning" className="text-[10px]">
                              Low Stock (&le;5)
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px]">
                              In Stock
                            </Badge>
                          )}
                        </td>

                        {/* Current DB Stock */}
                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-sm text-slate-200">
                            {p.stock_quantity}
                          </span>
                        </td>

                        {/* Adjustment Controls */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Step buttons */}
                            <button
                              onClick={() => handleAdjustDraft(p.id, -5)}
                              className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 hover:text-white hover:border-slate-700 transition"
                              title="Decrease by 5"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => handleAdjustDraft(p.id, -1)}
                              className="p-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                              title="Decrease by 1"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            {/* Direct Input */}
                            <input
                              type="number"
                              min="0"
                              value={currentDraft}
                              onChange={(e) => handleDraftChange(p.id, e.target.value)}
                              className="w-16 h-8 text-center text-xs font-bold font-mono rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                            />

                            <button
                              onClick={() => handleAdjustDraft(p.id, 1)}
                              className="p-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                              title="Increase by 1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleAdjustDraft(p.id, 5)}
                              className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 hover:text-white hover:border-slate-700 transition"
                              title="Increase by 5"
                            >
                              +5
                            </button>

                            {/* Save Button */}
                            <Button
                              variant={hasChanged ? "primary" : "outline"}
                              size="sm"
                              disabled={!hasChanged || savingId === p.id}
                              onClick={() => handleSaveStock(p.id)}
                              leftIcon={<Save className="w-3.5 h-3.5" />}
                              className="text-xs ml-1"
                            >
                              {savingId === p.id ? "Saving..." : "Save"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
