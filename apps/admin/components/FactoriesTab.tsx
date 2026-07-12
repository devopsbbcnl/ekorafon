"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyMessage, LevelBadge, Th, Td, Btn, G, GD, GT, BORDER, TEXT, MUTED, LIGHT, fmtDate } from "./shared";

interface Factory {
  id: string;
  businessName: string;
  description: string;
  address: string;
  lga: string;
  teamSize: number;
  yearsOfOperation: number;
  productCategories: string[];
  moq: number;
  exportReady: boolean;
  phone: string;
  website?: string;
  verificationLevel: string;
  photos: string[];
  createdAt: string;
  user: {
    name: string; email: string; suspended: boolean;
    etrs: { score: number; ordersCompleted: number } | null;
  };
}

const LEVELS = ["UNVERIFIED", "VERIFIED_BUSINESS", "VERIFIED_FACILITY", "FACTORY_CERTIFIED", "EXPORT_CERTIFIED"];
const LEVEL_LABEL: Record<string, string> = {
  UNVERIFIED: "Unverified", VERIFIED_BUSINESS: "Verified Business",
  VERIFIED_FACILITY: "Verified Facility", FACTORY_CERTIFIED: "Factory Certified", EXPORT_CERTIFIED: "Export Certified",
};

// ── Factory Detail Panel ──────────────────────────────────────────────────────

