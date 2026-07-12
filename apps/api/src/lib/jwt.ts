import jwt from "jsonwebtoken";
import type { AuthUser } from "../shared";

const SECRET = process.env.JWT_SECRET!;

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, SECRET) as AuthUser;
}
