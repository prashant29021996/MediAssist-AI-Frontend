"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";
import { Badge, Card, CardBody, CardHeader, Button, LoadingScreen } from "@/components/ui";
import Link from "next/link";

interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: string;
  role_name: string;
  tenant_id: string;
  permissions: string[];
  profile_id?: string;
  doctor_profile_id?: string;
  receptionist_profile_id?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await authApi.me();
        setProfile(response.data as UserProfile);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-500">Failed to load profile</div>
      </div>
    );
  }

  const isDoctor = profile.role_name === "Doctor";
  const isReceptionist = profile.role_name === "Receptionist";
  const profileId = profile.doctor_profile_id || profile.receptionist_profile_id || profile.profile_id || profile.user_id;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
        <p className="mt-1 text-sm text-gray-600">
          View and manage your personal information
        </p>
      </div>

      {/* Profile Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-medium">
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {profile.first_name} {profile.last_name}
              </h3>
              <p className="text-sm text-gray-600">{profile.email}</p>
              <div className="mt-1">
                <Badge variant="info">
                  {profile.role_name}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">First Name</label>
                <p className="text-gray-900">{profile.first_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Name</label>
                <p className="text-gray-900">{profile.last_name}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{profile.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="text-gray-900">{profile.role_name}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions Card */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage your leaves and schedule
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isDoctor || isReceptionist) && (
              <Link href={`/dashboard/${isDoctor ? "doctors" : "receptionists"}/${profileId}/leaves`}>
                <Button variant="secondary" className="w-full">
                  🏖️ Manage My Leaves
                </Button>
              </Link>
            )}
            {isDoctor && (
              <Link href={`/dashboard/doctors/${profileId}/schedule`}>
                <Button variant="secondary" className="w-full">
                  🕐 View My Schedule
                </Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-2 text-sm text-gray-600">
            <p>User ID: {profile.user_id}</p>
            <p>Tenant ID: {profile.tenant_id}</p>
            <p>Role ID: {profile.role_id}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}