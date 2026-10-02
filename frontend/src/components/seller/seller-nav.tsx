"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Boxes,
  BarChart3,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SELLER_NAV_ITEMS = [
  { href: "/seller", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/products/new", label: "Add Product", icon: PlusCircle },
  { href: "/seller/orders", label: "Orders", icon: ShoppingBag },
  { href: "/seller/inventory", label: "Inventory", icon: Boxes },
  { href: "/seller/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/seller/insights", label: "AI Insights", icon: Sparkles },
];

export function SellerNav() {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-0 overflow-x-auto no-scrollbar gap-2">
          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {SELLER_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/seller"
                  ? pathname === "/seller"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border-b-2 ${
                    isActive
                      ? "border-cyan-400 text-cyan-300 bg-cyan-950/20"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Storefront Link */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <Badge variant="cyan" className="text-[10px]">
              Storefront Live
            </Badge>
            <Link
              href="/products"
              target="_blank"
              className="text-slate-400 hover:text-white flex items-center gap-1 transition text-xs"
            >
              <span>View Marketplace</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
