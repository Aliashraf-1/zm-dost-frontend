"use client";

import { useState, useMemo, useRef } from "react";
import { useBuildings } from "@/context/BuildingContext";
import { useEmployees } from "@/context/EmployeeContext";
import { useRevenue } from "@/context/RevenueContext";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import ReportFilters from "@/components/reports/ReportFilters";
import ExportButton from "@/components/reports/ExportButton";
import {
  Building2,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  DoorOpen,
  UserCheck,
  UserX,
  Calendar,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";

export default function GeneralReport() {
  const { buildings } = useBuildings();
  const { employees } = useEmployees();
  const { revenueData } = useRevenue();
  const { user } = useAuth();
  const printRef = useRef(null);

  const [period, setPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Calculate stats for the selected period
  const stats = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Buildings added/removed in period
    const buildingsAdded = buildings.filter(
      b => new Date(b.createdAt) >= start && new Date(b.createdAt) <= end
    ).length;
    const buildingsRemoved = buildings.filter(
      b => b.status === "Inactive" && new Date(b.updatedAt) >= start && new Date(b.updatedAt) <= end
    ).length;

    // Units added/rented/available in period
    let unitsAdded = 0;
    let unitsRented = 0;
    let unitsAvailable = 0;
    buildings.forEach(b => {
      (b.rooms || []).forEach(r => {
        if (new Date(r.createdAt) >= start && new Date(r.createdAt) <= end) {
          unitsAdded++;
        }
        if (r.status === "Rented" && new Date(r.rentStartDate || r.updatedAt) >= start && new Date(r.rentStartDate || r.updatedAt) <= end) {
          unitsRented++;
        }
        if (r.status === "Available" && new Date(r.updatedAt) >= start && new Date(r.updatedAt) <= end) {
          unitsAvailable++;
        }
      });
    });

    // Employees added/removed in period
    const employeesAdded = employees.filter(
      e => new Date(e.createdAt) >= start && new Date(e.createdAt) <= end
    ).length;
    const employeesRemoved = employees.filter(
      e => e.status === "Inactive" && new Date(e.updatedAt) >= start && new Date(e.updatedAt) <= end
    ).length;

    // Major expenses in period
    const periodExpenses = (revenueData.expenses || []).filter(
      e => new Date(e.createdAt) >= start && new Date(e.createdAt) <= end
    );
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const majorExpenses = periodExpenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Totals
    const totalBuildings = buildings.length;
    const activeBuildings = buildings.filter(b => b.status === "Active").length;
    const totalRooms = buildings.reduce((sum, b) => sum + (b.rooms?.length || 0), 0);
    const rentedRooms = buildings.reduce(
      (sum, b) => sum + (b.rooms?.filter(r => r.status === "Rented").length || 0),
      0
    );
    const availableRooms = totalRooms - rentedRooms;
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === "Active").length;

    return {
      buildings: { added: buildingsAdded, removed: buildingsRemoved, total: totalBuildings, active: activeBuildings },
      units: { added: unitsAdded, rented: unitsRented, available: unitsAvailable, total: totalRooms, rentedTotal: rentedRooms, availableTotal: availableRooms },
      employees: { added: employeesAdded, removed: employeesRemoved, total: totalEmployees, active: activeEmployees },
      expenses: { total: totalExpenses, major: majorExpenses, count: periodExpenses.length },
    };
  }, [buildings, employees, revenueData, startDate, endDate]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (printWindow) {
      const content = document.getElementById('report-content');
      if (content) {
        printWindow.document.write(`
          <html>
            <head>
              <title>General Business Report</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 1000px; margin: 0 auto; background: #fff; color: #1e293b; }
                .header { text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
                .header h1 { font-size: 28px; margin: 0; }
                .header p { color: #64748b; margin: 5px 0; }
                .section { margin: 20px 0; }
                .section h2 { font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
                .stat-card { border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
                .stat-card .value { font-size: 22px; font-weight: bold; }
                .stat-card .label { font-size: 12px; color: #64748b; margin-top: 4px; }
                .stat-card .change { font-size: 12px; margin-top: 4px; }
                .stat-card .positive { color: #10b981; }
                .stat-card .negative { color: #ef4444; }
                .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
                .row .label { color: #475569; }
                .profit { color: #10b981; }
                .loss { color: #ef4444; }
                .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                .totals-section { background: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 12px; }
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

  const handleExportPDF = () => {
    handlePrint();
  };

  return (
    <ProtectedRoute requiredRoles={["admin", "lead_manager", "moderator", "super_admin"]}>
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-400">Reports</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">General Business Report</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Comprehensive overview of your business performance for the selected period.
            </p>
          </div>
          <ExportButton onPrint={handlePrint} onExportPDF={handleExportPDF} />
        </div>

        {/* Filters */}
        <ReportFilters
          period={period}
          setPeriod={setPeriod}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onApply={() => {}}
        />

        {/* Report Content */}
        <div id="report-content" ref={printRef}>
          <div className="header">
            <h1>General Business Report</h1>
            <p>Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</p>
          </div>

          {/* Buildings Section */}
          <div className="section">
            <h2>🏢 Buildings</h2>
            <div className="grid-3">
              <div className="stat-card">
                <div className="value">{stats.buildings.added}</div>
                <div className="label">Buildings Added</div>
                <div className="change positive">+{stats.buildings.added} in period</div>
              </div>
              <div className="stat-card">
                <div className="value">{stats.buildings.removed}</div>
                <div className="label">Buildings Removed</div>
                <div className="change negative">-{stats.buildings.removed} in period</div>
              </div>
              <div className="stat-card">
                <div className="value">{stats.buildings.active}</div>
                <div className="label">Active Buildings</div>
                <div className="change">Out of {stats.buildings.total} total</div>
              </div>
            </div>
          </div>

          {/* Units Section */}
          <div className="section">
            <h2>🚪 Units</h2>
            <div className="grid-3">
              <div className="stat-card">
                <div className="value">{stats.units.added}</div>
                <div className="label">Units Added</div>
                <div className="change positive">+{stats.units.added} new units</div>
              </div>
              <div className="stat-card">
                <div className="value">{stats.units.rented}</div>
                <div className="label">Units Rented</div>
                <div className="change positive">{stats.units.rented} in period</div>
              </div>
              <div className="stat-card">
                <div className="value">{stats.units.available}</div>
                <div className="label">Units Available</div>
                <div className="change">{stats.units.available} in period</div>
              </div>
            </div>
            <div className="totals-section">
              <div className="grid-3" style={{ marginTop: '0' }}>
                <div><strong>Total Units:</strong> {stats.units.total}</div>
                <div><strong>Rented:</strong> {stats.units.rentedTotal}</div>
                <div><strong>Available:</strong> {stats.units.availableTotal}</div>
              </div>
            </div>
          </div>

          {/* Employees Section */}
          <div className="section">
            <h2>👥 Employees</h2>
            <div className="grid-3">
              <div className="stat-card">
                <div className="value">{stats.employees.added}</div>
                <div className="label">Employees Added</div>
                <div className="change positive">+{stats.employees.added} new hires</div>
              </div>
              <div className="stat-card">
                <div className="value">{stats.employees.removed}</div>
                <div className="label">Employees Removed</div>
                <div className="change negative">-{stats.employees.removed} left</div>
              </div>
              <div className="stat-card">
                <div className="value">{stats.employees.active}</div>
                <div className="label">Active Employees</div>
                <div className="change">Out of {stats.employees.total} total</div>
              </div>
            </div>
          </div>

          {/* Major Expenses Section */}
          <div className="section">
            <h2>💰 Major Expenses</h2>
            <div className="stat-card" style={{ marginBottom: '16px' }}>
              <div className="value loss">Rs. {stats.expenses.total.toLocaleString()}</div>
              <div className="label">Total Expenses in Period ({stats.expenses.count} transactions)</div>
            </div>
            {stats.expenses.major.length > 0 ? (
              stats.expenses.major.map((exp, i) => (
                <div key={i} className="row">
                  <span className="label">{exp.category || exp.type} - {exp.description || ''}</span>
                  <span style={{ color: '#ef4444' }}>Rs. {exp.amount.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No major expenses recorded</p>
            )}
          </div>

          {/* Footer */}
          <div className="footer">
            Generated by Zameen Dost Marketing BMS • {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}