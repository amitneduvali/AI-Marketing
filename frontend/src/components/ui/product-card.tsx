"use client";

import * as React from "react";
import { Star, Heart, ShoppingBag, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  title: string;
  category: string;
  price: number;
  seller: string;
  rating?: number;
  reviewCount?: number;
  aiMatchScore?: number; // e.g., 94 for "94% Match (Demo Data)"
  imageGradient?: string;
  onAddToCart?: () => void;
  onWishlistToggle?: () => void;
  className?: string;
}

export function ProductCard({
  title,
  category,
  price,
  seller,
  rating = 4.8,
  reviewCount = 142,
  aiMatchScore,
  imageGradient = "from-indigo-900/40 via-purple-900/30 to-slate-900",
  onAddToCart,
  onWishlistToggle,
  className,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlistToggle?.();
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-slate-800/90 bg-slate-900/70 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10",
        className
      )}
    >
      {/* Visual Image / Showcase Container */}
      <div
        className={cn(
          "relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br border border-slate-800/60 flex items-center justify-center p-4",
          imageGradient
        )}
      >
        {/* Abstract futuristic grid / glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.25),transparent_70%)]" />
        <div className="relative text-center">
          <span className="text-3xl filter drop-shadow-md">✨</span>
          <p className="mt-2 text-[11px] font-mono tracking-wider text-slate-400 uppercase">
            Product Visual
          </p>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          <Badge variant="secondary" className="text-[10px] font-medium backdrop-blur-md bg-slate-900/80">
            {category}
          </Badge>
          {aiMatchScore && (
            <Badge variant="ai" className="text-[10px] font-semibold tracking-tight">
              <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
              {aiMatchScore}% Match &bull; Demo Data
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label="Save to wishlist"
          className={cn(
            "absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md border transition-all duration-200 cursor-pointer",
            isWishlisted
              ? "bg-rose-950/80 border-rose-500/50 text-rose-400"
              : "bg-slate-900/70 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800"
          )}
        >
          <Heart className={cn("w-3.5 h-3.5", isWishlisted && "fill-rose-400")} />
        </button>
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1 pt-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300 truncate max-w-[150px]">
            {seller}
          </span>
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            <span className="font-semibold text-slate-200">{rating}</span>
            <span className="text-slate-500">({reviewCount})</span>
          </div>
        </div>

        <h4 className="text-sm font-semibold text-white tracking-tight line-clamp-2 group-hover:text-indigo-300 transition-colors">
          {title}
        </h4>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-800/80">
          <div>
            <span className="text-xs text-slate-500 font-mono">USD</span>
            <p className="text-lg font-bold text-white tracking-tight">
              ${price.toFixed(2)}
            </p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={onAddToCart}
            leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
            className="hover:border-indigo-500/50 hover:bg-indigo-950/40"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
