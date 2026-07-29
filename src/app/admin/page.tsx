"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { organizationsApi, tenantApi } from "@/lib/api";

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"create" | "signups" | "list">("create");
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; slug: string; email: string; is_active: boolean }>>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  // Create tenant form
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    latitude: 0,
    longitude: 0,
    admin_email: "",
    admin_first_name: "",
    admin_last_name: "",
    admin_password: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [orgsRes, pendingRes] = await Promise.all([
        organizationsApi.list(),
        tenantApi.listPending().catch(() => ({ data: [] })),
      ]);
      setOrganizations(orgsRes.data);
      setPendingCount(pendingRes.data.length);
    } catch {
      // silently fail
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFormLoading(true);

    try {
      // Use the signup endpoint to create a pending request
      const signupRes = await tenantApi.signup({
        organization_name: formData.name,
        admin_email: formData.admin_email,
        admin_first_name: formData.admin_first_name,
        admin_last_name: formData.admin_last_name,
        admin_phone: formData.phone || undefined,
        password: formData.admin_password,
        address: formData.address || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
      });

      // Immediately approve it
      await tenantApi.approve(signupRes.data.id);

      setFormSuccess(`Tenant "${formData.name}" created successfully! Admin can login with ${formData.admin_email}`);
      setFormData({
        name: "", phone: "", address: "",
        latitude: 0, longitude: 0,
        admin_email: "", admin_first_name: "", admin_last_name: "", admin_password: "",
      });
      loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create tenant");
    } finally {
      setFormLoading(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Tenants</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {loadingOrgs ? "..." : organizations.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Active</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {loadingOrgs ? "..." : organizations.filter((o) => o.is_active).length}
            </p>
          </div>
          <div
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setActiveTab("signups"); router.push("/admin/tenants"); }}
          >
            <h3 className="text-lg font-medium text-gray-900">Pending Signups</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-blue-600 mt-1">Click to review →</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("create")}
              className={`pb-4 text-sm font-medium border-b-2 ${
                activeTab === "create"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              + Create Tenant
            </button>
            <button
              onClick={() => {
                setActiveTab("signups");
                router.push("/admin/tenants");
              }}
              className={`pb-4 text-sm font-medium border-b-2 ${
                activeTab === "signups"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Review Signups {pendingCount > 0 && `(${pendingCount})`}
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`pb-4 text-sm font-medium border-b-2 ${
                activeTab === "list"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              All Tenants ({organizations.length})
            </button>
          </nav>
        </div>

        {/* Create Tenant Form */}
        {activeTab === "create" && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Create New Tenant (Clinic)
            </h2>

            <form onSubmit={handleCreateTenant} className="space-y-6">
              {formError && (
                <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md">{formError}</div>
              )}
              {formSuccess && (
                <div className="bg-green-50 text-green-500 text-sm p-3 rounded-md">{formSuccess}</div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Clinic Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Clinic Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sunrise Clinic"
                  />
                </div>

                <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main St, City, State"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="28.6139"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="77.2090"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Clinic Admin Account</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="admin_first_name"
                      required
                      value={formData.admin_first_name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="admin_last_name"
                      required
                      value={formData.admin_last_name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Admin Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="admin_email"
                      required
                      value={formData.admin_email}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="admin@clinic.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Admin Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="admin_password"
                      required
                      minLength={8}
                      value={formData.admin_password}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Min 8 characters"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {formLoading ? "Creating..." : "Create Tenant & Admin Account"}
              </button>
            </form>
          </div>
        )}

        {/* All Tenants List */}
        {activeTab === "list" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Tenants</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingOrgs ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
                ) : organizations.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No tenants yet</td></tr>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}