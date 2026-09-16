"use client";

import { useState, useEffect } from "react";
import { X, XCircle, CheckCircle2, AlertCircle, DollarSign } from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";
import { useAuth } from "@/context/AuthContext";

const CLOSE_REASONS = [
  {
    value: "sold_elsewhere",
    label: "Sold / Rented Elsewhere",
    description: "Property closed outside our system (no commission)",
  },
  {
    value: "paused",
    label: "Paused for Now",
    description: "Temporarily paused from active listings",
  },
  {
    value: "invalid",
    label: "No Longer Valid",
    description: "Property is no longer available or valid",
  },
  {
    value: "closed_via_us",
    label: "Closed via Us (Commission)",
    description: "Sale/Rent completed through us — record commission",
  },
];

export default function ClosePropertyModal({ property, onClose, onSave }) {
  const { user } = useAuth();
  const [status, setStatus] = useState("sold_elsewhere");
  const [closedReason, setClosedReason] = useState("");
  const [commission, setCommission] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isCommission = status === "closed_via_us";
  const isForSale = property?.listingType === "for_sale";

  // ✅ Suggest commission based on price (2%)
  const suggestedCommission = isForSale
    ? Math.round((Number(property?.askingPrice) || 0) * 0.02)
    : Math.round((Number(property?.monthlyRent) || 0) * 0.5);

  useEffect(() => {
    if (isCommission && !commission && suggestedCommission > 0) {
      setCommission(suggestedCommission.toString());
    }
  }, [isCommission, suggestedCommission]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isCommission && (!commission || Number(commission) <= 0)) {
      setError("Please enter a valid commission amount.");
      return;
    }

    setLoading(true);

    try {
      const data = {
        status,
        closedReason: closedReason.trim(),
        commission: isCommission ? Number(commission) : 0,
        commissionType: isForSale ? "sale_commission" : "rent_commission",
        closedByName: user?.name || "",
      };

      await onSave(property._id, data);
      onClose();
    } catch (err) {
      console.error("Close property error:", err);
      setError(err.response?.data?.message || err.message || "Failed to close property.");
    } finally {
      setLoading(false);
    }
  };

  if (!property) return null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <XCircle size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Close Property</h2>
                <p className="text-xs text-muted-foreground">
                  {property.society} • {property.city}
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

          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {/* Property Summary */}
            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Property</p>
              <p className="mt-1 text-sm font-medium">
                {property.propertyType} • {property.area} {property.areaUnit}
              </p>
              <p className="text-xs text-muted-foreground">
                {isForSale
                  ? `Asking: Rs. ${Number(property.askingPrice || 0).toLocaleString()}`
                  : `Rent: Rs. ${Number(property.monthlyRent || 0).toLocaleString()}`}
              </p>
            </div>

            {/* Status Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">Close Reason *</label>
              <div className="space-y-2">
                {CLOSE_REASONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                      status === option.value
                        ? "border-indigo-500/50 bg-indigo-500/5"
                        : "border-border hover:border-border hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="closeStatus"
                      value={option.value}
                      checked={status === option.value}
                      onChange={(e) => setStatus(e.target.value)}
                      className="mt-0.5 h-4 w-4 accent-indigo-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Commission (only if closed_via_us) */}
            {isCommission && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-400">
                  <DollarSign size={16} />
                  Commission Amount (Rs.) *
                </label>
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => {
                    setCommission(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter commission"
                  min="0"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  required={isCommission}
                />
                {suggestedCommission > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Suggested: Rs. {suggestedCommission.toLocaleString()}
                    {isForSale ? " (2% of asking price)" : " (50% of one month rent)"}
                  </p>
                )}
                <p className="mt-1 text-xs text-emerald-400">
                  This will be recorded as {isForSale ? "sale" : "rent"} commission in Revenue.
                </p>
              </div>
            )}

            {/* Optional Remarks */}
            <div>
              <label className="mb-2 block text-sm font-medium">Remarks</label>
              <textarea
                value={closedReason}
                onChange={(e) => setClosedReason(e.target.value)}
                rows="2"
                placeholder="Optional notes about this closure..."
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-60"
              >
                <CheckCircle2 size={17} />
                {loading ? "Closing..." : "Close Property"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}