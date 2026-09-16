"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useEmployees } from "@/context/EmployeeContext";
import { useLeads } from "@/context/LeadContext";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import ReportFilters from "@/components/reports/ReportFilters";
import ExportButton from "@/components/reports/ExportButton";
import {
  User,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Calendar,
  Briefcase,
  Search,
} from "lucide-react";

export default function EmployeeReport() {
  const { employees } = useEmployees();
  const { getLeadsByEmployee } = useLeads();
  const { user } = useAuth();
  const printRef = useRef(null);

  const [period, setPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate employee stats
  const employeeStats = useMemo(() => {
    return employees.map((emp) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const attendance = (emp.attendance || []).filter(
        (a) => new Date(a.date) >= start && new Date(a.date) <= end
      );

      const tasks = (emp.tasks || []).filter(
        (t) => new Date(t.assignedDate) >= start && new Date(t.assignedDate) <= end
      );

      const present = attendance.filter(a => a.status === "Present").length;
      const absent = attendance.filter(a => a.status === "Absent").length;
      const leaves = attendance.filter(a => a.status === "Leave").length;
      const totalDays = attendance.length;
      const attendanceRate = totalDays > 0 ? (present / totalDays) * 100 : 0;

      const completedTasks = tasks.filter(t => t.status === "Completed").length;
      const failedTasks = tasks.filter(t => t.status === "Failed").length;
      const pendingTasks = tasks.filter(t => t.status === "Pending" || t.status === "In Progress").length;
      const totalTasks = tasks.length;
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const leavesDeduction = leaves * (emp.attendanceSettings?.leaveDeduction || 500);
      const lateMinutes = attendance.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
      const lateDeduction = lateMinutes * (emp.attendanceSettings?.lateDeduction || 10);
      const taskFailureDeduction = failedTasks * (emp.attendanceSettings?.taskFailureDeduction || 1000);
      const totalDeduction = leavesDeduction + lateDeduction + taskFailureDeduction;
      const convertedLeads = getLeadsByEmployee(emp._id || emp.id).filter((lead) => {
        if (lead.status !== "Converted" && lead.status !== "Closed") return false;
        const convertedDate = new Date(lead.convertedAt || lead.updatedAt || lead.createdAt);
        return convertedDate >= start && convertedDate <= end;
      });

      return {
        ...emp,
        attendance: { present, absent, leaves, total: totalDays, rate: attendanceRate },
        tasks: { completed: completedTasks, failed: failedTasks, pending: pendingTasks, total: totalTasks, rate: taskCompletionRate },
        deductions: { leaves: leavesDeduction, late: lateDeduction, taskFailure: taskFailureDeduction, total: totalDeduction },
        leadCredits: convertedLeads.map((lead) => ({
          customerName: lead.customerName || "Unnamed customer",
          credits: 1,
        })),
        performance: {
          attendanceRate,
          taskCompletionRate,
          efficiency: (attendanceRate + taskCompletionRate) / 2,
        },
      };
    });
  }, [employees, startDate, endDate, getLeadsByEmployee]);

  // ✅ Filter employees by search
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employeeStats;
    const term = searchTerm.toLowerCase().trim();
    return employeeStats.filter(
      (emp) =>
        emp.name.toLowerCase().includes(term) ||
        emp.designation.toLowerCase().includes(term) ||
        emp.department.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term)
    );
  }, [employeeStats, searchTerm]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (printWindow) {
      const content = document.getElementById('report-content');
      if (content) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Employee Performance Report</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; background: #fff; color: #1e293b; }
                .header { text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
                .header h1 { font-size: 28px; margin: 0; }
                .header p { color: #64748b; margin: 5px 0; }
                .employee-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
                .employee-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px; }
                .employee-name { font-size: 18px; font-weight: bold; }
                .employee-designation { font-size: 14px; color: #64748b; }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 8px 0; }
                .stat { font-size: 12px; }
                .stat .value { font-weight: bold; font-size: 16px; }
                .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
                .badge-high { background: #d1fae5; color: #065f46; }
                .badge-medium { background: #fef3c7; color: #92400e; }
                .badge-low { background: #fee2e2; color: #991b1b; }
                .row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 13px; }
                .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                @media print { body { padding: 20px; } }
              </style>
            </head>
            <body>
              ${content.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  return (
    <ProtectedRoute requiredRoles={["admin", "lead_manager", "moderator", "super_admin"]}>
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-400">Reports</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Employee Performance</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Detailed performance metrics for all employees.
            </p>
          </div>
          <ExportButton onPrint={handlePrint} onExportPDF={handlePrint} />
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <ReportFilters
            period={period}
            setPeriod={setPeriod}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onApply={() => {}}
          />
          
          {/* ✅ Search Bar */}
          <div className="relative max-w-md">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employees by name, designation, department..."
              className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-indigo-500"
            />
            {searchTerm && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {filteredEmployees.length} results
              </span>
            )}
          </div>
        </div>

        {/* Report Content */}
        <div id="report-content" ref={printRef}>
          <div className="header">
            <h1>Employee Performance Report</h1>
            <p>Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</p>
            {searchTerm && (
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Search: "{searchTerm}" • {filteredEmployees.length} employees found
              </p>
            )}
          </div>

          {/* Employee Cards */}
          {filteredEmployees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              No employees found matching your search.
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const efficiency = emp.performance.efficiency;
              let badge = "badge-medium";
              let badgeText = "Medium";
              if (efficiency >= 80) { badge = "badge-high"; badgeText = "High"; }
              else if (efficiency >= 50) { badge = "badge-medium"; badgeText = "Medium"; }
              else { badge = "badge-low"; badgeText = "Low"; }

              return (
                <div key={emp._id || emp.id} className="employee-card">
                  <div className="employee-header">
                    <div>
                      <span className="employee-name">{emp.name}</span>
                      <span className="employee-designation"> • {emp.designation}</span>
                    </div>
                    <div>
                      <span className={`badge ${badge}`}>{badgeText} Performance</span>
                      <Link
                        href={`/dashboard/employees/${emp._id || emp.id}`}
                        className="ml-2 inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-700"
                      >
                        <Eye size={14} />
                        View Profile
                      </Link>
                    </div>
                  </div>

                  <div className="stats-grid">
                    <div className="stat">
                      <div className="value">{emp.attendance.rate.toFixed(1)}%</div>
                      <div className="label">Attendance</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        {emp.attendance.present}/{emp.attendance.total} days
                      </div>
                    </div>
                    <div className="stat">
                      <div className="value">{emp.tasks.rate.toFixed(1)}%</div>
                      <div className="label">Task Completion</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        {emp.tasks.completed}/{emp.tasks.total} tasks
                      </div>
                    </div>
                    <div className="stat">
                      <div className="value" style={{ color: '#ef4444' }}>
                        Rs. {emp.deductions.total.toLocaleString()}
                      </div>
                      <div className="label">Total Deductions</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        {emp.deductions.leaves > 0 ? `Leaves: ${emp.attendance.leaves}, ` : ''}
                        {emp.deductions.late > 0 ? `Late: ${emp.attendance.leaves}, ` : ''}
                        {emp.deductions.taskFailure > 0 ? `Task Failures: ${emp.tasks.failed}` : ''}
                      </div>
                    </div>
                    <div className="stat">
                      <div className="value" style={{ color: '#10b981' }}>
                        {emp.attendance.present > 0 ? `Rs. ${(emp.salary - emp.deductions.total).toLocaleString()}` : '—'}
                      </div>
                      <div className="label">Net Salary</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        Base: Rs. {emp.salary.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="row" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <span>Tasks: {emp.tasks.completed} Completed, {emp.tasks.pending} Pending, {emp.tasks.failed} Failed</span>
                    <span>Attendance: {emp.attendance.present} Present, {emp.attendance.absent} Absent, {emp.attendance.leaves} Leaves</span>
                  </div>
                  <div className="row" style={{ marginTop: '6px' }}>
                    <span>Lead conversion credits: {emp.leadCredits.length}</span>
                    <span>
                      {emp.leadCredits.length > 0
                        ? emp.leadCredits.map((credit) => `${credit.customerName} (1 credit)`).join(", ")
                        : "No converted leads in this period"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="rounded-2xl border border-border bg-card p-4 text-center text-xs text-muted-foreground">
          Generated by Zameen Dost Marketing BMS • {new Date().toLocaleString()}
        </div>
      </div>
    </ProtectedRoute>
  );
}
