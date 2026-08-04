const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  authenticated?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
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

  me: () =>
    request<{
      data: {
        user_id: string;
        email: string;
        role_id?: string;
        role_name?: string;
        tenant_id?: string;
        permissions?: string[];
      };
    }>("/auth/me"),

  changePassword: (oldPassword: string, newPassword: string) =>
    request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: { old_password: oldPassword, new_password: newPassword },
    }),
};

// Organizations API
export const organizationsApi = {
  list: (params?: ListParams) =>
    request<PaginatedResponse<{ id: string; name: string; slug: string; email: string; timezone: string; currency: string; is_active: boolean }>>(
      `/organizations${buildQuery(params)}`
    ),

  getById: (id: string) =>
    request<{ data: { id: string; name: string; slug: string; email: string; timezone: string; currency: string; is_active: boolean } }>(
      `/organizations/${id}`
    ),

  create: (data: { name: string; slug: string; email: string; phone?: string; timezone?: string; currency?: string }) =>
    request<{ data: { id: string; name: string; slug: string; email: string; timezone: string; currency: string; is_active: boolean } }>(
      "/organizations",
      { method: "POST", body: data }
    ),

  suspend: (id: string) =>
    request<{ message: string }>(`/organizations/${id}/suspend`, { method: "POST" }),

  activate: (id: string) =>
    request<{ message: string }>(`/organizations/${id}/activate`, { method: "POST" }),
};

// Users API
export const usersApi = {
  list: (params?: ListParams) =>
    request<PaginatedResponse<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
      role_id: string;
      tenant_id: string;
      is_active: boolean;
      must_change_password: boolean;
      created_at: string;
    }>>(`/users${buildQuery(params)}`),

  listRoles: () =>
    request<{ data: Array<{ id: string; name: string; slug: string }> }>("/users/roles"),

  create: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    role_id: string;
  }) =>
    request<{ data: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
      role_id: string;
      tenant_id: string;
      is_active: boolean;
      must_change_password: boolean;
      created_at: string;
    } }>("/users", { method: "POST", body: data }),

  getById: (id: string) =>
    request<{ data: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
      role_id: string;
      tenant_id: string;
      is_active: boolean;
      must_change_password: boolean;
      created_at: string;
    } }>(`/users/${id}`),

  toggleActive: (id: string) =>
    request<{ data: unknown; message: string }>(`/users/${id}/toggle-active`, { method: "POST" }),
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
    timezone?: string;
    currency?: string;
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
        timezone: string;
        currency: string;
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

// Doctor types
export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  department_id?: string;
  specialization: string;
  qualification: string;
  registration_number: string;
  years_of_experience: number;
  consultation_fee: number;
  languages: string;
  biography: string;
  status: string;
  is_available?: boolean;
  created_at: string;
}

// Doctors API
export const doctorsApi = {
  list: (params?: ListParams) =>
    request<PaginatedResponse<Doctor>>(`/doctors${buildQuery(params)}`),

  getById: (id: string) =>
    request<{ data: Doctor }>(`/doctors/${id}`),

  create: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    temporary_password: string;
    registration_number: string;
    department_id: string;
    qualification: string;
    specialization: string;
    years_of_experience: number;
    consultation_fee: number;
    languages?: string;
    biography?: string;
  }) =>
    request<{ data: Doctor }>("/doctors", { method: "POST", body: data }),

  update: (id: string, data: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    registration_number?: string;
    department_id?: string;
    qualification?: string;
    specialization?: string;
    years_of_experience?: number;
    consultation_fee?: number;
    languages?: string;
    biography?: string;
    is_available?: boolean;
  }) =>
    request<{ data: Doctor }>(`/doctors/${id}`, { method: "PUT", body: data }),

  delete: (id: string) =>
    request<{ message: string }>(`/doctors/${id}`, { method: "DELETE" }),
};

// Department types
export interface Department {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

// Receptionist types
export interface Receptionist {
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

// Patient types
export interface Patient {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role_id: string;
  is_active: boolean;
  medical_record_number: string;
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

// Departments API
export const departmentsApi = {
  list: () =>
    request<{ data: Department[] }>("/departments"),

  listAll: (params?: ListParams) =>
    request<PaginatedResponse<Department>>(`/departments/all${buildQuery(params)}`),

  getById: (id: string) =>
    request<{ data: Department }>(`/departments/${id}`),

  create: (data: {
    name: string;
    description?: string;
  }) =>
    request<{ data: Department }>("/departments", { method: "POST", body: data }),

  update: (id: string, data: {
    name?: string;
    description?: string;
    is_active?: boolean;
  }) =>
    request<{ data: Department }>(`/departments/${id}`, { method: "PUT", body: data }),

  delete: (id: string) =>
    request<{ message: string }>(`/departments/${id}`, { method: "DELETE" }),
};

// Receptionists API
export const receptionistsApi = {
  list: (params?: ListParams) =>
    request<PaginatedResponse<Receptionist>>(`/receptionists${buildQuery(params)}`),

  getById: (id: string) =>
    request<{ data: {
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
    } }>(`/receptionists/${id}`),

  create: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    department?: string;
  }) =>
    request<{ data: {
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
    } }>("/receptionists", { method: "POST", body: data }),

