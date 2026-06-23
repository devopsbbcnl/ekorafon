"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Nav } from "@/components/nav";

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

export default function RFQBoardPage() {
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    api.get<RFQ[]>("/rfq").then(setRFQs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const daysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 86400000));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <Nav active="rfq" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
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

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded border animate-pulse" style={{ backgroundColor: "#EBEBEB", borderColor: BORDER, height: "100px" }} />
            ))}
          </div>
        ) : rfqs.length === 0 ? (
          <div className="text-center py-20 rounded border" style={{ backgroundColor: "white", borderColor: BORDER }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: "#E8F5EE", borderRadius: "4px", margin: "0 auto 12px" }} />
            <p className="font-semibold text-sm" style={{ color: TEXT }}>No open sourcing requests</p>
            <p className="text-xs mt-1 mb-5" style={{ color: MUTED }}>Be the first buyer to post an RFQ on Ekorafon</p>
            <Link
              href="/auth/register?role=buyer"
              className="inline-block px-5 py-2.5 text-xs font-semibold rounded"
              style={{ backgroundColor: G, color: "white", textDecoration: "none" }}
            >
              Post an RFQ
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rfqs.map((r) => {
              const days = daysLeft(r.deadline);
              const urgencyColor = days <= 2 ? "#B91C1C" : days <= 7 ? "#92400E" : GD;
              return (
                <div
                  key={r.id}
                  className="bg-white rounded border hover:shadow-sm transition-all overflow-hidden"
                  style={{ borderColor: BORDER }}
                >
                  <div className="h-0.5 w-full" style={{ backgroundColor: days <= 3 ? "#B91C1C" : G }} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-base leading-tight" style={{ color: TEXT }}>{r.title}</h3>
                          {r.customizationRequired && (
                            <span
                              className="rounded font-semibold shrink-0"
                              style={{ backgroundColor: "#FEF3C7", color: "#92400E", fontSize: "10px", padding: "2px 6px" }}
                            >
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
                            <span style={{ color: G }} className="font-semibold">
                              ETRS {r.buyer.etrs.score.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-5" style={{ borderLeft: `1px solid ${BORDER}` }}>
                        <div className="text-2xl font-black" style={{ color: G }}>{r._count.quotes}</div>
                        <div className="text-xs" style={{ color: "#999999" }}>quotes</div>
                        <div className="mt-2 text-xs font-bold" style={{ color: urgencyColor }}>
                          {days}d left
                        </div>
                      </div>
                    </div>

                    {user?.role === "SUPPLIER" && (
                      <div className="mt-4 pt-4 flex justify-end" style={{ borderTop: `1px solid ${BORDER}` }}>
                        <Link
                          href={`/rfq/${r.id}`}
                          className="px-4 py-2 text-xs font-semibold rounded transition-opacity hover:opacity-80"
                          style={{ backgroundColor: G, color: "white", textDecoration: "none" }}
                        >
                          Submit Quote &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
