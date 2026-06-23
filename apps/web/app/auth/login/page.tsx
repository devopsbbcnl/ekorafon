"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { saveAuth, type StoredUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: StoredUser }>("/auth/login", form);
      saveAuth(res.token, res.user);
      router.push(res.user.role === "SUPPLIER" ? "/dashboard/supplier" : "/dashboard/buyer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F5F5F5" }}>

      {/* Header */}
      <header style={{ backgroundColor: "white", borderBottom: "1px solid #E8E8E8" }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: "64px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <Image src="/logo.png" alt="Ekorafon" width={44} height={44} style={{ objectFit: "contain" }} priority />
          </Link>
          <p style={{ fontSize: "12px", color: "#666666" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" style={{ color: "#008751", fontWeight: 600, textDecoration: "none" }}>
              Join Free
            </Link>
          </p>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#008751" }}>
              Trade Platform
            </p>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "#333333" }}>Welcome back</h1>
            <p className="text-sm mt-1" style={{ color: "#666666" }}>Sign in to your Ekorafon account</p>
          </div>

          <div className="bg-white rounded border p-8" style={{ borderColor: "#E8E8E8" }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#666666" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded border text-sm outline-none"
                  style={{ borderColor: "#E8E8E8", backgroundColor: "white", color: "#333333" }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#666666" }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-semibold rounded transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "#008751", color: "white" }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 pt-6" style={{ borderTop: "1px solid #E8E8E8" }}>
              <p className="text-center text-xs" style={{ color: "#666666" }}>
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" style={{ color: "#008751" }} className="font-semibold hover:underline">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
