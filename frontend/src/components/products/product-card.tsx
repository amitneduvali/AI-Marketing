"use client";

import * as React from "react";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Check, AlertCircle, Eye } from "lucide-react";
import { Product } from "@/lib/api/products";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { trackInteraction } from "@/lib/api/interactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);
  const inCart = isInCart(product.id);

  const price = Number(product.price);
  const comparePrice = Number(product.compare_at_price || 0);
  const hasDiscount = comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  const mainImage =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-cyan-950/20 transition-all duration-300 overflow-hidden">
      {/* Thumbnail Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950/80">
        <Link
          href={`/products/${product.id}`}
          onClick={() => {
            trackInteraction({
              interaction_type: "product_click",
              product_id: product.id,
              category_id: product.category_id,
              metadata: { price: product.price },
            });
          }}
          className="block w-full h-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading={priority ? "eager" : "lazy"}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
            }}
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
          {hasDiscount && (
            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider rounded-md bg-emerald-500 text-slate-950 shadow-md">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_featured && (
            <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-md bg-indigo-500/90 text-white backdrop-blur-sm shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all duration-200 shadow-sm ${
            isFavorited
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
              : "bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-900/90 border border-slate-800"
          }`}
          title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-400" : ""}`} />
        </button>

        {/* Stock Alert Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Body Info */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 gap-2">
          <span className="truncate font-medium text-slate-400">
            {product.brand || product.category_name || "Gadgets World"}
          </span>
          <div className="flex items-center gap-1 shrink-0 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-semibold text-slate-200">
              {Number(product.avg_rating || 0).toFixed(1)}
            </span>
            <span className="text-[11px] text-slate-500">
              ({product.review_count || 0})
            </span>
          </div>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="text-sm sm:text-base font-semibold text-white hover:text-cyan-300 transition-colors line-clamp-2 mb-2"
        >
          {product.title}
        </Link>

        {product.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price & Action Row */}
        <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white tracking-tight">
                ${price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-500 line-through">
                  ${comparePrice.toFixed(2)}
                </span>
              )}
            </div>
            {isLowStock ? (
              <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                Only {product.stock_quantity} left
              </span>
            ) : isOutOfStock ? (
              <span className="text-[11px] font-medium text-rose-400">
                Unavailable
              </span>
            ) : (
              <span className="text-[11px] text-emerald-400/90 font-medium">
                In Stock ({product.stock_quantity})
              </span>
            )}
          </div>

          <button
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
              isOutOfStock
                ? "bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800"
                : inCart
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20 active:scale-95"
            }`}
            aria-label="Add to cart"
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>In Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
