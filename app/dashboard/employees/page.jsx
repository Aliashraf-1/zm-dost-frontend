"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, CalendarCheck, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEmployees } from "@/context/EmployeeContext";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import EmployeeStats from "@/components/employees/EmployeeStats";
import EmployeeTable from "@/components/employees/EmployeeTable";
import AttendanceModal from "@/components/employees/AttendanceModal";

export default function EmployeesPage() {
  // ✅ Sab hooks top-level par
  const { employees, loadEmployees, loading, deleteEmployee, markAttendance } = useEmployees();
  const { user } = useAuth();
  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [department, setDepartment] = useState("All");
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeSelect, setShowEmployeeSelect] = useState(false);

  // ✅ Check if current user is admin/super_admin
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchValue = search.toLowerCase().trim();
      const matchesSearch =
        employee.name.toLowerCase().includes(searchValue) ||
        employee.email.toLowerCase().includes(searchValue) ||
        employee.phone.includes(searchValue) ||
        employee.designation.toLowerCase().includes(searchValue);

      const matchesStatus = status === "All" || employee.status === status;
      const matchesDepartment = department === "All" || employee.department === department;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, search, status, department]);

  const openAttendanceModal = (employee) => {
    setSelectedEmployee(employee);
    setShowAttendanceModal(true);
    setShowEmployeeSelect(false);
  };

  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeSelect(false);
    setShowAttendanceModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await deleteEmployee(employeeId);
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  };

  const handleAttendanceSave = async (employeeId, attendanceData) => {
    try {
      await markAttendance(employeeId, attendanceData);
      setShowAttendanceModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Attendance failed:", error);
      throw error; // ✅ Error propagate to modal
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading employees...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "super_admin", "lead_manager", "employee"]}>
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-400">Human Resources</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Employees</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Manage employees, track attendance, and process salaries.
            </p>
          </div>

          {isAdmin && <div className="flex flex-wrap gap-3">
            {/* Mark Attendance Button */}
            <div className="relative">
              <button
                onClick={() => setShowEmployeeSelect(!showEmployeeSelect)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
              >
                <CalendarCheck size={17} />
                Mark Attendance
                <ChevronDown size={16} className={`transition-transform duration-200 ${showEmployeeSelect ? 'rotate-180' : ''}`} />
              </button>

              {showEmployeeSelect && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEmployeeSelect(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-border bg-muted shadow-2xl">
                    <div className="max-h-64 overflow-y-auto p-2">
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                        Select Employee
                      </div>
                      {filteredEmployees.filter((employee) => employee.status === "Active").length > 0 ? (
                        filteredEmployees.filter((employee) => employee.status === "Active").map((employee) => (
                          <button
                            key={employee._id}
                            onClick={() => selectEmployee(employee)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-card-foreground transition hover:bg-muted-foreground/40"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-medium text-indigo-400">
                              {employee.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.designation}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">No employees found</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              href="/dashboard/employees/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
            >
              <Plus size={17} />
              Add Employee
            </Link>
          </div>}
        </div>

        <EmployeeStats employees={filteredEmployees} />

        <div className="mt-6">
          <EmployeeTable
            employees={filteredEmployees}
            onMarkAttendance={openAttendanceModal}
            onDelete={isAdmin ? handleDeleteEmployee : null} // ✅ Sirf admin delete kar sakta
            canDelete={isAdmin} // ✅ Delete button conditional
            canManageEmployee={isAdmin}
          />
        </div>

        {showAttendanceModal && selectedEmployee && (
          <AttendanceModal
            employee={selectedEmployee}
            onClose={() => {
              setShowAttendanceModal(false);
              setSelectedEmployee(null);
              setShowEmployeeSelect(false);
            }}
            onSave={handleAttendanceSave}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
