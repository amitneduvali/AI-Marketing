"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, Mail, Lock, ArrowRight, UserCheck, Shield, ShoppingBag, Store } from "lucide-react";
import { useAuth, UserRole } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError, user } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      if (user.role === "CUSTOMER") router.push("/customer/dashboard");
      else if (user.role === "SELLER") router.push("/seller/dashboard");
      else if (user.role === "ADMIN") router.push("/admin/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email) {
      setFormError("Please enter your email address.");
      return;
    }
    if (!password) {
      setFormError("Please enter your password.");
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      toast({
        title: "Signed In Successfully",
        description: `Welcome back to Gadgets World.`,
        variant: "success",
      });
    } else {
      setFormError(result.error || "Authentication failed. Check your credentials.");
      toast({
        title: "Sign In Error",
        description: result.error || "Invalid email or password.",
        variant: "error",
      });
    }
  };

  const handleQuickDemoLogin = async (demoRole: UserRole) => {
    const demoEmail =
      demoRole === "CUSTOMER"
        ? "customer@cortex-pulse.ai"
        : demoRole === "SELLER"
        ? "seller@cortex-pulse.ai"
        : "admin@cortex-pulse.ai";

    setSubmitting(true);
    const result = await login(demoEmail, "DemoPass123!", demoRole);
    setSubmitting(false);

    if (result.success) {
      toast({
        title: `Logged in as ${demoRole}`,
        description: `Switched session to ${demoRole} privileges.`,
        variant: "success",
      });
      if (demoRole === "CUSTOMER") router.push("/customer/dashboard");
      else if (demoRole === "SELLER") router.push("/seller/dashboard");
      else if (demoRole === "ADMIN") router.push("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-indigo-500/20">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/10 via-cyan-500/10 to-purple-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
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
            Sign In to Your Account
          </h2>
          <p className="text-xs text-slate-400">
            Access your personalized marketplace dashboard
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 backdrop-blur-2xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {(formError || authError) && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
                {formError || authError}
              </div>
            )}

            <Input
              type="email"
              label="Email Address"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              autoComplete="email"
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={submitting || isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Role Picker for Testing */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                Instant Role Demo
              </span>
              <Badge variant="outline" className="text-[10px]">
                Testing Mode
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Click any role to test authentication and role-based route protection:
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("CUSTOMER")}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-900 text-center transition group cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition" />
                <span className="text-[11px] font-medium text-slate-200">Customer</span>
                <span className="text-[9px] text-slate-500">Buyer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("SELLER")}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500/50 hover:bg-slate-900 text-center transition group cursor-pointer"
              >
                <Store className="w-4 h-4 text-indigo-400 mb-1 group-hover:scale-110 transition" />
                <span className="text-[11px] font-medium text-slate-200">Seller</span>
                <span className="text-[9px] text-slate-500">Merchant</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("ADMIN")}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-purple-500/50 hover:bg-slate-900 text-center transition group cursor-pointer"
              >
                <Shield className="w-4 h-4 text-purple-400 mb-1 group-hover:scale-110 transition" />
                <span className="text-[11px] font-medium text-slate-200">Admin</span>
                <span className="text-[9px] text-slate-500">Superuser</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Sign up here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
