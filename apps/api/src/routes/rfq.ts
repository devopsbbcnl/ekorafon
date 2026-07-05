import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, optionalAuth, requireRole, type AuthRequest } from "../middleware/auth";
import { RFQSchema } from "@ekorafon/shared";
import { emailQuoteAwarded, emailNewRFQPosted } from "../lib/email";

const router = Router();

router.get("/", optionalAuth, async (_req, res) => {
  const rfqs = await prisma.rFQ.findMany({
    where: { status: "OPEN" },
    include: {
      buyer: { select: { name: true, etrs: { select: { score: true } } } },
      _count: { select: { quotes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(rfqs);
});

router.get("/mine", authenticate, requireRole("BUYER"), async (req: AuthRequest, res) => {
  const rfqs = await prisma.rFQ.findMany({
    where: { buyerId: req.user!.id },
    include: { _count: { select: { quotes: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(rfqs);
});

router.get("/:id", optionalAuth, async (req: AuthRequest, res) => {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: req.params.id },
    include: {
      buyer: { select: { name: true, etrs: { select: { score: true } } } },
      quotes: {
        include: {
          supplier: { select: { name: true, factory: { select: { businessName: true, verificationLevel: true } } } },
        },
      },
    },
  });
  if (!rfq) { res.status(404).json({ error: "RFQ not found" }); return; }
  res.json(rfq);
});

router.post("/", authenticate, requireRole("BUYER"), async (req: AuthRequest, res) => {
  const parsed = RFQSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const rfq = await prisma.rFQ.create({
    data:    { ...parsed.data, deadline: new Date(parsed.data.deadline), buyerId: req.user!.id },
    include: { buyer: { select: { name: true } } },
  });

  res.status(201).json(rfq);

  // Fire-and-forget: notify suppliers whose factory categories overlap with this RFQ's category
  (async () => {
    try {
      const matchingFactories = await prisma.factoryProfile.findMany({
        where:   { productCategories: { has: rfq.category } },
        include: { user: { select: { name: true, email: true, suspended: true, emailVerified: true } } },
      });

      const notifications = matchingFactories
        .filter((f) => !f.user.suspended && f.user.emailVerified)
        .map((f) =>
          emailNewRFQPosted({
            supplierEmail: f.user.email,
            supplierName:  f.user.name,
            rfqId:         rfq.id,
            rfqTitle:      rfq.title,
            buyerName:     rfq.buyer.name,
            category:      rfq.category,
            quantity:      rfq.quantity,
            budgetMin:     rfq.budgetMin,
            budgetMax:     rfq.budgetMax,
            deadline:      rfq.deadline,
          }).catch(() => {}),
        );

      await Promise.allSettled(notifications);
      console.log(`[rfq] Notified ${notifications.length} supplier(s) of new RFQ ${rfq.id}`);
    } catch (err) {
      console.error("[rfq] Notification error:", (err as Error).message);
    }
  })();
});

router.patch("/:id/award", authenticate, requireRole("BUYER"), async (req: AuthRequest, res) => {
  const { quoteId } = req.body;
  const rfq = await prisma.rFQ.findUnique({ where: { id: req.params.id } });
  if (!rfq || rfq.buyerId !== req.user!.id) { res.status(404).json({ error: "RFQ not found" }); return; }

  const quote = await prisma.quote.findUnique({
    where:   { id: quoteId },
    include: { supplier: { select: { name: true, email: true } } },
  });

  await prisma.$transaction([
    prisma.rFQ.update({ where: { id: rfq.id }, data: { status: "AWARDED", awardedQuoteId: quoteId } }),
    prisma.quote.update({ where: { id: quoteId }, data: { status: "ACCEPTED" } }),
  ]);

  if (quote) {
    emailQuoteAwarded({
      supplierEmail: quote.supplier.email,
      supplierName:  quote.supplier.name,
      rfqTitle:      rfq.title,
      rfqId:         rfq.id,
      totalPrice:    quote.totalPrice,
    }).catch(() => {});
  }

  res.json({ ok: true });
});

export default router;
