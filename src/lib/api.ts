const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  authenticated?: boolean;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, authenticated = true } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (authenticated) {
    const token = getAccessToken();
    if (token) {
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 401) {
    // Try to refresh the token
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the original request with new token
      const newToken = getAccessToken();
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
      const retryResponse = await fetch(`${API_URL}${endpoint}`, config);
      if (!retryResponse.ok) {
        throw new ApiError("Request failed after token refresh", retryResponse.status);
      }
      return retryResponse.json();
    }
    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError("Unauthorized", 401);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(error.error || "Request failed", response.status);
  }

  return response.json();
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    setTokens(data.data.access_token, data.data.refresh_token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    request<{ data: { user: unknown; token: { access_token: string; refresh_token: string } } }>(
      "/auth/login",
      { method: "POST", body: { email, password }, authenticated: false }
    ),

  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    tenant_id: string;
    role_id: string;
  }) =>
    request<{ data: unknown }>("/auth/register", {
      method: "POST",
      body: data,
      authenticated: false,
    }),

  me: () => request<{ data: { user_id: string; email: string } }>("/auth/me"),
};

// Organizations API
export const organizationsApi = {
  list: () => request<{ data: Array<{ id: string; name: string; slug: string; email: string; is_active: boolean }> }>("/organizations"),

  getById: (id: string) =>
    request<{ data: { id: string; name: string; slug: string; email: string; is_active: boolean } }>(
      `/organizations/${id}`
    ),

  create: (data: { name: string; slug: string; email: string; phone?: string }) =>
    request<{ data: { id: string; name: string; slug: string; email: string; is_active: boolean } }>(
      "/organizations",
      { method: "POST", body: data }
    ),

  suspend: (id: string) =>
    request<{ message: string }>(`/organizations/${id}/suspend`, { method: "POST" }),

  activate: (id: string) =>
    request<{ message: string }>(`/organizations/${id}/activate`, { method: "POST" }),
};

// Tenant Signup API
export const tenantApi = {
  signup: (data: {
    organization_name: string;
    admin_email: string;
    admin_first_name: string;
    admin_last_name: string;
    admin_phone?: string;
    password: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }) =>
    request<{
      data: { id: string; organization_name: string; admin_email: string; status: string; created_at: string };
    }>("/tenants/signup", { method: "POST", body: data, authenticated: false }),

  listPending: () =>
    request<{
      data: Array<{
        id: string;
        organization_name: string;
        admin_email: string;
        admin_first_name: string;
        admin_last_name: string;
        admin_phone: string;
        address: string;
        latitude: number;
        longitude: number;
        status: string;
        created_at: string;
      }>;
    }>("/admin/tenants/pending"),

  listAll: () =>
    request<{
      data: Array<{
        id: string;
        organization_name: string;
        admin_email: string;
        status: string;
        decline_reason?: string;
        created_at: string;
        approved_at?: string;
      }>;
    }>("/admin/tenants/all"),

  approve: (id: string) =>
    request<{ message: string; data: { id: string; name: string; slug: string } }>(
      `/admin/tenants/${id}/approve`,
      { method: "POST" }
    ),

  decline: (id: string, reason: string) =>
    request<{ message: string }>(`/admin/tenants/${id}/decline`, {
      method: "POST",
      body: { reason },
    }),
};

export { setTokens, clearTokens, getAccessToken };
export type { ApiError };
