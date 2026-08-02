"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { departmentsApi, Department, ListParams } from "@/lib/api";
import { Badge, Button, Input, Textarea } from "@/components/ui";
import { ListLayout } from "@/components/ListLayout";
import { Column } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { useAuth } from "@/lib/auth-context";

export default function DepartmentsPage() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("department.create");
  const canUpdate = hasPermission("department.update");
  const canDelete = hasPermission("department.delete");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadDepartments = useCallback(async (params?: ListParams) => {
    setLoadingData(true);
    try {
      const res = await departmentsApi.listAll(params);
      setDepartments(res.data);
      setTotalDepartments(res.total);
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Department name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await departmentsApi.create({
        name: formData.name,
        description: formData.description || undefined,
      });
      setShowModal(false);
      setFormData({ name: "", description: "" });
      setErrors({});
      loadDepartments({ page: 1, page_size: 10 });
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to create department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      await departmentsApi.delete(id);
      loadDepartments({ page: 1, page_size: 10 });
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to delete department");
    }
  };

  const columns: Column<Department>[] = [
    {
      header: "Name",
      accessor: "name",
      className: "font-medium text-gray-900",
    },
    {
      header: "Description",
      accessor: (item) => item.description || "-",
    },
    {
      header: "Status",
      accessor: (item) => (
        <Badge variant={item.is_active ? "success" : "danger"}>
          {item.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessor: (item) => {
        try {
          return new Date(item.created_at).toLocaleDateString();
        } catch {
          return "-";
        }
      },
    },
    {
      header: "Actions",
      accessor: (item) => (
        <div className="flex gap-2">
          {canUpdate && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/departments/${item.id}`);
              }}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id, item.name);
              }}
            >
              Delete
            </Button>
          )}
          {!canUpdate && !canDelete && (
            <span className="text-sm text-gray-400">View only</span>
          )}
        </div>
      ),
    },
  ];

  const handleFetch = useCallback(
    (params: { page: number; page_size: number; search: string }) => {
      loadDepartments(params);
    },
    [loadDepartments]
  );

  return (
    <>
      <ListLayout
        title="Departments"
        subtitle="Manage clinic departments"
        cardTitle="Department List"
        data={departments}
        total={totalDepartments}
        columns={columns}
        loading={loadingData}
        loadingMessage="Loading departments..."
        emptyIcon="🏥"
        emptyTitle="No Departments Yet"
        emptyDescription="Get started by adding your first department."
        recordLabel="department"
        actionLabel={canCreate ? "Add Department" : undefined}
        showAction={canCreate}
        onAction={() => setShowModal(true)}
        onRowClick={(item) => router.push(`/dashboard/departments/${item.id}`)}
        searchPlaceholder="Search departments..."
        serverSide
        onFetch={handleFetch}
      >
        {/* Create Department Modal - only rendered for users with create permission */}
        {canCreate && (
          <FormModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Add New Department"
            onSubmit={handleCreate}
            submitting={submitting}
            submitLabel="Create Department"
          >
            <Input
              label="Department Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="Cardiology"
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the department..."
            />
          </FormModal>
        )}
      </ListLayout>
    </>
  );
}