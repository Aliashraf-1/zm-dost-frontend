import Link from "next/link";
import { DoorOpen } from "lucide-react";

// Server component - no 'use client' directive
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <DoorOpen size={64} className="mb-4 text-muted-foreground" />
      <h2 className="text-2xl font-bold text-foreground">Unit Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        The unit you're looking for doesn't exist or has been removed.
      </p>
      <Link
        href="/dashboard/buildings"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Back to Buildings
      </Link>
    </div>
  );
}