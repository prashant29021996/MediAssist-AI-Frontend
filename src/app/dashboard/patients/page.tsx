"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { patientsApi, Patient, ListParams } from "@/lib/api";
import { Badge, Button, Input, Modal, Select, Textarea } from "@/components/ui";
import { ListLayout } from "@/components/ListLayout";
import { Column } from "@/components/DataTable";

const bloodGroupOptions = [
  { value: "", label: "Select..." },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

const genderOptions = [
  { value: "", label: "Select..." },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
    blood_group: "",
    gender: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    allergies: "",
    chronic_conditions: "",
    insurance_provider: "",
    insurance_id: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadPatients = useCallback(async (params?: ListParams) => {
    setLoadingData(true);
    try {
      const res = await patientsApi.list(params);
      setPatients(res.data);
      setTotalPatients(res.total);
    } catch (err) {
      console.error("Failed to load patients:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

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
      await patientsApi.create({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        blood_group: formData.blood_group || undefined,
        gender: formData.gender || undefined,
        emergency_contact_name: formData.emergency_contact_name || undefined,
        emergency_contact_phone: formData.emergency_contact_phone || undefined,
        allergies: formData.allergies || undefined,
        chronic_conditions: formData.chronic_conditions || undefined,
        insurance_provider: formData.insurance_provider || undefined,
        insurance_id: formData.insurance_id || undefined,
      });
      setShowModal(false);
      setFormData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: "",
        date_of_birth: "",
        blood_group: "",
        gender: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        allergies: "",
        chronic_conditions: "",
        insurance_provider: "",
        insurance_id: "",
      });
      setErrors({});
      loadPatients({ page: 1, page_size: 10 });
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to create patient");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const columns: Column<Patient>[] = [
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
    { header: "Blood Group", accessor: (item) => item.blood_group || "-" },
    {
      header: "Gender",
      accessor: (item) => (
        <span className="capitalize">{item.gender || "-"}</span>
      ),
    },
    { header: "DOB", accessor: (item) => formatDate(item.date_of_birth) },
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
      loadPatients(params);
    },
    [loadPatients]
  );

  return (
    <>
      <ListLayout
        title="Patients"
        subtitle="Manage patients in your clinic"
        cardTitle="Patient List"
        data={patients}
        total={totalPatients}
        columns={columns}
        loading={loadingData}
        loadingMessage="Loading patients..."
        emptyIcon="🩺"
        emptyTitle="No Patients Yet"
        emptyDescription="Get started by adding your first patient."
        recordLabel="patient"
        actionLabel="Add Patient"
        onAction={() => setShowModal(true)}
        onRowClick={(item) => router.push(`/dashboard/patients/${item.id}`)}
        searchPlaceholder="Search patients..."
        serverSide
        onFetch={handleFetch}
      >
        {/* Create Patient Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add New Patient"
        >
          <form onSubmit={handleCreate}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
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
                placeholder="john.doe@example.com"
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

              <Input
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Blood Group"
                  value={formData.blood_group}
                  onChange={(e) =>
                    setFormData({ ...formData, blood_group: e.target.value })
                  }
                  options={bloodGroupOptions}
                />
                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  options={genderOptions}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Emergency Contact Name"
                  value={formData.emergency_contact_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergency_contact_name: e.target.value,
                    })
                  }
                  placeholder="Jane Doe"
                />
                <Input
                  label="Emergency Contact Phone"
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergency_contact_phone: e.target.value,
                    })
                  }
                  placeholder="+1 (555) 987-6543"
                />
              </div>

              <Textarea
                label="Allergies"
                value={formData.allergies}
                onChange={(e) =>
                  setFormData({ ...formData, allergies: e.target.value })
                }
                rows={2}
                placeholder="Penicillin, Peanuts, etc."
              />

              <Textarea
                label="Chronic Conditions"
                value={formData.chronic_conditions}
                onChange={(e) =>
                  setFormData({ ...formData, chronic_conditions: e.target.value })
                }
                rows={2}
                placeholder="Diabetes, Hypertension, etc."
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Insurance Provider"
                  value={formData.insurance_provider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insurance_provider: e.target.value,
                    })
                  }
                  placeholder="Blue Cross"
                />
                <Input
                  label="Insurance ID"
                  value={formData.insurance_id}
                  onChange={(e) =>
                    setFormData({ ...formData, insurance_id: e.target.value })
                  }
                  placeholder="INS-12345"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The patient will be required to change their
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
                {submitting ? "Creating..." : "Create Patient"}
              </Button>
            </div>
          </form>
        </Modal>
      </ListLayout>
    </>
  );
}