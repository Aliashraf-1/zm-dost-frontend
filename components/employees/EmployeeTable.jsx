"use client";

import { useMemo, useState, useCallback, useReducer } from "react";
import Image from "next/image";
import { getImageUrl, getFallbackImage } from "@/lib/imageHelper";
import Link from "next/link";
import {
  Search,
  User,
  Mail,
  Phone,
  Briefcase,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  AlertCircle,
  Calendar,
  CalendarCheck,
} from "lucide-react";
import PaySalaryModal from "./PaySalaryModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useEmployees } from "@/context/EmployeeContext";

// Reducer for table state
const tableReducer = (state, action) => {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_DEPARTMENT":
      return { ...state, department: action.payload };
    case "RESET_FILTERS":
      return { search: "", status: "All", department: "All" };
    default:
      return state;
  }
};

export default function EmployeeTable({
  employees = [],
  onDelete,
  onMarkAttendance,
  canDelete = false,
  canManageEmployee = false,
}) {
  const [filterState, dispatch] = useReducer(tableReducer, {
    search: "",
    status: "Active",
    department: "All",
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { paySalary, getEmployeeSalaryStatus } = useEmployees();

  // ✅ Today's date for attendance check (component-level, no employee)
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter employees
  const filteredEmployees = useMemo(() => {
    const { search, status, department } = filterState;
    const searchValue = search.toLowerCase().trim();

    return employees.filter((employee) => {
      const matchesSearch =
        employee.name?.toLowerCase().includes(searchValue) ||
        employee.email?.toLowerCase().includes(searchValue) ||
        employee.phone?.includes(searchValue) ||
        employee.designation?.toLowerCase().includes(searchValue);

      const matchesStatus =
        status === "All" || employee.status === status;

      const matchesDepartment =
        department === "All" || employee.department === department;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, filterState]);

  // Status badge
  const getStatusBadge = useCallback((status) => {
    const variants = {
      Active: {
        class: "bg-emerald-500/10 text-emerald-400",
        icon: <CheckCircle2 size={14} />,
      },
      Inactive: {
        class: "bg-red-500/10 text-red-400",
        icon: <XCircle size={14} />,
      },
      "On Leave": {
        class: "bg-amber-500/10 text-amber-400",
        icon: <Clock size={14} />,
      },
    };
    return variants[status] || variants.Inactive;
  }, []);

  // Search
  const handleSearchChange = useCallback((e) => {
    dispatch({ type: "SET_SEARCH", payload: e.target.value });
  }, []);

  // Status filter
  const handleStatusChange = useCallback((e) => {
    dispatch({ type: "SET_STATUS", payload: e.target.value });
  }, []);

  // Department filter
  const handleDepartmentChange = useCallback((e) => {
    dispatch({ type: "SET_DEPARTMENT", payload: e.target.value });
  }, []);

  // Pay salary
  const handlePayClick = useCallback((employee) => {
    setSelectedEmployee(employee);
    setShowPayModal(true);
  }, []);

  const handlePaySalary = useCallback(
    async (employeeId, amount) => {
      try {
        const result = await paySalary(employeeId, amount);
        console.log("Salary payment recorded:", { employeeId, amount });
        return result;
      } catch (error) {
        console.error("Payment failed:", error);
        throw error;
      }
    },
    [paySalary]
  );

  // Delete
  const handleDeleteClick = useCallback((employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  }, []);
  
const handleDeleteConfirm = useCallback(async () => {
  if (!selectedEmployee) return;

  const employeeId = selectedEmployee._id || selectedEmployee.id;

  setDeleteLoading(true);

  try {
    // ✅ Check if onDelete exists
    if (onDelete) {
      await onDelete(employeeId);
    }
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  } catch (error) {
    console.error("Delete failed:", error);
  } finally {
    setDeleteLoading(false);
  }
}, [selectedEmployee, onDelete]);

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  }, []);

  // Salary status
  const getSalaryStatusDisplay = useCallback(
    (employee) => {
      if (employee.status === "Inactive") {
        return {
          status: "Not applicable",
          amount: 0,
          remaining: 0,
          paidAt: null,
          class: "bg-muted text-muted-foreground",
          icon: <Clock size={14} />,
        };
      }
      const employeeId = employee._id || employee.id;
      const salaryStatus = getEmployeeSalaryStatus(employeeId);

      const statusConfig = {
        Paid: { class: "bg-emerald-500/10 text-emerald-400", icon: <CheckCircle2 size={14} /> },
        Partial: { class: "bg-amber-500/10 text-amber-400", icon: <Clock size={14} /> },
        Pending: { class: "bg-red-500/10 text-red-400", icon: <AlertCircle size={14} /> },
      };

      const config = statusConfig[salaryStatus.status] || statusConfig.Pending;
      return { ...salaryStatus, ...config };
    },
    [getEmployeeSalaryStatus]
  );

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header */}
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Employees</h2>
              <p className="mt-1 text-sm text-muted-foreground">Manage your workforce and track attendance.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="relative">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={filterState.search}
                  onChange={handleSearchChange}
                  placeholder="Search employees..."
                  className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500 sm:w-64"
                />
              </div>

              {/* Status */}
              <select
                value={filterState.status}
                onChange={handleStatusChange}
                className="rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-card-foreground outline-none focus:border-indigo-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>

              {/* Department */}
              <select
                value={filterState.department}
                onChange={handleDepartmentChange}
                className="rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-card-foreground outline-none focus:border-indigo-500"
              >
                <option value="All">All Departments</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Security">Security</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Employee</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Designation</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Department</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Salary</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Salary Status</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => {
                const employeeId = employee._id || employee.id;
                const statusBadge = getStatusBadge(employee.status);
                const salaryStatus = getSalaryStatusDisplay(employee);
                const todayAttendance = employee.attendance?.find(a => a.date === todayStr);

                return (
                  <tr key={employeeId} className="border-b border-border/70 transition hover:bg-muted">
                    {/* Employee */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-500/10 text-indigo-400">
                          {employee.image ? (
                            <Image
                              src={getImageUrl(employee.image)}
                              alt={employee.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%236366f1'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='16'%3E{employee.name[0]}%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          ) : (
                            <User size={18} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{employee.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-card-foreground">{employee.designation}</span>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">{employee.department}</span>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="text-card-foreground">{employee.phone}</span>
                        <span className="text-xs text-muted-foreground">{employee.cnic}</span>
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-emerald-400">
                        Rs. {Number(employee.salary || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Salary Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${salaryStatus.class}`}>
                          {salaryStatus.icon}
                          {salaryStatus.status}
                        </span>

                        {salaryStatus.amount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Paid: Rs. {Number(salaryStatus.amount).toLocaleString()}
                          </span>
                        )}

                        {salaryStatus.remaining > 0 && salaryStatus.status !== "Paid" && (
                          <span className="text-xs text-amber-400">
                            Remaining: Rs. {Number(salaryStatus.remaining).toLocaleString()}
                          </span>
                        )}

                        {salaryStatus.paidAt && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar size={12} />
                            {new Date(salaryStatus.paidAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status - with mini attendance status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${statusBadge.class}`}>
                        {statusBadge.icon}
                        {employee.status}
                      </span>
                      {todayAttendance && todayAttendance.status !== 'Present' && (
                        <p className="mt-1 text-xs text-amber-400">
                          {todayAttendance.status}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/employees/${employeeId}`}
                          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          title="View employee"
                        >
                          <Eye size={17} />
                        </Link>

                        {canManageEmployee && <Link
                          href={`/dashboard/employees/edit/${employeeId}`}
                          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          title="Edit employee"
                        >
                          <Pencil size={17} />
                        </Link>}

                        {canManageEmployee && employee.status === "Active" && <button
                          onClick={() => onMarkAttendance?.(employee)}
                          className="rounded-lg p-2 text-muted-foreground transition hover:bg-emerald-500/10 hover:text-emerald-400"
                          title="Mark attendance"
                        >
                          <CalendarCheck size={17} />
                        </button>}

                        {canManageEmployee && employee.status === "Active" && <button
                          onClick={() => handlePayClick(employee)}
                          className="rounded-lg p-2 text-muted-foreground transition hover:bg-emerald-500/10 hover:text-emerald-400"
                          title="Pay salary"
                        >
                          <Wallet size={17} />
                        </button>}
                        {canDelete && onDelete && (
                        <button
                          onClick={() => handleDeleteClick(employee)}
                          className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400"
                          title="Delete employee"
                        >
                          <Trash2 size={17} />
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredEmployees.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm font-medium">No employees found</p>
              <p className="mt-1 text-xs text-muted-foreground">Try changing your search or filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pay Salary Modal */}
      {showPayModal && selectedEmployee && (
        <PaySalaryModal
          employee={selectedEmployee}
          onClose={() => {
            setShowPayModal(false);
            setSelectedEmployee(null);
          }}
          onPay={handlePaySalary}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEmployee && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Employee"
          message="Are you sure you want to delete this employee? This action cannot be undone and will remove all associated records."
          itemName={`${selectedEmployee.name} (${selectedEmployee.designation})`}
          loading={deleteLoading}
        />
      )}
    </>
  );
}
