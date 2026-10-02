"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useToast } from "@/components/ui/toast";

export default function CustomerDashboardPage() {
  const { user, switchRole } = useAuth();
  const { toast } = useToast();
  const [aiEnabled, setAiEnabled] = React.useState(true);

  const toggleAi = () => {
    setAiEnabled(!aiEnabled);
    toast({
      title: "AI Preferences Updated",
      description: !aiEnabled
        ? "Personalized behavioral recommendations enabled."
        : "Standard non-personalized catalog display enabled.",
      variant: "info",
    });
  };

  return (
    <RoleGuard allowedRoles={["CUSTOMER", "ADMIN"]}>
      <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" dot>
                  Customer Account
                </Badge>
                <span className="text-xs text-slate-500 font-mono">
                  ID: {user?.id.substring(0, 12)}...
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name || "Customer"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Personalized buyer cockpit and discovery feed
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button variant="outline" size="sm" leftIcon={<User className="w-4 h-4" />}>
                  View Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="p-5 border-cyan-500/20 bg-slate-900/60">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Cart</span>
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-white">0 Items</p>
              <p className="text-[11px] text-slate-500 mt-1">Ready for checkout</p>
            </Card>

            <Card className="p-5 border-indigo-500/20 bg-slate-900/60">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Saved Wishlist</span>
                <Heart className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white">3 Saved</p>
              <p className="text-[11px] text-slate-500 mt-1">Stored in your collection</p>
            </Card>

            <Card className="p-5 border-purple-500/20 bg-slate-900/60">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">0 Completed</p>
              <p className="text-[11px] text-slate-500 mt-1">Lifetime purchase history</p>
            </Card>
          </div>

          {/* AI Recommendation Engine Preferences */}
          <Card className="p-6 border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Gadgets World AI Recommendation Stream
                  </h3>
                  <Badge variant="ai" className="text-[10px]">
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 max-w-xl">
                  Adaptive vector scoring personalizes your marketplace catalog based on view duration,
                  search queries, and category affinities.
                </p>
              </div>

              <Button
                variant={aiEnabled ? "primary" : "secondary"}
                size="sm"
                onClick={toggleAi}
              >
                {aiEnabled ? "AI Personalization: ON" : "AI Personalization: OFF"}
              </Button>
            </div>
          </Card>

          {/* Test Role Boundary Section */}
          <Card className="p-6 border-slate-800 bg-slate-900/40">
            <CardHeader className="p-0 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <CardTitle className="text-sm font-semibold">
                  Role Boundary Verification (Security Check)
                </CardTitle>
              </div>
              <CardDescription>
                Confirm that Customer accounts cannot access Merchant or Admin controls:
              </CardDescription>
            </CardHeader>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/seller/dashboard">
                <Button variant="outline" size="sm">
                  Attempt to Visit /seller/dashboard (Should Be 403)
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  Attempt to Visit /admin/dashboard (Should Be 403)
                </Button>
              </Link>
            </div>
          </Card>
        </main>

        <Footer />
      </div>
    </RoleGuard>
  );
}
