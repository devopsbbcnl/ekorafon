"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Nav } from "@/components/nav";
import Footer from "@/components/footer";

interface Factory {
  id: string;
  businessName: string;
  description: string;
  lga: string;
  productCategories: string[];
  moq: number;
  exportReady: boolean;
  verificationLevel: string;
  teamSize: number;
  yearsOfOperation: number;
  user: { name: string; etrs: { score: number } | null };
}

const VERIFICATION_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  UNVERIFIED:         { label: "Unverified",        color: "#6B7280", bg: "#F3F4F6" },
  VERIFIED_BUSINESS:  { label: "Verified Business", color: "#1D4ED8", bg: "#DBEAFE" },
  VERIFIED_FACILITY:  { label: "Verified Facility", color: "#6D28D9", bg: "#EDE9FE" },
  FACTORY_CERTIFIED:  { label: "Certified",         color: "#6B4B10", bg: "#FEF3C7" },
  EXPORT_CERTIFIED:   { label: "Export Ready",      color: "#064E30", bg: "#DCFCE7" },
};

const G = "#008751";
const GD = "#006641";
const GT = "#E8F5EE";
const BORDER = "#E8E8E8";
const TEXT = "#333333";
const MUTED = "#666666";

export default function FactoriesPage() {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    api.get<Factory[]>(`/factory?${params}`).then(setFactories).finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <Nav active="factories" />

      <div className="px-6 md:px-10 py-8">

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: G }}>Factory Directory</p>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: TEXT }}>Aba Manufacturers</h1>
            <p className="text-sm mt-1" style={{ color: MUTED }}>Verified factories and producers across Aba, Abia State</p>
          </div>
          <Link
            href="/auth/register?role=buyer"
            className="px-5 py-2.5 text-xs font-semibold rounded shrink-0 text-center"
            style={{ backgroundColor: G, color: "white", textDecoration: "none" }}
          >
            Post a Sourcing Request &rarr;
          </Link>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by factory name, product, or category..."
            className="w-full px-4 py-3 rounded border text-sm outline-none"
            style={{ borderColor: BORDER, backgroundColor: "white", color: TEXT }}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded border animate-pulse" style={{ backgroundColor: "#EBEBEB", borderColor: BORDER, height: "160px" }} />
            ))}
          </div>
        ) : factories.length === 0 ? (
          <div className="text-center py-20 rounded border" style={{ backgroundColor: "white", borderColor: BORDER }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: GT, borderRadius: "4px", margin: "0 auto 12px" }} />
            <p className="font-semibold text-sm" style={{ color: TEXT }}>
              {search ? `No results for "${search}"` : "No manufacturers listed yet"}
            </p>
            <p className="text-xs mt-1 mb-5" style={{ color: MUTED }}>
              {search ? "Try a different keyword" : "Be the first to list your factory"}
            </p>
            <Link
              href="/auth/register?role=supplier"
              className="inline-block px-5 py-2.5 text-xs font-semibold rounded"
              style={{ backgroundColor: G, color: "white", textDecoration: "none" }}
            >
              List Your Factory
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: MUTED }}>
              {factories.length} manufacturer{factories.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {factories.map((f) => {
                const badge = VERIFICATION_BADGE[f.verificationLevel] ?? VERIFICATION_BADGE.UNVERIFIED;
                const isVerified = f.verificationLevel !== "UNVERIFIED";
                return (
                  <Link
                    key={f.id}
                    href={`/factories/${f.id}`}
                    className="block bg-white rounded border hover:shadow-md transition-all overflow-hidden"
                    style={{ borderColor: BORDER, textDecoration: "none" }}
                  >
                    <div className="h-0.5 w-full" style={{ backgroundColor: isVerified ? G : BORDER }} />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-bold text-base leading-tight" style={{ color: TEXT }}>{f.businessName}</h3>
                          <p className="text-xs mt-0.5" style={{ color: MUTED }}>{f.lga}, Abia State</p>
                        </div>
                        <span
                          className="rounded font-semibold shrink-0"
                          style={{ backgroundColor: badge.bg, color: badge.color, fontSize: "10px", padding: "3px 7px" }}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-xs mb-4 leading-relaxed line-clamp-2" style={{ color: MUTED }}>
                        {f.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {f.productCategories.slice(0, 3).map((c) => (
                          <span key={c} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: GT, color: GD }}>{c}</span>
                        ))}
                        {f.productCategories.length > 3 && (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "#F5F5F5", color: "#999999" }}>
                            +{f.productCategories.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                        <div className="flex items-center gap-4 text-xs" style={{ color: MUTED }}>
                          <span><span className="font-semibold" style={{ color: TEXT }}>MOQ</span> {f.moq.toLocaleString()}</span>
                          <span>{f.teamSize} staff</span>
                          <span>{f.yearsOfOperation} yrs</span>
                          {f.exportReady && <span className="font-semibold" style={{ color: GD }}>Export Ready</span>}
                        </div>
                        {f.user.etrs && f.user.etrs.score > 0 && (
                          <div className="text-right">
                            <span className="text-sm font-black" style={{ color: G }}>{f.user.etrs.score.toFixed(1)}</span>
                            <span className="text-xs ml-1" style={{ color: "#999999" }}>ETRS</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
