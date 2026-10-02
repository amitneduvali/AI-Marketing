import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "destructive"
    | "ai"
    | "cyan"
    | "outline";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-indigo-950/80 text-indigo-300 border-indigo-700/50 shadow-sm",
    secondary:
      "bg-slate-800/80 text-slate-300 border-slate-700/60",
    success:
      "bg-emerald-950/70 text-emerald-300 border-emerald-700/50",
    warning:
      "bg-amber-950/70 text-amber-300 border-amber-700/50",
    destructive:
      "bg-rose-950/70 text-rose-300 border-rose-700/50",
    ai:
      "bg-gradient-to-r from-indigo-950 via-purple-950 to-cyan-950 text-cyan-200 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    cyan:
      "bg-cyan-950/70 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.12)]",
    outline:
      "bg-transparent text-slate-400 border-slate-700",
  };

  const dotColors = {
    default: "bg-indigo-400",
    secondary: "bg-slate-400",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    destructive: "bg-rose-400",
    ai: "bg-cyan-400",
    cyan: "bg-cyan-400",
    outline: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
