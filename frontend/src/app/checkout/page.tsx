"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronLeft,
  Truck,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Package,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { checkoutOrder, Order } from "@/lib/api/orders";
import { trackInteraction } from "@/lib/api/interactions";

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { items, itemCount, subtotal, discount, shipping, tax, total, clearCart } = useCart();

  // Form State
  const [formData, setFormData] = React.useState({
    fullName: user?.name || "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  const [paymentMethod, setPaymentMethod] = React.useState("simulated_card");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [completedOrder, setCompletedOrder] = React.useState<Order | null>(null);

  // Sync user info if loaded
  React.useEffect(() => {
    if (user?.name && !formData.fullName) {
      setFormData((prev) => ({ ...prev, fullName: user.name || "" }));
    }
  }, [user, formData.fullName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add products before checking out.",
        variant: "error",
      });
      return;
    }

    // Basic Validation
    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.addressLine.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.postalCode.trim()
    ) {
      toast({
        title: "Incomplete Shipping Info",
        description: "Please fill in all required shipping address fields.",
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        items: items.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
        })),
        shipping_address: {
          full_name: formData.fullName,
          phone: formData.phone,
          address_line: formData.addressLine,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country,
        },
        payment_method: paymentMethod,
        notes: notes || undefined,
      };

      const order = await checkoutOrder(orderPayload);

      // Track purchase interaction for each ordered item
      for (const it of items) {
        trackInteraction({
          user_id: user?.id,
          interaction_type: "purchase",
          product_id: it.product.id,
          category_id: it.product.category_id,
          metadata: {
            order_number: order.order_number,
            quantity: it.quantity,
            price: it.product.price,
            total_amount: order.total_amount,
          },
        });
      }

      clearCart();
      setCompletedOrder(order);
      toast({
        title: "Order Placed Successfully!",
        description: `Order #${order.order_number} has been recorded in the database.`,
        variant: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      toast({
        title: "Checkout Error",
        description: msg,
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Order Success View
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16">
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <Badge variant="success" className="mb-2">
                Order Confirmed
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Thank you for your order!
              </h1>
              <p className="mt-2 text-slate-400 text-sm">
                Your order <span className="font-mono text-cyan-300 font-bold">#{completedOrder.order_number}</span> has been confirmed and inventory has been reserved.
              </p>
            </div>

            {/* Simulated Payment Notice */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left text-xs text-amber-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Demonstration Sandbox Transaction
              </div>
              <p className="text-amber-300/80">
                This project is running a transparent simulated payment gateway. No real credit card was charged. Order records, inventory deductions, and tracking numbers are fully persisted.
              </p>
            </div>

            {/* Order Brief */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-left space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tracking Number:</span>
                <span className="font-mono text-slate-200 font-semibold">{completedOrder.tracking_number}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Address:</span>
                <span className="text-slate-200 font-medium">
                  {completedOrder.shipping_address.address_line}, {completedOrder.shipping_address.city}, {completedOrder.shipping_address.state}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="text-base font-bold text-white">${completedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href={`/orders/${completedOrder.id}`} className="w-full sm:w-auto">
                <Button variant="primary" className="w-full text-sm font-bold">
                  Track Order Status
                </Button>
              </Link>
              <Link href="/products" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full text-sm">
                  Continue Browsing
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto w-full px-4 py-24 text-center space-y-4">
          <Package className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
          <p className="text-xs text-slate-400">
            Please add items from the marketplace catalog to proceed with checkout.
          </p>
          <Link href="/products">
            <Button variant="primary" size="sm">
              Explore Products
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/cart" className="hover:text-white flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
          <span>/</span>
          <span className="text-cyan-400 font-medium">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Shipping & Payment Form (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Student Project Transparency Notice */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-200">
                <span className="font-semibold block text-indigo-100">
                  Simulated Student Sandbox Gateway
                </span>
                Checkout creates authentic order line-items and decrements real inventory in the database. For educational demonstrations, payments are simulated with zero actual credit card charges.
              </div>
            </div>

            <form onSubmit={handleSubmitCheckout} className="space-y-8">
              {/* 1. Shipping Details */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Truck className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-base font-bold text-white">
                    1. Shipping & Delivery Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name *
                    </label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Alexander Hayes"
                      required
                      className="bg-slate-950 border-slate-800 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Phone Number *
                    </label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +1 (555) 019-2834"
                      required
                      className="bg-slate-950 border-slate-800 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Street Address *
                    </label>
                    <Input
                      name="addressLine"
                      value={formData.addressLine}
                      onChange={handleInputChange}
                      placeholder="e.g. 742 Innovation Way, Suite 400"
                      required
                      className="bg-slate-950 border-slate-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      City *
                    </label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. San Francisco"
                      required
                      className="bg-slate-950 border-slate-800 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        State *
                      </label>
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="e.g. CA"
                        required
                        className="bg-slate-950 border-slate-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Postal Code *
                      </label>
                      <Input
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="e.g. 94107"
                        required
                        className="bg-slate-950 border-slate-800 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Payment Method */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-base font-bold text-white">
                      2. Payment Method
                    </h2>
                  </div>
                  <Badge variant="ai" className="text-[10px]">
                    Sandbox Mode
                  </Badge>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="simulated_card"
                        checked={paymentMethod === "simulated_card"}
                        onChange={() => setPaymentMethod("simulated_card")}
                        className="text-cyan-500 focus:ring-cyan-500"
                      />
                      <div>
                        <span className="text-sm font-semibold text-white block">
                          Simulated Test Card (Instant Approval)
                        </span>
                        <span className="text-xs text-slate-400">
                          Pre-authorized test account for platform evaluation
                        </span>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/50 cursor-pointer opacity-70 hover:opacity-100 transition">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={paymentMethod === "cash_on_delivery"}
                        onChange={() => setPaymentMethod("cash_on_delivery")}
                        className="text-cyan-500 focus:ring-cyan-500"
                      />
                      <div>
                        <span className="text-sm font-semibold text-white block">
                          Pay Upon Delivery
                        </span>
                        <span className="text-xs text-slate-400">
                          Settlement upon physical item receipt
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full text-base font-bold h-13 shadow-xl shadow-cyan-500/20"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                {submitting
                  ? "Verifying Inventory & Placing Order..."
                  : `Complete Order ($${total.toFixed(2)})`}
              </Button>
            </form>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 sticky top-24">
              <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
                Order Review ({itemCount} {itemCount === 1 ? "item" : "items"})
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 py-2 border-b border-slate-800/60 last:border-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        product.images?.[0] ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                      }
                      alt={product.title}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {product.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Qty: {quantity} × ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-white shrink-0">
                      ${(Number(product.price) * quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-semibold">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>Shipping</span>
                  <span className="font-semibold text-white">
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-800 text-sm">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-extrabold text-cyan-400 text-lg">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Simulated sandbox mode active. Real PostgreSQL orders generated.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
