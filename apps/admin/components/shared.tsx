"use client";

// ── Shared design tokens ──────────────────────────────────────────────────────

export const G      = "#008751";
export const GD     = "#006641";
export const GT     = "#E8F5EE";
export const BORDER = "#E8E8E8";
export const TEXT   = "#333333";
export const MUTED  = "#666666";
export const LIGHT  = "#999999";

// ── Shared helpers ────────────────────────────────────────────────────────────

export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

export const fmt = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const LEVEL_LABEL: Record<string, string> = {
  UNVERIFIED:        "Unverified",
  VERIFIED_BUSINESS: "Verified Business",
  VERIFIED_FACILITY: "Verified Facility",
  FACTORY_CERTIFIED: "Factory Certified",
  EXPORT_CERTIFIED:  "Export Certified",
};

export const LEVEL_BADGE: Record<string, { bg: string; color: string }> = {
  UNVERIFIED:        { bg: "#F3F4F6", color: "#6B7280" },
  VERIFIED_BUSINESS: { bg: "#DBEAFE", color: "#1D4ED8" },
  VERIFIED_FACILITY: { bg: "#EDE9FE", color: "#6D28D9" },
  FACTORY_CERTIFIED: { bg: "#FEF3C7", color: "#6B4B10" },
  EXPORT_CERTIFIED:  { bg: "#DCFCE7", color: "#064E30" },
};

// ── Reusable components ───────────────────────────────────────────────────────

export function LevelBadge({ level }: { level: string }) {
  const s = LEVEL_BADGE[level] ?? LEVEL_BADGE.UNVERIFIED;
  return (
    <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {LEVEL_LABEL[level] ?? level}
    </span>
  );
}

export function StatusBadge({ status, map }: { status: string; map: Record<string, { bg: string; color: string; label: string }> }) {
  const s = map[status] ?? { bg: "#F3F4F6", color: "#374151", label: status };
  return (
    <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

export function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
      <div style={{ display: "flex", gap: "6px" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: G, animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  );
}

export function EmptyMessage({ text }: { text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 24px", color: MUTED, fontSize: "13px" }}>{text}</div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: MUTED, whiteSpace: "nowrap", backgroundColor: "#F8F8F8", borderBottom: `1px solid ${BORDER}` }}>
      {children}
    </th>
  );
}

export function Td({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: (e: React.MouseEvent<HTMLTableCellElement>) => void }) {
  return (
    <td onClick={onClick} style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, fontSize: "13px", verticalAlign: "middle", ...style }}>
      {children}
    </td>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

export function inp(override?: React.CSSProperties): React.CSSProperties {
  return {
    width: "100%", padding: "9px 12px", border: `1px solid ${BORDER}`,
    borderRadius: "4px", fontSize: "13px", outline: "none",
    color: TEXT, backgroundColor: "white", ...override,
  };
}

export function Btn({
  children, onClick, disabled, variant = "primary", size = "md", style,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: "primary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md";
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    border: "none", borderRadius: "4px", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1, transition: "opacity 0.15s", lineHeight: 1,
  };
  const sizes = { sm: { padding: "5px 12px", fontSize: "11px" }, md: { padding: "8px 16px", fontSize: "13px" } };
  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: G,      color: "white" },
    danger:  { backgroundColor: "#EF4444", color: "white" },
    ghost:   { backgroundColor: "transparent", color: MUTED, border: `1px solid ${BORDER}` },
    outline: { backgroundColor: "white", color: G, border: `1px solid ${G}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  );
}
