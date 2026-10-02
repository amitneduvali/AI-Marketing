"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  fetchPersonalizedOffers,
  PersonalizedOfferItem,
  PersonalizedOffersResponse,
} from "@/lib/api/marketing";
import {
  Sparkles,
  Tag,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Clock,
  Info,
  Gift,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PersonalizedOffersPage() {
  const [data, setData] = useState<PersonalizedOffersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Read demo or current customer ID if stored in localStorage
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("cortex_user") : null;
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const userId = parsedUser?.id || "usr-customer-demo";
      const sessionId = typeof window !== "undefined" ? localStorage.getItem("guest_session_id") || "sess-guest-default" : "sess-guest-default";

      const res = await fetchPersonalizedOffers(userId, sessionId);
      setData(res);
    } catch (err: any) {
      console.error("Failed to load personalized offers:", err);
      setError(err.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-cyan-800/40 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 p-8 sm:p-10">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-lg shadow-cyan-950/50">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI-Generated Marketing Recommendations</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Personalized In-App Deals & Offers
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Curated promotional offers generated exclusively for you based on your recent catalog exploration, category affinity, and purchase history.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strictly In-App Telemetry • No Real Email or SMS Broadcasts Dispatched</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400">Synthesizing personalized offers from your interaction history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-800 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Offers Grid */}
        {data && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-cyan-400" />
                  Your Active AI Recommendations ({data.offers.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Offers update dynamically as you browse and purchase across the catalog.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-5 hover:border-cyan-800/60 transition-all duration-300 shadow-xl shadow-slate-950/40 relative overflow-hidden group"
                >
                  {/* Glowing subtle accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                        {offer.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                        {offer.discount_percent}% OFF
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {offer.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {offer.description}
                    </p>

                    {/* AI Explainability Rationale */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                      <div className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        AI Personalization Reason
                      </div>
                      <p className="text-slate-300 italic">&ldquo;{offer.reason}&rdquo;</p>
                    </div>

                    {/* Linked Product Feature */}
                    <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Suggested Product</span>
                        <span className="text-xs font-semibold text-slate-200 truncate block">
                          {offer.suggested_product_title}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white font-mono shrink-0">
                        ${offer.suggested_product_price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Promo Code & Action */}
                  <div className="space-y-3 pt-3 border-t border-slate-800/80 relative z-10">
                    <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
                          {offer.promo_code}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(offer.promo_code)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
                        title="Copy coupon code"
                      >
                        {copiedCode === offer.promo_code ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <Link href={`/products/${offer.suggested_product_id}`} className="block">
                      <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs py-2 h-auto flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/50">
                        <span>View Product & Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Transparency Notice Footer */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-3">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Ethical AI Transparency: </span>
                {data.notice} Customer segmentation and offer relevance adapt directly from localized behavioral telemetry without harvesting sensitive personal identifying information.
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
