"use client";

import { Users, UserCheck, UserX, Clock, Wallet } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

export default function EmployeeStats({ employees = [] }) {
  const total = employees.length;
  const active = employees.filter((e) => e.status === "Active").length;
  const inactive = employees.filter((e) => e.status === "Inactive").length;
  const onLeave = employees.filter((e) => e.status === "On Leave").length;
  
  const totalSalary = employees
    .filter((e) => e.status === "Active")
    .reduce((sum, e) => sum + (e.salary || 0), 0);

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        title="Total Employees"
        value={total}
        icon={Users}
        description="All employees"
        href="/dashboard/employees"
      />
      <StatCard
        title="Active"
        value={active}
        icon={UserCheck}
        description="Currently working"
        href="/dashboard/employees?status=Active"
      />
      <StatCard
        title="Inactive"
        value={inactive}
        icon={UserX}
        description="Not working"
        href="/dashboard/employees?status=Inactive"
      />
      <StatCard
        title="On Leave"
        value={onLeave}
        icon={Clock}
        description="Currently on leave"
        href="/dashboard/employees?status=On Leave"
      />
      <StatCard
        title="Monthly Payroll"
        value={`Rs. ${totalSalary.toLocaleString()}`}
        icon={Wallet}
        description={`${active} active employees`}
        href="/dashboard/employees/payroll"
      />
    </div>
  );
}