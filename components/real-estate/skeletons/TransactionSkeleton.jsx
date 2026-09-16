"use client";

export default function TransactionSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left - Icon + Info */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-muted" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex gap-2">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Right - Amount */}
      <div className="h-6 w-24 animate-pulse rounded bg-muted" />
    </div>
  );
}