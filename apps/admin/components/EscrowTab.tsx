"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyMessage, Th, Td, Btn, G, BORDER, TEXT, MUTED, LIGHT, fmt, fmtDate } from "./shared";

interface Payment {
  id: string; paystackRef: string; amount: number; status: string;
  releasedAt?: string; createdAt: string;
  order: {
    id: string; status: string; source: string; totalAmount: number;
    buyer:    { name: string; email: string };
    supplier: { name: string; factory: { businessName: string } | null };
  };
}

const PAY_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:  { bg: "#F3F4F6", color: "#374151", label: "Pending" },
  SUCCESS:  { bg: "#D1FAE5", color: "#065F46", label: "In Escrow" },
  FAILED:   { bg: "#FEE2E2", color: "#B91C1C", label: "Failed" },
  REFUNDED: { bg: "#DBEAFE", color: "#1E40AF", label: "Refunded" },
  RELEASED: { bg: "#FEF3C7", color: "#92400E", label: "Released" },
};

const ORDER_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:       { bg: "#F3F4F6", color: "#374151",  label: "Pending" },
  CONFIRMED:     { bg: "#DBEAFE", color: "#1E40AF",  label: "Confirmed" },
  IN_PRODUCTION: { bg: "#EDE9FE", color: "#5B21B6",  label: "In Production" },
  SHIPPED:       { bg: "#CFFAFE", color: "#0E7490",  label: "Shipped" },
  DELIVERED:     { bg: "#D1FAE5", color: "#065F46",  label: "Delivered" },
  CANCELLED:     { bg: "#F3F4F6", color: "#374151",  label: "Cancelled" },
  DISPUTED:      { bg: "#FEE2E2", color: "#B91C1C",  label: "Disputed" },
};

export default function EscrowTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("ALL");
  const [acting, setActing]     = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get<Payment[]>("/admin/escrow").then(setPayments).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function release(id: string) {
    setActing(id);
    try { await api.patch(`/admin/escrow/${id}/release`, {}); load(); }
    catch { /* noop */ } finally { setActing(null); }
  }

  async function refund(id: string) {
    setActing(id);
    try { await api.patch(`/admin/escrow/${id}/refund`, {}); load(); }
    catch { /* noop */ } finally { setActing(null); }
  }

  const statuses = ["ALL", "SUCCESS", "RELEASED", "PENDING", "REFUNDED", "FAILED"];
  const counts   = statuses.slice(1).reduce<Record<string, number>>((a, s) => { a[s] = payments.filter((p) => p.status === s).length; return a; }, {});
  const shown    = filter === "ALL" ? payments : payments.filter((p) => p.status === filter);

  const escrowHeld     = payments.filter((p) => p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0);
  const totalReleased  = payments.filter((p) => p.status === "RELEASED").reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Escrow summary */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div>
          <span style={{ fontSize: "11px", color: MUTED }}>Currently in escrow </span>
          <span style={{ fontSize: "15px", fontWeight: 900, color: G }}>{fmt(escrowHeld)}</span>
        </div>
        <div>
          <span style={{ fontSize: "11px", color: MUTED }}>Total released </span>
          <span style={{ fontSize: "15px", fontWeight: 900, color: "#92400E" }}>{fmt(totalReleased)}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {statuses.map((s) => {
          const active = filter === s;
          const count  = s === "ALL" ? payments.length : counts[s] ?? 0;
          const sty    = s !== "ALL" ? PAY_STATUS[s] : null;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 12px", borderRadius: "4px", border: `1px solid ${active ? G : BORDER}`, backgroundColor: active ? G : "white", color: active ? "white" : MUTED, fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              {sty ? sty.label : "All"} ({count})
            </button>
          );
        })}
      </div>

      {loading ? <Spinner /> : shown.length === 0 ? <EmptyMessage text="No payments found." /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Ref", "Buyer", "Supplier / Factory", "Amount", "Order Status", "Payment Status", "Date", "Actions"].map((h) => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const ps = PAY_STATUS[p.status] ?? PAY_STATUS.PENDING;
                const os = ORDER_STATUS[p.order.status] ?? ORDER_STATUS.PENDING;
                return (
                  <tr key={p.id}>
                    <Td>
                      <div style={{ fontSize: "11px", fontFamily: "monospace", color: MUTED }}>{p.paystackRef.slice(0, 20)}…</div>
                      <div style={{ fontSize: "10px", color: LIGHT }}>{p.order.source}</div>
                    </Td>
                    <Td>
                      <div style={{ color: TEXT, fontWeight: 600 }}>{p.order.buyer.name}</div>
                      <div style={{ fontSize: "11px", color: MUTED }}>{p.order.buyer.email}</div>
                    </Td>
                    <Td>
                      <div style={{ color: TEXT }}>{p.order.supplier.factory?.businessName ?? p.order.supplier.name}</div>
                    </Td>
                    <Td style={{ fontWeight: 700, color: G, whiteSpace: "nowrap" }}>{fmt(p.amount)}</Td>
                    <Td>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: os.bg, color: os.color }}>{os.label}</span>
                    </Td>
                    <Td>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: ps.bg, color: ps.color }}>{ps.label}</span>
                      {p.releasedAt && <div style={{ fontSize: "10px", color: LIGHT, marginTop: "2px" }}>{fmtDate(p.releasedAt)}</div>}
                    </Td>
                    <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(p.createdAt)}</Td>
                    <Td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {p.status === "SUCCESS" && (
                          <>
                            <Btn size="sm" variant="primary" disabled={acting === p.id} onClick={() => release(p.id)}>
                              {acting === p.id ? "…" : "Release"}
                            </Btn>
                            <Btn size="sm" variant="ghost" disabled={acting === p.id} onClick={() => refund(p.id)}>
                              Refund
                            </Btn>
                          </>
                        )}
                        {p.status === "RELEASED" && (
                          <Btn size="sm" variant="ghost" disabled={acting === p.id} onClick={() => refund(p.id)}>
                            Refund
                          </Btn>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
