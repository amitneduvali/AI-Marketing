"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, Mail, Lock, User, Store, ArrowRight, ShoppingBag } from "lucide-react";
import { useAuth, UserRole } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading, error: authError } = useAuth();
  const { toast } = useToast();

  const [selectedRole, setSelectedRole] = React.useState<"CUSTOMER" | "SELLER">("CUSTOMER");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [storeName, setStoreName] = React.useState("");
  const [storeSlug, setStoreSlug] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Auto-generate store slug when storeName changes
  React.useEffect(() => {
    if (selectedRole === "SELLER" && storeName) {
      setStoreSlug(
        storeName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  }, [storeName, selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password || !name) {
      setFormError("Please fill out all required fields.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (selectedRole === "SELLER" && (!storeName || !storeSlug)) {
      setFormError("Store name and slug are required for seller accounts.");
      return;
    }

    setSubmitting(true);
    const result = await signUp(email, password, selectedRole, {
      name,
      storeName: selectedRole === "SELLER" ? storeName : undefined,
      storeSlug: selectedRole === "SELLER" ? storeSlug : undefined,
    });
    setSubmitting(false);

    if (result.success) {
      toast({
        title: "Account Created Successfully",
        description: `Welcome to Gadgets World as a verified ${selectedRole}.`,
        variant: "success",
      });

      if (selectedRole === "CUSTOMER") {
        router.push("/customer/dashboard");
      } else {
        router.push("/seller/dashboard");
      }
    } else {
      setFormError(result.error || "Sign up failed.");
      toast({
        title: "Registration Error",
        description: result.error || "Could not complete account creation.",
        variant: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-indigo-500/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-indigo-600/10 to-purple-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition">
              Gadgets World
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-400">
            Select your account type to access dedicated features
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedRole("CUSTOMER")}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition ${
              selectedRole === "CUSTOMER"
                ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-900/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("SELLER")}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition ${
              selectedRole === "SELLER"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Seller</span>
          </button>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 p-6 backdrop-blur-2xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {(formError || authError) && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
                {formError || authError}
              </div>
            )}

            <Input
              label="Full Name"
              placeholder="Amith Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              type="email"
              label="Email Address"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              helperText="Must be at least 6 characters"
              required
            />

            {/* Seller-Specific Inputs */}
            {selectedRole === "SELLER" && (
              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                  Storefront Setup
                </span>
                <Input
                  label="Store Name"
                  placeholder="e.g. NextGen Hardware"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  leftIcon={<Store className="w-4 h-4 text-slate-400" />}
                  required
                />
                <Input
                  label="Store URL Slug"
                  placeholder="nextgen-hardware"
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value)}
                  helperText="cortex-pulse.ai/store/{slug}"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-3"
              isLoading={submitting || isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create {selectedRole === "CUSTOMER" ? "Customer" : "Merchant"} Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
