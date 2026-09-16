"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEmployees } from "@/context/EmployeeContext";
import EmployeeDetails from "@/components/employees/EmployeeDetails";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { employees, setEmployees, paySalary, deleteEmployee, markAttendance, addTask, updateTask } = useEmployees();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const found = employees.find(
        (item) => item._id === params.id || item.id === params.id || item.id === Number(params.id)
      );
      if (found) {
        setEmployee(found);
      }
      setLoading(false);
    }
  }, [params.id, employees]);

  const handlePaySalary = async (employeeId, amount, deductions) => {
    try {
      const updated = await paySalary(employeeId, amount, deductions);
      setEmployee(updated);
      return updated;
    } catch (error) {
      console.error("Payment failed:", error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);
      router.push("/dashboard/employees");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

 const handleAttendanceUpdate = async (employeeId, attendanceData) => {
  try {
    const updated = await markAttendance(employeeId, attendanceData);
    setEmployee(updated);
    return updated;
  } catch (error) {
    console.error("Attendance update failed:", error);
    throw error;
  }
};

  // ✅ Add this function
  const handleTaskAdd = async (taskData) => {
    try {
      const employeeId = employee._id || employee.id;
      const updated = await addTask(employeeId, taskData);
      setEmployee(updated);
      return updated;
    } catch (error) {
      console.error("Task add failed:", error);
      throw error;
    }
  };

  const handleTaskUpdate = async (taskData) => {
    try {
      const employeeId = employee._id || employee.id;
      const taskId = taskData._id || taskData.id;
      const updated = await updateTask(employeeId, taskId, taskData);
      setEmployee(updated);
      return updated;
    } catch (error) {
      console.error("Task update failed:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading employee details...</div>
      </div>
    );
  }

  if (!employee) {
    notFound();
  }

  const isAdmin = ["admin", "super_admin"].includes(user?.role);
  const isOwnProfile = employee?.email?.toLowerCase() === user?.email?.toLowerCase();

  if (!isAdmin && !isOwnProfile) {
    notFound();
  }

  return (
    <ProtectedRoute requiredRoles={["admin", "super_admin", "lead_manager", "employee"]}>
      <EmployeeDetails
      employee={employee}
      onPaySalary={handlePaySalary}
      onDelete={handleDelete}
      onAttendanceUpdate={handleAttendanceUpdate}
      onTaskAdd={handleTaskAdd}  // ✅ Pass this
      onTaskUpdate={handleTaskUpdate}
      />
    </ProtectedRoute>
  );
}
