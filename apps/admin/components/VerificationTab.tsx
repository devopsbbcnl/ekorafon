"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyMessage, LevelBadge, Th, Td, Btn, inp, G, GD, BORDER, TEXT, MUTED, LIGHT, fmtDate } from "./shared";

interface VerifRequest {
  id: string; targetLevel: string; status: string;
  message?: string; adminNote?: string; createdAt: string;
  user: { name: string; email: string; factory: { businessName: string; verificationLevel: string } | null };
}

const REQ_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:  { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
  APPROVED: { bg: "#D1FAE5", color: "#065F46", label: "Approved" },
  REJECTED: { bg: "#FEE2E2", color: "#B91C1C", label: "Rejected" },
};

function DecisionModal({ request, onClose, onDone }: { request: VerifRequest; onClose: () => void; onDone: () => void }) {
  const [note, setNote]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const LEVEL_LABEL: Record<string, string> = {
    UNVERIFIED: "Unverified", VERIFIED_BUSINESS: "Verified Business",
    VERIFIED_FACILITY: "Verified Facility", FACTORY_CERTIFIED: "Factory Certified", EXPORT_CERTIFIED: "Export Certified",
  };

  async function decide(approved: boolean) {
    setError(""); setLoading(true);
    try {
      await api.patch(`/verification/${request.id}/decision`, { approved, adminNote: note || undefined });
      onDone(); onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ backgroundColor: "white", borderRadius: "4px", width: "100%", maxWidth: "460px" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: TEXT }}>Review Request</div>
            <div style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>
              {request.user.factory?.businessName ?? request.user.name} → <strong>{LEVEL_LABEL[request.targetLevel]}</strong>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: MUTED }}>×</button>
        </div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ backgroundColor: "#F5F5F5", borderRadius: "4px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              ["Supplier", request.user.name],
              ["Email", request.user.email],
              ["Factory", request.user.factory?.businessName ?? "—"],
              ["Current Level", LEVEL_LABEL[request.user.factory?.verificationLevel ?? "UNVERIFIED"]],
              ["Submitted", fmtDate(request.createdAt)],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
                <span style={{ color: LIGHT, minWidth: "100px", flexShrink: 0 }}>{l}</span>
                <span style={{ color: TEXT, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          {request.message && (
            <p style={{ fontSize: "12px", color: MUTED, fontStyle: "italic", lineHeight: 1.55 }}>&ldquo;{request.message}&rdquo;</p>
          )}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: "6px" }}>
              Admin Note (sent to supplier)
            </label>
            <textarea style={{ ...inp(), minHeight: "72px", resize: "vertical" } as React.CSSProperties} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Explain the decision…" />
          </div>
          {error && <div style={{ fontSize: "12px", padding: "10px", borderRadius: "4px", backgroundColor: "#FEE2E2", color: "#B91C1C" }}>{error}</div>}
          <div style={{ display: "flex", gap: "10px" }}>
            <Btn variant="danger" disabled={loading} onClick={() => decide(false)} style={{ flex: 1 }}>Reject</Btn>
            <Btn variant="primary" disabled={loading} onClick={() => decide(true)} style={{ flex: 1 }}>{loading ? "Saving…" : "Approve"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerificationTab({ onCountChange }: { onCountChange: (n: number) => void }) {
  const [requests, setRequests] = useState<VerifRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<VerifRequest | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get<VerifRequest[]>("/verification/pending")
      .then((r) => { setRequests(r); onCountChange(r.length); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [onCountChange]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {selected && <DecisionModal request={selected} onClose={() => setSelected(null)} onDone={load} />}
      {loading ? <Spinner /> : requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>✅</div>
          <p style={{ fontWeight: 700, color: TEXT, fontSize: "13px" }}>All clear — no pending requests</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Supplier / Factory", "Current Level", "Requesting", "Submitted", "Supplier Note", ""].map((h) => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <Td>
                    <div style={{ fontWeight: 600, color: TEXT }}>{r.user.factory?.businessName ?? r.user.name}</div>
                    <div style={{ fontSize: "11px", color: MUTED }}>{r.user.email}</div>
                  </Td>
                  <Td><LevelBadge level={r.user.factory?.verificationLevel ?? "UNVERIFIED"} /></Td>
                  <Td><LevelBadge level={r.targetLevel} /></Td>
                  <Td style={{ color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(r.createdAt)}</Td>
                  <Td style={{ maxWidth: "200px" }}>
                    {r.message
                      ? <span style={{ fontSize: "12px", color: MUTED, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.message}</span>
                      : <span style={{ color: LIGHT, fontSize: "12px" }}>—</span>}
                  </Td>
                  <Td>
                    <Btn size="sm" variant="outline" onClick={() => setSelected(r)}>Review →</Btn>
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
