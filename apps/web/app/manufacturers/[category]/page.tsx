import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import Footer from "@/components/footer";
import { CATEGORY_PAGES, getCategoryBySlug } from "@/lib/categories";

const SITE_URL = "https://ekorafon.com";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/* Re-render at most every 5 minutes so new factories appear without a rebuild */
export const revalidate = 300;

interface Factory {
  id: string;
  businessName: string;
  description: string;
  lga: string;
  productCategories: string[];
  moq: number;
  exportReady: boolean;
  verificationLevel: string;
  teamSize: number;
  yearsOfOperation: number;
  user: { name: string; etrs: { score: number } | null };
}

const VERIFICATION_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  UNVERIFIED:         { label: "Unverified",        color: "#6B7280", bg: "#F3F4F6" },
  VERIFIED_BUSINESS:  { label: "Verified Business", color: "#1D4ED8", bg: "#DBEAFE" },
  VERIFIED_FACILITY:  { label: "Verified Facility", color: "#6D28D9", bg: "#EDE9FE" },
  FACTORY_CERTIFIED:  { label: "Certified",         color: "#6B4B10", bg: "#FEF3C7" },
  EXPORT_CERTIFIED:   { label: "Export Ready",      color: "#064E30", bg: "#DCFCE7" },
};

const G = "#008751";
const GD = "#006641";
const GT = "#E8F5EE";
const BORDER = "#E8E8E8";
const TEXT = "#333333";
const MUTED = "#666666";

