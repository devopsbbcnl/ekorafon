/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const prisma = new PrismaClient();
  const hash = await bcrypt.hash("Admin2026!", 12);
  await prisma.user.create({
    data: { email: "admin@ekorafon.com", name: "Ekorafon Admin", passwordHash: hash, role: "ADMIN" },
  });
  console.log("✓ admin user created — admin@ekorafon.com / Admin2026!");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
