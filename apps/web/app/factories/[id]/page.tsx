"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/nav";
import Footer from "@/components/footer";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface Factory {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  address: string;
  lga: string;
  teamSize: number;
  yearsOfOperation: number;
  productCategories: string[];
  moq: number;
  exportReady: boolean;
  phone: string;
  website?: string;
  verificationLevel: string;
  photos: string[];
  createdAt: string;
  user: {
    name: string;
    etrs: {
      score: number;
      ordersCompleted: number;
      deliverySuccessRate: number;
      avgRating: number;
      disputeCount: number;
    } | null;
  };
}

const VERIFICATION_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  UNVERIFIED:        { label: "Unverified",        color: "#6B7280", bg: "#F3F4F6" },
  VERIFIED_BUSINESS: { label: "Verified Business", color: "#1D4ED8", bg: "#DBEAFE" },
  VERIFIED_FACILITY: { label: "Verified Facility", color: "#6D28D9", bg: "#EDE9FE" },
  FACTORY_CERTIFIED: { label: "Factory Certified", color: "#6B4B10", bg: "#FEF3C7" },
  EXPORT_CERTIFIED:  { label: "Export Certified",  color: "#064E30", bg: "#DCFCE7" },
};

const G      = "#008751";
const GT     = "#E8F5EE";
const BORDER = "#E8E8E8";
const TEXT   = "#333333";
const MUTED  = "#666666";
const LIGHT  = "#999999";

