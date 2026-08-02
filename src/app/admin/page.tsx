"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { organizationsApi, tenantApi, ListParams } from "@/lib/api";
import { UserMenu } from "@/components/user-menu";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  InfoRow,
  LoadingScreen,
  Modal,
  PageHeader,
  StatCard,
  Tabs,
  TabContent,
  TabList,
  TabTrigger,
  Textarea,
} from "@/components/ui";
import { DataTable, Column } from "@/components/DataTable";

interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string;
  is_active: boolean;
}

interface PendingSignup {
  id: string;
  organization_name: string;
  admin_email: string;
  admin_first_name: string;
  admin_last_name: string;
  status: string;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const { loading, isAuthenticated, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "signups" | "tenants">("overview");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [totalOrganizations, setTotalOrganizations] = useState(0);
  const [pendingSignups, setPendingSignups] = useState<PendingSignup[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [declineModal, setDeclineModal] = useState<{ id: string; name: string } | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const loadData = useCallback(async (params?: ListParams) => {
    setLoadingData(true);
    try {
      const [orgsRes, pendingRes] = await Promise.all([
        organizationsApi.list(params),
        tenantApi.listPending().catch(() => ({ data: [] })),
      ]);
      setOrganizations(orgsRes.data);
      setTotalOrganizations(orgsRes.total);
      setPendingSignups(pendingRes.data);
    } catch {
      // silently fail
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
    if (!loading && isAuthenticated && !isSuperAdmin) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, isSuperAdmin, router]);

  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      loadData();
    }
  }, [isAuthenticated, isSuperAdmin]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await tenantApi.approve(id);
      setPendingSignups((prev) => prev.filter((s) => s.id !== id));
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!declineModal || !declineReason.trim()) return;
    setActionLoading(declineModal.id);
    try {
      await tenantApi.decline(declineModal.id, declineReason);
      setPendingSignups((prev) => prev.filter((s) => s.id !== declineModal.id));
      setDeclineModal(null);
      setDeclineReason("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to decline");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id: string) => {
    if (!confirm("Are you sure you want to suspend this tenant?")) return;
    setActionLoading(id);
    try {
      await organizationsApi.suspend(id);
      loadData({ page: 1, page_size: 10 });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to suspend");
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try {
      await organizationsApi.activate(id);
      loadData({ page: 1, page_size: 10 });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to activate");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const tenantColumns: Column<Organization>[] = [
    {
      header: "Name",
      accessor: (item) => (
        <span className="font-medium text-gray-900">{item.name}</span>
      ),
    },
    { header: "Slug", accessor: "slug" },
    { header: "Email", accessor: "email" },
    {
      header: "Status",
      accessor: (item) => (
        <Badge variant={item.is_active ? "success" : "danger"}>
          {item.is_active ? "Active" : "Suspended"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (item) =>
        item.is_active ? (
          <button
            onClick={() => handleSuspend(item.id)}
            disabled={actionLoading === item.id}
            className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
          >
            {actionLoading === item.id ? "..." : "Suspend"}
          </button>
        ) : (
          <button
            onClick={() => handleActivate(item.id)}
            disabled={actionLoading === item.id}
            className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
          >
            {actionLoading === item.id ? "..." : "Activate"}
          </button>
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Super Admin Portal"
        actions={<UserMenu badge={<Badge variant="danger">Super Admin</Badge>} />}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Tenants"
            value={loadingData ? "..." : organizations.length}
            color="blue"
          />
          <StatCard
            label="Active"
            value={loadingData ? "..." : organizations.filter((o) => o.is_active).length}
            color="green"
          />
          <StatCard
            label="Suspended"
            value={loadingData ? "..." : organizations.filter((o) => !o.is_active).length}
            color="red"
          />
          <StatCard
            label="Pending Signups"
            value={pendingSignups.length}
            color="yellow"
          />
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} defaultValue="overview">
          <TabList>
            <TabTrigger value="overview">Platform Overview</TabTrigger>
            <TabTrigger value="signups">
              Pending Signups {pendingSignups.length > 0 && `(${pendingSignups.length})`}
            </TabTrigger>
            <TabTrigger value="tenants">All Tenants ({organizations.length})</TabTrigger>
          </TabList>

          {/* Platform Overview Tab */}
          <TabContent value="overview">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Tenant Management</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <InfoRow
                    title="Review Signups"
                    description={
                      pendingSignups.length > 0
                        ? `${pendingSignups.length} clinics waiting for approval`
                        : "No pending signups"
                    }
                    color="blue"
                    action={
                      <button
                        onClick={() => setActiveTab("signups")}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Review →
                      </button>
                    }
                  />
                  <InfoRow
                    title="Manage Tenants"
                    description={`${organizations.length} registered clinics`}
                    color="green"
                    action={
                      <button
                        onClick={() => setActiveTab("tenants")}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View All →
                      </button>
                    }
                  />
                </CardBody>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Platform Info</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <InfoRow
                    title="Your Role"
                    description="Super Admin — Full platform access"
                    color="gray"
                    action={<Badge variant="danger">Active</Badge>}
                  />
                  <InfoRow
                    title="Permissions"
                    description="All 19 permissions granted"
                    color="gray"
                    action={<Badge variant="success">Full</Badge>}
                  />
                  <InfoRow
                    title="Tenant Approval"
                    description="Only you can approve new clinics"
                    color="gray"
                    action={<Badge variant="warning">Exclusive</Badge>}
                  />
                </CardBody>
              </Card>
            </div>
          </TabContent>

          {/* Pending Signups Tab */}
          <TabContent value="signups">
            {loadingData ? (
              <div className="text-center py-12 text-gray-500">Loading signups...</div>
            ) : pendingSignups.length === 0 ? (
              <Card>
                <EmptyState
                  icon="✅"
                  title="All Caught Up"
                  description="No pending clinic registration requests."
                />
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingSignups.map((signup) => (
                  <Card key={signup.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {signup.organization_name}
                          </h3>
                          <Badge variant="warning">Pending</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                          <div>
                            <span className="font-medium">Admin:</span> {signup.admin_first_name} {signup.admin_last_name}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {signup.admin_email}
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span>{" "}
                            {new Date(signup.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(signup.id)}
                          disabled={actionLoading === signup.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === signup.id ? "..." : "Approve"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeclineModal({ id: signup.id, name: signup.organization_name })}
                          disabled={actionLoading === signup.id}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabContent>

          {/* All Tenants Tab */}
          <TabContent value="tenants">
            <Card className="overflow-hidden">
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Registered Tenants</h3>
              </CardHeader>
              <CardBody>
                <DataTable
                  data={organizations}
                  columns={tenantColumns}
                  loading={loadingData}
                  loadingMessage="Loading tenants..."
                  emptyMessage="No tenants yet"
                  searchPlaceholder="Search tenants..."
                  searchable
                  serverSide
                  total={totalOrganizations}
                  onFetch={(params) => loadData(params)}
                />
              </CardBody>
            </Card>
          </TabContent>
        </Tabs>
      </main>

      {/* Decline Modal */}
      <Modal
        isOpen={!!declineModal}
        onClose={() => {
          setDeclineModal(null);
          setDeclineReason("");
        }}
        title={`Decline ${declineModal?.name ?? ""}`}
      >
        <p className="text-sm text-gray-600 mb-4">
          Please provide a reason for declining this registration.
        </p>
        <Textarea
          value={declineReason}
          onChange={(e) => setDeclineReason(e.target.value)}
          rows={3}
          placeholder="Reason for declining..."
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="secondary"
            onClick={() => {
              setDeclineModal(null);
              setDeclineReason("");
            }}
            disabled={actionLoading === declineModal?.id}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDecline}
            disabled={!declineReason.trim() || actionLoading === declineModal?.id}
          >
            {actionLoading === declineModal?.id ? "..." : "Decline"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}