"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { saveAuth, type StoredUser } from "@/lib/auth";

const G  = "#008751";
const GD = "#006641";

function VerifyContent() {
  const router       = useRouter();
  const params       = useSearchParams();
  const token        = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Missing verification token. Check the link in your email."); return; }

    api.get<{ token: string; user: StoredUser }>(`/auth/verify-email?token=${token}`)
      .then((res) => {
        saveAuth(res.token, res.user);
        setStatus("success");
        setTimeout(() => {
          router.push(res.user.role === "SUPPLIER" ? "/dashboard/supplier" : "/dashboard/buyer");
        }, 2500);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed. The link may have expired.");
      });
  }, [token, router]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Link href="/"><Image src="/logo.png" alt="Ekorafon" width={52} height={52} style={{ objectFit: "contain" }} /></Link>
        </div>

        <div style={{ backgroundColor: "white", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "36px 32px", textAlign: "center" }}>
          {status === "loading" && (
            <>
              <div style={{ width: "44px", height: "44px", border: `3px solid ${G}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
              <p style={{ fontWeight: 700, fontSize: "16px", color: "#111", marginBottom: "8px" }}>Verifying your email…</p>
              <p style={{ fontSize: "13px", color: "#666" }}>Just a moment.</p>
            </>
          )}
          {status === "success" && (
            <>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <p style={{ fontWeight: 800, fontSize: "17px", color: GD, marginBottom: "8px" }}>Email verified!</p>
              <p style={{ fontSize: "13px", color: "#666" }}>Redirecting you to your dashboard…</p>
            </>
          )}
          {status === "error" && (
            <>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
              <p style={{ fontWeight: 800, fontSize: "16px", color: "#111", marginBottom: "8px" }}>Verification failed</p>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "24px" }}>{message}</p>
              <ResendForm />
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function ResendForm() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await api.post("/auth/resend-verification", { email }); setSent(true); }
    catch { setSent(true); } // always show success to avoid enumeration
    finally { setLoading(false); }
  }

  if (sent) return <p style={{ fontSize: "13px", color: "#008751", fontWeight: 600 }}>Check your inbox for a new verification link.</p>;

  return (
    <form onSubmit={resend} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <p style={{ fontSize: "12px", color: "#666" }}>Enter your email to receive a new link:</p>
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        style={{ width: "100%", padding: "10px 12px", border: "1px solid #E8E8E8", borderRadius: "6px", fontSize: "14px", outline: "none" }}
      />
      <button
        type="submit" disabled={loading}
        style={{ padding: "10px", borderRadius: "6px", border: "none", backgroundColor: "#008751", color: "white", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
      >
        {loading ? "Sending…" : "Resend Verification Email"}
      </button>
    </form>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyContent /></Suspense>;
}
