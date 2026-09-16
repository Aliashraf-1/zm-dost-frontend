"use client";

import { Users, UserPlus, Phone, CheckCircle2, XCircle, Home } from "lucide-react";

export default function LeadStats({ stats }) {
  const items = [
    { label: "Total", value: stats.total, icon: Users, color: "text-muted-foreground" },
    { label: "New", value: stats.new, icon: UserPlus, color: "text-blue-400" },
    { label: "Contacted", value: stats.contacted, icon: Phone, color: "text-amber-400" },
    { label: "Qualified", value: stats.qualified, icon: CheckCircle2, color: "text-green-400" },
    { label: "Converted", value: stats.converted, icon: Home, color: "text-emerald-400" },
    { label: "Lost", value: stats.lost, icon: XCircle, color: "text-red-400" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl bg-muted p-2.5 ${item.color}`}>
              <item.icon size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}