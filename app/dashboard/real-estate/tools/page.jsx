"use client";

import ProtectedRoute from "@/components/common/ProtectedRoute";
import AreaCalculator from "@/components/real-estate/tools/AreaCalculator";
import BasicCalculator from "@/components/real-estate/tools/BasicCalculator";
import { Wrench } from "lucide-react";

export default function RealEstateToolsPage() {
  return (
    <ProtectedRoute requiredRoles={["super_admin", "admin"]}>
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-400">Real Estate</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Tools
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Area calculator and basic calculator for property measurements and quick math.
          </p>
        </div>

        {/* Calculators Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AreaCalculator />
          <BasicCalculator />
        </div>

        {/* Footer Note */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-center text-xs text-muted-foreground">
          Area conversions based on Punjab standard (1 Marla = 225 sq ft, 1 Kanal = 20 Marla, 1 Acre = 43,560 sq ft)
        </div>
      </div>
    </ProtectedRoute>
  );
}