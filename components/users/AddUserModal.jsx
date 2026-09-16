"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Mail, Lock, User, Briefcase, Shield } from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";
import { useEmployees } from "@/context/EmployeeContext";

const ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "lead_manager", label: "Lead Manager" },
  { value: "moderator", label: "Moderator" },
  { value: "employee", label: "Employee" },
];

const ROLE_PERMISSIONS = {
  super_admin: ["all"],
  admin: ["manage_all", "manage_buildings", "manage_employees", "manage_leads", "manage_revenue", "manage_reports"],
  lead_manager: ["manage_leads", "view_tasks", "mark_attendance"],
  moderator: ["manage_leads", "view_tasks", "mark_attendance", "view_reports"],
  employee: ["view_tasks", "mark_attendance", "view_attendance", "view_salary"],
};

export default function AddUserModal({ onClose, onSave }) {
  const { employees } = useEmployees();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee",
    employeeId: "",
    status: "active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      role: value,
      permissions: ROLE_PERMISSIONS[value] || [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!form.employeeId) {
      setError("Please select an employee for this user.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userData = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        employeeId: Number(form.employeeId),
        status: form.status,
        permissions: ROLE_PERMISSIONS[form.role] || [],
      };

      await onSave(userData);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Get employees without user accounts
  const availableEmployees = employees.filter(
    (emp) => !form.employeeId || emp.id === Number(form.employeeId)
  );

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Add New User</h2>
                <p className="text-xs text-muted-foreground">Create a new user account</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">
                Full Name *
              </label>
              <div className="relative">
                <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">
                Email Address *
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@email.com"
                  className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">
                Password *
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">
                Role *
              </label>
              <div className="relative">
                <Shield size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleRoleChange}
                  className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm text-card-foreground outline-none focus:border-indigo-500 appearance-none"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employee Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">
                Employee *
              </label>
              <div className="relative">
                <Briefcase size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm text-card-foreground outline-none focus:border-indigo-500 appearance-none"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.designation}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Permissions Preview */}
            <div className="rounded-xl border border-border bg-muted p-3">
              <p className="text-xs text-muted-foreground">Permissions for this role:</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(ROLE_PERMISSIONS[form.role] || []).map((perm) => (
                  <span
                    key={perm}
                    className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-400"
                  >
                    {perm.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
              >
                <UserPlus size={17} />
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}