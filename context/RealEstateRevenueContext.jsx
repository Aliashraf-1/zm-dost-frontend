"use client";

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { realEstateAPI } from "@/lib/api";

const RealEstateRevenueContext = createContext(null);

export function RealEstateRevenueProvider({ children }) {
  const [revenueData, setRevenueData] = useState({
    transactions: [],
    totalRevenue: 0,
    saleCommissionTotal: 0,
    rentCommissionTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRevenue();
  }, []);

  const loadRevenue = async () => {
    try {
      setLoading(true);
      const response = await realEstateAPI.revenue.get();
      setRevenueData(response.data.data || {
        transactions: [],
        totalRevenue: 0,
        saleCommissionTotal: 0,
        rentCommissionTotal: 0,
      });
      setError(null);
    } catch (error) {
      console.error("Failed to load real estate revenue:", error);
      setError(error.response?.data?.message || "Failed to load revenue");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get revenue stats
  const getRevenueStats = useCallback(() => {
    return {
      totalRevenue: revenueData.totalRevenue || 0,
      saleCommissionTotal: revenueData.saleCommissionTotal || 0,
      rentCommissionTotal: revenueData.rentCommissionTotal || 0,
      transactionCount: (revenueData.transactions || []).length,
    };
  }, [revenueData]);

  // ✅ Get transactions (sorted, newest first)
  const getTransactions = useCallback(() => {
    return [...(revenueData.transactions || [])].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [revenueData]);

  const value = useMemo(
    () => ({
      revenueData,
      setRevenueData,
      loading,
      error,
      loadRevenue,
      getRevenueStats,
      getTransactions,
    }),
    [revenueData, loading, error, getRevenueStats, getTransactions]
  );

  return (
    <RealEstateRevenueContext.Provider value={value}>
      {children}
    </RealEstateRevenueContext.Provider>
  );
}

export function useRealEstateRevenue() {
  const context = useContext(RealEstateRevenueContext);
  if (!context) {
    throw new Error("useRealEstateRevenue must be used inside RealEstateRevenueProvider");
  }
  return context;
}