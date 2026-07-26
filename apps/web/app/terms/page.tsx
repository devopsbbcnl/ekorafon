/*
 * DRAFT — industry-standard template, not legal advice.
 * Ekorafon Limited must have this reviewed and adapted by qualified Nigerian
 * counsel before relying on it in production. Placeholders in [BRACKETS] need
 * real values (RC number, registered address, transaction fee %, governing
 * state, arbitration venue, effective date).
 */
import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import Footer from "@/components/footer";

const G = "#008751";
const BORDER = "#E8E8E8";
const TEXT = "#333333";
const MUTED = "#666666";
const BG = "#F5F5F5";

const LAST_UPDATED = "26 July 2026";

export const metadata: Metadata = {
  title: "Terms of Use | Ekorafon",
  description:
    "The terms governing your use of the Ekorafon B2B sourcing marketplace — accounts, RFQs, orders, escrow, payments, fees, and dispute resolution.",
  alternates: { canonical: "/terms" },
};

type Section = { title: string; paras?: string[]; bullets?: string[]; closing?: string };

const sections: Section[] = [
  {
    title: "1. Agreement to these terms",
    paras: [
      "These Terms of Use (\"Terms\") govern your access to and use of the Ekorafon platform, websites, and services (the \"Platform\"), operated by Ekorafon Limited, a company registered in Nigeria [RC NUMBER] (\"Ekorafon\", \"we\", \"us\", or \"our\").",
      "By creating an account or using the Platform, you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the Platform. If you use the Platform on behalf of a business, you confirm that you are authorised to bind that business to these Terms.",
    ],
  },
  {
    title: "2. Who can use Ekorafon",
    paras: [
      "You must be at least 18 years old and able to enter into a legally binding contract to use the Platform. Ekorafon is a business-to-business marketplace intended for buyers sourcing goods and suppliers (manufacturers and factories) offering them.",
    ],
  },
  {
    title: "3. Your account",
    bullets: [
      "You register as either a Buyer or a Supplier. Account roles cannot be changed after registration.",
      "You must provide accurate, current information and keep it up to date.",
      "You are responsible for keeping your password confidential and for all activity under your account.",
      "Notify us immediately of any unauthorised use of your account.",
      "You must verify your email address to activate your account.",
    ],
  },
  {
    title: "4. The Ekorafon marketplace",
    paras: [
      "Ekorafon provides a venue that connects buyers and suppliers and tools to transact — supplier profiles, a request-for-quotation (RFQ) board, quotes, orders, escrow, verification, and the Ekorafon Trade Reputation Score (ETRS).",
      "Ekorafon is not a party to the underlying contract of sale between a buyer and a supplier. The buyer and supplier are solely responsible for their trade, including the specification, quality, quantity, price, packaging, and delivery of goods. We do not manufacture, own, inspect, or take title to goods listed on the Platform, and we do not guarantee the quality, safety, legality, or fitness of any goods.",
    ],
  },
  {
    title: "5. RFQs and quotes",
    bullets: [
      "Buyers may post RFQs describing the product, quantity, budget, and delivery requirements. RFQs must be genuine sourcing requests.",
      "Suppliers may submit quotes in response, stating unit price, total price, lead time, and terms.",
      "A quote is an offer by the supplier. An order is formed when the buyer accepts a quote and completes the required payment into escrow.",
      "Buyers and suppliers must not use RFQ or quote information for any purpose other than transacting on the Platform.",
    ],
  },
  {
    title: "6. Orders, payments, and escrow",
    bullets: [
      "Payments are processed by our third-party payment provider, Paystack, in Nigerian Naira (NGN). By paying, you also agree to Paystack's terms.",
      "When you pay for an order, funds are held in escrow by Ekorafon and are not released to the supplier immediately.",
      "Funds are released to the supplier when you confirm that the goods have been delivered satisfactorily, or after any applicable auto-confirmation or dispute window.",
      "If you do not receive your goods, or they do not match the order, you may raise a dispute before releasing funds.",
      "You must not attempt to arrange payment off-Platform to avoid escrow or fees; doing so removes your buyer protection and may result in suspension.",
    ],
  },
  {
    title: "7. Fees",
    paras: [
      "Creating an account and listing a factory are free. Ekorafon charges a transaction fee of [FEE %] on successfully completed orders, which is disclosed before an order is confirmed. Payment-processing charges by Paystack may also apply. We may change our fees on reasonable notice; changes do not affect orders already placed.",
    ],
  },
  {
    title: "8. Verification and ETRS",
    paras: [
      "Verification badges and the ETRS are indicators intended to help buyers assess suppliers. Verification reflects checks carried out at a point in time, and ETRS is calculated from a supplier's activity on the Platform. These indicators are provided in good faith but are not warranties, and you remain responsible for your own due diligence before transacting. You must not manipulate, game, or misrepresent verification status or ETRS.",
    ],
  },
  {
    title: "9. Acceptable use",
    paras: ["You agree not to:"],
    bullets: [
      "Post false, misleading, infringing, or unlawful content, or list goods you may not lawfully sell.",
      "Impersonate any person or business or misrepresent your affiliation.",
      "Interfere with, disrupt, or attempt to gain unauthorised access to the Platform or its systems.",
      "Use the Platform to defraud, harass, or harm others, or to launder money or finance illegal activity.",
      "Scrape, harvest, or misuse data of other users, or use the Platform to send spam.",
    ],
  },
  {
    title: "10. Intellectual property",
    paras: [
      "The Platform, including its software, design, and trademarks (including the Ekorafon name and logo), is owned by Ekorafon or its licensors and is protected by law. We grant you a limited, non-exclusive, non-transferable licence to use the Platform for its intended purpose. You retain rights in content you submit, but grant Ekorafon a licence to host, display, and use that content to operate and promote the Platform.",
    ],
  },
  {
    title: "11. Disclaimers",
    paras: [
      "The Platform is provided \"as is\" and \"as available\" without warranties of any kind, whether express or implied, to the fullest extent permitted by law. We do not warrant that the Platform will be uninterrupted, error-free, or secure, or that any supplier, buyer, listing, or transaction will meet your expectations.",
    ],
  },
  {
    title: "12. Limitation of liability",
    paras: [
      "To the fullest extent permitted by law, Ekorafon is not liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, data, or goodwill, arising from your use of the Platform or from any transaction between users. Nothing in these Terms excludes liability that cannot be excluded under applicable law.",
    ],
  },
  {
    title: "13. Indemnity",
    paras: [
      "You agree to indemnify and hold Ekorafon harmless from any claims, losses, and expenses (including reasonable legal fees) arising from your use of the Platform, your content, your transactions with other users, or your breach of these Terms or of applicable law.",
    ],
  },
  {
    title: "14. Suspension and termination",
    paras: [
      "You may stop using the Platform at any time. We may suspend or terminate your account if you breach these Terms, if required by law, or to protect the Platform or its users. On termination, provisions that by their nature should survive — including fees owed, disclaimers, limitation of liability, and dispute resolution — continue to apply.",
    ],
  },
  {
    title: "15. Disputes and governing law",
    paras: [
      "These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes between you and Ekorafon should first be raised with us so we can try to resolve them informally. If they cannot be resolved, they will be subject to [ARBITRATION UNDER THE ARBITRATION AND MEDIATION ACT 2023, SEAT: [CITY], NIGERIA / the exclusive jurisdiction of the courts of [STATE], Nigeria]. Disputes about a specific order between a buyer and a supplier are handled first through the Platform's dispute process described in our Help Center.",
    ],
  },
  {
    title: "16. Changes to these terms",
    paras: [
      "We may update these Terms from time to time. When we make material changes, we will update the \"Last updated\" date and, where appropriate, notify you. Your continued use of the Platform after an update means you accept the revised Terms.",
    ],
  },
  {
    title: "17. Contact us",
    paras: [
      "Questions about these Terms? Contact us at support@ekorafon.com, or write to Ekorafon Limited, [REGISTERED ADDRESS], Aba, Abia State, Nigeria.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>
      <Nav variant="default" />

      <div style={{ backgroundColor: "white", borderBottom: `1px solid ${BORDER}` }}>
        <div className="px-4 md:px-6 py-12" style={{ maxWidth: "760px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: G, marginBottom: "10px" }}>LEGAL</p>
          <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: TEXT, marginBottom: "10px" }}>Terms of Use</h1>
          <p style={{ fontSize: "13px", color: MUTED }}>Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="px-4 md:px-6 py-10" style={{ maxWidth: "760px" }}>
        <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.75, marginBottom: "32px" }}>
          Please read these Terms carefully before using Ekorafon. They set out the rules for using our marketplace and
          the basis on which buyers and suppliers transact. They should be read alongside our{" "}
          <a href="/privacy" style={{ color: G, fontWeight: 600, textDecoration: "none" }}>Privacy Policy</a>.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {sections.map((s) => (
            <section key={s.title}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: TEXT, marginBottom: "10px" }}>{s.title}</h2>
              {s.paras?.map((p, i) => (
                <p key={i} style={{ fontSize: "14px", color: MUTED, lineHeight: 1.75, marginBottom: "10px" }}>{p}</p>
              ))}
              {s.bullets && (
                <ul style={{ listStyle: "disc", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                  {s.bullets.map((b, i) => (
                    <li key={i} style={{ fontSize: "14px", color: MUTED, lineHeight: 1.7 }}>{b}</li>
                  ))}
                </ul>
              )}
              {s.closing && (
                <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.75, marginTop: "10px" }}>{s.closing}</p>
              )}
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
