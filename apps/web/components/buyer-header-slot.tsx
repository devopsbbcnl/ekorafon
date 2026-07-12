"use client";

import Link from "next/link";

const C = {
  ochre:  "#C4781A",
  white:  "#FFFFFF",
  border: "#E4E4E4",
  text:   "#1A1A1A",
  muted:  "#6B6B6B",
};

/** The buyer dashboard's <Nav headerSlot> content — identical across every tab/page so the header never changes as you navigate. */
export function BuyerHeaderSlot({ name }: { name?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 w-full flex-wrap">
      <div className="min-w-0">
        <h1 className="text-base font-black tracking-tight truncate" style={{ color: C.text }}>
          {name ? `Welcome back, ${name.split(" ")[0]}` : "Buyer Dashboard"}
        </h1>
        <p className="text-xs mt-0.5 hidden sm:block" style={{ color: C.muted }}>
          Sourcing · Orders · Payments · Suppliers — all in one place
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Link
          href="/factories"
          className="px-4 py-2 text-xs font-bold rounded border transition-colors hover:bg-gray-50"
          style={{ borderColor: C.border, color: C.text, textDecoration: "none", backgroundColor: C.white }}
        >
          Browse Suppliers
        </Link>
        <Link
          href="/dashboard/buyer/rfq/new"
          className="px-4 py-2 text-xs font-bold rounded hover:opacity-90 transition-opacity"
          style={{ backgroundColor: C.ochre, color: "white", textDecoration: "none" }}
        >
          + Post RFQ
        </Link>
      </div>
    </div>
  );
}
