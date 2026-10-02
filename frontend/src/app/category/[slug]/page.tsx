"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  SlidersHorizontal,
  Star,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  fetchProducts,
  fetchCategories,
  Product,
  Category,
} from "@/lib/api/products";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug as string);

  const [category, setCategory] = React.useState<Category | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [sortBy, setSortBy] = React.useState<string>("newest");
  const [minPrice, setMinPrice] = React.useState<string>("");
  const [maxPrice, setMaxPrice] = React.useState<string>("");
  const [minRating, setMinRating] = React.useState<string>("0");
  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [totalCount, setTotalCount] = React.useState<number>(0);

  // Load category meta
  React.useEffect(() => {
    async function loadCategoryMeta() {
      const cats = await fetchCategories();
      const matched = cats.find((c) => c.slug === slug || c.id === slug);
      if (matched) {
        setCategory(matched);
      } else {
        setCategory({
          id: slug,
          name: slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          slug,
          display_order: 1,
          is_active: true,
        });
      }
    }
    loadCategoryMeta();
  }, [slug]);

  // Load products
  const loadCategoryProducts = React.useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const minP = minPrice ? parseFloat(minPrice) : undefined;
      const maxP = maxPrice ? parseFloat(maxPrice) : undefined;
      const minR = minRating && minRating !== "0" ? parseFloat(minRating) : undefined;

      const res = await fetchProducts({
        category: slug,
        sortBy,
        minPrice: minP,
        maxPrice: maxP,
        minRating: minR,
        page,
        pageSize: 12,
      });

      setProducts(res.items);
      setTotalPages(res.total_pages);
      setTotalCount(res.total);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load products";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [slug, sortBy, minPrice, maxPrice, minRating, page]);

  React.useEffect(() => {
    loadCategoryProducts();
  }, [loadCategoryProducts]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white transition">Categories</Link>
          <span>/</span>
          <span className="text-cyan-400 font-medium">{category?.name || slug}</span>
        </div>

        {/* Category Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 p-8 sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 via-slate-950/80 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <Badge variant="cyan" className="text-xs">
              Category Showcase
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {category?.name || slug}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {category?.description ||
                "Browse our curated collection of enterprise hardware, verified acoustics, and intelligent accessories."}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              {totalCount} products currently in stock
            </p>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Sort by:</span>
            <Select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9 bg-slate-950 border-slate-800 w-44"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Rating:</span>
            <Select
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9 bg-slate-950 border-slate-800 w-36"
            >
              <option value="0">All Ratings</option>
              <option value="4.5">4.5★ & Above</option>
              <option value="4.0">4.0★ & Above</option>
              <option value="3.5">3.5★ & Above</option>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load category products"
            message={error}
            onRetry={loadCategoryProducts}
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products in this category yet"
            description="Check back soon as new verified merchants publish listings for this category."
            actionLabel="View All Products"
            onAction={() => router.push("/products")}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, idx) => (
              <ProductCard key={p.id} product={p} priority={idx < 4} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
