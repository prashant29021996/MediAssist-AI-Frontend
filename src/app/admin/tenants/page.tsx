"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { tenantApi } from "@/lib/api";

interface PendingSignup {
  id: string;
  organization_name: string;
  admin_email: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_phone: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
}

export default function AdminTenantsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [signups, setSignups] = useState<PendingSignup[]>([]);
  const [loadingSignups, setLoadingSignups] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [declineModal, setDeclineModal] = useState<{ id: string; name: string } | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSignups();
    }
  }, [isAuthenticated]);

  const loadSignups = async () => {
    try {
      const res = await tenantApi.listPending();
      setSignups(res.data);
    } catch {
      // silently fail
    } finally {
      setLoadingSignups(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await tenantApi.approve(id);
      setSignups((prev) => prev.filter((s) => s.id !== id));
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
      setSignups((prev) => prev.filter((s) => s.id !== declineModal.id));
      setDeclineModal(null);
      setDeclineReason("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to decline");
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
          <h1 className="text-2xl font-bold text-gray-900">MediAssist Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Pending Tenant Signups</h2>
          <p className="mt-1 text-sm text-gray-600">
            Review and approve clinic registration requests.
          </p>
        </div>

        {loadingSignups ? (
          <div className="text-center py-12 text-gray-500">Loading signups...</div>
        ) : signups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Signups</h3>
            <p className="text-gray-500">
              All clinic registration requests have been processed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {signups.map((signup) => (
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
                        <span className="font-medium">Admin:</span> {signup.admin_first_name}{" "}
                        {signup.admin_last_name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {signup.admin_email}
                      </div>
                      {signup.admin_phone && (
                        <div>
                          <span className="font-medium">Phone:</span> {signup.admin_phone}
                        </div>
                      )}
                      {signup.address && (
                        <div>
                          <span className="font-medium">Address:</span> {signup.address}
                        </div>
                      )}
                      {(signup.latitude || signup.longitude) && (
                        <div>
                          <span className="font-medium">Location:</span> {signup.latitude},{" "}
                          {signup.longitude}
                        </div>
                      )}
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
                      onClick={() =>
                        setDeclineModal({ id: signup.id, name: signup.organization_name })
                      }
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
                onClick={() => {
                  setDeclineModal(null);
                  setDeclineReason("");
                }}
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