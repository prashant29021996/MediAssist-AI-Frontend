"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user, loading, logout, isAuthenticated, isSuperAdmin } = useAuth();
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clinic Dashboard</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              Clinic Admin
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Welcome to Your Clinic</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your clinic operations — doctors, patients, appointments, and settings.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Doctors</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">—</p>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-500">
                    Create and manage staff accounts
                  </p>
                </div>
                <button
                  onClick={() => router.push("/admin/users")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Manage →
                </button>
              </div>
            <p className="mt-1 text-xs text-gray-400">Coming in Sprint 2</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Patients</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">—</p>
            <p className="mt-1 text-xs text-gray-400">Coming in Sprint 3</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Appointments</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600">—</p>
            <p className="mt-1 text-xs text-gray-400">Coming in Sprint 4</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Documents</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-600">—</p>
            <p className="mt-1 text-xs text-gray-400">Coming in Sprint 5</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Staff Management */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Staff Management</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Doctors</p>
                  <p className="text-sm text-gray-500">Add and manage doctors</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sprint 2</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Receptionists</p>
                  <p className="text-sm text-gray-500">Manage front-desk staff</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sprint 2</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Roles & Permissions</p>
                  <p className="text-sm text-gray-500">Assign roles to staff</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sprint 2</span>
              </div>
            </div>
          </div>

          {/* Clinic Settings */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Clinic Settings</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Working Hours</p>
                  <p className="text-sm text-gray-500">Set clinic operating hours</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sprint 2</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Holidays</p>
                  <p className="text-sm text-gray-500">Configure clinic holidays</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sprint 2</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Departments</p>
                  <p className="text-sm text-gray-500">Manage clinic departments</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sprint 2</span>
              </div>
            </div>
          </div>

          {/* Patient Operations */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Patient Operations</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Register Patient</p>
                  <p className="text-sm text-gray-500">Add new patients to the system</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sprint 3</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Patient Records</p>
                  <p className="text-sm text-gray-500">View and manage patient history</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sprint 3</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Document Upload</p>
                  <p className="text-sm text-gray-500">Upload patient reports and scans</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sprint 5</span>
              </div>
            </div>
          </div>

          {/* Appointment Management */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Schedule</p>
                  <p className="text-sm text-gray-500">Book and manage appointments</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sprint 4</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Calendar View</p>
                  <p className="text-sm text-gray-500">Daily/weekly appointment calendar</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sprint 4</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Check-in / Queue</p>
                  <p className="text-sm text-gray-500">Patient check-in and queue management</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sprint 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">AI-Powered Features</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        </div>
      </main>
    </div>
  );
}