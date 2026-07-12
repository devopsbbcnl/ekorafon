"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyMessage, Th, Td, Btn, G, BORDER, TEXT, MUTED, LIGHT, fmt, fmtDate } from "./shared";

interface OrderRow {
  id: string; status: string; source: string; totalAmount: number;
  deliveryAddress: string; notes?: string; createdAt: string;
  buyer:    { name: string; email: string };
  supplier: { name: string; factory: { businessName: string } | null };
  items:    { quantity: number; unitPrice: number; total: number; product: { name: string } }[];
  payment:  { status: string; amount: number } | null;
}

const ORDER_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:       { bg: "#F3F4F6", color: "#374151", label: "Pending" },
  CONFIRMED:     { bg: "#DBEAFE", color: "#1E40AF", label: "Confirmed" },
  IN_PRODUCTION: { bg: "#EDE9FE", color: "#5B21B6", label: "In Production" },
  SHIPPED:       { bg: "#CFFAFE", color: "#0E7490", label: "Shipped" },
  DELIVERED:     { bg: "#D1FAE5", color: "#065F46", label: "Delivered" },
  CANCELLED:     { bg: "#F3F4F6", color: "#374151", label: "Cancelled" },
  DISPUTED:      { bg: "#FEE2E2", color: "#B91C1C", label: "Disputed" },
};

const RESOLVABLE_STATUSES = ["CONFIRMED", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"];

function ResolveDisputeModal({
  order, onClose, onResolve, resolving,
}: {
  order: OrderRow;
  onClose: () => void;
  onResolve: (status: string) => void;
  resolving: boolean;
}) {
  const [status, setStatus] = useState("DELIVERED");

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ backgroundColor: "white", borderRadius: "4px", width: "100%", maxWidth: "460px" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: TEXT }}>Resolve Dispute</div>
            <div style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>Order #{order.id.slice(0, 8)}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: MUTED }}>×</button>
        </div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ backgroundColor: "#F5F5F5", borderRadius: "4px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              ["Buyer", `${order.buyer.name} (${order.buyer.email})`],
              ["Supplier", order.supplier.factory?.businessName ?? order.supplier.name],
              ["Amount", fmt(order.totalAmount)],
              ["Placed", fmtDate(order.createdAt)],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
                <span style={{ color: LIGHT, minWidth: "80px", flexShrink: 0 }}>{l}</span>
                <span style={{ color: TEXT, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: "6px" }}>
              Resolve to status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "4px", border: `1px solid ${BORDER}`, fontSize: "13px", color: TEXT, backgroundColor: "white", outline: "none" }}
            >
              {RESOLVABLE_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS[s].label}</option>)}
            </select>
          </div>
          <Btn variant="primary" disabled={resolving} onClick={() => onResolve(status)}>
            {resolving ? "Saving…" : "Apply Resolution"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default function OrdersTab() {
  const [orders, setOrders]   = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("ALL");
  const [resolving, setResolving] = useState<string | null>(null);
  const [selected, setSelected]   = useState<OrderRow | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get<OrderRow[]>("/admin/orders").then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function resolveDispute(order: OrderRow, status: string) {
    setResolving(order.id);
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status });
      setSelected(null);
      load();
    } catch { /* noop */ } finally { setResolving(null); }
  }

  const statuses = ["ALL", ...Object.keys(ORDER_STATUS)];
  const counts   = statuses.slice(1).reduce<Record<string, number>>((a, s) => { a[s] = orders.filter((o) => o.status === s).length; return a; }, {});
  const shown    = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {selected && (
        <ResolveDisputeModal
          order={selected}
          onClose={() => setSelected(null)}
          onResolve={(status) => resolveDispute(selected, status)}
          resolving={resolving === selected.id}
        />
      )}

      {/* Filter bar */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {statuses.map((s) => {
          const active = filter === s;
          const count  = s === "ALL" ? orders.length : counts[s] ?? 0;
          const sty    = s !== "ALL" ? ORDER_STATUS[s] : null;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 12px", borderRadius: "4px", border: `1px solid ${active ? G : BORDER}`, backgroundColor: active ? G : "white", color: active ? "white" : MUTED, fontSize: "12px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              {sty ? sty.label : "All"} ({count})
            </button>
          );
        })}
      </div>

      {loading ? <Spinner /> : shown.length === 0 ? <EmptyMessage text="No orders found." /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Order", "Buyer", "Supplier / Factory", "Items", "Amount", "Status", "Payment", "Placed", "Actions"].map((h) => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => {
                const os = ORDER_STATUS[o.status] ?? ORDER_STATUS.PENDING;
                return (
                  <tr key={o.id}>
                    <Td><span style={{ fontSize: "11px", fontFamily: "monospace", color: MUTED }}>#{o.id.slice(0, 8)}</span></Td>
                    <Td>
                      <div style={{ color: TEXT, fontWeight: 600 }}>{o.buyer.name}</div>
                      <div style={{ fontSize: "11px", color: MUTED }}>{o.buyer.email}</div>
                    </Td>
                    <Td>{o.supplier.factory?.businessName ?? o.supplier.name}</Td>
                    <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{o.items.length} item{o.items.length !== 1 ? "s" : ""}</Td>
                    <Td style={{ fontWeight: 700, color: G, whiteSpace: "nowrap" }}>{fmt(o.totalAmount)}</Td>
                    <Td><span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: os.bg, color: os.color }}>{os.label}</span></Td>
                    <Td style={{ color: MUTED }}>{o.payment ? o.payment.status : <span style={{ color: LIGHT }}>—</span>}</Td>
                    <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(o.createdAt)}</Td>
                    <Td>
                      {o.status === "DISPUTED" ? (
                        <Btn size="sm" variant="danger" onClick={() => setSelected(o)}>Resolve →</Btn>
                      ) : (
                        <span style={{ color: LIGHT, fontSize: "12px" }}>—</span>
                      )}
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
