"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLeads } from "@/context/LeadContext";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/EmployeeContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import LeadTable from "@/components/leads/LeadTable";
import LeadStats from "@/components/leads/LeadStats";
import LeadForm from "@/components/leads/LeadForm";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import {
  canAddLeads,
  canDeleteLeads,
  canEditLead,
  getLinkedEmployee,
} from "@/lib/leadPermissions";
import { Plus } from "lucide-react";

export default function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead, getLeadStats, loading } = useLeads();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const linkedEmployee = getLinkedEmployee(user, employees);
  const allowAdd = canAddLeads(user, linkedEmployee);
  const allowDelete = canDeleteLeads(user);
  const stats = getLeadStats();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1" && allowAdd) {
      setShowAddModal(true);
      router.replace("/dashboard/leads");
    }
  }, [allowAdd, router]);

  const handleAddLead = async (leadData) => {
    await addLead(leadData);
    setShowAddModal(false);
  };

  const handleEditLead = async (leadData) => {
    const leadId = editingLead?._id || editingLead?.id || leadData._id || leadData.id;
    await updateLead(leadId, leadData);
    setEditingLead(null);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteLead(leadToDelete);
      setLeadToDelete(null);
    } catch (error) {
      console.error("Delete lead failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRoles={["admin", "lead_manager", "moderator", "super_admin", "employee"]}>
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-400">Sales Pipeline</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Leads
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Manage customer leads, track status, and convert to rentals.
            </p>
          </div>
          {allowAdd && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
            >
              <Plus size={18} />
              Add Lead
            </button>
          )}
        </div>

        <LeadStats stats={stats} />

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              Loading leads...
            </div>
          ) : (
            <LeadTable
              leads={leads}
              onEdit={allowAdd ? (lead) => setEditingLead(lead) : null}
              onDelete={allowDelete ? (leadId) => setLeadToDelete(leadId) : null}
              canEditLead={(lead) => canEditLead(lead, user, linkedEmployee)}
              userRole={user?.role || "employee"}
              employeeId={linkedEmployee?._id || user?.employeeId || null}
            />
          )}
        </div>

        {showAddModal && (
          <LeadForm
            employee={linkedEmployee || user}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddLead}
          />
        )}

        {editingLead && (
          <LeadForm
            employee={linkedEmployee || user}
            initialData={editingLead}
            onClose={() => setEditingLead(null)}
            onSave={handleEditLead}
          />
        )}

        {leadToDelete && (
          <DeleteConfirmModal
            isOpen={!!leadToDelete}
            onClose={() => setLeadToDelete(null)}
            onConfirm={confirmDelete}
            title="Delete Lead"
            message="Are you sure you want to delete this lead? This action cannot be undone."
            itemName="Lead"
            loading={deleteLoading}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
