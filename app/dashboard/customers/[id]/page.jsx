"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CustomerDetails from "@/components/customers/CustomerDetails";
import { useBuildings } from "@/context/BuildingContext";
import { getCustomersFromBuildings } from "@/lib/customerUtils";

export default function CustomerDetailsPage() {
  const params = useParams();
  const { buildings, loading } = useBuildings();

  const customers = useMemo(
    () => getCustomersFromBuildings(buildings || []),
    [buildings]
  );

  const customer = customers.find(
    (item) => String(item.id) === String(params.id)
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-[1600px] py-16 text-center text-sm text-muted-foreground">
        Loading customer...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/dashboard/customers"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Customers
        </Link>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <h2 className="text-xl font-semibold">Customer Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This tenant may no longer be renting a unit.
          </p>
        </div>
      </div>
    );
  }

  return <CustomerDetails customer={customer} />;
}
