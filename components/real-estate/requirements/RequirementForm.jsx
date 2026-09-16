"use client";

import { useState, useEffect } from "react";
import {
  X, ClipboardList, User, Phone, MapPin, Building2, Ruler,
  DollarSign, Save, CheckCircle2,
} from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";
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

export default function RequirementForm({ initialData = null, onClose, onSave }) {
  const { user } = useAuth();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    requirementType: initialData?.requirementType || "buyer",
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    preferredArea: initialData?.preferredArea || "",
    region: initialData?.region || "",
    city: initialData?.city || "",
    lookingFor: initialData?.lookingFor || [],
    desiredArea: initialData?.desiredArea || "",
    areaUnit: initialData?.areaUnit || "marla",
    budget: initialData?.budget || "",
    notes: initialData?.notes || "",
    status: initialData?.status || "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isBuyer = form.requirementType === "buyer";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleTypeChange = (type) => {
    setForm((prev) => ({ ...prev, requirementType: type }));
    setError("");
  };

  const handleLookingForToggle = (value) => {
    setForm((prev) => {
      const current = prev.lookingFor || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, lookingFor: updated };
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.name || !form.phone) {
      setError("Please enter name and phone number.");
      return;
    }

    if (!isEdit && form.lookingFor.length === 0) {
      setError("Please select at least one property type in 'Looking For'.");
      return;
    }

    setLoading(true);

    try {
      const requirementData = {
        requirementType: form.requirementType,
        name: form.name.trim(),
        phone: form.phone.trim(),
        preferredArea: form.preferredArea.trim(),
        region: form.region.trim(),
        city: form.city.trim(),
        lookingFor: form.lookingFor,
        desiredArea: Number(form.desiredArea) || 0,
        areaUnit: form.areaUnit,
        budget: Number(form.budget) || 0,
        notes: form.notes.trim(),
        status: form.status,
        createdBy: initialData?.createdBy || user?._id || null,
        createdByName: initialData?.createdByName || user?.name || "",
        updatedBy: user?._id || null,
        updatedByName: user?.name || "",
      };

      await onSave(requirementData);
      onClose();
    } catch (err) {
      console.error("Requirement save error:", err);
      setError(err.response?.data?.message || err.message || "Failed to save requirement.");
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
                <ClipboardList size={20} />
              </div>
              <div>
                <h2 className="font-semibold">
                  {isEdit ? "Edit Requirement" : "Add New Requirement"}
                </h2>
                <p className="text-xs text-muted-foreground">Buyer or tenant requirement</p>
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
            {/* Requirement Type Toggle */}
            <div>
              <label className="mb-2 block text-sm font-medium">Requirement Type *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange("buyer")}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isBuyer
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("tenant")}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    !isBuyer
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  Tenant
                </button>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={isBuyer ? "Buyer name" : "Tenant name"}
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
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0300-1234567"
                    className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Preference */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Preferred Area</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    name="preferredArea"
                    value={form.preferredArea}
                    onChange={handleChange}
                    placeholder="e.g. DHA Phase 2"
                    className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Region</label>
                <input
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  placeholder="e.g. Sargodha Region"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Sargodha"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Looking For (Multi-select) */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Looking For *
                <span className="ml-2 text-xs text-muted-foreground">
                  ({form.lookingFor.length} selected)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((type) => {
                  const selected = form.lookingFor.includes(type.value);
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleLookingForToggle(type.value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        selected
                          ? "bg-indigo-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                    >
                      {selected && <CheckCircle2 size={12} className="mr-1 inline" />}
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desired Area */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Desired Area</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ruler size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="number"
                      name="desiredArea"
                      value={form.desiredArea}
                      onChange={handleChange}
                      placeholder="e.g. 5"
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
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

              {/* Budget */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {isBuyer ? "Buyer's Budget (Rs.)" : "Monthly Rent Budget (Rs.)"}
                </label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="e.g. 5000000"
                    min="0"
                    className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium">Notes / Remarks</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any useful information to remember..."
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
              />
            </div>

            {/* Status (Edit mode only) */}
            {isEdit && (
              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}

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
                {loading ? "Saving..." : isEdit ? "Update Requirement" : "Save Requirement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}