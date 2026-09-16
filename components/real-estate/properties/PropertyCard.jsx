"use client";

import Image from "next/image";
import {
  Home,
  MapPin,
  User,
  Phone,
  Calendar,
  Pencil,
  Trash2,
  XCircle,
  Eye,
  LandPlot,
  Building2,
  DoorOpen,
  Briefcase,
  Store,
  Warehouse,
  Package,
} from "lucide-react";
import { getImageUrl } from "@/lib/imageHelper";

// ✅ Property Type → Icon mapping
const PROPERTY_TYPE_ICONS = {
  residential_plot: LandPlot,
  commercial_plot: Building2,
  house: Home,
  apartment: Building2,
  room: DoorOpen,
  office: Briefcase,
  shop: Store,
  warehouse: Warehouse,
  other: Package,
};

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

// ✅ Status → Badge config (darker backgrounds for better readability)
const STATUS_BADGES = {
  active: { label: "Active", class: "bg-emerald-700/90 text-white" },
  sold_elsewhere: { label: "Sold/Rented Elsewhere", class: "bg-blue-800/95 text-white" },
  paused: { label: "Paused", class: "bg-amber-700/90 text-white" },
  invalid: { label: "No Longer Valid", class: "bg-red-800/95 text-white" },
  closed_via_us: { label: "Closed via Us", class: "bg-purple-800/95 text-white" },
};

export default function PropertyCard({
  property,
  onView,
  onEdit,
  onClose,
  onDelete,
}) {
  const firstPhoto = property.photos?.[0];
  const TypeIcon = PROPERTY_TYPE_ICONS[property.propertyType] || Package;
  const typeLabel = PROPERTY_TYPE_LABELS[property.propertyType] || "Property";
  const statusBadge = STATUS_BADGES[property.status] || STATUS_BADGES.active;
  const isForSale = property.listingType === "for_sale";
  const isActive = property.status === "active";

  // ✅ Format date
  const formattedDate = property.createdAt
    ? new Date(property.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  // ✅ Format price
  const formatPrice = (amount) => {
    if (!amount) return "—";
    return `Rs. ${Number(amount).toLocaleString()}`;
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-black/20">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {firstPhoto ? (
          <Image
            src={getImageUrl(firstPhoto)}
            alt={`${typeLabel} in ${property.society}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
            <TypeIcon size={48} className="text-muted-foreground/50" />
          </div>
        )}

        {/* ✅ Badges Top-Left (For Sale/Rent + Photo count) */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm ${
              isForSale
                ? "bg-indigo-700/90 text-white"
                : "bg-emerald-700/90 text-white"
            }`}
          >
            {isForSale ? "For Sale" : "For Rent"}
          </span>
          {property.photos?.length > 1 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              {property.photos.length} 📷
            </span>
          )}
        </div>

        {/* ✅ Status Badge Top-Right (darker + smaller) */}
        <div className="absolute right-2 top-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm ${statusBadge.class}`}
          >
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <div className="flex items-start gap-2">
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
            <TypeIcon size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground">
              {typeLabel} • {property.area} {property.areaUnit}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={12} />
              <span className="truncate">
                {property.society}, {property.city}
              </span>
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User size={12} />
            <span className="truncate">{property.ownerName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone size={12} />
            <span>{property.ownerPhone}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            {isForSale ? "Asking Price" : "Monthly Rent"}
          </p>
          <p
            className={`mt-1 text-lg font-bold ${
              isForSale ? "text-indigo-400" : "text-emerald-400"
            }`}
          >
            {formatPrice(isForSale ? property.askingPrice : property.monthlyRent)}
          </p>
        </div>

        {/* Added Date */}
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar size={12} />
          <span>Added {formattedDate}</span>
        </div>

        {/* Actions - Row 1 */}
        <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3">
          <button
            onClick={() => onView?.(property)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="View"
          >
            <Eye size={14} />
            View
          </button>
          <button
            onClick={() => onEdit?.(property)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Edit"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={() => onDelete?.(property)}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Actions - Row 2 (Close button, only if active) */}
        {isActive && (
          <div className="mt-2">
            <button
              onClick={() => onClose?.(property)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs font-medium text-amber-400 transition hover:bg-amber-500/15"
              title="Close Property"
            >
              <XCircle size={14} />
              Close Property
            </button>
          </div>
        )}
      </div>
    </div>
  );
}