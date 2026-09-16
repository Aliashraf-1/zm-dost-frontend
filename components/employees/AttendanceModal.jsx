"use client";

import { useState, useEffect } from "react";
import { X, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";

export default function AttendanceModal({ employee, onClose, onSave }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState("Present");
  const [checkIn, setCheckIn] = useState("09:00");
  const [checkOut, setCheckOut] = useState("17:00");
  const [lateMinutes, setLateMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ✅ Error state

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
    setLoading(true);
    setError(""); // ✅ Clear previous error

    try {
      const employeeId = employee._id || employee.id;
      
      const attendanceData = {
        date: date,
        status: status,
        checkIn: status === "Present" ? checkIn : null,
        checkOut: status === "Present" ? checkOut : null,
        lateMinutes: status === "Present" ? Number(lateMinutes) : 0,
      };

      await onSave(employeeId, attendanceData);
      onClose();
    } catch (error) {
      console.error("Failed to save attendance:", error);
      // ✅ Inline error message set karo
      setError(error.response?.data?.message || "Failed to save attendance. Please try again.");
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
        <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <Clock size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Mark Attendance</h2>
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
            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-card-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  if (e.target.value === "Present") {
                    setCheckIn("09:00");
                    setCheckOut("17:00");
                  } else {
                    setCheckIn("");
                    setCheckOut("");
                    setLateMinutes(0);
                  }
                }}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </div>

            {/* Check In/Out */}
            {status === "Present" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">Check In</label>
                  <input
                    type="time"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">Check Out</label>
                  <input
                    type="time"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Late Minutes */}
            {status === "Present" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">Late Minutes</label>
                <input
                  type="number"
                  min="0"
                  value={lateMinutes}
                  onChange={(e) => setLateMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  placeholder="0"
                />
              </div>
            )}

            {/* ✅ Inline Error Display */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
              >
                <CheckCircle2 size={17} />
                {loading ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}