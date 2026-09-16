"use client";

import { useState, useMemo } from "react";
import { useRealEstateRequirements } from "@/context/RealEstateRequirementContext";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import RequirementForm from "@/components/real-estate/requirements/RequirementForm";
import RequirementCard from "@/components/real-estate/requirements/RequirementCard";
import RequirementDetailModal from "@/components/real-estate/requirements/RequirementDetailModal";
import CloseRequirementModal from "@/components/real-estate/requirements/CloseRequirementModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

import RequirementCardSkeleton from "@/components/real-estate/skeletons/RequirementCardSkeleton";

import {
  ClipboardList,
  Plus,
  Search,
  X,
} from "lucide-react";

export default function RealEstateRequirementsPage() {
  const {
    requirements,
    loading,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    getRequirementStats,
  } = useRealEstateRequirements();

  const { user } = useAuth();

  // ✅ Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | buyer | tenant
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | fulfilled | cancelled

  // ✅ Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [viewingRequirement, setViewingRequirement] = useState(null);
  const [closingRequirement, setClosingRequirement] = useState(null);
  const [deletingRequirement, setDeletingRequirement] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ✅ Stats
  const stats = getRequirementStats();

  // ✅ Filtered requirements
  const filteredRequirements = useMemo(() => {
    let filtered = [...requirements];

    if (typeFilter !== "all") {
      filtered = filtered.filter((r) => r.requirementType === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.name?.toLowerCase().includes(term) ||
          r.phone?.includes(term) ||
          r.preferredArea?.toLowerCase().includes(term) ||
          r.city?.toLowerCase().includes(term) ||
          r.region?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [requirements, typeFilter, statusFilter, search]);

  // ✅ Handlers
  const handleAddClick = () => {
    setEditingRequirement(null);
    setShowFormModal(true);
  };

  const handleEditClick = (requirement) => {
    setEditingRequirement(requirement);
    setShowFormModal(true);
  };

  const handleFormSave = async (data) => {
    if (editingRequirement) {
      await updateRequirement(editingRequirement._id, data);
    } else {
      await createRequirement(data);
    }
  };

  const handleViewClick = (requirement) => {
    setViewingRequirement(requirement);
  };

  const handleCloseClick = (requirement) => {
    setClosingRequirement(requirement);
  };

  const handleCloseSave = async (requirementId, data) => {
    await updateRequirement(requirementId, data);
  };

  const handleStatusChange = async (requirement, newStatus) => {
    try {
      await updateRequirement(requirement._id, {
        ...requirement,
        status: newStatus,
      });
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleDeleteClick = (requirement) => {
    setDeletingRequirement(requirement);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRequirement) return;
    setDeleteLoading(true);
    try {
      await deleteRequirement(deletingRequirement._id);
      setDeletingRequirement(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    search.trim() !== "" || typeFilter !== "all" || statusFilter !== "all";

  return (
    <ProtectedRoute requiredRoles={["super_admin", "admin"]}>
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-400">Real Estate</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Requirements
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Track buyer and tenant requirements.
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            <Plus size={17} />
            Add Requirement
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Buyers", value: stats.buyers, color: "text-indigo-400" },
            { label: "Tenants", value: stats.tenants, color: "text-emerald-400" },
            { label: "Active", value: stats.active, color: "text-blue-400" },
            { label: "Fulfilled", value: stats.fulfilled, color: "text-purple-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, area, or city..."
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "buyer", label: "Buyers" },
                { value: "tenant", label: "Tenants" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTypeFilter(opt.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    typeFilter === opt.value
                      ? "bg-indigo-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border bg-input px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>

          <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredRequirements.length}</span>{" "}
            of <span className="font-medium text-foreground">{requirements.length}</span> requirements
          </div>
        </div>

        {/* Requirements Grid */}
              {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <RequirementCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredRequirements.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <ClipboardList size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">
              {requirements.length === 0 ? "No Requirements Yet" : "No Requirements Found"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {requirements.length === 0
                ? "Start by adding your first buyer or tenant requirement."
                : "Try adjusting your filters or search."}
            </p>
            {requirements.length === 0 && (
              <button
                onClick={handleAddClick}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                <Plus size={16} />
                Add Your First Requirement
              </button>
            )}
            {requirements.length > 0 && hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X size={16} />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRequirements.map((requirement) => (
              <RequirementCard
                key={requirement._id}
                requirement={requirement}
                onView={handleViewClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChange}
                onClose={handleCloseClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <RequirementForm
          initialData={editingRequirement}
          onClose={() => {
            setShowFormModal(false);
            setEditingRequirement(null);
          }}
          onSave={handleFormSave}
        />
      )}

      {/* Detail Modal */}
      {viewingRequirement && (
        <RequirementDetailModal
          requirement={viewingRequirement}
          onClose={() => setViewingRequirement(null)}
          onEdit={(req) => {
            setViewingRequirement(null);
            handleEditClick(req);
          }}
          onDelete={(req) => {
            setViewingRequirement(null);
            handleDeleteClick(req);
          }}
        />
      )}

      {/* Close Requirement Modal */}
      {closingRequirement && (
        <CloseRequirementModal
          requirement={closingRequirement}
          onClose={() => setClosingRequirement(null)}
          onSave={handleCloseSave}
        />
      )}

      {/* Delete Confirmation */}
      {deletingRequirement && (
        <DeleteConfirmModal
          isOpen={!!deletingRequirement}
          onClose={() => setDeletingRequirement(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Requirement"
          message="Are you sure you want to delete this requirement? This action cannot be undone."
          itemName={`${deletingRequirement.name} (${deletingRequirement.requirementType})`}
          loading={deleteLoading}
        />
      )}
    </ProtectedRoute>
  );
}