import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth";
import { FactoryProfileSchema } from "@ekorafon/shared";

const router = Router();

router.get("/", async (req, res) => {
  const { category, lga, exportReady, search } = req.query;
  const factories = await prisma.factoryProfile.findMany({
    where: {
      ...(category && { productCategories: { has: category as string } }),
      ...(lga && { lga: lga as string }),
      ...(exportReady === "true" && { exportReady: true }),
      ...(search && {
        OR: [
          { businessName: { contains: search as string, mode: "insensitive" } },
          { description: { contains: search as string, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      user: { select: { name: true, etrs: { select: { score: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(factories);
});

router.get("/me", authenticate, requireRole("SUPPLIER"), async (req: AuthRequest, res) => {
  const factory = await prisma.factoryProfile.findUnique({
    where: { userId: req.user!.id },
    include: { user: { select: { name: true, etrs: true } } },
  });
  res.json(factory ?? null);
});

router.get("/:id", async (req, res) => {
  const factory = await prisma.factoryProfile.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { name: true, etrs: true } } },
  });
  if (!factory) { res.status(404).json({ error: "Factory not found" }); return; }
  res.json(factory);
});

router.post("/", authenticate, requireRole("SUPPLIER"), async (req: AuthRequest, res) => {
  const parsed = FactoryProfileSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const existing = await prisma.factoryProfile.findUnique({ where: { userId: req.user!.id } });
  if (existing) { res.status(409).json({ error: "Factory profile already exists" }); return; }

  const factory = await prisma.factoryProfile.create({
    data: { ...parsed.data, userId: req.user!.id },
  });
  res.status(201).json(factory);
});

router.patch("/", authenticate, requireRole("SUPPLIER"), async (req: AuthRequest, res) => {
  const parsed = FactoryProfileSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const factory = await prisma.factoryProfile.update({
    where: { userId: req.user!.id },
    data: parsed.data,
  });
  res.json(factory);
});

export default router;
