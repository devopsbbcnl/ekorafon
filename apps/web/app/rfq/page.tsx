"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Nav } from "@/components/nav";
import Footer from "@/components/footer";

interface RFQ {
  id: string;
  title: string;
  category: string;
  quantity: number;
  budgetMin: number;
  budgetMax: number;
  deliveryLocation: string;
  deadline: string;
  customizationRequired: boolean;
  createdAt: string;
  buyer: { name: string; etrs: { score: number } | null };
  _count: { quotes: number };
}

const G = "#008751";
const GD = "#006641";
const BORDER = "#E8E8E8";
const TEXT = "#333333";
const MUTED = "#666666";
const BG = "#F5F5F5";

type SortKey = "deadline" | "budget" | "quotes" | "newest";

export default function RFQBoardPage() {
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortKey>("deadline");
  const user = getUser();

  useEffect(() => {
    api.get<RFQ[]>("/rfq").then(setRFQs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(rfqs.map((r) => r.category))).sort();
    return ["All", ...cats];
  }, [rfqs]);

  const filtered = useMemo(() => {
    let list = rfqs;
    if (category !== "All") list = list.filter((r) => r.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.deliveryLocation.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sort === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (sort === "budget") return b.budgetMax - a.budgetMax;
      if (sort === "quotes") return b._count.quotes - a._count.quotes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [rfqs, category, search, sort]);

  const daysLeft = (deadline: string) => Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000));

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <Nav active="rfq" />

      <div className="px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: G }}>Open RFQs</p>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: TEXT }}>Sourcing Requests</h1>
            <p className="text-sm mt-1" style={{ color: MUTED }}>Active requests from verified buyers seeking manufacturers</p>
          </div>
          {user?.role === "BUYER" && (
            <Link
              href="/dashboard/buyer/rfq/new"
              className="px-5 py-2.5 font-semibold rounded text-xs shrink-0"
              style={{ backgroundColor: G, color: "white", textDecoration: "none" }}
            >
              + Post RFQ
            </Link>
          )}
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by title, category, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded border text-sm outline-none"
            style={{ borderColor: BORDER, backgroundColor: "white", color: TEXT }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-4 py-2.5 rounded border text-sm outline-none"
            style={{ borderColor: BORDER, backgroundColor: "white", color: TEXT, minWidth: "160px" }}
          >
            <option value="deadline">Sort: Deadline (soonest)</option>
            <option value="budget">Sort: Budget (highest)</option>
            <option value="quotes">Sort: Most Quoted</option>
            <option value="newest">Sort: Newest</option>
          </select>
        </div>

        {/* Category tabs */}
        {!loading && categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: "none" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="shrink-0 rounded-full text-xs font-semibold px-4 py-1.5 transition-all"
                style={{
                  backgroundColor: category === cat ? G : "white",
                  color: category === cat ? "white" : MUTED,
                  border: `1px solid ${category === cat ? G : BORDER}`,
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && rfqs.length > 0 && (
          <p className="text-xs mb-4" style={{ color: MUTED }}>
            Showing <strong style={{ color: TEXT }}>{filtered.length}</strong> of {rfqs.length} open requests
          </p>
        )}

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded border animate-pulse" style={{ backgroundColor: "#EBEBEB", borderColor: BORDER, height: "100px" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded border" style={{ backgroundColor: "white", borderColor: BORDER }}>
            <p className="font-semibold text-sm" style={{ color: TEXT }}>
              {rfqs.length === 0 ? "No open sourcing requests" : "No results match your search"}
            </p>
            <p className="text-xs mt-1 mb-5" style={{ color: MUTED }}>
              {rfqs.length === 0 ? "Be the first buyer to post an RFQ on Ekorafon" : "Try a different search term or category"}
            </p>
            {rfqs.length === 0 && (
              <Link href="/auth/register?role=buyer" className="inline-block px-5 py-2.5 text-xs font-semibold rounded" style={{ backgroundColor: G, color: "white", textDecoration: "none" }}>
                Post an RFQ
              </Link>
            )}
            {rfqs.length > 0 && (
              <button onClick={() => { setSearch(""); setCategory("All"); }} className="text-xs font-semibold" style={{ color: G, background: "none", border: "none", cursor: "pointer" }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((r) => {
              const days = daysLeft(r.deadline);
              const urgencyColor = days <= 2 ? "#B91C1C" : days <= 7 ? "#92400E" : GD;
              return (
                <div key={r.id} className="bg-white rounded border hover:shadow-sm transition-all overflow-hidden" style={{ borderColor: BORDER }}>
                  <div className="h-0.5 w-full" style={{ backgroundColor: days <= 3 ? "#B91C1C" : G }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-base leading-tight" style={{ color: TEXT }}>{r.title}</h3>
                          {r.customizationRequired && (
                            <span className="rounded font-semibold shrink-0" style={{ backgroundColor: "#FEF3C7", color: "#92400E", fontSize: "10px", padding: "2px 6px" }}>
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs mb-3" style={{ color: MUTED }}>
                          {r.category} &middot; {r.quantity.toLocaleString()} units &middot; {r.deliveryLocation}
                        </p>
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                          <span>
                            <span className="font-semibold" style={{ color: TEXT }}>Budget: </span>
                            <span style={{ color: MUTED }}>&#8358;{r.budgetMin.toLocaleString()} &ndash; &#8358;{r.budgetMax.toLocaleString()}</span>
                          </span>
                          <span>
                            <span className="font-semibold" style={{ color: TEXT }}>Buyer: </span>
                            <span style={{ color: MUTED }}>{r.buyer.name}</span>
                          </span>
                          {r.buyer.etrs && r.buyer.etrs.score > 0 && (
                            <span style={{ color: G }} className="font-semibold">ETRS {r.buyer.etrs.score.toFixed(1)}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-5" style={{ borderLeft: `1px solid ${BORDER}` }}>
                        <div className="text-2xl font-black" style={{ color: G }}>{r._count.quotes}</div>
                        <div className="text-xs" style={{ color: "#999999" }}>quotes</div>
                        <div className="mt-2 text-xs font-bold" style={{ color: urgencyColor }}>{days}d left</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${BORDER}` }}>
                      <span className="text-xs" style={{ color: MUTED }}>
                        Posted {new Date(r.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                      </span>
                      <Link
                        href={`/rfq/${r.id}`}
                        className="px-4 py-2 text-xs font-semibold rounded transition-opacity hover:opacity-80"
                        style={{ backgroundColor: user?.role === "SUPPLIER" ? G : "transparent", color: user?.role === "SUPPLIER" ? "white" : G, textDecoration: "none", border: user?.role === "SUPPLIER" ? "none" : `1px solid ${G}` }}
                      >
                        {user?.role === "SUPPLIER" ? "Submit Quote →" : "View Details →"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
