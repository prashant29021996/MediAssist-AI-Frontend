"use client";

import { useRouter } from "next/navigation";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  InfoRow,
  StatCard,
} from "@/components/ui";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Welcome to Your Clinic</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your clinic operations — doctors, patients, appointments, and settings.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Doctors" value="—" color="blue" hint="Manage doctors" />
        <StatCard label="Patients" value="—" color="green" hint="Manage patients" />
        <StatCard label="Receptionists" value="—" color="purple" hint="Manage staff" />
        <StatCard label="Appointments" value="—" color="yellow" hint="Coming soon" />
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
              action={
                <button
                  onClick={() => router.push("/dashboard/doctors")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Manage →
                </button>
              }
            />
            <InfoRow
              title="Receptionists"
              description="Manage front-desk staff"
              color="blue"
              action={
                <button
                  onClick={() => router.push("/dashboard/receptionists")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Manage →
                </button>
              }
            />
            <InfoRow
              title="Roles & Permissions"
              description="Assign roles to staff"
              color="blue"
              action={<Badge variant="gray">Coming soon</Badge>}
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
              action={<Badge variant="gray">Coming soon</Badge>}
            />
            <InfoRow
              title="Holidays"
              description="Configure clinic holidays"
              color="green"
              action={<Badge variant="gray">Coming soon</Badge>}
            />
            <InfoRow
              title="Departments"
              description="Manage clinic departments"
              color="green"
              action={<Badge variant="gray">Coming soon</Badge>}
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
              action={
                <button
                  onClick={() => router.push("/dashboard/patients")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Manage →
                </button>
              }
            />
            <InfoRow
              title="Patient Records"
              description="View and manage patient history"
              color="purple"
              action={
                <button
                  onClick={() => router.push("/dashboard/patients")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View →
                </button>
              }
            />
            <InfoRow
              title="Document Upload"
              description="Upload patient reports and scans"
              color="purple"
              action={<Badge variant="gray">Coming soon</Badge>}
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
              action={<Badge variant="gray">Coming soon</Badge>}
            />
            <InfoRow
              title="Calendar View"
              description="Daily/weekly appointment calendar"
              color="yellow"
              action={<Badge variant="gray">Coming soon</Badge>}
            />
            <InfoRow
              title="Check-in / Queue"
              description="Patient check-in and queue management"
              color="yellow"
              action={<Badge variant="gray">Coming soon</Badge>}
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
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">💬</div>
              <p className="font-medium text-gray-900">AI Chat</p>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">📊</div>
              <p className="font-medium text-gray-900">Trend Analysis</p>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}