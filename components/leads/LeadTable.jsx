"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2, Search } from "lucide-react";
import { LEAD_STATUS } from "@/constants/leadStatus";

export default function LeadTable({
  leads = [],
  onView,
  onEdit,
  onDelete,
  canEditLead,
  userRole = "employee",
  employeeId = null,
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        lead.customerPhone?.includes(search) ||
        lead.customerEmail?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const getStatusBadge = (status) => {
    const statusObj = Object.values(LEAD_STATUS).find((s) => s.value === status);
    return statusObj || LEAD_STATUS.NEW;
  };

  const handleView = (lead) => {
    const leadId = lead._id || lead.id;
    if (onView) {
      onView(lead);
    } else {
      router.push(`/dashboard/leads/${leadId}`);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header - No Add button here */}
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Leads</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {leads.length} total leads
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads..."
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500 sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-card-foreground outline-none focus:border-indigo-500"
            >
              <option value="All">All Status</option>
              {Object.values(LEAD_STATUS).map((status) => (
                <option key={status.value} value={status.value}>{status.value}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Added By</th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Follow-up</th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No leads found
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const leadId = lead._id || lead.id;
                const statusObj = getStatusBadge(lead.status);

                return (
                  <tr key={leadId} className="border-b border-border/70 transition hover:bg-muted">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{lead.customerName}</p>
                        <p className="text-xs text-muted-foreground">{lead.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {lead.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${statusObj.color}`}>
                        {statusObj.value}
                      </span>
                    </td>
                    {/* ✅ Added By column */}
                    <td className="px-6 py-4 text-sm text-card-foreground">
                      {lead.createdByName || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {/* View */}
                        <button
                          onClick={() => handleView(lead)}
                          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          title="View lead"
                        >
                          <Eye size={17} />
                        </button>

                        {onEdit && (!canEditLead || canEditLead(lead)) && (
                          <button
                            onClick={() => onEdit(lead)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            title="Edit lead"
                          >
                            <Pencil size={17} />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            onClick={() => onDelete(leadId)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400"
                            title="Delete lead"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}