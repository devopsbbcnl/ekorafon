"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const G      = "#008751";
const BORDER = "#E8E8E8";
const TEXT   = "#333333";
const MUTED  = "#666666";

export default function PaymentVerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("reference");
    if (!reference) { setStatus("failed"); return; }

    api.get<{ status: string; orderId: string }>(`/payment/verify/${reference}`)
      .then((data) => {
        setOrderId(data.orderId);
        setStatus(data.status === "SUCCESS" ? "success" : "failed");
      })
      .catch(() => setStatus("failed"));
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#F5F5F5" }}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: G, animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <p style={{ fontSize: "13px", fontWeight: 600, color: MUTED }}>Verifying your payment…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#F5F5F5" }}>
        <div
          style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "40px 32px", textAlign: "center", maxWidth: "420px", width: "100%" }}
        >
          <div
            style={{ width: "64px", height: "64px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "26px", margin: "0 auto 20px", backgroundColor: "#D1FAE5", color: "#065F46" }}
          >
            ✓
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: TEXT, marginBottom: "8px" }}>Payment Successful</h1>
          <p style={{ fontSize: "13px", color: MUTED, marginBottom: "24px", lineHeight: 1.6 }}>
            Your payment has been confirmed and held in escrow. The supplier will be notified and will confirm production shortly.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {orderId && (
              <Link
                href={`/dashboard/buyer/orders/${orderId}`}
                style={{ display: "block", width: "100%", padding: "10px", borderRadius: "4px", fontWeight: 700, fontSize: "13px", backgroundColor: G, color: "white", textDecoration: "none" }}
              >
                Track Your Order →
              </Link>
            )}
            <Link
              href="/dashboard/buyer"
              style={{ display: "block", width: "100%", padding: "10px", borderRadius: "4px", fontWeight: 600, fontSize: "13px", border: `1px solid ${BORDER}`, color: MUTED, textDecoration: "none" }}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#F5F5F5" }}>
      <div
        style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "40px 32px", textAlign: "center", maxWidth: "420px", width: "100%" }}
      >
        <div
          style={{ width: "64px", height: "64px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "26px", margin: "0 auto 20px", backgroundColor: "#FEE2E2", color: "#B91C1C" }}
        >
          ✕
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: TEXT, marginBottom: "8px" }}>Payment Failed</h1>
        <p style={{ fontSize: "13px", color: MUTED, marginBottom: "24px", lineHeight: 1.6 }}>
          We couldn&apos;t verify your payment. Your order has been preserved — please try paying again or contact support.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={() => router.back()}
            style={{ width: "100%", padding: "10px", borderRadius: "4px", fontWeight: 700, fontSize: "13px", backgroundColor: G, color: "white", border: "none", cursor: "pointer" }}
          >
            Try Again
          </button>
          <Link
            href="/dashboard/buyer"
            style={{ display: "block", width: "100%", padding: "10px", borderRadius: "4px", fontWeight: 600, fontSize: "13px", border: `1px solid ${BORDER}`, color: MUTED, textDecoration: "none" }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
