"use client";

import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function Alerts({ alerts = [] }) {
  const getIcon = (type) => {
    const icons = {
      warning: Clock,
      success: CheckCircle2,
      error: XCircle,
      info: AlertCircle,
    };
    return icons[type] || AlertCircle;
  };

  const getColor = (type) => {
    const colors = {
      warning: "text-amber-400 bg-amber-500/10",
      success: "text-emerald-400 bg-emerald-500/10",
      error: "text-red-400 bg-red-500/10",
      info: "text-blue-400 bg-blue-500/10",
    };
    return colors[type] || colors.info;
  };

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Alerts</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">No alerts</p>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 size={32} className="text-emerald-400" />
          <p className="mt-3 text-sm text-muted-foreground">All clear! No alerts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Alerts</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Important notifications
          </p>
        </div>
        <button className="text-xs text-indigo-400 hover:text-indigo-300">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = getIcon(alert.type);
          const color = getColor(alert.type);

          return (
            <div
              key={index}
              className={`flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-3 ${color}`}
            >
              <div className={`rounded-lg p-2 ${color}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {alert.title || "Alert"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {alert.description || ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}