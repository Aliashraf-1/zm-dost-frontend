"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building2,
  Tag,
  Calendar,
  Trash2,
  Pencil,
  Clock,
  UserPlus,
} from "lucide-react";
import { useLeads } from "@/context/LeadContext";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/EmployeeContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import LeadForm from "@/components/leads/LeadForm";
import {
  canDeleteLeads,
  canEditLead,
  getLinkedEmployee,
} from "@/lib/leadPermissions";

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { leads, deleteLead, updateLead, loading } = useLeads();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const [lead, setLead] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      const found = leads.find(l => l._id === params.id || l.id === params.id);
      if (found) {
        setLead(found);
      }
    }
  }, [params.id, leads]);

  const linkedEmployee = getLinkedEmployee(user, employees);
  const allowEdit = canEditLead(lead, user, linkedEmployee);
  const allowDelete = canDeleteLeads(user);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading lead details...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/dashboard/leads" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <h2 className="text-xl font-semibold">Lead Not Found</h2>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteLead(lead._id || lead.id);
      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditSave = async (leadData) => {
    const leadId = lead._id || lead.id;
    await updateLead(leadId, leadData);
    setShowEditModal(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      New: "bg-blue-500/10 text-blue-400",
      Contacted: "bg-amber-500/10 text-amber-400",
      Qualified: "bg-indigo-500/10 text-indigo-400",
      Converted: "bg-emerald-500/10 text-emerald-400",
      Lost: "bg-red-500/10 text-red-400",
    };
    return colors[status] || colors.New;
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex gap-2">
            {allowEdit && (
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Pencil size={16} />
                Edit Lead
              </button>
            )}
            {allowDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Lead Details Card */}
        <div className="rounded-2xl border border-border bg-card">
          {/* Header */}
          <div className="border-b border-border p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                <User size={28} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold">{lead.customerName}</h1>
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Lead Details</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Phone */}
              <div className="rounded-xl border border-border bg-muted p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone size={14} />
                  Phone
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{lead.customerPhone}</p>
              </div>

              {/* Email */}
              <div className="rounded-xl border border-border bg-muted p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail size={14} />
                  Email
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{lead.customerEmail || "Not Provided"}</p>
              </div>

              {/* Type */}
              <div className="rounded-xl border border-border bg-muted p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 size={14} />
                  Type
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{lead.type}</p>
              </div>

              {/* Source */}
              <div className="rounded-xl border border-border bg-muted p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Tag size={14} />
                  Source
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{lead.source}</p>
              </div>

              {/* Assigned To */}
              <div className="rounded-xl border border-border bg-muted p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserPlus size={14} />
                  Assigned To
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {lead.assignedToName || (typeof lead.assignedTo === 'object' ? lead.assignedTo?.name : "Unassigned")}
                </p>
              </div>

              {/* Created By */}
              <div className="rounded-xl border border-border bg-muted p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User size={14} />
                  Added By
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {lead.createdByName || "—"}
                </p>
              </div>

              {/* Follow-up Date */}
              <div className="rounded-xl border border-border bg-muted p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={14} />
                  Follow-up Date
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {lead.followUpDate ? new Date(lead.followUpDate).toLocaleString() : "Not Set"}
                </p>
              </div>

              {/* Created At */}
              <div className="rounded-xl border border-border bg-muted p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={14} />
                  Created At
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "—"}
                </p>
              </div>
            </div>

            {/* Remarks */}
            {lead.remarks && (
              <div className="mt-4 rounded-xl border border-border bg-muted p-4">
                <p className="text-xs text-muted-foreground mb-2">Remarks</p>
                <p className="text-sm text-card-foreground">{lead.remarks}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Lead"
          message="Are you sure you want to delete this lead? This action cannot be undone."
          itemName={lead.customerName}
          loading={deleteLoading}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <LeadForm
          employee={linkedEmployee || user}
          initialData={lead}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}
    </ProtectedRoute>
  );
}