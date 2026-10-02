"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/lib/api/products";
import { toast } from "@/components/ui/toast";
import { trackInteraction } from "@/lib/api/interactions";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  increaseQuantity: (productId: string) => boolean;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cortex_pulse_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to parse cart from storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [items, isLoaded]);

  const addToCart = (product: Product, quantity = 1): boolean => {
    if (product.stock_quantity <= 0) {
      toast({
        title: "Out of Stock",
        description: `"${product.title}" is currently out of stock.`,
        variant: "destructive",
      });
      return false;
    }

    const existingIndex = items.findIndex((it) => it.product.id === product.id);
    const currentQty = existingIndex >= 0 ? items[existingIndex].quantity : 0;
    const requestedTotal = currentQty + quantity;

    if (requestedTotal > product.stock_quantity) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${product.stock_quantity} unit(s) available in inventory.`,
        variant: "destructive",
      });
      return false;
    }

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity = requestedTotal;
      setItems(updated);
    } else {
      setItems([...items, { product, quantity }]);
    }

    toast({
      title: "Added to Cart",
      description: `Added ${quantity} × ${product.title} to your cart.`,
      variant: "default",
    });

    trackInteraction({
      interaction_type: "add_to_cart",
      product_id: product.id,
      category_id: product.category_id,
      metadata: { price: product.price, quantity },
    });

    return true;
  };

  const removeFromCart = (productId: string) => {
    const item = items.find((i) => i.product.id === productId);
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    if (item) {
      toast({
        title: "Item Removed",
        description: `Removed "${item.product.title}" from your cart.`,
      });
    }
  };

  const updateQuantity = (productId: string, quantity: number): boolean => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return true;
    }

    const targetItem = items.find((i) => i.product.id === productId);
    if (!targetItem) return false;

    if (quantity > targetItem.product.stock_quantity) {
      toast({
        title: "Stock Limit Exceeded",
        description: `Cannot add more than ${targetItem.product.stock_quantity} available units.`,
        variant: "destructive",
      });
      return false;
    }

    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
    return true;
  };

  const increaseQuantity = (productId: string): boolean => {
    const item = items.find((i) => i.product.id === productId);
    if (!item) return false;
    return updateQuantity(productId, item.quantity + 1);
  };

  const decreaseQuantity = (productId: string) => {
    const item = items.find((i) => i.product.id === productId);
    if (!item) return;
    if (item.quantity <= 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, item.quantity - 1);
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (productId: string): boolean => {
    return items.some((i) => i.product.id === productId);
  };

  // Calculations
  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);

  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.product.price) * it.quantity,
    0
  );

  const discount = items.reduce((sum, it) => {
    const compare = Number(it.product.compare_at_price || 0);
    const current = Number(it.product.price);
    if (compare > current) {
      return sum + (compare - current) * it.quantity;
    }
    return sum;
  }, 0);

  const shipping = subtotal === 0 ? 0 : subtotal >= 100 ? 0 : 15.0;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
