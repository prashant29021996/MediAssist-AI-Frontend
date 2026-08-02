"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { receptionistsApi, departmentsApi, Department, Receptionist, ListParams } from "@/lib/api";
import { Badge, Button, Input, Modal, Select } from "@/components/ui";
import { ListLayout } from "@/components/ListLayout";
import { Column } from "@/components/DataTable";

export default function ReceptionistsPage() {
  const router = useRouter();
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [totalReceptionists, setTotalReceptionists] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    department: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadReceptionists = useCallback(async (params?: ListParams) => {
    setLoadingData(true);
    try {
      const res = await receptionistsApi.list(params);
      setReceptionists(res.data);
      setTotalReceptionists(res.total);
    } catch (err) {
      console.error("Failed to load receptionists:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const loadDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const res = await departmentsApi.list();
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {
    loadReceptionists();
  }, [loadReceptionists]);

  // Load departments when the create modal is opened
  useEffect(() => {
    if (showModal && departments.length === 0) {
      loadDepartments();
    }
  }, [showModal, departments.length]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await receptionistsApi.create({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
        department: formData.department || undefined,
      });
      setShowModal(false);
      setFormData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: "",
        department: "",
      });
      setErrors({});
      loadReceptionists({ page: 1, page_size: 10 });
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to create receptionist");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Receptionist>[] = [
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
    { header: "Department", accessor: (item) => item.department || "-" },
    {
      header: "Status",
      accessor: (item) => (
        <Badge variant={item.is_active ? "success" : "danger"}>
          {item.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const handleFetch = useCallback(
    (params: { page: number; page_size: number; search: string }) => {
      loadReceptionists(params);
    },
    [loadReceptionists]
  );

  return (
    <>
      <ListLayout
        title="Receptionists"
        subtitle="Manage front-desk staff in your clinic"
        cardTitle="Receptionist List"
        data={receptionists}
        total={totalReceptionists}
        columns={columns}
        loading={loadingData}
        loadingMessage="Loading receptionists..."
        emptyIcon="💼"
        emptyTitle="No Receptionists Yet"
        emptyDescription="Get started by adding your first receptionist."
        recordLabel="receptionist"
        actionLabel="Add Receptionist"
        onAction={() => setShowModal(true)}
        onRowClick={(item) =>
          router.push(`/dashboard/receptionists/${item.id}`)
        }
        searchPlaceholder="Search receptionists..."
        serverSide
        onFetch={handleFetch}
      >
        {/* Create Receptionist Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add New Receptionist"
        >
          <form onSubmit={handleCreate}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  error={errors.first_name}
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
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
                label="Temporary Password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                error={errors.password}
                placeholder="Min. 8 characters"
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />

              <Select
                label="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                options={[
                  { value: "", label: loadingDepartments ? "Loading..." : "Select a department" },
                  ...departments.map((dept) => ({
                    value: dept.name,
                    label: dept.name,
                  })),
                ]}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The receptionist will be required to change
                  their password on first login.
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
                {submitting ? "Creating..." : "Create Receptionist"}
              </Button>
            </div>
          </form>
        </Modal>
      </ListLayout>
    </>
  );
}