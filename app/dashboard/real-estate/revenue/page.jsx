"use client";

import { useState, useMemo } from "react";
import { useRealEstateRevenue } from "@/context/RealEstateRevenueContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import RevenueTransactionRow from "@/components/real-estate/revenue/RevenueTransactionRow";

import TransactionSkeleton from "@/components/real-estate/skeletons/TransactionSkeleton";

import {
  TrendingUp,
  Wallet,
  FileText,
  Search,
  X,
  DollarSign,
} from "lucide-react";

export default function RealEstateRevenuePage() {
  const { loading, getTransactions } = useRealEstateRevenue();
  const transactions = getTransactions();

  // ✅ Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | sale_commission | rent_commission
  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ Filtered transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    filtered = filtered.filter((transaction) => {
      const date = transaction.date ? new Date(transaction.date) : null;
      if (!date || Number.isNaN(date.getTime())) return !selectedMonth && !startDate && !endDate;
      const dateKey = date.toISOString().slice(0, 10);
      if (selectedMonth && dateKey.slice(0, 7) !== selectedMonth) return false;
      if (startDate && dateKey < startDate) return false;
      if (endDate && dateKey > endDate) return false;
      return true;
    });

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.propertyTitle?.toLowerCase().includes(term) ||
          t.propertyType?.toLowerCase().includes(term) ||
          t.remarks?.toLowerCase().includes(term) ||
          t.createdByName?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [transactions, typeFilter, search, selectedMonth, startDate, endDate]);

  const filteredStats = useMemo(() => ({
    totalRevenue: filteredTransactions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    saleCommissionTotal: filteredTransactions.filter((item) => item.type === "sale_commission").reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    rentCommissionTotal: filteredTransactions.filter((item) => item.type === "rent_commission").reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    transactionCount: filteredTransactions.length,
  }), [filteredTransactions]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setSelectedMonth("");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = search.trim() !== "" || typeFilter !== "all" || selectedMonth !== "" || startDate !== "" || endDate !== "";

  return (
    <ProtectedRoute requiredRoles={["super_admin", "admin"]}>
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-400">Real Estate</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Revenue
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Commission-based revenue from property sales and rentals.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total Revenue */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h2 className="mt-2 text-2xl font-bold text-emerald-400">
                  Rs. {filteredStats.totalRevenue.toLocaleString()}
                </h2>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <TrendingUp size={22} />
              </div>
            </div>
          </div>

          {/* Sale Commission */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sale Commission</p>
                <h2 className="mt-2 text-2xl font-bold text-indigo-400">
                  Rs. {filteredStats.saleCommissionTotal.toLocaleString()}
                </h2>
              </div>
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                <DollarSign size={22} />
              </div>
            </div>
          </div>

          {/* Rent Commission */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rent Commission</p>
                <h2 className="mt-2 text-2xl font-bold text-amber-400">
                  Rs. {filteredStats.rentCommissionTotal.toLocaleString()}
                </h2>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                <Wallet size={22} />
              </div>
            </div>
          </div>

          {/* Transactions Count */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <h2 className="mt-2 text-2xl font-bold">{filteredStats.transactionCount}</h2>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <FileText size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {transactions.length > 0 && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by property, type, or staff..."
                  className="w-full rounded-xl border border-border bg-input py-2.5 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
                />
              </div>

              {/* Type Filter */}
              <div className="flex gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "sale_commission", label: "Sale" },
                  { value: "rent_commission", label: "Rent" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTypeFilter(opt.value)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                      typeFilter === opt.value
                        ? "bg-indigo-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} aria-label="Filter by month" className="rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none focus:border-indigo-500" />
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} aria-label="Filter from date" className="rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none focus:border-indigo-500" />
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} aria-label="Filter to date" className="rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none focus:border-indigo-500" />

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>

            <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredTransactions.length}</span>{" "}
              of <span className="font-medium text-foreground">{transactions.length}</span> transactions
            </div>
          </div>
        )}

        {/* Transactions List */}
                {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <TransactionSkeleton key={i} />
            ))}
          </div>
        )  : transactions.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Wallet size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No Revenue Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Commission transactions will appear here when you close properties "via us".
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Search size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No Results Found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your filters or search.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X size={16} />
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <RevenueTransactionRow key={tx.id || tx._id} transaction={tx} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
