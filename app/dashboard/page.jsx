"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Wallet,
  Users,
  DoorOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dashboardAPI } from "@/lib/api";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import Alerts from "@/components/dashboard/Alerts";
import LeadsCard from "@/components/dashboard/LeadsCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getStats();
        setStats(response.data.data);
        setError(null);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setError(error.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1600px]">
        <div className="animate-pulse space-y-6">
          <div className="h-40 w-full rounded-2xl bg-muted" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted" />
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 h-80 rounded-2xl bg-muted" />
            <div className="h-80 rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1600px] text-center py-20">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <p className="text-red-400">Failed to load dashboard: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use stats from API or fallback to default
  const buildingStats = stats?.stats?.buildings || { total: 0, rooms: { total: 0, rented: 0, available: 0 } };
  const employeeStats = stats?.stats?.employees || { total: 0, active: 0 };
  const revenueStats = stats?.stats?.revenue || { total: 0, expenses: 0, netProfit: 0 };
  const leadStats = stats?.stats?.leads || { total: 0, new: 0, qualified: 0, converted: 0, lost: 0 };
  const recentActivities = stats?.recentActivities || [];
  const alerts = stats?.alerts || [];
  const canViewRevenue = ["admin", "super_admin", "moderator"].includes(user?.role);

  return (
    <div className="mx-auto max-w-[1600px]">
      <DashboardHeader />

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Buildings"
          value={buildingStats.total || 0}
          icon={Building2}
          description={`${buildingStats.rooms?.total || 0} total rooms`}
          href="/dashboard/buildings"
          trend={buildingStats.active ? { value: Math.round((buildingStats.active / buildingStats.total) * 100), label: "active buildings" } : null}
        />

        {canViewRevenue && <StatCard
          title="Total Revenue"
          value={`Rs. ${(revenueStats.total || 0).toLocaleString()}`}
          icon={Wallet}
          description={`${revenueStats.netProfit >= 0 ? '+' : ''}${((revenueStats.netProfit / (revenueStats.total || 1)) * 100).toFixed(1)}% margin`}
          href="/dashboard/revenue"
          trend={{ value: revenueStats.total > 0 ? Math.round((revenueStats.netProfit / revenueStats.total) * 100) : 0, label: "profit margin", positive: revenueStats.netProfit >= 0 }}
        />}

        <StatCard
          title="Total Employees"
          value={employeeStats.total || 0}
          icon={Users}
          description={`${employeeStats.active || 0} active employees`}
          href="/dashboard/employees"
          trend={employeeStats.active ? { value: Math.round((employeeStats.active / employeeStats.total) * 100), label: "active rate" } : null}
        />

        <StatCard
          title="Occupied Rooms"
          value={`${buildingStats.rooms?.rented || 0} / ${buildingStats.rooms?.total || 0}`}
          icon={DoorOpen}
          description={`${buildingStats.rooms?.available || 0} rooms available`}
          href="/dashboard/buildings"
          trend={{ value: buildingStats.rooms?.occupancyRate || 0, label: "occupancy rate" }}
        />
      </div>

      {/* Revenue + Leads */}
       {canViewRevenue &&
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
         <RevenueChart />
        </div>
        <div>
          <LeadsCard />
        </div>
      </div> }

      {/* Activity + Alerts */}
       {canViewRevenue &&
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <RecentActivity activities={recentActivities} />
        <Alerts alerts={alerts} />
      </div>}
    </div>
  );
}
