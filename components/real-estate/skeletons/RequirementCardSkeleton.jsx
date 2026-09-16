"use client";

export default function RequirementCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header strip skeleton */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 animate-pulse rounded-lg bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Content skeleton */}
      <div className="p-4">
        {/* Name & Phone */}
        <div className="space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        </div>

        {/* Location */}
        <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-muted" />

        {/* Looking For */}
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <div className="h-2 w-20 animate-pulse rounded bg-muted" />
          <div className="flex gap-1">
            <div className="h-5 w-20 animate-pulse rounded-md bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
          </div>
        </div>

        {/* Area & Budget */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
          <div className="space-y-1.5">
            <div className="h-2 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2 w-12 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Date */}
        <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-muted" />

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