  update: (id: string, data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    department?: string;
  }) =>
    request<{ data: {
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
    } }>(`/receptionists/${id}`, { method: "PUT", body: data }),

  delete: (id: string) =>
    request<{ message: string }>(`/receptionists/${id}`, { method: "DELETE" }),
};

// Scheduling API
export interface OperatingHourShift {
  start_time: string;
  end_time: string;
}

export interface DaySchedule {
  day_of_week: string;
  is_closed: boolean;
  shifts: OperatingHourShift[];
}

export interface WeeklySchedule {
  days: DaySchedule[];
}

export interface DoctorDaySchedule {
  day_of_week: number; // 1=Monday, 2=Tuesday, ..., 7=Sunday
  is_off: boolean;
  shifts: OperatingHourShift[];
}

export interface DoctorSchedule {
  doctor_id: string;
  days: DoctorDaySchedule[];
}

export interface DoctorLeave {
  id: string;
  user_id: string;
  user_type: string;
  user_name: string;
  leave_type: string;
  status: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  cancelled_by?: string;
  approved_by?: string;
  approved_at?: string;
}

export const schedulingApi = {
  getOperatingHours: () =>
    request<{ data: WeeklySchedule }>("/clinic-hours"),

  replaceOperatingHours: (data: WeeklySchedule) =>
    request<{ data: WeeklySchedule }>("/clinic-hours", { method: "PUT", body: data }),

  getDoctorSchedule: (doctorId: string) =>
    request<{ data: DoctorSchedule }>(`/doctors/${doctorId}/schedule`),

  replaceDoctorSchedule: (doctorId: string, data: { days: DoctorDaySchedule[] }) =>
    request<{ data: DoctorSchedule }>(`/doctors/${doctorId}/schedule`, { method: "PUT", body: data }),

  // Doctor Leave
  listLeaves: (params?: { user_id?: string; user_type?: string; page?: number; page_size?: number }) => {
    const query = new URLSearchParams();
    if (params?.user_id) query.set("user_id", params.user_id);
    if (params?.user_type) query.set("user_type", params.user_type);
    if (params?.page) query.set("page", String(params.page));
    if (params?.page_size) query.set("page_size", String(params.page_size));
    const qs = query.toString();
    return request<{ data: DoctorLeave[]; total: number; page: number; page_size: number }>(
      `/doctor-leaves${qs ? `?${qs}` : ""}`
    );
  },

  getLeave: (id: string) =>
    request<{ data: DoctorLeave }>(`/doctor-leaves/${id}`),

  createLeave: (data: {
    user_id: string;
    user_type: "doctor" | "receptionist";
    start_datetime: string;
    end_datetime: string;
    leave_type: string;
    reason?: string;
  }) =>
    request<{ data: DoctorLeave; warning?: { appointments_affected: number } }>(
      "/doctor-leaves",
      { method: "POST", body: data }
    ),

  updateLeave: (id: string, data: {
    start_datetime?: string;
    end_datetime?: string;
    leave_type?: string;
    reason?: string;
  }) =>
    request<{ data: DoctorLeave }>(`/doctor-leaves/${id}`, { method: "PUT", body: data }),

  cancelLeave: (id: string) =>
    request<{ data: DoctorLeave }>(`/doctor-leaves/${id}/cancel`, { method: "POST" }),

  approveLeave: (id: string) =>
    request<{ data: DoctorLeave }>(`/doctor-leaves/${id}/approve`, { method: "POST" }),

  rejectLeave: (id: string) =>
    request<{ data: DoctorLeave }>(`/doctor-leaves/${id}/reject`, { method: "POST" }),
};

// Patients API
export const patientsApi = {
  list: (params?: ListParams) =>
    request<PaginatedResponse<Patient>>(`/patients${buildQuery(params)}`),

  getById: (id: string) =>
    request<{ data: {
      id: string;
      user_id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
      role_id: string;
      is_active: boolean;
      medical_record_number: string;
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
    } }>(`/patients/${id}`),

  create: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    medical_record_number?: string;
    date_of_birth?: string;
    blood_group?: string;
    gender?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    allergies?: string;
    chronic_conditions?: string;
    insurance_provider?: string;
    insurance_id?: string;
  }) =>
    request<{ data: {
      id: string;
      user_id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
      role_id: string;
      is_active: boolean;
      medical_record_number: string;
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
    } }>("/patients", { method: "POST", body: data }),

  update: (id: string, data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    medical_record_number?: string;
    date_of_birth?: string;
    blood_group?: string;
    gender?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    allergies?: string;
    chronic_conditions?: string;
    insurance_provider?: string;
    insurance_id?: string;
  }) =>
    request<{ data: {
      id: string;
      user_id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
      role_id: string;
      is_active: boolean;
      medical_record_number: string;
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
    } }>(`/patients/${id}`, { method: "PUT", body: data }),

  delete: (id: string) =>
    request<{ message: string }>(`/patients/${id}`, { method: "DELETE" }),
};

export { setTokens, clearTokens, getAccessToken };
export type { ApiError };

function buildQuery(params?: ListParams): string {
  if (!params) return "";
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  if (params.search) query.set("search", params.search);
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}
