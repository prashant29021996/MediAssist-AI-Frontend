"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { receptionistsApi } from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";

interface Receptionist {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role_id: string;
  is_active: boolean;
  department: string;
  created_at: string;
}

export default function ReceptionistDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = useAuth();

  const [receptionist, setReceptionist] = useState<Receptionist | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Only clinic admin can update/delete receptionists
  const canEdit = hasPermission("user.update");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    department: "",
  });

  useEffect(() => {
    if (!id) return;

    const loadReceptionist = async () => {
      setLoadingData(true);
      try {
        const res = await receptionistsApi.getById(id);
        const r = res.data;
        setReceptionist(r);
        setFormData({
          first_name: r.first_name || "",
          last_name: r.last_name || "",
          phone: r.phone || "",
          department: r.department || "",
        });
      } catch (err) {
        console.error("Failed to load receptionist:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadReceptionist();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    try {
      await receptionistsApi.update(id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        department: formData.department,
      });
      alert("Receptionist updated successfully");
      // Reload receptionist data
      const res = await receptionistsApi.getById(id);
      setReceptionist(res.data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to update receptionist");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this receptionist? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      await receptionistsApi.delete(id);
      router.push("/dashboard/receptionists");
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to delete receptionist");
    } finally {
      setDeleting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-500">Loading receptionist details...</div>
      </div>
    );
  }

  if (!receptionist) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Receptionist not found</p>
          <Button onClick={() => router.push("/dashboard/receptionists")}>
            Back to Receptionists
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
            onClick={() => router.push("/dashboard/receptionists")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            <span>←</span> Back to Receptionists
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {receptionist.first_name} {receptionist.last_name}
          </h2>
          <p className="mt-1 text-sm text-gray-600">{receptionist.email}</p>
          <div className="mt-2">
            <Badge variant={receptionist.is_active ? "success" : "danger"}>
              {receptionist.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <Button
          variant="danger"
          onClick={handleDelete}
          loading={deleting}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Receptionist"}
        </Button>
      </div>

      {/* Leave Management Link */}
      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Leave Management</h3>
          <p className="text-sm text-gray-500 mt-1">
            View and manage leave records for this receptionist
          </p>
        </CardHeader>
        <CardBody>
          <Link href={`/dashboard/receptionists/${id}/leaves`}>
            <Button variant="secondary" className="w-full">
              Manage Leaves
            </Button>
          </Link>
        </CardBody>
      </Card>

      {canEdit && (
        <>
          {/* Update Form */}
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Edit Receptionist</h3>
              <p className="text-sm text-gray-500 mt-1">
                Update receptionist information
              </p>
            </CardHeader>
        <CardBody>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  placeholder="Doe"
                />
              </div>

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />

              <Input
                label="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Front Desk"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/dashboard/receptionists")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting} disabled={submitting}>
                {submitting ? "Updating..." : "Update Receptionist"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Delete Button - Only for Clinic Admin */}
      <div className="mt-6">
        <Button
          variant="danger"
          onClick={handleDelete}
          loading={deleting}
          disabled={deleting}
          className="w-full"
        >
          {deleting ? "Deleting..." : "Delete Receptionist"}
        </Button>
      </div>
    </>
      )}
    </div>
  );
}
