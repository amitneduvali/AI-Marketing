"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { fetchCustomerOrders, Order } from "@/lib/api/orders";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadOrders = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomerOrders();
      setOrders(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load orders";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="secondary" className="text-xs">Confirmed</Badge>;
      case "PROCESSING":
        return <Badge variant="warning" className="text-xs">Processing</Badge>;
      case "SHIPPED":
        return <Badge variant="cyan" className="text-xs">Shipped</Badge>;
      case "DELIVERED":
        return <Badge variant="success" className="text-xs">Delivered</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive" className="text-xs">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan" className="text-xs">
                Customer Account
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Orders & Purchases
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Track live package deliveries, review order line-items, and download receipts.
            </p>
          </div>

          <Link href="/products">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Browse Catalog
            </Button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load orders"
            message={error}
            onRetry={loadOrders}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="You haven't placed any marketplace orders yet. Explore our hardware catalog to get started."
            actionLabel="Start Shopping"
            onAction={() => (window.location.href = "/products")}
          />
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const formattedDate = new Date(order.created_at).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              );

              return (
                <div
                  key={order.id}
                  className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6 transition hover:border-slate-700/80 space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono font-bold text-white text-sm">
                        #{order.order_number}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{formattedDate}</span>
                      <span className="text-slate-500">•</span>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Total:</span>
                      <span className="font-bold text-white text-base">
                        ${order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8 flex flex-wrap items-center gap-3">
                      {order.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 max-w-sm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              it.product_image ||
                              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                            }
                            alt={it.product_title}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0"
                          />
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-semibold text-white truncate">
                              {it.product_title}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Qty: {it.quantity} × ${it.unit_price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-3 pt-2 md:pt-0">
                      <Link href={`/orders/${order.id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs font-semibold"
                          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        >
                          Track Package
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
