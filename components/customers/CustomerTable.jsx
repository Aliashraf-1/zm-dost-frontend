"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  User,
  Building2,
  DoorOpen,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { getImageUrl } from "@/lib/imageHelper";

function RentStatus({ customer }) {
  if (customer.status === "Paid") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400">
        <CheckCircle2 size={14} />
        Paid
      </span>
    );
  }

  if (customer.status === "Overdue") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400">
        <AlertCircle size={14} />
        {customer.pendingMonths}{" "}
        {customer.pendingMonths === 1
          ? "Month"
          : "Months"}{" "}
        Due
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-400">
      <Clock3 size={14} />
      Pending
    </span>
  );
}

export default function CustomerTable({
  customers = [],
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState("All");

  const filteredCustomers = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return customers.filter((customer) => {
      const matchesSearch =
        String(customer.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(customer.cnic || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(customer.phone || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(customer.buildingNo || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(customer.unitNo || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        status === "All" ||
        customer.status === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [customers, search, status]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Customers
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Tenants currently occupying rental units.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search customer, CNIC, unit..."
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500 sm:w-72"
              />
            </div>

            {/* Status */}
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-card-foreground outline-none focus:border-indigo-500"
            >
              <option value="All">
                All Customers
              </option>

              <option value="Paid">
                Rent Paid
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Overdue">
                Overdue
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Customer
              </th>

              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Rental Unit
              </th>

              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Purpose
              </th>

              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Monthly Rent
              </th>

              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Security
              </th>

              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Rent Status
              </th>

              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.map(
              (customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-border/70 transition hover:bg-muted"
                >
                  {/* Customer */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-500/10 text-indigo-400">
                        {customer.image ? (
                          <img
                            src={getImageUrl(customer.image)}
                            alt={customer.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={18} />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {customer.phone}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {customer.cnic}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Rental Unit */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2
                          size={15}
                          className="text-indigo-400"
                        />

                        <span className="text-sm font-medium">
                          {customer.buildingNo}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <DoorOpen size={14} />

                        {customer.unitType}{" "}
                        {customer.unitNo}
                      </div>
                    </div>
                  </td>

                  {/* Purpose */}
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
                      {customer.purpose}
                    </span>
                  </td>

                  {/* Monthly Rent */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">
                      Rs.{" "}
                      {Number(customer.monthlyRent || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Security */}
                  <td className="px-6 py-4">
                    {customer.security > 0 ? (
                      <div>
                        <p className="text-sm font-medium text-emerald-400">
                          Rs.{" "}
                          {customer.security.toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Held
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        —
                      </span>
                    )}
                  </td>

                  {/* Rent Status */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className="inline-flex transition hover:scale-[1.02]"
                    >
                      <RentStatus
                        customer={customer}
                      />
                    </Link>

                    {customer.outstanding >
                      0 && (
                      <p className="mt-2 text-xs text-red-400">
                        Rs.{" "}
                        {customer.outstanding.toLocaleString()}{" "}
                        outstanding
                      </p>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className="inline-flex rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      title="View customer"
                    >
                      <ArrowUpRight
                        size={17}
                      />
                    </Link>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {filteredCustomers.length ===
          0 && (
          <div className="py-16 text-center">
            <p className="text-sm font-medium">
              No customers found
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Try changing your search or
              filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}