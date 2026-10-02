"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Heart,
  Store,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  MessageSquare,
  Send,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import {
  fetchProductById,
  submitProductReview,
  Product,
} from "@/lib/api/products";
import { trackInteraction } from "@/lib/api/interactions";


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const productId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [product, setProduct] = React.useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(1);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Review Form states
  const [reviewRating, setReviewRating] = React.useState<number>(5);
  const [reviewTitle, setReviewTitle] = React.useState<string>("");
  const [reviewComment, setReviewComment] = React.useState<string>("");
  const [submittingReview, setSubmittingReview] = React.useState<boolean>(false);

  const loadProduct = React.useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductById(productId);
      if (!data) {
        setError(`Product "${productId}" not found.`);
      } else {
        setProduct(data);
        setSelectedImage(data.images?.[0] || "");
        trackInteraction({
          user_id: user?.id,
          interaction_type: "product_view",
          product_id: data.id,
          category_id: data.category_id,
          metadata: { price: data.price, brand: data.brand },
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load product details";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [productId, user?.id]);

  React.useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlist(product);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!reviewComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please share a few words about your experience.",
        variant: "warning",
      });
      return;
    }

    setSubmittingReview(true);
    const result = await submitProductReview(
      product.id,
      reviewRating,
      reviewTitle || "Verified Purchase Review",
      reviewComment
    );
    setSubmittingReview(false);

    if (result.success && result.product) {
      setProduct(result.product);
      setReviewTitle("");
      setReviewComment("");
      toast({
        title: "Review Published",
        description: "Thank you for contributing verified feedback!",
        variant: "success",
      });
      trackInteraction({
        user_id: user?.id,
        interaction_type: "review",
        product_id: product.id,
        category_id: product.category_id,
        metadata: { rating: reviewRating },
      });
    } else {
      toast({
        title: "Review Failed",
        description: result.error || "Could not publish your review.",
        variant: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-1/2 rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-20">
          <ErrorState
            title="Product Not Found"
            description={error || "The requested marketplace product could not be located."}
            onRetry={() => router.push("/products")}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const savingsAmount = hasDiscount ? product.compare_at_price! - product.price : 0;
  const discountPercent = hasDiscount
    ? Math.round((savingsAmount / product.compare_at_price!) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col selection:bg-indigo-500/20">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white transition">Products</Link>
          <span>/</span>
          {product.category_name && (
            <>
              <span className="text-slate-300">{product.category_name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-indigo-400 truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Gallery Column */}
          <div className="space-y-4">
            <div className="relative w-full h-[440px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center">
              <img
                src={selectedImage || product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"}
                alt={product.title}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
                }}
              />

              {hasDiscount && (
                <div className="absolute top-4 left-4">
                  <Badge variant="success" className="text-xs font-bold px-3 py-1">
                    SAVE {discountPercent}% (${savingsAmount.toFixed(2)})
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      selectedImage === imgUrl
                        ? "border-indigo-500 shadow-md shadow-indigo-500/30 scale-105"
                        : "border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Purchasing & Specs Column */}
          <div className="space-y-6">
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  {product.brand || "Gadgets World Verified"}
                </span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-sm font-bold text-white">{product.avg_rating}</span>
                  <span className="text-xs text-slate-500">
                    ({product.review_count} verified reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {product.title}
              </h1>

              {product.sku && (
                <p className="text-xs font-mono text-slate-500">SKU: {product.sku}</p>
              )}
            </div>

            {/* Price Banner */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-extrabold text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-slate-500 line-through">
                      ${product.compare_at_price!.toFixed(2)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  Taxes and shipping calculated at checkout
                </span>
              </div>

              {/* Stock status indicator */}
              <div>
                {product.stock_quantity > 10 ? (
                  <Badge variant="success" dot className="text-xs">
                    In Stock ({product.stock_quantity} available)
                  </Badge>
                ) : product.stock_quantity > 0 ? (
                  <Badge variant="warning" dot className="text-xs">
                    Low Stock (Only {product.stock_quantity} left)
                  </Badge>
                ) : (
                  <Badge variant="destructive" dot className="text-xs">
                    Out of Stock
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Product Overview
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Seller Information Card */}
            <Card className="p-4 border-slate-800/80 bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">
                        {product.seller_name}
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <span className="text-xs text-slate-400">
                      Verified Marketplace Merchant
                    </span>
                  </div>
                </div>

                <Badge variant="secondary" className="text-[10px]">
                  Direct Seller
                </Badge>
              </div>
            </Card>

            {/* Purchase Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 h-12 px-3 gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer font-bold px-1"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-white min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 10, q + 1))}
                    disabled={quantity >= (product.stock_quantity || 10)}
                    className="text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer font-bold px-1"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity <= 0}
                  className="flex-1 h-12"
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  {product.stock_quantity > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  aria-label="Wishlist toggle"
                  className={`h-12 w-12 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                    isInWishlist(product.id)
                      ? "border-rose-500 bg-rose-950/60 text-rose-400"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-rose-400" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Table Section */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-800/80">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Technical Specifications
            </h2>
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
              <table className="w-full text-left text-xs">
                <tbody>
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? "bg-slate-950/40" : "bg-slate-900/40"}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-300 w-1/3 border-b border-slate-800/60">
                        {key}
                      </td>
                      <td className="py-3 px-4 text-slate-400 border-b border-slate-800/60">
                        {String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="space-y-6 pt-6 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                Customer Reviews ({product.review_count})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified feedback from authenticated buyers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.avg_rating)
                        ? "fill-amber-400"
                        : "text-slate-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-white">{product.avg_rating} / 5.0</span>
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">
                        {rev.customer_name}
                      </span>
                      {rev.is_verified_purchase && (
                        <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-amber-400 gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rev.rating ? "fill-amber-400" : "text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {rev.title && (
                    <p className="text-sm font-semibold text-slate-200">{rev.title}</p>
                  )}
                  {rev.comment && (
                    <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono block pt-1">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No customer reviews yet. Be the first to review this product!
              </div>
            )}
          </div>

          {/* Submit Review Card */}
          <Card className="p-6 border-slate-800 bg-slate-900/50 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Share Your Verified Feedback
            </h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Star Rating Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Rating Score</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="cursor-pointer transition hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-600 hover:text-amber-400"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    {reviewRating} out of 5 stars
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Exceptional build quality and sound..."
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Review Comments</label>
                <textarea
                  rows={3}
                  placeholder="Describe performance, ergonomics, and daily usage..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 p-3.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  isLoading={submittingReview}
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Submit Review
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
