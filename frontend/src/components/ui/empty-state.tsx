import * as React from "react";
import { PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40",
        className
      )}
    >
      <div className="relative mb-4 flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 shadow-inner">
        {icon || <PackageOpen className="w-7 h-7 text-slate-500" />}
        <span className="absolute -inset-1 rounded-2xl bg-indigo-500/10 blur-sm -z-10" />
      </div>
      <h4 className="text-base font-semibold text-white tracking-tight mb-1.5">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {action ? (
        <div className="flex items-center gap-3">{action}</div>
      ) : actionLabel && onAction ? (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
