"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function DashboardRoot() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/auth/login");
    } else {
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    }
  }, [router]);

  return null;
}
