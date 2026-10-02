"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShoppingBag,
  Search,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Truck,
  Flame,
  Clock,
  Tag,
  Star,
  Layers,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/products/product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import {
  fetchProducts,
  fetchCategories,
  Product,
  Category,
} from "@/lib/api/products";
import {
  fetchPersonalizedRecommendations,
  RecommendedProductItem,
} from "@/lib/api/recommendations";
import { useAuth } from "@/context/auth-context";


export default function HomePage() {
  const router = useRouter();

  const { user } = useAuth();

  // Search input
  const [heroSearch, setHeroSearch] = React.useState("");

  // Real Database Queries State
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = React.useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = React.useState<Product[]>([]);
  const [dealProducts, setDealProducts] = React.useState<Product[]>([]);
  const [recommendations, setRecommendations] = React.useState<RecommendedProductItem[]>([]);
  const [isFallbackRec, setIsFallbackRec] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    async function loadMarketplaceHomeData() {
      setLoading(true);
      try {
        const [cats, featuredRes, trendingRes, newRes, dealsRes, recsRes] =
          await Promise.all([
            fetchCategories(),
            fetchProducts({ isFeatured: true, pageSize: 4 }),
            fetchProducts({ sortBy: "rating", pageSize: 4 }),
            fetchProducts({ sortBy: "newest", pageSize: 4 }),
            fetchProducts({ dealsOnly: true, sortBy: "discount", pageSize: 4 }),
            fetchPersonalizedRecommendations(user?.id, 4).catch(() => ({
              items: [],
              is_fallback: true,
              recommended_product_ids: [],
              model_name: "",
            })),
          ]);

        setCategories(cats);
        setFeaturedProducts(featuredRes.items);
        setTrendingProducts(trendingRes.items);
        setNewArrivals(newRes.items);
        setDealProducts(dealsRes.items);
        setRecommendations(recsRes.items || []);
        setIsFallbackRec(recsRes.is_fallback);
      } catch (err) {
        console.error("Failed to load marketplace homepage collections", err);
      } finally {
        setLoading(false);
      }
    }

    loadMarketplaceHomeData();
  }, [user?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/20">
      <Navbar />

      <main className="flex-1 space-y-16 sm:space-y-24 pb-24">
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-800/80 bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.18),transparent_70%)] pointer-events-none" />
          <div className="absolute -top-32 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Hardware & Verified Electronics Marketplace</span>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
                Curated Electronics &{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Intelligent Gear
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Connect directly with verified hardware merchants. Enjoy live inventory synchronization, transparent discount rates, and instant sandbox order tracking.
              </p>

              <div className="pt-2">
                <Link
                  href="/offers"
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/80 hover:border-cyan-600 text-xs font-semibold text-cyan-300 transition group shadow-lg shadow-cyan-950/40"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Personalized In-App Offers: AI-curated coupons for your account</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl"
              >
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search noise-cancelling audio, GPU workstations, bio-wearables..."
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none px-2"
                />
                <Button type="submit" variant="primary" size="sm" className="shrink-0 px-5">
                  Search Catalog
                </Button>
              </form>

              {/* Quick Suggestion Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
                <span className="text-slate-500">Popular:</span>
                {["Audio", "Workstations", "Edge AI", "Wearables"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => router.push(`/products?search=${encodeURIComponent(tag)}`)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 border-t border-slate-800/80 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left text-xs text-slate-400">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Verified Direct Sellers</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Free Shipping over $100</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-Time Inventory</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Instant Checkout Demo</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RECOMMENDED FOR YOU (AI ML CONTENT-BASED RECOMMENDER) */}
        {/* ========================================================================= */}
        {recommendations.length > 0 && (
          <section id="recommended" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-slate-900/50 to-slate-950 p-6 sm:p-10 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="cyan" className="text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      AI Recommendation Engine
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {isFallbackRec ? "Trending Signals" : "Personalized Vector Match"}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Recommended For You
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                    {isFallbackRec
                      ? "Top-performing electronics tailored to trending catalog velocity and customer ratings."
                      : "Personalized suggestions synthesized from your browsing clicks, cart selections, and category affinity."}
                  </p>
                </div>

                <Link
                  href="/products"
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group shrink-0"
                >
                  <span>Explore Full Catalog</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Grid of Recommended Products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {recommendations.map((rec) => (
                  <div key={rec.product.id} className="flex flex-col space-y-2">
                    <ProductCard product={rec.product} />
                    {/* ML Rationale Tag */}
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-cyan-300 truncate font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                        {rec.reason}
                      </span>
                      <span className="font-mono text-slate-400 font-bold shrink-0 ml-2">
                        {Math.round(rec.score * 100)}% match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* CATEGORIES SECTION */}
        {/* ========================================================================= */}
        <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Marketplace Taxonomy
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Shop by Hardware Category
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
            >
              <span>Explore All Categories</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative flex flex-col p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all duration-300 overflow-hidden"
              >
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      cat.image_url ||
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                    }
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                </div>
                <h3 className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {cat.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* DEALS SECTION */}
        {/* ========================================================================= */}
        {dealProducts.length > 0 && (
          <section id="deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-b from-rose-950/20 via-slate-900/40 to-slate-950 p-6 sm:p-10 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      Limited Time Offers
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Featured Deals & Price Drops
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Authentic manufacturer promotions with verified compare-at pricing.
                  </p>
                </div>
                <Link
                  href="/products?deals=true"
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 group"
                >
                  <span>View All Deals</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {dealProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* FEATURED PRODUCTS */}
        {/* ========================================================================= */}
        <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Staff Picks
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Featured Marketplace Products
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
            >
              <span>Explore Catalog</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* TRENDING PRODUCTS */}
        {/* ========================================================================= */}
        <section id="trending" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Customer Favorites
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Trending & Top Rated
              </h2>
            </div>
            <Link
              href="/products?sort_by=rating"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
            >
              <span>Browse Highest Rated</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* NEW ARRIVALS */}
        {/* ========================================================================= */}
        <section id="new-arrivals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Fresh Inventory
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/products?sort_by=newest"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
            >
              <span>View All New</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SELLER CTA BANNER */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-950 p-8 sm:p-12">
            <div className="max-w-2xl space-y-4">
              <Badge variant="ai" className="text-xs">
                Merchant Ecosystem
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Sell High-Performance Hardware on Gadgets World
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Publish products, manage multi-sku inventory, process customer orders, and track fulfillment in our merchant dashboard.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/seller/dashboard">
                  <Button variant="primary" size="md">
                    Seller Dashboard
                  </Button>
                </Link>
                <Link href="/seller/products">
                  <Button variant="outline" size="md">
                    Manage Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
