"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

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

const VERIFICATION_COLORS: Record<string, string> = {
  UNVERIFIED:         "#9CA3AF",
  VERIFIED_BUSINESS:  "#3B82F6",
  VERIFIED_FACILITY:  "#8B5CF6",
  FACTORY_CERTIFIED:  "#C4781A",
  EXPORT_CERTIFIED:   "#2D5016",
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
      setError(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setLoading(false);
    }
  }

  const inp = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #F0E4CE",
    backgroundColor: "#FAF3E8",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: "rgba(26,15,0,0.5)" }}>Unit Price (₦)</label>
          <input style={inp} type="number" required min={1} value={form.unitPrice} onChange={(e) => set("unitPrice", e.target.value)} placeholder="e.g. 2500" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: "rgba(26,15,0,0.5)" }}>Total Price (₦)</label>
          <input style={inp} type="number" required min={1} value={form.totalPrice} onChange={(e) => set("totalPrice", e.target.value)} placeholder="e.g. 12,500,000" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: "rgba(26,15,0,0.5)" }}>Lead Time (days)</label>
          <input style={inp} type="number" required min={1} value={form.leadTimeDays} onChange={(e) => set("leadTimeDays", e.target.value)} placeholder="e.g. 21" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: "rgba(26,15,0,0.5)" }}>Quote Valid Until</label>
          <input style={inp} type="datetime-local" required value={form.validUntil} onChange={(e) => set("validUntil", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: "rgba(26,15,0,0.5)" }}>Notes (optional)</label>
        <textarea
          style={{ ...inp, minHeight: "80px", resize: "vertical" } as React.CSSProperties}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Mention production capacity, quality standards, materials, past experience..."
        />
      </div>
      {error && (
        <div className="text-sm p-3 rounded-lg" style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}>{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 font-bold rounded-xl transition-opacity disabled:opacity-50"
        style={{ backgroundColor: "#C4781A", color: "white" }}
      >
        {loading ? "Submitting..." : "Submit Quote"}
      </button>
    </form>
  );
}

