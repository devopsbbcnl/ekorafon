"use client";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: "BUYER" | "SUPPLIER" | "ADMIN";
}

export function saveAuth(token: string, user: StoredUser) {
  localStorage.setItem("eko_token", token);
  localStorage.setItem("eko_user", JSON.stringify(user));
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("eko_user");
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("eko_token");
}

export function updateStoredUser(patch: Partial<StoredUser>) {
  const current = getUser();
  if (!current) return;
  localStorage.setItem("eko_user", JSON.stringify({ ...current, ...patch }));
}

export function logout() {
  localStorage.removeItem("eko_token");
  localStorage.removeItem("eko_user");
}
