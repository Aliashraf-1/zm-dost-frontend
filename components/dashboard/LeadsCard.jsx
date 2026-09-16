"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLeads } from "@/context/LeadContext";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/EmployeeContext";
import { canAddLeads, getLinkedEmployee } from "@/lib/leadPermissions";
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Building2,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function LeadsCard() {
  const router = useRouter();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { leads = [], getLeadStats } = useLeads();
  const stats = getLeadStats() || { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 };
  const allowAdd = canAddLeads(user, getLinkedEmployee(user, employees));

  const getStatusColor = (status) => {
    const colors = {
      New: "bg-blue-500/10 text-blue-400",
      Contacted: "bg-amber-500/10 text-amber-400",
      Qualified: "bg-green-500/10 text-green-400",
      Converted: "bg-emerald-500/10 text-emerald-400",
      Lost: "bg-red-500/10 text-red-400",
    };
    return colors[status] || colors.New;
  };

  const getStatusIcon = (status) => {
    const icons = {
      New: <Clock size={12} />,
      Contacted: <Phone size={12} />,
      Qualified: <CheckCircle2 size={12} />,
      Converted: <CheckCircle2 size={12} />,
      Lost: <XCircle size={12} />,
    };
    return icons[status] || icons.New;
  };

  // ✅ Recently updated first (lastUpdatedAt → lastStatusUpdate → updatedAt → createdAt)
  const recentLeads = [...leads]
    .sort((a, b) => {
      const dateA = new Date(
        a.lastUpdatedAt || a.lastStatusUpdate || a.updatedAt || a.createdAt || 0
      );
      const dateB = new Date(
        b.lastUpdatedAt || b.lastStatusUpdate || b.updatedAt || b.createdAt || 0
      );
      return dateB - dateA;
    })
    .slice(0, 3);

  const displayStats = {
    active: (stats.contacted || 0) + (stats.qualified || 0),
    pending: stats.new || 0,
    closed: (stats.converted || 0) + (stats.lost || 0),
  };

  return (
    <div className="flex h-full w-full flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recent Leads</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">New inquiries and prospects</p>
        </div>
        <Link
          href="/dashboard/leads"
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          View All
          <ArrowUpRight size={13} />
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border bg-muted p-2 text-center">
          <p className="text-base font-bold text-emerald-400">{displayStats.active}</p>
          <p className="text-[10px] text-muted-foreground">Active</p>
        </div>
        <div className="rounded-lg border border-border bg-muted p-2 text-center">
          <p className="text-base font-bold text-amber-400">{displayStats.pending}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </div>
        <div className="rounded-lg border border-border bg-muted p-2 text-center">
          <p className="text-base font-bold text-blue-400">{displayStats.closed}</p>
          <p className="text-[10px] text-muted-foreground">Closed</p>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {recentLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users size={28} className="text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No leads yet</p>
            <p className="text-xs text-muted-foreground">Add your first lead</p>
          </div>
        ) : (
          recentLeads.map((lead) => {
            const leadId = lead._id || lead.id;
            const name = lead.customerName || "Unknown";
            const phone = lead.customerPhone || "N/A";
            const email = lead.customerEmail || "N/A";
            const type = lead.type || "General";
            const status = lead.status || "New";
            // ✅ Show latest activity time
            const time = (lead.lastUpdatedAt || lead.lastStatusUpdate || lead.updatedAt || lead.createdAt)
              ? new Date(lead.lastUpdatedAt || lead.lastStatusUpdate || lead.updatedAt || lead.createdAt).toLocaleDateString()
              : "Today";

            return (
              <Link
                key={leadId}
                href={`/dashboard/leads/${leadId}`}
                className="block rounded-lg border border-border bg-muted/50 p-2.5 transition hover:border-border hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-medium text-indigo-400">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Phone size={10} />
                            {phone}
                          </span>
                          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline-block" />
                          <span className="hidden items-center gap-0.5 sm:flex">
                            <Mail size={10} />
                            {email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-0.5 text-muted-foreground">
                        <Building2 size={11} />
                        {type}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      <span className="text-muted-foreground">{time}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                      {type}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium ${getStatusColor(
                        status
                      )}`}
                    >
                      {getStatusIcon(status)}
                      {status}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {allowAdd ? (
        <button
          onClick={() => router.push("/dashboard/leads?new=1")}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground transition hover:border-indigo-500 hover:bg-indigo-500/5 hover:text-indigo-400"
        >
          <UserPlus size={14} />
          Add New Lead
        </button>
      ) : (
        <Link
          href="/dashboard/leads"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground transition hover:border-indigo-500 hover:bg-indigo-500/5 hover:text-indigo-400"
        >
          View Leads
        </Link>
      )}
    </div>
  );
}