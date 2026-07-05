"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import { saveAuth, getUser, type AdminUser } from "@/lib/auth";

const G      = "#008751";
const GD     = "#006641";
const BORDER = "#E8E8E8";
const TEXT   = "#333333";
const MUTED  = "#666666";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (getUser()) router.replace("/dashboard");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: AdminUser }>("/auth/login", { email, password });
      if (res.user.role !== "ADMIN") {
        setError("Access denied — admin accounts only.");
        return;
      }
      saveAuth(res.token, res.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${BORDER}`,
    borderRadius: "4px",
    fontSize: "14px",
    outline: "none",
    color: TEXT,
    backgroundColor: "white",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
            <Image src="/logo-full.png" alt="Ekorafon" width={160} height={48} style={{ objectFit: "contain" }} priority />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#E8F5EE", borderRadius: "4px", padding: "4px 12px", marginBottom: "10px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: G }} />
            <span style={{ fontSize: "10px", fontWeight: 700, color: GD, letterSpacing: "0.1em" }}>ADMIN PANEL</span>
          </div>
          <div style={{ fontSize: "13px", color: MUTED }}>Sign in with your admin account</div>
        </div>

        <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "28px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px", color: MUTED }}>
                Email
              </label>
              <input
                style={inp}
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ekorafon.com"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px", color: MUTED }}>
                Password
              </label>
              <input
                style={inp}
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{ fontSize: "12px", padding: "10px 12px", borderRadius: "4px", backgroundColor: "#FEE2E2", color: "#B91C1C" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: loading ? GD : G,
                color: "white",
                fontSize: "14px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.75 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: MUTED, marginTop: "20px" }}>
          Ekorafon · Internal use only
        </p>
      </div>
    </div>
  );
}
