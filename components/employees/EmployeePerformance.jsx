"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, AlertCircle, Target } from "lucide-react";
import { useLeads } from "@/context/LeadContext";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function EmployeePerformance({ employee }) {
  const { resolvedTheme } = useTheme();
  const chartMuted = resolvedTheme === "light" ? "#64748b" : "#94a3b8";
  const attendance = employee?.attendance || [];
  const tasks = employee?.tasks || [];
  const { getLeadsByEmployee } = useLeads();

  const employeeId = employee?._id || employee?.id;
  const employeeLeads = employeeId ? getLeadsByEmployee(employeeId) : [];
  const leadStats = useMemo(() => {
    const total = employeeLeads.length;
    const converted = employeeLeads.filter(l => l.status === "Converted" || l.status === "Closed").length;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
    const convertedCustomers = employeeLeads
      .filter(l => l.status === "Converted" || l.status === "Closed")
      .map(l => l.customerName || "Unnamed customer");
    return { total, converted, conversionRate, convertedCustomers };
  }, [employeeLeads]);

  const stats = useMemo(() => {
    const totalDays = attendance.length;
    const present = attendance.filter(a => a.status === "Present").length;
    const absent = attendance.filter(a => a.status === "Absent").length;
    const leaves = attendance.filter(a => a.status === "Leave").length;
    const attendanceRate = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

    const totalTasks = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const failed = tasks.filter(t => t.status === "Failed").length;
    const pending = tasks.filter(t => t.status === "Pending" || t.status === "In Progress").length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

    const totalLateMinutes = attendance.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
    const lateDeduction = totalLateMinutes * (employee?.attendanceSettings?.lateDeduction || 10);
    const leaveDeduction = leaves * (employee?.attendanceSettings?.leaveDeduction || 500);
    const taskFailureDeduction = failed * (employee?.attendanceSettings?.taskFailureDeduction || 1000);
    const totalDeduction = lateDeduction + leaveDeduction + taskFailureDeduction;

    // ✅ Overall performance score (attendance 40%, tasks 40%, leads 20%)
    const overallScore = Math.round(
      (attendanceRate * 0.4) + (taskCompletionRate * 0.4) + (leadStats.conversionRate * 0.2)
    );

    return {
      totalDays,
      present,
      absent,
      leaves,
      attendanceRate,
      totalTasks,
      completed,
      failed,
      pending,
      taskCompletionRate,
      totalLateMinutes,
      lateDeduction,
      leaveDeduction,
      taskFailureDeduction,
      totalDeduction,
      overallScore,
    };
  }, [attendance, tasks, employee, leadStats]);

  // ... rest of component same, add lead stats display
  return (
    <div className="space-y-6">
      {/* Stats Grid - Add lead stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={16} />
            Attendance Rate
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.attendanceRate}%</p>
          <p className="text-xs text-muted-foreground">{stats.present}/{stats.totalDays} days present</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 size={16} className="text-emerald-400" />
            Task Completion
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.taskCompletionRate}%</p>
          <p className="text-xs text-muted-foreground">{stats.completed}/{stats.totalTasks} completed</p>
        </div>

        {/* ✅ Lead Stats */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target size={16} className="text-indigo-400" />
            Lead Conversion
          </div>
          <p className="mt-2 text-2xl font-bold">{leadStats.conversionRate}%</p>
          <p className="text-xs text-muted-foreground">{leadStats.converted}/{leadStats.total} converted</p>
          <p className="mt-1 text-xs text-indigo-400">{leadStats.converted} credit{leadStats.converted === 1 ? "" : "s"}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingDown size={16} className="text-red-400" />
            Total Deductions
          </div>
          <p className="mt-2 text-2xl font-bold text-red-400">
            Rs. {stats.totalDeduction.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Leaves: {stats.leaves} | Late: {stats.totalLateMinutes}min
          </p>
        </div>

        {/* ✅ Overall Score */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
          <div className="flex items-center gap-2 text-sm text-indigo-400">
            <TrendingUp size={16} />
            Overall Score
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-400">{stats.overallScore}%</p>
          <p className="text-xs text-muted-foreground">Performance rating</p>
        </div>
      </div>

      {/* Charts - same as before */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Attendance Chart */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Attendance Distribution</h3>
          <Chart
            options={{
              chart: { type: "donut", toolbar: { show: false }, background: "transparent" },
              labels: ["Present", "Absent", "Leave"],
              colors: ["#10b981", "#ef4444", "#f59e0b"],
              legend: { position: "bottom", labels: { colors: chartMuted } },
              plotOptions: {
                pie: {
                  donut: {
                    size: "70%",
                    labels: {
                      show: true,
                      total: {
                        show: true,
                        label: "Attendance",
                        color: chartMuted,
                        fontSize: "14px",
                        formatter: () => `${stats.attendanceRate}%`,
                      },
                    },
                  },
                },
              },
            }}
            series={[stats.present, stats.absent, stats.leaves]}
            type="donut"
            height={280}
          />
        </div>

        {/* Task Chart */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Task Distribution</h3>
          <Chart
            options={{
              chart: { type: "donut", toolbar: { show: false }, background: "transparent" },
              labels: ["Completed", "Failed", "Pending"],
              colors: ["#10b981", "#ef4444", "#f59e0b"],
              legend: { position: "bottom", labels: { colors: chartMuted } },
              plotOptions: {
                pie: {
                  donut: {
                    size: "70%",
                    labels: {
                      show: true,
                      total: {
                        show: true,
                        label: "Tasks",
                        color: chartMuted,
                        fontSize: "14px",
                        formatter: () => `${stats.taskCompletionRate}%`,
                      },
                    },
                  },
                },
              },
            }}
            series={[stats.completed, stats.failed, stats.pending]}
            type="donut"
            height={280}
          />
        </div>
      </div>
    </div>
  );
}
