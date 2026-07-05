import { Response, NextFunction } from "express";
import type { FactoryProfile } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "./auth";

export interface FactoryRequest extends AuthRequest {
  factory: FactoryProfile;
}

// Blocks suppliers with no factory profile, or an UNVERIFIED one, from
// listing products, changing stock, or responding to RFQs.
export async function requireVerifiedFactory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const factory = await prisma.factoryProfile.findUnique({ where: { userId: req.user!.id } });
    if (!factory) { res.status(400).json({ error: "Complete your factory profile first" }); return; }
    if (factory.verificationLevel === "UNVERIFIED") {
      res.status(403).json({
        error: "Verify your factory profile before performing this action",
        code:  "VERIFICATION_REQUIRED",
      });
      return;
    }
    (req as FactoryRequest).factory = factory;
    next();
  } catch (err) {
    next(err);
  }
}
