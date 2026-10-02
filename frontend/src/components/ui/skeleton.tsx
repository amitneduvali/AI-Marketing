import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rounded" | "circular" | "rectangular";
}

export function Skeleton({
  className,
  variant = "rounded",
  ...props
}: SkeletonProps) {
  const variantStyles = {
    rounded: "rounded-xl",
    circular: "rounded-full",
    rectangular: "rounded-none",
  };

  return (
    <div
      className={cn(
        "animate-shimmer bg-slate-800/60 border border-slate-700/30",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
      {/* Image thumbnail placeholder */}
      <Skeleton className="w-full h-48 rounded-xl" />
      {/* Category / Badge placeholder */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-14 h-5" />
      </div>
      {/* Title & description */}
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-full h-3.5" />
      </div>
      {/* Price & action button */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="w-16 h-6" />
        <Skeleton className="w-24 h-9 rounded-xl" />
      </div>
    </div>
  );
}
