"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserMenu } from "@/components/user-menu";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  InfoRow,
  LoadingScreen,
  PageHeader,
  StatCard,
} from "@/components/ui";

export default function DashboardPage() {
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Clinic Dashboard"
        actions={<UserMenu badge={<Badge variant="info">Clinic Admin</Badge>} />}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Welcome to Your Clinic</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your clinic operations — doctors, patients, appointments, and settings.
          </p>
          <div className="mt-4">
            <InfoRow
              title="Manage Users"
              description="Create and manage staff accounts"
              color="purple"
              action={
                <button
                  onClick={() => router.push("/admin/users")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Manage →
                </button>
              }
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard label="Doctors" value="—" color="blue" hint="Coming in Sprint 2" />
          <StatCard label="Patients" value="—" color="green" hint="Coming in Sprint 3" />
          <StatCard label="Appointments" value="—" color="purple" hint="Coming in Sprint 4" />
          <StatCard label="Documents" value="—" color="yellow" hint="Coming in Sprint 5" />
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Staff Management */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Staff Management</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <InfoRow
                title="Doctors"
                description="Add and manage doctors"
                color="blue"
                action={<Badge variant="gray">Sprint 2</Badge>}
              />
              <InfoRow
                title="Receptionists"
                description="Manage front-desk staff"
                color="blue"
                action={<Badge variant="gray">Sprint 2</Badge>}
              />
              <InfoRow
                title="Roles & Permissions"
                description="Assign roles to staff"
                color="blue"
                action={<Badge variant="gray">Sprint 2</Badge>}
              />
            </CardBody>
          </Card>

          {/* Clinic Settings */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Clinic Settings</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <InfoRow
                title="Working Hours"
                description="Set clinic operating hours"
                color="green"
                action={<Badge variant="gray">Sprint 2</Badge>}
              />
              <InfoRow
                title="Holidays"
                description="Configure clinic holidays"
                color="green"
                action={<Badge variant="gray">Sprint 2</Badge>}
              />
              <InfoRow
                title="Departments"
                description="Manage clinic departments"
                color="green"
                action={<Badge variant="gray">Sprint 2</Badge>}
              />
            </CardBody>
          </Card>

          {/* Patient Operations */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Patient Operations</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <InfoRow
                title="Register Patient"
                description="Add new patients to the system"
                color="purple"
                action={<Badge variant="gray">Sprint 3</Badge>}
              />
              <InfoRow
                title="Patient Records"
                description="View and manage patient history"
                color="purple"
                action={<Badge variant="gray">Sprint 3</Badge>}
              />
              <InfoRow
                title="Document Upload"
                description="Upload patient reports and scans"
                color="purple"
                action={<Badge variant="gray">Sprint 5</Badge>}
              />
            </CardBody>
          </Card>

          {/* Appointment Management */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <InfoRow
                title="Schedule"
                description="Book and manage appointments"
                color="yellow"
                action={<Badge variant="gray">Sprint 4</Badge>}
              />
              <InfoRow
                title="Calendar View"
                description="Daily/weekly appointment calendar"
                color="yellow"
                action={<Badge variant="gray">Sprint 4</Badge>}
              />
              <InfoRow
                title="Check-in / Queue"
                description="Patient check-in and queue management"
                color="yellow"
                action={<Badge variant="gray">Sprint 4</Badge>}
              />
            </CardBody>
          </Card>
        </div>

        {/* AI Features Section */}
        <Card className="mt-8 overflow-hidden">
          <CardHeader className="bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">AI-Powered Features</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">🤖</div>
                <p className="font-medium text-gray-900">AI Summaries</p>
                <p className="text-sm text-gray-500">Coming in Sprint 9</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">💬</div>
                <p className="font-medium text-gray-900">AI Chat</p>
                <p className="text-sm text-gray-500">Coming in Sprint 9</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">📊</div>
                <p className="font-medium text-gray-900">Trend Analysis</p>
                <p className="text-sm text-gray-500">Coming in Sprint 9</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}