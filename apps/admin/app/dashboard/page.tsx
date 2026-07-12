"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getUser, logout, canAccess } from "@/lib/auth";
import type { AdminUser } from "@/lib/auth";
import { G, GD, GT, BORDER, TEXT, MUTED, LIGHT } from "@/components/shared";
import dynamic from "next/dynamic";

const OverviewTab     = dynamic(() => import("@/components/OverviewTab"),     { ssr: false });
const UsersTab        = dynamic(() => import("@/components/UsersTab"),        { ssr: false });
const FactoriesTab    = dynamic(() => import("@/components/FactoriesTab"),    { ssr: false });
const VerificationTab = dynamic(() => import("@/components/VerificationTab"), { ssr: false });
const OrdersTab       = dynamic(() => import("@/components/OrdersTab"),       { ssr: false });
const ProductsTab     = dynamic(() => import("@/components/ProductsTab"),     { ssr: false });
const ReviewsTab      = dynamic(() => import("@/components/ReviewsTab"),      { ssr: false });
const EscrowTab       = dynamic(() => import("@/components/EscrowTab"),       { ssr: false });

type Tab = "overview" | "users" | "factories" | "verification" | "orders" | "products" | "reviews" | "escrow";

interface TabDef {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  permission?: string;
  alwaysVisible?: boolean;
}

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const TAB_DEFS: TabDef[] = [
  {
    id: "overview", label: "Overview", alwaysVisible: true,
    icon: <Icon d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" />,
  },
  {
    id: "users", label: "Users", permission: "users",
    icon: <Icon d="M17 21V19A4 4 0 0 0 13 15H5A4 4 0 0 0 1 19V21M23 21V19A4 4 0 0 0 17.83 15.13M16 3.13A4 4 0 0 1 16 10.87" />,
  },
  {
    id: "factories", label: "Factories", permission: "factories",
    icon: <Icon d="M2 20H22M4 20V10L12 4L20 10V20M10 20V14H14V20" />,
  },
  {
    id: "verification", label: "Verification", permission: "verification",
    icon: <Icon d="M9 12L11 14L15 10M20.6 8.8A9 9 0 1 1 8.8 3.4" />,
  },
  {
    id: "orders", label: "Orders", permission: "orders",
    icon: <Icon d="M6 2L3 6V20A2 2 0 0 0 5 22H19A2 2 0 0 0 21 20V6L18 2H6ZM3 6H21M16 10A4 4 0 0 1 8 10" />,
  },
  {
    id: "products", label: "Products & RFQs", permission: "products",
    icon: <Icon d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" />,
  },
  {
    id: "reviews", label: "Reviews", permission: "reviews",
    icon: <Icon d="M12 17.3L18.2 21L16.5 13.9L22 9.2L14.7 8.6L12 2L9.3 8.6L2 9.2L7.5 13.9L5.8 21Z" />,
  },
  {
    id: "escrow", label: "Escrow", permission: "escrow",
    icon: <Icon d="M12 22C12 22 3 18 3 11V5L12 2L21 5V11C21 18 12 22 12 22Z" />,
  },
];

const SECTION_LABEL: Record<Tab, string> = {
  overview:     "Dashboard Overview",
  users:        "User Management",
  factories:    "Supplier Factories",
  verification: "Verification Queue",
  orders:       "Orders & Disputes",
  products:     "Products & RFQ Oversight",
  reviews:      "Review Moderation",
  escrow:       "Escrow Management",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]             = useState<AdminUser | null>(null);
  const [active, setActive]         = useState<Tab>("overview");
  const [pendingVerif, setPending]  = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
  }, [router]);

  const visibleTabs = user
    ? TAB_DEFS.filter((t) => t.alwaysVisible || (t.permission && canAccess(user, t.permission)))
    : [];

  useEffect(() => {
    if (user && !visibleTabs.find((t) => t.id === active)) setActive("overview");
  }, [user]);

  const handleVerifCount = useCallback((n: number) => setPending(n), []);

  if (!user) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F5F5F5" }}>
        <div style={{ width: "28px", height: "28px", border: `3px solid ${G}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const isSuperAdmin = (user.permissions ?? []).length === 0;

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden", fontFamily: "system-ui,-apple-system,sans-serif", backgroundColor: "#F0F2F0" }}>

      {/* ── Mobile scrim ── */}
      {sidebarOpen && <div className="admin-scrim" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`} style={{ backgroundColor: GD }}>

        {/* Logo area */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <Image src="/logo-full.png" alt="Ekorafon" width={140} height={40} style={{ objectFit: "contain", objectPosition: "left" }} priority />
          <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "5px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "3px", padding: "3px 8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#4ADE80" }} />
            <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.08em" }}>ADMIN PANEL</span>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
          {visibleTabs.map((tab) => {
            const isActive = active === tab.id;
            const badge    = tab.id === "verification" && pendingVerif > 0 ? pendingVerif : null;
            return (
              <button
                key={tab.id}
                onClick={() => { setActive(tab.id); setSidebarOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "9px 12px", borderRadius: "6px", border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                  backgroundColor: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.65)",
                  fontSize: "13px", fontWeight: isActive ? 700 : 400,
                  transition: "background-color 0.12s, color 0.12s",
                }}
              >
                <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.75 }}>{tab.icon}</span>
                <span style={{ flex: 1 }}>{tab.label}</span>
                {badge && (
                  <span style={{ fontSize: "10px", fontWeight: 900, backgroundColor: "#EF4444", color: "white", borderRadius: "9999px", minWidth: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{isSuperAdmin ? "Super Admin" : "Limited Admin"}</div>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.replace("/login"); }}
            style={{ width: "100%", padding: "7px", borderRadius: "5px", border: "1px solid rgba(255,255,255,0.25)", backgroundColor: "transparent", color: "rgba(255,255,255,0.75)", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            <Icon d="M9 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H9M16 17L21 12L16 7M21 12H9" size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top header strip */}
        <header style={{ height: "52px", backgroundColor: "white", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 16px", gap: "8px", flexShrink: 0 }}>
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Icon d="M3 6H21M3 12H21M3 18H21" size={22} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{SECTION_LABEL[active]}</h1>
          </div>
          <div className="admin-hide-mobile" style={{ fontSize: "12px", color: LIGHT }}>{new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflow: "auto", backgroundColor: "#F0F2F0" }}>
          <div className="admin-main-card" style={{ backgroundColor: "white", borderRadius: "6px", border: `1px solid ${BORDER}`, overflow: "hidden", minHeight: "calc(100dvh - 120px)" }}>
            {active === "overview"     && <OverviewTab />}
            {active === "users"        && <UsersTab currentUser={user} />}
            {active === "factories"    && <FactoriesTab />}
            {active === "verification" && <VerificationTab onCountChange={handleVerifCount} />}
            {active === "orders"       && <OrdersTab />}
            {active === "products"     && <ProductsTab />}
            {active === "reviews"      && <ReviewsTab />}
            {active === "escrow"       && <EscrowTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
