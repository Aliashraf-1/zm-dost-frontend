"use client";

import { useState, useMemo } from "react";
import { useRealEstateProperties } from "@/context/RealEstatePropertyContext";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import PropertyForm from "@/components/real-estate/properties/PropertyForm";
import PropertyCard from "@/components/real-estate/properties/PropertyCard";
import ClosePropertyModal from "@/components/real-estate/properties/ClosePropertyModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

import PropertyDetailModal from "@/components/real-estate/properties/PropertyDetailModal";

import PropertyCardSkeleton from "@/components/real-estate/skeletons/PropertyCardSkeleton";

import {
  Home,
  Plus,
  Search,
  Filter,
  X,
} from "lucide-react";

export default function RealEstatePropertiesPage() {
  const {
    properties,
    loading,
    createProperty,
    updateProperty,
    closeProperty,
    deleteProperty,
    getPropertyStats,
  } = useRealEstateProperties();

  const { user } = useAuth();
  const isAdmin = user?.role === "super_admin" || user?.role === "admin";

  // ✅ Filters
  const [search, setSearch] = useState("");
  const [listingFilter, setListingFilter] = useState("all"); // all | for_sale | for_rent
  const [statusFilter, setStatusFilter] = useState("active"); // all | active | sold_elsewhere | paused | invalid | closed_via_us

  // ✅ Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [closingProperty, setClosingProperty] = useState(null);
  const [deletingProperty, setDeletingProperty] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

const [viewingProperty, setViewingProperty] = useState(null);


  // ✅ Stats
  const stats = getPropertyStats();

  // ✅ Filtered properties
  const filteredProperties = useMemo(() => {
    let filtered = [...properties];

    // Listing type filter
    if (listingFilter !== "all") {
      filtered = filtered.filter((p) => p.listingType === listingFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.ownerName?.toLowerCase().includes(term) ||
          p.ownerPhone?.includes(term) ||
          p.society?.toLowerCase().includes(term) ||
          p.city?.toLowerCase().includes(term) ||
          p.region?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [properties, listingFilter, statusFilter, search]);

  // ✅ Handlers
  const handleAddClick = () => {
    setEditingProperty(null);
    setShowFormModal(true);
  };

  const handleEditClick = (property) => {
    setEditingProperty(property);
    setShowFormModal(true);
  };

  const handleFormSave = async (formData) => {
    if (editingProperty) {
      await updateProperty(editingProperty._id, formData);
    } else {
      await createProperty(formData);
    }
  };

  const handleCloseClick = (property) => {
    setClosingProperty(property);
  };

  const handleCloseSave = async (propertyId, data) => {
    await closeProperty(propertyId, data);
  };

  const handleDeleteClick = (property) => {
    setDeletingProperty(property);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProperty) return;
    setDeleteLoading(true);
    try {
      await deleteProperty(deletingProperty._id);
      setDeletingProperty(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

 const handleViewClick = (property) => {
  setViewingProperty(property);
};

  const clearFilters = () => {
    setSearch("");
    setListingFilter("all");
    setStatusFilter("active");
  };

  const hasActiveFilters =
    search.trim() !== "" || listingFilter !== "all" || statusFilter !== "active";

  return (
    <ProtectedRoute requiredRoles={["super_admin", "admin"]}>
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-400">Real Estate</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Properties
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Manage your for-sale and for-rent property listings.
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            <Plus size={17} />
            Add Property
          </button>
        </div>

        {/* Property Detail Modal */}
{viewingProperty && (
  <PropertyDetailModal
    property={viewingProperty}
    onClose={() => setViewingProperty(null)}
    onEdit={(prop) => {
      setViewingProperty(null);
      handleEditClick(prop);
    }}
    onCloseProperty={(prop) => {
      setViewingProperty(null);
      handleCloseClick(prop);
    }}
    onDelete={(prop) => {
      setViewingProperty(null);
      handleDeleteClick(prop);
    }}
  />
)}



        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total Properties", value: stats.total, color: "text-foreground" },
            { label: "For Sale", value: stats.forSale, color: "text-indigo-400" },
            { label: "For Rent", value: stats.forRent, color: "text-emerald-400" },
            { label: "Active", value: stats.active, color: "text-blue-400" },
            { label: "Closed", value: stats.closed, color: "text-purple-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-5"
            >
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
                placeholder="Search by owner, phone, society, or city..."
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
              />
            </div>

            {/* Listing Type Filter */}
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "for_sale", label: "For Sale" },
                { value: "for_rent", label: "For Rent" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setListingFilter(opt.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    listingFilter === opt.value
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
              <option value="active">Active Only</option>
              <option value="all">All Statuses</option>
              <option value="sold_elsewhere">Sold/Rented Elsewhere</option>
              <option value="paused">Paused</option>
              <option value="invalid">No Longer Valid</option>
              <option value="closed_via_us">Closed via Us</option>
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

          {/* Result count */}
          <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredProperties.length}</span>{" "}
            of <span className="font-medium text-foreground">{properties.length}</span> properties
          </div>
        </div>

        {/* Properties Grid */}
              {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        )  : filteredProperties.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Home size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">
              {properties.length === 0 ? "No Properties Yet" : "No Properties Found"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {properties.length === 0
                ? "Start by adding your first property listing."
                : "Try adjusting your filters or search."}
            </p>
            {properties.length === 0 && (
              <button
                onClick={handleAddClick}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                <Plus size={16} />
                Add Your First Property
              </button>
            )}
            {properties.length > 0 && hasActiveFilters && (
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
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onView={handleViewClick}
                onEdit={handleEditClick}
                onClose={handleCloseClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      {showFormModal && (
        <PropertyForm
          initialData={editingProperty}
          onClose={() => {
            setShowFormModal(false);
            setEditingProperty(null);
          }}
          onSave={handleFormSave}
        />
      )}

      {/* Close Property Modal */}
      {closingProperty && (
        <ClosePropertyModal
          property={closingProperty}
          onClose={() => setClosingProperty(null)}
          onSave={handleCloseSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProperty && (
        <DeleteConfirmModal
          isOpen={!!deletingProperty}
          onClose={() => setDeletingProperty(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Property"
          message="Are you sure you want to delete this property? This action cannot be undone."
          itemName={`${deletingProperty.society}, ${deletingProperty.city} (${deletingProperty.area} ${deletingProperty.areaUnit})`}
          loading={deleteLoading}
        />
      )}
    </ProtectedRoute>
  );
}