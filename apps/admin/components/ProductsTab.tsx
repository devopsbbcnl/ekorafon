"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyMessage, LevelBadge, Th, Td, Btn, G, GD, BORDER, TEXT, MUTED, LIGHT, fmt, fmtDate } from "./shared";

interface ProductRow {
  id: string; name: string; category: string; unitPrice: number; moq: number;
  unit: string; inStock: boolean; leadTimeDays: number; createdAt: string;
  supplier: { name: string; email: string };
  factory:  { businessName: string; verificationLevel: string } | null;
  _count:   { orderItems: number };
}

interface RFQRow {
  id: string; title: string; category: string; quantity: number;
  budgetMin: number; budgetMax: number; status: string; deadline: string; createdAt: string;
  buyer:  { name: string; email: string };
  _count: { quotes: number };
}

interface QuoteRow {
  id: string; unitPrice: number; totalPrice: number; leadTimeDays: number;
  status: string; validUntil: string; createdAt: string;
  rfq:      { id: string; title: string; status: string };
  supplier: { name: string; factory: { businessName: string } | null };
}

const RFQ_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  OPEN:      { bg: "#D1FAE5", color: "#065F46", label: "Open" },
  REVIEWING: { bg: "#DBEAFE", color: "#1E40AF", label: "Reviewing" },
  AWARDED:   { bg: "#FEF3C7", color: "#92400E", label: "Awarded" },
  CLOSED:    { bg: "#F3F4F6", color: "#374151", label: "Closed" },
  CANCELLED: { bg: "#FEE2E2", color: "#B91C1C", label: "Cancelled" },
};

const QUOTE_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:   { bg: "#F3F4F6", color: "#374151", label: "Pending" },
  ACCEPTED:  { bg: "#D1FAE5", color: "#065F46", label: "Accepted" },
  REJECTED:  { bg: "#FEE2E2", color: "#B91C1C", label: "Rejected" },
  WITHDRAWN: { bg: "#F3F4F6", color: "#6B7280", label: "Withdrawn" },
};

type View = "products" | "rfqs" | "quotes";

