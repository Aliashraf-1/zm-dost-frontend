"use client";

import { useMemo } from "react";
import CustomerSummary from "@/components/customers/CustomerSummary";
import CustomerTable from "@/components/customers/CustomerTable";
import { useBuildings } from "@/context/BuildingContext";
import { getCustomersFromBuildings } from "@/lib/customerUtils";

export default function CustomersPage() {
  const { buildings, loading, error } = useBuildings();

  const customers = useMemo(
    () => getCustomersFromBuildings(buildings || []),
    [buildings]
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-400">
            Management
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Customers
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            View tenants, rental units, rent status and security information.
            Customers are added from Buildings / units only.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading customers...
        </div>
      ) : (
        <>
          <CustomerSummary customers={customers} />
          <div className="mt-6">
            <CustomerTable customers={customers} />
          </div>
        </>
      )}
    </div>
  );
}
