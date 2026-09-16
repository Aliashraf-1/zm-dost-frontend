"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Building2, X } from "lucide-react";
import { sidebarSections } from "@/data/sidebar";
import { useAuth } from "@/context/AuthContext";
import SidebarSection from "./SidebarSection";

import { useSettings } from "@/context/SettingsContext";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { companyName } = useSettings(); 
  const userRole = user?.role || "employee";

  // ✅ Section open/close state (defaults from data)
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    sidebarSections.forEach((section) => {
      initial[section.id] = section.defaultOpen ?? false;
    });
    return initial;
  });

  // ✅ Auto-expand section when navigating into its routes
  useEffect(() => {
    if (pathname.startsWith("/dashboard/real-estate")) {
      setOpenSections((prev) => ({ ...prev, "real-estate": true }));
    } else if (
      pathname.startsWith("/dashboard") &&
      !pathname.startsWith("/dashboard/real-estate")
    ) {
      setOpenSections((prev) => ({ ...prev, bms: true }));
    }
  }, [pathname]);

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen border-r border-border bg-background transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          sidebarOpen
            ? "w-64 translate-x-0"
            : "w-20 -translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-border px-5 transition-colors duration-300">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:scale-105 hover:shadow-indigo-600/40">
              <Building2 size={21} className="transition-transform duration-300 hover:rotate-12" />
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ${
                sidebarOpen ? "max-w-48 opacity-100" : "max-w-0 opacity-0"
              }`}
            >
                  <h1 className="whitespace-nowrap text-sm font-bold text-foreground">
                      {companyName}
                    </h1>
              <p className="text-xs text-muted-foreground">
                Business Management
              </p>
            </div>
          </div>

          {sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-foreground hover:rotate-90 lg:hidden"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation — Sections */}
        <nav className="h-[calc(100vh-5rem)] space-y-4 overflow-y-auto p-4">
          {sidebarSections.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              isOpen={openSections[section.id]}
              onToggle={() => toggleSection(section.id)}
              sidebarOpen={sidebarOpen}
              userRole={userRole}
              setSidebarOpen={setSidebarOpen}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}