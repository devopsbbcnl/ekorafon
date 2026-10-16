import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import Footer from "@/components/footer";

const G = "#008751";
const BORDER = "#E8E8E8";
const TEXT = "#333333";
const MUTED = "#666666";
const BG = "#F5F5F5";

export const metadata: Metadata = {
  title: "ETRS — Ekorafon Trade Reputation Score | How Supplier Trust Is Measured",
  description:
    "The Ekorafon Trade Reputation Score (ETRS) is a 0–100 trust score for verified Aba manufacturers, built from completed orders, on-time delivery, buyer ratings, and dispute history. Learn how it is calculated.",
  alternates: { canonical: "/etrs" },
};

const factors = [
  {
    weight: "40 pts",
    title: "Delivery success rate",
    body: "The share of a supplier's orders that were delivered and confirmed by the buyer, rather than ending in a dispute. This is the largest driver of the score — actually getting goods to buyers is what matters most.",
  },
  {
    weight: "40 pts",
    title: "Dispute-free record",
    body: "The proportion of completed orders that finished without a dispute being raised. A clean trading history carries the same weight as delivery: suppliers who trade without problems score highest.",
  },
  {
    weight: "up to 10",
    title: "Trading volume",
    body: "A bonus that grows with the number of orders a supplier has completed, capped so it rewards a real track record without letting sheer volume dominate. An established supplier earns more here than a brand-new one.",
  },
  {
    weight: "10 pts",
    title: "Active-trader base",
    body: "Every supplier who has completed at least one order through Ekorafon starts from a base score. Suppliers with no completed orders have no ETRS yet — the score only appears once real trade exists.",
  },
];

const tiers = [
  { name: "Verified Business", detail: "Identity and business registration confirmed. The entry-level trust badge — the supplier is a real, registered business." },
  { name: "Verified Facility", detail: "Ekorafon has confirmed a physical production facility exists, through documentation or inspection." },
  { name: "Factory Certified", detail: "The facility has passed a deeper capability review — production capacity, equipment, and quality process." },
  { name: "Export Certified", detail: "The factory meets international-grade standards and is cleared to fulfil export orders for global buyers." },
];

const faqs = [
  {
    q: "Does a new supplier start at zero?",
    a: "A brand-new supplier with no completed orders has no ETRS yet — the profile shows a verification badge instead. The score appears once they have completed their first orders through Ekorafon, so it always reflects real trade rather than self-reported claims.",
  },
  {
    q: "Can a supplier pay to raise their ETRS?",
    a: "No. ETRS cannot be bought, and it is not influenced by advertising or subscription. It is computed only from a supplier's actual order history on the platform. That is what makes it worth trusting.",
  },
  {
    q: "How is ETRS different from a verification badge?",
    a: "Verification badges answer 'is this a real, registered factory?' — a one-time check. ETRS answers 'how well do they actually trade?' — an ongoing score that moves with every order. Strong suppliers carry both.",
  },
  {
    q: "How current is the score?",
    a: "ETRS is recalculated automatically every time one of a supplier's orders is completed or ends in a dispute, so it always reflects their full trading record to date. A supplier's score moves with every order they fulfil.",
  },
];

