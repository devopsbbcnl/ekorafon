"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Nav } from "@/components/nav";

const CATEGORIES = [
  "Footwear", "Leather Goods", "Garments & Textiles", "Bags & Accessories",
  "Auto Parts", "Electronics Assembly", "Plastics", "Furniture",
  "Packaging", "Chemicals", "Food Processing", "Building Materials", "Other",
];

const G = "#008751";
const BORDER = "#E8E8E8";
const TEXT = "#333333";
const MUTED = "#666666";

const inputStyle = {
  borderColor: BORDER,
  backgroundColor: "white",
  width: "100%",
  padding: "10px 14px",
  borderRadius: "4px",
  border: "1px solid",
  fontSize: "14px",
  outline: "none",
  color: TEXT,
};

export default function NewRFQPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    budgetMin: "",
    budgetMax: "",
    deliveryLocation: "",
    deadline: "",
    customizationRequired: false,
    customizationDetails: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/rfq", {
        ...form,
        quantity: Number(form.quantity),
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        deadline: new Date(form.deadline).toISOString(),
      });
      router.push("/dashboard/buyer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post RFQ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <Nav variant="dashboard" breadcrumb="New RFQ" />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: G }}>RFQ Form</p>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: TEXT }}>Post a Sourcing Request</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Verified suppliers will receive your request and submit competitive quotes</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Product Details */}
          <div className="bg-white rounded border p-6" style={{ borderColor: BORDER }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MUTED }}>Product Details</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>RFQ Title</label>
                <input style={inputStyle} required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. 5,000 pairs of leather sandals" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Category</label>
                <select style={inputStyle} required value={form.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  required
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the product, specifications, materials, quality requirements..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Quantity Required</label>
                <input style={inputStyle} type="number" required min={1} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="e.g. 5000" />
              </div>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="bg-white rounded border p-6" style={{ borderColor: BORDER }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MUTED }}>Budget &amp; Timeline</p>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Min Budget (&#8358;)</label>
                  <input style={inputStyle} type="number" required min={1} value={form.budgetMin} onChange={(e) => set("budgetMin", e.target.value)} placeholder="500,000" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Max Budget (&#8358;)</label>
                  <input style={inputStyle} type="number" required min={1} value={form.budgetMax} onChange={(e) => set("budgetMax", e.target.value)} placeholder="800,000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Delivery Location</label>
                <input style={inputStyle} required value={form.deliveryLocation} onChange={(e) => set("deliveryLocation", e.target.value)} placeholder="e.g. Aba, Abia State" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Submission Deadline</label>
                <input style={inputStyle} type="datetime-local" required value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Customization */}
          <div className="bg-white rounded border p-6" style={{ borderColor: BORDER }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MUTED }}>Customization</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.customizationRequired}
                onChange={(e) => set("customizationRequired", e.target.checked)}
                className="w-4 h-4"
                style={{ accentColor: G }}
              />
              <span className="text-sm font-medium" style={{ color: TEXT }}>This order requires customization</span>
            </label>
            {form.customizationRequired && (
              <div className="mt-4">
                <textarea
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  value={form.customizationDetails}
                  onChange={(e) => set("customizationDetails", e.target.value)}
                  placeholder="Describe customization: colors, branding, packaging, materials..."
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-xs p-3 rounded border" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}>
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Link
              href="/dashboard/buyer"
              className="flex-1 py-3 text-center text-sm font-semibold rounded border transition-opacity hover:opacity-70"
              style={{ borderColor: BORDER, color: TEXT, textDecoration: "none" }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 text-sm font-semibold rounded transition-opacity disabled:opacity-50"
              style={{ backgroundColor: G, color: "white" }}
            >
              {loading ? "Posting..." : "Post RFQ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
