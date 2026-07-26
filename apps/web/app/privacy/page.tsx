/*
 * DRAFT — industry-standard template, not legal advice.
 * Ekorafon Limited must have this reviewed and adapted by qualified Nigerian
 * counsel (NDPA 2023 compliance) before relying on it in production.
 * Placeholders in [BRACKETS] need real values (RC number, registered address,
 * DPO contact, effective date).
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
  title: "Privacy Policy | Ekorafon",
  description:
    "How Ekorafon Limited collects, uses, shares, and protects your personal data, and your rights under the Nigeria Data Protection Act 2023.",
  alternates: { canonical: "/privacy" },
};

type Section = { title: string; paras?: string[]; bullets?: string[]; closing?: string };

const sections: Section[] = [
  {
    title: "1. Who we are",
    paras: [
      "Ekorafon (\"Ekorafon\", \"we\", \"us\", or \"our\") is a business-to-business sourcing marketplace operated by Ekorafon Limited, a company registered in Nigeria [RC NUMBER], with its registered office at [REGISTERED ADDRESS], Aba, Abia State, Nigeria.",
      "This Privacy Policy explains how we handle personal data for buyers, suppliers, and visitors to our website and services (the \"Platform\"). For the purposes of the Nigeria Data Protection Act 2023 (the \"NDPA\"), Ekorafon Limited is the data controller of the personal data described here.",
    ],
  },
  {
    title: "2. Information we collect",
    paras: ["We collect the following categories of personal data:"],
    bullets: [
      "Account data — your name, email address, password (stored in hashed form), and whether you register as a buyer or supplier.",
      "Profile and business data — for suppliers: business name, description, location and LGA, product categories, team size, years of operation, minimum order quantity, phone number, website, and facility photos.",
      "Transaction data — RFQs you post, quotes you submit or receive, orders, delivery locations, and the status and history of your trades.",
      "Payment data — payments are processed by our payment provider, Paystack. We receive confirmation and reference details of a transaction. We do not collect or store your full card number or bank credentials.",
      "Communications — messages you send us or other users through the Platform, and support requests.",
      "Verification data — information and documents you submit when applying for a verification tier.",
      "Technical and usage data — IP address, device and browser type, pages viewed, and similar information collected automatically through cookies and similar technologies.",
    ],
  },
  {
    title: "3. How we use your information",
    paras: ["We use personal data to operate and improve the Platform. Depending on the activity, our lawful basis under the NDPA is the performance of a contract with you, your consent, our legitimate interests, or compliance with a legal obligation. Specifically, we use data to:"],
    bullets: [
      "Create and manage your account and authenticate you when you sign in.",
      "Publish supplier profiles and enable buyers to find and contact manufacturers.",
      "Facilitate RFQs, quotes, orders, escrow, and delivery between buyers and suppliers.",
      "Calculate and display the Ekorafon Trade Reputation Score (ETRS) and verification badges.",
      "Process payments through Paystack and hold funds in escrow until orders are confirmed.",
      "Provide customer support and resolve disputes.",
      "Send you service messages, order updates, and — where you have not opted out — relevant platform updates.",
      "Detect, prevent, and investigate fraud, abuse, and security incidents.",
      "Comply with legal, tax, and regulatory obligations.",
    ],
  },
  {
    title: "4. How we share your information",
    paras: ["We do not sell your personal data. We share it only as necessary to run the Platform:"],
    bullets: [
      "With other users — to complete a trade, relevant details are shared between a buyer and a supplier (for example, a buyer's delivery location and a supplier's contact and business details).",
      "With Paystack — to process payments and manage escrow.",
      "With service providers — hosting, email, analytics, and similar vendors who process data on our behalf under written agreements and only on our instructions.",
      "For legal reasons — where required by law, regulation, court order, or a lawful request from a public authority, or to protect the rights, safety, and property of Ekorafon, our users, or the public.",
      "In a business transfer — if Ekorafon is involved in a merger, acquisition, financing, or sale of assets, data may be transferred as part of that transaction, subject to this Policy.",
    ],
  },
  {
    title: "5. Cookies and similar technologies",
    paras: [
      "We use cookies and similar technologies to keep you signed in, remember your preferences, secure the Platform, and understand how it is used. You can control cookies through your browser settings; disabling some cookies may affect how the Platform works.",
    ],
  },
  {
    title: "6. Data retention",
    paras: [
      "We keep personal data for as long as your account is active and for as long afterwards as needed to provide the service, comply with our legal, tax, and accounting obligations, resolve disputes, and enforce our agreements. Transaction records may be retained for the period required by applicable Nigerian law. When data is no longer needed, we delete or anonymise it.",
    ],
  },
  {
    title: "7. How we protect your data",
    paras: [
      "We use technical and organisational measures designed to protect personal data, including encryption in transit, hashed passwords, access controls, and payment handling through a PCI-compliant provider. No method of transmission or storage is completely secure, so we cannot guarantee absolute security, but we work to protect your data and to notify you and the Nigeria Data Protection Commission of a breach where the law requires it.",
    ],
  },
  {
    title: "8. International transfers",
    paras: [
      "Some of our service providers may process data outside Nigeria. Where we transfer personal data across borders, we take steps to ensure it is protected in line with the NDPA, including using providers that offer an adequate level of protection or appropriate safeguards.",
    ],
  },
  {
    title: "9. Your rights",
    paras: ["Subject to the NDPA and its conditions, you have the right to:"],
    bullets: [
      "Access the personal data we hold about you and request a copy.",
      "Request correction of inaccurate or incomplete data.",
      "Request deletion of your data in certain circumstances.",
      "Request that we restrict or object to certain processing.",
      "Request portability of data you provided to us, in a structured, commonly used format.",
      "Withdraw consent at any time where we rely on consent, without affecting processing already carried out.",
      "Lodge a complaint with the Nigeria Data Protection Commission (NDPC).",
    ],
    closing: "To exercise any of these rights, contact us using the details below. We may need to verify your identity before acting on a request.",
  },
  {
    title: "10. Children",
    paras: [
      "The Platform is intended for businesses and users aged 18 and over. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, contact us and we will take steps to delete it.",
    ],
  },
  {
    title: "11. Third-party links",
    paras: [
      "The Platform may link to third-party websites and services that we do not control. This Policy does not apply to them, and we encourage you to read their privacy notices.",
    ],
  },
  {
    title: "12. Changes to this policy",
    paras: [
      "We may update this Policy from time to time. When we make material changes, we will update the \"Last updated\" date and, where appropriate, notify you. Your continued use of the Platform after an update means you accept the revised Policy.",
    ],
  },
  {
    title: "13. Contact us",
    paras: [
      "For questions about this Policy or to exercise your rights, contact our Data Protection Officer at privacy@ekorafon.com, or write to Ekorafon Limited, [REGISTERED ADDRESS], Aba, Abia State, Nigeria.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>
      <Nav variant="default" />

      <div style={{ backgroundColor: "white", borderBottom: `1px solid ${BORDER}` }}>
        <div className="px-4 md:px-6 py-12" style={{ maxWidth: "760px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: G, marginBottom: "10px" }}>LEGAL</p>
          <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: TEXT, marginBottom: "10px" }}>Privacy Policy</h1>
          <p style={{ fontSize: "13px", color: MUTED }}>Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="px-4 md:px-6 py-10" style={{ maxWidth: "760px" }}>
        <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.75, marginBottom: "32px" }}>
          This Privacy Policy describes how Ekorafon collects, uses, shares, and protects your personal data when you use
          our Platform, and the rights you have under the Nigeria Data Protection Act 2023. Please read it alongside our{" "}
          <a href="/terms" style={{ color: G, fontWeight: 600, textDecoration: "none" }}>Terms of Use</a>.
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
