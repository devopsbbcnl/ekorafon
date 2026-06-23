import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, optionalAuth, requireRole, type AuthRequest } from "../middleware/auth";
import { RFQSchema } from "@ekorafon/shared";

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
    data: { ...parsed.data, deadline: new Date(parsed.data.deadline), buyerId: req.user!.id },
  });
  res.status(201).json(rfq);
});

router.patch("/:id/award", authenticate, requireRole("BUYER"), async (req: AuthRequest, res) => {
  const { quoteId } = req.body;
  const rfq = await prisma.rFQ.findUnique({ where: { id: req.params.id } });
  if (!rfq || rfq.buyerId !== req.user!.id) { res.status(404).json({ error: "RFQ not found" }); return; }

  await prisma.$transaction([
    prisma.rFQ.update({ where: { id: rfq.id }, data: { status: "AWARDED", awardedQuoteId: quoteId } }),
    prisma.quote.update({ where: { id: quoteId }, data: { status: "ACCEPTED" } }),
  ]);
  res.json({ ok: true });
});

export default router;
