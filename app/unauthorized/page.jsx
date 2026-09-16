import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <ShieldAlert size={64} className="mb-4 text-red-400" />
      <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        You don't have permission to access this page. Please contact your administrator.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}