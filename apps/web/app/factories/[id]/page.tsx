"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface Factory {
  id: string;
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
  UNVERIFIED:         { label: "Unverified",         color: "#6B7280", bg: "#F3F4F6" },
  VERIFIED_BUSINESS:  { label: "Verified Business",  color: "#1D4ED8", bg: "#DBEAFE" },
  VERIFIED_FACILITY:  { label: "Verified Facility",  color: "#6D28D9", bg: "#EDE9FE" },
  FACTORY_CERTIFIED:  { label: "Factory Certified",  color: "#C4781A", bg: "#FEF3C7" },
  EXPORT_CERTIFIED:   { label: "Export Certified",   color: "#2D5016", bg: "#DCFCE7" },
};

function ETRSRing({ score }: { score: number }) {
  const pct = Math.min(score / 100, 1);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <div className="flex flex-col items-center">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#F0E4CE" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke="#C4781A" strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1A0F00">
          {score.toFixed(0)}
        </text>
      </svg>
      <span className="text-xs font-bold mt-1" style={{ color: "#C4781A" }}>ETRS</span>
    </div>
  );
}

export default function FactoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = getUser();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get<Factory>(`/factory/${id}`)
      .then(setFactory)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF3E8" }}>
        <div className="text-lg font-semibold" style={{ color: "#C4781A" }}>Loading factory...</div>
      </div>
    );
  }

  if (notFound || !factory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#FAF3E8" }}>
        <div className="text-5xl">🏭</div>
        <p className="font-bold text-xl" style={{ color: "#1A0F00" }}>Factory not found</p>
        <Link href="/factories" style={{ color: "#C4781A" }} className="text-sm hover:underline">← Back to directory</Link>
      </div>
    );
  }

  const badge = VERIFICATION_BADGE[factory.verificationLevel] ?? VERIFICATION_BADGE.UNVERIFIED;
  const etrs = factory.user.etrs;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF3E8" }}>
      <nav style={{ backgroundColor: "#1A0F00" }} className="px-6 md:px-16 py-4 flex items-center justify-between">
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Image src="/logo.png" alt="Ekorafon" width={40} height={40} style={{ objectFit: "contain" }} priority />
        </Link>
        <div className="flex gap-3">
          <Link href="/factories" className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: "rgba(250,243,232,0.7)" }}>
            ← All Factories
          </Link>
          {user ? (
            <Link
              href={`/dashboard/${user.role.toLowerCase()}`}
              className="text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ backgroundColor: "#C4781A", color: "white" }}
            >
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" className="text-sm font-semibold px-4 py-2 rounded-lg border" style={{ borderColor: "#C4781A", color: "#C4781A" }}>
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Hero banner */}
      <div style={{ backgroundColor: "#1A0F00" }} className="px-6 md:px-16 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: badge.bg, color: badge.color }}
              >
                {badge.label}
              </span>
              <h1 className="text-4xl font-black mb-2" style={{ color: "#FAF3E8" }}>{factory.businessName}</h1>
              <p className="text-sm" style={{ color: "rgba(250,243,232,0.6)" }}>
                {factory.lga}, Abia State · {factory.yearsOfOperation} years in operation
              </p>
            </div>
            {etrs && <ETRSRing score={etrs.score} />}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* About */}
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#F0E4CE" }}>
              <h2 className="font-black text-lg mb-3" style={{ color: "#1A0F00" }}>About</h2>
              <p className="leading-relaxed" style={{ color: "rgba(26,15,0,0.7)" }}>{factory.description}</p>
            </div>

            {/* Product categories */}
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#F0E4CE" }}>
              <h2 className="font-black text-lg mb-3" style={{ color: "#1A0F00" }}>Product Categories</h2>
              <div className="flex flex-wrap gap-2">
                {factory.productCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-2 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "#FAF3E8", color: "#C4781A" }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* ETRS breakdown */}
            {etrs && (
              <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#F0E4CE" }}>
                <h2 className="font-black text-lg mb-4" style={{ color: "#1A0F00" }}>Trade Reputation Score</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Orders Completed", value: etrs.ordersCompleted },
                    { label: "Delivery Success", value: `${(etrs.deliverySuccessRate * 100).toFixed(0)}%` },
                    { label: "Average Rating", value: `${etrs.avgRating.toFixed(1)} / 5` },
                    { label: "Disputes", value: etrs.disputeCount },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl p-4" style={{ backgroundColor: "#FAF3E8" }}>
                      <div className="text-xl font-black" style={{ color: "#C4781A" }}>{m.value}</div>
                      <div className="text-xs mt-1" style={{ color: "rgba(26,15,0,0.5)" }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Quick stats */}
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#F0E4CE" }}>
              <h3 className="font-bold mb-4" style={{ color: "#1A0F00" }}>Factory Details</h3>
              <div className="flex flex-col gap-3 text-sm">
                {[
                  { label: "Team Size", value: `${factory.teamSize} staff` },
                  { label: "MOQ", value: `${factory.moq.toLocaleString()} units` },
                  { label: "Location", value: `${factory.lga}, Abia State` },
                  { label: "Address", value: factory.address },
                  { label: "Export Ready", value: factory.exportReady ? "Yes ✓" : "No" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(26,15,0,0.4)" }}>{label}</span>
                    <span style={{ color: "#1A0F00" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact / CTA */}
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#F0E4CE" }}>
              <h3 className="font-bold mb-4" style={{ color: "#1A0F00" }}>Get in Touch</h3>
              <div className="flex flex-col gap-3">
                <a
                  href={`tel:${factory.phone}`}
                  className="block w-full text-center py-3 font-bold rounded-xl text-sm transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#C4781A", color: "white" }}
                >
                  📞 {factory.phone}
                </a>
                {factory.website && (
                  <a
                    href={factory.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-3 font-bold rounded-xl text-sm border transition-opacity hover:opacity-70"
                    style={{ borderColor: "#F0E4CE", color: "#1A0F00" }}
                  >
                    🌐 Visit Website
                  </a>
                )}
                {user?.role === "BUYER" && (
                  <Link
                    href="/dashboard/buyer/rfq/new"
                    className="block w-full text-center py-3 font-bold rounded-xl text-sm border-2 transition-opacity hover:opacity-80"
                    style={{ borderColor: "#C4781A", color: "#C4781A" }}
                  >
                    Post an RFQ
                  </Link>
                )}
                {!user && (
                  <Link
                    href="/auth/register?role=buyer"
                    className="block w-full text-center py-3 font-bold rounded-xl text-sm border-2 transition-opacity hover:opacity-80"
                    style={{ borderColor: "#C4781A", color: "#C4781A" }}
                  >
                    Sign up to Send RFQ
                  </Link>
                )}
              </div>
            </div>

            {/* Member since */}
            <p className="text-xs text-center" style={{ color: "rgba(26,15,0,0.3)" }}>
              Member since {new Date(factory.createdAt).toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
