"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Menu,
  Moon,
  Sun,
  Bell,
  Plus,
  ReceiptText,
  Settings,
} from "lucide-react";
import AddIncomeModal from "@/components/revenue/AddIncomeModal";
import QuickExpenseModal from "@/components/revenue/QuickExpenseModal";
import { useRevenue } from "@/context/RevenueContext";
import { useAuth } from "@/context/AuthContext";
import { useBuildings } from "@/context/BuildingContext";
import { useEmployees } from "@/context/EmployeeContext";
import { useLeads } from "@/context/LeadContext";
import { getCustomersFromBuildings } from "@/lib/customerUtils";
import { getLinkedEmployee } from "@/lib/leadPermissions";

export default function Topbar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();
  const { buildings } = useBuildings();
  const { employees } = useEmployees();
  const { leads } = useLeads();
  const [mounted, setMounted] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const { addIncome, addExpense } = useRevenue();

  const canUseFinance =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.role === "lead_manager" ||
    user?.role === "moderator";
  const canOpenSettings = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleAddIncome = async (data) => {
    await addIncome(data);
    setShowIncomeModal(false);
  };

  const handleAddExpense = async (data) => {
    await addExpense(data);
    setShowExpenseModal(false);
  };

  const notifications = useMemo(() => {
    const items = [];
    const customers = getCustomersFromBuildings(buildings || []);
    customers
      .filter((c) => c.status === "Overdue" || c.status === "Pending")
      .slice(0, 5)
      .forEach((c) => {
        items.push({
          id: `rent-${c.id}`,
          title: c.status === "Overdue" ? "Rent overdue" : "Rent pending",
          description: `${c.name} — ${c.buildingNo} ${c.unitNo}`,
          href: `/dashboard/customers/${c.id}`,
        });
      });

    const linked = getLinkedEmployee(user, employees);
    (linked?.tasks || [])
      .filter((t) => t.status === "Pending" || t.status === "In Progress")
      .slice(0, 5)
      .forEach((t) => {
        items.push({
          id: `task-${t._id || t.id}`,
          title: "Task pending",
          description: t.title,
          href: "/dashboard/tasks",
        });
      });

    const today = new Date();
    (leads || [])
      .filter((l) => l.followUpDate && new Date(l.followUpDate) <= today && l.status !== "Converted" && l.status !== "Lost")
      .slice(0, 4)
      .forEach((l) => {
        items.push({
          id: `lead-${l._id || l.id}`,
          title: "Lead follow-up",
          description: l.customerName,
          href: `/dashboard/leads/${l._id || l.id}`,
        });
      });

    return items.slice(0, 10);
  }, [buildings, employees, leads, user]);

  const currentTheme = mounted ? (theme || resolvedTheme || "dark") : "dark";
  const isDark = currentTheme === "dark";

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-xl transition-all duration-500 sm:px-6 lg:px-8">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="group shrink-0 rounded-xl p-2.5 text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-foreground hover:shadow-lg active:scale-95"
        >
          <Menu
            size={21}
            className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              sidebarOpen ? "rotate-90" : "rotate-0"
            } `}
          />
        </button>

        <div className="flex items-center gap-2">
          {canUseFinance && (
            <>
              <button
                onClick={() => setShowIncomeModal(true)}
                className="group hidden items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:scale-105 hover:bg-indigo-500 hover:shadow-indigo-600/40 active:scale-95 sm:flex"
              >
                <Plus size={17} className="transition-transform duration-300 group-hover:rotate-90" />
                Add Fund
              </button>

              <button
                onClick={() => setShowExpenseModal(true)}
                className="group hidden items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:border-indigo-500/50 hover:bg-muted hover:text-foreground hover:shadow-lg active:scale-95 sm:flex"
              >
                <ReceiptText size={17} className="transition-transform duration-300 group-hover:scale-110" />
                Expense
              </button>
            </>
          )}

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications((open) => !open)}
              className="group relative rounded-xl p-2.5 text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-foreground hover:shadow-lg active:scale-95"
              aria-label="Notifications"
            >
              <Bell size={20} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              {notifications.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500">
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping" />
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  <p className="text-xs text-muted-foreground">{notifications.length} items</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowNotifications(false);
                          router.push(item.href);
                        }}
                        className="w-full border-b border-border/70 px-4 py-3 text-left transition hover:bg-muted"
                      >
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="group relative rounded-xl p-2.5 text-muted-foreground transition-all duration-500 hover:bg-muted hover:text-foreground hover:shadow-lg active:scale-95"
            aria-label="Toggle theme"
          >
            <div className="relative h-5 w-5">
              <Sun
                size={20}
                className={`absolute inset-0 text-yellow-400 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isDark
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-180 scale-0 opacity-0"
                }`}
              />
              <Moon
                size={20}
                className={`absolute inset-0 text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isDark
                    ? "rotate-180 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
            </div>
          </button>

          <button
            onClick={() => {
              if (canOpenSettings) router.push("/dashboard/settings");
            }}
            className="group rounded-xl p-2.5 text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-foreground hover:shadow-lg active:scale-95"
            aria-label="Settings"
          >
            <Settings size={20} className="transition-transform duration-500 group-hover:rotate-180" />
          </button>
        </div>
      </header>

      {showIncomeModal && (
        <AddIncomeModal
          onClose={() => setShowIncomeModal(false)}
          onSave={handleAddIncome}
        />
      )}

      {showExpenseModal && (
        <QuickExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSave={handleAddExpense}
        />
      )}
    </>
  );
}
