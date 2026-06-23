"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { Nav } from "@/components/nav";

// ── Types ──────────────────────────────────────────────────────────────────────

interface FactoryProfile {
  id: string;
  businessName: string;
  description: string;
  address: string;
  lga: string;
  teamSize: number;
  yearsOfOperation: number;
  productCategories: string[];
  moq: number;
  exportReady: boolean;
  phone: string;
  verificationLevel: string;
}

interface Quote {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  unitPrice: number;
  totalPrice: number;
  leadTimeDays: number;
  createdAt: string;
  rfq: { title: string; category: string; status: string; deadline: string };
}

interface Product {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  moq: number;
  unit: string;
  inStock: boolean;
  leadTimeDays: number;
  createdAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: { name: string; unit: string };
}

interface Order {
  id: string;
  status: "PENDING" | "CONFIRMED" | "IN_PRODUCTION" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "DISPUTED";
  source: "DIRECT" | "RFQ";
  totalAmount: number;
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  buyer: { name: string; email: string };
  items: OrderItem[];
}

interface OpenRFQ {
  id: string;
  title: string;
  category: string;
  quantity: number;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  deliveryLocation: string;
  createdAt: string;
  buyer: { name: string; etrs: { score: number } | null };
  _count: { quotes: number };
}

type Tab = "overview" | "quotes" | "orders" | "products" | "rfq-board" | "earnings";

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

const VERIFICATION: Record<string, { label: string; color: string; bg: string }> = {
  UNVERIFIED:         { label: "Unverified",        color: "#6B7280", bg: "#F3F4F6" },
  VERIFIED_BUSINESS:  { label: "Verified Business", color: "#1D4ED8", bg: "#DBEAFE" },
  VERIFIED_FACILITY:  { label: "Verified Facility", color: "#6D28D9", bg: "#EDE9FE" },
  FACTORY_CERTIFIED:  { label: "Factory Certified", color: "#92400E", bg: "#FEF3C7" },
  EXPORT_CERTIFIED:   { label: "Export Ready",      color: "#065F46", bg: "#D1FAE5" },
};

const QUOTE_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:   { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
  ACCEPTED:  { bg: "#D1FAE5", color: "#065F46", label: "Accepted" },
  REJECTED:  { bg: "#FEE2E2", color: "#B91C1C", label: "Rejected" },
  WITHDRAWN: { bg: "#F3F4F6", color: "#374151", label: "Withdrawn" },
};

const ORDER_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:       { bg: "#F3F4F6", color: "#374151", label: "Pending" },
  CONFIRMED:     { bg: "#DBEAFE", color: "#1E40AF", label: "Confirmed" },
  IN_PRODUCTION: { bg: "#EDE9FE", color: "#5B21B6", label: "In Production" },
  SHIPPED:       { bg: "#CFFAFE", color: "#0E7490", label: "Shipped" },
  DELIVERED:     { bg: "#D1FAE5", color: "#065F46", label: "Delivered" },
  CANCELLED:     { bg: "#F3F4F6", color: "#374151", label: "Cancelled" },
  DISPUTED:      { bg: "#FEE2E2", color: "#B91C1C", label: "Disputed" },
};

// ── Utilities ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

// ── Shared sub-components ──────────────────────────────────────────────────────

function Badge({ map, status }: { map: Record<string, { bg: string; color: string; label: string }>; status: string }) {
  const s = map[status] ?? { bg: "#F3F4F6", color: "#374151", label: status };
  return (
    <span style={{
      backgroundColor: s.bg, color: s.color,
      fontSize: "10px", fontWeight: 700,
      padding: "3px 8px", borderRadius: "3px", letterSpacing: "0.05em", whiteSpace: "nowrap",
    }}>
      {s.label.toUpperCase()}
    </span>
  );
}

function StatCard({
  icon, label, value, sub, accent, onClick,
}: {
  icon: string; label: string; value: string | number; sub: string; accent: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className="rounded-lg border p-4 transition-shadow hover:shadow-md"
      style={{ backgroundColor: C.white, borderColor: C.border, cursor: onClick ? "pointer" : "default" }}
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
      <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div>
          {subtitle && <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>{subtitle}</p>}
          <p className="font-bold text-sm mt-0.5" style={{ color: C.text }}>{title}</p>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={{ backgroundColor: C.white }}>{children}</div>
    </div>
  );
}

