"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ChevronLeft,
  ArrowRight,
  Star,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-20">
          <EmptyState
            title="Your Wishlist is Empty"
            description="You haven't saved any items yet. Explore the marketplace and tap the heart icon on any product to save it for later."
            actionLabel="Explore Marketplace"
            onAction={() => router.push("/products")}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan" className="text-xs">
                Saved Items
              </Badge>
              <span className="text-xs text-slate-400">
                {wishlist.length} {wishlist.length === 1 ? "product" : "products"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Saved Wishlist
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/products">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ChevronLeft className="w-4 h-4" />}
                className="text-xs"
              >
                Browse More
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearWishlist}
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear Wishlist
            </Button>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const inCart = isInCart(product.id);
            const isOutOfStock = product.stock_quantity <= 0;
            const price = Number(product.price);
            const comparePrice = Number(product.compare_at_price || 0);

            return (
              <div
                key={product.id}
                className="flex flex-col rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden hover:border-slate-700/80 transition"
              >
                <div className="relative aspect-[4/3] bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      product.images?.[0] ||
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                    }
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-rose-400 hover:bg-rose-950/40 transition"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col flex-1 p-4 space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {product.brand || "Gadgets World"}
                    </span>
                    <Link
                      href={`/products/${product.id}`}
                      className="block text-sm font-semibold text-white hover:text-cyan-300 transition line-clamp-2 mt-1"
                    >
                      {product.title}
                    </Link>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-white">
                      ${price.toFixed(2)}
                    </span>
                    {comparePrice > price && (
                      <span className="text-xs text-slate-500 line-through">
                        ${comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 mt-auto flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant={inCart ? "secondary" : "primary"}
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product, 1)}
                      className="w-full text-xs font-semibold"
                      leftIcon={inCart ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                    >
                      {isOutOfStock ? "Out of Stock" : inCart ? "Added to Cart" : "Move to Cart"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
