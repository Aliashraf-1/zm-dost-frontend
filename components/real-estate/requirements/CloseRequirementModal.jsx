"use client";

import { useState, useEffect } from "react";
import { X, XCircle, CheckCircle2, AlertCircle, Ban } from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";
import { useAuth } from "@/context/AuthContext";

const CLOSE_OPTIONS = [
  {
    value: "fulfilled",
    label: "Fulfilled",
    description: "Requirement has been successfully met",
    icon: CheckCircle2,
    color: "text-blue-400",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    description: "Buyer/Tenant cancelled their requirement",
    icon: Ban,
    color: "text-red-400",
  },
];

export default function CloseRequirementModal({ requirement, onClose, onSave }) {
  const { user } = useAuth();
  const [status, setStatus] = useState("fulfilled");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isBuyer = requirement?.requirementType === "buyer";

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
    setLoading(true);

    try {
      const data = {
        status,
        closedRemarks: notes.trim(),
        closedBy: user?._id || null,
        closedByName: user?.name || "",
      };

      await onSave(requirement._id, data);
      onClose();
    } catch (err) {
      console.error("Close requirement error:", err);
      setError(err.response?.data?.message || err.message || "Failed to close requirement.");
    } finally {
      setLoading(false);
    }
  };

  if (!requirement) return null;

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
              <div className="min-w-0">
                <h2 className="font-semibold">Close Requirement</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {requirement.name} ({isBuyer ? "Buyer" : "Tenant"})
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
            {/* Requirement Summary */}
            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Requirement</p>
              <p className="mt-1 text-sm font-medium">{requirement.name}</p>
              <p className="text-xs text-muted-foreground">
                {[requirement.preferredArea, requirement.city, requirement.region]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>

            {/* Status Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">Close As *</label>
              <div className="space-y-2">
                {CLOSE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = status === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                        selected
                          ? "border-indigo-500/50 bg-indigo-500/5"
                          : "border-border hover:border-border hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="closeStatus"
                        value={option.value}
                        checked={selected}
                        onChange={(e) => setStatus(e.target.value)}
                        className="mt-0.5 h-4 w-4 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon size={15} className={option.color} />
                          <p className="text-sm font-medium">{option.label}</p>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium">Remarks (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                placeholder="Any note about this closure..."
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
                {loading ? "Closing..." : "Close Requirement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}