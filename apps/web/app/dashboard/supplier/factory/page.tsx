"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Nav } from "@/components/nav";

const PRODUCT_CATEGORIES = [
  "Footwear", "Leather Goods", "Garments & Textiles", "Bags & Accessories",
  "Auto Parts", "Electronics Assembly", "Plastics", "Furniture",
  "Packaging", "Chemicals", "Food Processing", "Building Materials",
];

const LGAS = [
  "Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano",
  "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obingwa", "Ohafia",
  "Osisioma Ngwa", "Ugwunagbo", "Ukwa East", "Ukwa West",
  "Umuahia North", "Umuahia South", "Umu Nneochi",
];

const G = "#008751";
const GT = "#E8F5EE";
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

export default function FactoryProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    description: "",
    address: "",
    lga: "",
    teamSize: "",
    yearsOfOperation: "",
    productCategories: [] as string[],
    moq: "",
    exportReady: false,
    phone: "",
    website: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleCategory(cat: string) {
    setForm((f) => ({
      ...f,
      productCategories: f.productCategories.includes(cat)
        ? f.productCategories.filter((c) => c !== cat)
        : [...f.productCategories, cat],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/factory", {
        ...form,
        teamSize: Number(form.teamSize),
        yearsOfOperation: Number(form.yearsOfOperation),
        moq: Number(form.moq),
      });
      router.push("/dashboard/supplier");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save factory profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <Nav variant="dashboard" breadcrumb="Factory Profile" />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: G }}>Profile Setup</p>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: TEXT }}>Create Factory Profile</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Let buyers discover your manufacturing capabilities on Ekorafon</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Business Information */}
          <div className="bg-white rounded border p-6" style={{ borderColor: BORDER }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MUTED }}>Business Information</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Business Name</label>
                <input style={inputStyle} required value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="e.g. Obi Footwear Industries" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Business Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  required
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="What you manufacture, your speciality, quality standards, certifications..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Phone Number</label>
                <input style={inputStyle} required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+234 80X XXX XXXX" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>
                  Website <span style={{ fontWeight: 400 }}>(optional)</span>
                </label>
                <input style={inputStyle} type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://yourbusiness.com" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded border p-6" style={{ borderColor: BORDER }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MUTED }}>Location</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Factory Address</label>
                <input style={inputStyle} required value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street address" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Local Government Area</label>
                <select style={inputStyle} required value={form.lga} onChange={(e) => set("lga", e.target.value)}>
                  <option value="">Select LGA</option>
                  {LGAS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Production Capacity */}
          <div className="bg-white rounded border p-6" style={{ borderColor: BORDER }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MUTED }}>Production Capacity</p>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Team Size</label>
                  <input style={inputStyle} type="number" required min={1} value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)} placeholder="e.g. 25" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Years in Operation</label>
                  <input style={inputStyle} type="number" required min={0} value={form.yearsOfOperation} onChange={(e) => set("yearsOfOperation", e.target.value)} placeholder="e.g. 8" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: MUTED }}>Minimum Order Quantity (MOQ)</label>
                <input style={inputStyle} type="number" required min={1} value={form.moq} onChange={(e) => set("moq", e.target.value)} placeholder="e.g. 500 units" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.exportReady}
                  onChange={(e) => set("exportReady", e.target.checked)}
                  className="w-4 h-4"
                  style={{ accentColor: G }}
                />
                <span className="text-sm font-medium" style={{ color: TEXT }}>Export ready — can fulfill international orders</span>
              </label>
            </div>
          </div>

          {/* Product Categories */}
          <div className="bg-white rounded border p-6" style={{ borderColor: BORDER }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: MUTED }}>Product Categories</p>
            <p className="text-xs mb-4" style={{ color: MUTED }}>Select all categories your factory produces</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map((cat) => {
                const selected = form.productCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="px-3 py-2 rounded text-xs font-semibold border transition-all"
                    style={{
                      backgroundColor: selected ? G : "white",
                      color: selected ? "white" : TEXT,
                      borderColor: selected ? G : BORDER,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            {form.productCategories.length === 0 && (
              <p className="text-xs mt-3" style={{ color: MUTED }}>Select at least one category to continue</p>
            )}
          </div>

          {error && (
            <div className="text-xs p-3 rounded border" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}>
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Link
              href="/dashboard/supplier"
              className="flex-1 py-3 text-center text-sm font-semibold rounded border transition-opacity hover:opacity-70"
              style={{ borderColor: BORDER, color: TEXT, textDecoration: "none" }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || form.productCategories.length === 0}
              className="flex-1 py-3 text-sm font-semibold rounded transition-opacity disabled:opacity-50"
              style={{ backgroundColor: G, color: "white" }}
            >
              {loading ? "Saving..." : "Save Factory Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
