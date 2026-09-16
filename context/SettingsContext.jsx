"use client";

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { settingsAPI } from "@/lib/api";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  general: {
    companyName: "Zameen Dost Marketing",
    companyPhone: "",
    companyEmail: "",
    companyAddress: "",
    currency: "Rs.",
    dateFormat: "DD/MM/YYYY",
    timeZone: "Asia/Karachi",
    theme: "system",
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ✅ Sirf tab API call karo jab token ho
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("bms-token");
    if (!token) {
      setLoading(false);
      return;
    }

    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.get();
      const fetched = response.data?.data;

      if (fetched) {
        setSettings((prev) => ({
          ...prev,
          ...fetched,
          general: { ...prev.general, ...(fetched.general || {}) },
        }));
      }
      setError(null);
    } catch (err) {
      // ✅ 401 pe silently fail karo (login page pe normal hai)
      if (err?.response?.status !== 401) {
        console.error("Failed to load settings in context:", err);
      }
      setError(err?.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = useCallback(async (newSettings) => {
    try {
      const response = await settingsAPI.update(newSettings);
      const updated = response.data?.data;
      if (updated) {
        setSettings((prev) => ({
          ...prev,
          ...updated,
          general: { ...prev.general, ...(updated.general || {}) },
        }));
      }
      return updated;
    } catch (err) {
      console.error("Failed to update settings:", err);
      throw err;
    }
  }, []);

  const setLocalSettings = useCallback((newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      general: { ...prev.general, ...(newSettings.general || {}) },
    }));
  }, []);

  const companyName = settings?.general?.companyName || "Zameen Dost Marketing";

  const value = useMemo(
    () => ({
      settings,
      loading,
      error,
      companyName,
      loadSettings,
      updateSettings,
      setLocalSettings,
    }),
    [settings, loading, error, companyName, loadSettings, updateSettings, setLocalSettings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return context;
}