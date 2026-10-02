"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, ArrowRight, RefreshCw, UserCheck } from "lucide-react";
import { useAuth, UserRole } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackUrl?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackUrl = "/login",
}: RoleGuardProps) {
  const { user, role, isLoading, switchRole } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-300">
          Verifying security credentials &amp; permissions...
        </p>
      </div>
    );
  }

  // Not logged in
  if (!user || !role) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 mb-5 shadow-lg shadow-amber-950/30">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
          Authentication Required
        </h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          You must be logged in to view this section. Please sign in with your credentials.
        </p>
        <Button
          variant="primary"
          onClick={() => router.push(fallbackUrl)}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In to Continue
        </Button>
      </div>
    );
  }

  // Logged in but not in allowed roles
  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-600/40 flex items-center justify-center text-rose-400 mb-5 shadow-lg shadow-rose-950/30">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <Badge variant="destructive" className="mb-3">
          403 Access Denied
        </Badge>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
          Restricted Portal Access
        </h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Your current account role is{" "}
          <span className="font-semibold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            {role}
          </span>
          . This section requires{" "}
          <span className="font-semibold text-indigo-300">
            {allowedRoles.join(" or ")}
          </span>{" "}
          privileges.
        </p>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left w-full text-xs space-y-2 mb-6">
          <p className="text-slate-300 font-medium">Role Boundary Enforcement:</p>
          <ul className="text-slate-400 space-y-1 list-disc list-inside">
            <li>Customer accounts cannot access seller stores or admin controls.</li>
            <li>Seller accounts are restricted from administrative system settings.</li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (role === "CUSTOMER") router.push("/customer/dashboard");
              else if (role === "SELLER") router.push("/seller/dashboard");
              else if (role === "ADMIN") router.push("/admin/dashboard");
              else router.push("/");
            }}
          >
            Go to Your Dashboard
          </Button>

          {/* Development Switcher to allow easy testing */}
          {allowedRoles.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => switchRole(allowedRoles[0])}
              leftIcon={<UserCheck className="w-3.5 h-3.5 text-cyan-400" />}
            >
              Switch Role to {allowedRoles[0]} (Demo)
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
