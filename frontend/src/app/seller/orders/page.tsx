"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronLeft,
  AlertCircle,
  Filter,
  Save,
  RotateCcw,
  Store,
  DollarSign,
  User,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SellerNav } from "@/components/seller/seller-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/ui/toast";
import { fetchSellerOrders, updateOrderStatus, Order } from "@/lib/api/orders";

const STATUS_OPTIONS: Order["status"][] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function SellerOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const loadOrders = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSellerOrders();
      setOrders(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load seller orders";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"],
    trackingNum?: string
  ) => {
    setUpdatingId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus, trackingNum);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      toast({
        title: "Order Status Updated",
        description: `Order #${updated.order_number} is now marked as ${newStatus}.`,
        variant: "default",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Status update failed";
      toast({
        title: "Update Failed",
        description: msg,
        variant: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <SellerNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan" className="text-xs">
                Seller Fulfillment Center
              </Badge>
              <span className="text-xs text-slate-400">
                {orders.length} Order Records in PostgreSQL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Seller Order Management
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Fulfill customer purchases, assign express tracking IDs, and progress order lifecycle states.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadOrders}
              leftIcon={<RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
              className="text-xs"
            >
              Refresh Orders
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Total Active Orders
            </span>
            <div className="text-2xl font-extrabold text-white">
              {orders.length}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Pending Fulfillment
            </span>
            <div className="text-2xl font-extrabold text-amber-400">
              {orders.filter((o) => ["CONFIRMED", "PROCESSING"].includes(o.status)).length}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Recorded Sales Revenue
            </span>
            <div className="text-2xl font-extrabold text-emerald-400">
              ${totalRevenue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-300 font-semibold">Filter Status:</span>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs h-9 bg-slate-950 border-slate-800 w-44"
            >
              <option value="ALL">All States ({orders.length})</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st} ({orders.filter((o) => o.status === st).length})
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadOrders}
            className="text-xs text-slate-400 hover:text-white"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
              >
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load orders"
            message={error}
            onRetry={loadOrders}
          />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="No orders currently match the selected status filter."
            actionLabel="Reset Filter"
            onAction={() => setStatusFilter("ALL")}
          />
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-5 transition hover:border-slate-700/80"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white text-base">
                        #{order.order_number}
                      </span>
                      <Badge
                        variant={
                          order.status === "DELIVERED"
                            ? "success"
                            : order.status === "SHIPPED"
                            ? "cyan"
                            : order.status === "CANCELLED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-slate-400">
                      Customer: <strong className="text-slate-200">{order.customer_name}</strong> ({order.customer_email})
                    </p>
                  </div>

                  {/* Status Updater Controller */}
                  <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 text-xs shrink-0 font-medium">
                      Update State:
                    </span>
                    <Select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value as Order["status"],
                          order.tracking_number
                        )
                      }
                      className="text-xs h-8 bg-slate-900 border-slate-700 w-36 font-semibold"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Items and Delivery Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
                  {/* Line Items (8 cols) */}
                  <div className="lg:col-span-8 space-y-3">
                    <h3 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                      Items to Fulfill ({order.items.length})
                    </h3>
                    <div className="space-y-2">
                      {order.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80"
                        >
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                it.product_image ||
                                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                              }
                              alt={it.product_title}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-900"
                            />
                            <div>
                              <p className="font-semibold text-white truncate max-w-xs">
                                {it.product_title}
                              </p>
                              <p className="text-slate-400 text-[11px]">
                                Qty: {it.quantity} × ${it.unit_price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-white text-sm">
                            ${it.total_price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Destination Info & Tracking (4 cols) */}
                  <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div>
                      <h3 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                        Shipping Address
                      </h3>
                      <p className="text-white font-medium">
                        {order.shipping_address.full_name}
                      </p>
                      <p className="text-slate-400">
                        {order.shipping_address.address_line}
                      </p>
                      <p className="text-slate-400">
                        {order.shipping_address.city}, {order.shipping_address.state}{" "}
                        {order.shipping_address.postal_code}
                      </p>
                      <p className="text-slate-500 mt-1">
                        Phone: {order.shipping_address.phone}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
                        Tracking Number
                      </span>
                      <span className="font-mono font-semibold text-cyan-300 text-xs">
                        {order.tracking_number || "None Assigned"}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between">
                      <span className="text-slate-400">Total Order Value:</span>
                      <span className="font-bold text-white text-sm">
                        ${order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
