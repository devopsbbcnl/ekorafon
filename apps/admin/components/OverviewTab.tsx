"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, fmt, G, GD, TEXT, MUTED, BORDER } from "./shared";

interface Stats {
  totalUsers: number;
  totalFactories: number;
  totalOrders: number;
  gmv: number;
  pendingVerif: number;
  escrowValue: number;
  activeOrders: number;
  disputedOrders: number;
  usersByRole: Record<string, number>;
  ordersByStatus: Record<string, number>;
}

interface Analytics {
  ordersByStatus: Record<string, { count: number; revenue: number }>;
  usersByRole:    Record<string, number>;
  topSuppliers:   { supplierId: string; name: string; revenue: number; orders: number }[];
  rfqsByStatus:   Record<string, number>;
  paymentsByStatus: Record<string, { count: number; amount: number }>;
}

function KPICard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
      <div style={{ fontSize: "22px", fontWeight: 900, color: accent ?? G, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "12px", fontWeight: 700, color: TEXT, marginTop: "5px" }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: MUTED, marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

const ORDER_COLORS: Record<string, string> = {
  PENDING:       "#6B7280",
  CONFIRMED:     "#1D4ED8",
  IN_PRODUCTION: "#6D28D9",
  SHIPPED:       "#0E7490",
  DELIVERED:     "#065F46",
  CANCELLED:     "#374151",
  DISPUTED:      "#B91C1C",
};

const RFQ_COLOR: Record<string, string> = {
  OPEN: "#065F46", REVIEWING: "#1E40AF", AWARDED: "#92400E", CLOSED: "#374151", CANCELLED: "#B91C1C",
};

const PAY_COLOR: Record<string, string> = {
  PENDING: "#9CA3AF", SUCCESS: "#065F46", FAILED: "#B91C1C", REFUNDED: "#1E40AF", RELEASED: "#92400E",
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

export default function OverviewTab() {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Stats>("/admin/stats"),
      api.get<Analytics>("/admin/analytics").catch(() => null), // requires the "analytics" permission — hide gracefully if absent
    ]).then(([s, a]) => { setStats(s); setAnalytics(a); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <div style={{ padding: "24px", color: "#B91C1C", fontSize: "13px" }}>Failed to load stats.</div>;

  const orderCountData = Object.entries(stats.ordersByStatus);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        <KPICard label="Total Users"       value={stats.totalUsers}                           sub={`${stats.usersByRole.BUYER ?? 0} buyers · ${stats.usersByRole.SUPPLIER ?? 0} suppliers`} />
        <KPICard label="Gross GMV"         value={fmt(stats.gmv)}                             sub="Delivered orders" />
        <KPICard label="Escrow Held"       value={fmt(stats.escrowValue)}                     sub="Awaiting release" accent="#6D28D9" />
        <KPICard label="Total Factories"   value={stats.totalFactories}                       />
        <KPICard label="Total Orders"      value={stats.totalOrders}                          sub={`${stats.activeOrders} active`} />
        <KPICard label="Pending Verif."    value={stats.pendingVerif}                         sub="Awaiting admin review" accent="#92400E" />
        <KPICard label="Disputed Orders"   value={stats.disputedOrders}                       sub="Require attention" accent="#B91C1C" />
        <KPICard label="Admin Accounts"    value={stats.usersByRole.ADMIN ?? 0}               />
      </div>

      {/* Orders by status — inline bar chart (falls back to plain counts if analytics is unavailable) */}
      <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px" }}>
        <SectionTitle>Orders by Status</SectionTitle>
        <BarChart data={orderCountData} colors={ORDER_COLORS} />
      </div>

      {analytics && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Revenue by order status */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
              <SectionTitle>Revenue by Order Status</SectionTitle>
              <BarChart
                data={Object.entries(analytics.ordersByStatus).filter(([, v]) => v.revenue > 0).map(([k, v]) => [k, v.revenue] as [string, number])}
                colors={ORDER_COLORS}
                valueFormatter={(v) => fmt(v)}
              />
            </div>

            {/* RFQs by status */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
              <SectionTitle>RFQs by Status</SectionTitle>
              <BarChart data={Object.entries(analytics.rfqsByStatus)} colors={RFQ_COLOR} />
            </div>

            {/* Payments by status */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px", gridColumn: "1 / -1" }}>
              <SectionTitle>Payments by Status (value)</SectionTitle>
              <BarChart
                data={Object.entries(analytics.paymentsByStatus).map(([k, v]) => [k, v.amount] as [string, number])}
                colors={PAY_COLOR}
                valueFormatter={(v) => fmt(v)}
              />
            </div>
          </div>

          {/* Top suppliers */}
          <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
            <SectionTitle>Top Suppliers by Revenue (Delivered Orders)</SectionTitle>
            {analytics.topSuppliers.length === 0 ? (
              <p style={{ fontSize: "13px", color: MUTED }}>No delivered orders yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {analytics.topSuppliers.map((s, i) => {
                  const maxRev = analytics.topSuppliers[0].revenue;
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
        </>
      )}
    </div>
  );
}
