import Image from "next/image";
import Link from "next/link";
import { CATEGORY_PAGES } from "@/lib/categories";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#1A1A1A" }}>
      <div className="px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-8" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="md:col-span-2">
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 24px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}>
              <Image src="/logo3.png" alt="Ekorafon" width={200} height={100} style={{ objectFit: "contain" }} />
            </div>
            <p style={{ fontSize: "13px", marginTop: "16px", lineHeight: 1.7, color: "rgba(255,255,255,0.4)", maxWidth: "300px" }}>
              Nigeria&rsquo;s B2B trade infrastructure platform for African manufacturers &mdash; built for global scale, starting from Aba, Abia State.
            </p>
          </div>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", marginBottom: "16px" }}>MARKETPLACE</p>
            {([["Manufacturers", "/factories"], ["RFQ Board", "/rfq"], ["Post a Request", "/auth/register?role=buyer"], ["List Your Factory", "/auth/register?role=supplier"]] as [string, string][]).map(([l, h]) => (
              <Link key={l} href={h} style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: "10px" }}>{l}</Link>
            ))}
          </div>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", marginBottom: "16px" }}>CATEGORIES</p>
            {CATEGORY_PAGES.map((c) => (
              <Link key={c.slug} href={`/manufacturers/${c.slug}`} style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: "10px" }}>
                {c.name}
              </Link>
            ))}
          </div>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", marginBottom: "16px" }}>PLATFORM</p>
            {([["About ETRS", "/etrs"], ["Privacy Policy", "/privacy"], ["Terms of Use", "/terms"]] as [string, string][]).map(([l, h]) => (
              <Link key={l} href={h} style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: "10px" }}>{l}</Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3" style={{ paddingTop: "20px" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
            &copy; 2026 Ekorafon Limited &middot; Aba, Abia State, Nigeria
          </span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.15)" }}>
            Powering African trade infrastructure
          </span>
        </div>
      </div>
    </footer>
  );
}
