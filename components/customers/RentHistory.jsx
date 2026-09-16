"use client";

import {
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

export default function RentHistory({
  customer,
}) {
  const history = customer.rentHistory || [];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border p-6">
        <h2 className="text-lg font-semibold">
          Rent History
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Monthly rent payment records.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No rent history available.
          </p>
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
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Paid At
                </th>
              </tr>
            </thead>

            <tbody>
              {history.map((payment, index) => {
                const paid =
                  payment.status === "Paid";

                const pending =
                  payment.status === "Pending";

                return (
                  <tr
                    key={payment._id || payment.id || `${payment.month}-${index}`}
                    className="border-b border-border/70 transition hover:bg-muted"
                  >
                    <td className="px-6 py-4 text-sm font-medium">
                      {payment.month}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      Rs.{" "}
                      {Number(
                        payment.amount || 0
                      ).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      {paid ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400">
                          <CheckCircle2 size={14} />
                          Paid
                        </span>
                      ) : pending ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-400">
                          <Clock3 size={14} />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400">
                          <AlertCircle size={14} />
                          {payment.status}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.paidAt
                        ? new Date(
                            payment.paidAt
                          ).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}