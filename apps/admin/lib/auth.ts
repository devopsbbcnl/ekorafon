"use client";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
  permissions: string[]; // [] = super admin (full access)
}

// Returns true if user can access the given section
export function canAccess(user: AdminUser, permission: string): boolean {
  const perms = user.permissions ?? [];
  if (perms.length === 0) return true;
  return perms.includes(permission);
}

export function saveAuth(token: string, user: AdminUser) {
  localStorage.setItem("eko_admin_token", token);
  localStorage.setItem("eko_admin_user", JSON.stringify(user));
}

export function getUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("eko_admin_user");
  if (!raw) return null;
  const u = JSON.parse(raw) as AdminUser;
  if (u.role !== "ADMIN") return null;
  if (!Array.isArray(u.permissions)) u.permissions = [];
  return u;
}

export function logout() {
  localStorage.removeItem("eko_admin_token");
  localStorage.removeItem("eko_admin_user");
}
