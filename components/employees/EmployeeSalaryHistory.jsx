"use client";

import { useState } from "react";
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function EmployeeSalaryHistory({ salaryHistory = [] }) {
  const [showAll, setShowAll] = useState(false);

  const getStatusBadge = (status) => {
    const variants = {
      Paid: {
        class: "bg-emerald-500/10 text-emerald-400",
        icon: <CheckCircle2 size={14} />,
      },
      Pending: {
        class: "bg-amber-500/10 text-amber-400",
        icon: <Clock size={14} />,
      },
      Overdue: {
        class: "bg-red-500/10 text-red-400",
        icon: <AlertCircle size={14} />,
      },
    };
    return variants[status] || variants.Pending;
  };

  // ✅ Show latest first (reverse order)
  const sortedHistory = [...salaryHistory].reverse();
  
  // Show only 3 rows initially
  const displayHistory = showAll ? sortedHistory : sortedHistory.slice(0, 3);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Salary History</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Monthly salary payment records.
            </p>
          </div>
          {sortedHistory.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {showAll ? (
                <>
                  <ChevronUp size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show More ({sortedHistory.length - 3} more)
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {sortedHistory.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-muted-foreground">No salary records available.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Month
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Deductions
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Paid At
                </th>
              </tr>
            </thead>

            <tbody>
              {displayHistory.map((record, index) => {
                const statusBadge = getStatusBadge(record.status);
                const totalDeduction = record.deductions?.total || 0;
                const recordKey = record._id || record.id || index;

                return (
                  <tr
                    key={recordKey}
                    className="border-b border-border/70 transition hover:bg-muted"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-card-foreground">
                      {record.month}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-emerald-400">
                      Rs. {Number(record.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {totalDeduction > 0 ? (
                        <span className="text-red-400">
                          - Rs. {totalDeduction.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${statusBadge.class}`}
                      >
                        {statusBadge.icon}
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {record.paidAt
                        ? new Date(record.paidAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {sortedHistory.length > 3 && (
            <div className="border-t border-border p-3 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-1 text-sm text-indigo-400 transition hover:text-indigo-300"
              >
                {showAll ? (
                  <>
                    <ChevronUp size={16} />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    View All ({sortedHistory.length} records)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}