"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Nav } from "@/components/nav";
import Footer from "@/components/footer";
import VerificationRequiredModal from "@/components/verification-required-modal";

interface Quote {
  id: string;
  supplierId: string;
  unitPrice: number;
  totalPrice: number;
  leadTimeDays: number;
  notes?: string;
  validUntil: string;
  status: string;
  createdAt: string;
  supplier: {
    name: string;
    factory: {
      businessName: string;
      verificationLevel: string;
    } | null;
  };
}

interface RFQDetail {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  budgetMin: number;
  budgetMax: number;
  deliveryLocation: string;
  deadline: string;
  customizationRequired: boolean;
  customizationDetails?: string;
  status: string;
  awardedQuoteId?: string;
  createdAt: string;
  buyer: { name: string; etrs: { score: number } | null };
  quotes: Quote[];
}

const G      = "#008751";
const GD     = "#006641";
const GT     = "#E8F5EE";
const BORDER = "#E8E8E8";
const TEXT   = "#333333";
const MUTED  = "#666666";
const LIGHT  = "#999999";

const VERIFICATION_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  UNVERIFIED:        { label: "Unverified",        color: "#6B7280", bg: "#F3F4F6" },
  VERIFIED_BUSINESS: { label: "Verified Business", color: "#1D4ED8", bg: "#DBEAFE" },
  VERIFIED_FACILITY: { label: "Verified Facility", color: "#6D28D9", bg: "#EDE9FE" },
  FACTORY_CERTIFIED: { label: "Factory Certified", color: "#6B4B10", bg: "#FEF3C7" },
  EXPORT_CERTIFIED:  { label: "Export Certified",  color: "#064E30", bg: "#DCFCE7" },
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  OPEN:      { bg: "#D1FAE5", color: "#065F46" },
  REVIEWING: { bg: "#DBEAFE", color: "#1E40AF" },
  AWARDED:   { bg: "#FEF3C7", color: "#92400E" },
  CLOSED:    { bg: "#F3F4F6", color: "#374151" },
  CANCELLED: { bg: "#FEE2E2", color: "#B91C1C" },
};

