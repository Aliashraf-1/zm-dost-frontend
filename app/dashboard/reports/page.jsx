"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useBuildings } from "@/context/BuildingContext";
import { reportsAPI } from "@/lib/api";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import ReportFilters from "@/components/reports/ReportFilters";
import {
  FileText,
  TrendingUp,
  Building2,
  Users,
  ArrowRight,
  Calendar,
  Printer,
  Download,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

export default function ReportsPage() {
  const { user } = useAuth();
  const { buildings = [] } = useBuildings() || {};
  const router = useRouter();
  const [printing, setPrinting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [period, setPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [buildingId, setBuildingId] = useState("");
  const [shift, setShift] = useState("");

  const selectedBuilding = (buildings || []).find(
    (b) => String(b._id || b.id) === String(buildingId)
  );
  const buildingLabel = selectedBuilding?.name || (buildingId ? `Building ${selectedBuilding?.buildingNo || buildingId}` : "All Buildings");

  const queryParams = new URLSearchParams({
    period,
    ...(buildingId ? { buildingId } : {}),
    ...(shift ? { shift } : {}),
  }).toString();

  const reportCards = [
    {
      title: "Profit & Loss Report",
      description: "Detailed profit and loss statement with securities breakdown",
      icon: TrendingUp,
      href: `/dashboard/reports/profit-loss${queryParams ? `?${queryParams}` : ''}`,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "General Business Report",
      description: "Overview of buildings, rooms, employees, and finance",
      icon: Building2,
      href: `/dashboard/reports/general${queryParams ? `?${queryParams}` : ''}`,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Employee Performance Report",
      description: "Attendance, tasks, deductions, and efficiency metrics",
      icon: Users,
      href: `/dashboard/reports/employees${queryParams ? `?${queryParams}` : ''}`,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
  ];

  // ✅ Export All Reports (Generate combined report)
  const handleExportAll = async () => {
    setExporting(true);
    try {
      let exportData = null;
      try {
        const response = await reportsAPI.exportAll({
          period,
          buildingId: buildingId || undefined,
          shift: shift || undefined,
        });
        exportData = response?.data?.data;
      } catch (err) {
        console.warn("Backend exportAll endpoint error, generating fallback combined report:", err);
      }

      const allReports = generateCombinedReport(exportData);
      
      // Open in new window for print/PDF
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (printWindow) {
        printWindow.document.write(allReports);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export reports. Please try again.");
    } finally {
      setTimeout(() => setExporting(false), 2000);
    }
  };

  // ✅ Generate combined report (HTML template)
  const generateCombinedReport = (data) => {
    const pl = data?.profitLoss || {};
    const gen = data?.general || {};
    const emp = data?.employee || {};

    const totalIncome = pl.totalIncome || 0;
    const totalExpenses = pl.totalExpenses || 0;
    const netProfit = totalIncome - totalExpenses;

    return `
      <html>
        <head>
          <title>Combined Business Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; background: #fff; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-size: 28px; margin: 0; }
            .header p { color: #64748b; margin: 5px 0; }
            .section { margin: 30px 0; }
            .section h2 { font-size: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
            .stat-card { border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
            .stat-card .value { font-size: 22px; font-weight: bold; }
            .stat-card .label { font-size: 12px; color: #64748b; margin-top: 4px; }
            .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .profit { color: #10b981; }
            .loss { color: #ef4444; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Combined Business Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p style="font-weight: 600; color: #1e293b;">
              Building: ${buildingLabel} • Shift: ${shift || "All Shifts"} • Period: ${period.toUpperCase()}
            </p>
          </div>

          <!-- General Business Summary -->
          <div class="section">
            <h2>General Business Summary</h2>
            <div class="grid-3">
              <div class="stat-card">
                <div class="value">${gen.buildings ?? buildings.length}</div>
                <div class="label">Total Buildings</div>
              </div>
              <div class="stat-card">
                <div class="value">${gen.customers ?? 0}</div>
                <div class="label">Total Customers</div>
              </div>
              <div class="stat-card">
                <div class="value">${emp.total ?? 0}</div>
                <div class="label">Total Employees</div>
              </div>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="section">
            <h2>Financial Summary</h2>
            <div class="grid-3">
              <div class="stat-card">
                <div class="value profit">Rs. ${totalIncome.toLocaleString()}</div>
                <div class="label">Total Income</div>
              </div>
              <div class="stat-card">
                <div class="value loss">Rs. ${totalExpenses.toLocaleString()}</div>
                <div class="label">Total Expenses</div>
              </div>
              <div class="stat-card">
                <div class="value" style="color: ${netProfit >= 0 ? '#10b981' : '#ef4444'}">
                  ${netProfit >= 0 ? '+' : '-'} Rs. ${Math.abs(netProfit).toLocaleString()}
                </div>
                <div class="label">Net Profit / Loss</div>
              </div>
            </div>
          </div>

          <!-- Employee Performance Summary -->
          <div class="section">
            <h2>Employee Performance Summary</h2>
            <div class="grid-2">
              <div class="stat-card">
                <div class="value">${emp.total ?? 0}</div>
                <div class="label">Total Employees</div>
              </div>
              <div class="stat-card">
                <div class="value">${emp.active ?? 0}</div>
                <div class="label">Active Employees</div>
              </div>
            </div>
          </div>

          <div class="footer">
            Generated by Zameen Dost Marketing BMS • ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;
  };

  return (
    <ProtectedRoute requiredRoles={["admin", "moderator", "super_admin"]}>
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div>
          <p className="text-sm font-medium text-indigo-400">Analytics</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reports & Analytics</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Generate comprehensive reports for your business with building and shift filters.
          </p>
        </div>

        {/* Global Filters on Main Page */}
        <ReportFilters
          period={period}
          setPeriod={setPeriod}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          buildingId={buildingId}
          setBuildingId={setBuildingId}
          shift={shift}
          setShift={setShift}
          onApply={() => {}}
        />

        {/* Report Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reportCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-black/20"
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-xl ${card.bgColor} p-3 ${card.color}`}>
                  <card.icon size={22} />
                </div>
                <ArrowRight
                  size={18}
                  className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-indigo-400"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar size={12} />
                <span>Available: Weekly, Monthly, Annual</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {/* ✅ Export All Reports */}
            <button
              onClick={handleExportAll}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export All Reports
                </>
              )}
            </button>

            {/* ✅ Message */}
            {!printing && !exporting && (
              <span className="text-xs text-muted-foreground self-center">
                Click Export All to generate a combined report filtered by {buildingLabel} ({shift || "All Shifts"}).
              </span>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}