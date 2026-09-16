"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);
const STORAGE_KEY = "bms-user";
const TOKEN_KEY = "bms-token";

import { authAPI } from '@/lib/api';

// ✅ Role Definitions
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  LEAD_MANAGER: "lead_manager",
  MODERATOR: "moderator",
  EMPLOYEE: "employee",
};

// ✅ Role Permissions
export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    can: [
      "view_all",
      "manage_all",
      "manage_users",
      "manage_buildings",
      "manage_employees",
      "manage_leads",
      "manage_revenue",
      "manage_reports",
      "manage_settings",
    ],
  },
  [ROLES.ADMIN]: {
    can: [
      "view_all",
      "manage_buildings",
      "manage_employees",
      "manage_leads",
      "manage_revenue",
      "manage_reports",
    ],
  },
  [ROLES.LEAD_MANAGER]: {
    can: [
      "view_leads",
      "manage_leads",
      "view_team",
      "view_tasks",
      "mark_attendance",
    ],
  },
  [ROLES.MODERATOR]: {
    can: [
      "view_leads",
      "manage_leads",
      "view_team",
      "view_tasks",
      "mark_attendance",
      "view_reports",
    ],
  },
  [ROLES.EMPLOYEE]: {
    can: [
      "view_self",
      "view_tasks",
      "mark_attendance",
      "view_attendance",
      "view_salary",
    ],
  },
};

// ✅ Mock Users Database (Will be replaced with backend)
const MOCK_USERS = [
  {
    id: 1,
    email: "admin@bms.com",
    password: "admin123",
    name: "Admin User",
    role: ROLES.ADMIN,
    employeeId: 1,
    permissions: PERMISSIONS[ROLES.ADMIN].can,
  },
  {
    id: 2,
    email: "sara@bms.com",
    password: "sara123",
    name: "Sara Khan",
    role: ROLES.LEAD_MANAGER,
    employeeId: 2,
    permissions: PERMISSIONS[ROLES.LEAD_MANAGER].can,
  },
  {
    id: 3,
    email: "usman@bms.com",
    password: "usman123",
    name: "Usman Malik",
    role: ROLES.EMPLOYEE,
    employeeId: 3,
    permissions: PERMISSIONS[ROLES.EMPLOYEE].can,
  },
  {
    id: 4,
    email: "fatima@bms.com",
    password: "fatima123",
    name: "Fatima Ali",
    role: ROLES.EMPLOYEE,
    employeeId: 4,
    permissions: PERMISSIONS[ROLES.EMPLOYEE].can,
  },
  {
    id: 5,
    email: "superadmin@bms.com",
    password: "super123",
    name: "Super Admin",
    role: ROLES.SUPER_ADMIN,
    employeeId: 1,
    permissions: PERMISSIONS[ROLES.SUPER_ADMIN].can,
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem(STORAGE_KEY);
        const token = localStorage.getItem(TOKEN_KEY);
        if (savedUser && token) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // In login function:
const login = async (email, password) => {
  setLoading(true);
  setError(null);

  try {
    const response = await authAPI.login(email, password);
    const { user, token } = response.data.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    setUser(user);
    return { success: true, user };
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed. Please try again.';
    setError(message);
    return { success: false, error: message };
  } finally {
    setLoading(false);
  }
};


  // ✅ Logout Function
  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("bms-auth-user");
    }
    router.push("/login");
  };

  // ✅ Check if user has specific role
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  // ✅ Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === ROLES.SUPER_ADMIN) return true;
    if (user.permissions?.includes("manage_all")) return true;
    return user.permissions?.includes(permission) || false;
  };

  // ✅ Check if user can manage leads
  const canManageLeads = () => {
    if (!user) return false;
    return (
      !!user.canManageLeads ||
      hasPermission("manage_leads") ||
      hasRole([ROLES.ADMIN, ROLES.LEAD_MANAGER, ROLES.MODERATOR, ROLES.SUPER_ADMIN])
    );
  };

  // ✅ Check if user can view reports
  const canViewReports = () => {
    if (!user) return false;
    return hasPermission("view_reports") || hasRole([ROLES.ADMIN, ROLES.MODERATOR, ROLES.SUPER_ADMIN]);
  };

  // ✅ Check if user can manage employees
  const canManageEmployees = () => {
    if (!user) return false;
    return hasPermission("manage_employees") || hasRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  };

  // ✅ Check if user can manage buildings
  const canManageBuildings = () => {
    if (!user) return false;
    return hasPermission("manage_buildings") || hasRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  };

  // ✅ Get user's dashboard stats
  const getDashboardStats = () => {
    if (!user) return null;
    return {
      role: user.role,
      name: user.name,
      permissions: user.permissions,
    };
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      login,
      logout,
      loading,
      error,
      hasRole,
      hasPermission,
      canManageLeads,
      canViewReports,
      canManageEmployees,
      canManageBuildings,
      getDashboardStats,
      isAuthenticated: !!user,
      isAdmin: user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN,
      isLeadManager: user?.role === ROLES.LEAD_MANAGER || user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN,
      isEmployee: user?.role === ROLES.EMPLOYEE,
      role: user?.role || null,
    }),
    [user, loading, error]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};