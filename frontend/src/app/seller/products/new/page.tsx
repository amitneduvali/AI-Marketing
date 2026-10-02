"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  X,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SellerNav } from "@/components/seller/seller-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  createProduct,
  fetchCategories,
  Category,
  ProductInput,
} from "@/lib/api/products";

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  // Form Fields
  const [title, setTitle] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [compareAtPrice, setCompareAtPrice] = React.useState("");
  const [stockQuantity, setStockQuantity] = React.useState("15");
  const [status, setStatus] = React.useState<"published" | "draft">("published");
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [description, setDescription] = React.useState("");

  // Images
  const [imageUrls, setImageUrls] = React.useState<string[]>([
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = React.useState("");

  // Specifications
  const [specs, setSpecs] = React.useState<Array<{ key: string; value: string }>>([
    { key: "Warranty", value: "2 Years Comprehensive" },
    { key: "Connectivity", value: "USB-C / Wireless" },
  ]);
  const [specKey, setSpecKey] = React.useState("");
  const [specVal, setSpecVal] = React.useState("");

  React.useEffect(() => {
    async function load() {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (e) {
        console.error("Failed to load categories", e);
      } finally {
        setLoadingCats(false);
      }
    }
    load();
  }, []);

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpec = () => {
    if (specKey.trim() && specVal.trim()) {
      setSpecs((prev) => [...prev, { key: specKey.trim(), value: specVal.trim() }]);
      setSpecKey("");
      setSpecVal("");
    }
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({ title: "Validation Error", description: "Title is required", variant: "error" });
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      toast({ title: "Validation Error", description: "Valid price is required", variant: "error" });
      return;
    }
    const numStock = parseInt(stockQuantity, 10);
    if (isNaN(numStock) || numStock < 0) {
      toast({ title: "Validation Error", description: "Valid stock quantity is required", variant: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const specMap: Record<string, string> = {};
      specs.forEach((s) => {
        if (s.key && s.value) specMap[s.key] = s.value;
      });

      const payload: ProductInput = {
        title: title.trim(),
        category_id: categoryId || undefined,
        description: description.trim() || undefined,
        brand: brand.trim() || undefined,
        price: numPrice,
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        sku: sku.trim() || undefined,
        stock_quantity: numStock,
        status,
        is_featured: isFeatured,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        specifications: Object.keys(specMap).length > 0 ? specMap : undefined,
        tags: [brand, "hardware", "store"].filter(Boolean) as string[],
      };

      const res = await createProduct(payload);
      if (!res.success || !res.product) {
        throw new Error(res.error || "Failed to create product");
      }
      toast({
        title: "Product Published!",
        description: `"${res.product.title}" has been saved to the database.`,
        variant: "default",
      });
      router.push("/seller/products");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create product";
      toast({
        title: "Creation Error",
        description: msg,
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <SellerNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Link
              href="/seller/products"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Products
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-semibold text-cyan-400">Add New Listing</span>
          </div>

          <Badge variant="cyan" className="text-xs">
            Live Database Persistence
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Core Details */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              General Product Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Product Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Apex Ultra-Precision Neural Headset"
                  required
                  className="bg-slate-950 border-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Category *
                  </label>
                  <Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    disabled={loadingCats}
                    className="bg-slate-950 border-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Brand / Manufacturer
                  </label>
                  <Input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Apex Dynamics"
                    className="bg-slate-950 border-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Provide an engineering summary, key architectural capabilities, and product specs..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Pricing & Inventory */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Pricing & Inventory Controls
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Retail Price ($) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="249.00"
                  required
                  className="bg-slate-950 border-slate-800 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Compare at Price ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="299.00"
                  className="bg-slate-950 border-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  SKU (Stock Keeping Unit)
                </label>
                <Input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. APX-AUD-99"
                  className="bg-slate-950 border-slate-800 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Initial Stock Quantity *
                </label>
                <Input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800 text-sm font-semibold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Items with &le; 5 units trigger low-stock alerts.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Publication Status
                </label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "published" | "draft")}
                  options={[
                    { value: "published", label: "Published (Live in Store)" },
                    { value: "draft", label: "Draft (Hidden)" },
                  ]}
                  className="bg-slate-950 border-slate-800 text-sm"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4 bg-slate-950"
                  />
                  <span className="text-xs font-medium text-slate-300">
                    Feature on Marketplace Home
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 3: Media Gallery */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Product Images
            </h2>

            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste high-res image URL (e.g. Unsplash or Cloud storage)..."
                className="bg-slate-950 border-slate-800 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddImage}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Image
              </Button>
            </div>

            {/* Gallery Previews */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Preview ${idx}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-rose-400 hover:bg-rose-950/80 transition"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-[10px] font-bold text-cyan-300">
                      Thumbnail
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Technical Specifications */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Technical Specifications
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                placeholder="Spec Key (e.g. Battery Life)"
                className="bg-slate-950 border-slate-800 text-xs"
              />
              <Input
                value={specVal}
                onChange={(e) => setSpecVal(e.target.value)}
                placeholder="Spec Value (e.g. 38 Hours)"
                className="bg-slate-950 border-slate-800 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSpec}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="shrink-0"
              >
                Add Spec
              </Button>
            </div>

            {specs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {specs.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="text-slate-400 font-medium">{item.key}: </span>
                      <span className="text-white font-semibold">{item.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="text-slate-500 hover:text-rose-400 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
            <Link href="/seller/products">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={submitting}
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="shadow-xl shadow-cyan-500/20"
            >
              {submitting ? "Publishing to Database..." : "Publish Product Listing"}
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
