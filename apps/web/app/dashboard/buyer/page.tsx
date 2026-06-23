"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { Nav } from "@/components/nav";

// ── Types ──────────────────────────────────────────────────────────────────────

interface RFQ {
  id: string;
  title: string;
  category: string;
  status: "OPEN" | "REVIEWING" | "AWARDED" | "CLOSED" | "CANCELLED";
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  createdAt: string;
  _count: { quotes: number };
}

type OrderStatus = "PENDING" | "CONFIRMED" | "IN_PRODUCTION" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "DISPUTED";
type OrderSource = "DIRECT" | "RFQ";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: { name: string; unit: string; images: string[] };
}

interface Order {
  id: string;
  status: OrderStatus;
  source: OrderSource;
  totalAmount: number;
  deliveryAddress: string;
  notes?: string;
  rfqId?: string;
  createdAt: string;
  updatedAt: string;
  supplier: {
    name: string;
    factory: { businessName: string; verificationLevel: string } | null;
  };
  items: OrderItem[];
}

type Tab = "overview" | "sourcing" | "orders" | "suppliers" | "payments";

// ── Design tokens ──────────────────────────────────────────────────────────────

const C = {
  ochre:  "#C4781A",
  forest: "#2D5016",
  cream:  "#FAF3E8",
  brown:  "#1A0F00",
  terra:  "#B85C38",
  bg:     "#F2F3F5",
  white:  "#FFFFFF",
  border: "#E4E4E4",
  text:   "#1A1A1A",
  muted:  "#6B6B6B",
  green:  "#059669",
  purple: "#7C3AED",
  cyan:   "#0891B2",
};

const RFQ_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  OPEN:      { bg: "#D1FAE5", color: "#065F46", label: "Open" },
  REVIEWING: { bg: "#DBEAFE", color: "#1E40AF", label: "Reviewing" },
  AWARDED:   { bg: "#FEF3C7", color: "#92400E", label: "Awarded" },
  CLOSED:    { bg: "#F3F4F6", color: "#374151", label: "Closed" },
  CANCELLED: { bg: "#FEE2E2", color: "#B91C1C", label: "Cancelled" },
};

const ORDER_STATUS: Record<OrderStatus, { bg: string; color: string; label: string }> = {
  PENDING:       { bg: "#F3F4F6", color: "#374151", label: "Pending" },
  CONFIRMED:     { bg: "#DBEAFE", color: "#1E40AF", label: "Confirmed" },
  IN_PRODUCTION: { bg: "#EDE9FE", color: "#5B21B6", label: "In Production" },
  SHIPPED:       { bg: "#CFFAFE", color: "#0E7490", label: "Shipped" },
  DELIVERED:     { bg: "#D1FAE5", color: "#065F46", label: "Delivered" },
  CANCELLED:     { bg: "#FEE2E2", color: "#B91C1C", label: "Cancelled" },
  DISPUTED:      { bg: "#FEE2E2", color: "#991B1B", label: "Disputed" },
};

// ── Utilities ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

const since30d = (s: string) =>
  new Date(s).getTime() > Date.now() - 30 * 86_400_000;

// ── Shared sub-components ──────────────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  const s = RFQ_STATUS[status] ?? RFQ_STATUS.CLOSED;
  return (
    <span style={{
      backgroundColor: s.bg, color: s.color,
      fontSize: "10px", fontWeight: 700,
      padding: "3px 8px", borderRadius: "3px", letterSpacing: "0.05em",
    }}>
      {s.label.toUpperCase()}
    </span>
  );
}

function StatCard({
  icon, label, value, sub, accent, onClick,
}: {
  icon: string; label: string; value: string | number;
  sub: string; accent: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className="rounded-lg border p-4 transition-shadow"
      style={{
        backgroundColor: C.white, borderColor: C.border,
        cursor: onClick ? "pointer" : "default",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <span style={{ fontSize: "18px" }}>{icon}</span>
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent, display: "block", marginTop: "3px" }} />
      </div>
      <div className="text-2xl font-black" style={{ color: accent }}>{value}</div>
      <div className="text-xs font-bold mt-0.5" style={{ color: C.text }}>{label}</div>
      <div className="text-xs mt-0.5" style={{ color: C.muted }}>{sub}</div>
    </div>
  );
}

