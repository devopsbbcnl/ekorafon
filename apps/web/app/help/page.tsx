"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import Footer from "@/components/footer";

const G = "#008751";
const BORDER = "#E8E8E8";
const TEXT = "#333333";
const MUTED = "#666666";
const BG = "#F5F5F5";

const categories = [
  {
    title: "Getting Started",
    icon: "🚀",
    articles: [
      { q: "How do I create an account?", a: "Click 'Join Free' on the homepage. Choose whether you are a Buyer or Supplier, enter your name, email, and password, then verify your email address. Your account will be active immediately after verification." },
      { q: "What is the difference between a Buyer and a Supplier?", a: "Buyers source products and post RFQs to find manufacturers. Suppliers are manufacturers and factories that list products, respond to RFQs, and fulfil orders. You register as one or the other — choose based on your primary role on the platform." },
      { q: "Is Ekorafon free to join?", a: "Yes. Creating an account as a Buyer or Supplier is completely free. There are no monthly fees. Ekorafon earns a small transaction fee when orders are successfully completed." },
    ],
  },
  {
    title: "Buying & Orders",
    icon: "🛒",
    articles: [
      { q: "How do I place an order?", a: "Browse manufacturers or products, select what you need, choose a quantity, and proceed to checkout. Your payment goes into escrow — held securely until you confirm delivery." },
      { q: "What is an RFQ and how does it work?", a: "An RFQ (Request for Quotation) lets you post a buying requirement — product type, quantity, budget, and delivery location — and receive competitive quotes from verified suppliers. You review the quotes and award to your preferred supplier." },
      { q: "When does my payment get released to the supplier?", a: "Your payment stays in escrow until you confirm you have received the goods. Once you mark the order as delivered, funds are released to the supplier. If there is a problem, you can raise a dispute before releasing." },
      { q: "Can I cancel an order?", a: "You can cancel an order before the supplier confirms it. Once production has started, cancellation is subject to the supplier's terms and may incur a partial charge. Contact support if you need help with a specific order." },
    ],
  },
  {
    title: "Selling & Factories",
    icon: "🏭",
    articles: [
      { q: "How do I list my factory on Ekorafon?", a: "Register as a Supplier, then go to your Dashboard and complete your Factory Profile. Add your business name, location, product categories, team size, and photos. Your profile becomes publicly visible immediately." },
      { q: "How do I get verified?", a: "From your Supplier Dashboard, submit a Verification Request. Select the tier you are applying for (Verified Business, Verified Facility, Factory Certified, or Export Certified) and describe your facility. The Ekorafon team will review and contact you for any required documentation or inspection." },
      { q: "How do I respond to an RFQ?", a: "On the RFQ Board, browse open requests and click 'Submit Quote' on any that match your capabilities. Enter your unit price, total price, lead time, and any notes. The buyer will review your quote alongside others and notify you if you are awarded." },
      { q: "What is the ETRS score?", a: "ETRS (Ekorafon Trade Reputation Score) is a trust score from 0–100 calculated from your orders completed, on-time delivery rate, average buyer rating, and dispute history. A high ETRS helps buyers choose you with confidence." },
    ],
  },
  {
    title: "Payments & Escrow",
    icon: "💳",
    articles: [
      { q: "What payment methods are accepted?", a: "Ekorafon accepts payments via Paystack, which supports debit/credit cards, bank transfers, and USSD. All transactions are processed in Nigerian Naira (NGN)." },
      { q: "How does escrow work?", a: "When you pay for an order, your money is held in escrow by Ekorafon — not sent directly to the supplier. It is only released when you confirm the goods have been delivered satisfactorily. This protects you from non-delivery or wrong goods." },
      { q: "What happens if there is a payment dispute?", a: "If you have an issue with an order, raise a dispute from your Order details page. Ekorafon will hold the escrow funds while reviewing the case. Both parties will be contacted and a resolution will be reached before any funds are released or refunded." },
    ],
  },
  {
    title: "Account & Security",
    icon: "🔐",
    articles: [
      { q: "How do I reset my password?", a: "On the login page, click 'Forgot password?' and enter your email address. You will receive a reset link within a few minutes. The link expires after 1 hour." },
      { q: "Why do I need to verify my email?", a: "Email verification confirms your identity and protects your account. It also ensures you receive important order updates, payment confirmations, and platform notifications." },
      { q: "Can I change my account role from Buyer to Supplier?", a: "Account roles cannot be changed after registration. If you need a Supplier account, please register a new account with a different email address. Contact support if you need help." },
    ],
  },
];

export default function HelpPage() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  function toggle(key: string) {
    setOpenKey(openKey === key ? null : key);
  }

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>
      <Nav variant="default" />

      {/* Hero */}
      <div style={{ backgroundColor: "white", borderBottom: `1px solid ${BORDER}` }}>
        <div className="px-4 md:px-6 py-12">
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: G, marginBottom: "10px" }}>HELP CENTER</p>
          <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: TEXT, marginBottom: "10px" }}>How can we help you?</h1>
          <p style={{ fontSize: "14px", color: MUTED, maxWidth: "500px", lineHeight: 1.65 }}>
            Find answers to common questions about buying, selling, payments, and your account on Ekorafon.
          </p>
        </div>
      </div>

      {/* FAQ sections */}
      <div className="px-4 md:px-6 py-10">
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "800px" }}>
          {categories.map((cat) => (
            <div key={cat.title}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "20px" }}>{cat.icon}</span>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: TEXT }}>{cat.title}</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {cat.articles.map((a) => {
                  const key = `${cat.title}:${a.q}`;
                  const open = openKey === key;
                  return (
                    <div key={a.q} style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "8px", overflow: "hidden" }}>
                      <button
                        onClick={() => toggle(key)}
                        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: "12px" }}
                      >
                        <span style={{ fontSize: "13px", fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>{a.q}</span>
                        <span style={{ fontSize: "16px", color: MUTED, flexShrink: 0, transform: open ? "rotate(45deg)" : "rotate(0)", transition: "transform 150ms ease" }}>+</span>
                      </button>
                      {open && (
                        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${BORDER}` }}>
                          <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.7, paddingTop: "12px" }}>{a.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div style={{ backgroundColor: "white", borderTop: `1px solid ${BORDER}` }}>
        <div className="px-4 md:px-6 py-12" style={{ maxWidth: "800px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 800, color: TEXT, marginBottom: "6px" }}>Still have questions?</h2>
          <p style={{ fontSize: "13px", color: MUTED, marginBottom: "16px" }}>
            Our support team is available Monday – Friday, 9am – 6pm WAT.
          </p>
          <a
            href="mailto:support@ekorafon.com"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: G, color: "white", fontWeight: 700, fontSize: "13px", padding: "10px 20px", borderRadius: "6px", textDecoration: "none" }}
          >
            Email Support
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
