"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  redirectTo = "/login",
}) {
  const { user, loading, hasRole, hasPermission, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Check if user is logged in
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check roles
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => hasRole(role));
        if (!hasRequiredRole) {
          router.push("/unauthorized");
          return;
        }
      }

      // Check permissions
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(p => hasPermission(p));
        if (!hasAllPermissions) {
          router.push("/unauthorized");
          return;
        }
      }
    }
  }, [user, loading, router, requiredRoles, requiredPermissions, hasRole, hasPermission, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children;
}

// ✅ Unauthorized Page Component
export function Unauthorized() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <ShieldAlert size={64} className="mb-4 text-red-400" />
      <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        You don't have permission to access this page. Please contact your administrator.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}