"use client";

import { useEffect, useState, useCallback } from "react";
import { schedulingApi, DoctorLeave } from "@/lib/api";
import { Badge, Button, Card, CardBody, CardHeader, Alert } from "@/components/ui";

export default function LeaveApprovalPage() {
  const [leaves, setLeaves] = useState<DoctorLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPendingLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await schedulingApi.listLeaves({ page: 1, page_size: 100 });
      // Filter to show only PENDING leaves
      const pendingLeaves = res.data.filter(leave => leave.status === "PENDING");
      setLeaves(pendingLeaves);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingLeaves();
  }, [loadPendingLeaves]);

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this leave request?")) return;
    
    setProcessingId(id);
    setError("");
    setSuccess("");
    try {
      await schedulingApi.approveLeave(id);
      setSuccess("Leave approved successfully");
      loadPendingLeaves();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to approve leave");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this leave request?")) return;
    
    setProcessingId(id);
    setError("");
    setSuccess("");
    try {
      await schedulingApi.rejectLeave(id);
      setSuccess("Leave rejected successfully");
      loadPendingLeaves();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to reject leave");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      case "CANCELLED":
        return "danger";
      default:
        return "gray";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Leave Approval Management</h2>
        <p className="mt-1 text-sm text-gray-600">
          Review and approve or reject leave requests from doctors and receptionists.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Pending Leave Requests</h3>
          <p className="text-sm text-gray-500 mt-1">
            {leaves.length} pending request{leaves.length !== 1 ? "s" : ""} requiring approval
          </p>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading leave requests...</div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No pending leave requests found.</div>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{leave.user_name}</span>
                        <Badge variant={getStatusBadgeVariant(leave.status)}>
                          {leave.status}
                        </Badge>
                        <Badge variant="gray">
                          {leave.user_type === "doctor" ? "Doctor" : "Receptionist"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><span className="font-medium">Leave Type:</span> {leave.leave_type.replace(/_/g, " ")}</div>
                        <div><span className="font-medium">From:</span> {formatDate(leave.start_datetime)}</div>
                        <div><span className="font-medium">To:</span> {formatDate(leave.end_datetime)}</div>
                        {leave.reason && <div><span className="font-medium">Reason:</span> {leave.reason}</div>}
                        <div><span className="font-medium">Requested On:</span> {formatDate(leave.created_at)}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(leave.id)}
                        disabled={processingId === leave.id}
                      >
                        {processingId === leave.id ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(leave.id)}
                        disabled={processingId === leave.id}
                      >
                        {processingId === leave.id ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}