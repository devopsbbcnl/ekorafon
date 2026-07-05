import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM || "Ekorafon <noreply@ekorafon.com>";
const BASE   = process.env.WEB_URL    || "http://localhost:3000";

function layout(body: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#F0F2F0;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;}
    .w{max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #E8E8E8;}
    .hd{background:#006641;padding:18px 28px;}
    .hd img{height:38px;display:block;}
    .b{padding:32px 28px;color:#333;font-size:14px;line-height:1.75;}
    .b h2{margin:0 0 14px;font-size:17px;color:#111;font-weight:700;}
    .b p{margin:0 0 12px;color:#444;}
    .cta{display:inline-block;margin-top:20px;padding:13px 26px;background:#008751;color:#fff;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;}
    .pill{display:inline-block;background:#E8F5EE;color:#006641;font-weight:700;padding:6px 14px;border-radius:4px;font-size:13px;margin:4px 2px;}
    .pill-warn{display:inline-block;background:#FEF3C7;color:#92400E;font-weight:700;padding:6px 14px;border-radius:4px;font-size:13px;margin:4px 2px;}
    .pill-red{display:inline-block;background:#FEE2E2;color:#B91C1C;font-weight:700;padding:6px 14px;border-radius:4px;font-size:13px;margin:4px 2px;}
    .note{background:#F5F5F5;border-left:3px solid #008751;padding:12px 14px;border-radius:0 4px 4px 0;font-size:13px;color:#555;margin:14px 0;}
    .fd{padding:16px 28px;background:#F9F9F9;border-top:1px solid #E8E8E8;font-size:11px;color:#999;text-align:center;}
    hr{border:none;border-top:1px solid #E8E8E8;margin:20px 0;}
  </style></head><body>
  <div class="w">
    <div class="hd"><img src="${BASE}/logo-full.png" alt="Ekorafon"/></div>
    <div class="b">${body}</div>
    <div class="fd">Ekorafon &middot; African Trade Infrastructure &middot; Aba, Abia State<br/>
    &copy; ${new Date().getFullYear()} Bubble Barrel Commerce Limited. All rights reserved.<br/>
    If you didn&rsquo;t request this email, you can safely ignore it.</div>
  </div></body></html>`;
}

async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email:dev] To: ${to} | Subject: ${subject}`);
    return;
  }
  const { error } = await resend.emails.send({ from: FROM, to, subject, html: layout(html) });
  if (error) console.error("[email] Resend error:", error.message);
}

const fmt = (n: number) => `&#8358;${n.toLocaleString("en-NG")}`;

// ── Auth emails ───────────────────────────────────────────────────────────────

export async function emailVerifyAddress(opts: {
  to: string; name: string; token: string;
}) {
  const url = `${BASE}/auth/verify-email?token=${opts.token}`;
  await send(
    opts.to,
    "Verify your Ekorafon email address",
    `<h2>Welcome to Ekorafon, ${opts.name}!</h2>
    <p>Please verify your email address to activate your account and start trading on Africa&rsquo;s factory marketplace.</p>
    <a class="cta" href="${url}">Verify Email Address &rarr;</a>
    <p style="margin-top:20px;font-size:12px;color:#999;">This link expires in <strong>1 hour</strong>. If you didn&rsquo;t create an account, ignore this email.</p>`,
  );
}

export async function emailWelcomeBuyer(opts: { to: string; name: string }) {
  await send(
    opts.to,
    "Your Ekorafon buyer account is ready",
    `<h2>You&rsquo;re in, ${opts.name}! &#x1F389;</h2>
    <p>Your account is verified. You can now browse verified factories, request quotes, and place orders directly on Ekorafon.</p>
    <hr/>
    <p><strong>Get started:</strong></p>
    <p>&#x1F3ED; Browse factories &amp; products<br/>&#x1F4CB; Post an RFQ to receive competitive quotes<br/>&#x1F512; All payments held in escrow until you confirm delivery</p>
    <a class="cta" href="${BASE}/factories">Browse Factories &rarr;</a>`,
  );
}

export async function emailWelcomeSupplier(opts: { to: string; name: string }) {
  await send(
    opts.to,
    "Your Ekorafon supplier account is ready",
    `<h2>Welcome aboard, ${opts.name}! &#x1F3ED;</h2>
    <p>Your account is verified. Set up your factory profile to start receiving orders and RFQ quotes from buyers across Africa.</p>
    <hr/>
    <p><strong>Next steps:</strong></p>
    <p>1. Complete your factory profile<br/>2. Add your products &amp; pricing<br/>3. Apply for verification to build buyer trust</p>
    <a class="cta" href="${BASE}/dashboard/supplier">Set Up Factory Profile &rarr;</a>`,
  );
}

export async function emailPasswordReset(opts: { to: string; name: string; token: string }) {
  const url = `${BASE}/auth/reset-password?token=${opts.token}`;
  await send(
    opts.to,
    "Reset your Ekorafon password",
    `<h2>Password reset requested</h2>
    <p>Hi ${opts.name}, we received a request to reset your Ekorafon password.</p>
    <a class="cta" href="${url}">Reset Password &rarr;</a>
    <p style="margin-top:20px;font-size:12px;color:#999;">This link expires in <strong>1 hour</strong>. If you didn&rsquo;t request a password reset, your account is safe &mdash; ignore this email.</p>`,
  );
}

// ── Order emails ──────────────────────────────────────────────────────────────

export async function emailOrderPlaced(opts: {
  supplierEmail: string; supplierName: string;
  buyerName: string; orderId: string;
  totalAmount: number; itemCount: number;
}) {
  await send(
    opts.supplierEmail,
    `New order received — ${fmt(opts.totalAmount)}`,
    `<h2>You have a new order!</h2>
    <p><strong>${opts.buyerName}</strong> has placed a direct order with your factory.</p>
    <span class="pill">${fmt(opts.totalAmount)}</span>
    <span class="pill">${opts.itemCount} item${opts.itemCount > 1 ? "s" : ""}</span>
    <hr/>
    <p>Log in to confirm within 24 hours. Unconfirmed orders may be cancelled.</p>
    <a class="cta" href="${BASE}/dashboard/supplier">Confirm Order &rarr;</a>`,
  );
}

export async function emailOrderConfirmed(opts: {
  buyerEmail: string; buyerName: string;
  supplierBusinessName: string; orderId: string; totalAmount: number;
}) {
  await send(
    opts.buyerEmail,
    `Order confirmed — ${opts.supplierBusinessName}`,
    `<h2>Order Confirmed &#x2705;</h2>
    <p>Hi ${opts.buyerName}, <strong>${opts.supplierBusinessName}</strong> has confirmed your order and will begin production shortly.</p>
    <span class="pill">${fmt(opts.totalAmount)}</span>
    <hr/>
    <p>Your payment stays in escrow until you confirm delivery.</p>
    <a class="cta" href="${BASE}/dashboard/buyer/orders/${opts.orderId}">Track Order &rarr;</a>`,
  );
}

export async function emailOrderShipped(opts: {
  buyerEmail: string; buyerName: string;
  supplierBusinessName: string; orderId: string;
}) {
  await send(
    opts.buyerEmail,
    `Your order has been shipped — ${opts.supplierBusinessName}`,
    `<h2>Your Order Is On Its Way &#x1F69A;</h2>
    <p>Hi ${opts.buyerName}, <strong>${opts.supplierBusinessName}</strong> has dispatched your order.</p>
    <hr/>
    <p>Once you receive and inspect the goods, confirm delivery to release payment to the supplier.</p>
    <a class="cta" href="${BASE}/dashboard/buyer/orders/${opts.orderId}">View Order &rarr;</a>`,
  );
}

export async function emailOrderDelivered(opts: {
  supplierEmail: string; supplierName: string;
  buyerName: string; totalAmount: number;
}) {
  await send(
    opts.supplierEmail,
    `Payment released — ${opts.buyerName} confirmed delivery`,
    `<h2>Payment Released &#x1F4B0;</h2>
    <p>Hi ${opts.supplierName}, <strong>${opts.buyerName}</strong> has confirmed satisfactory delivery.</p>
    <span class="pill">${fmt(opts.totalAmount)} released from escrow</span>
    <hr/>
    <p>Your ETRS score has been updated. Keep up the great work!</p>
    <a class="cta" href="${BASE}/dashboard/supplier">View Earnings &rarr;</a>`,
  );
}

export async function emailOrderDisputed(opts: {
  supplierEmail: string; supplierName: string;
  buyerName: string; orderId: string; totalAmount: number;
}) {
  await send(
    opts.supplierEmail,
    `Order dispute raised — action required`,
    `<h2>&#x26A0;&#xFE0F; A dispute has been raised</h2>
    <p>Hi ${opts.supplierName}, <strong>${opts.buyerName}</strong> has raised a dispute on their order worth <strong>${fmt(opts.totalAmount)}</strong>.</p>
    <p>Ekorafon will review the dispute. Payment remains in escrow until resolved.</p>
    <div class="note">Please log in and ensure all shipping documentation and communication records are available for review.</div>
    <a class="cta" href="${BASE}/dashboard/supplier">View Order &rarr;</a>`,
  );
}

export async function emailOrderCancelled(opts: {
  buyerEmail: string; buyerName: string;
  supplierBusinessName: string; orderId: string;
}) {
  await send(
    opts.buyerEmail,
    `Order cancelled — ${opts.supplierBusinessName}`,
    `<h2>Order Cancelled</h2>
    <p>Hi ${opts.buyerName}, your order with <strong>${opts.supplierBusinessName}</strong> has been cancelled.</p>
    <p>If payment was made, a refund will be processed within 5–10 business days.</p>
    <a class="cta" href="${BASE}/factories">Browse Other Suppliers &rarr;</a>`,
  );
}

// ── Payment / Escrow emails ───────────────────────────────────────────────────

export async function emailPaymentConfirmed(opts: {
  buyerEmail: string; buyerName: string;
  orderId: string; totalAmount: number; supplierBusinessName: string;
}) {
  await send(
    opts.buyerEmail,
    "Payment received — your funds are in escrow",
    `<h2>Payment Confirmed &#x1F512;</h2>
    <p>Hi ${opts.buyerName}, we've received your payment for your order with <strong>${opts.supplierBusinessName}</strong>.</p>
    <span class="pill">${fmt(opts.totalAmount)} held in escrow</span>
    <hr/>
    <p>Your funds are held securely. They will only be released to the supplier once you confirm delivery.</p>
    <a class="cta" href="${BASE}/dashboard/buyer/orders/${opts.orderId}">Track Order &rarr;</a>`,
  );
}

export async function emailEscrowReleased(opts: {
  supplierEmail: string; supplierName: string;
  buyerName: string; totalAmount: number; orderId: string;
}) {
  await send(
    opts.supplierEmail,
    `Escrow released — ${fmt(opts.totalAmount)} on its way to you`,
    `<h2>Escrow Released &#x1F4B8;</h2>
    <p>Hi ${opts.supplierName}, the escrow for your order from <strong>${opts.buyerName}</strong> has been released by Ekorafon.</p>
    <span class="pill">${fmt(opts.totalAmount)}</span>
    <hr/>
    <p>Funds will be processed to your registered bank account. Please allow 1–3 business days for settlement.</p>
    <a class="cta" href="${BASE}/dashboard/supplier">View Dashboard &rarr;</a>`,
  );
}

export async function emailEscrowRefunded(opts: {
  buyerEmail: string; buyerName: string;
  totalAmount: number; orderId: string;
}) {
  await send(
    opts.buyerEmail,
    `Refund processed — ${fmt(opts.totalAmount)}`,
    `<h2>Refund Processed &#x21A9;&#xFE0F;</h2>
    <p>Hi ${opts.buyerName}, your escrow payment has been refunded by Ekorafon.</p>
    <span class="pill-warn">${fmt(opts.totalAmount)} refunded</span>
    <hr/>
    <p>Please allow 5–10 business days for the refund to appear in your account, depending on your bank.</p>`,
  );
}

// ── RFQ emails ────────────────────────────────────────────────────────────────

export async function emailNewRFQPosted(opts: {
  supplierEmail: string; supplierName: string;
  rfqId: string; rfqTitle: string; buyerName: string;
  category: string; quantity: number; budgetMin: number; budgetMax: number;
  deadline: Date;
}) {
  const deadline = opts.deadline.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  await send(
    opts.supplierEmail,
    `New RFQ matching your factory — ${opts.rfqTitle}`,
    `<h2>A buyer is looking for what you make &#x1F4E3;</h2>
    <p>Hi ${opts.supplierName}, a new Request for Quote matching your factory&rsquo;s product categories has just been posted.</p>
    <span class="pill">${opts.category}</span>
    <span class="pill">${opts.quantity.toLocaleString()} units</span>
    <hr/>
    <p><strong>RFQ:</strong> ${opts.rfqTitle}</p>
    <p><strong>Buyer:</strong> ${opts.buyerName}</p>
    <p><strong>Budget:</strong> ${fmt(opts.budgetMin)} &ndash; ${fmt(opts.budgetMax)}</p>
    <p><strong>Deadline:</strong> ${deadline}</p>
    <div class="note">Submit your quote before the deadline to compete for this contract.</div>
    <a class="cta" href="${BASE}/rfq/${opts.rfqId}">View &amp; Quote &rarr;</a>`,
  );
}

// ── Quote emails ──────────────────────────────────────────────────────────────

export async function emailQuoteReceived(opts: {
  buyerEmail: string; buyerName: string;
  rfqTitle: string; rfqId: string;
  supplierName: string; totalPrice: number;
}) {
  await send(
    opts.buyerEmail,
    `New quote on your RFQ — ${opts.rfqTitle}`,
    `<h2>You Have a New Quote</h2>
    <p>Hi ${opts.buyerName}, <strong>${opts.supplierName}</strong> submitted a quote on: <em>${opts.rfqTitle}</em></p>
    <span class="pill">${fmt(opts.totalPrice)}</span>
    <hr/>
    <p>Compare all quotes and award the contract to your preferred supplier.</p>
    <a class="cta" href="${BASE}/rfq/${opts.rfqId}">Review Quotes &rarr;</a>`,
  );
}

export async function emailQuoteAwarded(opts: {
  supplierEmail: string; supplierName: string;
  rfqTitle: string; rfqId: string; totalPrice: number;
}) {
  await send(
    opts.supplierEmail,
    `Your quote was awarded — ${opts.rfqTitle}`,
    `<h2>Congratulations! Your Quote Was Awarded &#x1F3C6;</h2>
    <p>Hi ${opts.supplierName}, the buyer has awarded you the contract for <em>${opts.rfqTitle}</em>.</p>
    <span class="pill">${fmt(opts.totalPrice)}</span>
    <hr/>
    <p>An order has been created. Confirm it promptly to start production.</p>
    <a class="cta" href="${BASE}/dashboard/supplier">View Dashboard &rarr;</a>`,
  );
}

// ── Verification emails ───────────────────────────────────────────────────────

export async function emailVerificationRequestReceived(opts: {
  supplierEmail: string; supplierName: string; targetLevel: string;
}) {
  const label = opts.targetLevel.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  await send(
    opts.supplierEmail,
    `Verification request received — ${label}`,
    `<h2>We received your verification request</h2>
    <p>Hi ${opts.supplierName}, your request for <strong>${label}</strong> status is under review.</p>
    <div class="note">Our team typically reviews requests within 2–5 business days. You&rsquo;ll receive an email with the outcome.</div>
    <a class="cta" href="${BASE}/dashboard/supplier">View Dashboard &rarr;</a>`,
  );
}

export async function emailVerificationUpdate(opts: {
  supplierEmail: string; supplierName: string;
  approved: boolean; targetLevel: string; adminNote?: string;
}) {
  const label = opts.targetLevel.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  await send(
    opts.supplierEmail,
    opts.approved ? `Verification approved — ${label}` : `Verification not approved — ${label}`,
    `<h2>${opts.approved ? "&#x2705; Verification Approved!" : "&#x274C; Verification Not Approved"}</h2>
    <p>Hi ${opts.supplierName}, your request for <strong>${label}</strong> status has been <strong>${opts.approved ? "approved" : "reviewed"}</strong>.</p>
    ${opts.adminNote ? `<div class="note"><strong>Note from Ekorafon:</strong> ${opts.adminNote}</div>` : ""}
    ${opts.approved ? `<p>Your factory profile now displays the <strong>${label}</strong> badge, helping buyers trust your business.</p>` : `<p>You may reapply once the requirements are met. Contact support if you have questions.</p>`}
    <a class="cta" href="${BASE}/dashboard/supplier">View Dashboard &rarr;</a>`,
  );
}

export async function emailVerificationLevelChanged(opts: {
  supplierEmail: string; supplierName: string;
  newLevel: string; previousLevel: string;
}) {
  const newLabel  = opts.newLevel.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  const prevLabel = opts.previousLevel.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  const upgraded  = ["UNVERIFIED","VERIFIED_BUSINESS","VERIFIED_FACILITY","FACTORY_CERTIFIED","EXPORT_CERTIFIED"].indexOf(opts.newLevel) >
                    ["UNVERIFIED","VERIFIED_BUSINESS","VERIFIED_FACILITY","FACTORY_CERTIFIED","EXPORT_CERTIFIED"].indexOf(opts.previousLevel);
  await send(
    opts.supplierEmail,
    `Your verification level has been updated — ${newLabel}`,
    `<h2>Verification Level Updated ${upgraded ? "&#x2B06;&#xFE0F;" : "&#x2B07;&#xFE0F;"}</h2>
    <p>Hi ${opts.supplierName}, your factory verification level has been updated by Ekorafon.</p>
    <span class="pill-warn">${prevLabel}</span> &rarr; <span class="pill">${newLabel}</span>
    <hr/>
    <p>${upgraded ? "Your profile now shows a higher trust level to buyers." : "If you believe this is an error, please contact Ekorafon support."}</p>
    <a class="cta" href="${BASE}/dashboard/supplier">View Profile &rarr;</a>`,
  );
}
