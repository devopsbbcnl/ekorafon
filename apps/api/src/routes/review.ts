import { Router, type RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

function h(fn: RequestHandler): RequestHandler {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

const ReviewSchema = z.object({
  orderId: z.string(),
  rating:  z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// Buyer: submit a review for a delivered order
router.post("/", authenticate, requireRole("BUYER"), h(async (req: AuthRequest, res) => {
  const parsed = ReviewSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { orderId, rating, comment } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { review: true },
  });

  if (!order || order.buyerId !== req.user!.id) {
    res.status(404).json({ error: "Order not found" }); return;
  }
  if (order.status !== "DELIVERED") {
    res.status(400).json({ error: "Can only review delivered orders" }); return;
  }
  if (order.review) {
    res.status(400).json({ error: "Order already reviewed" }); return;
  }

  const review = await prisma.review.create({
    data: {
      orderId,
      buyerId:    req.user!.id,
      supplierId: order.supplierId,
      rating,
      comment,
    },
  });

  // Recompute avgRating in ETRS
  const allReviews = await prisma.review.findMany({
    where: { supplierId: order.supplierId },
  });
  const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;

  await prisma.eTRS.upsert({
    where:  { userId: order.supplierId },
    create: { userId: order.supplierId, avgRating },
    update: { avgRating },
  });

  res.status(201).json(review);
}));

// Public: get reviews for a supplier/factory
router.get("/supplier/:supplierId", h(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where:   { supplierId: req.params.supplierId },
    include: { buyer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  res.json(reviews);
}));

// Buyer: check if order has been reviewed
router.get("/order/:orderId", authenticate, h(async (req: AuthRequest, res) => {
  const review = await prisma.review.findUnique({
    where: { orderId: req.params.orderId },
  });
  res.json(review ?? null);
}));

export default router;