function ETRSRing({ score }: { score: number }) {
  const pct = Math.min(score / 100, 1);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke={BORDER} strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={G} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="bold" fill={TEXT}>
          {score.toFixed(0)}
        </text>
      </svg>
      <span style={{ fontSize: "10px", fontWeight: 800, marginTop: "4px", color: G, letterSpacing: "0.06em" }}>ETRS</span>
    </div>
  );
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  buyer: { name: string };
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span style={{ color: G, fontSize: "14px" }}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default function FactoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = getUser();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  void router;

  useEffect(() => {
    api.get<Factory>(`/factory/${id}`)
      .then((f) => {
        setFactory(f);
        api.get<Review[]>(`/review/supplier/${f.userId}`)
          .then(setReviews).catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Nav active="factories" />
        <div className="flex items-center justify-center h-64">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: G, animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !factory) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Nav active="factories" />
        <div className="flex flex-col items-center justify-center py-20">
          <div style={{ width: "40px", height: "40px", backgroundColor: GT, borderRadius: "4px", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontWeight: 900, fontSize: "18px", color: G }}>?</span>
          </div>
          <p style={{ fontWeight: 600, fontSize: "14px", color: TEXT, marginBottom: "8px" }}>Factory not found</p>
          <Link href="/factories" style={{ color: G, textDecoration: "none", fontSize: "13px" }}>
            ← Back to directory
          </Link>
        </div>
      </div>
    );
  }

  const badge = VERIFICATION_BADGE[factory.verificationLevel] ?? VERIFICATION_BADGE.UNVERIFIED;
  const etrs = factory.user.etrs;
  const isVerified = factory.verificationLevel !== "UNVERIFIED";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Nav active="factories" />

      {/* Factory page header */}
      <div style={{ backgroundColor: "white", borderBottom: `1px solid ${BORDER}` }}>
        <div className="px-4 md:px-6 py-5">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <Link href="/factories" style={{ fontSize: "12px", color: MUTED, textDecoration: "none" }}>All Manufacturers</Link>
                <span style={{ color: BORDER, fontSize: "12px" }}>/</span>
                <span style={{ fontSize: "12px", color: TEXT }}>{factory.businessName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: TEXT }}>{factory.businessName}</h1>
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: MUTED, marginTop: "4px" }}>
                {factory.lga}, Abia State · {factory.yearsOfOperation} years in operation
              </p>
            </div>
            {etrs && (
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <ETRSRing score={etrs.score} />
                {isVerified && (
                  <div style={{ width: "2px", height: "80px", backgroundColor: G, borderRadius: "2px" }} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-5">
        <div className="grid md:grid-cols-3 gap-5">

          {/* Main content */}
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* About */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "14px", color: TEXT, marginBottom: "10px" }}>About</h2>
              <p style={{ fontSize: "13px", lineHeight: 1.65, color: MUTED }}>{factory.description}</p>
            </div>

            {/* Product categories */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "14px", color: TEXT, marginBottom: "10px" }}>Product Categories</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {factory.productCategories.map((cat) => (
                  <span
                    key={cat}
                    style={{ padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: 600, backgroundColor: GT, color: "#006641" }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* ETRS breakdown */}
            {etrs && (
              <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px" }}>
                <h2 style={{ fontWeight: 700, fontSize: "14px", color: TEXT, marginBottom: "14px" }}>Trade Reputation Score</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Orders Completed", value: etrs.ordersCompleted },
                    { label: "Delivery Success", value: `${(etrs.deliverySuccessRate * 100).toFixed(0)}%` },
                    { label: "Average Rating", value: `${etrs.avgRating.toFixed(1)} / 5` },
                    { label: "Disputes", value: etrs.disputeCount },
                  ].map((m) => (
                    <div key={m.label} style={{ padding: "12px", backgroundColor: "#F5F5F5", borderRadius: "4px" }}>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: G, lineHeight: 1 }}>{m.value}</div>
                      <div style={{ fontSize: "11px", marginTop: "4px", color: LIGHT }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buyer Reviews */}
            {reviews.length > 0 && (
              <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "20px" }}>
                <h2 style={{ fontWeight: 700, fontSize: "14px", color: TEXT, marginBottom: "14px" }}>
                  Buyer Reviews ({reviews.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {reviews.map((r) => (
                    <div key={r.id} style={{ padding: "12px 14px", backgroundColor: "#F5F5F5", borderRadius: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: TEXT }}>{r.buyer.name}</span>
                        <StarDisplay rating={r.rating} />
                      </div>
                      {r.comment && (
                        <p style={{ fontSize: "12px", fontStyle: "italic", marginTop: "4px", color: MUTED }}>&ldquo;{r.comment}&rdquo;</p>
                      )}
                      <p style={{ fontSize: "11px", marginTop: "6px", color: LIGHT }}>
                        {new Date(r.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Quick stats */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
              <h3 style={{ fontWeight: 700, fontSize: "13px", color: TEXT, marginBottom: "14px" }}>Factory Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Team Size", value: `${factory.teamSize} staff` },
                  { label: "MOQ", value: `${factory.moq.toLocaleString()} units` },
                  { label: "Location", value: `${factory.lga}, Abia State` },
                  { label: "Address", value: factory.address },
                  { label: "Export Ready", value: factory.exportReady ? "Yes" : "No" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <span style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: LIGHT, marginBottom: "2px" }}>{label}</span>
                    <span style={{ fontSize: "12px", color: TEXT }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact / CTA */}
            <div style={{ backgroundColor: "white", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "18px" }}>
              <h3 style={{ fontWeight: 700, fontSize: "13px", color: TEXT, marginBottom: "14px" }}>Get in Touch</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a
                  href={`tel:${factory.phone}`}
                  style={{ display: "block", width: "100%", textAlign: "center", padding: "9px", fontWeight: 700, borderRadius: "4px", fontSize: "13px", backgroundColor: G, color: "white", textDecoration: "none" }}
                >
                  {factory.phone}
                </a>
                {factory.website && (
                  <a
                    href={factory.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", width: "100%", textAlign: "center", padding: "9px", fontWeight: 600, borderRadius: "4px", fontSize: "13px", border: `1px solid ${BORDER}`, color: TEXT, textDecoration: "none" }}
                  >
                    Visit Website
                  </a>
                )}
                {user?.role === "BUYER" && (
                  <Link
                    href="/dashboard/buyer/rfq/new"
                    style={{ display: "block", width: "100%", textAlign: "center", padding: "9px", fontWeight: 700, borderRadius: "4px", fontSize: "13px", border: `1px solid ${G}`, color: G, textDecoration: "none" }}
                  >
                    Post an RFQ
                  </Link>
                )}
                {!user && (
                  <Link
                    href="/auth/register?role=buyer"
                    style={{ display: "block", width: "100%", textAlign: "center", padding: "9px", fontWeight: 700, borderRadius: "4px", fontSize: "13px", border: `1px solid ${G}`, color: G, textDecoration: "none" }}
                  >
                    Sign up to Send RFQ
                  </Link>
                )}
              </div>
            </div>

            {/* Member since */}
            <p style={{ fontSize: "11px", textAlign: "center", color: LIGHT }}>
              Member since {new Date(factory.createdAt).toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
