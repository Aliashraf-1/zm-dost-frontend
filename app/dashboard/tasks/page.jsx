"use client";

import ProtectedRoute from "@/components/common/ProtectedRoute";
import EmployeeTasks from "@/components/employees/EmployeeTasks";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/EmployeeContext";
import { getLinkedEmployee } from "@/lib/leadPermissions";

export default function TasksPage() {
  const { user } = useAuth();
  const { employees, loading, updateTask } = useEmployees();
  const employee = getLinkedEmployee(user, employees);

  const handleTaskUpdate = async (taskData) => {
    const employeeId = employee._id || employee.id;
    const taskId = taskData._id || taskData.id;
    await updateTask(employeeId, taskId, taskData);
  };

  return (
    <ProtectedRoute requiredRoles={["lead_manager", "moderator", "employee"]}>
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-400">My Work</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Tasks
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Update status and details of tasks assigned to you. Tasks cannot be deleted from here.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Loading tasks...
          </div>
        ) : !employee ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No employee profile is linked to this login, so tasks cannot be shown.
          </div>
        ) : (
          <EmployeeTasks
            employee={employee}
            onTaskUpdate={handleTaskUpdate}
            canAssign={false}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
