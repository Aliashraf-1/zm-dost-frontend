"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { employeeAPI } from "@/lib/api";

const EmployeeContext = createContext(null);

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Load employees from API on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  // ✅ Load employees
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      setEmployees(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Failed to load employees:", error);
      setError(error.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create employee
const createEmployee = async (employeeData) => {
  try {
    let dataToSend = { ...employeeData };

    // ✅ Remove fields that backend doesn't need
    delete dataToSend.id;
    delete dataToSend.createdAt;
    delete dataToSend.updatedAt;

    // ✅ If image is File, send as FormData
    if (dataToSend.image instanceof File) {
      const formData = new FormData();
      Object.keys(dataToSend).forEach(key => {
        if (key === 'shiftTiming' || key === 'attendanceSettings') {
          formData.append(key, JSON.stringify(dataToSend[key]));
        } else if (key === 'image') {
          formData.append('image', dataToSend.image);
        } else if (dataToSend[key] !== undefined && dataToSend[key] !== null && dataToSend[key] !== "") {
          formData.append(key, dataToSend[key]);
        }
      });
      dataToSend = formData;
    } else {
      // ✅ Remove image if not File
      delete dataToSend.image;
      // ✅ Clean empty values
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === "" || dataToSend[key] === undefined || dataToSend[key] === null) {
          delete dataToSend[key];
        }
      });
    }

    const response = await employeeAPI.create(dataToSend);
    const newEmployee = response.data.data;
    setEmployees(prev => [...prev, newEmployee]);
    return newEmployee;
  } catch (error) {
    console.error("Failed to create employee:", error);
    throw error;
  }
};

// ✅ Update employee
const updateEmployee = async (id, employeeData) => {
  try {
    let dataToSend = { ...employeeData };
    delete dataToSend.id;

    if (dataToSend.image instanceof File) {
      const formData = new FormData();
      Object.keys(dataToSend).forEach(key => {
        if (key === 'shiftTiming' || key === 'attendanceSettings') {
          formData.append(key, JSON.stringify(dataToSend[key]));
        } else if (key === 'image') {
          formData.append('image', dataToSend.image);
        } else if (dataToSend[key] !== undefined && dataToSend[key] !== null && dataToSend[key] !== "") {
          formData.append(key, dataToSend[key]);
        }
      });
      dataToSend = formData;
    } else {
      delete dataToSend.image;
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === "" || dataToSend[key] === undefined || dataToSend[key] === null) {
          delete dataToSend[key];
        }
      });
    }

    const response = await employeeAPI.update(id, dataToSend);
    const updatedEmployee = response.data.data;
    setEmployees(prev => prev.map(e => (e._id === id || e.id === id ? updatedEmployee : e)));
    return updatedEmployee;
  } catch (error) {
    console.error("Failed to update employee:", error);
    throw error;
  }
};

  // ✅ Delete employee
  const deleteEmployee = async (id) => {
    try {
      await employeeAPI.delete(id);
      setEmployees((prev) => prev.filter((e) => e._id !== id && e.id !== id));
    } catch (error) {
      console.error("Failed to delete employee:", error);
      throw error;
    }
  };

  // ✅ Get employee by ID
  const getEmployeeById = (id) => {
    return employees.find((e) => e._id === id || e.id === id);
  };

  // ✅ Mark attendance - FIXED
const markAttendance = async (employeeId, attendanceData) => {
  try {
    const response = await employeeAPI.markAttendance(employeeId, attendanceData);
    const updatedEmployee = response.data.data;
    setEmployees((prev) =>
      prev.map((e) => (e._id === employeeId || e.id === employeeId ? updatedEmployee : e))
    );
    return updatedEmployee;
  } catch (error) {
    console.error("Failed to mark attendance:", error);
    throw error;
  }
};

  // ✅ Add task
  const addTask = async (employeeId, taskData) => {
    try {
      const response = await employeeAPI.addTask(employeeId, taskData);
      const updatedEmployee = response.data.data;
      setEmployees((prev) =>
        prev.map((e) => (e._id === employeeId || e.id === employeeId ? updatedEmployee : e))
      );
      return updatedEmployee;
    } catch (error) {
      console.error("Failed to add task:", error);
      throw error;
    }
  };

  // ✅ Update task
  const updateTask = async (employeeId, taskId, taskData) => {
    try {
      const response = await employeeAPI.updateTask(employeeId, taskId, taskData);
      const updatedEmployee = response.data.data;
      setEmployees((prev) =>
        prev.map((e) => (e._id === employeeId || e.id === employeeId ? updatedEmployee : e))
      );
      return updatedEmployee;
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  // ✅ Pay salary - FIXED: Now accepts (employeeId, amount, deductions)
 const paySalary = async (employeeId, amount, deductions = null) => {
  try {
    const salaryData = {
      amount: Number(amount),
      deductions: deductions || { leaves: 0, late: 0, taskFailure: 0, total: 0 },
    };
    
    const response = await employeeAPI.paySalary(employeeId, salaryData);
    const updatedEmployee = response.data.data;
    setEmployees((prev) =>
      prev.map((e) => (e._id === employeeId || e.id === employeeId ? updatedEmployee : e))
    );
    return updatedEmployee;
  } catch (error) {
    console.error("Failed to pay salary:", error);
    throw error;
  }
};

  // ✅ Get employee salary status
  const getEmployeeSalaryStatus = (employeeId) => {
    const employee = employees.find((e) => e._id === employeeId || e.id === employeeId);
    if (!employee) return { status: "Pending", amount: 0, remaining: 0 };
    if (employee.status === "Inactive") {
      return { status: "Not applicable", amount: 0, remaining: 0, paidAt: null };
    }

    const history = employee.salaryHistory || [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlySalary = Number(employee.salary || 0);

    const currentMonthPayment = history.find(
      (h) => h.month === currentMonth
    );

    if (!currentMonthPayment) {
      return {
        status: "Pending",
        amount: 0,
        remaining: monthlySalary,
        paidAt: null,
      };
    }

    const paidAmount = Number(currentMonthPayment.amount || 0);
    const remaining = Math.max(monthlySalary - paidAmount, 0);

    return {
      status: currentMonthPayment.status || (paidAmount >= monthlySalary ? "Paid" : "Partial"),
      amount: paidAmount,
      remaining: remaining,
      paidAt: currentMonthPayment.paidAt || currentMonthPayment.createdAt || null,
    };
  };

  const value = useMemo(
    () => ({
      employees,
      setEmployees,
      loading,
      error,
      loadEmployees,
      createEmployee,
      updateEmployee,
      deleteEmployee,
      getEmployeeById,
      markAttendance,
      addTask,
      updateTask,
      paySalary,
      getEmployeeSalaryStatus,
    }),
    [employees, loading, error]
  );

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployees must be used inside EmployeeProvider");
  }
  return context;
}
