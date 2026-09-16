"use client";

export default function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Image skeleton */}
      <div className="h-48 w-full animate-pulse bg-muted" />

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start gap-2">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Owner info */}
        <div className="mt-4 space-y-2 border-t border-border pt-3">
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>

        {/* Price */}
        <div className="mt-4 space-y-2 border-t border-border pt-3">
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
        </div>

        {/* Date */}
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />

        {/* Actions */}
        <div className="mt-4 flex gap-1.5 border-t border-border pt-3">
          <div className="h-8 flex-1 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 flex-1 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}