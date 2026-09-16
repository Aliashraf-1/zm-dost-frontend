"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useBuildings } from "@/context/BuildingContext";
import BuildingCard from "@/components/buildings/BuildingCard";
import BuildingFilters from "@/components/buildings/BuildingFilters";

export default function BuildingsPage() {
  const { buildings, loading, error, loadBuildings } = useBuildings();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  // ✅ Reload buildings if needed
  useEffect(() => {
    loadBuildings();
  }, []);

  const filteredBuildings = useMemo(() => {
    return buildings.filter((building) => {
      const matchesSearch =
        building.buildingNo?.toLowerCase().includes(search.toLowerCase()) ||
        building.reference?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "All" || building.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [buildings, search, status]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-indigo-400 animate-pulse bg-indigo-400/20 w-32 h-4 rounded" />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl animate-pulse bg-muted-foreground/40/30 w-48 h-8 rounded" />
          </div>
          <div className="animate-pulse bg-indigo-600/30 w-32 h-12 rounded-xl" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-muted p-5 h-56" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1600px] text-center py-20">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <p className="text-red-400">Failed to load buildings: {error}</p>
          <button 
            onClick={() => loadBuildings()} 
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-indigo-400">
            Property Management
          </p>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Buildings
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage your buildings, rooms and rental properties.
          </p>
        </div>

        <Link
          href="/dashboard/buildings/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
        >
          <Plus size={18} />
          Add Building
        </Link>
      </div>

      <BuildingFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />

      {filteredBuildings.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredBuildings.map((building) => (
            <BuildingCard
              key={building._id || building.id}
              building={building}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
          <h3 className="font-semibold">
            No buildings found
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your search or filter.
          </p>
        </div>
      )}
    </div>
  );
}