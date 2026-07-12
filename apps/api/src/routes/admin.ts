import { Router, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { authenticate, type AuthRequest } from "../middleware/auth";
import { emailEscrowReleased, emailEscrowRefunded, emailVerificationLevelChanged } from "../lib/email";

const router = Router();

function h(fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>) {
  return (req: AuthRequest, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

// Permission middleware — empty permissions array = super admin (full access)
function guard(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const u = req.user;
    if (!u || u.role !== "ADMIN") { res.status(403).json({ error: "Forbidden" }); return; }
    if (u.permissions && u.permissions.length > 0 && !u.permissions.includes(permission)) {
      res.status(403).json({ error: "Insufficient permissions" }); return;
    }
    next();
  };
}

const superAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const u = req.user;
  if (!u || u.role !== "ADMIN") { res.status(403).json({ error: "Forbidden" }); return; }
  if (u.permissions && u.permissions.length > 0) {
    res.status(403).json({ error: "Super admin required" }); return;
  }
  next();
};

// ── Overview stats ────────────────────────────────────────────────────────────

router.get("/stats", authenticate, h(async (req: AuthRequest, res) => {
  const u = req.user!;
  if (u.role !== "ADMIN") { res.status(403).json({ error: "Forbidden" }); return; }

  const [
    totalUsers, totalFactories, totalOrders,
    deliveredRev, pendingVerif, escrowAgg,
    activeOrders, disputedOrders,
    usersByRole, ordersByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.factoryProfile.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: "DELIVERED" } }),
    prisma.verificationRequest.count({ where: { status: "PENDING" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS" } }),
    prisma.order.count({ where: { status: { in: ["CONFIRMED", "IN_PRODUCTION", "SHIPPED"] } } }),
    prisma.order.count({ where: { status: "DISPUTED" } }),
    prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
    prisma.order.groupBy({ by: ["status"], _count: { id: true } }),
  ]);

  res.json({
    totalUsers,
    totalFactories,
    totalOrders,
    gmv:                deliveredRev._sum.totalAmount ?? 0,
    pendingVerif,
    escrowValue:        escrowAgg._sum.amount ?? 0,
    activeOrders,
    disputedOrders,
    usersByRole:        Object.fromEntries(usersByRole.map((r) => [r.role, r._count.id])),
    ordersByStatus:     Object.fromEntries(ordersByStatus.map((r) => [r.status, r._count.id])),
  });
}));

// ── Users ─────────────────────────────────────────────────────────────────────

router.get("/users", authenticate, guard("users"), h(async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true, email: true, name: true, role: true,
      suspended: true, permissions: true, createdAt: true,
      factory: { select: { businessName: true, verificationLevel: true } },
      _count: { select: { buyerOrders: true, supplierOrders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
}));

// Create a new admin user (super admin only)
router.post("/users", authenticate, superAdmin, h(async (req, res) => {
  const { email, name, password, permissions } = req.body as {
    email: string; name: string; password: string; permissions: string[];
  };
  if (!email || !name || !password) {
    res.status(400).json({ error: "email, name, and password are required" }); return;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) { res.status(409).json({ error: "Email already registered" }); return; }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role: "ADMIN", permissions: permissions ?? [] },
  });
  res.status(201).json({
    id: user.id, email: user.email, name: user.name,
    role: user.role, permissions: user.permissions,
  });
}));

// Update user — suspend/unsuspend or update permissions
router.patch("/users/:id", authenticate, guard("users"), h(async (req, res) => {
  const { suspended, permissions } = req.body as { suspended?: boolean; permissions?: string[] };
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(suspended  !== undefined && { suspended }),
      ...(permissions !== undefined && { permissions }),
    },
    select: { id: true, email: true, name: true, role: true, suspended: true, permissions: true },
  });
  res.json(user);
}));

// Delete a user
router.delete("/users/:id", authenticate, guard("users"), h(async (req: AuthRequest, res) => {
  if (req.params.id === req.user!.id) {
    res.status(400).json({ error: "You cannot delete your own account" }); return;
  }
  const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { role: true } });
  if (!target) { res.status(404).json({ error: "User not found" }); return; }
  if (target.role === "ADMIN") { res.status(400).json({ error: "Admin accounts cannot be deleted" }); return; }

  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}));

