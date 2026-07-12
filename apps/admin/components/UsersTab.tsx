"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminUser } from "@/lib/auth";
import { Spinner, EmptyMessage, LevelBadge, Th, Td, Btn, inp, G, GD, GT, BORDER, TEXT, MUTED, LIGHT, fmtDate } from "./shared";

interface UserRow {
  id: string; email: string; name: string; role: string;
  suspended: boolean; permissions: string[]; createdAt: string;
  factory: { businessName: string; verificationLevel: string } | null;
  _count: { buyerOrders: number; supplierOrders: number };
}

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  BUYER:    { bg: "#DBEAFE", color: "#1E40AF" },
  SUPPLIER: { bg: "#D1FAE5", color: "#065F46" },
  ADMIN:    { bg: "#FEF3C7", color: "#92400E" },
};

const ALL_PERMISSIONS = [
  { key: "users",        label: "User Management" },
  { key: "factories",    label: "Factory Management" },
  { key: "verification", label: "Verification Queue" },
  { key: "orders",       label: "Orders & Disputes" },
  { key: "products",     label: "Products & RFQ Oversight" },
  { key: "reviews",      label: "Review Moderation" },
  { key: "escrow",       label: "Escrow Management" },
  { key: "analytics",    label: "Analytics" },
];

// ── User Detail Modal ─────────────────────────────────────────────────────────

