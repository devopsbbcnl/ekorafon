export type UserRole = "BUYER" | "SUPPLIER" | "ADMIN";

export type VerificationLevel =
  | "UNVERIFIED"
  | "VERIFIED_BUSINESS"
  | "VERIFIED_FACILITY"
  | "FACTORY_CERTIFIED"
  | "EXPORT_CERTIFIED";

export type RFQStatus =
  | "OPEN"
  | "REVIEWING"
  | "AWARDED"
  | "CLOSED"
  | "CANCELLED";

export type QuoteStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PRODUCTION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "DISPUTED";

export type OrderSource = "DIRECT" | "RFQ";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  permissions?: string[]; // ADMIN only — empty array = super admin
}
