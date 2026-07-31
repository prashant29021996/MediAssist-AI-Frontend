"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LoadingScreen } from "@/components/ui";

export default function AdminTenantsPage() {
  const { loading, isAuthenticated, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!isSuperAdmin) {
        router.push("/dashboard");
      } else {
        // Redirect to the main admin page which has signup management built in
        router.push("/admin");
      }
    }
  }, [loading, isAuthenticated, isSuperAdmin, router]);

  return <LoadingScreen message="Redirecting to Super Admin Portal..." />;
}
