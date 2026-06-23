"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface Factory {
  id: string;
  businessName: string;
  description: string;
  lga: string;
  productCategories: string[];
  moq: number;
  exportReady: boolean;
  verificationLevel: string;
  teamSize: number;
  yearsOfOperation: number;
  user: { name: string; etrs: { score: number } | null };
}

interface RFQ {
  id: string;
  title: string;
  category: string;
  quantity: number;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  _count: { quotes: number };
  buyer: { name: string; etrs: { score: number } | null };
}

const CATEGORIES = [
  "All", "Footwear", "Leather Goods", "Garments & Textiles",
  "Bags & Accessories", "Auto Parts", "Plastics", "Furniture",
  "Packaging", "Food Processing", "Building Materials",
];

const CATEGORY_ABBR: Record<string, string> = {
  "Footwear": "FTW", "Leather Goods": "LTH", "Garments & Textiles": "GTX",
  "Bags & Accessories": "BAG", "Auto Parts": "AUTO", "Plastics": "PLT",
  "Furniture": "FRN", "Packaging": "PKG", "Food Processing": "FPR", "Building Materials": "BLD",
};

const CATEGORY_TINT: Record<string, string> = {
  "Footwear": "#E8F5EE", "Leather Goods": "#FEF9C3", "Garments & Textiles": "#EDE9FE",
  "Bags & Accessories": "#DBEAFE", "Auto Parts": "#FEE2E2", "Plastics": "#E0F2FE",
  "Furniture": "#FFF3CD", "Packaging": "#F0FDF4", "Food Processing": "#FFF7ED", "Building Materials": "#F1F5F9",
};

const VERIFICATION_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  UNVERIFIED:         { label: "Unverified",        color: "#6B7280", bg: "#F3F4F6" },
  VERIFIED_BUSINESS:  { label: "Verified Business", color: "#1D4ED8", bg: "#DBEAFE" },
  VERIFIED_FACILITY:  { label: "Verified Facility", color: "#6D28D9", bg: "#EDE9FE" },
  FACTORY_CERTIFIED:  { label: "Certified",         color: "#6B4B10", bg: "#FEF3C7" },
  EXPORT_CERTIFIED:   { label: "Export Ready",      color: "#064E30", bg: "#DCFCE7" },
};

const G = "#008751";
const GD = "#006641";
const GT = "#E8F5EE";
const BORDER = "#E8E8E8";
const TEXT = "#333333";
const MUTED = "#666666";
const LIGHT = "#999999";

