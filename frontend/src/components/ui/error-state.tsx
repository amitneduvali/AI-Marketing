"use client";

import * as React from "react";
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  message?: string;
  error?: string | Error;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  message,
  error,
  onRetry,
  className,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const displayDescription =
    description || message || "An error occurred while loading this section. Please try again.";
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl border border-rose-900/40 bg-rose-950/20 backdrop-blur-md",
        className
      )}
    >
      <div className="relative mb-4 flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-900/40 border border-rose-700/50 text-rose-400 shadow-inner">
        <AlertCircle className="w-6 h-6" />
        <span className="absolute -inset-1 rounded-2xl bg-rose-500/10 blur-sm -z-10" />
      </div>

      <h4 className="text-base font-semibold text-white tracking-tight mb-1.5">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed mb-5">
        {displayDescription}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="border-rose-900/50 hover:border-rose-700/60"
        >
          Try Again
        </Button>
      )}

      {errorMessage && (
        <div className="mt-4 w-full max-w-md">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-400 transition"
          >
            <span>{showDetails ? "Hide technical details" : "Show technical details"}</span>
            {showDetails ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          {showDetails && (
            <pre className="mt-2 p-3 text-left bg-slate-950/90 border border-rose-900/40 rounded-xl text-[11px] font-mono text-rose-300/80 overflow-x-auto">
              {errorMessage}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
