"use client";

import * as React from "react";
import Link from "next/link";
import {
  Store,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  UploadCloud,
  X,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Layers,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useToast } from "@/components/ui/toast";
import {
  fetchSellerProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  Product,
  Category,
  ProductInput,
} from "@/lib/api/products";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  // Form Fields
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [compareAtPrice, setCompareAtPrice] = React.useState("");
  const [stockQuantity, setStockQuantity] = React.useState("10");
  const [status, setStatus] = React.useState<"draft" | "published" | "archived">("published");
  const [description, setDescription] = React.useState("");
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = React.useState("");
  const [specKey, setSpecKey] = React.useState("");
  const [specValue, setSpecValue] = React.useState("");
  const [specifications, setSpecifications] = React.useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // Load categories and products
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

  // Open modal for Adding
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setTitle("");
    setCategory(categories[0]?.id || "");
    setBrand(user?.storeName || "Apex Dynamics");
    setSku(`SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    setPrice("199.00");
    setCompareAtPrice("");
    setStockQuantity("15");
    setStatus("published");
    setDescription("");
    setImageUrls([
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    ]);
    setSpecifications({
      "Material": "Anodized Aerospace Aluminum",
      "Warranty": "2 Years Official Coverage",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setCategory(p.category_id || categories[0]?.id || "");
    setBrand(p.brand || "");
    setSku(p.sku || "");
    setPrice(String(p.price));
    setCompareAtPrice(p.compare_at_price ? String(p.compare_at_price) : "");
    setStockQuantity(String(p.stock_quantity));
    setStatus(p.status);
    setDescription(p.description || "");
    setImageUrls(p.images?.length > 0 ? p.images : []);
    setSpecifications(p.specifications || {});
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Add specification pair
  const handleAddSpec = () => {
    if (!specKey.trim() || !specValue.trim()) return;
    setSpecifications({ ...specifications, [specKey.trim()]: specValue.trim() });
    setSpecKey("");
    setSpecValue("");
  };

  // Remove specification pair
  const handleRemoveSpec = (key: string) => {
    const copy = { ...specifications };
    delete copy[key];
    setSpecifications(copy);
  };

  // Upload image to Supabase Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const res = await uploadProductImage(file);
    setUploadingImage(false);

    if (res.success && res.url) {
      setImageUrls((prev) => [...prev, res.url!]);
      toast({
        title: "Image Uploaded",
        description: "Image successfully processed for product card.",
        variant: "success",
      });
    } else {
      toast({
        title: "Upload Failed",
        description: res.error || "Could not upload image.",
        variant: "error",
      });
    }
  };

  // Add image by URL
  const handleAddCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setImageUrls([...imageUrls, customImageUrl.trim()]);
    setCustomImageUrl("");
  };

  // Remove image from list
  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim() || title.length < 2) {
      errors.title = "Product title must be at least 2 characters.";
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.price = "Price must be a valid positive number.";
    }
    if (compareAtPrice) {
      const numCompare = parseFloat(compareAtPrice);
      if (isNaN(numCompare) || numCompare < 0) {
        errors.compareAtPrice = "Discount compare price must be a valid number.";
      }
    }
    const numStock = parseInt(stockQuantity, 10);
    if (isNaN(numStock) || numStock < 0) {
      errors.stockQuantity = "Stock quantity must be 0 or greater.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    const productPayload: ProductInput = {
      title,
      category_id: category || undefined,
      brand,
      sku,
      price: parseFloat(price),
      compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      stock_quantity: parseInt(stockQuantity, 10),
      status,
      description,
      images: imageUrls,
      specifications,
      attributes: { brand, ...specifications },
      tags: [brand.toLowerCase(), title.toLowerCase().split(" ")[0]],
    };

    if (editingProduct) {
      // Edit mode
      const result = await updateProduct(editingProduct.id, productPayload);
      setSaving(false);
      if (result.success && result.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? result.product! : p))
        );
        setIsModalOpen(false);
        toast({
          title: "Product Updated",
          description: `Successfully modified ${result.product.title}.`,
          variant: "success",
        });
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Could not update product.",
          variant: "error",
        });
      }
    } else {
      // Create mode
      const result = await createProduct(productPayload);
      setSaving(false);
      if (result.success && result.product) {
        setProducts((prev) => [result.product!, ...prev]);
        setIsModalOpen(false);
        toast({
          title: "Product Published",
          description: `Added ${result.product.title} to your store catalog.`,
          variant: "success",
        });
      } else {
        toast({
          title: "Creation Failed",
          description: result.error || "Could not publish product.",
          variant: "error",
        });
      }
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setSaving(true);
    const result = await deleteProduct(productToDelete.id);
    setSaving(false);
    setIsDeleteModalOpen(false);

    if (result.success) {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast({
        title: "Product Removed",
        description: `${productToDelete.title} has been removed from marketplace.`,
        variant: "info",
      });
    } else {
      toast({
        title: "Deletion Error",
        description: result.error || "Could not delete product.",
        variant: "error",
      });
    }
    setProductToDelete(null);
  };

  // Filter products list
  const filteredProducts = products.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <RoleGuard allowedRoles={["SELLER", "ADMIN"]}>
      <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col selection:bg-indigo-500/20">
        <Navbar />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="ai">Merchant Cockpit</Badge>
                <Badge variant="success">Verified Seller</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user?.storeName || "Merchant Storefront"} — Products
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Manage your marketplace catalog, inventory allocations, and pricing
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={handleOpenAddModal}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add New Product
              </Button>
            </div>
          </div>

          {/* Catalog Controls (Search & Filter) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search products by title, SKU, or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="bg-slate-950/80"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-700/80 bg-slate-950 px-3 pr-8 py-2 text-xs text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="all">All Products ({products.length})</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="archived">Archived</option>
              </select>

              <Button
                variant="secondary"
                size="sm"
                onClick={loadData}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : error ? (
            <ErrorState
              title="Failed to Load Merchant Products"
              description={error}
              onRetry={loadData}
            />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="No Products in Catalog"
              description={
                searchQuery
                  ? `No products matched "${searchQuery}".`
                  : "You haven't listed any products yet. Click 'Add New Product' to publish your first item."
              }
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAddModal}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create Your First Product
                </Button>
              }
            />
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">SKU / Brand</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Stock</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {filteredProducts.map((p) => {
                      const hasDiscount = p.compare_at_price && p.compare_at_price > p.price;
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition">
                          {/* Title & Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                                <img
                                  src={
                                    p.images?.[0] ||
                                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                                  }
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="max-w-xs">
                                <p className="font-semibold text-white truncate">{p.title}</p>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ID: {p.id.substring(0, 8)}...
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* SKU & Brand */}
                          <td className="py-3 px-4">
                            <p className="font-mono text-slate-300">{p.sku || "—"}</p>
                            <span className="text-[10px] text-slate-500">{p.brand || "—"}</span>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <Badge variant="secondary" className="text-[10px]">
                              {p.category_name || "Uncategorized"}
                            </Badge>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-bold text-white">${p.price.toFixed(2)}</span>
                              {hasDiscount && (
                                <span className="text-[10px] text-slate-500 line-through">
                                  ${p.compare_at_price!.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Stock Quantity */}
                          <td className="py-3 px-4">
                            {p.stock_quantity > 10 ? (
                              <Badge variant="success" dot className="text-[10px]">
                                {p.stock_quantity} in stock
                              </Badge>
                            ) : p.stock_quantity > 0 ? (
                              <Badge variant="warning" dot className="text-[10px]">
                                {p.stock_quantity} left
                              </Badge>
                            ) : (
                              <Badge variant="destructive" dot className="text-[10px]">
                                Out of stock
                              </Badge>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                p.status === "published"
                                  ? "success"
                                  : p.status === "draft"
                                  ? "warning"
                                  : "secondary"
                              }
                              className="text-[10px] uppercase font-mono"
                            >
                              {p.status}
                            </Badge>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link href={`/products/${p.id}`} target="_blank">
                                <button
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                                  title="View Public Page"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </Link>

                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="p-1.5 rounded-lg text-indigo-400 hover:text-white hover:bg-indigo-950/80 transition cursor-pointer"
                                title="Edit Product"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setProductToDelete(p);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950/80 transition cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        </main>

        {/* Modal: Add / Edit Product */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProduct ? "Edit Product Listing" : "Add New Product"}
          description="Configure product details, pricing, inventory stock, and specifications."
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleFormSubmit}
                isLoading={saving}
              >
                {editingProduct ? "Save Changes" : "Publish Product"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Title & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Product Title *"
                placeholder="e.g. Wireless Adaptive Headphones"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={formErrors.title}
                required
              />
              <Input
                label="Brand"
                placeholder="e.g. NeuralFlow Acoustics"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 text-xs text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Catalog Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-10 rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 text-xs text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="published">Published (Visible in Store)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Price, Compare Price, SKU & Stock Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Input
                label="Price ($) *"
                type="number"
                step="0.01"
                placeholder="199.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={formErrors.price}
                required
              />
              <Input
                label="Discount Price ($)"
                type="number"
                step="0.01"
                placeholder="249.00"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                error={formErrors.compareAtPrice}
                helperText="Original price"
              />
              <Input
                label="Stock Quantity *"
                type="number"
                step="1"
                placeholder="10"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                error={formErrors.stockQuantity}
                required
              />
              <Input
                label="SKU"
                placeholder="SKU-102"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Product Description
              </label>
              <textarea
                rows={3}
                placeholder="Comprehensive technical details, features, materials, and warranty information..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950 p-3.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>

            {/* Image Upload (Supabase Storage) */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300">
                Product Images (Supabase Storage)
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* File Upload Button */}
                <label className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-dashed border-indigo-500/50 bg-indigo-950/20 text-indigo-300 hover:bg-indigo-950/40 text-xs font-medium cursor-pointer transition">
                  <UploadCloud className="w-4 h-4" />
                  <span>{uploadingImage ? "Uploading..." : "Upload from Device"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                {/* Direct URL input */}
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    placeholder="Or paste direct image URL (https://...)"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="h-10 text-xs"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCustomImageUrl}
                    className="h-10 shrink-0"
                  >
                    Add URL
                  </Button>
                </div>
              </div>

              {/* Uploaded Images Thumbnails */}
              {imageUrls.length > 0 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pt-2">
                  {imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 group shrink-0"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-slate-950/80 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications Key-Value Builder */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300">
                Technical Specifications (Attributes)
              </label>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Key (e.g. Battery Life)"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  className="h-9 text-xs"
                />
                <Input
                  placeholder="Value (e.g. 40 hours)"
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddSpec}
                  className="h-9 shrink-0"
                >
                  Add Spec
                </Button>
              </div>

              {Object.keys(specifications).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(specifications).map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
                    >
                      <strong className="text-white">{k}:</strong> {v}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(k)}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </form>
        </Modal>

        {/* Modal: Delete Confirmation */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Marketplace Product"
          description={`Are you sure you want to permanently delete "${productToDelete?.title}"? This action cannot be undone.`}
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                isLoading={saving}
              >
                Confirm Delete
              </Button>
            </>
          }
        >
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300">
            Deleting this product will remove it from customer search, active carts, and merchant catalogs.
          </div>
        </Modal>

        <Footer />
      </div>
    </RoleGuard>
  );
}
