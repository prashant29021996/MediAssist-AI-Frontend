"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { organizationsApi, tenantApi } from "@/lib/api";

interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string;
  is_active: boolean;
}

interface PendingSignup {
  id: string;
  organization_name: string;
  admin_email: string;
  admin_first_name: string;
  admin_last_name: string;
  status: string;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const { user, loading, logout, isAuthenticated, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "signups" | "tenants">("overview");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [pendingSignups, setPendingSignups] = useState<PendingSignup[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [declineModal, setDeclineModal] = useState<{ id: string; name: string } | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
    if (!loading && isAuthenticated && !isSuperAdmin) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, isSuperAdmin, router]);

  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      loadData();
    }
  }, [isAuthenticated, isSuperAdmin]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [orgsRes, pendingRes] = await Promise.all([
        organizationsApi.list(),
        tenantApi.listPending().catch(() => ({ data: [] })),
      ]);
      setOrganizations(orgsRes.data);
      setPendingSignups(pendingRes.data);
    } catch {
      // silently fail
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await tenantApi.approve(id);
      setPendingSignups((prev) => prev.filter((s) => s.id !== id));
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!declineModal || !declineReason.trim()) return;
    setActionLoading(declineModal.id);
    try {
      await tenantApi.decline(declineModal.id, declineReason);
      setPendingSignups((prev) => prev.filter((s) => s.id !== declineModal.id));
      setDeclineModal(null);
      setDeclineReason("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to decline");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id: string) => {
    if (!confirm("Are you sure you want to suspend this tenant?")) return;
    setActionLoading(id);
    try {
      await organizationsApi.suspend(id);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to suspend");
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try {
      await organizationsApi.activate(id);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to activate");
    } finally {
      setActionLoading(null);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Portal</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
              Super Admin
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Tenants</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {loadingData ? "..." : organizations.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {loadingData ? "..." : organizations.filter((o) => o.is_active).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Suspended</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {loadingData ? "..." : organizations.filter((o) => !o.is_active).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Signups</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{pendingSignups.length}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 text-sm font-medium border-b-2 ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Platform Overview
            </button>
            <button
              onClick={() => setActiveTab("signups")}
              className={`pb-4 text-sm font-medium border-b-2 ${
                activeTab === "signups"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending Signups {pendingSignups.length > 0 && `(${pendingSignups.length})`}
            </button>
            <button
              onClick={() => setActiveTab("tenants")}
              className={`pb-4 text-sm font-medium border-b-2 ${
                activeTab === "tenants"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              All Tenants ({organizations.length})
            </button>
          </nav>
        </div>

        {/* Platform Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Tenant Management</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Review Signups</p>
                    <p className="text-sm text-gray-500">
                      {pendingSignups.length > 0
                        ? `${pendingSignups.length} clinics waiting for approval`
                        : "No pending signups"}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("signups")}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Review →
                  </button>
                </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Manage Tenants</p>
                  <p className="text-sm text-gray-500">
                    {organizations.length} registered clinics
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("tenants")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All →
                </button>
              </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Platform Info</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Your Role</p>
                    <p className="text-sm text-gray-500">Super Admin — Full platform access</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Permissions</p>
                    <p className="text-sm text-gray-500">All 19 permissions granted</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Full</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Tenant Approval</p>
                    <p className="text-sm text-gray-500">Only you can approve new clinics</p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Exclusive</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Signups Tab */}
        {activeTab === "signups" && (
          <div>
            {loadingData ? (
              <div className="text-center py-12 text-gray-500">Loading signups...</div>
            ) : pendingSignups.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-gray-400 text-5xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up</h3>
                <p className="text-gray-500">No pending clinic registration requests.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSignups.map((signup) => (
                  <div key={signup.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {signup.organization_name}
                          </h3>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                          <div>
                            <span className="font-medium">Admin:</span> {signup.admin_first_name} {signup.admin_last_name}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {signup.admin_email}
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span>{" "}
                            {new Date(signup.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApprove(signup.id)}
                          disabled={actionLoading === signup.id}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === signup.id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => setDeclineModal({ id: signup.id, name: signup.organization_name })}
                          disabled={actionLoading === signup.id}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Tenants Tab */}
        {activeTab === "tenants" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Registered Tenants</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingData ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
                ) : organizations.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No tenants yet</td></tr>
                ) : (
                  organizations.map((org) => (
                    <tr key={org.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{org.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          org.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {org.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {org.is_active ? (
                          <button
                            onClick={() => handleSuspend(org.id)}
                            disabled={actionLoading === org.id}
                            className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                          >
                            {actionLoading === org.id ? "..." : "Suspend"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(org.id)}
                            disabled={actionLoading === org.id}
                            className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                          >
                            {actionLoading === org.id ? "..." : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Decline Modal */}
      {declineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Decline {declineModal.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for declining this registration.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Reason for declining..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setDeclineModal(null); setDeclineReason(""); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={!declineReason.trim() || actionLoading === declineModal.id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === declineModal.id ? "..." : "Decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}