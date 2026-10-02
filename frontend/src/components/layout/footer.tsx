"use client";

import * as React from "react";
import { Cpu, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "error",
      });
      return;
    }
    toast({
      title: "Subscribed to Updates",
      description: `Welcome aboard! Updates will be sent to ${email}`,
      variant: "success",
    });
    setEmail("");
  };

  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Gadgets World
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The next-generation AI-powered e-commerce marketplace platform.
              Bridging buyers and sellers with predictive merchandising, intelligent recommendations, and autonomous marketing telemetry.
            </p>

            {/* Newsletter Subscription */}
            <form onSubmit={handleSubscribe} className="pt-2 max-w-sm space-y-2">
              <span className="text-xs font-semibold text-slate-300">
                Receive Platform Updates
              </span>
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="developer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  className="shrink-0 h-9"
                  rightIcon={<Send className="w-3 h-3" />}
                >
                  Join
                </Button>
              </div>
            </form>
          </div>

          {/* Platform Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#smart-shopping" className="hover:text-cyan-300 transition">
                  Smart Shopping
                </a>
              </li>
              <li>
                <a href="#recommendations" className="hover:text-cyan-300 transition">
                  Personalized Feed
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-300 transition">
                  Verified Merchants
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-300 transition">
                  Order Telemetry
                </a>
              </li>
            </ul>
          </div>

          {/* Seller Intelligence Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Sellers & AI
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#seller-intelligence" className="hover:text-cyan-300 transition">
                  Seller Intelligence
                </a>
              </li>
              <li>
                <a href="#marketing-ai" className="hover:text-cyan-300 transition">
                  Predictive Marketing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-300 transition">
                  Dynamic Pricing Engine
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-300 transition">
                  Inventory Forecaster
                </a>
              </li>
            </ul>
          </div>

          {/* Architecture / Dev Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Engineering
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="hover:text-cyan-300 transition">
                  FastAPI OpenAPI Docs
                </a>
              </li>
              <li>
                <a href="http://127.0.0.1:8000/api/v1/health" target="_blank" rel="noreferrer" className="hover:text-cyan-300 transition">
                  System Health Check
                </a>
              </li>
              <li>
                <a href="#design-system" className="hover:text-cyan-300 transition">
                  Design System Showcase
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-300 transition">
                  Supabase PostgreSQL Specs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} Gadgets World. Premium Electronics &amp; Smart Tech.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Production-Grade Foundation
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
