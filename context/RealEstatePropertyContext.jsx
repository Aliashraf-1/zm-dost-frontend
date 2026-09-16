"use client";

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { realEstateAPI } from "@/lib/api";

const RealEstatePropertyContext = createContext(null);

export function RealEstatePropertyProvider({ children }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Load properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  // ✅ Load all properties
  const loadProperties = async (params = {}) => {
    try {
      setLoading(true);
      const response = await realEstateAPI.properties.getAll(params);
      setProperties(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Failed to load properties:", error);
      setError(error.response?.data?.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create property
  const createProperty = async (formData) => {
    try {
      const response = await realEstateAPI.properties.create(formData);
      const newProperty = response.data.data;
      setProperties(prev => [newProperty, ...prev]);
      return newProperty;
    } catch (error) {
      console.error("Failed to create property:", error);
      throw error;
    }
  };

  // ✅ Update property
  const updateProperty = async (id, formData) => {
    try {
      const response = await realEstateAPI.properties.update(id, formData);
      const updatedProperty = response.data.data;
      setProperties(prev => prev.map(p => (p._id === id ? updatedProperty : p)));
      return updatedProperty;
    } catch (error) {
      console.error("Failed to update property:", error);
      throw error;
    }
  };

  // ✅ Close property (status change + optional commission)
  const closeProperty = async (id, data) => {
    try {
      const response = await realEstateAPI.properties.close(id, data);
      const updatedProperty = response.data.data;
      setProperties(prev => prev.map(p => (p._id === id ? updatedProperty : p)));
      return updatedProperty;
    } catch (error) {
      console.error("Failed to close property:", error);
      throw error;
    }
  };

  // ✅ Delete property
  const deleteProperty = async (id) => {
    try {
      await realEstateAPI.properties.delete(id);
      setProperties(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error("Failed to delete property:", error);
      throw error;
    }
  };

  // ✅ Get by ID
  const getPropertyById = useCallback((id) => {
    return properties.find(p => p._id === id) || null;
  }, [properties]);

  // ✅ Stats
  const getPropertyStats = useCallback(() => {
    const total = properties.length;
    const forSale = properties.filter(p => p.listingType === "for_sale").length;
    const forRent = properties.filter(p => p.listingType === "for_rent").length;
    const active = properties.filter(p => p.status === "active").length;
    const closed = properties.filter(p => p.status === "closed_via_us").length;

    return { total, forSale, forRent, active, closed };
  }, [properties]);

  const value = useMemo(
    () => ({
      properties,
      setProperties,
      loading,
      error,
      loadProperties,
      createProperty,
      updateProperty,
      closeProperty,
      deleteProperty,
      getPropertyById,
      getPropertyStats,
    }),
    [properties, loading, error, getPropertyById, getPropertyStats]
  );

  return (
    <RealEstatePropertyContext.Provider value={value}>
      {children}
    </RealEstatePropertyContext.Provider>
  );
}

export function useRealEstateProperties() {
  const context = useContext(RealEstatePropertyContext);
  if (!context) {
    throw new Error("useRealEstateProperties must be used inside RealEstatePropertyProvider");
  }
  return context;
}