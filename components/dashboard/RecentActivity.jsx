"use client";

import { Clock, User, Building2, DollarSign, UserPlus } from "lucide-react";

export default function RecentActivity({ activities = [] }) {
  const getIcon = (type) => {
    const icons = {
      lead: UserPlus,
      rent: DollarSign,
      salary: User,
      building: Building2,
    };
    return icons[type] || Clock;
  };

  const getIconColor = (type) => {
    const colors = {
      lead: "text-indigo-400",
      rent: "text-emerald-400",
      salary: "text-blue-400",
      building: "text-amber-400",
    };
    return colors[type] || "text-muted-foreground";
  };

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">No recent activity</p>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <Clock size={32} className="text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No activity yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Latest updates from your properties
          </p>
        </div>
        <button className="text-xs text-indigo-400 hover:text-indigo-300">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getIcon(activity.type);
          const iconColor = getIconColor(activity.type);

          return (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-3 transition hover:bg-muted"
            >
              <div className={`rounded-lg bg-muted/30 p-2 ${iconColor}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.title || "Activity"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.description || ""}
                </p>
                <div className="mt-1 flex items-center gap-3">
                  {activity.amount && (
                    <span className="text-xs font-medium text-emerald-400">
                      Rs. {activity.amount.toLocaleString()}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={11} />
                    {activity.time ? new Date(activity.time).toLocaleDateString() : "Just now"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}