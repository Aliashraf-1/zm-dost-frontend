"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Plus, Zap, Users, User, Building2, DoorOpen, Wallet, TrendingDown } from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";
import { useEmployees } from "@/context/EmployeeContext";
import { useBuildings } from "@/context/BuildingContext";

const EXPENSE_TYPES = ["Electricity Bill", "Internet Bill", "Maintenance", "Salary", "Other"];

export default function QuickExpenseModal({ onClose, onSave }) {
  const { employees } = useEmployees();
  const { buildings } = useBuildings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "Other",
    amount: "",
    category: "",
    description: "",
    paidTo: "",
    employeeId: "",
    buildingId: "",
    unitId: "",
  });

  const [customType, setCustomType] = useState("");
  const [showSalaryCard, setShowSalaryCard] = useState(false);
  const [applyDeductions, setApplyDeductions] = useState(true);

  // Get selected employee for salary
  const selectedEmployee = useMemo(() => {
    if (!form.employeeId) return null;
    return employees.find(e => e.id === Number(form.employeeId));
  }, [form.employeeId, employees]);

  // ✅ Calculate deductions for selected employee (current month)
  const salaryDeductions = useMemo(() => {
    if (!selectedEmployee || form.type !== "Salary") return null;

    const attendance = selectedEmployee.attendance || [];
    const tasks = selectedEmployee.tasks || [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Filter current month attendance
    const currentMonthAttendance = attendance.filter(a => a.date?.startsWith(currentMonth));
    
    // Count leaves (excluding Fridays)
    const leaves = currentMonthAttendance.filter(a => a.status === "Leave").length;
    
    // Count absent (excluding Fridays)
    const absent = currentMonthAttendance.filter(a => a.status === "Absent").length;
    
    // Calculate late minutes with 30 minutes grace time
    const totalLateMinutes = currentMonthAttendance.reduce((sum, a) => {
      const lateMins = a.lateMinutes || 0;
      const chargeableLate = Math.max(lateMins - 30, 0);
      return sum + chargeableLate;
    }, 0);
    
    // Count failed tasks
    const failedTasks = tasks.filter(t => t.status === "Failed").length;
    
    // Get deduction rates
    const leaveDeduction = selectedEmployee.attendanceSettings?.leaveDeduction || 500;
    const lateDeduction = selectedEmployee.attendanceSettings?.lateDeduction || 10;
    const taskFailureDeduction = selectedEmployee.attendanceSettings?.taskFailureDeduction || 1000;
    
    // Get failed tasks with custom deductions
    const failedTasksWithDeduction = tasks.filter(t => t.status === "Failed" && t.failureDeduction);
    const customTaskDeductions = failedTasksWithDeduction.reduce(
      (sum, t) => sum + (t.failureDeduction || 0), 0
    );
    
    const totalTaskDeduction = customTaskDeductions > 0 ? customTaskDeductions : (failedTasks * taskFailureDeduction);
    
    // One free leave per month
    const chargeableLeaves = Math.max(leaves - 1, 0);
    
    const totalDeduction = (chargeableLeaves * leaveDeduction) + (totalLateMinutes * lateDeduction) + totalTaskDeduction;
    
    return {
      leaves,
      chargeableLeaves,
      freeLeaves: Math.min(leaves, 1),
      absent,
      totalLateMinutes,
      failedTasks,
      leaveDeduction,
      lateDeduction,
      taskFailureDeduction,
      totalDeduction,
      leaveAmount: chargeableLeaves * leaveDeduction,
      lateAmount: totalLateMinutes * lateDeduction,
      taskAmount: totalTaskDeduction,
      customTaskDeductions: failedTasksWithDeduction,
      finalAmount: Math.max(selectedEmployee.salary - totalDeduction, 0),
    };
  }, [selectedEmployee, form.type]);

  // ✅ Auto-fill amount with final salary after deductions
  useEffect(() => {
    if (form.type === "Salary" && salaryDeductions && applyDeductions) {
      setForm(prev => ({
        ...prev,
        amount: salaryDeductions.finalAmount.toString(),
        paidTo: selectedEmployee?.name || "",
        description: `Salary payment to ${selectedEmployee?.name} (${selectedEmployee?.designation})`,
      }));
    } else if (form.type === "Salary" && selectedEmployee && !applyDeductions) {
      setForm(prev => ({
        ...prev,
        amount: selectedEmployee.salary.toString(),
        paidTo: selectedEmployee?.name || "",
        description: `Salary payment to ${selectedEmployee?.name} (${selectedEmployee?.designation})`,
      }));
    }
  }, [form.type, selectedEmployee, salaryDeductions, applyDeductions]);

  // Salary card for selected employee
  const salaryCard = useMemo(() => {
    if (!selectedEmployee || form.type !== "Salary") return null;
    return {
      name: selectedEmployee.name,
      designation: selectedEmployee.designation,
      salary: selectedEmployee.salary,
      department: selectedEmployee.department,
      status: selectedEmployee.status,
      deductions: salaryDeductions,
    };
  }, [selectedEmployee, form.type, salaryDeductions]);

  // Get selected building
  const selectedBuilding = useMemo(() => {
    if (!form.buildingId) return null;
    return buildings.find(b => b.id === Number(form.buildingId));
  }, [form.buildingId, buildings]);

  // Get units of selected building
  const availableUnits = useMemo(() => {
    if (!selectedBuilding) return [];
    return selectedBuilding.rooms || [];
  }, [selectedBuilding]);

  // Get selected unit
  const selectedUnit = useMemo(() => {
    if (!form.unitId) return null;
    return availableUnits.find(u => u.id === Number(form.unitId));
  }, [form.unitId, availableUnits]);

  // Rent card for selected unit
  const rentCard = useMemo(() => {
    if (!selectedUnit || form.type !== "Rent") return null;
    const tenant = selectedUnit.tenant;
    if (!tenant) return null;
    return {
      unitNo: selectedUnit.unitNo,
      tenantName: tenant.name,
      monthlyRent: selectedUnit.monthlyRent,
      security: selectedUnit.initialPayment?.securityReceived || 0,
      rentStartDate: selectedUnit.rentStartDate,
    };
  }, [selectedUnit, form.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setShowSalaryCard(false);
  };

  const handleEmployeeSelect = (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, employeeId: val }));
    if (val) {
      setShowSalaryCard(true);
    } else {
      setShowSalaryCard(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    // If Salary, ensure employee is selected
    if (form.type === "Salary" && !form.employeeId) {
      setError("Please select an employee for salary payment.");
      return;
    }

    if (form.type === "Other" && !customType.trim()) {
      setError("Please enter a custom category.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let expenseData = {
        type: "Expense",
        transactionType: "Expense",
        category: form.type === "Other" ? customType : form.type,
        description: form.description || form.category,
        amount: Number(form.amount),
        paidTo: form.paidTo || "N/A",
        status: "Paid",
        createdAt: new Date().toISOString(),
      };

      // If Salary, add employee details with deductions
      if (form.type === "Salary" && selectedEmployee) {
        const finalAmount = Number(form.amount);
        const fullSalary = selectedEmployee.salary;
        
        expenseData = {
          ...expenseData,
          employeeId: Number(form.employeeId),
          employeeName: selectedEmployee.name,
          fullSalary: fullSalary,
          deductions: applyDeductions && salaryDeductions ? {
            leaveDeduction: salaryDeductions.leaveAmount,
            lateDeduction: salaryDeductions.lateAmount,
            taskFailureDeduction: salaryDeductions.taskAmount,
            total: salaryDeductions.totalDeduction,
            leaves: salaryDeductions.leaves,
            lateMinutes: salaryDeductions.totalLateMinutes,
            failedTasks: salaryDeductions.failedTasks,
          } : null,
          salaryPayment: {
            employeeId: Number(form.employeeId),
            amount: finalAmount,
            fullSalary: fullSalary,
            month: new Date().toISOString().slice(0, 7),
            remarks: form.description || "Salary payment",
            deductions: applyDeductions && salaryDeductions ? salaryDeductions.totalDeduction : 0,
          },
        };
      }

      await onSave(expenseData);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to add expense.");
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

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <Zap size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Add Expense</h2>
                <p className="text-xs text-muted-foreground">Quick expense entry</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Expense Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
              >
                {EXPENSE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Custom Type */}
            {form.type === "Other" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">Custom Category *</label>
                <input
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="e.g., Office Supplies"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
            )}

            {/* Employee Selection (for Salary) */}
            {form.type === "Salary" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">Select Employee *</label>
                  <div className="relative">
                    <Users size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={form.employeeId}
                      onChange={handleEmployeeSelect}
                      className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm text-card-foreground outline-none focus:border-indigo-500 appearance-none"
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

                {/* Salary Card Preview with Deductions */}
                {salaryCard && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground">Salary Payment Details</p>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={applyDeductions}
                          onChange={(e) => setApplyDeductions(e.target.checked)}
                          className="rounded border-border bg-muted text-indigo-500 focus:ring-indigo-500"
                        />
                        Apply Deductions
                      </label>
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employee</span>
                        <span className="text-foreground">{salaryCard.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Designation</span>
                        <span className="text-foreground">{salaryCard.designation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Department</span>
                        <span className="text-foreground">{salaryCard.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Salary</span>
                        <span className="text-emerald-400">Rs. {salaryCard.salary.toLocaleString()}</span>
                      </div>

                      {/* Deductions Section */}
                      {applyDeductions && salaryCard.deductions && salaryCard.deductions.totalDeduction > 0 && (
                        <>
                          <div className="border-t border-amber-500/20 pt-2 mt-2">
                            <p className="text-xs text-amber-400 flex items-center gap-1">
                              <TrendingDown size={12} />
                              Deductions
                            </p>
                            {salaryCard.deductions.leaveAmount > 0 && (
                              <div className="flex justify-between text-xs text-red-400">
                                <span>Leaves ({salaryCard.deductions.chargeableLeaves})</span>
                                <span>- Rs. {salaryCard.deductions.leaveAmount.toLocaleString()}</span>
                              </div>
                            )}
                            {salaryCard.deductions.lateAmount > 0 && (
                              <div className="flex justify-between text-xs text-red-400">
                                <span>Late ({salaryCard.deductions.totalLateMinutes} min)</span>
                                <span>- Rs. {salaryCard.deductions.lateAmount.toLocaleString()}</span>
                              </div>
                            )}
                            {salaryCard.deductions.taskAmount > 0 && (
                              <div className="flex justify-between text-xs text-red-400">
                                <span>Task Failures ({salaryCard.deductions.failedTasks})</span>
                                <span>- Rs. {salaryCard.deductions.taskAmount.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs font-bold text-amber-400 border-t border-amber-500/20 pt-1">
                              <span>Total Deductions</span>
                              <span>- Rs. {salaryCard.deductions.totalDeduction.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-emerald-400 border-t border-emerald-500/20 pt-1">
                            <span>Final Amount</span>
                            <span>Rs. {salaryCard.deductions.finalAmount.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                      {applyDeductions && salaryCard.deductions && salaryCard.deductions.totalDeduction === 0 && (
                        <div className="text-xs text-muted-foreground mt-2">No deductions for this month</div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Amount (Rs.) *</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief description"
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {/* Paid To */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Paid To</label>
              <input
                name="paidTo"
                value={form.paidTo}
                onChange={handleChange}
                placeholder="Vendor/Person"
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
              >
                <Plus size={17} />
                {loading ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}