function UserDetailModal({
  user, onClose, onToggleSuspend, toggling, onDelete, deleting,
}: {
  user: UserRow;
  onClose: () => void;
  onToggleSuspend: (u: UserRow) => void;
  toggling: boolean;
  onDelete: (u: UserRow) => void;
  deleting: boolean;
}) {
  const rs = ROLE_STYLE[user.role] ?? ROLE_STYLE.BUYER;
  const orders = user.role === "BUYER" ? user._count.buyerOrders : user._count.supplierOrders;
  const isSuperAdmin = user.role === "ADMIN" && (user.permissions ?? []).length === 0;

  function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ width: "160px", flexShrink: 0, fontSize: "12px", color: MUTED, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "13px", color: TEXT, fontWeight: 500, flex: 1 }}>{children}</span>
      </div>
    );
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "flex-end", zIndex: 100 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: "min(460px, 100vw)", height: "100dvh", backgroundColor: "white", display: "flex", flexDirection: "column", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: GT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "20px", fontWeight: 800, color: G }}>{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: TEXT }}>{user.name}</div>
              <div style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>{user.email}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: MUTED, lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", flex: 1 }}>
          {/* Status + role badges */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "4px", backgroundColor: rs.bg, color: rs.color }}>{user.role}</span>
            {user.suspended
              ? <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "4px", backgroundColor: "#FEE2E2", color: "#B91C1C" }}>Suspended</span>
              : <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "4px", backgroundColor: "#D1FAE5", color: "#065F46" }}>Active</span>}
            {user.role === "ADMIN" && (
              isSuperAdmin
                ? <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "4px", backgroundColor: "#FEF3C7", color: "#92400E" }}>Super Admin</span>
                : <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "4px", backgroundColor: "#F3F4F6", color: MUTED }}>Limited Admin</span>
            )}
          </div>

          {/* Detail rows */}
          <Row label="User ID"><code style={{ fontSize: "11px", color: MUTED }}>{user.id}</code></Row>
          <Row label="Email">{user.email}</Row>
          <Row label="Role">{user.role}</Row>
          <Row label="Joined">{fmtDate(user.createdAt)}</Row>
          <Row label="Orders">{orders}</Row>
          {user.factory && (
            <>
              <Row label="Factory">{user.factory.businessName}</Row>
              <Row label="Verification"><LevelBadge level={user.factory.verificationLevel} /></Row>
            </>
          )}
          {user.role === "ADMIN" && (
            <Row label="Permissions">
              {isSuperAdmin
                ? <span style={{ color: G, fontWeight: 700 }}>Full access (super admin)</span>
                : (user.permissions ?? []).length > 0
                  ? <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {(user.permissions ?? []).map((p) => (
                        <span key={p} style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "3px", backgroundColor: GT, color: G, display: "inline-block", width: "fit-content" }}>
                          {ALL_PERMISSIONS.find((x) => x.key === p)?.label ?? p}
                        </span>
                      ))}
                    </div>
                  : <span style={{ color: MUTED }}>None</span>}
            </Row>
          )}
        </div>

        {/* Footer actions */}
        {user.role !== "ADMIN" && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${BORDER}`, flexShrink: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <Btn
              variant={user.suspended ? "outline" : "danger"}
              disabled={toggling || deleting}
              onClick={() => onToggleSuspend(user)}
              style={{ width: "100%" }}
            >
              {toggling ? "Saving…" : user.suspended ? "Activate Account" : "Suspend Account"}
            </Btn>
            <Btn
              variant="danger"
              disabled={toggling || deleting}
              onClick={() => onDelete(user)}
              style={{ width: "100%" }}
            >
              {deleting ? "Deleting…" : "Delete User"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create Admin Modal ────────────────────────────────────────────────────────

function CreateAdminModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ email: "", name: "", password: "", permissions: [] as string[] });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function togglePerm(key: string) {
    setForm((p) => ({
      ...p,
      permissions: p.permissions.includes(key) ? p.permissions.filter((k) => k !== key) : [...p.permissions, key],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await api.post("/admin/users", form); onDone(); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to create admin"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ backgroundColor: "white", borderRadius: "4px", width: "100%", maxWidth: "460px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: "14px", color: TEXT }}>Create Admin User</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: MUTED }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {(["email", "name", "password"] as const).map((field) => (
            <div key={field}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: "5px" }}>{field} *</label>
              <input
                style={inp()}
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                required value={form[field]}
                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                placeholder={field === "email" ? "admin@example.com" : field === "name" ? "Full name" : "Secure password"}
              />
            </div>
          ))}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: "8px" }}>Permissions</label>
            <p style={{ fontSize: "11px", color: MUTED, marginBottom: "8px" }}>Leave all unchecked to create a super admin with full access.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {ALL_PERMISSIONS.map(({ key, label }) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: TEXT }}>
                  <input type="checkbox" checked={form.permissions.includes(key)} onChange={() => togglePerm(key)} style={{ accentColor: G }} />
                  {label}
                </label>
              ))}
            </div>
          </div>
          {error && <div style={{ fontSize: "12px", padding: "10px 12px", borderRadius: "4px", backgroundColor: "#FEE2E2", color: "#B91C1C" }}>{error}</div>}
          <div style={{ display: "flex", gap: "10px" }}>
            <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
            <Btn variant="primary" disabled={loading} style={{ flex: 1 }}>{loading ? "Creating…" : "Create Admin"}</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────

export default function UsersTab({ currentUser }: { currentUser: AdminUser }) {
  const [users, setUsers]           = useState<UserRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [toggling, setToggling]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [selected, setSelected]     = useState<UserRow | null>(null);

  const isSuperAdmin = (currentUser.permissions ?? []).length === 0;

  const load = useCallback(() => {
    setLoading(true);
    api.get<UserRow[]>("/admin/users").then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleSuspend(user: UserRow) {
    setToggling(user.id);
    try { await api.patch(`/admin/users/${user.id}`, { suspended: !user.suspended }); load(); }
    catch { /* noop */ } finally { setToggling(null); }
  }

  async function deleteUser(user: UserRow) {
    if (!window.confirm(`Delete ${user.name} (${user.email})? This cannot be undone.`)) return;
    setDeleting(user.id);
    try { await api.delete(`/admin/users/${user.id}`); load(); }
    catch { /* noop */ } finally { setDeleting(null); }
  }

  const roles = ["ALL", "BUYER", "SUPPLIER", "ADMIN"];
  const shown = roleFilter === "ALL" ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {showCreate  && <CreateAdminModal onClose={() => setShowCreate(false)} onDone={load} />}
      {selected    && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          onToggleSuspend={(u) => { toggleSuspend(u); setSelected(null); }}
          toggling={toggling === selected.id}
          onDelete={(u) => { deleteUser(u); setSelected(null); }}
          deleting={deleting === selected.id}
        />
      )}

      {/* Toolbar */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "6px", flex: 1, flexWrap: "wrap" }}>
          {roles.map((r) => {
            const active = roleFilter === r;
            const count  = r === "ALL" ? users.length : users.filter((u) => u.role === r).length;
            return (
              <button key={r} onClick={() => setRoleFilter(r)} style={{ padding: "5px 12px", borderRadius: "4px", border: `1px solid ${active ? G : BORDER}`, backgroundColor: active ? G : "white", color: active ? "white" : MUTED, fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                {r} ({count})
              </button>
            );
          })}
        </div>
        {isSuperAdmin && (
          <Btn variant="primary" size="sm" onClick={() => setShowCreate(true)}>+ Create Admin</Btn>
        )}
      </div>

      {loading ? <Spinner /> : shown.length === 0 ? <EmptyMessage text="No users found." /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr>
                {["Name / Email", "Role", "Factory", "Orders", "Permissions", "Joined", "Status", ""].map((h) => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => {
                const rs = ROLE_STYLE[u.role] ?? ROLE_STYLE.BUYER;
                const orders = u.role === "BUYER" ? u._count.buyerOrders : u._count.supplierOrders;
                return (
                  <tr
                    key={u.id}
                    onClick={() => setSelected(u)}
                    style={{ backgroundColor: u.suspended ? "#FAFAFA" : "white", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5FAF7")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = u.suspended ? "#FAFAFA" : "white")}
                  >
                    <Td>
                      <div style={{ fontWeight: 600, color: u.suspended ? MUTED : TEXT }}>{u.name}</div>
                      <div style={{ fontSize: "11px", color: LIGHT }}>{u.email}</div>
                    </Td>
                    <Td>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: rs.bg, color: rs.color }}>{u.role}</span>
                    </Td>
                    <Td>
                      {u.factory ? (
                        <div>
                          <div style={{ color: TEXT, fontSize: "12px" }}>{u.factory.businessName}</div>
                          <LevelBadge level={u.factory.verificationLevel} />
                        </div>
                      ) : <span style={{ color: LIGHT }}>—</span>}
                    </Td>
                    <Td style={{ color: MUTED }}>{orders}</Td>
                    <Td>
                      {u.role === "ADMIN" ? (
                        (u.permissions ?? []).length === 0
                          ? <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: "#FEF3C7", color: "#92400E" }}>Super Admin</span>
                          : <div style={{ fontSize: "11px", color: MUTED }}>{(u.permissions ?? []).join(", ")}</div>
                      ) : <span style={{ color: LIGHT }}>—</span>}
                    </Td>
                    <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(u.createdAt)}</Td>
                    <Td>
                      {u.suspended
                        ? <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: "#FEE2E2", color: "#B91C1C" }}>Suspended</span>
                        : <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: "#D1FAE5", color: "#065F46" }}>Active</span>}
                    </Td>
                    <Td onClick={(e) => e.stopPropagation()}>
                      {u.role !== "ADMIN" && (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Btn size="sm" variant={u.suspended ? "outline" : "ghost"} disabled={toggling === u.id || deleting === u.id} onClick={(e) => { e.stopPropagation(); toggleSuspend(u); }}>
                            {toggling === u.id ? "…" : u.suspended ? "Activate" : "Suspend"}
                          </Btn>
                          <Btn size="sm" variant="danger" disabled={toggling === u.id || deleting === u.id} onClick={(e) => { e.stopPropagation(); deleteUser(u); }}>
                            {deleting === u.id ? "…" : "Delete"}
                          </Btn>
                        </div>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
