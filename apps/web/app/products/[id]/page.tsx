"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/nav";
import Footer from "@/components/footer";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

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
  supplierId: string;
  createdAt: string;
  supplier: {
    name: string;
    etrs: { score: number } | null;
  };
  factory: {
    id: string;
    businessName: string;
    verificationLevel: string;
    address: string;
    lga: string;
    phone: string;
  } | null;
}

const VERIFICATION_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  UNVERIFIED:        { label: "Unverified",        color: "#6B7280", bg: "#F3F4F6" },
  VERIFIED_BUSINESS: { label: "Verified Business", color: "#1D4ED8", bg: "#DBEAFE" },
  VERIFIED_FACILITY: { label: "Verified Facility", color: "#6D28D9", bg: "#EDE9FE" },
  FACTORY_CERTIFIED: { label: "Factory Certified", color: "#6B4B10", bg: "#FEF3C7" },
  EXPORT_CERTIFIED:  { label: "Export Ready",      color: "#064E30", bg: "#DCFCE7" },
};

const G      = "#008751";
const GT     = "#E8F5EE";
const BORDER = "#E8E8E8";
const TEXT   = "#333333";
const MUTED  = "#666666";

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

interface PlaceOrderModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

function PlaceOrderModal({ product, onClose, onSuccess }: PlaceOrderModalProps) {
  const [qty, setQty] = useState(product.moq);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = product.unitPrice * qty;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (qty < product.moq) {
      setError(`Minimum order quantity is ${product.moq} ${product.unit}`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const order = await api.post<{ id: string }>("/order", {
        supplierId: product.supplierId,
        deliveryAddress: address,
        notes: notes || undefined,
        items: [{ productId: product.id, quantity: qty }],
      });
      onSuccess(order.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    borderRadius: "4px", border: `1px solid ${BORDER}`,
    fontSize: "14px", outline: "none",
    backgroundColor: "white", color: TEXT,
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div style={{ backgroundColor: "white", borderRadius: "4px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Modal header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "16px", color: TEXT }}>Place Order</h2>
            <p style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>{product.name}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: MUTED }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Order summary */}
          <div style={{ borderRadius: "4px", padding: "14px", backgroundColor: "#F5F5F5", border: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: MUTED }}>Unit Price</span>
              <span style={{ fontWeight: 600, color: TEXT, fontSize: "13px" }}>{fmt(product.unitPrice)} / {product.unit}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", color: MUTED }}>Minimum Order</span>
              <span style={{ fontWeight: 600, color: TEXT, fontSize: "13px" }}>{product.moq.toLocaleString()} {product.unit}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: `1px solid ${BORDER}` }}>
              <span style={{ fontWeight: 700, fontSize: "13px", color: TEXT }}>Order Total</span>
              <span style={{ fontWeight: 900, fontSize: "18px", color: G }}>{fmt(total)}</span>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: MUTED, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Quantity ({product.unit})
            </label>
            <input
              style={inputStyle}
              type="number"
              required
              min={product.moq}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
            <p style={{ fontSize: "11px", color: MUTED, marginTop: "4px" }}>
              Minimum: {product.moq.toLocaleString()} {product.unit}
            </p>
          </div>

          {/* Delivery address */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: MUTED, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Delivery Address *
            </label>
            <input
              style={inputStyle}
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full delivery address including city and state"
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: MUTED, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Order Notes (optional)
            </label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Colours, sizes, custom packaging, labelling requirements..."
            />
          </div>

          {error && (
            <div style={{ fontSize: "13px", padding: "10px 14px", borderRadius: "4px", backgroundColor: "#FEE2E2", color: "#B91C1C" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "10px", borderRadius: "4px", fontWeight: 600, fontSize: "13px", border: `1px solid ${BORDER}`, color: MUTED, backgroundColor: "white", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: "10px", borderRadius: "4px", fontWeight: 700, fontSize: "13px", backgroundColor: G, color: "white", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}
            >
              {loading ? "Placing order…" : `Place Order — ${fmt(total)}`}
            </button>
          </div>

          <p style={{ fontSize: "11px", textAlign: "center", color: MUTED }}>
            Payment is held securely in escrow until you confirm delivery.
          </p>
        </form>
      </div>
    </div>
  );
}

function OrderSuccessModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div style={{ backgroundColor: "white", borderRadius: "4px", width: "100%", maxWidth: "360px", padding: "32px 24px", textAlign: "center", border: `1px solid ${BORDER}` }}>
        <div
          style={{ width: "56px", height: "56px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "22px", margin: "0 auto 16px", backgroundColor: "#D1FAE5", color: "#065F46" }}
        >
          ✓
        </div>
        <h2 style={{ fontWeight: 700, fontSize: "18px", color: TEXT, marginBottom: "8px" }}>Order Placed!</h2>
        <p style={{ fontSize: "13px", color: MUTED, marginBottom: "24px" }}>
          Your order has been sent to the supplier. You&apos;ll be notified when they confirm production.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "9px", borderRadius: "4px", fontWeight: 600, fontSize: "13px", border: `1px solid ${BORDER}`, color: MUTED, backgroundColor: "white", cursor: "pointer" }}
          >
            Keep Browsing
          </button>
          <button
            onClick={() => router.push("/dashboard/buyer?tab=orders")}
            style={{ flex: 1, padding: "9px", borderRadius: "4px", fontWeight: 700, fontSize: "13px", backgroundColor: G, color: "white", border: "none", cursor: "pointer" }}
          >
            Track Order →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = getUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  useEffect(() => {
    api.get<Product>(`/product/${id}`)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Nav />
        <div className="flex items-center justify-center h-64">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: G, animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Nav />
        <div className="flex flex-col items-center justify-center py-20">
          <div style={{ width: "40px", height: "40px", backgroundColor: GT, borderRadius: "4px", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "18px", fontWeight: 900, color: G }}>?</span>
          </div>
          <p style={{ fontWeight: 600, fontSize: "14px", color: TEXT, marginBottom: "8px" }}>Product not found</p>
          <Link href="/products" style={{ color: G, textDecoration: "none", fontSize: "13px" }}>← Back to products</Link>
        </div>
      </div>
    );
  }

  const badge = product.factory
    ? (VERIFICATION_BADGE[product.factory.verificationLevel] ?? VERIFICATION_BADGE.UNVERIFIED)
    : null;

  const isBuyer = user?.role === "BUYER";
  const isOwner = user?.id === product.supplierId;

  function handleOrderClick() {
    if (!user) {
      router.push(`/auth/login?redirect=/products/${product!.id}`);
      return;
    }
    if (!isBuyer) return;
    setShowOrder(true);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Nav />

      {showOrder && !successOrderId && (
        <PlaceOrderModal
          product={product}
          onClose={() => setShowOrder(false)}
          onSuccess={(oid) => { setShowOrder(false); setSuccessOrderId(oid); }}
        />
      )}

      {successOrderId && (
        <OrderSuccessModal
          orderId={successOrderId}
          onClose={() => setSuccessOrderId(null)}
        />
      )}

      <div className="px-4 md:px-6 py-5">

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: MUTED, marginBottom: "16px" }}>
          <Link href="/" style={{ color: MUTED, textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/products" style={{ color: MUTED, textDecoration: "none" }}>Products</Link>
          <span>/</span>
          <span style={{ color: TEXT }}>{product.name}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-5">

          {/* Left: image + description */}
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* Product image */}
            <div
              style={{ height: "320px", borderRadius: "4px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#EBEBEB", border: `1px solid ${BORDER}` }}
            >
              {product.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontWeight: 900, fontSize: "48px", color: G, opacity: 0.2 }}>
                  {product.category.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* About */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <span style={{ display: "inline-block", fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", marginBottom: "8px", backgroundColor: GT, color: "#006641" }}>
                    {product.category}
                  </span>
                  <h1 style={{ fontSize: "20px", fontWeight: 700, color: TEXT }}>{product.name}</h1>
                </div>
                <span style={{
                  flexShrink: 0, fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "4px",
                  backgroundColor: product.inStock ? "#D1FAE5" : "#FEE2E2",
                  color: product.inStock ? "#065F46" : "#B91C1C",
                }}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <p style={{ fontSize: "13px", lineHeight: 1.65, color: MUTED }}>{product.description}</p>
            </div>

            {/* Specs */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "14px", color: TEXT, marginBottom: "14px" }}>Product Specifications</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Unit Price",    value: `${fmt(product.unitPrice)} / ${product.unit}` },
                  { label: "Minimum Order", value: `${product.moq.toLocaleString()} ${product.unit}` },
                  { label: "Lead Time",     value: `${product.leadTimeDays} days` },
                  { label: "Category",      value: product.category },
                ].map((s) => (
                  <div key={s.label} style={{ padding: "12px", backgroundColor: "#F5F5F5", borderRadius: "4px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: MUTED, marginBottom: "4px" }}>{s.label}</p>
                    <p style={{ fontWeight: 600, fontSize: "13px", color: TEXT }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: pricing + order + factory */}
          <div className="flex flex-col gap-4">

            {/* Pricing card */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px", position: "sticky", top: "120px" }}>
              <p style={{ fontSize: "26px", fontWeight: 900, color: G, lineHeight: 1, marginBottom: "2px" }}>{fmt(product.unitPrice)}</p>
              <p style={{ fontSize: "11px", color: MUTED, marginBottom: "16px" }}>per {product.unit} · MOQ: {product.moq.toLocaleString()} {product.unit}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                {[
                  `${product.leadTimeDays} day lead time`,
                  "Paystack escrow protected",
                  "Verified manufacturer",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, backgroundColor: G }} />
                    <span style={{ fontSize: "12px", color: MUTED }}>{f}</span>
                  </div>
                ))}
              </div>

              {!isOwner && (
                product.inStock ? (
                  <button
                    onClick={handleOrderClick}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "4px", fontWeight: 700, fontSize: "13px",
                      backgroundColor: isBuyer || !user ? G : "#E5E7EB",
                      color: isBuyer || !user ? "white" : MUTED,
                      border: "none", cursor: isBuyer || !user ? "pointer" : "not-allowed",
                    }}
                  >
                    {!user ? "Sign In to Order" : isBuyer ? "Place Order" : "Suppliers cannot order"}
                  </button>
                ) : (
                  <div style={{ width: "100%", padding: "10px", borderRadius: "4px", fontWeight: 600, fontSize: "13px", textAlign: "center", backgroundColor: "#E5E7EB", color: MUTED }}>
                    Currently Out of Stock
                  </div>
                )
              )}

              <Link
                href="/rfq"
                style={{ marginTop: "10px", display: "block", textAlign: "center", fontSize: "12px", fontWeight: 600, padding: "9px", borderRadius: "4px", border: `1px solid ${BORDER}`, color: MUTED, textDecoration: "none", backgroundColor: "white" }}
              >
                Need custom specs? Post RFQ →
              </Link>
            </div>

            {/* Factory card */}
            {product.factory && (
              <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: MUTED, marginBottom: "12px" }}>Manufacturer</p>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div
                    style={{ width: "40px", height: "40px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px", flexShrink: 0, backgroundColor: GT, color: "#006641" }}
                  >
                    {product.factory.businessName.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "13px", color: TEXT }}>{product.factory.businessName}</p>
                    <p style={{ fontSize: "11px", color: MUTED, marginTop: "2px" }}>{product.factory.lga}, Abia State</p>
                    {badge && (
                      <span style={{ display: "inline-block", fontSize: "10px", fontWeight: 600, padding: "2px 6px", borderRadius: "4px", marginTop: "4px", backgroundColor: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                </div>

                {product.supplier.etrs && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: "12px", color: MUTED }}>ETRS Score</span>
                    <span style={{ fontSize: "18px", fontWeight: 900, color: G }}>{product.supplier.etrs.score.toFixed(0)}</span>
                  </div>
                )}

                <Link
                  href={`/factories/${product.factory.id}`}
                  style={{ marginTop: "12px", display: "block", textAlign: "center", fontSize: "12px", fontWeight: 600, padding: "8px", borderRadius: "4px", border: `1px solid ${BORDER}`, color: TEXT, textDecoration: "none", backgroundColor: "#F5F5F5" }}
                >
                  View Factory Profile →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
