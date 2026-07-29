"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, setTokens, clearTokens, getAccessToken } from "./api";

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role_id?: string;
  tenant_id?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.me();
      setUser({
        id: response.data.user_id,
        email: response.data.email,
        role_id: response.data.role_id,
        tenant_id: response.data.tenant_id,
        permissions: response.data.permissions || [],
      });
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const { access_token, refresh_token } = response.data.token;
    setTokens(access_token, refresh_token);
    const userData = response.data.user as User;
    setUser(userData);
    // Fetch full user details including permissions after login
    fetchUser();
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  // Check if user has super admin privileges (belongs to platform org)
  const isSuperAdmin = user?.permissions?.includes("tenant.approve") ?? false;

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isSuperAdmin,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