export default function HomePage() {
  const router = useRouter();
  const user = getUser();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  /* read ?q= from URL on mount so Nav search redirects work */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearch(q);
  }, []);

  const loadData = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);
    setLoading(true);
    Promise.all([
      api.get<Factory[]>(`/factory?${params}`),
      api.get<RFQ[]>("/rfq"),
    ]).then(([f, r]) => {
      setFactories(f);
      setRFQs(r.slice(0, 4));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(loadData, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [loadData, search]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadData();
  }

  const daysLeft = (d: string) => Math.max(0, Math.floor((new Date(d).getTime() - Date.now()) / 86400000));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>

      {/* ━━━━━━━━━ HEADER (3-tier sticky) ━━━━━━━━━ */}
      <header style={{ position: "sticky", top: 0, zIndex: 50 }}>

        {/* Tier 1 — Utility bar */}
        <div style={{ backgroundColor: "#F7F7F7", borderBottom: `1px solid ${BORDER}`, height: "32px" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
            <span style={{ fontSize: "11px", color: MUTED }}>Ship from: Nigeria, Aba</span>
            <div className="flex items-center gap-3" style={{ fontSize: "11px", color: MUTED }}>
              <Link href="/auth/register?role=supplier" style={{ color: MUTED, textDecoration: "none" }}>
                Become a Supplier
              </Link>
              <span style={{ color: BORDER }}>|</span>
              {user ? (
                <>
                  <span style={{ color: TEXT }}>{user.name}</span>
                  <Link href={`/dashboard/${user.role.toLowerCase()}`} style={{ color: G, fontWeight: 600, textDecoration: "none" }}>
                    My Account
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" style={{ color: MUTED, textDecoration: "none" }}>Sign In</Link>
                  <Link href="/auth/register" style={{ color: G, fontWeight: 600, textDecoration: "none" }}>Join Free</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2 — Main header with search */}
        <div style={{ backgroundColor: "white", borderBottom: `1px solid ${BORDER}`, height: "64px" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center gap-4">
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0, marginRight: "8px" }}>
              <Image src="/logo.png" alt="Ekorafon" width={44} height={44} style={{ objectFit: "contain" }} priority />
            </Link>

            <form onSubmit={handleSearch} className="flex flex-1 max-w-2xl" style={{ border: `2px solid ${G}`, borderRadius: "4px" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search manufacturers, products, categories..."
                style={{ flex: 1, padding: "0 14px", fontSize: "13px", outline: "none", border: "none", height: "40px", color: TEXT, backgroundColor: "white" }}
              />
              <button
                type="submit"
                style={{ backgroundColor: G, color: "white", padding: "0 20px", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer", flexShrink: 0, borderRadius: "0 2px 2px 0" }}
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-3 ml-auto shrink-0">
              <Link
                href="/dashboard/buyer/rfq/new"
                style={{ border: `1px solid ${G}`, color: G, padding: "7px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "4px", textDecoration: "none", whiteSpace: "nowrap" }}
              >
                + Post RFQ
              </Link>
              {user ? (
                <Link
                  href={`/dashboard/${user.role.toLowerCase()}`}
                  style={{ backgroundColor: G, color: "white", padding: "7px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "4px", textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  My Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/register"
                  style={{ backgroundColor: G, color: "white", padding: "7px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "4px", textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  Join Free
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tier 3 — Category / secondary nav */}
        <div style={{ backgroundColor: "white", borderBottom: `1px solid ${BORDER}` }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center overflow-x-auto" style={{ height: "40px", gap: 0 }}>
            <button
              onClick={() => setCategory("All")}
              style={{
                fontSize: "12px", fontWeight: 600, padding: "0 14px", height: "100%",
                background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap",
                color: category === "All" ? G : MUTED,
                borderBottom: category === "All" ? `2px solid ${G}` : "2px solid transparent",
              }}
            >
              All Categories
            </button>
            {CATEGORIES.filter((c) => c !== "All").map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  fontSize: "12px", fontWeight: 500, padding: "0 14px", height: "100%",
                  background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap",
                  color: category === cat ? G : MUTED,
                  borderBottom: category === cat ? `2px solid ${G}` : "2px solid transparent",
                }}
              >
                {cat}
              </button>
            ))}
            <div className="ml-auto flex shrink-0">
              <Link href="/rfq" style={{ fontSize: "12px", color: MUTED, textDecoration: "none", padding: "0 14px", display: "flex", alignItems: "center", height: "40px" }}>
                RFQ Board
              </Link>
              <Link href="/factories" style={{ fontSize: "12px", color: MUTED, textDecoration: "none", padding: "0 14px", display: "flex", alignItems: "center", height: "40px" }}>
                All Manufacturers
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ━━━━━━━━━ HERO ━━━━━━━━━ */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0,107,61,0.65) 0%, rgba(0,67,40,0.75) 100%), url('/hero-image2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        minHeight: "320px",
      }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex gap-5 items-start">

          {/* Left: headline + CTAs + live stats */}
          <div style={{ flex: 1, paddingTop: "12px", paddingBottom: "16px" }}>
            <p style={{ color: "#A8DFBF", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", marginBottom: "14px" }}>
              NIGERIA&apos;S B2B TRADE PLATFORM &middot; ABA, ABIA STATE
            </p>
            <h1 style={{ color: "white", fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "14px" }}>
              Source from African<br />Manufacturers
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.65, maxWidth: "460px", marginBottom: "24px" }}>
              Verified factories, live RFQ marketplace, and ETRS reputation scoring &mdash; built for global buyers sourcing from Nigeria.
            </p>
            <div className="flex gap-3">
              <Link
                href="/auth/register?role=buyer"
                style={{ backgroundColor: "white", color: G, padding: "10px 22px", fontSize: "13px", fontWeight: 700, borderRadius: "4px", textDecoration: "none" }}
              >
                Post an RFQ
              </Link>
              <Link
                href="/factories"
                style={{ border: "1px solid rgba(255,255,255,0.35)", color: "white", padding: "10px 22px", fontSize: "13px", fontWeight: 600, borderRadius: "4px", textDecoration: "none" }}
              >
                Browse Factories
              </Link>
            </div>
            <div className="flex gap-8" style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {[
                { v: loading ? "—" : String(factories.length), l: "Manufacturers" },
                { v: loading ? "—" : String(rfqs.length), l: "Open RFQs" },
                { v: "100%", l: "Verified Listings" },
              ].map((s) => (
                <div key={s.l}>
                  <p style={{ color: "white", fontSize: "24px", fontWeight: 900, lineHeight: 1 }}>{s.v}</p>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", marginTop: "4px" }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3 quick-action cards */}
          <div style={{ width: "248px", display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0, paddingTop: "16px" }} className="hidden md:flex">
            {[
              { title: "Request for Quotation", desc: "Tell suppliers exactly what you need", href: "/auth/register?role=buyer" },
              { title: "Browse Manufacturers", desc: "Explore verified Aba factories", href: "/factories" },
              { title: "View Open RFQs", desc: "See what buyers are sourcing now", href: "/rfq" },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                style={{ backgroundColor: "white", borderRadius: "4px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", borderLeft: `3px solid ${G}` }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: TEXT, fontSize: "13px", lineHeight: 1.3 }}>{card.title}</p>
                  <p style={{ color: MUTED, fontSize: "11px", marginTop: "2px" }}>{card.desc}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━ QUICK TOOLS ROW ━━━━━━━━━ */}
      <div style={{ backgroundColor: "white", borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {([
            { abbr: "RFQ", title: "Request for Quotation", desc: "Post your sourcing requirements for free", href: "/dashboard/buyer/rfq/new", tint: GT },
            { abbr: "MFG", title: "Browse Manufacturers", desc: "Explore all verified Aba factories", href: "/factories", tint: "#E8F4FF" },
            { abbr: "LIVE", title: "Live RFQ Board", desc: "View the most active sourcing requests", href: "/rfq", tint: "#FFF3CD" },
          ] as { abbr: string; title: string; desc: string; href: string; tint: string }[]).map((t) => (
            <Link
              key={t.title}
              href={t.href}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", border: `1px solid ${BORDER}`, borderRadius: "4px", textDecoration: "none", backgroundColor: "white" }}
            >
              <div style={{ width: "44px", height: "44px", backgroundColor: t.tint, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "9px", fontWeight: 800, color: G, letterSpacing: "0.04em" }}>{t.abbr}</span>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "13px", color: TEXT }}>{t.title}</p>
                <p style={{ fontSize: "11px", color: MUTED, marginTop: "2px" }}>{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ━━━━━━━━━ CATEGORY GRID ━━━━━━━━━ */}
      <div style={{ backgroundColor: "white", marginTop: "8px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: TEXT }}>Browse by Category</h2>
            <Link href="/factories" style={{ fontSize: "12px", color: G, textDecoration: "none", fontWeight: 600 }}>
              View all manufacturers &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2.5">
            {CATEGORIES.filter((c) => c !== "All").map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "12px 8px",
                  border: `1px solid ${category === cat ? G : BORDER}`,
                  borderRadius: "4px",
                  textAlign: "center",
                  backgroundColor: category === cat ? GT : "white",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  width: "36px", height: "36px", borderRadius: "4px",
                  margin: "0 auto 6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: CATEGORY_TINT[cat] || GT,
                }}>
                  <span style={{ fontSize: "8px", fontWeight: 800, color: G, letterSpacing: "0.04em" }}>
                    {CATEGORY_ABBR[cat] || cat.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: "11px", color: category === cat ? G : TEXT, fontWeight: category === cat ? 600 : 500, lineHeight: 1.3 }}>
                  {cat}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━ TRUST SIGNALS ━━━━━━━━━ */}
      <div style={{ backgroundColor: "white", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, marginTop: "8px" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 grid grid-cols-2 md:grid-cols-4">
          {([
            { abbr: "VRF", title: "Verified Manufacturers", desc: "Every factory goes through a vetting process" },
            { abbr: "ETRS", title: "Reputation Scoring", desc: "Trade reputation score on every profile" },
            { abbr: "RFQ", title: "Live RFQ Marketplace", desc: "Direct connection to active buyers" },
            { abbr: "EXP", title: "Export-Ready Factories", desc: "International-grade certified suppliers" },
          ] as { abbr: string; title: string; desc: string }[]).map((t, i) => (
            <div
              key={t.title}
              style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px",
                borderLeft: i > 0 ? `1px solid ${BORDER}` : "none",
              }}
            >
              <div style={{ width: "44px", height: "44px", backgroundColor: GT, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "8px", fontWeight: 800, color: G, letterSpacing: "0.04em" }}>{t.abbr}</span>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "12px", color: TEXT }}>{t.title}</p>
                <p style={{ fontSize: "11px", color: MUTED, marginTop: "2px", lineHeight: 1.4 }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━━━━━━━ OPEN RFQs ━━━━━━━━━ */}
      {rfqs.length > 0 && (
        <div style={{ backgroundColor: "#F5F5F5", padding: "20px 0", marginTop: "8px" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: TEXT }}>Open Sourcing Requests</h2>
                <p style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>
                  Active buyers seeking manufacturers &mdash; submit a quote to win business
                </p>
              </div>
              <Link href="/rfq" style={{ fontSize: "12px", color: G, textDecoration: "none", fontWeight: 600 }}>
                View all &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {rfqs.map((r) => {
                const days = daysLeft(r.deadline);
                return (
                  <Link
                    key={r.id}
                    href={`/rfq/${r.id}`}
                    style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", textDecoration: "none" }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: "13px", color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.title}
                      </p>
                      <p style={{ fontSize: "11px", color: MUTED, marginTop: "3px" }}>
                        {r.category} &middot; {r.quantity.toLocaleString()} units &middot; &#8358;{r.budgetMin.toLocaleString()}&ndash;&#8358;{r.budgetMax.toLocaleString()}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: "14px", borderLeft: `1px solid ${BORDER}` }}>
                      <p style={{ fontSize: "22px", fontWeight: 900, color: G, lineHeight: 1 }}>{r._count.quotes}</p>
                      <p style={{ fontSize: "10px", color: LIGHT }}>quotes</p>
                      <p style={{ fontSize: "10px", fontWeight: 600, color: days <= 3 ? "#B91C1C" : GD, marginTop: "3px" }}>{days}d left</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━ FACTORY GRID ━━━━━━━━━ */}
      <div style={{ backgroundColor: "white", marginTop: "8px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: TEXT }}>
                {category === "All" ? "Top Manufacturers" : category}
                {!loading && (
                  <span style={{ fontSize: "13px", fontWeight: 400, color: LIGHT, marginLeft: "6px" }}>
                    ({factories.length})
                  </span>
                )}
              </h2>
              {search && (
                <p style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>
                  Results for &ldquo;{search}&rdquo;
                </p>
              )}
            </div>
            <Link href="/factories" style={{ fontSize: "12px", color: G, textDecoration: "none", fontWeight: 600 }}>
              View all &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse" style={{ backgroundColor: "#EBEBEB", borderRadius: "4px", height: "200px" }} />
              ))}
            </div>
          ) : factories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", border: `1px solid ${BORDER}`, borderRadius: "4px" }}>
              <div style={{ width: "40px", height: "40px", backgroundColor: GT, borderRadius: "4px", margin: "0 auto 12px" }} />
              <p style={{ fontWeight: 600, fontSize: "14px", color: TEXT }}>No manufacturers found</p>
              <p style={{ fontSize: "12px", color: MUTED, margin: "6px 0 20px" }}>
                {search ? "Try a different search term" : "Be the first to list your factory on Ekorafon"}
              </p>
              <Link
                href="/auth/register?role=supplier"
                style={{ backgroundColor: G, color: "white", padding: "8px 20px", fontSize: "12px", fontWeight: 600, borderRadius: "4px", textDecoration: "none" }}
              >
                List Your Factory
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {factories.map((f) => {
                const badge = VERIFICATION_BADGE[f.verificationLevel] ?? VERIFICATION_BADGE.UNVERIFIED;
                const isVerified = f.verificationLevel !== "UNVERIFIED";
                return (
                  <Link
                    key={f.id}
                    href={`/factories/${f.id}`}
                    className="hover:shadow-md transition-shadow"
                    style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", display: "flex", flexDirection: "column", textDecoration: "none", overflow: "hidden" }}
                  >
                    <div style={{ height: "2px", backgroundColor: isVerified ? G : BORDER }} />
                    <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <h3 style={{ fontWeight: 700, fontSize: "13px", color: TEXT, lineHeight: 1.3 }}>{f.businessName}</h3>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: "9px", padding: "2px 6px", borderRadius: "4px", fontWeight: 600, flexShrink: 0 }}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="line-clamp-2" style={{ fontSize: "11px", color: MUTED, lineHeight: 1.5, flex: 1 }}>{f.description}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {f.productCategories.slice(0, 2).map((c) => (
                          <span key={c} style={{ backgroundColor: GT, color: GD, fontSize: "10px", padding: "2px 6px", borderRadius: "4px" }}>{c}</span>
                        ))}
                        {f.productCategories.length > 2 && (
                          <span style={{ backgroundColor: "#F5F5F5", color: LIGHT, fontSize: "10px", padding: "2px 6px", borderRadius: "4px" }}>
                            +{f.productCategories.length - 2}
                          </span>
                        )}
                      </div>
                      <div style={{ paddingTop: "8px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <p style={{ fontSize: "12px", fontWeight: 600, color: TEXT }}>MOQ {f.moq.toLocaleString()}</p>
                          <p style={{ fontSize: "11px", color: MUTED }}>{f.lga}</p>
                        </div>
                        {f.user.etrs && f.user.etrs.score > 0 && (
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "16px", fontWeight: 900, color: G, lineHeight: 1 }}>{f.user.etrs.score.toFixed(0)}</p>
                            <p style={{ fontSize: "9px", color: LIGHT }}>ETRS</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ━━━━━━━━━ SUPPLIER CTA ━━━━━━━━━ */}
      {!user && (
        <div style={{ backgroundColor: G, marginTop: "8px" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)", marginBottom: "10px" }}>
                FOR MANUFACTURERS
              </p>
              <h3 style={{ fontSize: "24px", fontWeight: 900, color: "white", marginBottom: "14px", lineHeight: 1.2 }}>
                List your factory. Reach global buyers.
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  "Free listing with your complete factory profile",
                  "Receive sourcing requests directly from qualified buyers",
                  "Build trade reputation with your ETRS score",
                ].map((item) => (
                  <p key={item} style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "white", fontWeight: 700 }}>&#8212;</span> {item}
                  </p>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0, minWidth: "160px" }}>
              <Link
                href="/auth/register?role=supplier"
                style={{ backgroundColor: "white", color: G, padding: "12px 24px", fontSize: "13px", fontWeight: 700, borderRadius: "4px", textDecoration: "none", textAlign: "center" }}
              >
                List for Free &rarr;
              </Link>
              <Link
                href="/auth/register?role=buyer"
                style={{ border: "1px solid rgba(255,255,255,0.4)", color: "white", padding: "12px 24px", fontSize: "13px", fontWeight: 600, borderRadius: "4px", textDecoration: "none", textAlign: "center" }}
              >
                Post an RFQ
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━ FOOTER ━━━━━━━━━ */}
      <footer style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="md:col-span-2">
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 24px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}>
                <Image src="/logo3.png" alt="Ekorafon" width={200} height={100} style={{ objectFit: "contain" }} />
              </div>
              <p style={{ fontSize: "13px", marginTop: "16px", lineHeight: 1.7, color: "rgba(255,255,255,0.4)", maxWidth: "300px" }}>
                Nigeria&rsquo;s B2B trade infrastructure platform for African manufacturers &mdash; built for global scale, starting from Aba, Abia State.
              </p>
            </div>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", marginBottom: "16px" }}>MARKETPLACE</p>
              {([["Manufacturers", "/factories"], ["RFQ Board", "/rfq"], ["Post a Request", "/auth/register?role=buyer"], ["List Your Factory", "/auth/register?role=supplier"]] as [string, string][]).map(([l, h]) => (
                <Link key={l} href={h} style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: "10px" }}>{l}</Link>
              ))}
            </div>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", marginBottom: "16px" }}>PLATFORM</p>
              {([["About ETRS", "/etrs"], ["Privacy Policy", "/privacy"], ["Terms of Use", "/terms"]] as [string, string][]).map(([l, h]) => (
                <Link key={l} href={h} style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: "10px" }}>{l}</Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3" style={{ paddingTop: "20px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
              &copy; 2026 Ekorafon Limited &middot; Aba, Abia State, Nigeria
            </span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.15)" }}>
              Powering African trade infrastructure
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
