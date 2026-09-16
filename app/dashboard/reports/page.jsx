"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
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
  const router = useRouter();
  const [printing, setPrinting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const reportCards = [
    {
      title: "Profit & Loss Report",
      description: "Detailed profit and loss statement with securities breakdown",
      icon: TrendingUp,
      href: "/dashboard/reports/profit-loss",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "General Business Report",
      description: "Overview of buildings, rooms, employees, and finance",
      icon: Building2,
      href: "/dashboard/reports/general",
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Employee Performance Report",
      description: "Attendance, tasks, deductions, and efficiency metrics",
      icon: Users,
      href: "/dashboard/reports/employees",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
  ];

  // ✅ Print Current Report (the page user is viewing)
  const handlePrintCurrent = () => {
    setPrinting(true);
    try {
      // Check if there's a print function in the current page
      // We'll use window.print() which will print the current page
      window.print();
    } catch (error) {
      console.error("Print failed:", error);
    } finally {
      setTimeout(() => setPrinting(false), 2000);
    }
  };

  // ✅ Export All Reports (Generate combined report)
  const handleExportAll = async () => {
    setExporting(true);
    try {
      // Fetch all report data
      const response = await fetch('/api/reports/export-all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // For now, since backend is not ready, we'll generate a combined HTML report
      const allReports = await generateCombinedReport();
      
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

  // ✅ Generate combined report (fallback when backend is not ready)
  const generateCombinedReport = async () => {
    // This will be replaced with actual API call later
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
            .badge-high { background: #d1fae5; color: #065f46; }
            .badge-medium { background: #fef3c7; color: #92400e; }
            .badge-low { background: #fee2e2; color: #991b1b; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Combined Business Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>All Reports Combined</p>
          </div>

          <!-- General Business Summary -->
          <div class="section">
            <h2>General Business Summary</h2>
            <div class="grid-3">
              <div class="stat-card">
                <div class="value">12</div>
                <div class="label">Total Buildings</div>
              </div>
              <div class="stat-card">
                <div class="value">48</div>
                <div class="label">Total Units</div>
              </div>
              <div class="stat-card">
                <div class="value">24</div>
                <div class="label">Total Employees</div>
              </div>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="section">
            <h2>Financial Summary</h2>
            <div class="grid-3">
              <div class="stat-card">
                <div class="value profit">Rs. 86,000</div>
                <div class="label">Total Income</div>
              </div>
              <div class="stat-card">
                <div class="value loss">Rs. 183,000</div>
                <div class="label">Total Expenses</div>
              </div>
              <div class="stat-card">
                <div class="value loss">- Rs. 97,000</div>
                <div class="label">Net Profit / Loss</div>
              </div>
            </div>
          </div>

          <!-- Employee Performance Summary -->
          <div class="section">
            <h2>Employee Performance Summary</h2>
            <div class="grid-2">
              <div class="stat-card">
                <div class="value">5</div>
                <div class="label">Total Employees</div>
              </div>
              <div class="stat-card">
                <div class="value">4</div>
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
            Generate comprehensive reports for your business.
          </p>
        </div>

        {/* Report Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reportCards.map((card) => (
            <Link
              key={card.href}
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

            {/* ✅ Success Message (when done) */}
            {!printing && !exporting && (
              <span className="text-xs text-muted-foreground self-center">
                Click Print to print current page, or Export All for combined report
              </span>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}