"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, fmt, TEXT, MUTED, G, BORDER } from "./shared";

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

export default function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Stats>("/admin/stats").then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <div style={{ padding: "24px", color: "#B91C1C", fontSize: "13px" }}>Failed to load stats.</div>;

  const maxOrderCount = Math.max(...Object.values(stats.ordersByStatus), 1);

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

      {/* Orders by status — inline bar chart */}
      <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT, marginBottom: "16px" }}>Orders by Status</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.entries(stats.ordersByStatus).map(([status, count]) => (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "120px", fontSize: "11px", fontWeight: 600, color: MUTED, textAlign: "right", flexShrink: 0 }}>
                {status.replace("_", " ")}
              </div>
              <div style={{ flex: 1, height: "18px", backgroundColor: "#F5F5F5", borderRadius: "4px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(count / maxOrderCount) * 100}%`,
                    backgroundColor: ORDER_COLORS[status] ?? G,
                    borderRadius: "4px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <div style={{ width: "32px", fontSize: "12px", fontWeight: 700, color: TEXT, flexShrink: 0 }}>{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* User breakdown */}
      <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT, marginBottom: "14px" }}>User Breakdown</div>
        <div style={{ display: "flex", gap: "24px" }}>
          {(["BUYER", "SUPPLIER", "ADMIN"] as const).map((role) => (
            <div key={role} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 900, color: G }}>{stats.usersByRole[role] ?? 0}</div>
              <div style={{ fontSize: "11px", color: MUTED, marginTop: "4px" }}>{role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