async function getFactories(category: string): Promise<Factory[]> {
  try {
    const res = await fetch(
      `${API}/factory?category=${encodeURIComponent(category)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    return (await res.json()) as Factory[];
  } catch {
    return [];
  }
}

export function generateStaticParams() {
  return CATEGORY_PAGES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> },
): Promise<Metadata> {
  const { category } = await params;
  const content = getCategoryBySlug(category);
  if (!content) return {};
  return {
    title: content.title,
    description: content.description,
    alternates: { canonical: `/manufacturers/${content.slug}` },
    openGraph: {
      title: `${content.title} | Ekorafon`,
      description: content.description,
      url: `/manufacturers/${content.slug}`,
    },
  };
}

export default async function CategoryPage(
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params;
  const content = getCategoryBySlug(category);
  if (!content) notFound();

  const factories = await getFactories(content.name);
  const otherCategories = CATEGORY_PAGES.filter((c) => c.slug !== content.slug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Manufacturers", item: `${SITE_URL}/factories` },
      { "@type": "ListItem", position: 3, name: content.name, item: `${SITE_URL}/manufacturers/${content.slug}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const itemListJsonLd = factories.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: content.h1,
    numberOfItems: factories.length,
    itemListElement: factories.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/factories/${f.id}`,
      name: f.businessName,
    })),
  } : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}

      <Nav active="factories" />

      <div className="px-6 md:px-10 py-8">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 text-xs" style={{ color: MUTED }}>
            <li><Link href="/" style={{ color: MUTED, textDecoration: "none" }}>Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/factories" style={{ color: MUTED, textDecoration: "none" }}>Manufacturers</Link></li>
            <li aria-hidden="true">/</li>
            <li style={{ color: TEXT, fontWeight: 600 }}>{content.name}</li>
          </ol>
        </nav>

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div style={{ maxWidth: "640px" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: G }}>
              {content.name} &middot; Aba, Abia State
            </p>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: TEXT }}>{content.h1}</h1>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: MUTED }}>{content.intro[0]}</p>
          </div>
          <Link
            href="/auth/register?role=buyer"
            className="px-5 py-2.5 text-xs font-semibold rounded shrink-0 text-center"
            style={{ backgroundColor: G, color: "white", textDecoration: "none" }}
          >
            Post a Free RFQ &rarr;
          </Link>
        </div>

        {/* Factory listings (server-rendered, crawlable) */}
        {factories.length === 0 ? (
          <div className="text-center py-16 rounded border mb-8" style={{ backgroundColor: "white", borderColor: BORDER }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: GT, borderRadius: "4px", margin: "0 auto 12px" }} />
            <p className="font-semibold text-sm" style={{ color: TEXT }}>
              {content.name} manufacturers are joining Ekorafon
            </p>
            <p className="text-xs mt-1 mb-5" style={{ color: MUTED }}>
              Post a free RFQ and we&rsquo;ll route it to verified {content.name.toLowerCase()} factories &mdash; or list your own factory.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/auth/register?role=buyer"
                className="inline-block px-5 py-2.5 text-xs font-semibold rounded"
                style={{ backgroundColor: G, color: "white", textDecoration: "none" }}
              >
                Post a Free RFQ
              </Link>
              <Link
                href="/auth/register?role=supplier"
                className="inline-block px-5 py-2.5 text-xs font-semibold rounded border"
                style={{ borderColor: G, color: G, textDecoration: "none" }}
              >
                List Your Factory
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: MUTED }}>
              {factories.length} verified {content.name.toLowerCase()} manufacturer{factories.length !== 1 ? "s" : ""} in Aba
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {factories.map((f) => {
                const badge = VERIFICATION_BADGE[f.verificationLevel] ?? VERIFICATION_BADGE.UNVERIFIED;
                const isVerified = f.verificationLevel !== "UNVERIFIED";
                return (
                  <Link
                    key={f.id}
                    href={`/factories/${f.id}`}
                    className="block bg-white rounded border hover:shadow-md transition-all overflow-hidden"
                    style={{ borderColor: BORDER, textDecoration: "none" }}
                  >
                    <div className="h-0.5 w-full" style={{ backgroundColor: isVerified ? G : BORDER }} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h2 className="font-bold text-base leading-tight" style={{ color: TEXT }}>{f.businessName}</h2>
                          <p className="text-xs mt-0.5" style={{ color: MUTED }}>{f.lga}, Abia State</p>
                        </div>
                        <span
                          className="rounded font-semibold shrink-0"
                          style={{ backgroundColor: badge.bg, color: badge.color, fontSize: "10px", padding: "3px 7px" }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs mb-4 leading-relaxed line-clamp-2" style={{ color: MUTED }}>
                        {f.description}
                      </p>
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                        <div className="flex items-center gap-4 text-xs" style={{ color: MUTED }}>
                          <span><span className="font-semibold" style={{ color: TEXT }}>MOQ</span> {f.moq.toLocaleString()}</span>
                          <span>{f.teamSize} staff</span>
                          <span>{f.yearsOfOperation} yrs</span>
                          {f.exportReady && <span className="font-semibold" style={{ color: GD }}>Export Ready</span>}
                        </div>
                        {f.user.etrs && f.user.etrs.score > 0 && (
                          <div className="text-right">
                            <span className="text-sm font-black" style={{ color: G }}>{f.user.etrs.score.toFixed(1)}</span>
                            <span className="text-xs ml-1" style={{ color: "#999999" }}>ETRS</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* SEO copy */}
        <section className="rounded border p-6 mb-6" style={{ backgroundColor: "white", borderColor: BORDER, maxWidth: "860px" }}>
          <h2 className="text-base font-extrabold mb-3" style={{ color: TEXT }}>
            Why source {content.name.toLowerCase()} from Aba on Ekorafon
          </h2>
          <p className="text-sm leading-relaxed mb-5" style={{ color: MUTED }}>{content.intro[1]}</p>

          <h2 className="text-base font-extrabold mb-3" style={{ color: TEXT }}>Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {content.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="text-sm font-bold mb-1" style={{ color: TEXT }}>{f.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-links to other categories */}
        <section className="rounded border p-6 mb-6" style={{ backgroundColor: "white", borderColor: BORDER }}>
          <h2 className="text-sm font-extrabold mb-3" style={{ color: TEXT }}>Browse other manufacturing categories in Aba</h2>
          <div className="flex flex-wrap gap-2">
            {otherCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/manufacturers/${c.slug}`}
                className="text-xs px-3 py-1.5 rounded border"
                style={{ borderColor: BORDER, color: GD, backgroundColor: GT, textDecoration: "none", fontWeight: 600 }}
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/factories"
              className="text-xs px-3 py-1.5 rounded border"
              style={{ borderColor: BORDER, color: MUTED, textDecoration: "none", fontWeight: 600 }}
            >
              All Manufacturers &rarr;
            </Link>
          </div>
        </section>

        {/* CTA banner */}
        <section className="rounded p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ backgroundColor: G }}>
          <div>
            <h2 className="text-lg font-black text-white mb-1">
              Sourcing {content.name.toLowerCase()}? Get factory quotes in one request.
            </h2>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
              Post a free RFQ &mdash; verified {content.name.toLowerCase()} manufacturers in Aba respond with wholesale pricing and lead times.
            </p>
          </div>
          <Link
            href="/auth/register?role=buyer"
            className="px-5 py-2.5 text-xs font-bold rounded shrink-0"
            style={{ backgroundColor: "white", color: G, textDecoration: "none" }}
          >
            Post a Free RFQ &rarr;
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
}
