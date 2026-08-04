"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doctorsApi, Doctor } from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
} from "@/components/ui";

export default function DoctorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    specialization: "",
    registration_number: "",
    consultation_fee: "",
    qualification: "",
    biography: "",
    is_available: true,
  });

  useEffect(() => {
    if (!id) return;

    const loadDoctor = async () => {
      setLoadingData(true);
      try {
        const res = await doctorsApi.getById(id);
        const d = res.data;
        setDoctor(d);
        setFormData({
          first_name: d.first_name || "",
          last_name: d.last_name || "",
          phone_number: d.phone_number || "",
          specialization: d.specialization || "",
          registration_number: d.registration_number || "",
          consultation_fee: d.consultation_fee ? String(d.consultation_fee) : "",
          qualification: d.qualification || "",
          biography: d.biography || "",
          is_available: d.is_available ?? true,
        });
      } catch (err) {
        console.error("Failed to load doctor:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadDoctor();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    try {
      await doctorsApi.update(id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        specialization: formData.specialization,
        registration_number: formData.registration_number,
        consultation_fee: formData.consultation_fee
          ? parseFloat(formData.consultation_fee)
          : undefined,
        qualification: formData.qualification,
        biography: formData.biography,
        is_available: formData.is_available,
      });
      alert("Doctor updated successfully");
      // Reload doctor data
      const res = await doctorsApi.getById(id);
      setDoctor(res.data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to update doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      await doctorsApi.delete(id);
      router.push("/dashboard/doctors");
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to delete doctor");
    } finally {
      setDeleting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-500">Loading doctor details...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Doctor not found</p>
          <Button onClick={() => router.push("/dashboard/doctors")}>
            Back to Doctors
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
            onClick={() => router.push("/dashboard/doctors")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            <span>←</span> Back to Doctors
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {doctor.first_name} {doctor.last_name}
          </h2>
          <p className="mt-1 text-sm text-gray-600">{doctor.email}</p>
          <div className="mt-2 flex gap-2">
            <Badge variant={doctor.status === "ACTIVE" ? "success" : "danger"}>
              {doctor.status === "ACTIVE" ? "Active" : "Inactive"}
            </Badge>
            {doctor.is_available && <Badge variant="info">Available</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push(`/dashboard/doctors/${id}/schedule`)}
          >
            🕐 Working Schedule
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleting}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Doctor"}
          </Button>
        </div>
      </div>

      {/* Update Form */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Edit Doctor</h3>
          <p className="text-sm text-gray-500 mt-1">
            Update doctor information
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
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />

              <Input
                label="Specialization"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                placeholder="Cardiology"
              />

              <Input
                label="License Number"
                value={formData.registration_number}
                onChange={(e) =>
                  setFormData({ ...formData, registration_number: e.target.value })
                }
                placeholder="MD-12345"
              />

              <Input
                label="Consultation Fee ($)"
                type="number"
                value={formData.consultation_fee}
                onChange={(e) =>
                  setFormData({ ...formData, consultation_fee: e.target.value })
                }
                placeholder="100"
              />

              <Textarea
                label="Qualifications"
                value={formData.qualification}
                onChange={(e) =>
                  setFormData({ ...formData, qualification: e.target.value })
                }
                rows={2}
                placeholder="MD, PhD in Cardiology"
              />

              <Textarea
                label="Bio"
                value={formData.biography}
                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                rows={4}
                placeholder="Brief bio about the doctor..."
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available_edit"
                  checked={formData.is_available}
                  onChange={(e) =>
                    setFormData({ ...formData, is_available: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_available_edit"
                  className="text-sm font-medium text-gray-700"
                >
                  Available for appointments
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/dashboard/doctors")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting} disabled={submitting}>
                {submitting ? "Updating..." : "Update Doctor"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
