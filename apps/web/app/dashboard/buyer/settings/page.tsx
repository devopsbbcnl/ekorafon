"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, updateStoredUser } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import { Nav } from "@/components/nav";
import { BuyerSidebar } from "@/components/buyer-sidebar";
import { BuyerHeaderSlot } from "@/components/buyer-header-slot";

// ── Design tokens — matches the buyer dashboard's palette ──────────────────────

const C = {
  ochre:  "#C4781A",
  forest: "#2D5016",
  cream:  "#FAF3E8",
  bg:     "#F2F3F5",
  white:  "#FFFFFF",
  border: "#E4E4E4",
  text:   "#1A1A1A",
  muted:  "#6B6B6B",
  green:  "#059669",
  red:    "#B91C1C",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "4px",
  border: `1px solid ${C.border}`,
  fontSize: "14px",
  outline: "none",
  color: C.text,
  backgroundColor: "white",
};

function SectionCard({
  subtitle, title, children,
}: {
  subtitle: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="px-6 py-4" style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.border}` }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.ochre }}>{subtitle}</p>
        <p className="font-bold text-sm mt-0.5" style={{ color: C.text }}>{title}</p>
      </div>
      <div className="p-6" style={{ backgroundColor: C.white }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>{label}</label>
      {children}
    </div>
  );
}

// ── Profile section ──────────────────────────────────────────────────────────

function ProfileSection({ user, onUpdated }: { user: { id: string; email: string; name: string; role: string }; onUpdated: (name: string) => void }) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaved(false);
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    try {
      await api.patch("/auth/me", { name: name.trim() });
      updateStoredUser({ name: name.trim() });
      onUpdated(name.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard subtitle="Profile" title="Personal Information">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black shrink-0"
            style={{ backgroundColor: C.cream, color: C.ochre }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: C.text }}>{user.name}</p>
            <span
              className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
            >
              {user.role}
            </span>
          </div>
        </div>

        <Field label="Full Name">
          <input style={inputStyle} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
        </Field>

        <Field label="Email Address">
          <input style={{ ...inputStyle, backgroundColor: "#F5F5F5", color: C.muted, cursor: "not-allowed" }} value={user.email} disabled readOnly />
        </Field>
        <p className="text-xs -mt-2" style={{ color: C.muted }}>Contact support to change the email address on your account.</p>

        {error && (
          <div className="text-xs p-3 rounded border" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: C.red }}>
            {error}
          </div>
        )}
        {saved && (
          <div className="text-xs p-3 rounded border" style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0", color: C.green }}>
            Profile updated successfully.
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={saving || name.trim() === user.name}
            className="px-5 py-2.5 text-sm font-semibold rounded transition-opacity disabled:opacity-50"
            style={{ backgroundColor: C.ochre, color: "white" }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

// ── Security section ─────────────────────────────────────────────────────────

function SecuritySection() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaved(false);
    if (form.newPassword.length < 8) { setError("New password must be at least 8 characters"); return; }
    if (form.newPassword !== form.confirmPassword) { setError("New passwords do not match"); return; }
    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard subtitle="Security" title="Change Password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Current Password">
          <input style={inputStyle} type="password" required autoComplete="current-password" value={form.currentPassword} onChange={(e) => set("currentPassword", e.target.value)} placeholder="••••••••" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="New Password">
            <input style={inputStyle} type="password" required autoComplete="new-password" minLength={8} value={form.newPassword} onChange={(e) => set("newPassword", e.target.value)} placeholder="At least 8 characters" />
          </Field>
          <Field label="Confirm New Password">
            <input style={inputStyle} type="password" required autoComplete="new-password" minLength={8} value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} placeholder="Repeat new password" />
          </Field>
        </div>

        {error && (
          <div className="text-xs p-3 rounded border" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: C.red }}>
            {error}
          </div>
        )}
        {saved && (
          <div className="text-xs p-3 rounded border" style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0", color: C.green }}>
            Password changed successfully.
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold rounded transition-opacity disabled:opacity-50"
            style={{ backgroundColor: C.forest, color: "white" }}
          >
            {saving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

// ── Account section ──────────────────────────────────────────────────────────

function AccountSection({ user }: { user: { role: string } }) {
  return (
    <SectionCard subtitle="Account" title="Account Details">
      <div className="flex items-center justify-between py-2">
        <span className="text-xs" style={{ color: C.muted }}>Account Type</span>
        <span className="text-sm font-bold" style={{ color: C.text }}>{user.role === "BUYER" ? "Buyer" : user.role}</span>
      </div>
    </SectionCard>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BuyerSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(getUser);

  useEffect(() => {
    if (!user || user.role !== "BUYER") router.push("/auth/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <Nav variant="dashboard" minimal headerSlot={<BuyerHeaderSlot name={user.name} />} />

      <div className="flex items-start">
        <BuyerSidebar active="settings" headerOffset="112px" />

        <div className="flex-1 min-w-0 px-6 md:px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            <div className="flex flex-col gap-5">
              <ProfileSection user={user} onUpdated={(name) => setUser((u) => u ? { ...u, name } : u)} />
              <AccountSection user={user} />
            </div>
            <SecuritySection />
          </div>
        </div>
      </div>
    </div>
  );
}
