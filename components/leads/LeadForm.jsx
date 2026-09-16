"use client";

import { useState, useEffect } from "react";
import { X, Save, User, Phone, Mail, Building2, Tag, UserPlus } from "lucide-react";
import { LEAD_STATUS, LEAD_TYPES, LEAD_SOURCES } from "@/constants/leadStatus";
import ModalPortal from "@/components/common/ModalPortal";
import { useAuth } from "@/context/AuthContext";

export default function LeadForm({
  employee,
  onClose,
  onSave,
  initialData = null,
}) {
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  // ✅ Helper: Convert ISO to datetime-local
  const toDateTimeLocal = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const assignedId =
    typeof initialData?.assignedTo === "object"
      ? initialData?.assignedTo?._id || initialData?.assignedTo?.id
      : initialData?.assignedTo;

  const createdById =
    typeof initialData?.createdBy === "object"
      ? initialData?.createdBy?._id || initialData?.createdBy?.id
      : initialData?.createdBy;

  const [form, setForm] = useState({
    customerName: initialData?.customerName || "",
    customerPhone: initialData?.customerPhone || "",
    customerEmail: initialData?.customerEmail || "",
    type: initialData?.type || "Room",
    status: initialData?.status || "New",
    source: initialData?.source || "Referral",
    remarks: initialData?.remarks || "",
    followUpDate: toDateTimeLocal(initialData?.followUpDate) || "",
    assignedTo: assignedId || employee?._id || employee?.id || null,
    assignedToName:
      initialData?.assignedToName ||
      (typeof initialData?.assignedTo === "object" ? initialData?.assignedTo?.name : "") ||
      employee?.name ||
      "",
    createdBy: createdById || user?._id || user?.id || null,
    createdByName: initialData?.createdByName || user?.name || employee?.name || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customerName || !form.customerPhone) {
      setError("Customer name and phone are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const leadData = {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail || "",
        type: form.type,
        status: form.status,
        source: form.source,
        remarks: form.remarks || "",
        followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : null,
        assignedTo: typeof form.assignedTo === "object" ? form.assignedTo?._id || form.assignedTo?.id : form.assignedTo,
        assignedToName: form.assignedToName,
        createdBy: typeof form.createdBy === "object" ? form.createdBy?._id || form.createdBy?.id : form.createdBy,
        createdByName: form.createdByName,
        convertedToUnit: isEdit ? initialData?.convertedToUnit || null : null,
      };

      await onSave(leadData);
      onClose();
    } catch (error) {
      console.error("Lead save error:", error);
      setError(error.response?.data?.message || error.message || "Failed to save lead.");
    } finally {
      setLoading(false);
    }
  };

  // ... baaki JSX same rahega (jo aapke paas already hai)

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <User size={20} />
              </div>
              <div>
                <h2 className="font-semibold">{isEdit ? "Edit Lead" : "Add New Lead"}</h2>
                <p className="text-xs text-muted-foreground">
                  {isEdit ? "Update lead information" : "Enter customer lead information"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Customer Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Customer Name *</label>
              <div className="relative">
                <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Phone *</label>
              <div className="relative">
                <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleChange}
                  placeholder="0300-1234567"
                  className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">
                Email <span className="text-xs text-muted-foreground">(Optional)</span>
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="customerEmail"
                  value={form.customerEmail}
                  onChange={handleChange}
                  placeholder="customer@email.com"
                  className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Type & Source */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">Type</label>
                <div className="relative">
                  <Building2 size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm text-card-foreground outline-none focus:border-indigo-500 appearance-none"
                  >
                    {LEAD_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">Source</label>
                <div className="relative">
                  <Tag size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm text-card-foreground outline-none focus:border-indigo-500 appearance-none"
                  >
                    {LEAD_SOURCES.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Status - ✅ Always visible */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
              >
                {Object.values(LEAD_STATUS).map((status) => (
                  <option key={status.value} value={status.value}>{status.value}</option>
                ))}
              </select>
            </div>

            {/* Remarks */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Remarks</label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows="3"
                placeholder="Add remarks about this lead..."
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
              />
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Follow-up Date</label>
              <input
                type="datetime-local"
                name="followUpDate"
                value={form.followUpDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
              />
            </div>

            {/* Assigned To & Created By Info */}
            <div className="grid grid-cols-2 gap-4">
              {form.assignedToName && (
                <div className="rounded-xl border border-border bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p className="mt-1 text-sm font-medium text-card-foreground">{form.assignedToName}</p>
                </div>
              )}
              {form.createdByName && (
                <div className="rounded-xl border border-border bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Added By</p>
                  <p className="mt-1 text-sm font-medium text-card-foreground">{form.createdByName}</p>
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
                {loading ? "Saving..." : isEdit ? "Update Lead" : "Save Lead"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}