"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Boxes,
  Tag,
  Star,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SellerNav } from "@/components/seller/seller-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  fetchSellerProducts,
  fetchCategories,
  deleteProduct,
  Product,
  Category,
} from "@/lib/api/products";

export default function SellerProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedStatus, setSelectedStatus] = React.useState("all");

  // Delete modal state
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prodsRes] = await Promise.all([
        fetchCategories(),
        fetchSellerProducts(),
      ]);
      setCategories(cats);
      setProducts(prodsRes.items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load seller catalog";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast({
        title: "Product Deleted",
        description: `Successfully removed "${productToDelete.title}" from catalog.`,
        variant: "default",
      });
      setProductToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      toast({
        title: "Deletion Failed",
        description: msg,
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || p.category_id === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" || p.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

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
                Product Catalog
              </Badge>
              <span className="text-xs text-slate-400">
                {products.length} {products.length === 1 ? "Product" : "Products"} in Database
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Manage Products
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Add new SKUs, modify specifications, review stock status, and archive listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
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

        {/* Filter Controls */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, brand, or SKU..."
              className="pl-10 text-xs bg-slate-950 border-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="w-40">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                  { value: "all", label: "All Categories" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                className="text-xs bg-slate-950 border-slate-800"
              />
            </div>

            <div className="w-36">
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                  { value: "archived", label: "Archived" },
                ]}
                className="text-xs bg-slate-950 border-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load catalog"
            message={error}
            onRetry={loadData}
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            description={
              searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
                ? "No products match your active filter criteria."
                : "Your merchant catalog is currently empty. Add your first product to start selling."
            }
            actionLabel="Add Product"
            onAction={() => (window.location.href = "/seller/products/new")}
          />
        ) : (
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Inventory</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map((p) => {
                    const isLowStock = p.stock_quantity <= 5;
                    const isOutOfStock = p.stock_quantity === 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition">
                        {/* Title & Image */}
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
                                {p.brand && <span>• {p.brand}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 text-slate-300 font-medium">
                          {p.category_name || "General"}
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-white text-sm">
                            ${Number(p.price).toFixed(2)}
                          </span>
                          {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
                            <span className="text-[10px] text-slate-500 line-through block">
                              ${Number(p.compare_at_price).toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                isOutOfStock
                                  ? "text-rose-400 font-bold"
                                  : isLowStock
                                  ? "text-amber-400 font-bold"
                                  : "text-slate-200"
                              }`}
                            >
                              {p.stock_quantity} units
                            </span>
                            {isLowStock && (
                              <Badge variant="warning" className="text-[9px] py-0 px-1.5">
                                {isOutOfStock ? "Out of Stock" : "Low Stock"}
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              p.status === "published"
                                ? "success"
                                : p.status === "draft"
                                ? "warning"
                                : "outline"
                            }
                            className="text-[10px] uppercase font-mono"
                          >
                            {p.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/products/${p.id}`} target="_blank">
                              <button
                                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                                title="View in Catalog"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </Link>

                            <button
                              onClick={() => setProductToDelete(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          title="Confirm Product Deletion"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                Are you sure you want to permanently delete &quot;{productToDelete?.title}&quot;?
                This action will remove it from the catalog and cannot be undone.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Product"}
              </Button>
            </div>
          </div>
        </Modal>
      </main>

      <Footer />
    </div>
  );
}
