import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import type { AuthUser, UserRole } from "../shared";

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Verifies the JWT, then re-reads the user so suspension and role/permission
// changes take effect immediately instead of when the token expires.
export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  let payload: AuthUser;
  try {
    payload = verifyToken(header.slice(7));
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where:  { id: payload.id },
      select: { id: true, email: true, name: true, role: true, suspended: true, permissions: true },
    });
    if (!user) { res.status(401).json({ error: "Invalid token" }); return; }
    if (user.suspended) { res.status(403).json({ error: "Account suspended. Contact support." }); return; }
    req.user = {
      id: user.id, email: user.email, name: user.name,
      role: user.role, permissions: user.permissions,
    };
    next();
  } catch (err) {
    next(err);
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try { req.user = verifyToken(header.slice(7)); } catch { /* ignore */ }
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
