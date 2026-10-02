"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  Store,
  ShoppingBag,
  LogOut,
  Save,
  CheckCircle2,
  Calendar,
  Sparkles,
  Phone,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useToast } from "@/components/ui/toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, role, logout, updateProfile } = useAuth();
  const { toast } = useToast();

  const [name, setName] = React.useState(user?.name || "");
  const [phone, setPhone] = React.useState(user?.phone || "+1 (555) 019-2834");
  const [storeName, setStoreName] = React.useState(user?.storeName || "");
  const [storeSlug, setStoreSlug] = React.useState(user?.storeSlug || "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name || "");
      if (user.storeName) setStoreName(user.storeName);
      if (user.storeSlug) setStoreSlug(user.storeSlug);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({
      name,
      phone,
      storeName: role === "SELLER" ? storeName : undefined,
      storeSlug: role === "SELLER" ? storeSlug : undefined,
    });
    setSaving(false);

    if (res.success) {
      toast({
        title: "Profile Saved",
        description: "Your account changes were successfully updated.",
        variant: "success",
      });
    } else {
      toast({
        title: "Update Failed",
        description: res.error || "Unable to save profile changes.",
        variant: "error",
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Signed Out",
      description: "You have been logged out of your session.",
      variant: "info",
    });
    router.push("/login");
  };

  const getDashboardUrl = () => {
    if (role === "CUSTOMER") return "/customer/dashboard";
    if (role === "SELLER") return "/seller/dashboard";
    return "/admin/dashboard";
  };

  return (
    <RoleGuard allowedRoles={["CUSTOMER", "SELLER", "ADMIN"]}>
      <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <User className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    {user?.name || "User Profile"}
                  </h1>
                  <Badge
                    variant={
                      role === "ADMIN"
                        ? "destructive"
                        : role === "SELLER"
                        ? "ai"
                        : "success"
                    }
                    dot
                  >
                    {role}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href={getDashboardUrl()}>
                <Button variant="outline" size="sm">
                  Go to {role} Dashboard
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-5">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your contact and display name across Gadgets World.
                </CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Display Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                />
                <Input
                  label="Email Address"
                  value={user?.email || ""}
                  disabled
                  helperText="Managed via Supabase Auth identity"
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300 tracking-wide">
                    Account Created
                  </label>
                  <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-400 font-mono">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Active Member"}
                  </div>
                </div>
              </div>
            </Card>

            {/* Role-Specific Card */}
            {role === "SELLER" && (
              <Card className="p-6 border-indigo-500/20 bg-slate-900/60 space-y-4">
                <CardHeader className="p-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-indigo-400" />
                    <CardTitle className="text-base font-semibold">
                      Seller Storefront Settings
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Public identity and URL parameters for your marketplace storefront.
                  </CardDescription>
                </CardHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Store Name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                  <Input
                    label="Store Slug"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value)}
                    helperText="cortex-pulse.ai/store/{slug}"
                  />
                </div>
              </Card>
            )}

            {role === "CUSTOMER" && (
              <Card className="p-6 border-cyan-500/20 bg-slate-900/60 space-y-4">
                <CardHeader className="p-0 pb-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-cyan-400" />
                    <CardTitle className="text-base font-semibold">
                      Customer Preferences
                    </CardTitle>
                  </div>
                  <CardDescription>
                    AI recommendation and discovery telemetry settings.
                  </CardDescription>
                </CardHeader>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-200">
                      Adaptive Vector Telemetry
                    </p>
                    <p className="text-slate-400">
                      Enables behavioral click &amp; dwell time learning for personalized feeds.
                    </p>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>
              </Card>
            )}

            {role === "ADMIN" && (
              <Card className="p-6 border-purple-500/20 bg-slate-900/60 space-y-4">
                <CardHeader className="p-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <CardTitle className="text-base font-semibold">
                      Administrative Privileges
                    </CardTitle>
                  </div>
                  <CardDescription>
                    System controls, user governance, and security audit settings.
                  </CardDescription>
                </CardHeader>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <p className="font-semibold text-slate-200">
                    Master Administrator Clearance
                  </p>
                  <p className="text-slate-400">
                    Access to Supabase SQL migrations, RLS bypass tokens, and merchant onboarding review.
                  </p>
                </div>
              </Card>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </main>

        <Footer />
      </div>
    </RoleGuard>
  );
}
