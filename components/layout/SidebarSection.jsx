"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

/**
 * SidebarSection — Collapsible section group for the sidebar.
 *
 * Props:
 *  - section: { id, title, items[], defaultOpen }
 *  - isOpen: boolean  (parent-controlled state)
 *  - onToggle: () => void
 *  - sidebarOpen: boolean (whether sidebar itself is expanded)
 *  - userRole: string
 *  - setSidebarOpen: (open: boolean) => void  (to close mobile drawer)
 */
export default function SidebarSection({
  section,
  isOpen,
  onToggle,
  sidebarOpen,
  userRole,
  setSidebarOpen,
}) {
  const pathname = usePathname();

  // ✅ Filter items by user role
  const visibleItems = section.items.filter((item) => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(userRole);
  });

  // ✅ If no items visible, hide entire section
  if (visibleItems.length === 0) return null;

  // ✅ Sidebar collapsed → show only item icons, no header, no toggle
  if (!sidebarOpen) {
    return (
      <div className="space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isDashboard = item.href === "/dashboard";
          const active = isDashboard
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={`group relative flex items-center justify-center rounded-xl px-3 py-3 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title={item.title}
            >
              <Icon
                size={20}
                className={`shrink-0 transition-transform duration-300 ${
                  active ? "scale-110" : "group-hover:scale-110"
                }`}
              />
              {active && (
                <span className="absolute -right-0.5 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-white/50" />
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  // ✅ Sidebar expanded → render toggle header + items
  return (
    <div className="space-y-1">
      {/* Section Header (Toggle) */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors duration-200 hover:text-foreground"
      >
        <span className="truncate">{section.title}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-300 ${
            isOpen ? "" : "-rotate-90"
          }`}
        />
      </button>

      {/* Section Items (collapsible) */}
      <div
        className={`space-y-2 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isDashboard = item.href === "/dashboard";
          const active = isDashboard
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon
                size={20}
                className={`shrink-0 transition-transform duration-300 ${
                  active ? "scale-110" : "group-hover:scale-110"
                }`}
              />
              <span className="overflow-hidden whitespace-nowrap text-sm font-medium">
                {item.title}
              </span>
              {active && (
                <span className="absolute -right-0.5 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-white/50" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}