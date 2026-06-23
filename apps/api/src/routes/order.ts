import { Router, type RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth";
import { OrderSchema } from "@ekorafon/shared";

const router = Router();

// Wrap async handlers so Express 4 gets errors via next() instead of hanging
function h(fn: RequestHandler): RequestHandler {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Buyer: list my orders (direct + RFQ-sourced, unified)
router.get("/mine", authenticate, requireRole("BUYER"), h(async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { buyerId: req.user!.id },
    include: {
      supplier: { select: { name: true, factory: { select: { businessName: true, verificationLevel: true } } } },
      items: {
        include: {
          product: { select: { name: true, unit: true, images: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
}));

// Supplier: list incoming orders
router.get("/incoming", authenticate, requireRole("SUPPLIER"), h(async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { supplierId: req.user!.id },
    include: {
      buyer: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true, unit: true, images: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
}));

// Buyer: get one order
router.get("/:id", authenticate, h(async (req: AuthRequest, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      buyer: { select: { name: true, email: true } },
      supplier: { select: { name: true, factory: { select: { businessName: true, phone: true, address: true, verificationLevel: true } } } },
      items: {
        include: {
          product: { select: { name: true, unit: true, images: true, category: true } },
        },
      },
    },
  });
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  const uid = req.user!.id;
  if (order.buyerId !== uid && order.supplierId !== uid) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  res.json(order);
}));

// Buyer: place a direct order
router.post("/", authenticate, requireRole("BUYER"), h(async (req: AuthRequest, res) => {
  const parsed = OrderSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { supplierId, deliveryAddress, notes, items } = parsed.data;

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, supplierId, inStock: true },
  });

  if (products.length !== productIds.length) {
    res.status(400).json({ error: "One or more products are unavailable or don't belong to this supplier" });
    return;
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.unitPrice,
      total: product.unitPrice * item.quantity,
    };
  });

  const totalAmount = orderItems.reduce((s, i) => s + i.total, 0);

  const order = await prisma.order.create({
    data: {
      buyerId: req.user!.id,
      supplierId,
      deliveryAddress,
      notes,
      totalAmount,
      source: "DIRECT",
      items: { create: orderItems },
    },
    include: {
      items: { include: { product: { select: { name: true, unit: true } } } },
      supplier: { select: { name: true, factory: { select: { businessName: true } } } },
    },
  });

  res.status(201).json(order);
}));

// Supplier: update order status
router.patch("/:id/status", authenticate, requireRole("SUPPLIER"), h(async (req: AuthRequest, res) => {
  const { status } = req.body as { status: string };
  const allowed = ["CONFIRMED", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!allowed.includes(status)) { res.status(400).json({ error: "Invalid status transition" }); return; }

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.supplierId !== req.user!.id) { res.status(404).json({ error: "Order not found" }); return; }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: status as never },
  });
  res.json(updated);
}));

// Buyer: confirm delivery or raise dispute
router.patch("/:id/buyer-action", authenticate, requireRole("BUYER"), h(async (req: AuthRequest, res) => {
  const { action } = req.body as { action: "DELIVERED" | "DISPUTED" };
  if (!["DELIVERED", "DISPUTED"].includes(action)) { res.status(400).json({ error: "Invalid action" }); return; }

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.buyerId !== req.user!.id) { res.status(404).json({ error: "Order not found" }); return; }
  if (action === "DELIVERED" && order.status !== "SHIPPED") {
    res.status(400).json({ error: "Order must be shipped before marking delivered" }); return;
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: action },
  });
  res.json(updated);
}));

export default router;