// ── Factories ─────────────────────────────────────────────────────────────────

router.get("/factories", authenticate, guard("factories"), h(async (_req, res) => {
  const factories = await prisma.factoryProfile.findMany({
    include: {
      user: {
        select: {
          name: true, email: true, suspended: true,
          etrs: { select: { score: true, ordersCompleted: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(factories);
}));

// Set verification level directly (bypass request flow)
router.patch("/factories/:id/verification", authenticate, guard("factories"), h(async (req, res) => {
  const { verificationLevel } = req.body as { verificationLevel: string };
  const VALID = ["UNVERIFIED", "VERIFIED_BUSINESS", "VERIFIED_FACILITY", "FACTORY_CERTIFIED", "EXPORT_CERTIFIED"];
  if (!VALID.includes(verificationLevel)) {
    res.status(400).json({ error: "Invalid verificationLevel" }); return;
  }
  const existing = await prisma.factoryProfile.findUnique({
    where:   { id: req.params.id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!existing) { res.status(404).json({ error: "Factory not found" }); return; }

  const factory = await prisma.factoryProfile.update({
    where: { id: req.params.id },
    data:  { verificationLevel: verificationLevel as never },
    select: { id: true, businessName: true, verificationLevel: true },
  });

  if (existing.verificationLevel !== verificationLevel) {
    emailVerificationLevelChanged({
      supplierEmail:  existing.user.email,
      supplierName:   existing.user.name,
      newLevel:       verificationLevel,
      previousLevel:  existing.verificationLevel,
    }).catch(() => {});
  }

  res.json(factory);
}));

// ── Orders & Disputes ─────────────────────────────────────────────────────────

router.get("/orders", authenticate, guard("orders"), h(async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      buyer:    { select: { name: true, email: true } },
      supplier: { select: { name: true, factory: { select: { businessName: true } } } },
      items:    { include: { product: { select: { name: true } } } },
      payment:  { select: { status: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
}));

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED", "DISPUTED"];

// Admin override — used chiefly to resolve disputes by moving the order to its correct status
router.patch("/orders/:id/status", authenticate, guard("orders"), h(async (req, res) => {
  const { status } = req.body as { status: string };
  if (!ORDER_STATUSES.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data:  { status: status as never },
    select: { id: true, status: true },
  });
  res.json(order);
}));

// ── Products, RFQs & Quotes ───────────────────────────────────────────────────

router.get("/products", authenticate, guard("products"), h(async (_req, res) => {
  const products = await prisma.product.findMany({
    include: {
      supplier: { select: { name: true, email: true } },
      factory:  { select: { businessName: true, verificationLevel: true } },
      _count:   { select: { orderItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
}));

// Admin moderation — delist/relist a product
router.patch("/products/:id/stock", authenticate, guard("products"), h(async (req, res) => {
  const { inStock } = req.body as { inStock: boolean };
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data:  { inStock },
    select: { id: true, inStock: true },
  });
  res.json(product);
}));

// Admin moderation — remove a listing entirely
router.delete("/products/:id", authenticate, guard("products"), h(async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}));

router.get("/rfqs", authenticate, guard("products"), h(async (_req, res) => {
  const rfqs = await prisma.rFQ.findMany({
    include: {
      buyer:  { select: { name: true, email: true } },
      _count: { select: { quotes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(rfqs);
}));

router.get("/quotes", authenticate, guard("products"), h(async (_req, res) => {
  const quotes = await prisma.quote.findMany({
    include: {
      rfq:      { select: { id: true, title: true, status: true } },
      supplier: { select: { name: true, factory: { select: { businessName: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(quotes);
}));

// ── Reviews ───────────────────────────────────────────────────────────────────

router.get("/reviews", authenticate, guard("reviews"), h(async (_req, res) => {
  const reviews = await prisma.review.findMany({
    include: {
      buyer:    { select: { name: true, email: true } },
      supplier: { select: { name: true, factory: { select: { businessName: true } } } },
      order:    { select: { id: true, totalAmount: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(reviews);
}));

// Admin moderation — remove an inappropriate/fraudulent review
router.delete("/reviews/:id", authenticate, guard("reviews"), h(async (req, res) => {
  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}));

// ── Escrow ────────────────────────────────────────────────────────────────────

router.get("/escrow", authenticate, guard("escrow"), h(async (_req, res) => {
  const payments = await prisma.payment.findMany({
    include: {
      order: {
        select: {
          id: true, status: true, totalAmount: true, source: true,
          buyer:    { select: { name: true, email: true } },
          supplier: { select: { name: true, factory: { select: { businessName: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(payments);
}));

router.patch("/escrow/:id/release", authenticate, guard("escrow"), h(async (req: AuthRequest, res) => {
  const payment = await prisma.payment.findUnique({
    where:   { id: req.params.id },
    include: {
      order: {
        include: {
          buyer:    { select: { name: true } },
          supplier: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!payment)                     { res.status(404).json({ error: "Payment not found" }); return; }
  if (payment.status !== "SUCCESS") { res.status(400).json({ error: "Only SUCCESS payments can be released" }); return; }

  const updated = await prisma.payment.update({
    where: { id: req.params.id },
    data:  { status: "RELEASED", releasedAt: new Date(), releasedBy: req.user!.id },
  });

  emailEscrowReleased({
    supplierEmail: payment.order.supplier.email,
    supplierName:  payment.order.supplier.name,
    buyerName:     payment.order.buyer.name,
    totalAmount:   payment.amount,
    orderId:       payment.orderId,
  }).catch(() => {});

  res.json(updated);
}));

router.patch("/escrow/:id/refund", authenticate, guard("escrow"), h(async (req: AuthRequest, res) => {
  const payment = await prisma.payment.findUnique({
    where:   { id: req.params.id },
    include: {
      order: {
        include: { buyer: { select: { name: true, email: true } } },
      },
    },
  });
  if (!payment) { res.status(404).json({ error: "Payment not found" }); return; }
  if (!["SUCCESS", "RELEASED"].includes(payment.status)) {
    res.status(400).json({ error: "Cannot refund payment in current state" }); return;
  }

  const updated = await prisma.payment.update({
    where: { id: req.params.id },
    data:  { status: "REFUNDED" },
  });

  emailEscrowRefunded({
    buyerEmail:  payment.order.buyer.email,
    buyerName:   payment.order.buyer.name,
    totalAmount: payment.amount,
    orderId:     payment.orderId,
  }).catch(() => {});

  res.json(updated);
}));

// ── Analytics ─────────────────────────────────────────────────────────────────

router.get("/analytics", authenticate, guard("analytics"), h(async (_req, res) => {
  const [ordersByStatus, usersByRole, topSupplierRows, rfqStats, paymentStats] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: { id: true }, _sum: { totalAmount: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
    prisma.order.groupBy({
      by:     ["supplierId"],
      where:  { status: "DELIVERED" },
      _sum:   { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take:   5,
    }),
    prisma.rFQ.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.payment.groupBy({ by: ["status"], _sum: { amount: true }, _count: { id: true } }),
  ]);

  // Enrich top suppliers with names
  const supplierIds = topSupplierRows.map((r) => r.supplierId);
  const supplierUsers = await prisma.user.findMany({
    where:  { id: { in: supplierIds } },
    select: { id: true, name: true, factory: { select: { businessName: true } } },
  });
  const nameMap = new Map(supplierUsers.map((u) => [u.id, u.factory?.businessName ?? u.name]));
  const topSuppliers = topSupplierRows.map((r) => ({
    supplierId: r.supplierId,
    name:       nameMap.get(r.supplierId) ?? r.supplierId,
    revenue:    r._sum.totalAmount ?? 0,
    orders:     r._count.id,
  }));

  res.json({
    ordersByStatus: Object.fromEntries(ordersByStatus.map((r) => [r.status, { count: r._count.id, revenue: r._sum.totalAmount ?? 0 }])),
    usersByRole:    Object.fromEntries(usersByRole.map((r) => [r.role, r._count.id])),
    topSuppliers,
    rfqsByStatus:   Object.fromEntries(rfqStats.map((r) => [r.status, r._count.id])),
    paymentsByStatus: Object.fromEntries(paymentStats.map((r) => [r.status, { count: r._count.id, amount: r._sum.amount ?? 0 }])),
  });
}));

export default router;
