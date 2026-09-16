"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export default function BuildingFilters({
  search,
  setSearch,
  status,
  setStatus,
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search buildings..."
          className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-indigo-500"
        />
      </div>

      <div className="relative lg:w-48">
        <SlidersHorizontal
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full appearance-none rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-card-foreground outline-none focus:border-indigo-500"
        >
          <option value="All">All Buildings</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}