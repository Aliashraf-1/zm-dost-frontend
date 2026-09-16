"use client";

import { useState, useEffect } from "react";
import { X, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";

export default function TaskModal({ employee, onClose, onSave, task = null }) {
  const isEdit = !!task;
  const [loading, setLoading] = useState(false);
  
  // ✅ Helper: Convert ISO to datetime-local format
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

  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    assignedDate: toDateTimeLocal(task?.assignedDate) || toDateTimeLocal(new Date().toISOString()),
    dueDate: toDateTimeLocal(task?.dueDate) || "",
    priority: task?.priority || "Medium",
    status: task?.status || "Pending",
    failureReason: task?.failureReason || "",
    failureDeduction: task?.failureDeduction || employee?.attendanceSettings?.taskFailureDeduction || 1000,
  });

  // Close on Escape key
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        title: form.title,
        description: form.description,
        assignedDate: form.assignedDate ? new Date(form.assignedDate).toISOString() : new Date().toISOString(),
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        priority: form.priority,
        status: form.status,
        failureReason: form.status === "Failed" ? form.failureReason : "",
        failureDeduction: form.status === "Failed" ? Number(form.failureDeduction) : 0,
        completedAt: form.status === "Completed" ? new Date().toISOString() : null,
      };
      
      // If editing, include task ID
      if (task) {
        taskData._id = task._id || task.id;
        taskData.id = task._id || task.id;
      }
      
      await onSave(taskData);
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Plus size={20} />
              </div>
              <div>
                <h2 className="font-semibold">{isEdit ? "Edit Task" : "Assign Task"}</h2>
                <p className="text-xs text-muted-foreground">{employee?.name}</p>
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
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">
                Task Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter task title"
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Enter task description"
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {/* Assigned Date & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">
                  Assigned Date
                </label>
                <input
                  type="datetime-local"
                  name="assignedDate"
                  value={form.assignedDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Failure Reason & Deduction */}
            {form.status === "Failed" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">
                    Failure Reason *
                  </label>
                  <input
                    name="failureReason"
                    value={form.failureReason}
                    onChange={handleChange}
                    placeholder="Why did the task fail?"
                    className="w-full rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">
                    Task Failure Deduction (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="failureDeduction"
                    value={form.failureDeduction}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    placeholder="Enter deduction amount"
                  />
                </div>
              </>
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
              >
                <CheckCircle2 size={17} />
                {loading ? "Saving..." : isEdit ? "Update Task" : "Assign Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}