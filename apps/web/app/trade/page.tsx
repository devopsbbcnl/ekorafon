"use client";

import Link from "next/link";
import { Nav } from "@/components/nav";
import Footer from "@/components/footer";

const G = "#008751";
const GD = "#006641";
const BORDER = "#E8E8E8";
const TEXT = "#333333";
const MUTED = "#666666";
const BG = "#F5F5F5";

const protections = [
  {
    title: "Escrow Payment Protection",
    icon: "🔒",
    desc: "Your payment is held securely by Ekorafon until you confirm delivery. Funds are only released to the supplier after you verify goods received — you are never exposed to payment-before-delivery risk.",
    badge: "Active on all orders",
  },
  {
    title: "ETRS Trust Scoring",
    icon: "⭐",
    desc: "Every buyer and supplier on the platform carries an Ekorafon Trade Reputation Score (ETRS). Built from order history, delivery rates, dispute outcomes, and peer reviews — so you know exactly who you are dealing with before you commit.",
    badge: "Visible on all profiles",
  },
  {
    title: "Factory Verification Tiers",
    icon: "✅",
    desc: "Suppliers go through multi-level verification: Business Registration, Facility Inspection, Factory Certification, and Export Readiness. Each tier is independently assessed by the Ekorafon team — badges are earned, not self-declared.",
    badge: "4 verification levels",
  },
  {
    title: "Dispute Resolution",
    icon: "⚖️",
    desc: "If a dispute arises on any order — wrong specification, damaged goods, missed delivery — Ekorafon provides a structured resolution process. Escrow funds remain locked until the case is resolved fairly for both parties.",
    badge: "Managed by Ekorafon",
  },
  {
    title: "RFQ Competitive Quoting",
    icon: "📋",
    desc: "Post a Request for Quotation and let verified suppliers compete for your business. You set the terms, review multiple offers, and award only when you are satisfied — no pressure, no lock-in.",
    badge: "Open to all buyers",
  },
  {
    title: "Order Trail & Documentation",
    icon: "📄",
    desc: "Every order, payment, quote, and status change is recorded on the platform. You have a full audit trail of your trade history — useful for reconciliation, disputes, and export documentation.",
    badge: "Full audit trail",
  },
];

const tiers = [
  { level: "Unverified", color: "#999", desc: "Self-registered. No checks completed." },
  { level: "Verified Business", color: "#F59E0B", desc: "CAC registration confirmed by Ekorafon." },
  { level: "Verified Facility", color: "#3B82F6", desc: "Physical facility inspected and assessed." },
  { level: "Factory Certified", color: G, desc: "Full production audit passed. Quality standards met." },
  { level: "Export Certified", color: GD, desc: "Export-ready. Meets AfCFTA and international trade standards." },
];

export default function TradePage() {
  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>
      <Nav variant="default" />

      {/* Hero */}
      <div style={{ backgroundColor: GD, color: "white" }}>
        <div className="px-4 md:px-6 py-14">
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", marginBottom: "12px" }}>TRADE PROTECTION</p>
          <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, lineHeight: 1.1, marginBottom: "16px" }}>
            Trade with confidence.<br />Every order, every time.
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", maxWidth: "560px", lineHeight: 1.7 }}>
            Ekorafon is built on the premise that African B2B trade should be as safe as any global marketplace.
            Our infrastructure protects every transaction from first quote to final delivery.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
            <Link href="/auth/register?role=buyer" style={{ backgroundColor: "white", color: GD, fontWeight: 700, fontSize: "13px", padding: "10px 20px", borderRadius: "6px", textDecoration: "none" }}>
              Start Buying Safely
            </Link>
            <Link href="/factories" style={{ border: "1px solid rgba(255,255,255,0.3)", color: "white", fontWeight: 600, fontSize: "13px", padding: "10px 20px", borderRadius: "6px", textDecoration: "none" }}>
              Browse Verified Suppliers
            </Link>
          </div>
        </div>
      </div>

      {/* Protections grid */}
      <div className="px-4 md:px-6 py-12">
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: TEXT, marginBottom: "6px" }}>How we protect your trade</h2>
        <p style={{ fontSize: "13px", color: MUTED, marginBottom: "28px" }}>Six layers of protection built into every transaction on Ekorafon.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {protections.map((p) => (
            <div key={p.title} style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "24px" }}>
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>{p.icon}</div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: TEXT, marginBottom: "8px" }}>{p.title}</h3>
              <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.65, marginBottom: "14px" }}>{p.desc}</p>
              <span style={{ fontSize: "11px", fontWeight: 600, color: G, backgroundColor: "#E8F5EE", padding: "3px 8px", borderRadius: "4px" }}>
                {p.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Verification tiers */}
      <div style={{ backgroundColor: "white", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="px-4 md:px-6 py-12">
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: TEXT, marginBottom: "6px" }}>Supplier verification tiers</h2>
          <p style={{ fontSize: "13px", color: MUTED, marginBottom: "28px" }}>
            Every supplier profile shows their verification level. Higher tiers mean more checks, more confidence.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "640px" }}>
            {tiers.map((t, i) => (
              <div key={t.level} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", border: `1px solid ${BORDER}`, borderRadius: "8px", backgroundColor: BG }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: t.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>{i + 1}</span>
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: TEXT, marginBottom: "2px" }}>{t.level}</p>
                  <p style={{ fontSize: "12px", color: MUTED }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 md:px-6 py-14" style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: TEXT, marginBottom: "8px" }}>Ready to trade safely?</h2>
        <p style={{ fontSize: "13px", color: MUTED, marginBottom: "20px" }}>Join thousands of buyers and suppliers building trust on Ekorafon.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth/register" style={{ backgroundColor: G, color: "white", fontWeight: 700, fontSize: "13px", padding: "11px 24px", borderRadius: "6px", textDecoration: "none" }}>
            Create Free Account
          </Link>
          <Link href="/factories" style={{ border: `1px solid ${BORDER}`, color: TEXT, fontWeight: 600, fontSize: "13px", padding: "11px 24px", borderRadius: "6px", textDecoration: "none", backgroundColor: "white" }}>
            Browse Manufacturers
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
