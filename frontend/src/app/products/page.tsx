"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Package,
  Store,
  RefreshCw,
  X,
  Tag,
  DollarSign,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
import { trackInteraction } from "@/lib/api/interactions";


function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = React.useState<string>(
    searchParams.get("category") || "all"
  );
  const [searchTerm, setSearchTerm] = React.useState<string>(
    searchParams.get("search") || ""
  );
  const [activeSearch, setActiveSearch] = React.useState<string>(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = React.useState<string>(
    searchParams.get("sort_by") || "newest"
  );
  const [minPrice, setMinPrice] = React.useState<string>("");
  const [maxPrice, setMaxPrice] = React.useState<string>("");
  const [minRating, setMinRating] = React.useState<string>("0");
  const [dealsOnly, setDealsOnly] = React.useState<boolean>(
    searchParams.get("deals") === "true"
  );

  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = React.useState<boolean>(false);

  // Sync category param if url changes
  React.useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const deals = searchParams.get("deals");
    if (deals === "true") setDealsOnly(true);
  }, [searchParams]);

  // Load categories
  React.useEffect(() => {
    async function loadCategories() {
      const cats = await fetchCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

  // Fetch products based on active filters
  const loadProducts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const minP = minPrice ? parseFloat(minPrice) : undefined;
      const maxP = maxPrice ? parseFloat(maxPrice) : undefined;
      const minR = minRating && minRating !== "0" ? parseFloat(minRating) : undefined;

      const res = await fetchProducts({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        search: activeSearch || undefined,
        sortBy,
        minPrice: minP,
        maxPrice: maxP,
        minRating: minR,
        dealsOnly: dealsOnly || undefined,
        page,
        pageSize: 12,
      });

      setProducts(res.items);
      setTotalPages(res.total_pages);
      setTotalCount(res.total);

      // Track search interaction if user submitted a search query
      if (activeSearch && activeSearch.trim()) {
        trackInteraction({
          interaction_type: "search",
          search_query: activeSearch.trim(),
          metadata: { results_count: res.total },
        });
      }

      // Track category_view interaction if category is filtered
      if (selectedCategory && selectedCategory !== "all") {
        trackInteraction({
          interaction_type: "category_view",
          category_id: selectedCategory,
          metadata: { category: selectedCategory },
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load products";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, activeSearch, sortBy, minPrice, maxPrice, minRating, dealsOnly, page]);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSearchTerm("");
    setActiveSearch("");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("0");
    setDealsOnly(false);
    setPage(1);
  };

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (activeSearch ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (minRating !== "0" ? 1 : 0) +
    (dealsOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* Marketplace Catalog Header Banner */}
        <section className="relative border-b border-slate-800 bg-slate-900/40 py-10 sm:py-14 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(6,182,212,0.12),transparent_70%)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="cyan" className="text-xs">
                    Marketplace Catalog
                  </Badge>
                  {dealsOnly && (
                    <Badge variant="success" className="text-xs">
                      Deals Active
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Explore Products & Hardware
                </h1>
                <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl">
                  Discover verified electronics, adaptive workstations, acoustics, and neural co-processors with real-time stock and transparent pricing.
                </p>
              </div>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 w-full md:w-96"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search title, brand, SKU..."
                    className="pl-9 bg-slate-900/90 border-slate-700/80 text-sm"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setActiveSearch("");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <Button type="submit" variant="primary" size="sm" className="shrink-0">
                  Search
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Catalog Main Layout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0 space-y-6">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-sm text-white">Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleClearFilters}
                      className="text-xs text-slate-400 hover:text-cyan-300 transition"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Categories Filter */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Category
                  </label>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                        selectedCategory === "all"
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      }`}
                    >
                      <span>All Categories</span>
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                          selectedCategory === cat.slug || selectedCategory === cat.id
                            ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="pt-4 border-t border-slate-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Price Range ($)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPage(1);
                      }}
                      className="text-xs h-9 bg-slate-950/70 border-slate-800"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPage(1);
                      }}
                      className="text-xs h-9 bg-slate-950/70 border-slate-800"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="pt-4 border-t border-slate-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Minimum Rating
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { val: "0", label: "Any Rating" },
                      { val: "4.5", label: "4.5★ & Above" },
                      { val: "4.0", label: "4.0★ & Above" },
                      { val: "3.5", label: "3.5★ & Above" },
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => {
                          setMinRating(item.val);
                          setPage(1);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
                          minRating === item.val
                            ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                      >
                        {item.val !== "0" && (
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        )}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deals Only Toggle */}
                <div className="pt-4 border-t border-slate-800">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-slate-300">
                      Discounts & Deals Only
                    </span>
                    <input
                      type="checkbox"
                      checked={dealsOnly}
                      onChange={(e) => {
                        setDealsOnly(e.target.checked);
                        setPage(1);
                      }}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                    />
                  </label>
                </div>
              </div>
            </aside>

            {/* Catalog Main Content */}
            <div className="flex-1 space-y-6">
              {/* Controls Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">
                    {loading ? "Searching..." : `${totalCount} Products Found`}
                  </span>
                  {activeSearch && (
                    <span className="text-cyan-400 truncate max-w-[200px]">
                      for &ldquo;{activeSearch}&rdquo;
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Mobile Filters Toggle Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="lg:hidden text-xs gap-1.5"
                    onClick={() => setShowMobileFilters(true)}
                    leftIcon={<Filter className="w-3.5 h-3.5 text-cyan-400" />}
                  >
                    <span>Filters ({activeFiltersCount})</span>
                  </Button>

                  {/* Sort By Select */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
                    <Select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                      className="text-xs h-9 bg-slate-950 border-slate-800 w-36 sm:w-44"
                    >
                      <option value="newest">Newest Arrivals</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="discount">Biggest Discount</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <ErrorState
                  title="Unable to load catalog"
                  message={error}
                  onRetry={loadProducts}
                />
              ) : products.length === 0 ? (
                <EmptyState
                  title="No products match your criteria"
                  description="Try adjusting your category selection, price range, or search keyword to discover other items."
                  actionLabel="Reset Filters"
                  onAction={handleClearFilters}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((p, idx) => (
                    <ProductCard key={p.id} product={p} priority={idx < 3} />
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                  <p className="text-xs text-slate-400">
                    Showing page <span className="font-semibold text-white">{page}</span> of{" "}
                    <span className="font-semibold text-white">{totalPages}</span>
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      leftIcon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => {
                        setPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Mobile Filters Drawer / Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="relative w-full max-w-xs bg-slate-900 border-l border-slate-800 p-6 h-full overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-bold text-white text-base">Filter Catalog</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Category
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                      selectedCategory === "all"
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                        selectedCategory === cat.slug
                          ? "bg-cyan-500/20 text-cyan-300"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price */}
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Price ($)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="text-xs"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Mobile Rating */}
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Minimum Rating
                </label>
                <div className="space-y-1">
                  {["0", "4.5", "4.0", "3.5"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
                        minRating === r ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400"
                      }`}
                    >
                      {r === "0" ? "Any Rating" : `${r}★ & Above`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-xs text-slate-400"
                  onClick={() => {
                    handleClearFilters();
                    setShowMobileFilters(false);
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsCatalogPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        </div>
      }
    >
      <ProductsCatalogContent />
    </React.Suspense>
  );
}