export default function EtrsPage() {
  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>
      <Nav variant="default" />

      {/* Hero */}
      <div style={{ backgroundColor: "white", borderBottom: `1px solid ${BORDER}` }}>
        <div className="px-4 md:px-6 py-12" style={{ maxWidth: "820px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: G, marginBottom: "10px" }}>TRADE REPUTATION</p>
          <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: TEXT, marginBottom: "12px" }}>
            The Ekorafon Trade Reputation Score
          </h1>
          <p style={{ fontSize: "15px", color: MUTED, lineHeight: 1.7 }}>
            ETRS is a single number from 0 to 100 that tells you how reliably a supplier actually trades. It is built
            from real orders completed on Ekorafon — not adverts, not self-reported claims — so you can compare
            manufacturers on evidence and source with confidence.
          </p>
        </div>
      </div>

      {/* What it is */}
      <div className="px-4 md:px-6 py-10" style={{ maxWidth: "820px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: TEXT, marginBottom: "10px" }}>Why ETRS exists</h2>
        <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.75, marginBottom: "14px" }}>
          Sourcing from a factory you have never met is a leap of faith. Buyers have traditionally relied on referrals,
          market visits, and agents to judge whether a manufacturer will deliver on time and to spec. ETRS replaces that
          guesswork with a transparent, order-backed score every verified supplier carries on their profile.
        </p>
        <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.75 }}>
          The higher the score, the longer and cleaner the supplier&apos;s track record of orders delivered and confirmed
          without disputes. It is the same idea as a credit score for trade reputation — earned over time, and impossible
          to fake.
        </p>
      </div>

      {/* How it's calculated */}
      <div style={{ backgroundColor: "white", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="px-4 md:px-6 py-10" style={{ maxWidth: "820px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: TEXT, marginBottom: "6px" }}>How the score is calculated</h2>
          <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.7, marginBottom: "20px" }}>
            ETRS is a 0–100 score built from a supplier&apos;s completed orders. Delivery and dispute-free trading carry
            the most weight, with a bonus for trading volume and a base for being an active trader.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {factors.map((f) => (
              <div key={f.title} style={{ display: "flex", gap: "16px", alignItems: "flex-start", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "16px" }}>
                <div style={{ flexShrink: 0, minWidth: "56px", textAlign: "center" }}>
                  <span style={{ fontSize: "22px", fontWeight: 900, color: G, lineHeight: 1 }}>{f.weight}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: TEXT, marginBottom: "4px" }}>{f.title}</h3>
                  <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.65 }}>{f.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: MUTED, lineHeight: 1.6, marginTop: "16px", fontStyle: "italic" }}>
            Ekorafon may tune these weightings over time as the marketplace grows, to keep the score a fair reflection of
            real trade performance.
          </p>
        </div>
      </div>

      {/* Verification tiers */}
      <div className="px-4 md:px-6 py-10" style={{ maxWidth: "820px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: TEXT, marginBottom: "6px" }}>ETRS and verification tiers</h2>
        <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.7, marginBottom: "20px" }}>
          ETRS measures trade performance; verification tiers confirm what a supplier is. Together they give you the full
          picture. A supplier can hold one of four verification levels:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {tiers.map((t, i) => (
            <div key={t.name} style={{ display: "flex", gap: "14px", alignItems: "flex-start", backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "14px 16px" }}>
              <span style={{ flexShrink: 0, width: "24px", height: "24px", borderRadius: "50%", backgroundColor: G, color: "white", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
              <div>
                <h3 style={{ fontSize: "13px", fontWeight: 700, color: TEXT, marginBottom: "3px" }}>{t.name}</h3>
                <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.6 }}>{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ backgroundColor: "white", borderTop: `1px solid ${BORDER}` }}>
        <div className="px-4 md:px-6 py-10" style={{ maxWidth: "820px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: TEXT, marginBottom: "20px" }}>Common questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: TEXT, marginBottom: "6px" }}>{f.q}</h3>
                <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.7 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ backgroundColor: G }}>
        <div className="px-4 md:px-6 py-12" style={{ maxWidth: "820px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 900, color: "white", marginBottom: "8px" }}>Build your ETRS. Reach global buyers.</h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)", lineHeight: 1.65, marginBottom: "20px", maxWidth: "560px" }}>
            List your factory free, respond to RFQs, and complete orders through escrow. Every successful order raises your
            score and puts you in front of more buyers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/register?role=supplier" style={{ backgroundColor: "white", color: G, fontWeight: 700, fontSize: "13px", padding: "11px 22px", borderRadius: "6px", textDecoration: "none" }}>
              List Your Factory
            </Link>
            <Link href="/factories" style={{ border: "1px solid rgba(255,255,255,0.6)", color: "white", fontWeight: 700, fontSize: "13px", padding: "11px 22px", borderRadius: "6px", textDecoration: "none" }}>
              Browse Manufacturers
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
