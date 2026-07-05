"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

const G      = "#008751";
const BORDER = "#E8E8E8";
const TEXT   = "#333333";
const MUTED  = "#666666";

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          style={{
            background: "none", border: "none",
            cursor: onChange ? "pointer" : "default",
            fontSize: "28px", color: star <= value ? G : "#D1D5DB",
            padding: "0 2px",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function RatingModal({ orderId, supplierId, onClose, onSubmitted }: {
  orderId: string;
  supplierId: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  void supplierId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating"); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/review", { orderId, rating, comment: comment || undefined });
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div style={{ backgroundColor: "white", borderRadius: "4px", width: "100%", maxWidth: "440px", border: `1px solid ${BORDER}` }}>
        <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
          <p style={{ fontWeight: 700, fontSize: "15px", color: TEXT }}>Rate This Order</p>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: MUTED }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: MUTED, marginBottom: "10px" }}>Overall Rating</p>
            <StarRating value={rating} onChange={setRating} />
            <p style={{ fontSize: "11px", marginTop: "4px", color: MUTED }}>
              {rating === 0 ? "Select a rating" : ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </p>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: MUTED, marginBottom: "6px" }}>
              Comments (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder="Describe your experience — quality, communication, packaging, delivery speed..."
              style={{
                width: "100%", padding: "10px 14px",
                borderRadius: "4px", border: `1px solid ${BORDER}`,
                fontSize: "13px", outline: "none",
                minHeight: "100px", resize: "vertical", color: TEXT,
              }}
            />
          </div>
          {error && (
            <div style={{ fontSize: "12px", padding: "10px 14px", borderRadius: "4px", backgroundColor: "#FEE2E2", color: "#B91C1C" }}>{error}</div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "9px", borderRadius: "4px", fontWeight: 600, fontSize: "13px", border: `1px solid ${BORDER}`, color: MUTED, backgroundColor: "white", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: "9px", borderRadius: "4px", fontWeight: 700, fontSize: "13px", backgroundColor: G, color: "white", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}
            >
              {loading ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type OrderStatus = "PENDING" | "CONFIRMED" | "IN_PRODUCTION" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "DISPUTED";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: { name: string; unit: string; images: string[]; category: string };
}

interface Order {
  id: string;
  status: OrderStatus;
  source: "DIRECT" | "RFQ";
  totalAmount: number;
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  buyer: { name: string; email: string };
  supplier: {
    name: string;
    factory: {
      businessName: string;
      phone: string;
      address: string;
      verificationLevel: string;
    } | null;
  };
  items: OrderItem[];
}

const ORDER_STATUS: Record<OrderStatus, { bg: string; color: string; label: string; step: number }> = {
  PENDING:       { bg: "#FEF3C7", color: "#92400E", label: "Pending",       step: 0 },
  CONFIRMED:     { bg: "#DBEAFE", color: "#1E40AF", label: "Confirmed",     step: 1 },
  IN_PRODUCTION: { bg: "#EDE9FE", color: "#5B21B6", label: "In Production", step: 2 },
  SHIPPED:       { bg: "#CFFAFE", color: "#0E7490", label: "Shipped",       step: 3 },
  DELIVERED:     { bg: "#D1FAE5", color: "#065F46", label: "Delivered",     step: 4 },
  CANCELLED:     { bg: "#FEE2E2", color: "#B91C1C", label: "Cancelled",     step: -1 },
  DISPUTED:      { bg: "#FEE2E2", color: "#991B1B", label: "Disputed",      step: -1 },
};

const LIFECYCLE = [
  { key: "PENDING",       label: "Order Placed"  },
  { key: "CONFIRMED",     label: "Confirmed"     },
  { key: "IN_PRODUCTION", label: "In Production" },
  { key: "SHIPPED",       label: "Shipped"       },
  { key: "DELIVERED",     label: "Delivered"     },
];

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = getUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [review, setReview] = useState<Review | null | undefined>(undefined);
  const [showRating, setShowRating] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  function load() {
    api.get<Order>(`/order/${id}`)
      .then((o) => {
        setOrder(o);
        if (o.status === "DELIVERED") {
          api.get<Review | null>(`/review/order/${o.id}`).then(setReview).catch(() => setReview(null));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function initPayment() {
    if (!order) return;
    setPayLoading(true);
    try {
      const { paymentUrl } = await api.post<{ paymentUrl: string }>(`/payment/initialize/${order.id}`, {});
      window.location.href = paymentUrl;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Payment initialization failed");
    } finally {
      setPayLoading(false);
    }
  }

  async function buyerAction(action: "DELIVERED" | "DISPUTED") {
    setActing(true);
    setActionError("");
    try {
      await api.patch(`/order/${id}/buyer-action`, { action });
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Nav variant="dashboard" breadcrumb="Order Details" />
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

  if (notFound || !order) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Nav variant="dashboard" breadcrumb="Order Details" />
        <div className="flex flex-col items-center justify-center py-20">
          <p style={{ fontWeight: 600, fontSize: "14px", color: TEXT, marginBottom: "8px" }}>Order not found</p>
          <Link href="/dashboard/buyer" style={{ color: G, textDecoration: "none", fontSize: "13px" }}>← Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const st = ORDER_STATUS[order.status];
  const currentStep = st.step;
  const supplierName = order.supplier.factory?.businessName ?? order.supplier.name;
  const canConfirmDelivery = order.status === "SHIPPED";
  const isTerminal = ["DELIVERED", "CANCELLED", "DISPUTED"].includes(order.status);
  const canPay = order.status === "PENDING";
  const isDelivered = order.status === "DELIVERED";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Nav variant="dashboard" breadcrumb="Order Details" />

      {showRating && order && (
        <RatingModal
          orderId={order.id}
          supplierId={order.supplier.name}
          onClose={() => setShowRating(false)}
          onSubmitted={() => api.get<Review | null>(`/review/order/${order.id}`).then(setReview).catch(() => {})}
        />
      )}

      <div className="px-4 md:px-6 py-6">

        {/* Back link */}
        <Link
          href="/dashboard/buyer"
          style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600, marginBottom: "16px", color: MUTED, textDecoration: "none" }}
        >
          ← Back to Dashboard
        </Link>

        {/* Order header */}
        <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: MUTED, marginBottom: "4px" }}>Purchase Order</p>
              <h1 style={{ fontSize: "20px", fontWeight: 700, color: TEXT }}>{supplierName}</h1>
              <p style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>
                Placed {fmtDate(order.createdAt)} · {order.source === "DIRECT" ? "Direct Purchase" : "Via RFQ"}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "4px", backgroundColor: st.bg, color: st.color }}>
                {st.label.toUpperCase()}
              </span>
              <p style={{ fontSize: "22px", fontWeight: 900, color: TEXT, marginTop: "8px" }}>{fmt(order.totalAmount)}</p>
            </div>
          </div>

          {/* Lifecycle tracker */}
          {!isTerminal && (
            <div style={{ display: "flex", alignItems: "center", overflowX: "auto" }}>
              {LIFECYCLE.map((step, i) => {
                const done   = currentStep > i;
                const active = currentStep === i;
                return (
                  <div key={step.key} style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 12px" }}>
                      <div
                        style={{
                          width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, marginBottom: "4px",
                          backgroundColor: done || active ? G : BORDER,
                          color: done || active ? "white" : MUTED,
                        }}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: active ? 700 : 500, whiteSpace: "nowrap", color: active ? G : done ? TEXT : MUTED }}>
                        {step.label}
                      </span>
                    </div>
                    {i < LIFECYCLE.length - 1 && (
                      <div style={{ flex: 1, height: "2px", minWidth: "16px", backgroundColor: done ? G : BORDER }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {isTerminal && order.status !== "DELIVERED" && (
            <div style={{ marginTop: "16px", padding: "12px 16px", borderRadius: "4px", backgroundColor: st.bg }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: st.color }}>
                This order has been {st.label.toLowerCase()}.
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">

          {/* Left: items + delivery */}
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* Line items */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}` }}>
                <p style={{ fontWeight: 700, fontSize: "13px", color: TEXT }}>Order Items ({order.items.length})</p>
              </div>
              <div>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", borderBottom: `1px solid ${BORDER}` }}
                  >
                    <div
                      style={{ width: "44px", height: "44px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 800, fontSize: "10px", backgroundColor: "#E8F5EE", color: "#006641" }}
                    >
                      {item.product.category.slice(0, 3).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: "13px", color: TEXT }}>{item.product.name}</p>
                      <p style={{ fontSize: "11px", marginTop: "2px", color: MUTED }}>
                        {item.product.category} · {item.quantity.toLocaleString()} {item.product.unit} × {fmt(item.unitPrice)}
                      </p>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: "13px", flexShrink: 0, color: TEXT }}>{fmt(item.total)}</p>
                  </div>
                ))}
              </div>
              <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F5F5F5" }}>
                <span style={{ fontWeight: 600, fontSize: "13px", color: TEXT }}>Order Total</span>
                <span style={{ fontWeight: 900, fontSize: "18px", color: G }}>{fmt(order.totalAmount)}</span>
              </div>
            </div>

            {/* Delivery info */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
              <p style={{ fontWeight: 700, fontSize: "13px", color: TEXT, marginBottom: "12px" }}>Delivery Information</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: MUTED, marginBottom: "4px" }}>Delivery Address</p>
                  <p style={{ fontSize: "13px", color: TEXT }}>{order.deliveryAddress}</p>
                </div>
                {order.notes && (
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: MUTED, marginBottom: "4px" }}>Order Notes</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: MUTED }}>&ldquo;{order.notes}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pay Now */}
            {canPay && (
              <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
                <p style={{ fontWeight: 700, fontSize: "13px", color: TEXT, marginBottom: "4px" }}>Payment Required</p>
                <p style={{ fontSize: "12px", color: MUTED, marginBottom: "14px" }}>
                  Complete your Paystack payment to activate this order. Funds are held in escrow until you confirm delivery.
                </p>
                {actionError && (
                  <div style={{ marginBottom: "10px", fontSize: "12px", padding: "10px 14px", borderRadius: "4px", backgroundColor: "#FEE2E2", color: "#B91C1C" }}>{actionError}</div>
                )}
                <button
                  onClick={initPayment}
                  disabled={payLoading}
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", fontWeight: 700, fontSize: "13px", backgroundColor: G, color: "white", border: "none", cursor: payLoading ? "not-allowed" : "pointer", opacity: payLoading ? 0.5 : 1 }}
                >
                  {payLoading ? "Redirecting to Paystack…" : `Pay ${fmt(order.totalAmount)} via Paystack →`}
                </button>
              </div>
            )}

            {/* Confirm delivery or dispute */}
            {canConfirmDelivery && (
              <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
                <p style={{ fontWeight: 700, fontSize: "13px", color: TEXT, marginBottom: "4px" }}>Your Order Has Been Shipped</p>
                <p style={{ fontSize: "12px", color: MUTED, marginBottom: "14px" }}>
                  Once you receive and inspect the goods, confirm delivery to release payment to the supplier. If there&apos;s an issue, raise a dispute and funds will remain in escrow.
                </p>
                {actionError && (
                  <div style={{ marginBottom: "10px", fontSize: "12px", padding: "10px 14px", borderRadius: "4px", backgroundColor: "#FEE2E2", color: "#B91C1C" }}>{actionError}</div>
                )}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => buyerAction("DELIVERED")}
                    disabled={acting}
                    style={{ flex: 1, padding: "9px", borderRadius: "4px", fontWeight: 700, fontSize: "13px", backgroundColor: G, color: "white", border: "none", cursor: acting ? "not-allowed" : "pointer", opacity: acting ? 0.5 : 1 }}
                  >
                    {acting ? "Processing…" : "Confirm Delivery"}
                  </button>
                  <button
                    onClick={() => buyerAction("DISPUTED")}
                    disabled={acting}
                    style={{ flex: 1, padding: "9px", borderRadius: "4px", fontWeight: 600, fontSize: "13px", border: `1px solid #B91C1C`, color: "#B91C1C", backgroundColor: "white", cursor: "pointer" }}
                  >
                    Raise Dispute
                  </button>
                </div>
              </div>
            )}

            {/* Rating section */}
            {isDelivered && (
              review === null ? (
                <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
                  <p style={{ fontWeight: 700, fontSize: "13px", color: TEXT, marginBottom: "4px" }}>How Was Your Order?</p>
                  <p style={{ fontSize: "12px", color: MUTED, marginBottom: "14px" }}>
                    Rate this supplier to help the community and update their ETRS score.
                  </p>
                  <button
                    onClick={() => setShowRating(true)}
                    style={{ width: "100%", padding: "9px", borderRadius: "4px", fontWeight: 700, fontSize: "13px", backgroundColor: G, color: "white", border: "none", cursor: "pointer" }}
                  >
                    Leave a Review
                  </button>
                </div>
              ) : review ? (
                <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
                  <p style={{ fontWeight: 700, fontSize: "13px", color: TEXT, marginBottom: "8px" }}>Review Submitted</p>
                  <StarRating value={review.rating} />
                  {review.comment && (
                    <p style={{ fontSize: "12px", marginTop: "8px", fontStyle: "italic", color: MUTED }}>&ldquo;{review.comment}&rdquo;</p>
                  )}
                </div>
              ) : null
            )}
          </div>

          {/* Right: supplier info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: MUTED, marginBottom: "12px" }}>Supplier</p>
              <div
                style={{ width: "44px", height: "44px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "14px", marginBottom: "10px", backgroundColor: "#E8F5EE", color: "#006641" }}
              >
                {supplierName.slice(0, 2).toUpperCase()}
              </div>
              <p style={{ fontWeight: 700, fontSize: "13px", color: TEXT }}>{supplierName}</p>
              {order.supplier.factory && (
                <>
                  <p style={{ fontSize: "11px", marginTop: "2px", marginBottom: "8px", color: MUTED }}>{order.supplier.factory.address}</p>
                  {order.supplier.factory.phone && (
                    <p style={{ fontSize: "11px", color: MUTED }}>{order.supplier.factory.phone}</p>
                  )}
                </>
              )}
            </div>

            {/* Order metadata */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: MUTED, marginBottom: "12px" }}>Order Info</p>
              {[
                { label: "Order Source",  value: order.source === "DIRECT" ? "Direct Purchase" : "Via RFQ" },
                { label: "Placed",        value: new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) },
                { label: "Last Updated",  value: new Date(order.updatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: "12px", color: MUTED }}>{s.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: TEXT }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Escrow note */}
            <div style={{ borderRadius: "4px", padding: "14px", backgroundColor: "#F5F5F5", border: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: G, marginBottom: "4px" }}>Escrow Protected</p>
              <p style={{ fontSize: "12px", color: MUTED, lineHeight: 1.5 }}>
                Your payment is held securely in escrow and only released to the supplier once you confirm satisfactory delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
