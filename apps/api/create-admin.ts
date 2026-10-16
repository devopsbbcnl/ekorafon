/// <reference types="node" />
// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' npx tsx create-admin.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment.");
  }
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");

  const prisma = new PrismaClient();
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, name: "Ekorafon Admin", passwordHash, role: "ADMIN", emailVerified: true },
  });
  console.log(`✓ admin user created — ${email}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
