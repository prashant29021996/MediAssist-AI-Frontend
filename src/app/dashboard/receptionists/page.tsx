"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { receptionistsApi } from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Input,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

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

export default function ReceptionistsPage() {
  const router = useRouter();
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    department: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadReceptionists = async () => {
    setLoadingData(true);
    try {
      const res = await receptionistsApi.list();
      setReceptionists(res.data);
    } catch (err) {
      console.error("Failed to load receptionists:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadReceptionists();
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
      loadReceptionists();
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to create receptionist");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Receptionists</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage front-desk staff in your clinic
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Receptionist List</h3>
              <p className="text-sm text-gray-500 mt-1">
                {receptionists.length} receptionist{receptionists.length !== 1 ? "s" : ""} registered
              </p>
            </div>
            <Button onClick={() => setShowModal(true)}>Add Receptionist</Button>
          </div>
        </CardHeader>
        <CardBody>
          {loadingData ? (
            <div className="text-center py-12 text-gray-500">Loading receptionists...</div>
          ) : receptionists.length === 0 ? (
            <EmptyState
              icon="💼"
              title="No Receptionists Yet"
              description="Get started by adding your first receptionist."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receptionists.map((receptionist) => (
                  <TableRow
                    key={receptionist.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      router.push(`/dashboard/receptionists/${receptionist.id}`)
                    }
                  >
                    <TableCell className="font-medium text-gray-900">
                      {receptionist.first_name} {receptionist.last_name}
                    </TableCell>
                    <TableCell>{receptionist.email}</TableCell>
                    <TableCell>{receptionist.phone || "-"}</TableCell>
                    <TableCell>{receptionist.department || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={receptionist.is_active ? "success" : "danger"}>
                        {receptionist.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

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

            <Input
              label="Department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              placeholder="Front Desk"
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
    </div>
  );
}