"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/lib/api/products";
import { toast } from "@/components/ui/toast";
import { trackInteraction } from "@/lib/api/interactions";

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "cortex_pulse_wishlist_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load wishlist", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist", e);
    }
  }, [wishlist, isLoaded]);

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((p) => p.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    const exists = isInWishlist(product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      toast({
        title: "Removed from Wishlist",
        description: `"${product.title}" was removed from your saved items.`,
      });
    } else {
      setWishlist((prev) => [...prev, product]);
      toast({
        title: "Saved to Wishlist",
        description: `"${product.title}" has been saved for later.`,
      });
      trackInteraction({
        interaction_type: "wishlist",
        product_id: product.id,
        category_id: product.category_id,
        metadata: { price: product.price },
      });
    }
  };

  const removeFromWishlist = (productId: string) => {
    const item = wishlist.find((p) => p.id === productId);
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
    if (item) {
      toast({
        title: "Item Removed",
        description: `Removed "${item.title}" from your wishlist.`,
      });
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
