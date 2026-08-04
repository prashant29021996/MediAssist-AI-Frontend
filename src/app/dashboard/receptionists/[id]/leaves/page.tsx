"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { schedulingApi, DoctorLeave } from "@/lib/api";
import { Badge, Button, Card, CardBody, CardHeader, Input, Select, Textarea, Alert, Modal } from "@/components/ui";

const leaveTypeOptions = [
  { value: "VACATION", label: "Vacation" },
  { value: "SICK_LEAVE", label: "Sick Leave" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "TRAINING", label: "Training" },
  { value: "PERSONAL", label: "Personal" },
  { value: "OTHER", label: "Other" },
];

export default function ReceptionistLeavesPage() {
  const router = useRouter();
  const params = useParams();
  const receptionistId = params.id as string;

  const [leaves, setLeaves] = useState<DoctorLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    start_datetime: "",
    end_datetime: "",
    leave_type: "VACATION",
    reason: "",
  });

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await schedulingApi.listLeaves({ user_id: receptionistId, user_type: "receptionist", page: 1, page_size: 50 });
      setLeaves(res.data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to load leaves");
    } finally {
      setLoading(false);
    }
  }, [receptionistId]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await schedulingApi.createLeave({
        user_id: receptionistId,
        user_type: "receptionist",
        start_datetime: new Date(formData.start_datetime).toISOString(),
        end_datetime: new Date(formData.end_datetime).toISOString(),
        leave_type: formData.leave_type,
        reason: formData.reason || undefined,
      });
      setSuccess("Leave created successfully");
      setShowModal(false);
      setFormData({ start_datetime: "", end_datetime: "", leave_type: "VACATION", reason: "" });
      loadLeaves();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to create leave");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this leave?")) return;
    try {
      await schedulingApi.cancelLeave(id);
      setSuccess("Leave cancelled successfully");
      loadLeaves();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to cancel leave");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/receptionists/${receptionistId}`)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          <span>←</span> Back to Receptionist
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Receptionist Leave Management</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage temporary leave records for this receptionist.
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>+ Add Leave</Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Leave Records</h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading leaves...</div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No leave records found.</div>
          ) : (
            <div className="space-y-3">
              {leaves.map((leave) => (
                <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{leave.user_name}</span>
                        <Badge variant={leave.status === "APPROVED" ? "success" : leave.status === "PENDING" ? "warning" : "danger"}>
                          {leave.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><span className="font-medium">Type:</span> {leave.leave_type.replace(/_/g, " ")}</div>
                        <div><span className="font-medium">From:</span> {formatDate(leave.start_datetime)}</div>
                        <div><span className="font-medium">To:</span> {formatDate(leave.end_datetime)}</div>
                        {leave.reason && <div><span className="font-medium">Reason:</span> {leave.reason}</div>}
                        {leave.cancelled_at && (
                          <div className="text-red-600"><span className="font-medium">Cancelled:</span> {formatDate(leave.cancelled_at)}</div>
                        )}
                        {leave.approved_at && (
                          <div className="text-green-600"><span className="font-medium">Approved:</span> {formatDate(leave.approved_at)}</div>
                        )}
                      </div>
                    </div>
                    {(leave.status === "PENDING" || leave.status === "APPROVED") && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancel(leave.id)}
                      >
                        Cancel Leave
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Receptionist Leave"
      >
        <form onSubmit={handleCreate}>
          <div className="space-y-4">
            <Select
              label="Leave Type"
              value={formData.leave_type}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
              options={leaveTypeOptions}
            />
            <Input
              label="Start Date & Time"
              type="datetime-local"
              value={formData.start_datetime}
              onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
              required
            />
            <Input
              label="End Date & Time"
              type="datetime-local"
              value={formData.end_datetime}
              onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
              required
            />
            <Textarea
              label="Reason (optional)"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={2}
              placeholder="Annual vacation..."
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {submitting ? "Creating..." : "Create Leave"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}