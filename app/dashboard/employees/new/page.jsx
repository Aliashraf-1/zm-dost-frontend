"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { useEmployees } from "@/context/EmployeeContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function NewEmployeePage() {
  const router = useRouter();
  const { createEmployee } = useEmployees();

  const handleSubmit = async (employeeData) => {
    try {
      await createEmployee(employeeData);
      router.push("/dashboard/employees");
    } catch (error) {
      console.error("Failed to create employee:", error);
      throw error;
    }
  };

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
            Add New Employee
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a new employee to the system.
          </p>
        </div>

        <EmployeeForm 
          mode="create" 
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard/employees")}
        />
      </div>
    </ProtectedRoute>
  );
}