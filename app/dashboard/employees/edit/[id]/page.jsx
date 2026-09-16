"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { useEmployees } from "@/context/EmployeeContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const { employees, updateEmployee, loading: contextLoading } = useEmployees();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const found = employees.find(
        (item) => item._id === params.id || item.id === params.id || item.id === Number(params.id)
      );
      setEmployee(found);
    }
    setLoading(false);
  }, [params.id, employees]);

  const handleSubmit = async (employeeData) => {
    try {
      const employeeId = params.id;
      await updateEmployee(employeeId, employeeData);
      router.push("/dashboard/employees");
    } catch (error) {
      console.error("Failed to update employee:", error);
      throw error;
    }
  };

  if (loading || contextLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading employee...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link
          href="/dashboard/employees"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={17} />
          Back to Employees
        </Link>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <h2 className="text-xl font-semibold text-card-foreground">Employee Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">This employee may have been deleted.</p>
          <Link
            href="/dashboard/employees"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "super_admin"]}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href="/dashboard/employees"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={17} />
            Back to Employees
          </Link>
          <p className="mb-1 text-sm font-medium text-indigo-400">Human Resources</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Edit Employee
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Update employee information.</p>
        </div>

        <EmployeeForm 
          initialData={employee} 
          mode="edit" 
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard/employees")}
        />
      </div>
    </ProtectedRoute>
  );
}