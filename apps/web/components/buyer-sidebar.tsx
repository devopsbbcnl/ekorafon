"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

const C = {
  ochre:  "#C4781A",
  cream:  "#FAF3E8",
  white:  "#FFFFFF",
  border: "#E4E4E4",
  text:   "#1A1A1A",
  muted:  "#6B6B6B",
};

export type BuyerNavKey = "overview" | "sourcing" | "orders" | "suppliers" | "payments" | "settings";

interface NavItem {
  key: BuyerNavKey;
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS: Record<BuyerNavKey, string> = {
  overview:  "M3 12L12 3L21 12V21H15V15H9V21H3V12Z",
  sourcing:  "M9 2H15V4H9V2ZM5 4H19V22H5V4ZM8 9H16M8 13H16M8 17H13",
  orders:    "M20.5 7.3L12 12L3.5 7.3M12 12V21M4 7.3L12 3L20 7.3V16.7L12 21L4 16.7V7.3Z",
  suppliers: "M2 20H22M4 20V10L12 4L20 10V20M10 20V14H14V20",
  payments:  "M2 8H22M2 6H22V18H2V6ZM6 15H10",
  settings:  "M12 15A3 3 0 1 0 12 9A3 3 0 0 0 12 15ZM19.4 15A1.65 1.65 0 0 0 19.73 16.6L19.79 16.68A2 2 0 1 1 16.98 19.49L16.9 19.43A1.65 1.65 0 0 0 15.3 19.1A1.65 1.65 0 0 0 14.4 20.55V20.75A2 2 0 0 1 10.4 20.75V20.65A1.65 1.65 0 0 0 9.4 19.1A1.65 1.65 0 0 0 7.8 19.43L7.72 19.49A2 2 0 1 1 4.91 16.68L4.97 16.6A1.65 1.65 0 0 0 5.3 15A1.65 1.65 0 0 0 3.85 14.1H3.65A2 2 0 0 1 3.65 10.1H3.75A1.65 1.65 0 0 0 5.3 9A1.65 1.65 0 0 0 4.97 7.4L4.91 7.32A2 2 0 1 1 7.72 4.51L7.8 4.57A1.65 1.65 0 0 0 9.4 4.9A1.65 1.65 0 0 0 10.3 3.45V3.25A2 2 0 0 1 14.3 3.25V3.35A1.65 1.65 0 0 0 15.2 4.8A1.65 1.65 0 0 0 16.8 4.47L16.88 4.41A2 2 0 1 1 19.69 7.22L19.63 7.3A1.65 1.65 0 0 0 19.3 8.9V9A1.65 1.65 0 0 0 20.75 9.9H20.95A2 2 0 0 1 20.95 13.9H20.85A1.65 1.65 0 0 0 19.4 15Z",
};

const SIGN_OUT_ICON = "M9 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H9M16 17L21 12L16 7M21 12H9";

export function BuyerSidebar({
  active, rfqCount = 0, activeOrderCount = 0, headerOffset = "100px",
}: {
  active: BuyerNavKey;
  rfqCount?: number;
  activeOrderCount?: number;
  /** Height of the sticky <Nav> above this sidebar, so it docks flush beneath it */
  headerOffset?: string;
}) {
  const router = useRouter();

  function handleSignOut() {
    logout();
    router.push("/");
  }

  const items: NavItem[] = [
    { key: "overview",  label: "Overview",         href: "/dashboard/buyer",                   icon: ICONS.overview },
    { key: "sourcing",  label: "Sourcing & RFQs",   href: "/dashboard/buyer?tab=sourcing",       icon: ICONS.sourcing,  badge: rfqCount || undefined },
    { key: "orders",    label: "Orders",            href: "/dashboard/buyer?tab=orders",         icon: ICONS.orders,    badge: activeOrderCount || undefined },
    { key: "suppliers", label: "Suppliers",         href: "/dashboard/buyer?tab=suppliers",      icon: ICONS.suppliers },
    { key: "payments",  label: "Payments",          href: "/dashboard/buyer?tab=payments",       icon: ICONS.payments },
  ];

  return (
    <aside
      className="hidden md:flex shrink-0 flex-col"
      style={{
        width: "232px",
        backgroundColor: C.white,
        borderRight: `1px solid ${C.border}`,
        position: "sticky",
        top: headerOffset,
        height: `calc(100vh - ${headerOffset})`,
        overflowY: "auto",
      }}
    >
      <div className="px-4 pt-5 pb-3">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.ochre }}>Buyer Command Center</p>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              style={{
                textDecoration: "none",
                backgroundColor: isActive ? C.cream : "transparent",
                color: isActive ? C.ochre : C.muted,
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <span className="shrink-0" style={{ opacity: isActive ? 1 : 0.8 }}>
                <Icon d={item.icon} />
              </span>
              <span className="text-sm flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className="text-xs font-bold px-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: isActive ? C.ochre : C.border,
                    color: isActive ? "white" : C.muted,
                    minWidth: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-2 flex flex-col gap-1" style={{ borderTop: `1px solid ${C.border}` }}>
        <Link
          href="/dashboard/buyer/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mt-2"
          style={{
            textDecoration: "none",
            backgroundColor: active === "settings" ? C.cream : "transparent",
            color: active === "settings" ? C.ochre : C.muted,
            fontWeight: active === "settings" ? 700 : 500,
          }}
        >
          <span className="shrink-0" style={{ opacity: active === "settings" ? 1 : 0.8 }}>
            <Icon d={ICONS.settings} />
          </span>
          <span className="text-sm">Settings</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            color: "#B91C1C",
          }}
        >
          <span className="shrink-0" style={{ opacity: 0.85 }}>
            <Icon d={SIGN_OUT_ICON} />
          </span>
          <span className="text-sm font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
