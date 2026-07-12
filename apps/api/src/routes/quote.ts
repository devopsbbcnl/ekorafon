import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth";
import { requireVerifiedFactory } from "../middleware/verifiedFactory";
import { QuoteSchema } from "../shared";
import { emailQuoteReceived } from "../lib/email";

const router = Router();

router.post("/", authenticate, requireRole("SUPPLIER"), requireVerifiedFactory, async (req: AuthRequest, res) => {
  const parsed = QuoteSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const rfq = await prisma.rFQ.findUnique({
    where:   { id: parsed.data.rfqId },
    include: { buyer: { select: { name: true, email: true } } },
  });
  if (!rfq || rfq.status !== "OPEN") { res.status(400).json({ error: "RFQ is not open" }); return; }

  const supplier = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { name: true } });

  const quote = await prisma.quote.create({
    data: {
      ...parsed.data,
      validUntil: new Date(parsed.data.validUntil),
      supplierId: req.user!.id,
    },
  });

  // Notify buyer
  emailQuoteReceived({
    buyerEmail:   rfq.buyer.email,
    buyerName:    rfq.buyer.name,
    rfqTitle:     rfq.title,
    rfqId:        rfq.id,
    supplierName: supplier?.name ?? "A supplier",
    totalPrice:   parsed.data.totalPrice,
  }).catch(() => {});

  res.status(201).json(quote);
});

router.get("/mine", authenticate, requireRole("SUPPLIER"), async (req: AuthRequest, res) => {
  const quotes = await prisma.quote.findMany({
    where:   { supplierId: req.user!.id },
    include: { rfq: { select: { title: true, category: true, status: true, deadline: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(quotes);
});

router.delete("/:id", authenticate, requireRole("SUPPLIER"), async (req: AuthRequest, res) => {
  const quote = await prisma.quote.findUnique({ where: { id: req.params.id } });
  if (!quote || quote.supplierId !== req.user!.id) { res.status(404).json({ error: "Quote not found" }); return; }
  if (quote.status !== "PENDING") { res.status(400).json({ error: "Cannot withdraw a non-pending quote" }); return; }

  await prisma.quote.update({ where: { id: req.params.id }, data: { status: "WITHDRAWN" } });
  res.json({ ok: true });
});

export default router;
