"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { departmentsApi, Department } from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";

export default function DepartmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission("department.update");
  const canDelete = hasPermission("department.delete");

  const [department, setDepartment] = useState<Department | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (!id) return;

    const loadDepartment = async () => {
      setLoadingData(true);
      try {
        const res = await departmentsApi.getById(id);
        const d = res.data;
        setDepartment(d);
        setFormData({
          name: d.name || "",
          description: d.description || "",
          is_active: d.is_active,
        });
      } catch (err) {
        console.error("Failed to load department:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadDepartment();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    try {
      await departmentsApi.update(id, {
        name: formData.name,
        description: formData.description || undefined,
        is_active: formData.is_active,
      });
      alert("Department updated successfully");
      const res = await departmentsApi.getById(id);
      setDepartment(res.data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to update department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this department? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      await departmentsApi.delete(id);
      router.push("/dashboard/departments");
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to delete department");
    } finally {
      setDeleting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-500">Loading department details...</div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Department not found</p>
          <Button onClick={() => router.push("/dashboard/departments")}>
            Back to Departments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <button
            onClick={() => router.push("/dashboard/departments")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            <span>←</span> Back to Departments
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {department.name}
          </h2>
          <div className="mt-2">
            <Badge variant={department.is_active ? "success" : "danger"}>
              {department.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        {canDelete && (
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleting}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Department"}
          </Button>
        )}
      </div>

      {/* Update Form / Details */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">
            {canUpdate ? "Edit Department" : "Department Details"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {canUpdate ? "Update department information" : "View department information"}
          </p>
        </CardHeader>
        <CardBody>
          {canUpdate ? (
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <Input
                  label="Department Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Cardiology"
                />

                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  placeholder="Brief description of the department..."
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active_edit"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_active_edit"
                    className="text-sm font-medium text-gray-700"
                  >
                    Active (department is available for selection)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/dashboard/departments")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={submitting} disabled={submitting}>
                  {submitting ? "Updating..." : "Update Department"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name
                </label>
                <p className="text-sm text-gray-900">{department.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-sm text-gray-900">
                  {department.description || "—"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Badge variant={department.is_active ? "success" : "danger"}>
                  {department.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/dashboard/departments")}
                >
                  Back to Departments
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}