"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tenantApi } from "@/lib/api";
import { Alert, Button, Input, Textarea } from "@/components/ui";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    organization_name: "",
    admin_email: "",
    admin_first_name: "",
    admin_last_name: "",
    admin_phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    latitude: 0,
    longitude: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await tenantApi.signup({
        organization_name: formData.organization_name,
        admin_email: formData.admin_email,
        admin_first_name: formData.admin_first_name,
        admin_last_name: formData.admin_last_name,
        admin_phone: formData.admin_phone || undefined,
        password: formData.password,
        address: formData.address || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Signup Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Your clinic registration has been submitted for review. The platform admin will review
            your application and you will receive an email once approved.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Signup ID: <span className="font-mono">{formData.admin_email}</span>
          </p>
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Register Your Clinic</h1>
          <p className="mt-2 text-sm text-gray-600">
            Fill in the details below. A platform admin will review and approve your registration.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <Alert variant="error">{error}</Alert>}

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Clinic Information</h2>

            <Input
              label="Clinic Name *"
              type="text"
              name="organization_name"
              required
              value={formData.organization_name}
              onChange={handleChange}
              placeholder="Sunrise Clinic"
            />

            <Textarea
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              placeholder="123 Main St, City, State"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="28.6139"
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="77.2090"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Admin Account</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name *"
                type="text"
                name="admin_first_name"
                required
                value={formData.admin_first_name}
                onChange={handleChange}
                placeholder="John"
              />
              <Input
                label="Last Name *"
                type="text"
                name="admin_last_name"
                required
                value={formData.admin_last_name}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>

            <Input
              label="Email *"
              type="email"
              name="admin_email"
              required
              value={formData.admin_email}
              onChange={handleChange}
              placeholder="admin@clinic.com"
            />

            <Input
              label="Phone"
              type="tel"
              name="admin_phone"
              value={formData.admin_phone}
              onChange={handleChange}
              placeholder="+1234567890"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Password *"
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
              />
              <Input
                label="Confirm Password *"
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" loading={loading} className="flex-1 justify-center" size="lg">
              {loading ? "Submitting..." : "Submit Registration"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => router.push("/login")}
            >
              Back to Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}