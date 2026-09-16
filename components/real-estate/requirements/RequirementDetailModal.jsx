"use client";

import { useEffect } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  Ruler,
  Wallet,
  FileText,
  Calendar,
  Users,
  Home,
  Pencil,
  Trash2,
} from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";

const PROPERTY_TYPE_LABELS = {
  residential_plot: "Residential Plot",
  commercial_plot: "Commercial Plot",
  house: "House",
  apartment: "Apartment",
  room: "Room",
  office: "Office",
  shop: "Shop",
  warehouse: "Warehouse",
  other: "Other",
};

const STATUS_BADGES = {
  active: { label: "Active", class: "bg-emerald-700/90 text-white" },
  fulfilled: { label: "Fulfilled", class: "bg-blue-800/95 text-white" },
  cancelled: { label: "Cancelled", class: "bg-red-800/95 text-white" },
};

export default function RequirementDetailModal({
  requirement,
  onClose,
  onEdit,
  onDelete,
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!requirement) return null;

  const isBuyer = requirement.requirementType === "buyer";
  const statusBadge = STATUS_BADGES[requirement.status] || STATUS_BADGES.active;

  const formatPrice = (amount) => {
    if (!amount) return "—";
    return `Rs. ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isBuyer
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                <Users size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-semibold">{requirement.name}</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {isBuyer ? "Buyer Requirement" : "Tenant Requirement"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  isBuyer
                    ? "bg-indigo-700/90 text-white"
                    : "bg-emerald-700/90 text-white"
                }`}
              >
                {isBuyer ? "Buyer" : "Tenant"}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${statusBadge.class}`}
              >
                {statusBadge.label}
              </span>
            </div>

            {/* Info Grid */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoItem icon={User} label="Name" value={requirement.name} />
              <InfoItem icon={Phone} label="Phone" value={requirement.phone} />
              <InfoItem
                icon={MapPin}
                label="Preferred Area"
                value={requirement.preferredArea || "—"}
              />
              <InfoItem icon={MapPin} label="Region" value={requirement.region || "—"} />
              <InfoItem icon={MapPin} label="City" value={requirement.city || "—"} />
              {requirement.desiredArea > 0 && (
                <InfoItem
                  icon={Ruler}
                  label="Desired Area"
                  value={`${requirement.desiredArea} ${requirement.areaUnit || ""}`}
                />
              )}
              <InfoItem
                icon={Wallet}
                label={isBuyer ? "Budget" : "Monthly Rent Budget"}
                value={formatPrice(requirement.budget)}
                valueClassName={isBuyer ? "text-indigo-400" : "text-emerald-400"}
              />
              <InfoItem
                icon={Calendar}
                label="Created At"
                value={formatDate(requirement.createdAt)}
              />
              <InfoItem
                icon={User}
                label="Created By"
                value={requirement.createdByName || "—"}
              />
            </div>

            {/* Looking For */}
            {requirement.lookingFor?.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Home size={14} />
                  Looking For
                </div>
                <div className="flex flex-wrap gap-2">
                  {requirement.lookingFor.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-1.5 text-xs font-medium text-indigo-400"
                    >
                      <Home size={12} />
                      {PROPERTY_TYPE_LABELS[type] || type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {requirement.notes && (
              <div className="mt-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <FileText size={14} />
                  Notes / Remarks
                </div>
                <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-foreground">
                  {requirement.notes}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 border-t border-border bg-card p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Close
              </button>
              <button
                onClick={() => onEdit?.(requirement)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Pencil size={15} />
                Edit
              </button>
              <button
                onClick={() => onDelete?.(requirement)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/15"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

// ✅ Reusable Info Item
function InfoItem({ icon: Icon, label, value, valueClassName = "" }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon size={13} />
        {label}
      </div>
      <p className={`mt-2 text-sm font-medium ${valueClassName || "text-foreground"}`}>
        {value || "—"}
      </p>
    </div>
  );
}