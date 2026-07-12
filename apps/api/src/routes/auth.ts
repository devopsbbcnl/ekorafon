import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { RegisterSchema, LoginSchema } from "@ekorafon/shared";
import { authenticate, type AuthRequest } from "../middleware/auth";
import {
  emailVerifyAddress,
  emailWelcomeBuyer,
  emailWelcomeSupplier,
  emailPasswordReset,
} from "../lib/email";

const router = Router();

const EMAIL_VERIFY_TTL_MS = 60 * 60 * 1000; // 1h

// 3 resend requests per email per 15 minutes, on top of a per-IP cap
const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${(req.body as { email?: string })?.email || ""}`,
  message: { message: "Too many requests. Please try again later." },
});

// ── Register ─────────────────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) { res.status(409).json({ error: "Email already registered" }); return; }

  const passwordHash       = await bcrypt.hash(password, 12);
  const emailVerifyToken   = crypto.randomBytes(32).toString("hex");
  const emailVerifyExpiry  = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, emailVerifyToken, emailVerifyExpiry },
  });

  await prisma.eTRS.create({ data: { userId: user.id } });

  // Send verification email — fire-and-forget
  emailVerifyAddress({ to: email, name, token: emailVerifyToken }).catch(() => {});

  res.status(201).json({
    requiresVerification: true,
    message: "Account created. Please check your email to verify your address before logging in.",
  });
});

// ── Verify email ──────────────────────────────────────────────────────────────

router.get("/verify-email", async (req, res) => {
  const { token } = req.query as { token?: string };
  if (!token) { res.status(400).json({ error: "Missing token" }); return; }

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });

  if (!user) { res.status(400).json({ error: "Invalid or expired verification link" }); return; }
  if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date()) {
    res.status(400).json({ error: "Verification link has expired. Request a new one." }); return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data:  { emailVerified: true, emailVerifyToken: null, emailVerifyExpiry: null },
  });

  // Send role-specific welcome email
  if (user.role === "SUPPLIER") {
    emailWelcomeSupplier({ to: user.email, name: user.name }).catch(() => {});
  } else {
    emailWelcomeBuyer({ to: user.email, name: user.name }).catch(() => {});
  }

  const jwtToken = signToken({
    id: user.id, email: user.email, role: user.role,
    name: user.name, permissions: user.permissions,
  });

  res.json({
    token: jwtToken,
    user:  { id: user.id, email: user.email, name: user.name, role: user.role, permissions: user.permissions },
  });
});

// ── Resend verification ────────────────────────────────────────────────────────

router.post("/resend-verification", resendVerificationLimiter, async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) { res.status(400).json({ error: "Email is required" }); return; }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return 200 to avoid user enumeration
  if (!user || user.emailVerified) { res.json({ message: "If that email exists and is unverified, a new link has been sent." }); return; }

  const emailVerifyToken  = crypto.randomBytes(32).toString("hex");
  const emailVerifyExpiry = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data:  { emailVerifyToken, emailVerifyExpiry },
  });

  emailVerifyAddress({ to: user.email, name: user.name, token: emailVerifyToken }).catch(() => {});

  res.json({ message: "If that email exists and is unverified, a new link has been sent." });
});

// ── Login ─────────────────────────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { res.status(401).json({ error: "Invalid credentials" }); return; }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }

  if (user.suspended) { res.status(403).json({ error: "Account suspended. Contact support." }); return; }

  if (!user.emailVerified) {
    res.status(403).json({
      error: "Please verify your email before logging in.",
      code:  "EMAIL_UNVERIFIED",
    });
    return;
  }

  const token = signToken({
    id: user.id, email: user.email, role: user.role,
    name: user.name, permissions: user.permissions,
  });

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, permissions: user.permissions },
  });
});

// ── Forgot password ───────────────────────────────────────────────────────────

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) { res.status(400).json({ error: "Email is required" }); return; }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always 200 — never reveal whether email exists
  res.json({ message: "If an account with that email exists, a password reset link has been sent." });

  if (!user) return;

  const passwordResetToken  = crypto.randomBytes(32).toString("hex");
  const passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await prisma.user.update({
    where: { id: user.id },
    data:  { passwordResetToken, passwordResetExpiry },
  });

  emailPasswordReset({ to: user.email, name: user.name, token: passwordResetToken }).catch(() => {});
});

// ── Reset password ────────────────────────────────────────────────────────────

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) { res.status(400).json({ error: "Token and password are required" }); return; }
  if (password.length < 8) { res.status(400).json({ error: "Password must be at least 8 characters" }); return; }

  const user = await prisma.user.findUnique({ where: { passwordResetToken: token } });

  if (!user) { res.status(400).json({ error: "Invalid or expired reset link" }); return; }
  if (user.passwordResetExpiry && user.passwordResetExpiry < new Date()) {
    res.status(400).json({ error: "Reset link has expired. Request a new one." }); return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data:  { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
  });

  res.json({ message: "Password updated successfully. You can now log in." });
});

// ── Me ────────────────────────────────────────────────────────────────────────

router.get("/me", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const { verifyToken } = await import("../lib/jwt");
    const payload = verifyToken(header.slice(7));
    const user = await prisma.user.findUnique({
      where:  { id: payload.id },
      select: {
        id: true, email: true, name: true, role: true,
        factory: { select: { id: true, businessName: true, verificationLevel: true } },
      },
    });
    res.json(user);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ── Update profile ────────────────────────────────────────────────────────────

router.patch("/me", authenticate, async (req: AuthRequest, res) => {
  const { name } = req.body as { name?: string };
  const trimmed = name?.trim();
  if (!trimmed) { res.status(400).json({ error: "Name is required" }); return; }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data:  { name: trimmed },
    select: { id: true, email: true, name: true, role: true, permissions: true },
  });
  res.json(user);
});

// ── Change password ───────────────────────────────────────────────────────────

router.post("/change-password", authenticate, async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) { res.status(400).json({ error: "Current and new password are required" }); return; }
  if (newPassword.length < 8) { res.status(400).json({ error: "New password must be at least 8 characters" }); return; }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "Current password is incorrect" }); return; }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  res.json({ message: "Password updated successfully" });
});

export default router;
