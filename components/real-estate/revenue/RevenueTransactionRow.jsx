"use client";

import {
  TrendingUp,
  Home,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";

const TYPE_BADGES = {
  sale_commission: { label: "Sale Commission", class: "bg-indigo-700/90 text-white" },
  rent_commission: { label: "Rent Commission", class: "bg-emerald-700/90 text-white" },
};

export default function RevenueTransactionRow({ transaction }) {
  const typeBadge = TYPE_BADGES[transaction.type] || TYPE_BADGES.sale_commission;

  const formattedDate = transaction.date
    ? new Date(transaction.date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const formatPrice = (amount) => {
    if (!amount) return "Rs. 0";
    return `Rs. ${Number(amount).toLocaleString()}`;
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-indigo-500/30 sm:flex-row sm:items-center sm:justify-between">
      {/* Left - Icon + Info */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <TrendingUp size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {transaction.propertyTitle || "Property"}
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${typeBadge.class}`}
            >
              {typeBadge.label}
            </span>
          </div>

          {/* Meta info */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {transaction.propertyType && (
              <span className="inline-flex items-center gap-1">
                <Home size={11} />
                {transaction.propertyType.replace(/_/g, " ")}
              </span>
            )}
            {transaction.createdByName && (
              <span className="inline-flex items-center gap-1">
                <User size={11} />
                {transaction.createdByName}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} />
              {formattedDate}
            </span>
          </div>

          {/* Remarks */}
          {transaction.remarks && (
            <p className="mt-1 line-clamp-1 text-xs italic text-muted-foreground/80">
              "{transaction.remarks}"
            </p>
          )}
        </div>
      </div>

      {/* Right - Amount */}
      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
        <div className="flex items-center gap-1 text-emerald-400">
          <DollarSign size={14} />
          <span className="text-lg font-bold">{formatPrice(transaction.amount)}</span>
        </div>
      </div>
    </div>
  );
}