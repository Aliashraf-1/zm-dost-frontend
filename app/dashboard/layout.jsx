"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { BuildingProvider } from "@/context/BuildingContext";
import { EmployeeProvider } from "@/context/EmployeeContext";
import { RevenueProvider } from "@/context/RevenueContext";
import { LeadProvider } from "@/context/LeadContext";
import { UserProvider } from "@/context/UserContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { RealEstatePropertyProvider } from "@/context/RealEstatePropertyContext";
import { RealEstateRequirementProvider } from "@/context/RealEstateRequirementContext";
import { RealEstateRevenueProvider } from "@/context/RealEstateRevenueContext";

export default function DashboardLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <BuildingProvider>
      <EmployeeProvider>
        <RevenueProvider>
          <LeadProvider>
            <CustomerProvider>
              <UserProvider>
                <RealEstatePropertyProvider>
                  <RealEstateRequirementProvider>
                    <RealEstateRevenueProvider>
                      <div className="min-h-screen bg-background text-foreground">
                        <Sidebar
                          sidebarOpen={sidebarOpen}
                          setSidebarOpen={setSidebarOpen}
                        />

                        <div
                          className={`min-h-screen transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                            sidebarOpen ? "lg:pl-64" : "lg:pl-20"
                          }`}
                        >
                          <Topbar
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                          />

                          <main className="p-5 transition-all duration-300 sm:p-6 lg:p-8">
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                              {children}
                            </div>
                          </main>
                        </div>
                      </div>
                    </RealEstateRevenueProvider>
                  </RealEstateRequirementProvider>
                </RealEstatePropertyProvider>
              </UserProvider>
            </CustomerProvider>
          </LeadProvider>
        </RevenueProvider>
      </EmployeeProvider>
    </BuildingProvider>
  );
}