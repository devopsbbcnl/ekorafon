"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, fmt, G, GD, BORDER, TEXT, MUTED } from "./shared";

interface Analytics {
  ordersByStatus: Record<string, { count: number; revenue: number }>;
  usersByRole:    Record<string, number>;
  topSuppliers:   { supplierId: string; name: string; revenue: number; orders: number }[];
  rfqsByStatus:   Record<string, number>;
  paymentsByStatus: Record<string, { count: number; amount: number }>;
}

const ORDER_COLOR: Record<string, string> = {
  PENDING: "#9CA3AF", CONFIRMED: "#1D4ED8", IN_PRODUCTION: "#6D28D9",
  SHIPPED: "#0E7490", DELIVERED: "#065F46", CANCELLED: "#374151", DISPUTED: "#B91C1C",
};

const RFQ_COLOR: Record<string, string> = {
  OPEN: "#065F46", REVIEWING: "#1E40AF", AWARDED: "#92400E", CLOSED: "#374151", CANCELLED: "#B91C1C",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT, marginBottom: "14px" }}>{children}</div>;
}

function BarChart({ data, colors, valueFormatter }: { data: [string, number][]; colors: Record<string, string>; valueFormatter?: (v: number) => string }) {
  const max = Math.max(...data.map(([, v]) => v), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {data.map(([label, value]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "130px", fontSize: "11px", fontWeight: 600, color: MUTED, textAlign: "right", flexShrink: 0 }}>
            {label.replace(/_/g, " ")}
          </div>
          <div style={{ flex: 1, height: "18px", backgroundColor: "#F5F5F5", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(value / max) * 100}%`, backgroundColor: colors[label] ?? G, borderRadius: "4px", transition: "width 0.4s ease" }} />
          </div>
          <div style={{ width: "80px", fontSize: "12px", fontWeight: 700, color: TEXT, flexShrink: 0, textAlign: "right" }}>
            {valueFormatter ? valueFormatter(value) : value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsTab() {
  const [data, setData]     = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Analytics>("/admin/analytics").then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data)   return <div style={{ padding: "24px", color: "#B91C1C", fontSize: "13px" }}>Failed to load analytics.</div>;

  const totalGMV  = data.ordersByStatus.DELIVERED?.revenue ?? 0;
  const totalOrders = Object.values(data.ordersByStatus).reduce((s, v) => s + v.count, 0);
  const totalUsers  = Object.values(data.usersByRole).reduce((s, v) => s + v, 0);
  const escrowHeld  = data.paymentsByStatus.SUCCESS?.amount ?? 0;

  const orderCountData = Object.entries(data.ordersByStatus).map(([k, v]) => [k, v.count] as [string, number]);
  const orderRevData   = Object.entries(data.ordersByStatus).filter(([, v]) => v.revenue > 0).map(([k, v]) => [k, v.revenue] as [string, number]);
  const rfqData        = Object.entries(data.rfqsByStatus).map(([k, v]) => [k, v] as [string, number]);
  const payData        = Object.entries(data.paymentsByStatus).map(([k, v]) => [k, v.amount] as [string, number]);

  const PAY_COLOR: Record<string, string> = {
    PENDING: "#9CA3AF", SUCCESS: "#065F46", FAILED: "#B91C1C", REFUNDED: "#1E40AF", RELEASED: "#92400E",
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {[
          { label: "Gross GMV",    value: fmt(totalGMV),  sub: "Delivered orders" },
          { label: "Total Orders", value: totalOrders,    sub: "All time" },
          { label: "Total Users",  value: totalUsers,     sub: `${data.usersByRole.BUYER ?? 0}B · ${data.usersByRole.SUPPLIER ?? 0}S` },
          { label: "Escrow Held",  value: fmt(escrowHeld), sub: "SUCCESS payments", accent: "#6D28D9" },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "16px" }}>
            <div style={{ fontSize: "20px", fontWeight: 900, color: accent ?? G, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: TEXT, marginTop: "4px" }}>{label}</div>
            {sub && <div style={{ fontSize: "11px", color: MUTED, marginTop: "2px" }}>{sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Orders by status — count */}
        <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
          <SectionTitle>Orders by Status (count)</SectionTitle>
          <BarChart data={orderCountData} colors={ORDER_COLOR} />
        </div>

        {/* Orders by status — revenue */}
        <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
          <SectionTitle>Revenue by Order Status</SectionTitle>
          <BarChart data={orderRevData} colors={ORDER_COLOR} valueFormatter={(v) => fmt(v)} />
        </div>

        {/* RFQs by status */}
        <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
          <SectionTitle>RFQs by Status</SectionTitle>
          <BarChart data={rfqData} colors={RFQ_COLOR} />
        </div>

        {/* Payments by status */}
        <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
          <SectionTitle>Payments by Status (value)</SectionTitle>
          <BarChart data={payData} colors={PAY_COLOR} valueFormatter={(v) => fmt(v)} />
        </div>
      </div>

      {/* Top suppliers */}
      <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
        <SectionTitle>Top Suppliers by Revenue (Delivered Orders)</SectionTitle>
        {data.topSuppliers.length === 0 ? (
          <p style={{ fontSize: "13px", color: MUTED }}>No delivered orders yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.topSuppliers.map((s, i) => {
              const maxRev = data.topSuppliers[0].revenue;
              return (
                <div key={s.supplierId} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "20px", fontSize: "12px", fontWeight: 900, color: i === 0 ? G : MUTED, flexShrink: 0, textAlign: "center" }}>
                    {i + 1}
                  </div>
                  <div style={{ width: "180px", flexShrink: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: TEXT }}>{s.name}</div>
                    <div style={{ fontSize: "11px", color: MUTED }}>{s.orders} orders</div>
                  </div>
                  <div style={{ flex: 1, height: "18px", backgroundColor: "#F5F5F5", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(s.revenue / maxRev) * 100}%`, backgroundColor: i === 0 ? G : GD, borderRadius: "4px", opacity: 1 - i * 0.12 }} />
                  </div>
                  <div style={{ width: "100px", fontSize: "12px", fontWeight: 700, color: G, textAlign: "right", flexShrink: 0 }}>{fmt(s.revenue)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
