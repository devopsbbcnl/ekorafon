"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import Footer from "@/components/footer";
import { api } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  moq: number;
  unit: string;
  inStock: boolean;
  leadTimeDays: number;
  images: string[];
  createdAt: string;
  supplier: { name: string };
  factory: { businessName: string; verificationLevel: string; lga: string } | null;
}

const CATEGORIES = [
  "All", "Footwear", "Leather Goods", "Garments & Textiles",
  "Bags & Accessories", "Auto Parts", "Plastics", "Furniture",
  "Packaging", "Food Processing", "Building Materials",
];

const VERIFICATION_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  UNVERIFIED:        { label: "Unverified",        color: "#6B7280", bg: "#F3F4F6" },
  VERIFIED_BUSINESS: { label: "Verified Business", color: "#1D4ED8", bg: "#DBEAFE" },
  VERIFIED_FACILITY: { label: "Verified Facility", color: "#6D28D9", bg: "#EDE9FE" },
  FACTORY_CERTIFIED: { label: "Certified",         color: "#6B4B10", bg: "#FEF3C7" },
  EXPORT_CERTIFIED:  { label: "Export Ready",      color: "#064E30", bg: "#DCFCE7" },
};

const CATEGORY_TINT: Record<string, string> = {
  "Footwear":             "#E8F5EE",
  "Leather Goods":        "#FEF9C3",
  "Garments & Textiles":  "#EDE9FE",
  "Bags & Accessories":   "#DBEAFE",
  "Auto Parts":           "#FEE2E2",
  "Plastics":             "#E0F2FE",
  "Furniture":            "#FFF3CD",
  "Packaging":            "#F0FDF4",
  "Food Processing":      "#FFF7ED",
  "Building Materials":   "#F1F5F9",
};

const G      = "#008751";
const GD     = "#006641";
const GT     = "#E8F5EE";
const BORDER = "#E8E8E8";
const TEXT   = "#333333";
const MUTED  = "#666666";
const LIGHT  = "#999999";

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function ProductCard({ product }: { product: Product }) {
  const badge = product.factory
    ? (VERIFICATION_BADGE[product.factory.verificationLevel] ?? VERIFICATION_BADGE.UNVERIFIED)
    : null;
  const tint = CATEGORY_TINT[product.category] ?? GT;

  return (
    <Link href={`/products/${product.id}`} style={{ textDecoration: "none" }}>
      <div
        className="overflow-hidden transition-shadow cursor-pointer hover:shadow-md"
        style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px" }}
      >
        <div className="flex items-center justify-center" style={{ height: "160px", backgroundColor: tint }}>
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span className="text-3xl font-black" style={{ color: G, opacity: 0.35 }}>
              {product.category.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ padding: "14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 6px", borderRadius: "4px", backgroundColor: tint, color: GD }}>
              {product.category}
            </span>
            <span style={{
              fontSize: "10px", fontWeight: 600, padding: "2px 6px", borderRadius: "4px", flexShrink: 0,
              backgroundColor: product.inStock ? "#D1FAE5" : "#FEE2E2",
              color: product.inStock ? "#065F46" : "#B91C1C",
            }}>
              {product.inStock ? "In Stock" : "Out"}
            </span>
          </div>

          <p style={{ fontWeight: 700, fontSize: "13px", color: TEXT, lineHeight: 1.3, marginBottom: "4px" }} className="line-clamp-2">
            {product.name}
          </p>

          {product.factory && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <p style={{ fontSize: "11px", color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {product.factory.businessName}
              </p>
              {badge && (
                <span style={{ fontSize: "9px", fontWeight: 600, padding: "2px 5px", borderRadius: "4px", flexShrink: 0, backgroundColor: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              )}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingTop: "8px", borderTop: `1px solid ${BORDER}` }}>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 900, color: G, lineHeight: 1 }}>{fmt(product.unitPrice)}</p>
              <p style={{ fontSize: "10px", color: LIGHT }}>per {product.unit}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: TEXT }}>MOQ {product.moq.toLocaleString()}</p>
              <p style={{ fontSize: "10px", color: LIGHT }}>{product.leadTimeDays}d lead</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", overflow: "hidden" }}>
      <div className="animate-pulse" style={{ height: "160px", backgroundColor: "#EBEBEB" }} />
      <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div className="animate-pulse" style={{ height: "12px", width: "75%", borderRadius: "4px", backgroundColor: "#EBEBEB" }} />
        <div className="animate-pulse" style={{ height: "10px", width: "50%", borderRadius: "4px", backgroundColor: "#EBEBEB" }} />
        <div className="animate-pulse" style={{ height: "18px", width: "33%", borderRadius: "4px", backgroundColor: "#EBEBEB", marginTop: "6px" }} />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    setLoading(true);
    api.get<Product[]>(`/product?${params}`)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearch(q);
  }, []);

  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.factory?.businessName.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Nav active="products" />

      <div className="px-4 md:px-6 py-5">

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 700, color: TEXT }}>Product Catalogue</h1>
            <p style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>
              Direct-order products from verified Aba manufacturers
            </p>
          </div>
          <button
            onClick={() => router.push("/rfq")}
            style={{ border: `1px solid ${G}`, color: G, padding: "7px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "4px", backgroundColor: "white", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Can&apos;t find it? Post RFQ
          </button>
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex max-w-2xl"
          style={{ border: `2px solid ${G}`, borderRadius: "4px", marginBottom: "12px" }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, categories, manufacturers..."
            style={{
              flex: 1, padding: "0 14px", fontSize: "13px",
              outline: "none", border: "none", height: "40px",
              color: TEXT, backgroundColor: "white",
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: G, color: "white",
              padding: "0 20px", fontSize: "13px",
              fontWeight: 600, border: "none", cursor: "pointer",
              flexShrink: 0, borderRadius: "0 2px 2px 0",
            }}
          >
            Search
          </button>
        </form>

        {/* Category nav strip */}
        <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", marginBottom: "16px", display: "flex", overflowX: "auto" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                fontSize: "12px", fontWeight: 500, padding: "0 14px", height: "40px",
                background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap",
                color: category === cat ? G : MUTED,
                borderBottom: category === cat ? `2px solid ${G}` : "2px solid transparent",
                flexShrink: 0,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p style={{ fontSize: "12px", color: MUTED, marginBottom: "12px" }}>
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            {category !== "All" ? ` in ${category}` : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", border: `1px solid ${BORDER}`, borderRadius: "4px", backgroundColor: "white" }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: GT, borderRadius: "4px", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "9px", fontWeight: 800, color: G }}>—</span>
            </div>
            <p style={{ fontWeight: 600, fontSize: "14px", color: TEXT }}>No products found</p>
            <p style={{ fontSize: "12px", color: MUTED, margin: "6px 0 20px" }}>
              {search || category !== "All"
                ? "Try a different search or category"
                : "Suppliers haven't listed direct-order products yet"}
            </p>
            <Link
              href="/rfq"
              style={{ backgroundColor: G, color: "white", padding: "8px 20px", fontSize: "12px", fontWeight: 600, borderRadius: "4px", textDecoration: "none" }}
            >
              Post an RFQ instead →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
