"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

type Role = "BUYER" | "SUPPLIER";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = (params.get("role")?.toUpperCase() as Role) || "BUYER";

  const [role, setRole] = useState<Role>(defaultRole);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: { id: string; email: string; name: string; role: Role } }>(
        "/auth/register",
        { ...form, role }
      );
      saveAuth(res.token, res.user);
      router.push(role === "SUPPLIER" ? "/dashboard/supplier" : "/dashboard/buyer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#008751", fontWeight: 600, textDecoration: "none" }}>
              Sign In
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
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "#333333" }}>Create your account</h1>
            <p className="text-sm mt-1" style={{ color: "#666666" }}>Join Africa&apos;s trade infrastructure platform</p>
          </div>

          <div className="bg-white rounded border p-8" style={{ borderColor: "#E8E8E8" }}>
            {/* Role toggle */}
            <div className="flex rounded overflow-hidden border mb-6" style={{ borderColor: "#E8E8E8" }}>
              {(["BUYER", "SUPPLIER"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="flex-1 py-2.5 text-xs font-semibold tracking-wide transition-all"
                  style={{
                    backgroundColor: role === r ? "#008751" : "transparent",
                    color: role === r ? "white" : "#666666",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {r === "BUYER" ? "I want to Buy" : "I am a Supplier"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#666666" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Chukwuemeka Obi"
                  className="w-full px-4 py-3 rounded border text-sm outline-none"
                  style={{ borderColor: "#E8E8E8", backgroundColor: "white", color: "#333333" }}
                />
              </div>
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
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
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
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 pt-6" style={{ borderTop: "1px solid #E8E8E8" }}>
              <p className="text-center text-xs" style={{ color: "#666666" }}>
                Already have an account?{" "}
                <Link href="/auth/login" style={{ color: "#008751" }} className="font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
