"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyMessage, Th, Td, Btn, G, BORDER, TEXT, MUTED, LIGHT, fmt, fmtDate } from "./shared";

interface ReviewRow {
  id: string; rating: number; comment?: string; createdAt: string;
  buyer:    { name: string; email: string };
  supplier: { name: string; factory: { businessName: string } | null };
  order:    { id: string; totalAmount: number };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#F59E0B", fontSize: "13px", letterSpacing: "1px" }}>
      {"★".repeat(rating)}<span style={{ color: "#E5E7EB" }}>{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("ALL");
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get<ReviewRow[]>("/admin/reviews").then(setReviews).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function remove(r: ReviewRow) {
    if (!window.confirm(`Remove this review from ${r.buyer.name}? This cannot be undone.`)) return;
    setRemoving(r.id);
    try { await api.delete(`/admin/reviews/${r.id}`); load(); }
    catch { /* noop */ } finally { setRemoving(null); }
  }

  const ratings = ["ALL", "5", "4", "3", "2", "1"];
  const counts  = ratings.slice(1).reduce<Record<string, number>>((a, s) => { a[s] = reviews.filter((r) => String(r.rating) === s).length; return a; }, {});
  const shown   = filter === "ALL" ? reviews : reviews.filter((r) => String(r.rating) === filter);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Summary */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div>
          <span style={{ fontSize: "11px", color: MUTED }}>Average rating </span>
          <span style={{ fontSize: "15px", fontWeight: 900, color: G }}>{avgRating}</span>
        </div>
        <div>
          <span style={{ fontSize: "11px", color: MUTED }}>Total reviews </span>
          <span style={{ fontSize: "15px", fontWeight: 900, color: TEXT }}>{reviews.length}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {ratings.map((s) => {
          const active = filter === s;
          const count  = s === "ALL" ? reviews.length : counts[s] ?? 0;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 12px", borderRadius: "4px", border: `1px solid ${active ? G : BORDER}`, backgroundColor: active ? G : "white", color: active ? "white" : MUTED, fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              {s === "ALL" ? "All" : `${s} ★`} ({count})
            </button>
          );
        })}
      </div>

      {loading ? <Spinner /> : shown.length === 0 ? <EmptyMessage text="No reviews found." /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Buyer", "Supplier / Factory", "Rating", "Comment", "Order", "Date", "Actions"].map((h) => <Th key={h}>{h}</Th>)}</tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <Td>
                    <div style={{ color: TEXT, fontWeight: 600 }}>{r.buyer.name}</div>
                    <div style={{ fontSize: "11px", color: MUTED }}>{r.buyer.email}</div>
                  </Td>
                  <Td>{r.supplier.factory?.businessName ?? r.supplier.name}</Td>
                  <Td><Stars rating={r.rating} /></Td>
                  <Td style={{ maxWidth: "260px" }}>
                    {r.comment
                      ? <span style={{ fontSize: "12px", color: MUTED, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.comment}</span>
                      : <span style={{ color: LIGHT, fontSize: "12px" }}>—</span>}
                  </Td>
                  <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmt(r.order.totalAmount)}</Td>
                  <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(r.createdAt)}</Td>
                  <Td>
                    <Btn size="sm" variant="danger" disabled={removing === r.id} onClick={() => remove(r)}>
                      {removing === r.id ? "…" : "Remove"}
                    </Btn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
