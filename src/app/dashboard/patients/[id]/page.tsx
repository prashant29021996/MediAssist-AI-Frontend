"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { patientsApi } from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
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

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (!id) return;

    const loadPatient = async () => {
      setLoadingData(true);
      try {
        const res = await patientsApi.getById(id);
        const p = res.data;
        setPatient(p);
        // Format date_of_birth for date input (YYYY-MM-DD)
        let dob = "";
        if (p.date_of_birth) {
          try {
            dob = new Date(p.date_of_birth).toISOString().split("T")[0];
          } catch {
            dob = "";
          }
        }
        setFormData({
          first_name: p.first_name || "",
          last_name: p.last_name || "",
          phone: p.phone || "",
          date_of_birth: dob,
          blood_group: p.blood_group || "",
          gender: p.gender || "",
          emergency_contact_name: p.emergency_contact_name || "",
          emergency_contact_phone: p.emergency_contact_phone || "",
          allergies: p.allergies || "",
          chronic_conditions: p.chronic_conditions || "",
          insurance_provider: p.insurance_provider || "",
          insurance_id: p.insurance_id || "",
        });
      } catch (err) {
        console.error("Failed to load patient:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadPatient();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    try {
      await patientsApi.update(id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
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
      alert("Patient updated successfully");
      // Reload patient data
      const res = await patientsApi.getById(id);
      setPatient(res.data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to update patient");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this patient? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      await patientsApi.delete(id);
      router.push("/dashboard/patients");
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to delete patient");
    } finally {
      setDeleting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-500">Loading patient details...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Patient not found</p>
          <Button onClick={() => router.push("/dashboard/patients")}>
            Back to Patients
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
            onClick={() => router.push("/dashboard/patients")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            <span>←</span> Back to Patients
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {patient.first_name} {patient.last_name}
          </h2>
          <p className="mt-1 text-sm text-gray-600">{patient.email}</p>
          <div className="mt-2">
            <Badge variant={patient.is_active ? "success" : "danger"}>
              {patient.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <Button
          variant="danger"
          onClick={handleDelete}
          loading={deleting}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Patient"}
        </Button>
      </div>

      {/* Update Form */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Edit Patient</h3>
          <p className="text-sm text-gray-500 mt-1">
            Update patient information
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4">
              {/* Personal Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Personal Information
                </h4>
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
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
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
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
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
              </div>

              {/* Emergency Contact */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Emergency Contact
                </h4>
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
              </div>

              {/* Medical Information */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Medical Information
                </h4>
                <Textarea
                  label="Allergies"
                  value={formData.allergies}
                  onChange={(e) =>
                    setFormData({ ...formData, allergies: e.target.value })
                  }
                  rows={2}
                  placeholder="Penicillin, Peanuts, etc."
                />
                <div className="mt-4">
                  <Textarea
                    label="Chronic Conditions"
                    value={formData.chronic_conditions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chronic_conditions: e.target.value,
                      })
                    }
                    rows={2}
                    placeholder="Diabetes, Hypertension, etc."
                  />
                </div>
              </div>

              {/* Insurance Information */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Insurance Information
                </h4>
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
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/dashboard/patients")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting} disabled={submitting}>
                {submitting ? "Updating..." : "Update Patient"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}