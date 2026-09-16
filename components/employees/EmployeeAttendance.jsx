"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Calendar, Wallet } from "lucide-react";

export default function EmployeeAttendance({ attendance = [] }) {
  const [showAll, setShowAll] = useState(false);

  const getStatusBadge = (status) => {
    const variants = {
      Present: {
        class: "bg-emerald-500/10 text-emerald-400",
        icon: <CheckCircle2 size={14} />,
      },
      Absent: {
        class: "bg-red-500/10 text-red-400",
        icon: <XCircle size={14} />,
      },
      Leave: {
        class: "bg-amber-500/10 text-amber-400",
        icon: <Clock size={14} />,
      },
      "Friday Off": {
        class: "bg-blue-500/10 text-blue-400",
        icon: <Calendar size={14} />,
      },
    };
    return variants[status] || variants.Absent;
  };

  // ✅ Check if a date is Friday
  const isFriday = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getDay() === 5;
  };

  // ✅ Process attendance - mark Fridays, calculate deductions
  const processedAttendance = useMemo(() => {
    const sorted = attendance
      .filter(record => record && record.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // ✅ Track monthly leaves for free leave logic
    let monthlyLeaveCount = 0;

    return sorted.map((record) => {
      // ✅ Friday Off - No deduction
      if (isFriday(record.date) && record.status !== "Present") {
        return { 
          ...record, 
          status: "Friday Off",
          chargeableLateMinutes: 0,
          lateDeductionAmount: 0,
          leaveDeductionAmount: 0,
        };
      }

      // ✅ Calculate leave deduction (1 free leave per month)
      if (record.status === "Leave") {
        monthlyLeaveCount++;
        const isFreeLeave = monthlyLeaveCount <= 1;
        return {
          ...record,
          leaveDeductionAmount: isFreeLeave ? 0 : (record.leaveDeductionAmount || 0),
          isFreeLeave: isFreeLeave,
        };
      }

      // ✅ For Present - show late deduction if any
      if (record.status === "Present") {
        return {
          ...record,
          chargeableLateMinutes: record.chargeableLateMinutes || 0,
          lateDeductionAmount: record.lateDeductionAmount || 0,
          leaveDeductionAmount: 0,
        };
      }

      // ✅ For Absent - count as leave
      if (record.status === "Absent") {
        monthlyLeaveCount++;
        const isFreeLeave = monthlyLeaveCount <= 1;
        return {
          ...record,
          leaveDeductionAmount: isFreeLeave ? 0 : (record.leaveDeductionAmount || 0),
          isFreeLeave: isFreeLeave,
        };
      }

      return record;
    });
  }, [attendance]);

  // Get last 30 days (most recent first)
  const recentAttendance = useMemo(() => {
    return processedAttendance.slice(-30).reverse();
  }, [processedAttendance]);

  // ✅ Statistics with deductions
  const stats = useMemo(() => {
    const total = recentAttendance.length;
    const present = recentAttendance.filter(a => a.status === "Present").length;
    const absent = recentAttendance.filter(a => a.status === "Absent").length;
    const leaves = recentAttendance.filter(a => a.status === "Leave").length;
    const fridayOff = recentAttendance.filter(a => a.status === "Friday Off").length;
    const lateCount = recentAttendance.filter(a => a.lateMinutes > 0).length;
    const totalLateMinutes = recentAttendance.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
    const chargeableLateMinutes = recentAttendance.reduce((sum, a) => sum + (a.chargeableLateMinutes || 0), 0);
    const totalLateDeduction = recentAttendance.reduce((sum, a) => sum + (a.lateDeductionAmount || 0), 0);
    const totalLeaveDeduction = recentAttendance.reduce((sum, a) => sum + (a.leaveDeductionAmount || 0), 0);
    const totalDeduction = totalLateDeduction + totalLeaveDeduction;
    
    const workingDays = total - fridayOff;
    const attendanceRate = workingDays > 0 ? Math.round((present / workingDays) * 100) : 0;
    
    return {
      total,
      present,
      absent,
      leaves,
      fridayOff,
      lateCount,
      totalLateMinutes,
      chargeableLateMinutes,
      totalLateDeduction,
      totalLeaveDeduction,
      totalDeduction,
      attendanceRate,
    };
  }, [recentAttendance]);

  // Show only 4 records initially
  const displayAttendance = showAll ? recentAttendance : recentAttendance.slice(0, 4);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Attendance History</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Last 30 days of attendance records
            </p>
          </div>
          {recentAttendance.length > 4 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {showAll ? (
                <>
                  <ChevronUp size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show More ({recentAttendance.length - 4} more)
                </>
              )}
            </button>
          )}
        </div>

        {/* ✅ Stats Summary with Deductions */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Attendance Rate</p>
            <p className="mt-1 text-lg font-semibold text-emerald-400">
              {stats.attendanceRate}%
            </p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Present</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {stats.present}/{stats.total - stats.fridayOff} days
            </p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Late Deduction</p>
            <p className="mt-1 text-lg font-semibold text-amber-400">
              Rs. {stats.totalLateDeduction.toLocaleString()}
            </p>
            {stats.chargeableLateMinutes > 0 && (
              <p className="text-xs text-muted-foreground">{stats.chargeableLateMinutes} min charged</p>
            )}
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Leave Deduction</p>
            <p className="mt-1 text-lg font-semibold text-red-400">
              Rs. {stats.totalLeaveDeduction.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      {recentAttendance.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-muted-foreground">No attendance records available.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Day</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Check In</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Check Out</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Late (min)</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Deduction</th>
              </tr>
            </thead>

            <tbody>
              {displayAttendance.map((record, index) => {
                const statusBadge = getStatusBadge(record.status);
                const recordDate = new Date(record.date);
                const dayName = recordDate.toLocaleDateString("en-US", { weekday: "long" });
                const isFridayOff = record.status === "Friday Off";
                const totalRecordDeduction = (record.lateDeductionAmount || 0) + (record.leaveDeductionAmount || 0);

                return (
                  <tr
                    key={record._id || index}
                    className="border-b border-border/70 transition hover:bg-muted"
                  >
                    <td className="px-6 py-4 text-sm text-card-foreground">
                      {recordDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{dayName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${statusBadge.class}`}>
                        {statusBadge.icon}
                        {record.status}
                      </span>
                      {isFridayOff && (
                        <span className="ml-2 text-xs text-blue-400/70">(Weekly Off)</span>
                      )}
                      {record.isFreeLeave && (
                        <span className="ml-2 text-xs text-green-400/70">(Free)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{record.checkIn || "—"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{record.checkOut || "—"}</td>
                    <td className="px-6 py-4 text-sm">
                      {record.lateMinutes > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Clock size={12} />
                          {record.lateMinutes}
                          {record.chargeableLateMinutes > 0 && (
                            <span className="text-xs text-muted-foreground">({record.chargeableLateMinutes} charged)</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {totalRecordDeduction > 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-400">
                          <Wallet size={12} />
                          Rs. {totalRecordDeduction.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {recentAttendance.length > 4 && (
            <div className="border-t border-border p-3 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-1 text-sm text-indigo-400 transition hover:text-indigo-300"
              >
                {showAll ? (
                  <>
                    <ChevronUp size={16} />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    View All ({recentAttendance.length} records)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}