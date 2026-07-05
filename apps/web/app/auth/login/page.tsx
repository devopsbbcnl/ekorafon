"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { saveAuth, type StoredUser } from "@/lib/auth";

const G = "#008751";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]           = useState({ email: "", password: "" });
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setUnverified(false);
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: StoredUser }>("/auth/login", form);
      saveAuth(res.token, res.user);
      router.push(res.user.role === "SUPPLIER" ? "/dashboard/supplier" : "/dashboard/buyer");
    } catch (err) {
      if (err instanceof Error && err.message.includes("verify your email")) {
        setUnverified(true);
      } else {
        setError(err instanceof Error ? err.message : "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    try { await api.post("/auth/resend-verification", { email: form.email }); }
    catch { /* always show success */ }
    setResent(true);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F5F5F5" }}>

      {/* Header */}
      <header style={{ backgroundColor: "white", borderBottom: "1px solid #E8E8E8" }}>
        <div className="px-6 flex items-center justify-between" style={{ height: "64px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <Image src="/logo.png" alt="Ekorafon" width={44} height={44} style={{ objectFit: "contain" }} priority />
          </Link>
          <p style={{ fontSize: "12px", color: "#666666" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" style={{ color: G, fontWeight: 600, textDecoration: "none" }}>Join Free</Link>
          </p>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: G }}>Trade Platform</p>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "#333333" }}>Welcome back</h1>
            <p className="text-sm mt-1" style={{ color: "#666666" }}>Sign in to your Ekorafon account</p>
          </div>

          <div className="bg-white rounded border p-8" style={{ borderColor: "#E8E8E8" }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#666666" }}>Email Address</label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded border text-sm outline-none"
                  style={{ borderColor: "#E8E8E8", backgroundColor: "white", color: "#333333" }}
                />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: "#666666" }}>Password</label>
                  <Link href="/auth/forgot-password" style={{ fontSize: "11px", color: G, fontWeight: 600, textDecoration: "none" }}>
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Your password"
                  className="w-full px-4 py-3 rounded border text-sm outline-none"
                  style={{ borderColor: "#E8E8E8", backgroundColor: "white", color: "#333333" }}
                />
              </div>

              {error && (
                <div className="text-xs p-3 rounded border" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}>
                  {error}
                </div>
              )}

              {unverified && (
                <div style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "6px", padding: "12px 14px" }}>
                  <p style={{ fontSize: "13px", color: "#92400E", fontWeight: 600, marginBottom: "6px" }}>Email not verified</p>
                  <p style={{ fontSize: "12px", color: "#78350F", marginBottom: "10px" }}>
                    Please verify your email address before logging in.
                  </p>
                  {resent ? (
                    <p style={{ fontSize: "12px", color: G, fontWeight: 600 }}>✓ New verification email sent — check your inbox.</p>
                  ) : (
                    <button
                      type="button" onClick={resendVerification}
                      style={{ fontSize: "12px", color: G, fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                    >
                      Resend verification email
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-3 text-sm font-semibold rounded transition-opacity disabled:opacity-50"
                style={{ backgroundColor: G, color: "white" }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="mt-6 pt-6" style={{ borderTop: "1px solid #E8E8E8" }}>
              <p className="text-center text-xs" style={{ color: "#666666" }}>
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" style={{ color: G }} className="font-semibold hover:underline">Create one free</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
