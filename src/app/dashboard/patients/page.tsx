"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { patientsApi } from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Input,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@/components/ui";

interface Patient {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role_id: string;
  is_active: boolean;
  date_of_birth?: string;
  blood_group: string;
  gender: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  allergies: string;
  chronic_conditions: string;
  insurance_provider: string;
  insurance_id: string;
  created_at: string;
}

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

  const loadPatients = async () => {
    setLoadingData(true);
    try {
      const res = await patientsApi.list();
      setPatients(res.data);
    } catch (err) {
      console.error("Failed to load patients:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

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
      loadPatients();
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Patients</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage patients in your clinic
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Patient List</h3>
              <p className="text-sm text-gray-500 mt-1">
                {patients.length} patient{patients.length !== 1 ? "s" : ""} registered
              </p>
            </div>
            <Button onClick={() => setShowModal(true)}>Add Patient</Button>
          </div>
        </CardHeader>
        <CardBody>
          {loadingData ? (
            <div className="text-center py-12 text-gray-500">Loading patients...</div>
          ) : patients.length === 0 ? (
            <EmptyState
              icon="🩺"
              title="No Patients Yet"
              description="Get started by adding your first patient."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                  >
                    <TableCell className="font-medium text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone || "-"}</TableCell>
                    <TableCell>{patient.blood_group || "-"}</TableCell>
                    <TableCell className="capitalize">{patient.gender || "-"}</TableCell>
                    <TableCell>{formatDate(patient.date_of_birth)}</TableCell>
                    <TableCell>
                      <Badge variant={patient.is_active ? "success" : "danger"}>
                        {patient.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

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
    </div>
  );
}