"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X, Home, User, Phone, MapPin, Building2, Ruler, DollarSign,
  Upload, Trash2, Image as ImageIcon, FileText, Save,
} from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageHelper";
import { useAuth } from "@/context/AuthContext";

const PROPERTY_TYPES = [
  { value: "residential_plot", label: "Residential Plot" },
  { value: "commercial_plot", label: "Commercial Plot" },
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "room", label: "Room" },
  { value: "office", label: "Office" },
  { value: "shop", label: "Shop" },
  { value: "warehouse", label: "Warehouse" },
  { value: "other", label: "Other" },
];

const AREA_UNITS = [
  { value: "marla", label: "Marla" },
  { value: "kanal", label: "Kanal" },
  { value: "sqft", label: "Sq. Ft." },
  { value: "sqyd", label: "Sq. Yard" },
  { value: "sqm", label: "Sq. Meter" },
  { value: "acre", label: "Acre" },
];

export default function PropertyForm({ initialData = null, onClose, onSave }) {
  const { user } = useAuth();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    listingType: initialData?.listingType || "for_sale",
    ownerName: initialData?.ownerName || "",
    ownerPhone: initialData?.ownerPhone || "",
    society: initialData?.society || "",
    region: initialData?.region || "",
    city: initialData?.city || "",
    province: initialData?.province || "",
    propertyType: initialData?.propertyType || "house",
    area: initialData?.area || "",
    areaUnit: initialData?.areaUnit || "marla",
    askingPrice: initialData?.askingPrice || "",
    monthlyRent: initialData?.monthlyRent || "",
    securityDeposit: initialData?.securityDeposit || "",
    remarks: initialData?.remarks || "",
  });

  const [newPhotos, setNewPhotos] = useState([]); // File objects
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([]); // blob URLs
  const [existingPhotos, setExistingPhotos] = useState(initialData?.photos || []); // DB paths
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isForSale = form.listingType === "for_sale";

  const totalPhotos = newPhotos.length + existingPhotos.length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleListingTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      listingType: type,
      // Reset pricing fields
      askingPrice: type === "for_sale" ? prev.askingPrice : "",
      monthlyRent: type === "for_rent" ? prev.monthlyRent : "",
      securityDeposit: type === "for_rent" ? prev.securityDeposit : "",
    }));
    setError("");
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 10 - totalPhotos;
    if (remainingSlots <= 0) {
      setError("Maximum 10 photos allowed.");
      return;
    }

    const selected = files.slice(0, remainingSlots);
    const newFiles = [...newPhotos, ...selected];
    const newPreviews = [
      ...newPhotoPreviews,
      ...selected.map((file) => URL.createObjectURL(file)),
    ];

    setNewPhotos(newFiles);
    setNewPhotoPreviews(newPreviews);
    e.target.value = "";
    setError("");
  };

  const removeNewPhoto = (index) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingPhoto = (index) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.ownerName || !form.ownerPhone || !form.society || !form.region || !form.city) {
      setError("Please fill all required owner and location fields.");
      return;
    }
    if (!form.area || Number(form.area) <= 0) {
      setError("Please enter a valid area.");
      return;
    }
    if (isForSale && (!form.askingPrice || Number(form.askingPrice) <= 0)) {
      setError("Please enter asking price.");
      return;
    }
    if (!isForSale && (!form.monthlyRent || Number(form.monthlyRent) <= 0)) {
      setError("Please enter monthly rent.");
      return;
    }

    setLoading(true);

    try {
      const propertyData = {
        listingType: form.listingType,
        ownerName: form.ownerName.trim(),
        ownerPhone: form.ownerPhone.trim(),
        society: form.society.trim(),
        region: form.region.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        propertyType: form.propertyType,
        area: Number(form.area),
        areaUnit: form.areaUnit,
        askingPrice: isForSale ? Number(form.askingPrice) : 0,
        monthlyRent: !isForSale ? Number(form.monthlyRent) : 0,
        securityDeposit: !isForSale ? Number(form.securityDeposit || 0) : 0,
        remarks: form.remarks.trim(),
        photos: existingPhotos,
        createdBy: initialData?.createdBy || user?._id || null,
        createdByName: initialData?.createdByName || user?.name || "",
        updatedBy: user?._id || null,
        updatedByName: user?.name || "",
      };

      // Build FormData for multipart upload
      const formData = new FormData();
      formData.append("propertyData", JSON.stringify(propertyData));

      newPhotos.forEach((file) => {
        formData.append("propertyPhotos", file);
      });

      await onSave(formData);
      onClose();
    } catch (err) {
      console.error("Property save error:", err);
      setError(err.response?.data?.message || err.message || "Failed to save property.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <Home size={20} />
              </div>
              <div>
                <h2 className="font-semibold">{isEdit ? "Edit Property" : "Add New Property"}</h2>
                <p className="text-xs text-muted-foreground">Enter property details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            {/* Listing Type Toggle */}
            <div>
              <label className="mb-2 block text-sm font-medium">Listing Type *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleListingTypeChange("for_sale")}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isForSale
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  For Sale
                </button>
                <button
                  type="button"
                  onClick={() => handleListingTypeChange("for_rent")}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    !isForSale
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  For Rent
                </button>
              </div>
            </div>

            {/* Owner Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Owner Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    name="ownerName"
                    value={form.ownerName}
                    onChange={handleChange}
                    placeholder="Enter owner name"
                    className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Phone Number *</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    name="ownerPhone"
                    value={form.ownerPhone}
                    onChange={handleChange}
                    placeholder="0300-1234567"
                    className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Society / Area *</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    name="society"
                    value={form.society}
                    onChange={handleChange}
                    placeholder="e.g. DHA Phase 2"
                    className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Region *</label>
                <input
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  placeholder="e.g. Sargodha Region"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">City *</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Sargodha"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Province</label>
                <input
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  placeholder="e.g. Punjab"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Property Type + Area */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Property Type *</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select
                    name="propertyType"
                    value={form.propertyType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 appearance-none"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Area *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ruler size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="number"
                      name="area"
                      value={form.area}
                      onChange={handleChange}
                      placeholder="e.g. 5"
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <select
                    name="areaUnit"
                    value={form.areaUnit}
                    onChange={handleChange}
                    className="rounded-xl border border-border bg-input px-3 py-3 text-sm outline-none focus:border-indigo-500"
                  >
                    {AREA_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid gap-4 md:grid-cols-2">
              {isForSale ? (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Asking Price (Rs.) *</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="number"
                      name="askingPrice"
                      value={form.askingPrice}
                      onChange={handleChange}
                      placeholder="e.g. 5000000"
                      min="0"
                      className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                      required={isForSale}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Monthly Rent (Rs.) *</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="number"
                        name="monthlyRent"
                        value={form.monthlyRent}
                        onChange={handleChange}
                        placeholder="e.g. 50000"
                        min="0"
                        className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                        required={!isForSale}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Security Deposit (Rs.)</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="number"
                        name="securityDeposit"
                        value={form.securityDeposit}
                        onChange={handleChange}
                        placeholder="Optional"
                        min="0"
                        className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Remarks */}
            <div>
              <label className="mb-2 block text-sm font-medium">Remarks</label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional details..."
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
              />
            </div>

            {/* Photos Upload */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium">
                  Photos
                  <span className="ml-2 text-xs text-muted-foreground">({totalPhotos}/10)</span>
                </label>
              </div>

              {/* Upload Button */}
              {totalPhotos < 10 && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-muted p-4 transition hover:border-indigo-500 hover:bg-indigo-500/5">
                  <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-400">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upload property photos</p>
                    <p className="text-xs text-muted-foreground">Max 10 photos, JPG/PNG/WEBP</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Photo Previews */}
              {totalPhotos > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {/* Existing Photos (from DB) */}
                  {existingPhotos.map((photo, index) => (
                    <div
                      key={`existing-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-input"
                    >
                      <Image
                        src={getImageUrl(photo)}
                        alt={`Existing ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(index)}
                        className="absolute right-1.5 top-1.5 rounded-lg bg-black/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {/* New Photos (blob previews) */}
                  {newPhotoPreviews.map((preview, index) => (
                    <div
                      key={`new-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-indigo-500/30 bg-input"
                    >
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewPhoto(index)}
                        className="absolute right-1.5 top-1.5 rounded-lg bg-black/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
              >
                <Save size={17} />
                {loading ? "Saving..." : isEdit ? "Update Property" : "Save Property"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}