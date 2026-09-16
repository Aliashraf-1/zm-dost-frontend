"use client";

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { realEstateAPI } from "@/lib/api";

const RealEstateRequirementContext = createContext(null);

export function RealEstateRequirementProvider({ children }) {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async (params = {}) => {
    try {
      setLoading(true);
      const response = await realEstateAPI.requirements.getAll(params);
      setRequirements(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Failed to load requirements:", error);
      setError(error.response?.data?.message || "Failed to load requirements");
    } finally {
      setLoading(false);
    }
  };

  const createRequirement = async (data) => {
    try {
      const response = await realEstateAPI.requirements.create(data);
      const newRequirement = response.data.data;
      setRequirements(prev => [newRequirement, ...prev]);
      return newRequirement;
    } catch (error) {
      console.error("Failed to create requirement:", error);
      throw error;
    }
  };

  const updateRequirement = async (id, data) => {
    try {
      const response = await realEstateAPI.requirements.update(id, data);
      const updatedRequirement = response.data.data;
      setRequirements(prev => prev.map(r => (r._id === id ? updatedRequirement : r)));
      return updatedRequirement;
    } catch (error) {
      console.error("Failed to update requirement:", error);
      throw error;
    }
  };

  const deleteRequirement = async (id) => {
    try {
      await realEstateAPI.requirements.delete(id);
      setRequirements(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      console.error("Failed to delete requirement:", error);
      throw error;
    }
  };

  const getRequirementById = useCallback((id) => {
    return requirements.find(r => r._id === id) || null;
  }, [requirements]);

  const getRequirementStats = useCallback(() => {
    const total = requirements.length;
    const buyers = requirements.filter(r => r.requirementType === "buyer").length;
    const tenants = requirements.filter(r => r.requirementType === "tenant").length;
    const active = requirements.filter(r => r.status === "active").length;
    const fulfilled = requirements.filter(r => r.status === "fulfilled").length;

    return { total, buyers, tenants, active, fulfilled };
  }, [requirements]);

  const value = useMemo(
    () => ({
      requirements,
      setRequirements,
      loading,
      error,
      loadRequirements,
      createRequirement,
      updateRequirement,
      deleteRequirement,
      getRequirementById,
      getRequirementStats,
    }),
    [requirements, loading, error, getRequirementById, getRequirementStats]
  );

  return (
    <RealEstateRequirementContext.Provider value={value}>
      {children}
    </RealEstateRequirementContext.Provider>
  );
}

export function useRealEstateRequirements() {
  const context = useContext(RealEstateRequirementContext);
  if (!context) {
    throw new Error("useRealEstateRequirements must be used inside RealEstateRequirementProvider");
  }
  return context;
}