function QuoteForm({ rfqId, onSubmitted }: { rfqId: string; onSubmitted: () => void }) {
  const [form, setForm] = useState({ unitPrice: "", totalPrice: "", leadTimeDays: "", notes: "", validUntil: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationBlocked, setVerificationBlocked] = useState(false);

  function set(f: string, v: string) { setForm((p) => ({ ...p, [f]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/quote", {
        rfqId,
        unitPrice: Number(form.unitPrice),
        totalPrice: Number(form.totalPrice),
        leadTimeDays: Number(form.leadTimeDays),
        notes: form.notes || undefined,
        validUntil: new Date(form.validUntil).toISOString(),
      });
      onSubmitted();
    } catch (err) {
      if (err instanceof ApiError && err.code === "VERIFICATION_REQUIRED") {
        setVerificationBlocked(true);
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "4px",
    border: `1px solid ${BORDER}`,
    backgroundColor: "white",
    fontSize: "13px",
    outline: "none",
    color: TEXT,
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {verificationBlocked && (
        <VerificationRequiredModal
          action="respond to RFQs"
          onClose={() => setVerificationBlocked(false)}
        />
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: MUTED }}>Unit Price (₦) *</label>
          <input style={inp} type="number" required min={1} value={form.unitPrice} onChange={(e) => set("unitPrice", e.target.value)} placeholder="e.g. 2500" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: MUTED }}>Total Price (₦) *</label>
          <input style={inp} type="number" required min={1} value={form.totalPrice} onChange={(e) => set("totalPrice", e.target.value)} placeholder="e.g. 12,500,000" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: MUTED }}>Lead Time (days) *</label>
          <input style={inp} type="number" required min={1} value={form.leadTimeDays} onChange={(e) => set("leadTimeDays", e.target.value)} placeholder="e.g. 21" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: MUTED }}>Quote Valid Until *</label>
          <input style={inp} type="datetime-local" required value={form.validUntil} onChange={(e) => set("validUntil", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: MUTED }}>Notes (optional)</label>
        <textarea
          style={{ ...inp, minHeight: "80px", resize: "vertical" } as React.CSSProperties}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Mention production capacity, quality standards, materials, past experience..."
        />
      </div>
      {error && (
        <div className="text-xs p-3" style={{ backgroundColor: "#FEE2E2", color: "#B91C1C", borderRadius: "4px" }}>{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 font-bold transition-opacity disabled:opacity-50"
        style={{ backgroundColor: G, color: "white", borderRadius: "4px", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "13px" }}
      >
        {loading ? "Submitting..." : "Submit Quote"}
      </button>
    </form>
  );
}

export default function RFQDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = getUser();
  const [rfq, setRFQ] = useState<RFQDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [awarding, setAwarding] = useState<string | null>(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  function load() {
    api.get<RFQDetail>(`/rfq/${id}`)
      .then(setRFQ)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  async function awardQuote(quoteId: string) {
    setAwarding(quoteId);
    try {
      await api.patch(`/rfq/${id}/award`, { quoteId });
      load();
    } catch {
      /* state stays unchanged */
    } finally {
      setAwarding(null);
    }
  }

  function handleQuoteSubmitted() {
    setQuoteSubmitted(true);
    load();
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Nav active="rfq" />
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

  if (notFound || !rfq) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Nav active="rfq" />
        <div className="flex flex-col items-center justify-center py-20">
          <p style={{ fontWeight: 600, fontSize: "14px", color: TEXT, marginBottom: "8px" }}>RFQ not found</p>
          <Link href="/rfq" style={{ color: G, textDecoration: "none", fontSize: "13px" }}>← Back to RFQ Board</Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === rfq.buyerId;
  const isSupplier = user?.role === "SUPPLIER";
  const hasQuoted = rfq.quotes.some((q) => q.supplierId === user?.id);
  const statusStyle = STATUS_STYLE[rfq.status] ?? STATUS_STYLE.CLOSED;
  const daysLeft = Math.max(0, Math.floor((new Date(rfq.deadline).getTime() - Date.now()) / 86400000));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Nav active="rfq" />

      {/* Page header */}
      <div style={{ backgroundColor: "white", borderBottom: `1px solid ${BORDER}` }}>
        <div className="px-4 md:px-6 py-5">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <Link href="/rfq" style={{ fontSize: "12px", color: MUTED, textDecoration: "none" }}>RFQ Board</Link>
                <span style={{ color: BORDER, fontSize: "12px" }}>/</span>
                <span style={{ fontSize: "12px", color: TEXT }}>{rfq.title}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: TEXT }}>{rfq.title}</h1>
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", ...statusStyle }}>{rfq.status}</span>
                <span style={{ fontSize: "11px", color: MUTED }}>{rfq.category}</span>
              </div>
              <p style={{ fontSize: "12px", color: MUTED, marginTop: "4px" }}>
                Posted by {rfq.buyer.name} · {new Date(rfq.createdAt).toLocaleDateString("en-NG")}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "26px", fontWeight: 900, color: G, lineHeight: 1 }}>{rfq.quotes.length}</div>
              <div style={{ fontSize: "11px", color: LIGHT }}>quotes received</div>
              <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "4px", color: daysLeft <= 2 ? "#B91C1C" : daysLeft <= 7 ? "#92400E" : GD }}>
                {daysLeft} days left
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6">
        <div className="grid md:grid-cols-3 gap-5">

          {/* Main */}
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* Requirements */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "14px", color: TEXT, marginBottom: "12px" }}>Requirements</h2>
              <p style={{ fontSize: "13px", lineHeight: 1.65, color: MUTED, marginBottom: "16px" }}>{rfq.description}</p>
              {rfq.customizationRequired && rfq.customizationDetails && (
                <div style={{ padding: "12px 14px", borderRadius: "4px", marginBottom: "14px", backgroundColor: "#FEF3C7" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, marginBottom: "4px", color: "#92400E", textTransform: "uppercase", letterSpacing: "0.06em" }}>Customization Required</p>
                  <p style={{ fontSize: "12px", color: "#92400E" }}>{rfq.customizationDetails}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Quantity",         value: `${rfq.quantity.toLocaleString()} units` },
                  { label: "Budget Range",      value: `₦${rfq.budgetMin.toLocaleString()} – ₦${rfq.budgetMax.toLocaleString()}` },
                  { label: "Delivery Location", value: rfq.deliveryLocation },
                  { label: "Deadline",          value: new Date(rfq.deadline).toLocaleDateString("en-NG", { dateStyle: "long" }) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: "12px", borderRadius: "4px", backgroundColor: "#F5F5F5" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px", color: LIGHT }}>{label}</p>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: TEXT }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quotes — visible to buyer or submitting supplier */}
            {(isOwner || isSupplier) && rfq.quotes.length > 0 && (
              <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px" }}>
                <h2 style={{ fontWeight: 700, fontSize: "14px", color: TEXT, marginBottom: "14px" }}>
                  {isOwner ? `Quotes Received (${rfq.quotes.length})` : "Your Quote"}
                </h2>
                <div className="flex flex-col gap-3">
                  {rfq.quotes
                    .filter((q) => isOwner || q.supplierId === user?.id)
                    .map((q) => {
                      const isAwarded = q.id === rfq.awardedQuoteId;
                      const vBadge = VERIFICATION_BADGE[q.supplier.factory?.verificationLevel ?? "UNVERIFIED"];
                      return (
                        <div
                          key={q.id}
                          style={{
                            borderRadius: "4px",
                            padding: "16px",
                            border: `1px solid ${isAwarded ? G : BORDER}`,
                            backgroundColor: isAwarded ? GT : "#F5F5F5",
                          }}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span style={{ fontWeight: 600, fontSize: "13px", color: TEXT }}>
                                  {q.supplier.factory?.businessName ?? q.supplier.name}
                                </span>
                                {q.supplier.factory && (
                                  <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: vBadge.bg, color: vBadge.color }}>
                                    {vBadge.label}
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: "11px", marginTop: "3px", color: LIGHT }}>
                                Submitted {new Date(q.createdAt).toLocaleDateString("en-NG")}
                              </p>
                            </div>
                            {isAwarded && (
                              <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "4px", backgroundColor: G, color: "white" }}>
                                AWARDED ✓
                              </span>
                            )}
                            {!isAwarded && q.status !== "PENDING" && (
                              <span style={{ fontSize: "11px", color: MUTED }}>{q.status}</span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            {[
                              { label: "Unit Price", value: `₦${q.unitPrice.toLocaleString()}`, accent: true },
                              { label: "Total",      value: `₦${q.totalPrice.toLocaleString()}`, accent: false },
                              { label: "Lead Time",  value: `${q.leadTimeDays} days`, accent: false },
                            ].map(({ label, value, accent }) => (
                              <div key={label}>
                                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px", color: LIGHT }}>{label}</p>
                                <p style={{ fontWeight: 700, fontSize: "13px", color: accent ? G : TEXT }}>{value}</p>
                              </div>
                            ))}
                          </div>
                          {q.notes && (
                            <p style={{ fontSize: "12px", padding: "10px 12px", borderRadius: "4px", marginBottom: "10px", backgroundColor: "white", color: MUTED }}>
                              {q.notes}
                            </p>
                          )}
                          {isOwner && rfq.status === "OPEN" && q.status === "PENDING" && (
                            <button
                              onClick={() => awardQuote(q.id)}
                              disabled={awarding === q.id}
                              style={{ fontSize: "12px", fontWeight: 700, padding: "7px 16px", borderRadius: "4px", backgroundColor: G, color: "white", border: "none", cursor: awarding === q.id ? "not-allowed" : "pointer", opacity: awarding === q.id ? 0.6 : 1 }}
                            >
                              {awarding === q.id ? "Awarding..." : "Award Contract"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Quote submission form for suppliers */}
            {isSupplier && rfq.status === "OPEN" && !hasQuoted && (
              <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px" }}>
                <h2 style={{ fontWeight: 700, fontSize: "14px", color: TEXT, marginBottom: "4px" }}>Submit Your Quote</h2>
                <p style={{ fontSize: "12px", color: MUTED, marginBottom: "16px" }}>
                  Your quote is visible only to the buyer. Be competitive and specific.
                </p>
                {quoteSubmitted ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ fontSize: "32px", marginBottom: "10px" }}>✅</div>
                    <p style={{ fontWeight: 700, color: GD, fontSize: "14px" }}>Quote submitted successfully!</p>
                    <p style={{ fontSize: "12px", marginTop: "4px", color: MUTED }}>The buyer will review and respond.</p>
                  </div>
                ) : (
                  <QuoteForm rfqId={rfq.id} onSubmitted={handleQuoteSubmitted} />
                )}
              </div>
            )}

            {isSupplier && hasQuoted && !quoteSubmitted && (
              <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>📬</div>
                <p style={{ fontWeight: 600, fontSize: "13px", color: TEXT }}>You have already submitted a quote for this RFQ.</p>
              </div>
            )}

            {!user && (
              <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px", textAlign: "center" }}>
                <p style={{ fontWeight: 600, fontSize: "13px", color: TEXT, marginBottom: "12px" }}>Sign in as a supplier to submit a quote</p>
                <Link
                  href="/auth/login"
                  style={{ display: "inline-block", padding: "9px 20px", fontWeight: 700, borderRadius: "4px", fontSize: "13px", backgroundColor: G, color: "white", textDecoration: "none" }}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Buyer info */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
              <h3 style={{ fontWeight: 700, fontSize: "13px", color: TEXT, marginBottom: "14px" }}>Buyer Info</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <span style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px", color: LIGHT }}>Name</span>
                  <span style={{ fontSize: "12px", color: TEXT }}>{rfq.buyer.name}</span>
                </div>
                {rfq.buyer.etrs && (
                  <div>
                    <span style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px", color: LIGHT }}>ETRS Score</span>
                    <span style={{ fontSize: "16px", fontWeight: 900, color: G }}>{rfq.buyer.etrs.score.toFixed(1)}</span>
                  </div>
                )}
                <div>
                  <span style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px", color: LIGHT }}>Submission Deadline</span>
                  <span style={{ fontSize: "12px", color: TEXT }}>{new Date(rfq.deadline).toLocaleDateString("en-NG", { dateStyle: "full" })}</span>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div style={{ backgroundColor: GT, border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "14px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, marginBottom: "4px", color: GD }}>Tip for Suppliers</p>
              <p style={{ fontSize: "11px", color: GD, lineHeight: 1.5 }}>
                Quotes with detailed notes, competitive lead times, and factory certification win more contracts.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