function EmptyState({ icon, title, body, cta, ctaHref }: {
  icon: string; title: string; body: string; cta?: string; ctaHref?: string;
}) {
  return (
    <div className="px-5 py-14 text-center" style={{ backgroundColor: "#F9F9F9" }}>
      <div style={{ fontSize: "34px", marginBottom: "10px" }}>{icon}</div>
      <p className="font-bold text-sm mb-1" style={{ color: C.text }}>{title}</p>
      <p className="text-xs mb-5 max-w-xs mx-auto" style={{ color: C.muted }}>{body}</p>
      {cta && ctaHref && (
        <Link href={ctaHref} className="inline-block px-5 py-2.5 font-bold rounded text-xs" style={{ backgroundColor: C.forest, color: "white", textDecoration: "none" }}>
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
      <span className="inline-block text-xs font-bold px-3 py-1 rounded" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>COMING SOON</span>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-lg border p-5" style={{ backgroundColor: C.white, borderColor: C.border }}>
      <div style={{ fontSize: "22px", marginBottom: "8px" }}>{icon}</div>
      <p className="font-bold text-sm mb-1" style={{ color: C.text }}>{title}</p>
      <p className="text-xs leading-relaxed" style={{ color: C.muted }}>{body}</p>
      <div className="mt-3 inline-block text-xs font-bold px-3 py-1 rounded" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>COMING SOON</div>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────────

function OverviewTab({
  factory, quotes, orders, openRFQs, onTabChange,
}: {
  factory: FactoryProfile | null;
  quotes: Quote[];
  orders: Order[];
  openRFQs: OpenRFQ[];
  onTabChange: (t: Tab) => void;
}) {
  const badge = factory ? (VERIFICATION[factory.verificationLevel] ?? VERIFICATION.UNVERIFIED) : null;
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const recentQuotes = [...quotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── Main column ── */}
      <div className="lg:col-span-2 flex flex-col gap-5">

        {/* Factory identity card */}
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="h-1" style={{ backgroundColor: factory && factory.verificationLevel !== "UNVERIFIED" ? C.forest : C.border }} />
          <div className="p-5 flex items-start justify-between gap-4" style={{ backgroundColor: C.white }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.muted }}>Factory Profile</p>
              {factory ? (
                <>
                  <h2 className="text-xl font-black tracking-tight" style={{ color: C.text }}>{factory.businessName}</h2>
                  <p className="text-xs mt-1 mb-3" style={{ color: C.muted }}>{factory.address}, {factory.lga} · {factory.teamSize} staff · {factory.yearsOfOperation}yr{factory.yearsOfOperation > 1 ? "s" : ""} operation</p>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {badge && (
                      <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: C.cream, color: C.ochre, fontWeight: 600 }}>
                      MOQ: {factory.moq.toLocaleString()} units
                    </span>
                    {factory.exportReady && (
                      <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}>
                        Export Ready
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {factory.productCategories.map((cat) => (
                      <span key={cat} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "#F0F4F0", color: C.forest, fontWeight: 600 }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div>
                  <p className="font-bold text-sm" style={{ color: C.text }}>No factory profile yet</p>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>Create your profile to appear in the manufacturer directory and start receiving RFQs</p>
                </div>
              )}
            </div>
            <Link
              href="/dashboard/supplier/factory"
              className="shrink-0 text-xs font-bold px-4 py-2 rounded transition-opacity hover:opacity-80"
              style={{
                backgroundColor: factory ? C.white : C.forest, color: factory ? C.text : "white",
                border: factory ? `1px solid ${C.border}` : "none", textDecoration: "none",
              }}
            >
              {factory ? "Edit Profile" : "Create Profile →"}
            </Link>
          </div>
        </div>

        {/* Action required: pending orders */}
        {pendingOrders.length > 0 && (
          <div className="rounded-lg border" style={{ borderColor: "#FCD34D", backgroundColor: "#FFFBEB" }}>
            <div className="px-5 py-3 flex items-center gap-2.5" style={{ borderBottom: "1px solid #FCD34D" }}>
              <span style={{ fontSize: "15px" }}>⚡</span>
              <span className="text-sm font-bold" style={{ color: "#92400E" }}>Orders Awaiting Confirmation</span>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FCD34D", color: "#78350F" }}>
                {pendingOrders.length}
              </span>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              {pendingOrders.slice(0, 3).map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: C.text }}>
                      Order from {o.buyer.name} — {fmt(o.totalAmount)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                      {o.items.length} item{o.items.length > 1 ? "s" : ""} · {o.source === "DIRECT" ? "Direct purchase" : "Via RFQ"} · {fmtDate(o.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => onTabChange("orders")}
                    className="shrink-0 text-xs font-bold px-3 py-1.5 rounded"
                    style={{ backgroundColor: C.forest, color: "white", border: "none", cursor: "pointer" }}
                  >
                    Confirm →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent orders */}
        <SectionShell subtitle="Orders" title="Recent Incoming Orders" action={
          <button onClick={() => onTabChange("orders")} style={{ background: "none", border: "none", color: C.forest, fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
            View all →
          </button>
        }>
          {recentOrders.length === 0 ? (
            <EmptyState icon="📦" title="No orders yet" body="Start quoting on RFQs or list products to receive your first order." cta="Browse RFQ Board" ctaHref="/rfq" />
          ) : (
            <div>
              {recentOrders.map((o) => (
                <div key={o.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded flex items-center justify-center text-xs font-black shrink-0"
                      style={{ backgroundColor: o.source === "DIRECT" ? "#EDE9FE" : "#D1FAE5", color: o.source === "DIRECT" ? "#5B21B6" : "#065F46" }}>
                      {o.source === "DIRECT" ? "D" : "R"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: C.text }}>
                        {o.buyer.name} — {fmt(o.totalAmount)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                        {o.items.length} item{o.items.length > 1 ? "s" : ""} · {fmtDate(o.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge map={ORDER_STATUS} status={o.status} />
                </div>
              ))}
            </div>
          )}
        </SectionShell>

        {/* Recent quotes */}
        <SectionShell subtitle="Quotes" title="Recent Quote Activity" action={
          <button onClick={() => onTabChange("quotes")} style={{ background: "none", border: "none", color: C.forest, fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
            View all →
          </button>
        }>
          {recentQuotes.length === 0 ? (
            <EmptyState icon="💬" title="No quotes submitted" body="Browse open RFQs on the RFQ Board tab and submit your first quote." cta="Open RFQ Board" ctaHref="/rfq" />
          ) : (
            <div>
              {recentQuotes.map((q) => (
                <div key={q.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: C.text }}>{q.rfq.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                      {q.rfq.category} · {fmt(q.totalPrice)} · {q.leadTimeDays}d lead time
                    </p>
                  </div>
                  <Badge map={QUOTE_STATUS} status={q.status} />
                </div>
              ))}
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
              { icon: "📋", label: "Browse RFQ Board", href: "/rfq" },
              { icon: "🏭", label: "Edit Factory Profile", href: "/dashboard/supplier/factory" },
              { icon: "📦", label: "Manage Products", tab: "products" as Tab },
            ].map((a) => (
              a.href ? (
                <Link key={a.label} href={a.href} className="flex items-center gap-3 px-3 py-2.5 rounded border hover:bg-gray-50 transition-colors" style={{ borderColor: C.border, textDecoration: "none" }}>
                  <span style={{ fontSize: "15px" }}>{a.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: C.text }}>{a.label}</span>
                  <span className="ml-auto text-xs" style={{ color: C.muted }}>→</span>
                </Link>
              ) : (
                <button key={a.label} onClick={() => onTabChange(a.tab!)} className="flex items-center gap-3 px-3 py-2.5 rounded border hover:bg-gray-50 transition-colors w-full text-left" style={{ borderColor: C.border, background: "none", cursor: "pointer" }}>
                  <span style={{ fontSize: "15px" }}>{a.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: C.text }}>{a.label}</span>
                  <span className="ml-auto text-xs" style={{ color: C.muted }}>→</span>
                </button>
              )
            ))}
          </div>
        </div>

        {/* ETRS Score */}
        <div className="rounded-lg border p-5" style={{ backgroundColor: C.cream, borderColor: "#E2CFA0" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.ochre }}>Your ETRS Score</p>
          <p className="text-4xl font-black my-1" style={{ color: C.brown }}>––</p>
          <p className="text-xs leading-relaxed" style={{ color: C.terra }}>
            Your Ekorafon Trade Reputation Score will appear here after your first completed & rated order.
          </p>
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid #E2CFA0` }}>
            {[
              { label: "On-time Delivery", value: "–" },
              { label: "Avg Rating", value: "–" },
              { label: "Disputes", value: "0" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid #E2CFA0` }}>
                <span className="text-xs" style={{ color: C.terra }}>{s.label}</span>
                <span className="text-sm font-bold" style={{ color: C.brown }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Catalogue summary */}
        <div className="rounded-lg border p-5" style={{ backgroundColor: C.white, borderColor: C.border }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>Open Opportunities</p>
          <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
            <span className="text-xs" style={{ color: C.muted }}>Open RFQs</span>
            <span className="text-sm font-bold" style={{ color: C.text }}>{openRFQs.length}</span>
          </div>
          <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
            <span className="text-xs" style={{ color: C.muted }}>Pending Quotes</span>
            <span className="text-sm font-bold" style={{ color: C.text }}>{quotes.filter((q) => q.status === "PENDING").length}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs" style={{ color: C.muted }}>Active Orders</span>
            <span className="text-sm font-bold" style={{ color: C.text }}>{orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length}</span>
          </div>
          <Link href="/rfq" className="mt-3 block text-center text-xs font-bold py-2 rounded" style={{ backgroundColor: C.forest, color: "white", textDecoration: "none" }}>
            Browse RFQs →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Quotes Tab ─────────────────────────────────────────────────────────────────

function QuotesTab({ quotes }: { quotes: Quote[] }) {
  const [filter, setFilter] = useState<string>("ALL");
  const filtered = filter === "ALL" ? quotes : quotes.filter((q) => q.status === filter);
  const countOf = (s: string) => quotes.filter((q) => q.status === s).length;
  const winRate = quotes.length > 0 ? Math.round((quotes.filter((q) => q.status === "ACCEPTED").length / quotes.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">

      {/* Win rate banner */}
      {quotes.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total Quotes", value: quotes.length, accent: C.forest },
            { label: "Accepted", value: countOf("ACCEPTED"), accent: C.green },
            { label: "Pending", value: countOf("PENDING"), accent: C.ochre },
            { label: "Win Rate", value: `${winRate}%`, accent: C.purple },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border p-4 text-center" style={{ backgroundColor: C.white, borderColor: C.border }}>
              <div className="text-2xl font-black" style={{ color: s.accent }}>{s.value}</div>
              <div className="text-xs font-bold mt-0.5" style={{ color: C.text }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["ALL", "PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded text-xs font-bold border transition-colors"
            style={{ backgroundColor: filter === f ? C.forest : C.white, color: filter === f ? "white" : C.muted, borderColor: filter === f ? C.forest : C.border }}
          >
            {f === "ALL" ? `All (${quotes.length})` : `${QUOTE_STATUS[f]?.label} (${countOf(f)})`}
          </button>
        ))}
        <Link href="/rfq" className="ml-auto px-4 py-1.5 rounded text-xs font-bold" style={{ backgroundColor: C.forest, color: "white", textDecoration: "none" }}>
          + Submit Quote
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: C.border }}>
        {filtered.length === 0 ? (
          <EmptyState icon="💬" title="No quotes here" body="Browse open RFQs and submit quotes to win manufacturing contracts." cta="Browse RFQ Board" ctaHref="/rfq" />
        ) : (
          <table className="w-full text-sm" style={{ backgroundColor: C.white }}>
            <thead>
              <tr style={{ backgroundColor: "#F8F8F8", borderBottom: `1px solid ${C.border}` }}>
                {["RFQ Title", "Category", "Your Price", "Lead Time", "RFQ Status", "Quote Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-sm" style={{ color: C.text }}>{q.rfq.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>Submitted {fmtDate(q.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-1 rounded font-semibold" style={{ backgroundColor: C.cream, color: C.ochre }}>{q.rfq.category}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-sm" style={{ color: C.text }}>{fmt(q.totalPrice)}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>{fmt(q.unitPrice)}/unit</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: C.muted }}>{q.leadTimeDays} days</td>
                  <td className="px-5 py-3.5">
                    <Badge map={{ OPEN: { bg: "#D1FAE5", color: "#065F46", label: "Open" }, REVIEWING: { bg: "#DBEAFE", color: "#1E40AF", label: "Reviewing" }, AWARDED: { bg: "#FEF3C7", color: "#92400E", label: "Awarded" }, CLOSED: { bg: "#F3F4F6", color: "#374151", label: "Closed" }, CANCELLED: { bg: "#FEE2E2", color: "#B91C1C", label: "Cancelled" } }} status={q.rfq.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge map={QUOTE_STATUS} status={q.status} />
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

function OrdersTab({ orders, onStatusUpdate }: { orders: Order[]; onStatusUpdate: () => void }) {
  const [filter, setFilter] = useState<string>("ALL");
  const [updating, setUpdating] = useState<string | null>(null);
  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const NEXT_STATUS: Partial<Record<Order["status"], { action: string; next: string }>> = {
    PENDING:       { action: "Confirm Order",    next: "CONFIRMED" },
    CONFIRMED:     { action: "Start Production", next: "IN_PRODUCTION" },
    IN_PRODUCTION: { action: "Mark Shipped",     next: "SHIPPED" },
  };

  async function advanceStatus(orderId: string, next: string) {
    setUpdating(orderId);
    try {
      await api.patch(`/order/${orderId}/status`, { status: next });
      onStatusUpdate();
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Status summary row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pending", value: orders.filter((o) => o.status === "PENDING").length, accent: "#374151" },
          { label: "In Production", value: orders.filter((o) => ["CONFIRMED", "IN_PRODUCTION"].includes(o.status)).length, accent: C.purple },
          { label: "Shipped", value: orders.filter((o) => o.status === "SHIPPED").length, accent: C.cyan },
          { label: "Delivered", value: orders.filter((o) => o.status === "DELIVERED").length, accent: C.green },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center" style={{ backgroundColor: C.white, borderColor: C.border }}>
            <div className="text-2xl font-black" style={{ color: s.accent }}>{s.value}</div>
            <div className="text-xs font-bold mt-0.5" style={{ color: C.text }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["ALL", "PENDING", "CONFIRMED", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded text-xs font-bold border transition-colors"
            style={{ backgroundColor: filter === f ? C.forest : C.white, color: filter === f ? "white" : C.muted, borderColor: filter === f ? C.forest : C.border }}
          >
            {f === "ALL" ? `All (${orders.length})` : `${ORDER_STATUS[f]?.label ?? f} (${orders.filter((o) => o.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: C.border }}>
        {filtered.length === 0 ? (
          <EmptyState icon="📦" title="No orders in this stage" body="Incoming orders will appear here as buyers place them." />
        ) : (
          <div>
            {filtered.map((o) => (
              <div key={o.id} style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.white }}>
                <div className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded flex items-center justify-center text-xs font-black shrink-0"
                      style={{ backgroundColor: o.source === "DIRECT" ? "#EDE9FE" : "#D1FAE5", color: o.source === "DIRECT" ? "#5B21B6" : "#065F46" }}>
                      {o.source === "DIRECT" ? "D" : "R"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-sm" style={{ color: C.text }}>
                          {o.buyer.name}
                        </p>
                        <span className="text-xs" style={{ color: C.muted }}>·</span>
                        <p className="text-xs" style={{ color: C.muted }}>{o.source === "DIRECT" ? "Direct Purchase" : "Via RFQ"}</p>
                        <Badge map={ORDER_STATUS} status={o.status} />
                      </div>
                      <p className="text-sm font-bold mb-1" style={{ color: C.ochre }}>{fmt(o.totalAmount)}</p>
                      <p className="text-xs" style={{ color: C.muted }}>
                        {o.deliveryAddress} · {fmtDate(o.createdAt)}
                      </p>
                      {/* Line items */}
                      <div className="mt-2 flex flex-col gap-0.5">
                        {o.items.map((item) => (
                          <p key={item.id} className="text-xs" style={{ color: C.muted }}>
                            {item.product.name} × {item.quantity} {item.product.unit} — {fmt(item.total)}
                          </p>
                        ))}
                      </div>
                      {o.notes && (
                        <p className="text-xs mt-1.5 italic" style={{ color: C.muted }}>"{o.notes}"</p>
                      )}
                    </div>
                  </div>
                  {/* Action button */}
                  {NEXT_STATUS[o.status] && (
                    <button
                      onClick={() => advanceStatus(o.id, NEXT_STATUS[o.status]!.next)}
                      disabled={updating === o.id}
                      className="shrink-0 text-xs font-bold px-4 py-2 rounded transition-opacity hover:opacity-80"
                      style={{ backgroundColor: C.forest, color: "white", border: "none", cursor: updating === o.id ? "not-allowed" : "pointer", opacity: updating === o.id ? 0.6 : 1 }}
                    >
                      {updating === o.id ? "Updating…" : NEXT_STATUS[o.status]!.action}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Products Tab ───────────────────────────────────────────────────────────────

function ProductsTab({ factory }: { factory: FactoryProfile | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!factory) { setLoading(false); return; }
    api.get<Product[]>("/product/mine/list")
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [factory]);

  async function toggleStock(id: string) {
    await api.patch(`/product/${id}/stock`, {});
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, inStock: !p.inStock } : p));
  }

  if (!factory) {
    return (
      <EmptyState icon="🏭" title="Factory profile required" body="Create your factory profile before listing products for direct sale." cta="Create Profile" ctaHref="/dashboard/supplier/factory" />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold" style={{ color: C.text }}>
          {products.length} product{products.length !== 1 ? "s" : ""} in your catalogue
        </p>
        <ComingSoonButton label="+ Add Product" />
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: C.border }}>
        {loading ? (
          <div className="px-5 py-10 flex justify-center">
            <div className="flex gap-1">{[0, 1, 2].map((i) => <div key={i} className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.forest, animationDelay: `${i * 150}ms` }} />)}</div>
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon="🛍️" title="No products listed" body="List your standard products so buyers can order directly without going through an RFQ." />
        ) : (
          <table className="w-full text-sm" style={{ backgroundColor: C.white }}>
            <thead>
              <tr style={{ backgroundColor: "#F8F8F8", borderBottom: `1px solid ${C.border}` }}>
                {["Product", "Category", "Unit Price", "MOQ", "Lead Time", "Stock", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-sm" style={{ color: C.text }}>{p.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>Added {fmtDate(p.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-1 rounded font-semibold" style={{ backgroundColor: C.cream, color: C.ochre }}>{p.category}</span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-sm" style={{ color: C.text }}>{fmt(p.unitPrice)}<span className="text-xs font-normal ml-0.5" style={{ color: C.muted }}>/{p.unit}</span></td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: C.muted }}>{p.moq.toLocaleString()} {p.unit}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: C.muted }}>{p.leadTimeDays}d</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleStock(p.id)}
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{ backgroundColor: p.inStock ? "#D1FAE5" : "#FEE2E2", color: p.inStock ? "#065F46" : "#B91C1C", border: "none", cursor: "pointer" }}
                    >
                      {p.inStock ? "In Stock" : "Out of Stock"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs font-bold hover:underline" style={{ color: C.muted, background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard icon="📸" title="Product Photos" body="Upload multiple product photos to help buyers visualise what they're ordering before placing a request." />
        <FeatureCard icon="🏷️" title="Bulk Pricing" body="Set tiered pricing for different order quantities — reward large orders with better unit rates automatically." />
        <FeatureCard icon="📊" title="Product Analytics" body="See which products get the most views, inquiries, and direct orders — and optimise your catalogue accordingly." />
      </div>
    </div>
  );
}

function ComingSoonButton({ label }: { label: string }) {
  return (
    <button className="px-4 py-1.5 rounded text-xs font-bold opacity-50 cursor-not-allowed" style={{ backgroundColor: C.forest, color: "white", border: "none" }} disabled>
      {label} (Coming Soon)
    </button>
  );
}

// ── RFQ Board Tab ──────────────────────────────────────────────────────────────

function RFQBoardTab({ openRFQs }: { openRFQs: OpenRFQ[] }) {
  const [category, setCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(openRFQs.map((r) => r.category)))];
  const filtered = category === "All" ? openRFQs : openRFQs.filter((r) => r.category === category);

  return (
    <div className="flex flex-col gap-5">
      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="px-3 py-1.5 rounded text-xs font-bold border transition-colors"
            style={{ backgroundColor: category === c ? C.forest : C.white, color: category === c ? "white" : C.muted, borderColor: category === c ? C.forest : C.border }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* RFQ cards */}
      {filtered.length === 0 ? (
        <EmptyState icon="📋" title="No open RFQs right now" body="New RFQs from buyers will appear here. Check back soon." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-lg border p-5 flex flex-col gap-3" style={{ backgroundColor: C.white, borderColor: C.border }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: C.text }}>{r.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>{r.deliveryLocation}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded font-semibold shrink-0" style={{ backgroundColor: C.cream, color: C.ochre }}>{r.category}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs" style={{ color: C.muted }}>Budget</p>
                  <p className="text-xs font-bold" style={{ color: C.text }}>{fmt(r.budgetMin)}–{fmt(r.budgetMax)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: C.muted }}>Qty</p>
                  <p className="text-xs font-bold" style={{ color: C.text }}>{r.quantity.toLocaleString()} units</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: C.muted }}>Deadline</p>
                  <p className="text-xs font-bold" style={{ color: C.text }}>{fmtDate(r.deadline)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: C.muted }}>
                  {r._count.quotes} quote{r._count.quotes !== 1 ? "s" : ""} · Buyer ETRS: {r.buyer.etrs?.score.toFixed(0) ?? "–"}
                </p>
                <Link
                  href={`/rfq/${r.id}`}
                  className="text-xs font-bold px-3 py-1.5 rounded"
                  style={{ backgroundColor: C.forest, color: "white", textDecoration: "none" }}
                >
                  Submit Quote →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Earnings Tab ───────────────────────────────────────────────────────────────

function EarningsTab({ orders }: { orders: Order[] }) {
  const totalEarned = orders.filter((o) => o.status === "DELIVERED").reduce((s, o) => s + o.totalAmount, 0);
  const pendingRelease = orders.filter((o) => o.status === "SHIPPED").reduce((s, o) => s + o.totalAmount, 0);
  const inProduction = orders.filter((o) => ["CONFIRMED", "IN_PRODUCTION"].includes(o.status)).reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Balance cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: "✅", label: "Total Earned",     value: fmt(totalEarned),    sub: "Delivered & released",       accent: C.green },
          { icon: "⏳", label: "Pending Release",  value: fmt(pendingRelease), sub: "Shipped, awaiting buyer",    accent: C.ochre },
          { icon: "🔧", label: "In Production",    value: fmt(inProduction),   sub: "Orders in progress",         accent: C.purple },
          { icon: "🛡️", label: "In Escrow",        value: fmt(pendingRelease), sub: "Paystack escrow protected",  accent: C.cyan },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border p-4" style={{ backgroundColor: C.white, borderColor: C.border }}>
            <div style={{ fontSize: "18px", marginBottom: "6px" }}>{c.icon}</div>
            <div className="text-2xl font-black" style={{ color: c.accent }}>{c.value}</div>
            <p className="text-xs font-bold mt-0.5" style={{ color: C.text }}>{c.label}</p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <SectionShell subtitle="Transactions" title="Earnings History">
        {orders.filter((o) => o.status === "DELIVERED").length === 0 ? (
          <ComingSoon title="No earnings yet" body="Completed and paid orders will show here. Confirm orders and deliver on time to build your revenue track record." />
        ) : (
          <table className="w-full text-sm" style={{ backgroundColor: C.white }}>
            <thead>
              <tr style={{ backgroundColor: "#F8F8F8", borderBottom: `1px solid ${C.border}` }}>
                {["Buyer", "Source", "Amount", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.filter((o) => o.status === "DELIVERED").map((o) => (
                <tr key={o.id} className="hover:bg-gray-50" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td className="px-5 py-3.5 font-semibold text-sm" style={{ color: C.text }}>{o.buyer.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: o.source === "DIRECT" ? "#EDE9FE" : "#D1FAE5", color: o.source === "DIRECT" ? "#5B21B6" : "#065F46" }}>
                      {o.source}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-sm" style={{ color: C.green }}>{fmt(o.totalAmount)}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: C.muted }}>{fmtDate(o.createdAt)}</td>
                  <td className="px-5 py-3.5"><Badge map={ORDER_STATUS} status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionShell>

      {/* Coming soon features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeatureCard icon="💸" title="Instant Payout" body="Request early release of escrowed funds after buyer confirmation — funds hit your account within 24 hours via Paystack." />
        <FeatureCard icon="📊" title="Revenue Analytics" body="Monthly and quarterly revenue charts broken down by category, buyer, and order source (direct vs RFQ)." />
        <FeatureCard icon="🧾" title="Invoice Generation" body="Auto-generate professional invoices for every completed order — downloadable as PDF for your records." />
        <FeatureCard icon="📆" title="Payout Schedule" body="Set your preferred payout frequency — weekly, bi-weekly, or monthly direct transfer to your business bank account." />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SupplierDashboard() {
  const router = useRouter();
  const [user] = useState(getUser);
  const [factory, setFactory]   = useState<FactoryProfile | null>(null);
  const [quotes, setQuotes]     = useState<Quote[]>([]);
  const [orders, setOrders]     = useState<Order[]>([]);
  const [openRFQs, setOpenRFQs] = useState<OpenRFQ[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  function loadData() {
    Promise.all([
      api.get<FactoryProfile | null>("/factory/me").catch(() => null),
      api.get<Quote[]>("/quote/mine").catch(() => [] as Quote[]),
      api.get<Order[]>("/order/incoming").catch(() => [] as Order[]),
      api.get<OpenRFQ[]>("/rfq").catch(() => [] as OpenRFQ[]),
    ]).then(([f, q, o, r]) => {
      setFactory(f);
      setQuotes(q);
      setOrders(o);
      setOpenRFQs(r);
    }).finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!user || user.role !== "SUPPLIER") { router.push("/auth/login"); return; }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived metrics
  const acceptedQuotes  = quotes.filter((q) => q.status === "ACCEPTED").length;
  const activeOrders    = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length;
  const totalEarned     = orders.filter((o) => o.status === "DELIVERED").reduce((s, o) => s + o.totalAmount, 0);
  const winRate         = quotes.length > 0 ? Math.round((acceptedQuotes / quotes.length) * 100) : 0;
  const pendingOrders   = orders.filter((o) => o.status === "PENDING").length;
  const badge           = factory ? (VERIFICATION[factory.verificationLevel] ?? VERIFICATION.UNVERIFIED) : null;

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview",   label: "Overview" },
    { key: "orders",     label: "Orders",     badge: activeOrders },
    { key: "quotes",     label: "Quotes",     badge: quotes.filter((q) => q.status === "PENDING").length },
    { key: "products",   label: "Products" },
    { key: "rfq-board",  label: "RFQ Board",  badge: openRFQs.length },
    { key: "earnings",   label: "Earnings" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
        <Nav variant="dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.forest, animationDelay: `${i * 150}ms` }} />
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
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.forest }}>
              Supplier Operations Center
            </p>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: C.text }}>
              {factory?.businessName ?? (user?.name ? `${user.name.split(" ")[0]}'s Dashboard` : "Supplier Dashboard")}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {badge && (
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: badge.bg, color: badge.color }}>{badge.label}</span>
              )}
              <p className="text-sm" style={{ color: C.muted }}>Orders · Quotes · Products · Earnings</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/dashboard/supplier/factory" className="px-4 py-2.5 text-xs font-bold rounded border transition-colors hover:bg-white" style={{ borderColor: C.border, color: C.text, textDecoration: "none", backgroundColor: C.white }}>
              Edit Profile
            </Link>
            <Link href="/rfq" className="px-5 py-2.5 text-xs font-bold rounded hover:opacity-90 transition-opacity" style={{ backgroundColor: C.forest, color: "white", textDecoration: "none" }}>
              Browse RFQs →
            </Link>
          </div>
        </div>

        {/* ── Alert: new pending orders ── */}
        {pendingOrders > 0 && (
          <div className="mb-6 rounded-lg border px-5 py-3 flex items-center gap-3" style={{ borderColor: "#FCD34D", backgroundColor: "#FFFBEB" }}>
            <span style={{ fontSize: "16px" }}>⚡</span>
            <p className="text-sm" style={{ color: "#92400E" }}>
              <strong>{pendingOrders} new order{pendingOrders > 1 ? "s" : ""} waiting</strong> — confirm within 24 hours to maintain your response rate.
            </p>
            <button onClick={() => setActiveTab("orders")} className="ml-auto text-xs font-bold px-3 py-1.5 rounded shrink-0" style={{ backgroundColor: C.forest, color: "white", border: "none", cursor: "pointer" }}>
              Confirm Now
            </button>
          </div>
        )}

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard icon="📦" label="Active Orders"   value={activeOrders}          sub="in progress"           accent={C.forest}  onClick={() => setActiveTab("orders")} />
          <StatCard icon="💬" label="Pending Quotes"  value={quotes.filter((q) => q.status === "PENDING").length} sub="awaiting buyer decision" accent={C.ochre} onClick={() => setActiveTab("quotes")} />
          <StatCard icon="✅" label="Won Quotes"      value={acceptedQuotes}         sub="accepted by buyers"    accent={C.green}   onClick={() => setActiveTab("quotes")} />
          <StatCard icon="🏆" label="Win Rate"        value={`${winRate}%`}          sub="quote acceptance rate" accent={C.purple}  />
          <StatCard icon="💰" label="Total Earned"    value={totalEarned > 0 ? fmt(totalEarned) : "₦0"} sub="delivered orders" accent={C.cyan} onClick={() => setActiveTab("earnings")} />
          <StatCard icon="📋" label="Open RFQs"       value={openRFQs.length}        sub="available to quote"    accent={C.terra}   onClick={() => setActiveTab("rfq-board")} />
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-0 mb-6 overflow-x-auto" style={{ borderBottom: `2px solid ${C.border}` }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-5 py-3 text-sm font-bold transition-colors shrink-0 whitespace-nowrap"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  borderBottom: `2px solid ${active ? C.forest : "transparent"}`,
                  marginBottom: "-2px",
                  color: active ? C.forest : C.muted,
                }}
              >
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span style={{
                    backgroundColor: active ? C.forest : C.border,
                    color: active ? "white" : C.muted,
                    fontSize: "10px", fontWeight: 700,
                    padding: "1px 6px", borderRadius: "10px",
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "overview"  && <OverviewTab factory={factory} quotes={quotes} orders={orders} openRFQs={openRFQs} onTabChange={setActiveTab} />}
        {activeTab === "orders"    && <OrdersTab orders={orders} onStatusUpdate={loadData} />}
        {activeTab === "quotes"    && <QuotesTab quotes={quotes} />}
        {activeTab === "products"  && <ProductsTab factory={factory} />}
        {activeTab === "rfq-board" && <RFQBoardTab openRFQs={openRFQs} />}
        {activeTab === "earnings"  && <EarningsTab orders={orders} />}
      </div>
    </div>
  );
}
