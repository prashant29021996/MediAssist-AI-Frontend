"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidenav } from "@/components/sidenav";
import { UserMenu } from "@/components/user-menu";
import { Badge, LoadingScreen } from "@/components/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isAuthenticated, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
    // Super admins get redirected to the admin portal
    if (!loading && isAuthenticated && isSuperAdmin) {
      router.push("/admin");
    }
  }, [loading, isAuthenticated, isSuperAdmin, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidenav />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900">
              Clinic Management
            </h1>
            <UserMenu badge={<Badge variant="info">Clinic Admin</Badge>} />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}