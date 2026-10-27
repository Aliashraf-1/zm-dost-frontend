"use client";

import { useBuildings } from "@/context/BuildingContext";
import { Building2, Clock } from "lucide-react";

export default function ReportFilters({ 
  period, 
  setPeriod, 
  startDate, 
  setStartDate, 
  endDate, 
  setEndDate,
  buildingId = "",
  setBuildingId,
  shift = "",
  setShift,
  buildings: customBuildings,
  onApply,
}) {
  const { buildings: contextBuildings = [] } = useBuildings() || {};
  const buildingList = customBuildings || contextBuildings || [];

  const periods = [
    { label: "This Week", value: "weekly" },
    { label: "This Month", value: "monthly" },
    { label: "This Year", value: "annual" },
    { label: "Custom", value: "custom" },
  ];

  const handlePeriodChange = (value) => {
    setPeriod(value);
    const now = new Date();
    let start = new Date();

    switch (value) {
      case "weekly":
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case "monthly":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "annual":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case "custom":
        // Keep current dates
        break;
      default:
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    if (value !== "custom") {
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Period Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs sm:text-sm font-medium text-card-foreground">Period:</span>
          <div className="flex flex-wrap gap-2">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePeriodChange(p.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  period === p.value
                    ? "bg-indigo-600 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted-foreground/40 hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Building & Shift Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {setBuildingId && (
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-card-foreground flex items-center gap-1.5">
                <Building2 size={15} className="text-muted-foreground" />
                Building:
              </span>
              <select
                value={buildingId || ""}
                onChange={(e) => setBuildingId(e.target.value)}
                className="rounded-lg border border-border bg-input px-3 py-1.5 text-xs sm:text-sm text-card-foreground outline-none transition focus:border-indigo-500"
              >
                <option value="">All Buildings</option>
                {buildingList.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.name || `Building ${b.buildingNo || b.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {setShift && (
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-card-foreground flex items-center gap-1.5">
                <Clock size={15} className="text-muted-foreground" />
                Shift:
              </span>
              <select
                value={shift || ""}
                onChange={(e) => setShift(e.target.value)}
                className="rounded-lg border border-border bg-input px-3 py-1.5 text-xs sm:text-sm text-card-foreground outline-none transition focus:border-indigo-500"
              >
                <option value="">All Shifts</option>
                <option value="Day">Day</option>
                <option value="Night">Night</option>
                <option value="24/7">24/7</option>
              </select>
            </div>
          )}

          {onApply && (
            <button
              onClick={onApply}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs sm:text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Apply
            </button>
          )}
        </div>
      </div>

      {/* Custom Dates Row */}
      {period === "custom" && (
        <div className="flex flex-wrap items-center gap-3 border-t border-border/50 pt-3">
          <div>
            <label className="text-xs text-muted-foreground">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ml-2 rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-card-foreground outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ml-2 rounded-lg border border-border bg-input px-3 py-1.5 text-sm text-card-foreground outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}