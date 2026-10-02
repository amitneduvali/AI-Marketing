"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertCircle,
  Copy,
  ExternalLink,
  Store,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { fetchOrderById, Order } from "@/lib/api/orders";

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", desc: "Awaiting confirmation" },
  { key: "CONFIRMED", label: "Confirmed", desc: "Inventory allocated" },
  { key: "PROCESSING", label: "Processing", desc: "Packing & preparation" },
  { key: "SHIPPED", label: "Shipped", desc: "En route to carrier" },
  { key: "DELIVERED", label: "Delivered", desc: "Package handed over" },
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadOrder = React.useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrderById(orderId);
      setOrder(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load order";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const copyTracking = () => {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number);
      toast({
        title: "Tracking Copied",
        description: `Copied ${order.tracking_number} to clipboard.`,
      });
    }
  };

  const getStepIndex = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "CONFIRMED":
        return 1;
      case "PROCESSING":
        return 2;
      case "SHIPPED":
        return 3;
      case "DELIVERED":
        return 4;
      default:
        return -1;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 space-y-8">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-20">
          <ErrorState
            title="Order Not Found"
            message={error || "The specified order record could not be loaded."}
            onRetry={loadOrder}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Orders
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">ID: {order.id}</span>
          </div>
        </div>

        {/* Order Header Summary */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  Order #{order.order_number}
                </h1>
                {isCancelled ? (
                  <Badge variant="destructive">Cancelled</Badge>
                ) : (
                  <Badge variant="cyan">{order.status}</Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Placed on {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            {order.tracking_number && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                <Truck className="w-4 h-4 text-cyan-400" />
                <div className="text-left text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Tracking ID
                  </span>
                  <span className="font-mono font-bold text-white">
                    {order.tracking_number}
                  </span>
                </div>
                <button
                  onClick={copyTracking}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  title="Copy Tracking ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Stepper Tracking Visualizer */}
          {!isCancelled ? (
            <div className="pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                Fulfillment Progress
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
                {STATUS_STEPS.map((step, index) => {
                  const isDone = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center text-center relative z-10 space-y-2"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isDone
                            ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 ring-4 ring-cyan-500/20"
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-slate-950" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            isCurrent
                              ? "text-cyan-300"
                              : isDone
                              ? "text-white"
                              : "text-slate-500"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                This order was cancelled. Reserved inventory was automatically returned to the seller catalog.
              </div>
            </div>
          )}
        </div>

        {/* Detailed Grid: Products & Shipping */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order Line Items (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
                Ordered Products ({order.items.length})
              </h2>

              <div className="space-y-4">
                {order.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80"
                  >
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          it.product_image ||
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                        }
                        alt={it.product_title}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-900 shrink-0"
                      />
                      <div className="space-y-1">
                        <Link
                          href={`/products/${it.product_id}`}
                          className="text-sm font-semibold text-white hover:text-cyan-300 transition"
                        >
                          {it.product_title}
                        </Link>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Seller: {it.seller_name}</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Unit Price: ${it.unit_price.toFixed(2)} × {it.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-white">
                        ${it.total_price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery & Summary Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Delivery Details */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Shipping Destination
              </h2>
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white text-sm">
                  {order.shipping_address.full_name}
                </p>
                <p>{order.shipping_address.address_line}</p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  {order.shipping_address.postal_code}
                </p>
                <p className="text-slate-400">Phone: {order.shipping_address.phone}</p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
              <h2 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
                Payment Breakdown
              </h2>
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-semibold text-white">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Savings</span>
                  <span className="font-semibold">-${order.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Shipping Fee</span>
                <span className="font-semibold text-white">
                  {order.shipping_amount === 0 ? "FREE" : `$${order.shipping_amount.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Sales Tax (8%)</span>
                <span className="font-semibold text-white">${order.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-800 text-sm">
                <span className="font-bold text-white">Total Paid</span>
                <span className="font-extrabold text-cyan-400 text-base">
                  ${order.total_amount.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 text-[11px] text-slate-500">
                Payment Method: Simulated Sandbox Card
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
