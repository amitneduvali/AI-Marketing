"use client";

import * as React from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type UserRole = "CUSTOMER" | "SELLER" | "ADMIN";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  storeName?: string;
  storeSlug?: string;
  phone?: string;
  createdAt?: string;
  avatarUrl?: string;
  preferences?: {
    newsletter?: boolean;
    aiRecommendations?: boolean;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  login: (email: string, password?: string, demoRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    meta?: { name?: string; storeName?: string; storeSlug?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "cortex_pulse_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Initialize session
  React.useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      setError(null);

      if (isSupabaseConfigured) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            const userMeta = session.user.user_metadata || {};
            const userRole = (userMeta.role as string)?.toUpperCase() as UserRole;
            const validRole: UserRole = ["CUSTOMER", "SELLER", "ADMIN"].includes(userRole)
              ? userRole
              : "CUSTOMER";

            setUser({
              id: session.user.id,
              email: session.user.email || "",
              role: validRole,
              name: userMeta.name || session.user.email?.split("@")[0] || "User",
              storeName: userMeta.store_name,
              storeSlug: userMeta.store_slug,
              createdAt: session.user.created_at,
              preferences: {
                newsletter: true,
                aiRecommendations: true,
              },
            });
          } else {
            setUser(null);
          }
        } catch (err: unknown) {
          console.error("Supabase auth init error:", err);
          checkLocalStorageFallback();
        }
      } else {
        checkLocalStorageFallback();
      }

      setIsLoading(false);
    }

    function checkLocalStorageFallback() {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          setUser(JSON.parse(cached));
        }
      } catch {
        setUser(null);
      }
    }

    initAuth();

    // Listen for Supabase auth state change if configured
    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const userMeta = session.user.user_metadata || {};
          const userRole = (userMeta.role as string)?.toUpperCase() as UserRole;
          const validRole: UserRole = ["CUSTOMER", "SELLER", "ADMIN"].includes(userRole)
            ? userRole
            : "CUSTOMER";

          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || "",
            role: validRole,
            name: userMeta.name || session.user.email?.split("@")[0] || "User",
            storeName: userMeta.store_name,
            storeSlug: userMeta.store_slug,
            createdAt: session.user.created_at,
            preferences: {
              newsletter: true,
              aiRecommendations: true,
            },
          };
          setUser(profile);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
          } catch {}
        } else {
          setUser(null);
          try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          } catch {}
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Login handler
  const login = async (email: string, password = "Password123!", demoRole?: UserRole) => {
    setIsLoading(true);
    setError(null);

    // If real Supabase is configured and not in quick demo mode
    if (isSupabaseConfigured && !demoRole) {
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setIsLoading(false);
          return { success: false, error: signInError.message };
        }

        if (data.user) {
          const userMeta = data.user.user_metadata || {};
          const userRole = (userMeta.role as string)?.toUpperCase() as UserRole;
          const validRole: UserRole = ["CUSTOMER", "SELLER", "ADMIN"].includes(userRole)
            ? userRole
            : "CUSTOMER";

          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            role: validRole,
            name: userMeta.name || email.split("@")[0],
            storeName: userMeta.store_name,
            storeSlug: userMeta.store_slug,
            createdAt: data.user.created_at,
          };

          setUser(profile);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
          } catch {}
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Authentication error";
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }
    }

    // Local / demo fallback mode (guarantees local testing works immediately without waiting for Supabase cloud keys)
    const assignedRole: UserRole = demoRole || (email.includes("seller") ? "SELLER" : email.includes("admin") ? "ADMIN" : "CUSTOMER");
    const mockProfile: UserProfile = {
      id: "usr-" + Math.random().toString(36).substring(2, 10),
      email,
      role: assignedRole,
      name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      storeName: assignedRole === "SELLER" ? "Apex Dynamics Store" : undefined,
      storeSlug: assignedRole === "SELLER" ? "apex-dynamics" : undefined,
      createdAt: new Date().toISOString(),
      preferences: {
        newsletter: true,
        aiRecommendations: true,
      },
    };

    setUser(mockProfile);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockProfile));
    } catch {}
    setIsLoading(false);
    return { success: true };
  };

  // Sign up handler
  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    meta?: { name?: string; storeName?: string; storeSlug?: string }
  ) => {
    setIsLoading(true);
    setError(null);

    if (isSupabaseConfigured) {
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role.toLowerCase(),
              name: meta?.name || email.split("@")[0],
              store_name: meta?.storeName,
              store_slug: meta?.storeSlug,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setIsLoading(false);
          return { success: false, error: signUpError.message };
        }

        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            role,
            name: meta?.name || email.split("@")[0],
            storeName: meta?.storeName,
            storeSlug: meta?.storeSlug,
            createdAt: data.user.created_at,
          };
          setUser(profile);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
          } catch {}
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Sign up error";
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }
    }

    // Local fallback
    const mockProfile: UserProfile = {
      id: "usr-" + Math.random().toString(36).substring(2, 10),
      email,
      role,
      name: meta?.name || email.split("@")[0],
      storeName: meta?.storeName,
      storeSlug: meta?.storeSlug,
      createdAt: new Date().toISOString(),
      preferences: {
        newsletter: true,
        aiRecommendations: true,
      },
    };
    setUser(mockProfile);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockProfile));
    } catch {}
    setIsLoading(false);
    return { success: true };
  };

  // Logout handler
  const logout = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Supabase signOut error:", err);
      }
    }
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
    setIsLoading(false);
  };

  // Profile update
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, error: "Not logged in" };
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.updateUser({
          data: {
            name: updated.name,
            store_name: updated.storeName,
            store_slug: updated.storeSlug,
          },
        });
      } catch (err) {
        console.error("Supabase updateUser error:", err);
      }
    }

    return { success: true };
  };

  // Switch role for quick testing
  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      role: newRole,
      storeName: newRole === "SELLER" ? (user.storeName || "Apex Dynamics Store") : user.storeName,
      storeSlug: newRole === "SELLER" ? (user.storeSlug || "apex-dynamics") : user.storeSlug,
    };
    setUser(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        error,
        isConfigured: isSupabaseConfigured,
        login,
        signUp,
        logout,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