export default function RFQDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
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
      /* handled silently — user sees state unchanged */
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF3E8" }}>
        <div className="text-lg font-semibold" style={{ color: "#C4781A" }}>Loading...</div>
      </div>
    );
  }

  if (notFound || !rfq) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#FAF3E8" }}>
        <div className="text-5xl">📋</div>
        <p className="font-bold text-xl" style={{ color: "#1A0F00" }}>RFQ not found</p>
        <Link href="/rfq" style={{ color: "#C4781A" }} className="text-sm hover:underline">← Back to RFQ Board</Link>
      </div>
    );
  }

  const isOwner = user?.id === rfq.buyerId;
  const isSupplier = user?.role === "SUPPLIER";
  const hasQuoted = rfq.quotes.some((q) => q.supplierId === user?.id);
  const statusStyle = STATUS_STYLE[rfq.status] ?? STATUS_STYLE.CLOSED;
  const daysLeft = Math.max(0, Math.floor((new Date(rfq.deadline).getTime() - Date.now()) / 86400000));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF3E8" }}>
      <nav style={{ backgroundColor: "#1A0F00" }} className="px-6 md:px-16 py-4 flex items-center justify-between">
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Image src="/logo.png" alt="Ekorafon" width={40} height={40} style={{ objectFit: "contain" }} priority />
        </Link>
        <div className="flex gap-3">
          <Link href="/rfq" className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: "rgba(250,243,232,0.7)" }}>
            ← RFQ Board
          </Link>
          {user && (
            <Link href={`/dashboard/${user.role.toLowerCase()}`} className="text-sm font-semibold px-4 py-2 rounded-lg" style={{ backgroundColor: "#C4781A", color: "white" }}>
              Dashboard
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ backgroundColor: "#1A0F00" }} className="px-6 md:px-16 py-10">
        <div className="max-w-5xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-1 rounded-full" style={statusStyle}>{rfq.status}</span>
              <span className="text-xs" style={{ color: "rgba(250,243,232,0.4)" }}>{rfq.category}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: "#FAF3E8" }}>{rfq.title}</h1>
            <p className="text-sm" style={{ color: "rgba(250,243,232,0.5)" }}>
              Posted by {rfq.buyer.name} · {new Date(rfq.createdAt).toLocaleDateString("en-NG")}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black" style={{ color: "#C4781A" }}>{rfq.quotes.length}</div>
            <div className="text-xs" style={{ color: "rgba(250,243,232,0.5)" }}>quotes received</div>
            <div className="text-sm font-bold mt-1" style={{ color: daysLeft <= 2 ? "#F87171" : daysLeft <= 7 ? "#FBBF24" : "#86EFAC" }}>
              {daysLeft} days left
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* Details */}
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#F0E4CE" }}>
              <h2 className="font-black text-lg mb-4" style={{ color: "#1A0F00" }}>Requirements</h2>
              <p className="leading-relaxed mb-6" style={{ color: "rgba(26,15,0,0.7)" }}>{rfq.description}</p>
              {rfq.customizationRequired && rfq.customizationDetails && (
                <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: "#FEF3C7" }}>
                  <p className="text-xs font-bold mb-1" style={{ color: "#92400E" }}>CUSTOMIZATION REQUIRED</p>
                  <p className="text-sm" style={{ color: "#92400E" }}>{rfq.customizationDetails}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Quantity", value: `${rfq.quantity.toLocaleString()} units` },
                  { label: "Budget Range", value: `₦${rfq.budgetMin.toLocaleString()} – ₦${rfq.budgetMax.toLocaleString()}` },
                  { label: "Delivery Location", value: rfq.deliveryLocation },
                  { label: "Deadline", value: new Date(rfq.deadline).toLocaleDateString("en-NG", { dateStyle: "long" }) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-3" style={{ backgroundColor: "#FAF3E8" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(26,15,0,0.4)" }}>{label}</p>
                    <p className="font-semibold text-sm" style={{ color: "#1A0F00" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quotes section — visible to buyer (owner) or the submitting supplier */}
            {(isOwner || isSupplier) && rfq.quotes.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#F0E4CE" }}>
                <h2 className="font-black text-lg mb-4" style={{ color: "#1A0F00" }}>
                  {isOwner ? `Quotes Received (${rfq.quotes.length})` : "Your Quote"}
                </h2>
                <div className="flex flex-col gap-4">
                  {rfq.quotes
                    .filter((q) => isOwner || q.supplierId === user?.id)
                    .map((q) => {
                      const isAwarded = q.id === rfq.awardedQuoteId;
                      const vColor = VERIFICATION_COLORS[q.supplier.factory?.verificationLevel ?? "UNVERIFIED"];
                      return (
                        <div
                          key={q.id}
                          className="rounded-xl p-5 border"
                          style={{
                            borderColor: isAwarded ? "#C4781A" : "#F0E4CE",
                            backgroundColor: isAwarded ? "#FEF3C7" : "#FAF3E8",
                          }}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold" style={{ color: "#1A0F00" }}>
                                  {q.supplier.factory?.businessName ?? q.supplier.name}
                                </span>
                                {q.supplier.factory && (
                                  <span
                                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                                    style={{ backgroundColor: vColor }}
                                  >
                                    {q.supplier.factory.verificationLevel.replace(/_/g, " ")}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs mt-0.5" style={{ color: "rgba(26,15,0,0.4)" }}>
                                Submitted {new Date(q.createdAt).toLocaleDateString("en-NG")}
                              </p>
                            </div>
                            {isAwarded && (
                              <span className="text-xs font-black px-3 py-1 rounded-full" style={{ backgroundColor: "#C4781A", color: "white" }}>
                                AWARDED ✓
                              </span>
                            )}
                            {!isAwarded && q.status !== "PENDING" && (
                              <span className="text-xs font-bold" style={{ color: "rgba(26,15,0,0.4)" }}>{q.status}</span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(26,15,0,0.4)" }}>Unit Price</p>
                              <p className="font-bold" style={{ color: "#C4781A" }}>₦{q.unitPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(26,15,0,0.4)" }}>Total</p>
                              <p className="font-bold" style={{ color: "#1A0F00" }}>₦{q.totalPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(26,15,0,0.4)" }}>Lead Time</p>
                              <p className="font-bold" style={{ color: "#1A0F00" }}>{q.leadTimeDays} days</p>
                            </div>
                          </div>
                          {q.notes && (
                            <p className="text-sm mb-3 p-3 rounded-lg" style={{ backgroundColor: "white", color: "rgba(26,15,0,0.6)" }}>
                              {q.notes}
                            </p>
                          )}
                          {isOwner && rfq.status === "OPEN" && q.status === "PENDING" && (
                            <button
                              onClick={() => awardQuote(q.id)}
                              disabled={awarding === q.id}
                              className="text-sm font-bold px-4 py-2 rounded-xl transition-opacity disabled:opacity-50"
                              style={{ backgroundColor: "#2D5016", color: "white" }}
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
              <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#F0E4CE" }}>
                <h2 className="font-black text-lg mb-1" style={{ color: "#1A0F00" }}>Submit Your Quote</h2>
                <p className="text-sm mb-4" style={{ color: "rgba(26,15,0,0.5)" }}>
                  Your quote is visible only to the buyer. Be competitive and specific.
                </p>
                {quoteSubmitted ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="font-bold" style={{ color: "#2D5016" }}>Quote submitted successfully!</p>
                    <p className="text-sm mt-1" style={{ color: "rgba(26,15,0,0.5)" }}>The buyer will review and respond.</p>
                  </div>
                ) : (
                  <QuoteForm rfqId={rfq.id} onSubmitted={handleQuoteSubmitted} />
                )}
              </div>
            )}

            {isSupplier && hasQuoted && !quoteSubmitted && (
              <div className="bg-white rounded-2xl p-6 border text-center" style={{ borderColor: "#F0E4CE" }}>
                <div className="text-3xl mb-2">📬</div>
                <p className="font-bold" style={{ color: "#1A0F00" }}>You have already submitted a quote for this RFQ.</p>
              </div>
            )}

            {!user && (
              <div className="bg-white rounded-2xl p-6 border text-center" style={{ borderColor: "#F0E4CE" }}>
                <p className="font-bold mb-3" style={{ color: "#1A0F00" }}>Sign in as a supplier to submit a quote</p>
                <Link
                  href="/auth/login"
                  className="inline-block px-6 py-3 font-bold rounded-xl text-sm"
                  style={{ backgroundColor: "#C4781A", color: "white" }}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#F0E4CE" }}>
              <h3 className="font-bold mb-4" style={{ color: "#1A0F00" }}>Buyer Info</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(26,15,0,0.4)" }}>Name</p>
                  <p style={{ color: "#1A0F00" }}>{rfq.buyer.name}</p>
                </div>
                {rfq.buyer.etrs && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(26,15,0,0.4)" }}>ETRS Score</p>
                    <p className="font-black" style={{ color: "#C4781A" }}>{rfq.buyer.etrs.score.toFixed(1)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(26,15,0,0.4)" }}>Submission Deadline</p>
                  <p style={{ color: "#1A0F00" }}>{new Date(rfq.deadline).toLocaleDateString("en-NG", { dateStyle: "full" })}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4 border" style={{ backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }}>
              <p className="text-xs font-bold mb-1" style={{ color: "#92400E" }}>💡 Tip for Suppliers</p>
              <p className="text-xs" style={{ color: "#92400E" }}>
                Quotes with detailed notes, competitive lead times, and factory certification win more contracts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
