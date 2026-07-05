"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

const G  = "#008751";
const GD = "#006641";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await api.post("/auth/forgot-password", { email }); }
    catch { /* always show success */ }
    finally { setSent(true); setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Link href="/"><Image src="/logo.png" alt="Ekorafon" width={52} height={52} style={{ objectFit: "contain" }} /></Link>
        </div>

        <div style={{ backgroundColor: "white", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "36px 32px" }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
              <p style={{ fontWeight: 800, fontSize: "17px", color: GD, marginBottom: "10px" }}>Check your inbox</p>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
                If an account with <strong>{email}</strong> exists, we've sent a password reset link. It expires in 1 hour.
              </p>
              <Link href="/auth/login" style={{ display: "inline-block", marginTop: "20px", fontSize: "13px", color: G, fontWeight: 600, textDecoration: "none" }}>
                Back to login →
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#111", marginBottom: "6px" }}>Forgot your password?</h1>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "24px" }}>Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#666", marginBottom: "6px" }}>Email</label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    autoFocus placeholder="you@example.com"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #E8E8E8", borderRadius: "6px", fontSize: "14px", outline: "none", color: "#333" }}
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  style={{ padding: "11px", borderRadius: "6px", border: "none", backgroundColor: loading ? GD : G, color: "white", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
              <p style={{ textAlign: "center", marginTop: "18px", fontSize: "12px", color: "#999" }}>
                Remember it? <Link href="/auth/login" style={{ color: G, fontWeight: 600, textDecoration: "none" }}>Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
