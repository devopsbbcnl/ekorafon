"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";

interface NavProps {
  active?: "factories" | "rfq" | "products";
  variant?: "default" | "dashboard";
  breadcrumb?: string;
  /** Strips the utility bar and search — used where a sidebar nav (with its own sign-out) replaces them */
  minimal?: boolean;
  /** Replaces the default search + Post RFQ/Marketplace actions with custom content (e.g. a page greeting + CTAs) */
  headerSlot?: React.ReactNode;
}

const G = "#008751";
const BORDER = "#E8E8E8";
const TEXT = "#333333";
const MUTED = "#666666";

export function Nav({ active, variant = "default", breadcrumb, minimal = false, headerSlot }: NavProps) {
  const router = useRouter();
  // Start null so server and client initial renders match, then populate on mount
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { setUser(getUser()); }, []);

  function handleLogout() {
    logout();
    router.push("/");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?q=${encodeURIComponent(search)}`);
    }
  }

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50 }}>

      {/* Tier 1: Utility bar */}
      {!minimal && (
        <div style={{ backgroundColor: "#F7F7F7", borderBottom: `1px solid ${BORDER}`, height: "32px" }}>
          <div className="px-4 md:px-6 h-full flex items-center justify-between">
            <span style={{ fontSize: "11px", color: MUTED }}>Ship from: Nigeria, Aba</span>
            <div className="flex items-center gap-4" style={{ fontSize: "11px", color: MUTED }}>
              {!user && (
                <Link href="/auth/register?role=supplier" style={{ color: MUTED, textDecoration: "none" }}>
                  Become a Supplier
                </Link>
              )}
              <span style={{ color: BORDER }}>|</span>
              {user ? (
                <>
                  <span style={{ color: TEXT }}>{user.name}</span>
                  <button
                    onClick={handleLogout}
                    style={{ color: MUTED, background: "none", border: "none", cursor: "pointer", fontSize: "11px", padding: 0 }}
                  >
                    Sign Out
                  </button>
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
      )}

      {/* Tier 2: Main header */}
      <div style={{ backgroundColor: "white", borderBottom: `1px solid ${BORDER}`, ...(headerSlot ? { paddingTop: "12px", paddingBottom: "12px" } : { height: "64px" }) }}>
        <div className="px-4 md:px-6 flex items-center gap-4" style={{ height: headerSlot ? undefined : "100%" }}>

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0 mr-2">
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              <Image src="/logo.png" alt="Ekorafon" width={44} height={44} style={{ objectFit: "contain" }} priority />
            </Link>
            {breadcrumb && !headerSlot && (
              <>
                <span style={{ color: BORDER, fontSize: "14px", margin: "0 4px" }}>/</span>
                <span style={{ fontSize: "13px", color: MUTED }}>{breadcrumb}</span>
              </>
            )}
          </div>

          {headerSlot ? (
            <div className="flex-1 min-w-0">{headerSlot}</div>
          ) : (
            <>
              {/* Search */}
              {!minimal && (
                <form onSubmit={handleSearch} className="flex flex-1 max-w-2xl" style={{ border: `2px solid ${G}`, borderRadius: "4px" }}>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search manufacturers, products, categories..."
                    style={{ flex: 1, padding: "0 14px", fontSize: "13px", outline: "none", border: "none", height: "40px", color: TEXT, backgroundColor: "white" }}
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: G, color: "white", padding: "0 18px", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer", flexShrink: 0, borderRadius: "0 2px 2px 0" }}
                  >
                    Search
                  </button>
                </form>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 ml-auto shrink-0">
                <Link
                  href="/dashboard/buyer/rfq/new"
                  style={{ border: `1px solid ${G}`, color: G, padding: "7px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "4px", textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  + Post RFQ
                </Link>
                {user && variant !== "dashboard" && (
                  <Link
                    href={`/dashboard/${user.role.toLowerCase()}`}
                    style={{ backgroundColor: G, color: "white", padding: "7px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "4px", textDecoration: "none", whiteSpace: "nowrap" }}
                  >
                    My Dashboard
                  </Link>
                )}
                {user && variant === "dashboard" && (
                  <Link href="/" style={{ color: MUTED, fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
                    Marketplace
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tier 3: Secondary nav — default variant */}
      {variant === "default" && (
        <div style={{ backgroundColor: "white", borderBottom: `1px solid ${BORDER}` }}>
          <div className="px-4 md:px-6 flex items-center" style={{ height: "40px" }}>
            {([
              ["All Manufacturers", "/factories", "factories"],
              ["Products", "/products", "products"],
              ["RFQ Board", "/rfq", "rfq"],
              ["Trade Protection", "/trade", "trade"],
              ["Help Center", "/help", "help"],
            ] as [string, string, string][]).map(([label, href, key]) => (
              <Link
                key={key}
                href={href}
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  padding: "0 14px",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                  color: active === key ? G : MUTED,
                  borderBottom: active === key ? `2px solid ${G}` : "2px solid transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tier 3: Breadcrumb bar — dashboard variant */}
      {variant === "dashboard" && (
        <div style={{ backgroundColor: "#F7F7F7", borderBottom: `1px solid ${BORDER}` }}>
          <div className="px-4 md:px-6 flex items-center" style={{ height: "36px" }}>
            <Link href="/" style={{ fontSize: "11px", color: MUTED, textDecoration: "none" }}>Home</Link>
            <span style={{ color: BORDER, margin: "0 8px", fontSize: "12px" }}>/</span>
            <Link
              href={user ? `/dashboard/${user.role.toLowerCase()}` : "/"}
              style={{ fontSize: "11px", color: MUTED, textDecoration: "none" }}
            >
              {user?.role === "SUPPLIER" ? "Supplier Dashboard" : "Buyer Dashboard"}
            </Link>
            {breadcrumb && (
              <>
                <span style={{ color: BORDER, margin: "0 8px", fontSize: "12px" }}>/</span>
                <span style={{ fontSize: "11px", color: TEXT, fontWeight: 600 }}>{breadcrumb}</span>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
