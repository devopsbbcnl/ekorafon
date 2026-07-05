import { Router, type RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth";
import { requireVerifiedFactory, type FactoryRequest } from "../middleware/verifiedFactory";
import { ProductSchema } from "@ekorafon/shared";

const router = Router();

function h(fn: RequestHandler): RequestHandler {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Public: list all in-stock products
router.get("/", h(async (req, res) => {
  const { category, factoryId } = req.query as Record<string, string>;
  const products = await prisma.product.findMany({
    where: {
      inStock: true,
      ...(category ? { category } : {}),
      ...(factoryId ? { factoryId } : {}),
    },
    include: {
      supplier: { select: { name: true } },
      factory: { select: { businessName: true, verificationLevel: true, lga: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
}));

// Public: get one product
router.get("/:id", h(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      supplier: { select: { name: true, etrs: { select: { score: true } } } },
      factory: { select: { businessName: true, verificationLevel: true, address: true, lga: true, phone: true } },
    },
  });
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(product);
}));

// Supplier: list my products
router.get("/mine/list", authenticate, requireRole("SUPPLIER"), h(async (req: AuthRequest, res) => {
  const factory = await prisma.factoryProfile.findUnique({ where: { userId: req.user!.id } });
  if (!factory) { res.status(404).json({ error: "Factory profile required" }); return; }

  const products = await prisma.product.findMany({
    where: { supplierId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
}));

// Supplier: create product
router.post("/", authenticate, requireRole("SUPPLIER"), requireVerifiedFactory, h(async (req: AuthRequest, res) => {
  const { factory } = req as FactoryRequest;

  const parsed = ProductSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const product = await prisma.product.create({
    data: { ...parsed.data, supplierId: req.user!.id, factoryId: factory.id },
  });
  res.status(201).json(product);
}));

// Supplier: toggle in-stock
router.patch("/:id/stock", authenticate, requireRole("SUPPLIER"), requireVerifiedFactory, h(async (req: AuthRequest, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product || product.supplierId !== req.user!.id) { res.status(404).json({ error: "Product not found" }); return; }

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: { inStock: !product.inStock },
  });
  res.json(updated);
}));

// Supplier: delete product
router.delete("/:id", authenticate, requireRole("SUPPLIER"), h(async (req: AuthRequest, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product || product.supplierId !== req.user!.id) { res.status(404).json({ error: "Product not found" }); return; }

  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}));

export default router;
