"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { userAPI } from "@/lib/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Load users from API on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      setUsers(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Failed to load users:", error);
      setError(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new user
  const addUser = async (userData) => {
    try {
      const response = await userAPI.create(userData);
      const newUser = response.data.data;
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (error) {
      console.error("Failed to add user:", error);
      throw error;
    }
  };

  // ✅ Update user
  const updateUser = async (userId, updates) => {
    try {
      const response = await userAPI.update(userId, updates);
      const updatedUser = response.data.data;
      setUsers(prev => prev.map(user => user._id === userId ? updatedUser : user));
      return updatedUser;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

  // ✅ Delete user
  const deleteUser = async (userId) => {
    try {
      await userAPI.delete(userId);
      setUsers(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  };

  // ✅ Get user by ID
  const getUserById = (userId) => {
    return users.find((user) => user._id === userId);
  };

  // ✅ Get users by role
  const getUsersByRole = (role) => {
    return users.filter((user) => user.role === role);
  };

  // ✅ Get user by employee ID
  const getUserByEmployeeId = (employeeId) => {
    return users.find((user) => user.employeeId === employeeId);
  };

  // ✅ Get all active users
  const getActiveUsers = () => {
    return users.filter((user) => user.status === "active");
  };

  const value = useMemo(
    () => ({
      users,
      setUsers,
      loading,
      error,
      loadUsers,
      addUser,
      updateUser,
      deleteUser,
      getUserById,
      getUsersByRole,
      getUserByEmployeeId,
      getActiveUsers,
    }),
    [users, loading, error]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers must be used inside UserProvider");
  }
  return context;
};