function SectionShell({
  subtitle, title, action, children,
}: {
  subtitle?: string; title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.border}` }}
      >
        <div>
          {subtitle && (
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>{subtitle}</p>
          )}
          <p className="font-bold text-sm mt-0.5" style={{ color: C.text }}>{title}</p>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={{ backgroundColor: C.white }}>{children}</div>
    </div>
  );
}

function EmptyState({
  icon, title, body, cta, ctaHref,
}: {
  icon: string; title: string; body: string; cta?: string; ctaHref?: string;
}) {
  return (
    <div className="px-5 py-16 text-center" style={{ backgroundColor: "#F9F9F9" }}>
      <div style={{ fontSize: "36px", marginBottom: "12px" }}>{icon}</div>
      <p className="font-bold text-sm mb-1" style={{ color: C.text }}>{title}</p>
      <p className="text-xs mb-5 max-w-xs mx-auto" style={{ color: C.muted }}>{body}</p>
      {cta && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-block px-6 py-2.5 font-semibold rounded text-xs"
          style={{ backgroundColor: C.ochre, color: "white", textDecoration: "none" }}
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-5 py-14 text-center" style={{ backgroundColor: "#F9F9F9" }}>
      <div style={{ fontSize: "32px", marginBottom: "10px" }}>🔧</div>
      <p className="font-bold text-sm mb-1" style={{ color: C.text }}>{title}</p>
      <p className="text-xs max-w-sm mx-auto mb-4" style={{ color: C.muted }}>{body}</p>
      <span className="inline-block text-xs font-bold px-3 py-1 rounded" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
        COMING SOON
      </span>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-lg border p-5" style={{ backgroundColor: C.white, borderColor: C.border }}>
      <div style={{ fontSize: "22px", marginBottom: "8px" }}>{icon}</div>
      <p className="font-bold text-sm mb-1" style={{ color: C.text }}>{title}</p>
      <p className="text-xs leading-relaxed" style={{ color: C.muted }}>{body}</p>
      <div className="mt-3 inline-block text-xs font-bold px-3 py-1 rounded" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
        COMING SOON
      </div>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────────

function OverviewTab({
  rfqs, orders, onTabChange,
}: {
  rfqs: RFQ[]; orders: Order[]; onTabChange: (t: Tab) => void;
}) {
  const pendingAction = rfqs.filter((r) => r._count.quotes > 0 && r.status === "OPEN");
  const activeOrders = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status));
  const recent = [...rfqs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── Main column ── */}
      <div className="lg:col-span-2 flex flex-col gap-5">

        {/* Action-required banner */}
        {pendingAction.length > 0 && (
          <div className="rounded-lg border" style={{ borderColor: "#FCD34D", backgroundColor: "#FFFBEB" }}>
            <div className="px-5 py-3 flex items-center gap-2.5" style={{ borderBottom: `1px solid #FCD34D` }}>
              <span style={{ fontSize: "15px" }}>⚡</span>
              <span className="text-sm font-bold" style={{ color: "#92400E" }}>Action Required</span>
              <span
                className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#FCD34D", color: "#78350F" }}
              >
                {pendingAction.length}
              </span>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              {pendingAction.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: C.text }}>{r.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                      {r._count.quotes} quote{r._count.quotes > 1 ? "s" : ""} received
                      &nbsp;·&nbsp;Deadline {fmtDate(r.deadline)}
                    </p>
                  </div>
                  <Link
                    href={`/rfq/${r.id}`}
                    className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded"
                    style={{ backgroundColor: C.ochre, color: "white", textDecoration: "none" }}
                  >
                    Review Quotes
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent sourcing activity */}
        <SectionShell
          subtitle="Sourcing"
          title="Recent Activity"
          action={
            <button
              onClick={() => onTabChange("sourcing")}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.ochre, fontSize: "12px", fontWeight: 700 }}
            >
              View all →
            </button>
          }
        >
          {recent.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No sourcing activity yet"
              body="Post your first RFQ to start receiving quotes from verified Aba manufacturers."
              cta="Post First RFQ"
              ctaHref="/dashboard/buyer/rfq/new"
            />
          ) : (
            <div>
              {recent.map((r) => (
                <Link key={r.id} href={`/rfq/${r.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded flex items-center justify-center text-xs font-black shrink-0"
                        style={{ backgroundColor: C.cream, color: C.ochre }}
                      >
                        {r.category.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: C.text }}>{r.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                          {r.category}&nbsp;·&nbsp;{r._count.quotes} quotes&nbsp;·&nbsp;{fmtDate(r.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge status={r.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionShell>

        {/* Active orders */}
        <SectionShell
          subtitle="Orders"
          title="Active Orders"
          action={
            <button
              onClick={() => onTabChange("orders")}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.ochre, fontSize: "12px", fontWeight: 700 }}
            >
              View all →
            </button>
          }
        >
          {activeOrders.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No active orders"
              body="Buy directly from a supplier or award an RFQ quote to create your first order."
            />
          ) : (
            <div>
              {activeOrders.slice(0, 3).map((o) => {
                const st = ORDER_STATUS[o.status];
                const supplierName = o.supplier.factory?.businessName ?? o.supplier.name;
                const itemCount = o.items.length;
                return (
                  <div
                    key={o.id}
                    className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded flex items-center justify-center text-xs font-black shrink-0"
                        style={{ backgroundColor: st.bg, color: st.color }}
                      >
                        {o.source === "DIRECT" ? "🛒" : "📋"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: C.text }}>
                          {supplierName}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                          {itemCount} item{itemCount > 1 ? "s" : ""}
                          &nbsp;·&nbsp;{fmt(o.totalAmount)}
                          &nbsp;·&nbsp;{o.source === "DIRECT" ? "Direct purchase" : "Via RFQ"}
                        </p>
                      </div>
                    </div>
                    <span
                      className="shrink-0 text-xs font-bold px-2 py-1 rounded"
                      style={{ backgroundColor: st.bg, color: st.color }}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionShell>
      </div>

      {/* ── Sidebar ── */}
      <div className="flex flex-col gap-4">

        {/* Quick actions */}
        <div className="rounded-lg border p-5" style={{ backgroundColor: C.white, borderColor: C.border }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>Quick Actions</p>
          <div className="flex flex-col gap-2">
            {[
              { icon: "📋", label: "Post New RFQ", href: "/dashboard/buyer/rfq/new" },
              { icon: "🏭", label: "Browse Manufacturers", href: "/factories" },
              { icon: "📄", label: "RFQ Board", href: "/rfq" },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded border hover:bg-gray-50 transition-colors"
                style={{ borderColor: C.border, textDecoration: "none" }}
              >
                <span style={{ fontSize: "15px" }}>{a.icon}</span>
                <span className="text-sm font-semibold" style={{ color: C.text }}>{a.label}</span>
                <span className="ml-auto text-xs" style={{ color: C.muted }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ETRS Score */}
        <div className="rounded-lg border p-5" style={{ backgroundColor: C.cream, borderColor: "#E2CFA0" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.ochre }}>ETRS Score</p>
          <p className="text-4xl font-black my-1" style={{ color: C.brown }}>––</p>
          <p className="text-xs leading-relaxed" style={{ color: C.terra }}>
            Your Ekorafon Trade Reputation Score appears here after your first completed & rated order.
          </p>
        </div>

        {/* 30-day summary */}
        <div className="rounded-lg border p-5" style={{ backgroundColor: C.white, borderColor: C.border }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>Last 30 Days</p>
          {[
            { label: "RFQs Posted",     value: rfqs.filter((r) => since30d(r.createdAt)).length },
            { label: "Quotes Received", value: rfqs.filter((r) => since30d(r.createdAt)).reduce((s, r) => s + r._count.quotes, 0) },
            { label: "Orders Placed",   value: orders.filter((o) => since30d(o.createdAt)).length },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <span className="text-xs" style={{ color: C.muted }}>{s.label}</span>
              <span className="text-sm font-bold" style={{ color: C.text }}>{s.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2">
            <span className="text-xs" style={{ color: C.muted }}>Total Spend</span>
            <span className="text-sm font-bold" style={{ color: C.ochre }}>
              {fmt(orders.filter((o) => since30d(o.createdAt)).reduce((s, o) => s + o.totalAmount, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sourcing Tab ───────────────────────────────────────────────────────────────

function SourcingTab({
  rfqs, router,
}: {
  rfqs: RFQ[]; router: ReturnType<typeof useRouter>;
}) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = filter === "ALL" ? rfqs : rfqs.filter((r) => r.status === filter);
  const countOf = (s: string) => rfqs.filter((r) => r.status === s).length;

  return (
    <div className="flex flex-col gap-4">

      {/* Filter + action row */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["ALL", "OPEN", "REVIEWING", "AWARDED", "CLOSED", "CANCELLED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded text-xs font-bold border transition-colors"
            style={{
              backgroundColor: filter === f ? C.ochre : C.white,
              color: filter === f ? "white" : C.muted,
              borderColor: filter === f ? C.ochre : C.border,
            }}
          >
            {f === "ALL"
              ? `All (${rfqs.length})`
              : `${RFQ_STATUS[f]?.label ?? f} (${countOf(f)})`}
          </button>
        ))}
        <Link
          href="/dashboard/buyer/rfq/new"
          className="ml-auto px-4 py-1.5 rounded text-xs font-bold"
          style={{ backgroundColor: C.ochre, color: "white", textDecoration: "none" }}
        >
          + Post RFQ
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Nothing here yet"
            body={filter === "ALL" ? "Post your first RFQ to start receiving quotes." : `No RFQs with status "${filter}".`}
            cta={filter === "ALL" ? "Post First RFQ" : undefined}
            ctaHref={filter === "ALL" ? "/dashboard/buyer/rfq/new" : undefined}
          />
        ) : (
          <table className="w-full text-sm" style={{ backgroundColor: C.white }}>
            <thead>
              <tr style={{ backgroundColor: "#F8F8F8", borderBottom: `1px solid ${C.border}` }}>
                {["Request", "Category", "Budget Range", "Quotes", "Deadline", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: C.muted }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                  onClick={() => router.push(`/rfq/${r.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-sm" style={{ color: C.text }}>{r.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>Posted {fmtDate(r.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs px-2 py-1 rounded font-semibold"
                      style={{ backgroundColor: C.cream, color: C.ochre }}
                    >
                      {r.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: C.muted }}>
                    {fmt(r.budgetMin)} – {fmt(r.budgetMax)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-sm font-black"
                      style={{ color: r._count.quotes > 0 ? C.ochre : C.muted }}
                    >
                      {r._count.quotes}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: C.muted }}>{fmtDate(r.deadline)}</td>
                  <td className="px-5 py-3.5"><Badge status={r.status} /></td>
                  <td className="px-5 py-3.5">
                    {r._count.quotes > 0 && r.status === "OPEN" && (
                      <span className="text-xs font-bold" style={{ color: C.ochre, whiteSpace: "nowrap" }}>
                        Review →
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Orders Tab ─────────────────────────────────────────────────────────────────

const ORDER_LIFECYCLE = [
  { label: "Placed",        bg: "#F3F4F6", color: "#374151" },
  { label: "Confirmed",     bg: "#DBEAFE", color: "#1E40AF" },
  { label: "In Production", bg: "#EDE9FE", color: "#5B21B6" },
  { label: "Shipped",       bg: "#CFFAFE", color: "#0E7490" },
  { label: "Delivered",     bg: "#D1FAE5", color: "#065F46" },
];

function OrdersTab({ orders, router }: { orders: Order[]; router: ReturnType<typeof useRouter> }) {
  const [filter, setFilter] = useState<"ALL" | "DIRECT" | "RFQ" | OrderStatus>("ALL");

  const filtered = orders.filter((o) => {
    if (filter === "ALL")    return true;
    if (filter === "DIRECT") return o.source === "DIRECT";
    if (filter === "RFQ")    return o.source === "RFQ";
    return o.status === filter;
  });

  const countOf = (f: string) => orders.filter((o) => {
    if (f === "DIRECT") return o.source === "DIRECT";
    if (f === "RFQ")    return o.source === "RFQ";
    return o.status === f;
  }).length;

  const totalSpend    = orders.reduce((s, o) => s + o.totalAmount, 0);
  const activeCount   = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="flex flex-col gap-6">

      {/* Order lifecycle */}
      <div className="rounded-lg border p-5" style={{ backgroundColor: C.cream, borderColor: "#E2CFA0" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.ochre }}>Order Lifecycle</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {ORDER_LIFECYCLE.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1.5">
              {i > 0 && <span style={{ color: C.muted, fontSize: "11px" }}>›</span>}
              <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: step.bg, color: step.color }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Orders",    value: orders.length,   accent: C.forest },
          { label: "Active",          value: activeCount,     accent: C.ochre },
          { label: "Delivered",       value: deliveredCount,  accent: C.green },
          { label: "Total Spend",     value: fmt(totalSpend), accent: C.cyan },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border p-4" style={{ backgroundColor: C.white, borderColor: C.border }}>
            <div className="text-xl font-black" style={{ color: s.accent }}>{s.value}</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          { key: "ALL",          label: `All (${orders.length})` },
          { key: "DIRECT",       label: `Direct Purchases (${countOf("DIRECT")})` },
          { key: "RFQ",          label: `Via RFQ (${countOf("RFQ")})` },
          { key: "IN_PRODUCTION",label: `In Production (${countOf("IN_PRODUCTION")})` },
          { key: "SHIPPED",      label: `Shipped (${countOf("SHIPPED")})` },
          { key: "DISPUTED",     label: `Disputed (${countOf("DISPUTED")})` },
        ] as { key: typeof filter; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-3 py-1.5 rounded text-xs font-bold border transition-colors"
            style={{
              backgroundColor: filter === key ? C.ochre : C.white,
              color:           filter === key ? "white"  : C.muted,
              borderColor:     filter === key ? C.ochre  : C.border,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <SectionShell subtitle="Purchase Orders" title={`${filtered.length} order${filtered.length !== 1 ? "s" : ""}`}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders here yet"
            body="Buy directly from a supplier on the marketplace, or award a quote on an RFQ to create a purchase order."
            cta="Browse Marketplace"
            ctaHref="/factories"
          />
        ) : (
          <table className="w-full text-sm" style={{ backgroundColor: C.white }}>
            <thead>
              <tr style={{ backgroundColor: "#F8F8F8", borderBottom: `1px solid ${C.border}` }}>
                {["Supplier", "Items", "Source", "Total", "Date", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const st = ORDER_STATUS[o.status];
                const supplierName = o.supplier.factory?.businessName ?? o.supplier.name;
                const itemSummary = o.items.slice(0, 2).map((i) => i.product.name).join(", ")
                  + (o.items.length > 2 ? ` +${o.items.length - 2} more` : "");
                return (
                  <tr
                    key={o.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onClick={() => router.push(`/dashboard/buyer/orders/${o.id}`)}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-sm" style={{ color: C.text }}>{supplierName}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.muted }}>{fmtDate(o.createdAt)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs" style={{ color: C.text }}>{itemSummary || "—"}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.muted }}>{o.items.length} line item{o.items.length !== 1 ? "s" : ""}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                          backgroundColor: o.source === "DIRECT" ? "#EDE9FE" : C.cream,
                          color:           o.source === "DIRECT" ? "#5B21B6" : C.ochre,
                        }}
                      >
                        {o.source === "DIRECT" ? "Direct" : "Via RFQ"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-sm" style={{ color: C.text }}>
                      {fmt(o.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: C.muted }}>
                      {fmtDate(o.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold" style={{ color: C.ochre }}>View →</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </SectionShell>

      {/* Production + Logistics placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionShell subtitle="Manufacturing" title="Production Tracking">
          <ComingSoon
            title="Real-time Production Updates"
            body="Track each order through raw materials → cutting → assembly → QC → packing."
          />
        </SectionShell>
        <SectionShell subtitle="Logistics" title="Shipment Tracking">
          <ComingSoon
            title="Live Logistics Integration"
            body="Real-time shipment tracking with integrated logistics partners and SMS/email delivery alerts."
          />
        </SectionShell>
      </div>

      {/* Trade features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard icon="🛡️" title="Trade Protection" body="Raise a dispute and funds stay in escrow until delivery is confirmed satisfactory." />
        <FeatureCard icon="🔍" title="Quality Inspection" body="Request a third-party inspection before approving payment release from escrow." />
        <FeatureCard icon="⭐" title="Rate Your Order" body="Rate the supplier after delivery to update their ETRS score and help the community." />
      </div>
    </div>
  );
}

// ── Suppliers Tab ──────────────────────────────────────────────────────────────

function SuppliersTab() {
  return (
    <div className="flex flex-col gap-6">
      <SectionShell subtitle="Network" title="My Supplier Network">
        <ComingSoon
          title="Supplier Relationship Management"
          body="All suppliers who have quoted your RFQs appear here. Track their performance, build your preferred vendor list, and request direct quotes."
        />
      </SectionShell>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard icon="⭐" title="Preferred Vendors" body="Save top-performing suppliers to your shortlist for faster re-ordering and priority quoting." />
        <FeatureCard icon="📊" title="Supplier Scorecards" body="Compare suppliers on ETRS score, on-time delivery rate, price competitiveness, and order accuracy." />
        <FeatureCard icon="💬" title="Direct Messaging" body="Message suppliers directly within the platform — no more back-and-forth over WhatsApp or email." />
        <FeatureCard icon="📑" title="Quote Comparison" body="Side-by-side comparison of all quotes on an RFQ — price, lead time, MOQ, payment terms, and certifications." />
        <FeatureCard icon="🔄" title="Repeat Orders" body="Re-order from a previously awarded supplier in one click without posting a new RFQ." />
        <FeatureCard icon="🏆" title="Verified Badge" body="See which suppliers carry Ekorafon's verified badge — inspected facilities, valid CAC registration, and trade history." />
      </div>
    </div>
  );
}

// ── Payments Tab ───────────────────────────────────────────────────────────────

function PaymentsTab() {
  const balances = [
    { icon: "💰", label: "Total Spend",       value: "₦0",    sub: "Lifetime procurement value", accent: C.forest },
    { icon: "⏳", label: "Pending Invoices",  value: "₦0",    sub: "Awaiting your approval",     accent: C.ochre },
    { icon: "🛡️", label: "In Escrow",         value: "₦0",    sub: "Protected, held by Ekorafon",accent: C.purple },
    { icon: "✅", label: "Released to Suppliers", value: "₦0", sub: "Paid on confirmed delivery", accent: C.green },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Balance cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {balances.map((b) => (
          <div key={b.label} className="rounded-lg border p-4" style={{ backgroundColor: C.white, borderColor: C.border }}>
            <div style={{ fontSize: "18px", marginBottom: "6px" }}>{b.icon}</div>
            <div className="text-2xl font-black" style={{ color: b.accent }}>{b.value}</div>
            <p className="text-xs font-bold mt-0.5" style={{ color: C.text }}>{b.label}</p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{b.sub}</p>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <SectionShell subtitle="Transactions" title="Payment History">
        <ComingSoon
          title="Paystack Escrow & Payments"
          body="Pay for purchase orders through our Paystack-powered escrow system. Funds are held securely and only released when you confirm satisfactory delivery."
        />
      </SectionShell>

      {/* Feature breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeatureCard icon="🏦" title="Paystack Escrow" body="All payments flow through Paystack's secure escrow system. Neither party can access funds without the other's confirmation." />
        <FeatureCard icon="📄" title="Invoice Management" body="Receive, review, and approve digital invoices from suppliers before releasing any payment from escrow." />
        <FeatureCard icon="📊" title="Spend Analytics" body="Monthly spend reports by category, supplier, and product type — with CSV export for your finance team." />
        <FeatureCard icon="🧾" title="Tax & Compliance" body="Auto-generate WHT certificates and VAT receipts for all transactions to keep your books compliant." />
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function BuyerDashboard() {
  const router = useRouter();
  // useState initializer runs once — stable reference, won't trigger dep-array churn
  const [user] = useState(getUser);
  const [rfqs, setRFQs]     = useState<RFQ[]>([]);
  const [orders, setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!user || user.role !== "BUYER") { router.push("/auth/login"); return; }
    Promise.all([
      api.get<RFQ[]>("/rfq/mine").catch(() => [] as RFQ[]),
      api.get<Order[]>("/order/mine").catch(() => [] as Order[]),
    ]).then(([r, o]) => { setRFQs(r); setOrders(o); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalQuotes   = rfqs.reduce((s, r) => s + r._count.quotes, 0);
  const openRFQs      = rfqs.filter((r) => r.status === "OPEN").length;
  const pendingReview = rfqs.filter((r) => r._count.quotes > 0 && r.status === "OPEN").length;
  const activeOrders  = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status));
  const totalSpend    = orders.reduce((s, o) => s + o.totalAmount, 0);

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview",   label: "Overview" },
    { key: "sourcing",   label: "Sourcing & RFQs", badge: rfqs.length },
    { key: "orders",     label: "Orders",           badge: activeOrders.length },
    { key: "suppliers",  label: "Suppliers" },
    { key: "payments",   label: "Payments" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
        <Nav variant="dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: C.ochre, animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <Nav variant="dashboard" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.ochre }}>
              Buyer Command Center
            </p>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: C.text }}>
              {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Buyer Dashboard"}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: C.muted }}>
              Sourcing · Orders · Payments · Suppliers — all in one place
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/factories"
              className="px-4 py-2.5 text-xs font-bold rounded border transition-colors hover:bg-white"
              style={{ borderColor: C.border, color: C.text, textDecoration: "none", backgroundColor: C.white }}
            >
              Browse Suppliers
            </Link>
            <Link
              href="/dashboard/buyer/rfq/new"
              className="px-5 py-2.5 text-xs font-bold rounded hover:opacity-90 transition-opacity"
              style={{ backgroundColor: C.ochre, color: "white", textDecoration: "none" }}
            >
              + Post RFQ
            </Link>
          </div>
        </div>

        {/* ── Alert: quotes pending decision ── */}
        {pendingReview > 0 && (
          <div
            className="mb-6 rounded-lg border px-5 py-3 flex items-center gap-3"
            style={{ borderColor: "#FCD34D", backgroundColor: "#FFFBEB" }}
          >
            <span style={{ fontSize: "16px" }}>⚡</span>
            <p className="text-sm" style={{ color: "#92400E" }}>
              <strong>
                {pendingReview} RFQ{pendingReview > 1 ? "s have" : " has"} quotes waiting
              </strong>{" "}
              — award a supplier to convert them into purchase orders.
            </p>
            <button
              onClick={() => setActiveTab("sourcing")}
              className="ml-auto text-xs font-bold px-3 py-1.5 rounded shrink-0"
              style={{ backgroundColor: C.ochre, color: "white", border: "none", cursor: "pointer" }}
            >
              Review Now
            </button>
          </div>
        )}

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard icon="📋" label="Total RFQs"   value={rfqs.length}          sub="sourcing requests"   accent={C.forest}  onClick={() => setActiveTab("sourcing")} />
          <StatCard icon="💬" label="Quotes In"    value={totalQuotes}          sub="across all RFQs"    accent={C.ochre}   onClick={() => setActiveTab("sourcing")} />
          <StatCard icon="🟢" label="Open RFQs"    value={openRFQs}             sub="accepting quotes"   accent={C.green}   />
          <StatCard icon="📦" label="Orders"       value={orders.length}        sub={`${activeOrders.length} active`} accent={C.terra}   onClick={() => setActiveTab("orders")} />
          <StatCard icon="🔔" label="Need Review"  value={pendingReview}        sub="quotes to evaluate" accent={C.purple}  onClick={() => setActiveTab("sourcing")} />
          <StatCard icon="💳" label="Total Spend"  value={fmt(totalSpend)}      sub="all time"           accent={C.cyan}    onClick={() => setActiveTab("payments")} />
        </div>

        {/* ── Tab bar ── */}
        <div
          className="flex gap-0 mb-6 overflow-x-auto"
          style={{ borderBottom: `2px solid ${C.border}` }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-5 py-3 text-sm font-bold transition-colors shrink-0 whitespace-nowrap"
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${active ? C.ochre : "transparent"}`,
                  marginBottom: "-2px",
                  color: active ? C.ochre : C.muted,
                  cursor: "pointer",
                }}
              >
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    style={{
                      backgroundColor: active ? C.ochre : C.border,
                      color: active ? "white" : C.muted,
                      fontSize: "10px", fontWeight: 700,
                      padding: "1px 6px", borderRadius: "10px",
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "overview"  && <OverviewTab  rfqs={rfqs} orders={orders} onTabChange={setActiveTab} />}
        {activeTab === "sourcing"  && <SourcingTab  rfqs={rfqs} router={router} />}
        {activeTab === "orders"    && <OrdersTab    orders={orders} router={router} />}
        {activeTab === "suppliers" && <SuppliersTab />}
        {activeTab === "payments"  && <PaymentsTab />}
      </div>
    </div>
  );
}
