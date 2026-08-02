"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { usersApi, ListParams } from "@/lib/api";
import { UserMenu } from "@/components/user-menu";
import {
  Badge,
  Button,
  Input,
  LoadingScreen,
  Modal,
  PageHeader,
  Select,
} from "@/components/ui";
import { DropdownItem } from "@/components/ui/dropdown";
import { ListLayout } from "@/components/ListLayout";
import { Column } from "@/components/DataTable";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role_id: string;
  tenant_id: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  slug: string;
}

export default function UsersPage() {
  const { user, loading, isAuthenticated, hasPermission } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role_id: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
    if (!loading && isAuthenticated && !hasPermission("user.create")) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, hasPermission, router]);

  const loadData = useCallback(async (params?: ListParams) => {
    setLoadingData(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        usersApi.list(params),
        usersApi.listRoles(),
      ]);
      setUsers(usersRes.data);
      setTotalUsers(usersRes.total);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && hasPermission("user.create")) {
      loadData();
    }
  }, [isAuthenticated, hasPermission]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.role_id) newErrors.role_id = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await usersApi.create(formData);
      setShowModal(false);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        role_id: "",
      });
      setErrors({});
      loadData({ page: 1, page_size: 10 });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    if (!confirm("Are you sure you want to change this user's status?")) return;

    try {
      await usersApi.toggleActive(id);
      loadData({ page: 1, page_size: 10 });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || "Failed to update user");
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const columns: Column<User>[] = [
    {
      header: "Name",
      accessor: (item) => (
        <span className="font-medium text-gray-900">
          {item.first_name} {item.last_name}
        </span>
      ),
    },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: (item) => item.phone || "-" },
    {
      header: "Status",
      accessor: (item) => (
        <Badge variant={item.is_active ? "success" : "danger"}>
          {item.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Password",
      accessor: (item) =>
        item.must_change_password ? (
          <Badge variant="warning">Must Change</Badge>
        ) : (
          <Badge variant="gray">Set</Badge>
        ),
    },
    {
      header: "Actions",
      accessor: (item) => (
        <button
          onClick={() => handleToggleActive(item.id)}
          className={
            item.is_active
              ? "text-red-600 hover:text-red-800"
              : "text-green-600 hover:text-green-800"
          }
        >
          {item.is_active ? "Deactivate" : "Activate"}
        </button>
      ),
    },
  ];

  const handleFetch = useCallback(
    (params: { page: number; page_size: number; search: string }) => {
      loadData(params);
    },
    [loadData]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="User Management"
        subtitle={user?.email}
        actions={
          <UserMenu
            extraItems={
              <>
                <DropdownItem onClick={() => router.push("/dashboard")}>
                  Dashboard
                </DropdownItem>
                <DropdownItem onClick={() => router.push("/admin")}>
                  Admin Portal
                </DropdownItem>
              </>
            }
          />
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ListLayout
          cardTitle="Staff Members"
          cardDescription="Manage doctors, receptionists, and other staff"
          data={users}
          total={totalUsers}
          columns={columns}
          loading={loadingData}
          loadingMessage="Loading users..."
          emptyIcon="👥"
          emptyTitle="No Users Yet"
          emptyDescription="Get started by adding your first staff member."
          recordLabel="user"
          actionLabel="Add User"
          onAction={() => setShowModal(true)}
          showPageHeader={false}
          searchPlaceholder="Search users..."
          serverSide
          onFetch={handleFetch}
        >
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    error={errors.first_name}
                    placeholder="John"
                  />
                  <Input
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    error={errors.last_name}
                    placeholder="Doe"
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                  placeholder="john.doe@clinic.com"
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />

                <Input
                  label="Temporary Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                  placeholder="Min. 8 characters"
                />

                <Select
                  label="Role"
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  error={errors.role_id}
                  options={[
                    { value: "", label: "Select a role..." },
                    ...roles.map((r) => ({ value: r.id, label: r.name })),
                  ]}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The user will be required to change their password on first login.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  {submitting ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </Modal>
        </ListLayout>
      </main>
    </div>
  );
}