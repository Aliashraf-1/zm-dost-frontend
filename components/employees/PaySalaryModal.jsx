"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Briefcase,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";

export default function PaySalaryModal({
  employee,
  onClose,
  onPay,
}) {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [applyDeductions, setApplyDeductions] = useState(true);

  const monthlySalary = Number(employee.salary || 0);

  const deductions = useMemo(() => {
    const attendance = employee.attendance || [];
    const tasks = employee.tasks || [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const currentMonthAttendance = attendance.filter(a => a.date?.startsWith(currentMonth));
    
    const leaves = currentMonthAttendance.filter(a => a.status === "Leave").length;
    const absent = currentMonthAttendance.filter(a => a.status === "Absent").length;
    
    const totalLateMinutes = currentMonthAttendance.reduce((sum, a) => {
      const lateMins = a.lateMinutes || 0;
      const chargeableLate = Math.max(lateMins - (employee.shiftTiming?.graceMinutes ?? 30), 0);
      return sum + chargeableLate;
    }, 0);
    
    const failedTasks = tasks.filter(t => t.status === "Failed").length;
    
    const leaveDeduction = employee.attendanceSettings?.leaveDeduction ?? 500;
    const lateDeduction = employee.attendanceSettings?.lateDeduction ?? 10;
    const taskFailureDeduction = employee.attendanceSettings?.taskFailureDeduction ?? 1000;
    const paidLeaves = employee.shiftTiming?.monthlyLeaves ?? 1;
    const graceMinutes = employee.shiftTiming?.graceMinutes ?? 30;
    
    const failedTasksWithDeduction = tasks.filter(t => t.status === "Failed" && t.failureDeduction);
    const customTaskDeductions = failedTasksWithDeduction.reduce(
      (sum, t) => sum + (t.failureDeduction || 0), 0
    );
    
    const totalTaskDeduction = customTaskDeductions > 0 ? customTaskDeductions : (failedTasks * taskFailureDeduction);
    
    const chargeableLeaves = Math.max(leaves - paidLeaves, 0);
    const chargeableAbsent = Math.max(absent - paidLeaves, 0);

    const leaveAmount = chargeableLeaves * leaveDeduction;
    const absentAmount = chargeableAbsent * leaveDeduction;
    const lateAmount = totalLateMinutes * lateDeduction;
    const taskAmount = totalTaskDeduction;
    
    const totalDeduction = leaveAmount + absentAmount + lateAmount + taskAmount;
    
    const totalLateMinutesWithGrace = currentMonthAttendance.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
    const freeLateMinutes = Math.min(totalLateMinutesWithGrace, graceMinutes * currentMonthAttendance.filter(a => a.lateMinutes > 0).length || 0);
    const chargeableLateMinutes = Math.max(totalLateMinutesWithGrace - freeLateMinutes, 0);
    
    return {
      leaves,
      chargeableLeaves,
      freeLeaves: Math.min(leaves, paidLeaves),
      absent,
      chargeableAbsent, // ✅ Added
      totalLateMinutes: chargeableLateMinutes,
      freeLateMinutes,
      failedTasks,
      leaveDeduction,
      lateDeduction,
      taskFailureDeduction,
      totalDeduction,
      leaveAmount,
      absentAmount,
      lateAmount,
      taskAmount,
      customTaskDeductions: failedTasksWithDeduction,
    };
  }, [employee]);

  const finalAmount = applyDeductions ? Math.max(monthlySalary - deductions.totalDeduction, 0) : monthlySalary;

  useEffect(() => {
    setAmount(finalAmount);
  }, [finalAmount]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payAmount = Number(amount);
    
    if (!payAmount || payAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (payAmount > monthlySalary) {
      setError(`Amount cannot exceed monthly salary (Rs. ${monthlySalary.toLocaleString()})`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const employeeId = employee._id || employee.id;
      
      const deductionsToSend = applyDeductions ? {
        leaves: deductions.leaveAmount,
        late: deductions.lateAmount,
        taskFailure: deductions.taskAmount,
        absent: deductions.absentAmount,
        total: deductions.totalDeduction,
      } : null;
      
      const result = await onPay(employeeId, payAmount, deductionsToSend);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.message || "Failed to process payment. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const history = employee.salaryHistory || [];
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentPayment = history.find((h) => h.month === currentMonth);
  
  let isFullyPaid = false;
  let isPartiallyPaid = false;
  let paidAmount = 0;
  let remainingAmount = monthlySalary;

  if (currentPayment) {
    paidAmount = Number(currentPayment.amount || 0);
    const totalDeductions = currentPayment.deductions?.total || 
      (currentPayment.deductions?.leaves || 0) + 
      (currentPayment.deductions?.late || 0) + 
      (currentPayment.deductions?.taskFailure || 0) +
      (currentPayment.deductions?.absent || 0) || 0;
    
    const expectedAmount = monthlySalary - totalDeductions;
    
    if (paidAmount >= expectedAmount) {
      isFullyPaid = true;
      remainingAmount = 0;
    } else {
      isPartiallyPaid = true;
      remainingAmount = expectedAmount - paidAmount;
    }
  }

  return (
    <ModalPortal>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Wallet size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Pay Salary</h2>
                <p className="text-xs text-muted-foreground">{employee.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            {/* Employee Info */}
            <div className="rounded-xl border border-border bg-input/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Employee</p>
                  <p className="mt-1 font-medium">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">{employee.designation}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Monthly Salary</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">
                    Rs. {monthlySalary.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-amber-400">Deductions</span>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={applyDeductions}
                    onChange={(e) => setApplyDeductions(e.target.checked)}
                    className="rounded border-border bg-muted text-indigo-500 focus:ring-indigo-500"
                  />
                  Apply Deductions
                </label>
              </div>

              {applyDeductions && (
                <div className="space-y-2 text-sm">
                  {deductions.freeLeaves > 0 && (
                    <div className="flex items-center justify-between text-green-400">
                      <span className="flex items-center gap-2">
                        <ShieldCheck size={14} />
                        Free Leave ({deductions.freeLeaves} allowed)
                      </span>
                      <span>Rs. 0</span>
                    </div>
                  )}

                  {deductions.chargeableLeaves > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar size={14} />
                        Leaves ({deductions.chargeableLeaves} × Rs. {deductions.leaveDeduction})
                      </span>
                      <span className="text-red-400">- Rs. {deductions.leaveAmount.toLocaleString()}</span>
                    </div>
                  )}

                  {deductions.absent > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock size={14} />
                        Absent ({deductions.absent} days)
                        {deductions.chargeableAbsent < deductions.absent && (
                          <span className="text-xs text-green-400">(1 free)</span>
                        )}
                      </span>
                      <span className="text-red-400">- Rs. {deductions.absentAmount.toLocaleString()}</span>
                    </div>
                  )}

                  {deductions.totalLateMinutes > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock size={14} />
                        Late ({deductions.totalLateMinutes} min charged × Rs. {deductions.lateDeduction})
                        {deductions.freeLateMinutes > 0 && (
                          <span className="text-xs text-green-400">({deductions.freeLateMinutes} min grace)</span>
                        )}
                      </span>
                      <span className="text-red-400">- Rs. {deductions.lateAmount.toLocaleString()}</span>
                    </div>
                  )}

                  {deductions.failedTasks > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Briefcase size={14} />
                        Task Failure ({deductions.failedTasks} tasks)
                      </span>
                      <span className="text-red-400">- Rs. {deductions.taskAmount.toLocaleString()}</span>
                    </div>
                  )}

                  {deductions.customTaskDeductions?.map((task, index) => (
                    <div key={index} className="flex items-center justify-between pl-6 text-xs">
                      <span className="text-muted-foreground">└ {task.title}</span>
                      <span className="text-red-400">- Rs. {task.failureDeduction.toLocaleString()}</span>
                    </div>
                  ))}

                  {deductions.totalDeduction > 0 && (
                    <div className="border-t border-amber-500/20 pt-2 mt-2 flex items-center justify-between font-semibold">
                      <span className="text-amber-400 flex items-center gap-2">
                        <TrendingDown size={14} />
                        Total Deductions
                      </span>
                      <span className="text-amber-400">- Rs. {deductions.totalDeduction.toLocaleString()}</span>
                    </div>
                  )}

                  {deductions.totalDeduction === 0 && (
                    <p className="text-xs text-muted-foreground">No deductions for this month</p>
                  )}
                </div>
              )}
            </div>

            {/* Current Month Status */}
            <div className="rounded-xl border border-border bg-input/70 p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Current Month</span>
                  <span className="text-xs font-medium text-card-foreground">
                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  {isFullyPaid ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                      <CheckCircle2 size={14} />
                      Fully Paid
                    </span>
                  ) : isPartiallyPaid ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                      <Clock size={14} />
                      Partial
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                      <AlertCircle size={14} />
                      Pending
                    </span>
                  )}
                </div>

                {remainingAmount > 0 && !isFullyPaid && (
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-xs text-muted-foreground">Remaining Salary</span>
                    <span className="text-sm font-bold text-amber-400">
                      Rs. {remainingAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                {applyDeductions && deductions.totalDeduction > 0 && (
                  <div className="flex items-center justify-between border-t border-emerald-500/20 pt-2">
                    <span className="text-xs text-muted-foreground">Final Amount (After Deductions)</span>
                    <span className="text-sm font-bold text-emerald-400">
                      Rs. {finalAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                {paidAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Paid Amount</span>
                    <span className="text-xs font-medium text-emerald-400">
                      Rs. {paidAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Amount Input */}
            {!isFullyPaid && (
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={monthlySalary}
                    value={amount}
                    onChange={(e) => {
                      setAmount(Number(e.target.value));
                      setError("");
                    }}
                    className="w-full rounded-xl border border-border bg-input py-3 pl-12 pr-4 text-sm outline-none focus:border-indigo-500"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Monthly Salary: Rs. {monthlySalary.toLocaleString()}</span>
                  <span className="text-emerald-400">Final Amount: Rs. {finalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 size={17} />
                  Salary payment recorded successfully!
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              {!isFullyPaid && (
                <button
                  type="submit"
                  disabled={loading || success || amount === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                >
                  <Wallet size={17} />
                  {loading ? "Processing..." : "Pay Salary"}
                </button>
              )}
              {isFullyPaid && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  <CheckCircle2 size={17} />
                  Already Paid
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}