function FactoryDetailModal({
  factory, onClose, onSetLevel, updating,
}: {
  factory: Factory;
  onClose: () => void;
  onSetLevel: (level: string) => void;
  updating: boolean;
}) {
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
      <div style={{ width: "min(500px, 100vw)", height: "100dvh", backgroundColor: "white", display: "flex", flexDirection: "column", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "17px", fontWeight: 800, color: TEXT }}>{factory.businessName}</div>
              <div style={{ fontSize: "12px", color: MUTED, marginTop: "3px" }}>{factory.lga}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: MUTED, lineHeight: 1 }}>×</button>
          </div>
          <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <LevelBadge level={factory.verificationLevel} />
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "4px", backgroundColor: factory.exportReady ? "#DCFCE7" : "#F3F4F6", color: factory.exportReady ? "#064E30" : "#6B7280" }}>
              {factory.exportReady ? "Export Ready" : "Not Export Ready"}
            </span>
            {factory.user.suspended && (
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "4px", backgroundColor: "#FEE2E2", color: "#B91C1C" }}>Owner Suspended</span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", flex: 1 }}>

          {/* Owner */}
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: "8px" }}>Owner</div>
          <div style={{ backgroundColor: GT, borderRadius: "6px", padding: "12px 14px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: G, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "white" }}>{factory.user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: TEXT }}>{factory.user.name}</div>
              <div style={{ fontSize: "11px", color: MUTED }}>{factory.user.email}</div>
            </div>
            {factory.user.etrs && (
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ fontSize: "18px", fontWeight: 900, color: G }}>{factory.user.etrs.score.toFixed(1)}</div>
                <div style={{ fontSize: "10px", color: MUTED }}>ETRS · {factory.user.etrs.ordersCompleted} orders</div>
              </div>
            )}
          </div>

          {/* Factory info */}
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: "4px" }}>Factory Details</div>
          <Row label="Business Name">{factory.businessName}</Row>
          <Row label="Address">{factory.address}</Row>
          <Row label="LGA">{factory.lga}</Row>
          <Row label="Phone">{factory.phone}</Row>
          {factory.website && <Row label="Website"><a href={factory.website} target="_blank" rel="noreferrer" style={{ color: G }}>{factory.website}</a></Row>}
          <Row label="Team Size">{factory.teamSize} people</Row>
          <Row label="Years Operating">{factory.yearsOfOperation} year{factory.yearsOfOperation !== 1 ? "s" : ""}</Row>
          <Row label="Min. Order (MOQ)">{factory.moq.toLocaleString()} units</Row>
          <Row label="Registered">{fmtDate(factory.createdAt)}</Row>

          {factory.description && (
            <div style={{ marginTop: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: "6px" }}>Description</div>
              <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6 }}>{factory.description}</p>
            </div>
          )}

          {factory.productCategories.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: "8px" }}>Product Categories</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {factory.productCategories.map((c) => (
                  <span key={c} style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "4px", backgroundColor: GT, color: GD }}>{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — set verification level */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: "8px" }}>Set Verification Level</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <select
              disabled={updating}
              defaultValue={factory.verificationLevel}
              onChange={(e) => onSetLevel(e.target.value)}
              style={{ flex: 1, padding: "8px 10px", borderRadius: "4px", border: `1px solid ${BORDER}`, fontSize: "13px", color: TEXT, backgroundColor: "white", cursor: "pointer", outline: "none" }}
            >
              {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
            </select>
            {updating && <div style={{ fontSize: "12px", color: MUTED, alignSelf: "center" }}>Saving…</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────

export default function FactoriesTab() {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("ALL");
  const [updating, setUpdating]   = useState<string | null>(null);
  const [selected, setSelected]   = useState<Factory | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get<Factory[]>("/admin/factories").then(setFactories).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function setVerification(factory: Factory, level: string) {
    setUpdating(factory.id);
    try {
      await api.patch(`/admin/factories/${factory.id}/verification`, { verificationLevel: level });
      // update in-place so selected modal reflects the change immediately
      setFactories((prev) => prev.map((f) => f.id === factory.id ? { ...f, verificationLevel: level } : f));
      setSelected((prev) => prev && prev.id === factory.id ? { ...prev, verificationLevel: level } : prev);
    } catch { /* noop */ } finally {
      setUpdating(null);
    }
  }

  const counts = LEVELS.reduce<Record<string, number>>((a, l) => { a[l] = factories.filter((f) => f.verificationLevel === l).length; return a; }, {});
  const shown  = filter === "ALL" ? factories : factories.filter((f) => f.verificationLevel === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {selected && (
        <FactoryDetailModal
          factory={selected}
          onClose={() => setSelected(null)}
          onSetLevel={(level) => setVerification(selected, level)}
          updating={updating === selected.id}
        />
      )}

      {/* Filter bar */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {["ALL", ...LEVELS].map((l) => {
          const active = filter === l;
          const count  = l === "ALL" ? factories.length : counts[l] ?? 0;
          return (
            <button key={l} onClick={() => setFilter(l)} style={{ padding: "5px 12px", borderRadius: "4px", border: `1px solid ${active ? G : BORDER}`, backgroundColor: active ? G : "white", color: active ? "white" : MUTED, fontSize: "12px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              {l === "ALL" ? `All (${count})` : `${LEVEL_LABEL[l]} (${count})`}
            </button>
          );
        })}
      </div>

      {loading ? <Spinner /> : shown.length === 0 ? <EmptyMessage text="No factories at this level." /> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Business / Owner", "Location", "Verification", "ETRS", "Orders", "Export", "Joined", "Set Level"].map((h) => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {shown.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => setSelected(f)}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5FAF7")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
                  <Td>
                    <div style={{ fontWeight: 600, color: TEXT }}>{f.businessName}</div>
                    <div style={{ fontSize: "11px", color: MUTED }}>{f.user.name} · {f.user.email}</div>
                    {f.user.suspended && <div style={{ fontSize: "10px", color: "#B91C1C", fontWeight: 700, marginTop: "2px" }}>⚠ Account Suspended</div>}
                  </Td>
                  <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{f.lga}</Td>
                  <Td><LevelBadge level={f.verificationLevel} /></Td>
                  <Td style={{ fontWeight: 700, color: G }}>{f.user.etrs ? f.user.etrs.score.toFixed(1) : <span style={{ color: LIGHT }}>—</span>}</Td>
                  <Td style={{ color: MUTED }}>{f.user.etrs?.ordersCompleted ?? 0}</Td>
                  <Td>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: f.exportReady ? "#DCFCE7" : "#F3F4F6", color: f.exportReady ? "#064E30" : "#6B7280" }}>
                      {f.exportReady ? "Yes" : "No"}
                    </span>
                  </Td>
                  <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(f.createdAt)}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <select
                      disabled={updating === f.id}
                      value={f.verificationLevel}
                      onChange={(e) => { e.stopPropagation(); setVerification(f, e.target.value); }}
                      style={{ padding: "5px 8px", borderRadius: "4px", border: `1px solid ${BORDER}`, fontSize: "12px", cursor: "pointer", backgroundColor: "white", color: TEXT, outline: "none" }}
                    >
                      {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
                    </select>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
