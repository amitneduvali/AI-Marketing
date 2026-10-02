"use client";

import * as React from "react";
import Link from "next/link";
import { Cpu, Search, Menu, X, ArrowRight, User, LogIn, LayoutDashboard, ShoppingCart, Heart, Package } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface NavbarProps {
  onOpenSearch?: () => void;
  onOpenShowcase?: () => void;
  backendStatus?: "connected" | "disconnected" | "checking";
}

export function Navbar({
  onOpenSearch,
  onOpenShowcase,
  backendStatus = "checking",
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, role } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  const navLinks = [
    { label: "Marketplace", href: "/products" },
    { label: "AI Offers", href: "/offers" },
    { label: "Seller Hub", href: "/seller" },
    { label: "Admin", href: "/admin" },
    { label: "My Orders", href: "/orders" },
  ];

  const getDashboardHref = () => {
    if (role === "CUSTOMER") return "/customer/dashboard";
    if (role === "SELLER") return "/seller";
    if (role === "ADMIN") return "/admin/dashboard";
    return "/seller";
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Cpu className="w-5 h-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  Gadgets World
                </span>
                <Badge variant="ai" className="px-1.5 py-0 text-[10px] font-mono">
                  AI
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Electronics Marketplace
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900/80 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Search Trigger Button */}
            {onOpenSearch ? (
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
                aria-label="Search marketplace"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-950 rounded border border-slate-800">
                  ⌘K
                </kbd>
              </button>
            ) : (
              <Link
                href="/products"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Search Catalog</span>
              </Link>
            )}

            {/* Wishlist Icon Button */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800/80 transition"
              aria-label="View Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-slate-950">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon Button */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-slate-800/80 transition"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-cyan-500 text-slate-950 text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Backend status indicator */}
            <div className="hidden xl:flex items-center">
              {backendStatus === "connected" && (
                <Badge variant="success" dot className="text-[11px]">
                  Live API
                </Badge>
              )}
            </div>

            {/* Dynamic Auth Section */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link href={getDashboardHref()}>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="border-indigo-500/30 text-xs gap-1.5 hidden sm:inline-flex"
                    leftIcon={<LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />}
                  >
                    <span>{role}</span>
                  </Button>
                </Link>

                <Link href="/profile">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-[11px] font-bold">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-[100px] truncate">
                      {user.name}
                    </span>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/login">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    leftIcon={<LogIn className="w-3.5 h-3.5" />}
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 py-6 space-y-4">
          <div className="flex flex-col space-y-2">
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-900 rounded-lg transition"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-cyan-400" /> Shopping Cart
              </span>
              {itemCount > 0 && (
                <span className="bg-cyan-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-900 rounded-lg transition"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" /> Saved Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
            {user ? (
              <>
                <Link href={getDashboardHref()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Go to {role} Dashboard
                  </Button>
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
