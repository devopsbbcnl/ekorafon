import type { Metadata } from "next";
import Link from "next/link";
import HomeClient from "./home-client";
import { CATEGORY_PAGES } from "@/lib/categories";

const SITE_URL = "https://ekorafon.com";

export const metadata: Metadata = {
  title: "Source From Verified Manufacturers in Aba, Nigeria | Ekorafon",
  description:
    "Find verified factories in Aba, Nigeria for wholesale shoes, garments, leather goods, bags & more. Post a free RFQ and get direct quotes from made-in-Nigeria manufacturers.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ekorafon — Source From Verified Manufacturers in Aba, Nigeria",
    description:
      "Nigeria's B2B sourcing marketplace. Verified factories, live RFQ board, and ETRS reputation scoring — wholesale sourcing from Aba without middlemen.",
    url: "/",
  },
};

const FAQS = [
  {
    q: "How do I find verified manufacturers in Aba, Nigeria?",
    a: "Browse the Ekorafon factory directory or search by product category — footwear, garments, leather goods, bags and more. Every listed factory goes through a verification process, and profiles show verification level, minimum order quantity (MOQ) and ETRS trade reputation score, so you can compare suppliers before you contact them.",
  },
  {
    q: "What products can I source wholesale from Aba?",
    a: "Aba is one of Africa's largest manufacturing hubs, known for made-in-Aba shoes, leather goods, garments and textiles, bags, plastics, furniture, packaging and building materials. On Ekorafon you can source all of these at factory prices, including custom production runs made to your specification.",
  },
  {
    q: "Is it free to post an RFQ (request for quotation) on Ekorafon?",
    a: "Yes. Buyers post RFQs for free. Describe the product, quantity and budget, and verified manufacturers send you quotes directly — you compare offers and choose the best supplier. There are no agent fees or middlemen.",
  },
  {
    q: "Can international buyers source from Nigerian factories on Ekorafon?",
    a: "Yes. Ekorafon highlights export-ready factories that meet international-grade standards, so global buyers can source made-in-Nigeria products directly from the manufacturer. Each profile shows export readiness, years of operation and trade reputation.",
  },
];

const G = "#008751";
const BORDER = "#E8E8E8";
const TEXT = "#333333";
const MUTED = "#666666";

/* Server-rendered, crawlable copy targeting primary + long-tail keywords */
function SeoContent() {
  return (
    <section style={{ backgroundColor: "white", marginTop: "8px", borderTop: `1px solid ${BORDER}` }}>
      <div className="px-4 md:px-6 py-10" style={{ maxWidth: "860px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: TEXT, marginBottom: "12px" }}>
          The B2B Marketplace for Made-in-Aba Products
        </h2>
        <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.8, marginBottom: "20px" }}>
          Aba, Abia State — often called the &ldquo;Japan of Africa&rdquo; — is Nigeria&rsquo;s
          manufacturing powerhouse, home to tens of thousands of factories and workshops around
          Ariaria International Market producing shoes, garments, leather goods and bags at
          wholesale prices. Ekorafon brings this hub online: a digital trade platform where you
          can <Link href="/factories" style={{ color: G, fontWeight: 600 }}>browse verified Aba manufacturers</Link>,
          compare minimum order quantities, check ETRS trade reputation scores, and{" "}
          <Link href="/rfq" style={{ color: G, fontWeight: 600 }}>post a request for quotation</Link>{" "}
          — without travelling to the market or paying sourcing agents.
        </p>

        <h2 style={{ fontSize: "18px", fontWeight: 800, color: TEXT, marginBottom: "12px" }}>
          How Sourcing on Ekorafon Works
        </h2>
        <ol style={{ fontSize: "13px", color: MUTED, lineHeight: 1.8, marginBottom: "20px", paddingLeft: "18px", listStyle: "decimal" }}>
          <li>
            <strong style={{ color: TEXT }}>Post a free RFQ</strong> — describe the product,
            quantity and target budget for your wholesale or custom production order.
          </li>
          <li>
            <strong style={{ color: TEXT }}>Receive direct factory quotes</strong> — verified
            Nigerian manufacturers respond with pricing, lead times and MOQs.
          </li>
          <li>
            <strong style={{ color: TEXT }}>Compare and trade with confidence</strong> — use
            verification badges and ETRS reputation scores to pick the right supplier.
          </li>
        </ol>

        <h2 style={{ fontSize: "18px", fontWeight: 800, color: TEXT, marginBottom: "12px" }}>
          Find Manufacturers by Category
        </h2>
        <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.8, marginBottom: "12px" }}>
          Explore verified Aba factories in the categories buyers source most:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
          {CATEGORY_PAGES.map((c) => (
            <Link
              key={c.slug}
              href={`/manufacturers/${c.slug}`}
              style={{
                fontSize: "12px", fontWeight: 600, color: "#006641", backgroundColor: "#E8F5EE",
                border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "6px 12px", textDecoration: "none",
              }}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <h2 style={{ fontSize: "18px", fontWeight: 800, color: TEXT, marginBottom: "14px" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {FAQS.map((f) => (
            <div key={f.q}>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: TEXT, marginBottom: "4px" }}>{f.q}</h3>
              <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.7 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ekorafon",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Digital commerce and trade infrastructure platform connecting manufacturers, wholesalers, retailers and buyers across Africa, starting from Aba, Abia State, Nigeria.",
    email: "support@ekorafon.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Aba",
      addressRegion: "Abia State",
      addressCountry: "NG",
    },
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ekorafon",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeClient seoContent={<SeoContent />} />
    </>
  );
}
