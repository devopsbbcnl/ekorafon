import { Router, type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth";
import { emailPaymentConfirmed } from "../lib/email";

const router = Router();

function h(fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>) {
  return (req: AuthRequest, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

// ── Initialize payment ────────────────────────────────────────────────────────

router.post("/initialize/:orderId", authenticate, requireRole("BUYER"), h(async (req, res) => {
  const order = await prisma.order.findUnique({
    where:   { id: req.params.orderId },
    include: { buyer: true, payment: true },
  });

  if (!order || order.buyerId !== req.user!.id) {
    res.status(404).json({ error: "Order not found" }); return;
  }
  if (order.payment?.status === "SUCCESS") {
    res.status(400).json({ error: "Order already paid" }); return;
  }

  const amountKobo = Math.round(order.totalAmount * 100);
  const reference  = `EKO-${order.id}-${Date.now()}`;

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email:        order.buyer.email,
      amount:       amountKobo,
      reference,
      callback_url: `${process.env.WEB_URL || "http://localhost:3000"}/payment/verify?reference=${reference}`,
      metadata: {
        orderId:    order.id,
        buyerId:    order.buyerId,
        supplierId: order.supplierId,
        custom_fields: [
          { display_name: "Order ID", variable_name: "order_id", value: order.id },
          { display_name: "Platform", variable_name: "platform", value: "Ekorafon" },
        ],
      },
    }),
  });

  const data = await response.json() as {
    status: boolean;
    data?: { authorization_url: string; reference: string };
  };

  if (!data.status || !data.data) {
    res.status(502).json({ error: "Paystack initialization failed" }); return;
  }

  await prisma.payment.upsert({
    where:  { orderId: order.id },
    create: { orderId: order.id, paystackRef: reference, amount: order.totalAmount },
    update: { paystackRef: reference, status: "PENDING" },
  });

  res.json({ paymentUrl: data.data.authorization_url, reference });
}));

// ── Verify payment (redirect callback) ───────────────────────────────────────

router.get("/verify/:reference", h(async (req: AuthRequest, res) => {
  const { reference } = req.params;

  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  const data = await verifyRes.json() as {
    status: boolean;
    data?: { status: string; amount: number; metadata: { orderId: string } };
  };

  if (!data.status || !data.data) {
    res.status(502).json({ error: "Verification failed" }); return;
  }

  const payment = await prisma.payment.findUnique({ where: { paystackRef: reference } });
  if (!payment) { res.status(404).json({ error: "Payment record not found" }); return; }

  const newStatus = data.data.status === "success" ? "SUCCESS" : "FAILED";

  await prisma.payment.update({
    where: { paystackRef: reference },
    data:  { status: newStatus, paystackData: data.data as object },
  });

  res.json({ status: newStatus, orderId: payment.orderId });
}));

// ── Paystack webhook ──────────────────────────────────────────────────────────
// Must be registered with express.raw() so raw body is preserved for HMAC verification.
// In index.ts this route is mounted BEFORE express.json() to avoid body consumption.

router.post(
  "/webhook",
  (req: Request, _res: Response, next: NextFunction) => {
    // If body was already parsed (shouldn't happen when mounted before json()),
    // fall through; signature check will reject invalid requests anyway.
    if (Buffer.isBuffer(req.body)) { next(); return; }
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => { (req as Request & { rawBody: Buffer }).rawBody = Buffer.concat(chunks); next(); });
  },
  async (req: Request & { rawBody?: Buffer }, res: Response, next: NextFunction) => {
    try {
      const sig      = req.headers["x-paystack-signature"] as string | undefined;
      const rawBody  = (req as Request & { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body));
      const hash     = crypto.createHmac("sha512", PAYSTACK_SECRET).update(rawBody).digest("hex");

      if (!sig || hash !== sig) {
        res.status(400).json({ error: "Invalid signature" }); return;
      }

      const event = JSON.parse(rawBody.toString()) as {
        event: string;
        data: {
          reference: string;
          status: string;
          metadata: { orderId: string; buyerId: string; supplierId: string };
        };
      };

      if (event.event === "charge.success") {
        const { reference, metadata } = event.data;

        await prisma.payment.update({
          where: { paystackRef: reference },
          data:  { status: "SUCCESS" },
        });

        // Email buyer to confirm payment is in escrow
        const order = await prisma.order.findUnique({
          where:   { id: metadata.orderId },
          include: {
            buyer:    { select: { name: true, email: true } },
            supplier: { select: { factory: { select: { businessName: true } }, name: true } },
            payment:  { select: { amount: true } },
          },
        });

        if (order) {
          emailPaymentConfirmed({
            buyerEmail:          order.buyer.email,
            buyerName:           order.buyer.name,
            orderId:             order.id,
            totalAmount:         order.payment?.amount ?? order.totalAmount,
            supplierBusinessName: order.supplier.factory?.businessName ?? order.supplier.name,
          }).catch(() => {});
        }

        console.log(`[webhook] charge.success — order ${metadata.orderId}`);
      }

      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
