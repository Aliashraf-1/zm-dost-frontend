"use client";

import { useState, useEffect } from "react";
import { X, Plus, Wallet } from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";

const INCOME_TYPES = ["Rent", "Security", "Other"];

export default function QuickIncomeModal({ onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "Rent",
    amount: "",
    category: "",
    description: "",
    source: "",
  });

  const [customType, setCustomType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!form.category && !form.description) {
      setError("Please add a category or description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const incomeData = {
        type: "Income",
        transactionType: "Income",
        category: form.type === "Other" ? customType : form.type,
        description: form.description || form.category,
        amount: Number(form.amount),
        source: form.source || "N/A",
        status: "Received",
        createdAt: new Date().toISOString(),
      };

      await onSave(incomeData);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to add income.");
    } finally {
      setLoading(false);
    }
  };

  // Close on Escape key
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
        <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Wallet size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Add Income</h2>
                <p className="text-xs text-muted-foreground">Quick income entry</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Income Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
              >
                {INCOME_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Custom Type */}
            {form.type === "Other" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">Custom Category *</label>
                <input
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="e.g., Commission"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Amount (Rs.) *</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief description"
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {/* Source */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Source</label>
              <input
                name="source"
                value={form.source}
                onChange={handleChange}
                placeholder="Customer/Unit"
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
              >
                <Plus size={17} />
                {loading ? "Adding..." : "Add Income"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}