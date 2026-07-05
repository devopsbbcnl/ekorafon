import { Router, type RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth";
import { emailVerificationUpdate, emailVerificationRequestReceived } from "../lib/email";
import { z } from "zod";

const router = Router();

function h(fn: RequestHandler): RequestHandler {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

const LEVEL_ORDER = [
  "UNVERIFIED",
  "VERIFIED_BUSINESS",
  "VERIFIED_FACILITY",
  "FACTORY_CERTIFIED",
  "EXPORT_CERTIFIED",
] as const;

const RequestSchema = z.object({
  targetLevel: z.enum(["VERIFIED_BUSINESS", "VERIFIED_FACILITY", "FACTORY_CERTIFIED", "EXPORT_CERTIFIED"]),
  message:     z.string().max(1000).optional(),
  documents:   z.array(z.string().url()).max(10).optional(),
});

// Supplier: submit a verification request
router.post("/request", authenticate, requireRole("SUPPLIER"), h(async (req: AuthRequest, res) => {
  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const factory = await prisma.factoryProfile.findUnique({ where: { userId: req.user!.id } });
  if (!factory) { res.status(400).json({ error: "Factory profile required" }); return; }

  const currentIdx = LEVEL_ORDER.indexOf(factory.verificationLevel as typeof LEVEL_ORDER[number]);
  const targetIdx  = LEVEL_ORDER.indexOf(parsed.data.targetLevel);
  if (targetIdx <= currentIdx) {
    res.status(400).json({ error: "Target level must be higher than current verification level" }); return;
  }

  // Only one pending request at a time
  const existing = await prisma.verificationRequest.findFirst({
    where: { userId: req.user!.id, status: "PENDING" },
  });
  if (existing) {
    res.status(400).json({ error: "You already have a pending verification request" }); return;
  }

  const request = await prisma.verificationRequest.create({
    data: {
      userId:      req.user!.id,
      targetLevel: parsed.data.targetLevel,
      message:     parsed.data.message,
      documents:   parsed.data.documents ?? [],
    },
  });

  emailVerificationRequestReceived({
    supplierEmail: req.user!.email,
    supplierName:  req.user!.name,
    targetLevel:   parsed.data.targetLevel,
  }).catch(() => {});

  res.status(201).json(request);
}));

// Supplier: get own verification requests
router.get("/mine", authenticate, requireRole("SUPPLIER"), h(async (req: AuthRequest, res) => {
  const requests = await prisma.verificationRequest.findMany({
    where:   { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(requests);
}));

// Admin: list all pending requests
router.get("/pending", authenticate, requireRole("ADMIN"), h(async (_req, res) => {
  const requests = await prisma.verificationRequest.findMany({
    where:   { status: "PENDING" },
    include: { user: { select: { name: true, email: true, factory: { select: { businessName: true, verificationLevel: true } } } } },
    orderBy: { createdAt: "asc" },
  });
  res.json(requests);
}));

// Admin: approve or reject a verification request
router.patch("/:id/decision", authenticate, requireRole("ADMIN"), h(async (req, res) => {
  const { approved, adminNote } = req.body as { approved: boolean; adminNote?: string };

  const request = await prisma.verificationRequest.findUnique({
    where:   { id: req.params.id },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!request) { res.status(404).json({ error: "Request not found" }); return; }
  if (request.status !== "PENDING") { res.status(400).json({ error: "Request already decided" }); return; }

  const updated = await prisma.verificationRequest.update({
    where: { id: req.params.id },
    data:  { status: approved ? "APPROVED" : "REJECTED", adminNote },
  });

  if (approved) {
    await prisma.factoryProfile.update({
      where: { userId: request.userId },
      data:  { verificationLevel: request.targetLevel },
    });
  }

  await emailVerificationUpdate({
    supplierEmail: request.user.email,
    supplierName:  request.user.name,
    approved,
    targetLevel:   request.targetLevel,
    adminNote,
  });

  res.json(updated);
}));

export default router;
