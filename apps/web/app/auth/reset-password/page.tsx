"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

const G  = "#008751";
const GD = "#006641";

function ResetForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const token   = params.get("token") ?? "";
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [done, setDone]           = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setError(""); setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#B91C1C", fontSize: "14px", marginBottom: "16px" }}>Invalid reset link. Please request a new one.</p>
        <Link href="/auth/forgot-password" style={{ color: G, fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>Request new link →</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
        <p style={{ fontWeight: 800, fontSize: "17px", color: GD, marginBottom: "8px" }}>Password updated!</p>
        <p style={{ fontSize: "13px", color: "#666" }}>Redirecting you to login…</p>
      </div>
    );
  }

  return (
    <>
      <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#111", marginBottom: "6px" }}>Set a new password</h1>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "24px" }}>Choose a strong password for your Ekorafon account.</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {(["password", "confirm"] as const).map((field) => (
          <div key={field}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#666", marginBottom: "6px" }}>
              {field === "password" ? "New Password" : "Confirm Password"}
            </label>
            <input
              type="password" required minLength={8}
              value={field === "password" ? password : confirm}
              onChange={(e) => field === "password" ? setPassword(e.target.value) : setConfirm(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E8E8E8", borderRadius: "6px", fontSize: "14px", outline: "none", color: "#333" }}
            />
          </div>
        ))}
        {error && <p style={{ fontSize: "12px", padding: "10px 12px", borderRadius: "6px", backgroundColor: "#FEE2E2", color: "#B91C1C" }}>{error}</p>}
        <button
          type="submit" disabled={loading}
          style={{ padding: "11px", borderRadius: "6px", border: "none", backgroundColor: loading ? GD : G, color: "white", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
        >
          {loading ? "Saving…" : "Update Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Link href="/"><Image src="/logo.png" alt="Ekorafon" width={52} height={52} style={{ objectFit: "contain" }} /></Link>
        </div>
        <div style={{ backgroundColor: "white", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "36px 32px" }}>
          <Suspense><ResetForm /></Suspense>
        </div>
      </div>
    </div>
  );
}
