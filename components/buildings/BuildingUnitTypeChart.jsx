"use client";

import { useMemo } from "react";
import { PieChart } from "lucide-react";

export default function BuildingUnitTypeChart({ rooms = [] }) {
  const unitTypes = useMemo(() => {
    const counts = {
      Room: 0,
      Office: 0,
      Shop: 0,
      Hall: 0,
      Desk: 0,
      Other: 0,
    };

    rooms.forEach((unit) => {
      const type = String(unit.type || "").toLowerCase();

      if (type === "room") {
        counts.Room++;
      } else if (type === "office") {
        counts.Office++;
      } else if (type === "shop") {
        counts.Shop++;
      } else if (type === "hall") {
        counts.Hall++;
      } else if (type === "desk") {
        counts.Desk++;
      } else {
        counts.Other++;
      }
    });

    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
      }));
  }, [rooms]);

  const totalUnits = rooms.length;

  return (
    <div className="rounded-2xl border border-border mt-4 bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Unit Types</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Distribution of units in this building.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <PieChart size={20} />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
        {/* Donut */}
        <div className="relative h-52 w-52">
          <svg
            viewBox="0 0 200 200"
            className="h-full w-full -rotate-90"
          >
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="currentColor"
              strokeWidth="28"
              className="text-muted"
            />

            {(() => {
              const circumference = 2 * Math.PI * 72;
              let offset = 0;

              const segments = [
                "indigo",
                "emerald",
                "amber",
                "rose",
                "sky",
                "purple",
              ];

              return unitTypes.map((item, index) => {
                const percentage =
                  totalUnits > 0
                    ? item.value / totalUnits
                    : 0;

                const dash = percentage * circumference;
                const currentOffset = offset;
                offset += dash;

                return (
                  <circle
                    key={item.name}
                    cx="100"
                    cy="100"
                    r="72"
                    fill="none"
                    strokeWidth="28"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-currentOffset}
                    strokeLinecap="butt"
                    className={
                      segments[index] === "indigo"
                        ? "text-indigo-500"
                        : segments[index] === "emerald"
                        ? "text-emerald-500"
                        : segments[index] === "amber"
                        ? "text-amber-500"
                        : segments[index] === "rose"
                        ? "text-rose-500"
                        : segments[index] === "sky"
                        ? "text-sky-500"
                        : "text-purple-500"
                    }
                    stroke="currentColor"
                  />
                );
              });
            })()}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{totalUnits}</span>
            <span className="mt-1 text-xs text-muted-foreground">Total Units</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full max-w-[220px] space-y-3">
          {unitTypes.map((item, index) => {
            const percentage =
              totalUnits > 0 ? Math.round((item.value / totalUnits) * 100) : 0;

            const dotColors = [
              "bg-indigo-500",
              "bg-emerald-500",
              "bg-amber-500",
              "bg-rose-500",
              "bg-sky-500",
              "bg-purple-500",
            ];

            return (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${dotColors[index]}`} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{item.value}</span>
                  <span className="text-xs text-muted-foreground">{percentage}%</span>
                </div>
              </div>
            );
          })}

          {unitTypes.length === 0 && (
            <p className="text-sm text-muted-foreground">No units have been added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}