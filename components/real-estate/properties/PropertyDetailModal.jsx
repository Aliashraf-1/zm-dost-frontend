"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Home,
  MapPin,
  User,
  Phone,
  Calendar,
  Ruler,
  Wallet,
  FileText,
  ChevronLeft,
  ChevronRight,
  Pencil,
  XCircle,
  Trash2,
  Image as ImageIcon,
  LandPlot,
  Building2,
  DoorOpen,
  Briefcase,
  Store,
  Warehouse,
  Package,
} from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";
import { getImageUrl } from "@/lib/imageHelper";

// ✅ Property Type icons
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
  sold_elsewhere: { label: "Sold/Rented Elsewhere", class: "bg-blue-800/95 text-white" },
  paused: { label: "Paused", class: "bg-amber-700/90 text-white" },
  invalid: { label: "No Longer Valid", class: "bg-red-800/95 text-white" },
  closed_via_us: { label: "Closed via Us", class: "bg-purple-800/95 text-white" },
};

export default function PropertyDetailModal({
  property,
  onClose,
  onEdit,
  onCloseProperty,
  onDelete,
}) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!property) return null;

  const isForSale = property.listingType === "for_sale";
  const isActive = property.status === "active";
  const TypeIcon = PROPERTY_TYPE_ICONS[property.propertyType] || Package;
  const typeLabel = PROPERTY_TYPE_LABELS[property.propertyType] || "Property";
  const statusBadge = STATUS_BADGES[property.status] || STATUS_BADGES.active;
  const photos = property.photos || [];

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
        <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <TypeIcon size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-semibold">
                  {typeLabel} • {property.area} {property.areaUnit}
                </h2>
                <p className="truncate text-xs text-muted-foreground">
                  {property.society}, {property.city}
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
            {/* Photo Gallery */}
            {photos.length > 0 ? (
              <div className="space-y-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
                  <Image
                    src={getImageUrl(photos[activePhotoIndex])}
                    alt={`Photo ${activePhotoIndex + 1}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />

                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActivePhotoIndex(
                            (activePhotoIndex - 1 + photos.length) % photos.length
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white transition hover:bg-black/90"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() =>
                          setActivePhotoIndex((activePhotoIndex + 1) % photos.length)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white transition hover:bg-black/90"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                        {activePhotoIndex + 1} / {photos.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setActivePhotoIndex(index)}
                        className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                          activePhotoIndex === index
                            ? "border-indigo-500"
                            : "border-transparent hover:border-border"
                        }`}
                      >
                        <Image
                          src={getImageUrl(photo)}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border bg-muted">
                <div className="text-center">
                  <ImageIcon size={48} className="mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No photos</p>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  isForSale
                    ? "bg-indigo-700/90 text-white"
                    : "bg-emerald-700/90 text-white"
                }`}
              >
                {isForSale ? "For Sale" : "For Rent"}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${statusBadge.class}`}
              >
                {statusBadge.label}
              </span>
            </div>

            {/* Info Grid */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {/* Owner Name */}
              <InfoItem icon={User} label="Owner Name" value={property.ownerName} />
              {/* Owner Phone */}
              <InfoItem icon={Phone} label="Phone" value={property.ownerPhone} />
              {/* Society */}
              <InfoItem icon={MapPin} label="Society/Area" value={property.society} />
              {/* Region */}
              <InfoItem icon={MapPin} label="Region" value={property.region || "—"} />
              {/* City */}
              <InfoItem icon={MapPin} label="City" value={property.city} />
              {/* Province */}
              <InfoItem icon={MapPin} label="Province" value={property.province || "—"} />
              {/* Property Type */}
              <InfoItem icon={TypeIcon} label="Property Type" value={typeLabel} />
              {/* Area */}
              <InfoItem
                icon={Ruler}
                label="Area"
                value={`${property.area} ${property.areaUnit}`}
              />
              {/* Price */}
              {isForSale ? (
                <InfoItem
                  icon={Wallet}
                  label="Asking Price"
                  value={formatPrice(property.askingPrice)}
                  valueClassName="text-indigo-400"
                />
              ) : (
                <>
                  <InfoItem
                    icon={Wallet}
                    label="Monthly Rent"
                    value={formatPrice(property.monthlyRent)}
                    valueClassName="text-emerald-400"
                  />
                  {property.securityDeposit > 0 && (
                    <InfoItem
                      icon={Wallet}
                      label="Security Deposit"
                      value={formatPrice(property.securityDeposit)}
                    />
                  )}
                </>
              )}
              {/* Commission (if closed via us) */}
              {property.status === "closed_via_us" && property.commission > 0 && (
                <InfoItem
                  icon={Wallet}
                  label="Commission Recorded"
                  value={formatPrice(property.commission)}
                  valueClassName="text-purple-400"
                />
              )}
              {/* Created By */}
              <InfoItem
                icon={User}
                label="Created By"
                value={property.createdByName || "—"}
              />
              {/* Created At */}
              <InfoItem
                icon={Calendar}
                label="Created At"
                value={formatDate(property.createdAt)}
              />
              {/* Closed At (if closed) */}
              {property.closedAt && (
                <InfoItem
                  icon={Calendar}
                  label="Closed At"
                  value={formatDate(property.closedAt)}
                />
              )}
            </div>

            {/* Remarks */}
            {property.remarks && (
              <div className="mt-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <FileText size={14} />
                  Remarks
                </div>
                <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-foreground">
                  {property.remarks}
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
                onClick={() => onEdit?.(property)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Pencil size={15} />
                Edit
              </button>
              {isActive && (
                <button
                  onClick={() => onCloseProperty?.(property)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-sm font-medium text-amber-400 transition hover:bg-amber-500/15"
                >
                  <XCircle size={15} />
                  Close Property
                </button>
              )}
              <button
                onClick={() => onDelete?.(property)}
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