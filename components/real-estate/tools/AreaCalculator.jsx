"use client";

import { useState, useMemo } from "react";
import { Ruler, RotateCcw, TrendingUp, LayoutGrid } from "lucide-react";

// ✅ Input length units → sq ft conversion
const LENGTH_UNITS = {
  feet: { label: "Feet", toSqFtMultiplier: 1 },
  inch: { label: "Inch", toSqFtMultiplier: 1 / 12 },
  yard: { label: "Yard (Gaz)", toSqFtMultiplier: 3 },
  meter: { label: "Meter", toSqFtMultiplier: 3.28084 },
  cm: { label: "Centimeter", toSqFtMultiplier: 0.0328084 },
};

// ✅ Output area units → from sq ft
const AREA_UNITS = {
  sqft: { label: "Sq. Feet", fromSqFtDivisor: 1 },
  marla: { label: "Marla", fromSqFtDivisor: 225 },
  kanal: { label: "Kanal", fromSqFtDivisor: 4500 },
  acre: { label: "Acre", fromSqFtDivisor: 43560 },
  sqyd: { label: "Sq. Yard (Gaz)", fromSqFtDivisor: 9 },
  sqm: { label: "Sq. Meter", fromSqFtDivisor: 10.7639 },
};

export default function AreaCalculator() {
  const [length, setLength] = useState("");
  const [lengthUnit, setLengthUnit] = useState("feet");
  const [width, setWidth] = useState("");
  const [widthUnit, setWidthUnit] = useState("feet");
  const [outputUnit, setOutputUnit] = useState("marla");

  const result = useMemo(() => {
    const len = Number(length) || 0;
    const wid = Number(width) || 0;

    if (len <= 0 || wid <= 0) return null;

    const lenInFt = len * LENGTH_UNITS[lengthUnit].toSqFtMultiplier;
    const widInFt = wid * LENGTH_UNITS[widthUnit].toSqFtMultiplier;
    const areaSqFt = lenInFt * widInFt;
    const converted = areaSqFt / AREA_UNITS[outputUnit].fromSqFtDivisor;

    const allUnits = Object.entries(AREA_UNITS).map(([key, unit]) => ({
      key,
      label: unit.label,
      value: areaSqFt / unit.fromSqFtDivisor,
    }));

    return {
      areaSqFt,
      converted,
      outputUnitLabel: AREA_UNITS[outputUnit].label,
      allUnits,
    };
  }, [length, lengthUnit, width, widthUnit, outputUnit]);

  const handleReset = () => {
    setLength("");
    setWidth("");
    setLengthUnit("feet");
    setWidthUnit("feet");
    setOutputUnit("marla");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <Ruler size={22} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Area Calculator</h2>
          <p className="text-xs text-muted-foreground">
            Calculate area from length × width
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        {/* Length */}
        <div>
          <label className="mb-2 block text-sm font-medium">Length</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="e.g. 25"
              min="0"
              step="any"
              className="flex-1 rounded-xl border border-border bg-input px-4 py-3 text-base font-medium outline-none focus:border-indigo-500"
            />
            <select
              value={lengthUnit}
              onChange={(e) => setLengthUnit(e.target.value)}
              className="rounded-xl border border-border bg-input px-3 py-3 text-sm outline-none focus:border-indigo-500"
            >
              {Object.entries(LENGTH_UNITS).map(([key, unit]) => (
                <option key={key} value={key}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Width */}
        <div>
          <label className="mb-2 block text-sm font-medium">Width</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 45"
              min="0"
              step="any"
              className="flex-1 rounded-xl border border-border bg-input px-4 py-3 text-base font-medium outline-none focus:border-indigo-500"
            />
            <select
              value={widthUnit}
              onChange={(e) => setWidthUnit(e.target.value)}
              className="rounded-xl border border-border bg-input px-3 py-3 text-sm outline-none focus:border-indigo-500"
            >
              {Object.entries(LENGTH_UNITS).map(([key, unit]) => (
                <option key={key} value={key}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Output Unit */}
        <div>
          <label className="mb-2 block text-sm font-medium">Calculate In</label>
          <select
            value={outputUnit}
            onChange={(e) => setOutputUnit(e.target.value)}
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
          >
            {Object.entries(AREA_UNITS).map(([key, unit]) => (
              <option key={key} value={key}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result */}
      {result ? (
        <div className="mt-6 space-y-4">
          {/* Primary Result */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6">
            <div className="absolute -right-4 -top-4 rounded-full bg-emerald-500/20 p-4">
              <TrendingUp size={40} className="text-emerald-400/40" />
            </div>
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Total Area
              </p>
              <p className="mt-3 text-5xl font-bold tabular-nums text-emerald-400 sm:text-6xl">
                {result.converted.toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })}
              </p>
              <p className="mt-2 text-base font-semibold text-emerald-400">
                {result.outputUnitLabel}
              </p>
              <div className="mt-4 border-t border-emerald-500/20 pt-3">
                <p className="text-xs text-muted-foreground">
                  Equivalent to{" "}
                  <span className="font-semibold text-foreground">
                    {result.areaSqFt.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    Sq. Feet
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* All Units Breakdown */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <div className="mb-3 flex items-center gap-2">
              <LayoutGrid size={15} className="text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                All Units Breakdown
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {result.allUnits.map((u) => (
                <div
                  key={u.key}
                  className={`rounded-xl border p-3 transition ${
                    u.key === outputUnit
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border bg-card"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {u.label}
                  </p>
                  <p
                    className={`mt-1 text-lg font-bold tabular-nums ${
                      u.key === outputUnit ? "text-emerald-400" : "text-foreground"
                    }`}
                  >
                    {u.value.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Empty State
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <Ruler size={32} className="mx-auto text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Enter length and width to calculate area
          </p>
        </div>
      )}

      {/* Reset */}
      {(length || width) && (
        <button
          onClick={handleReset}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <RotateCcw size={15} />
          Reset Calculator
        </button>
      )}
    </div>
  );
}