function ProductsView() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("ALL");
  const [acting, setActing]     = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get<ProductRow[]>("/admin/products").then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleStock(p: ProductRow) {
    setActing(p.id);
    try { await api.patch(`/admin/products/${p.id}/stock`, { inStock: !p.inStock }); load(); }
    catch { /* noop */ } finally { setActing(null); }
  }

  async function remove(p: ProductRow) {
    if (!window.confirm(`Remove listing "${p.name}"? This cannot be undone.`)) return;
    setActing(p.id);
    try { await api.delete(`/admin/products/${p.id}`); load(); }
    catch { /* noop */ } finally { setActing(null); }
  }

  const shown = filter === "ALL" ? products : filter === "IN_STOCK" ? products.filter((p) => p.inStock) : products.filter((p) => !p.inStock);

  return (
    <>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {[["ALL", "All"], ["IN_STOCK", "In Stock"], ["DELISTED", "Delisted"]].map(([key, label]) => {
          const active = filter === key;
          return (
            <button key={key} onClick={() => setFilter(key)} style={{ padding: "5px 12px", borderRadius: "4px", border: `1px solid ${active ? G : BORDER}`, backgroundColor: active ? G : "white", color: active ? "white" : MUTED, fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              {label} ({key === "ALL" ? products.length : key === "IN_STOCK" ? products.filter((p) => p.inStock).length : products.filter((p) => !p.inStock).length})
            </button>
          );
        })}
      </div>
      {loading ? <Spinner /> : shown.length === 0 ? <EmptyMessage text="No products found." /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Product", "Supplier / Factory", "Category", "Price", "MOQ", "Orders", "Status", "Listed", "Actions"].map((h) => <Th key={h}>{h}</Th>)}</tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}>
                  <Td style={{ fontWeight: 600, color: TEXT }}>{p.name}</Td>
                  <Td>
                    <div style={{ color: TEXT }}>{p.factory?.businessName ?? p.supplier.name}</div>
                    {p.factory && <LevelBadge level={p.factory.verificationLevel} />}
                  </Td>
                  <Td style={{ color: MUTED }}>{p.category}</Td>
                  <Td style={{ fontWeight: 700, color: G, whiteSpace: "nowrap" }}>{fmt(p.unitPrice)}/{p.unit}</Td>
                  <Td style={{ color: MUTED }}>{p.moq.toLocaleString()}</Td>
                  <Td style={{ color: MUTED }}>{p._count.orderItems}</Td>
                  <Td>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: p.inStock ? "#D1FAE5" : "#FEE2E2", color: p.inStock ? "#065F46" : "#B91C1C" }}>
                      {p.inStock ? "In Stock" : "Delisted"}
                    </span>
                  </Td>
                  <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(p.createdAt)}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Btn size="sm" variant={p.inStock ? "ghost" : "outline"} disabled={acting === p.id} onClick={() => toggleStock(p)}>
                        {acting === p.id ? "…" : p.inStock ? "Delist" : "Relist"}
                      </Btn>
                      <Btn size="sm" variant="danger" disabled={acting === p.id} onClick={() => remove(p)}>Remove</Btn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function RFQsView() {
  const [rfqs, setRfqs]     = useState<RFQRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    api.get<RFQRow[]>("/admin/rfqs").then(setRfqs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statuses = ["ALL", ...Object.keys(RFQ_STATUS)];
  const counts   = statuses.slice(1).reduce<Record<string, number>>((a, s) => { a[s] = rfqs.filter((r) => r.status === s).length; return a; }, {});
  const shown    = filter === "ALL" ? rfqs : rfqs.filter((r) => r.status === filter);

  return (
    <>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {statuses.map((s) => {
          const active = filter === s;
          const count  = s === "ALL" ? rfqs.length : counts[s] ?? 0;
          const sty    = s !== "ALL" ? RFQ_STATUS[s] : null;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 12px", borderRadius: "4px", border: `1px solid ${active ? G : BORDER}`, backgroundColor: active ? G : "white", color: active ? "white" : MUTED, fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              {sty ? sty.label : "All"} ({count})
            </button>
          );
        })}
      </div>
      {loading ? <Spinner /> : shown.length === 0 ? <EmptyMessage text="No RFQs found." /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["RFQ", "Buyer", "Category", "Qty", "Budget", "Quotes", "Status", "Deadline", "Posted"].map((h) => <Th key={h}>{h}</Th>)}</tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const rs = RFQ_STATUS[r.status] ?? RFQ_STATUS.OPEN;
                return (
                  <tr key={r.id}>
                    <Td style={{ fontWeight: 600, color: TEXT, maxWidth: "220px" }}>{r.title}</Td>
                    <Td>
                      <div style={{ color: TEXT }}>{r.buyer.name}</div>
                      <div style={{ fontSize: "11px", color: MUTED }}>{r.buyer.email}</div>
                    </Td>
                    <Td style={{ color: MUTED }}>{r.category}</Td>
                    <Td style={{ color: MUTED }}>{r.quantity.toLocaleString()}</Td>
                    <Td style={{ color: G, fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(r.budgetMin)} – {fmt(r.budgetMax)}</Td>
                    <Td style={{ color: MUTED }}>{r._count.quotes}</Td>
                    <Td><span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: rs.bg, color: rs.color }}>{rs.label}</span></Td>
                    <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(r.deadline)}</Td>
                    <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(r.createdAt)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function QuotesView() {
  const [quotes, setQuotes]   = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("ALL");

  useEffect(() => {
    api.get<QuoteRow[]>("/admin/quotes").then(setQuotes).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statuses = ["ALL", ...Object.keys(QUOTE_STATUS)];
  const counts   = statuses.slice(1).reduce<Record<string, number>>((a, s) => { a[s] = quotes.filter((q) => q.status === s).length; return a; }, {});
  const shown    = filter === "ALL" ? quotes : quotes.filter((q) => q.status === filter);

  return (
    <>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {statuses.map((s) => {
          const active = filter === s;
          const count  = s === "ALL" ? quotes.length : counts[s] ?? 0;
          const sty    = s !== "ALL" ? QUOTE_STATUS[s] : null;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 12px", borderRadius: "4px", border: `1px solid ${active ? G : BORDER}`, backgroundColor: active ? G : "white", color: active ? "white" : MUTED, fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              {sty ? sty.label : "All"} ({count})
            </button>
          );
        })}
      </div>
      {loading ? <Spinner /> : shown.length === 0 ? <EmptyMessage text="No quotes found." /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["RFQ", "Supplier", "Unit Price", "Total", "Lead Time", "Status", "Valid Until", "Submitted"].map((h) => <Th key={h}>{h}</Th>)}</tr>
            </thead>
            <tbody>
              {shown.map((q) => {
                const qs = QUOTE_STATUS[q.status] ?? QUOTE_STATUS.PENDING;
                return (
                  <tr key={q.id}>
                    <Td style={{ fontWeight: 600, color: TEXT, maxWidth: "220px" }}>{q.rfq.title}</Td>
                    <Td>{q.supplier.factory?.businessName ?? q.supplier.name}</Td>
                    <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmt(q.unitPrice)}</Td>
                    <Td style={{ fontWeight: 700, color: G, whiteSpace: "nowrap" }}>{fmt(q.totalPrice)}</Td>
                    <Td style={{ color: MUTED }}>{q.leadTimeDays}d</Td>
                    <Td><span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: qs.bg, color: qs.color }}>{qs.label}</span></Td>
                    <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(q.validUntil)}</Td>
                    <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(q.createdAt)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function ProductsTab() {
  const [view, setView] = useState<View>("products");

  const views: { id: View; label: string }[] = [
    { id: "products", label: "Products" },
    { id: "rfqs",     label: "RFQs" },
    { id: "quotes",   label: "Quotes" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 16px 0", display: "flex", gap: "4px", borderBottom: `1px solid ${BORDER}` }}>
        {views.map((v) => {
          const active = view === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                padding: "9px 14px", border: "none", borderBottom: active ? `2px solid ${G}` : "2px solid transparent",
                backgroundColor: "transparent", color: active ? GD : MUTED, fontSize: "13px", fontWeight: 700, cursor: "pointer",
              }}
            >
              {v.label}
            </button>
          );
        })}
      </div>
      {view === "products" && <ProductsView />}
      {view === "rfqs"     && <RFQsView />}
      {view === "quotes"   && <QuotesView />}
    </div>
  );
}
