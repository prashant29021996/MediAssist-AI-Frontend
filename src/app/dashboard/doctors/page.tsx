"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doctorsApi, Doctor, departmentsApi, Department, ListParams } from "@/lib/api";
import { Badge, Button, Input, Modal, Select, Textarea } from "@/components/ui";
import { ListLayout } from "@/components/ListLayout";
import { Column } from "@/components/DataTable";

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    temporary_password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    specialization: "",
    registration_number: "",
    consultation_fee: "",
    qualification: "",
    biography: "",
    department_id: "",
    years_of_experience: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadDoctors = useCallback(async (params?: ListParams) => {
    setLoadingData(true);
    try {
      const res = await doctorsApi.list(params);
      setDoctors(res.data);
      setTotalDoctors(res.total);
    } catch (err) {
      console.error("Failed to load doctors:", err);
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
    loadDoctors();
  }, [loadDoctors]);

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
    if (!formData.temporary_password || formData.temporary_password.length < 8) {
      newErrors.temporary_password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await doctorsApi.create({
        email: formData.email,
        temporary_password: formData.temporary_password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        registration_number: formData.registration_number,
        specialization: formData.specialization,
        qualification: formData.qualification,
        department_id: formData.department_id,
        years_of_experience: formData.years_of_experience
          ? parseInt(formData.years_of_experience, 10)
          : 0,
        consultation_fee: formData.consultation_fee
          ? parseFloat(formData.consultation_fee)
          : 0,
        biography: formData.biography || undefined,
        languages: "",
      });
      setShowModal(false);
      setFormData({
        email: "",
        temporary_password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        specialization: "",
        registration_number: "",
        consultation_fee: "",
        qualification: "",
        biography: "",
        department_id: "",
        years_of_experience: "",
      });
      setErrors({});
      loadDoctors({ page: 1, page_size: 10 });
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to create doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Doctor>[] = [
    {
      header: "Name",
      accessor: (item) => (
        <span className="font-medium text-gray-900">
          {item.first_name} {item.last_name}
        </span>
      ),
    },
    { header: "Email", accessor: "email" },
    { header: "Specialization", accessor: (item) => item.specialization || "-" },
    { header: "License #", accessor: (item) => item.registration_number || "-" },
    {
      header: "Fee",
      accessor: (item) =>
        item.consultation_fee ? `$${item.consultation_fee}` : "-",
    },
    {
      header: "Status",
      accessor: (item) => (
        <div className="flex gap-2">
          <Badge variant={item.status === "ACTIVE" ? "success" : "danger"}>
            {item.status === "ACTIVE" ? "Active" : "Inactive"}
          </Badge>
          {item.is_available && <Badge variant="info">Available</Badge>}
        </div>
      ),
    },
  ];

  const handleFetch = useCallback(
    (params: { page: number; page_size: number; search: string }) => {
      loadDoctors(params);
    },
    [loadDoctors]
  );

  return (
    <>
      <ListLayout
        title="Doctors"
        subtitle="Manage doctors in your clinic"
        cardTitle="Doctor List"
        data={doctors}
        total={totalDoctors}
        columns={columns}
        loading={loadingData}
        loadingMessage="Loading doctors..."
        emptyIcon="👨‍⚕️"
        emptyTitle="No Doctors Yet"
        emptyDescription="Get started by adding your first doctor."
        recordLabel="doctor"
        actionLabel="Add Doctor"
        onAction={() => setShowModal(true)}
        onRowClick={(item) => router.push(`/dashboard/doctors/${item.id}`)}
        searchPlaceholder="Search doctors..."
        serverSide
        onFetch={handleFetch}
      >
        {/* Create Doctor Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add New Doctor"
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
                value={formData.temporary_password}
                onChange={(e) =>
                  setFormData({ ...formData, temporary_password: e.target.value })
                }
                error={errors.temporary_password}
                placeholder="Min. 8 characters"
              />

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
                rows={3}
                placeholder="Brief bio about the doctor..."
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Department"
                  value={formData.department_id}
                  onChange={(e) =>
                    setFormData({ ...formData, department_id: e.target.value })
                  }
                  options={[
                    { value: "", label: loadingDepartments ? "Loading..." : "Select a department" },
                    ...departments.map((dept) => ({
                      value: dept.id,
                      label: dept.name,
                    })),
                  ]}
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  value={formData.years_of_experience}
                  onChange={(e) =>
                    setFormData({ ...formData, years_of_experience: e.target.value })
                  }
                  placeholder="5"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The doctor will be required to change their
                  password on first login.
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
                {submitting ? "Creating..." : "Create Doctor"}
              </Button>
            </div>
          </form>
        </Modal>
      </ListLayout>
    </>
  );
}