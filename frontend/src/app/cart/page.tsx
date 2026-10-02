"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronLeft,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useCart } from "@/context/cart-context";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-20">
          <EmptyState
            title="Your Shopping Cart is Empty"
            description="You haven't added any products to your cart yet. Explore our curated AI catalog of adaptive acoustics, workstations, and edge processors."
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
                Active Order Cart
              </Badge>
              <span className="text-xs text-slate-400">
                {itemCount} {itemCount === 1 ? "item" : "items"} selected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Review Your Cart
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
                Continue Shopping
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Cart Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items List (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => {
              const unitPrice = Number(product.price);
              const lineTotal = unitPrice * quantity;
              const compareAt = Number(product.compare_at_price || 0);
              const lineDiscount =
                compareAt > unitPrice ? (compareAt - unitPrice) * quantity : 0;
              const isMaxStock = quantity >= product.stock_quantity;

              return (
                <div
                  key={product.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center gap-5 transition hover:border-slate-700/80"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/products/${product.id}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 shrink-0 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        product.images?.[0] ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                      }
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                        {product.brand || product.category_name || "Gadgets World"}
                      </span>
                      {product.stock_quantity <= 5 && (
                        <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Only {product.stock_quantity} left
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/products/${product.id}`}
                      className="block text-sm sm:text-base font-semibold text-white hover:text-cyan-300 transition truncate"
                    >
                      {product.title}
                    </Link>

                    <div className="flex items-baseline gap-2 text-xs">
                      <span className="text-white font-medium">
                        ${unitPrice.toFixed(2)} each
                      </span>
                      {compareAt > unitPrice && (
                        <span className="text-slate-500 line-through">
                          ${compareAt.toFixed(2)}
                        </span>
                      )}
                      {lineDiscount > 0 && (
                        <span className="text-emerald-400 font-medium">
                          Saved ${lineDiscount.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Fulfilled by {product.seller_name}
                    </p>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                        ${lineTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Controller */}
                      <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 px-2 py-1 gap-2">
                        <button
                          onClick={() => decreaseQuantity(product.id)}
                          className="p-1 text-slate-400 hover:text-white transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-white min-w-[20px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(product.id)}
                          disabled={isMaxStock}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title={isMaxStock ? "Max available stock reached" : "Increase quantity"}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition"
                        title="Remove product"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary (Right 1 col) */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
              <h2 className="text-lg font-bold text-white tracking-tight pb-3 border-b border-slate-800">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Product Subtotal</span>
                  <span className="font-semibold text-white">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Discount Savings
                    </span>
                    <span className="font-semibold">-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Estimated Shipping</span>
                  </div>
                  {shipping === 0 ? (
                    <span className="text-emerald-400 font-semibold uppercase text-xs">
                      Free Shipping
                    </span>
                  ) : (
                    <span className="font-semibold text-white">
                      ${shipping.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-white">${tax.toFixed(2)}</span>
                </div>

                {shipping > 0 && (
                  <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300">
                    Add ${(100 - subtotal).toFixed(2)} more to qualify for <strong>FREE Delivery</strong>!
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-base font-bold text-white">Estimated Total</span>
                    <p className="text-[11px] text-slate-500">Includes all taxes and items</p>
                  </div>
                  <span className="text-2xl font-extrabold text-white tracking-tight">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <Link href="/checkout" className="block w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-sm font-bold shadow-lg shadow-cyan-500/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Checkout
                </Button>
              </Link>

              {/* Reassurances */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Secure 256-bit encrypted checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stock reservation guaranteed upon submission</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
