"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  Phone,
  MapPin,
  Wallet,
  Ruler,
  Calendar,
  Pencil,
  Trash2,
  Eye,
  Users,
  Home,
  CheckCircle2,
  XCircle,
  ChevronDown,
  PlayCircle,
} from "lucide-react";

// ✅ Property Type → Label mapping
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

// ✅ Status Badge config
const STATUS_BADGES = {
  active: { label: "Active", class: "bg-emerald-700/90 text-white" },
  fulfilled: { label: "Fulfilled", class: "bg-blue-800/95 text-white" },
  cancelled: { label: "Cancelled", class: "bg-red-800/95 text-white" },
};

// ✅ Status options for change
const STATUS_OPTIONS = [
  { value: "active", label: "Active", icon: PlayCircle, color: "text-emerald-400" },
  { value: "fulfilled", label: "Fulfilled", icon: CheckCircle2, color: "text-blue-400" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, color: "text-red-400" },
];

export default function RequirementCard({
  requirement,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onClose,       // ✅ NEW: Close modal handler
}) {
  const isBuyer = requirement.requirementType === "buyer";
  const statusBadge = STATUS_BADGES[requirement.status] || STATUS_BADGES.active;
  const isActive = requirement.status === "active";

  // ✅ Status dropdown state
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const menuRef = useRef(null);

  // ✅ Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const formattedDate = requirement.createdAt
    ? new Date(requirement.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const formatPrice = (amount) => {
    if (!amount) return "—";
    return `Rs. ${Number(amount).toLocaleString()}`;
  };

  const handleStatusSelect = (newStatus) => {
    setShowStatusMenu(false);
    if (newStatus !== requirement.status) {
      onStatusChange?.(requirement, newStatus);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-black/20">
      {/* Header Strip */}
      <div
        className={`flex items-center justify-between px-4 py-3 ${
          isBuyer
            ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10"
            : "bg-gradient-to-r from-emerald-500/10 to-teal-500/10"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`rounded-lg p-1.5 ${
              isBuyer
                ? "bg-indigo-500/20 text-indigo-400"
                : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            <Users size={14} />
          </div>
          <span
            className={`text-xs font-semibold uppercase tracking-wide ${
              isBuyer ? "text-indigo-400" : "text-emerald-400"
            }`}
          >
            {isBuyer ? "Buyer" : "Tenant"}
          </span>
        </div>

        {/* ✅ Status Badge with Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition hover:opacity-90 ${statusBadge.class}`}
          >
            {statusBadge.label}
            <ChevronDown size={10} />
          </button>

          {showStatusMenu && (
            <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isCurrent = requirement.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleStatusSelect(opt.value)}
                    disabled={isCurrent}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition ${
                      isCurrent
                        ? "cursor-not-allowed bg-muted text-muted-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={13} className={opt.color} />
                    {opt.label}
                    {isCurrent && (
                      <span className="ml-auto text-[9px] uppercase text-muted-foreground">
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name & Phone */}
        <div>
          <h3 className="truncate text-base font-semibold text-foreground">
            {requirement.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone size={12} />
            <span>{requirement.phone}</span>
          </div>
        </div>

        {/* Location */}
        {(requirement.preferredArea || requirement.city || requirement.region) && (
          <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin size={12} className="mt-0.5 shrink-0" />
            <span className="truncate">
              {[requirement.preferredArea, requirement.city, requirement.region]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        )}

        {/* Looking For */}
        {requirement.lookingFor?.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Looking For
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {requirement.lookingFor.slice(0, 3).map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  <Home size={10} />
                  {PROPERTY_TYPE_LABELS[type] || type}
                </span>
              ))}
              {requirement.lookingFor.length > 3 && (
                <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  +{requirement.lookingFor.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Desired Area + Budget */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
          {requirement.desiredArea > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Desired Area
              </p>
              <div className="mt-1 flex items-center gap-1 text-sm font-medium">
                <Ruler size={12} className="text-muted-foreground" />
                <span>
                  {requirement.desiredArea} {requirement.areaUnit}
                </span>
              </div>
            </div>
          )}

          {requirement.budget > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Budget
              </p>
              <div className="mt-1 flex items-center gap-1 text-sm font-medium">
                <Wallet size={12} className="text-muted-foreground" />
                <span className={isBuyer ? "text-indigo-400" : "text-emerald-400"}>
                  {formatPrice(requirement.budget)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {requirement.notes && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Notes
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {requirement.notes}
            </p>
          </div>
        )}

        {/* Added Date */}
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar size={12} />
          <span>Added {formattedDate}</span>
        </div>

        {/* Actions - Row 1 */}
        <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3">
          <button
            onClick={() => onView?.(requirement)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="View"
          >
            <Eye size={14} />
            View
          </button>
          <button
            onClick={() => onEdit?.(requirement)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Edit"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={() => onDelete?.(requirement)}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* ✅ Actions - Row 2 (Close button, only if active) */}
        {isActive && (
          <div className="mt-2">
            <button
              onClick={() => onClose?.(requirement)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs font-medium text-amber-400 transition hover:bg-amber-500/15"
              title="Close Requirement"
            >
              <XCircle size={14} />
              Close Requirement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}