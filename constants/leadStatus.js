// constants/leadStatus.js
export const LEAD_STATUS = {
  NEW: { value: "New", color: "bg-blue-500/10 text-blue-400", icon: "🆕" },
  CONTACTED: { value: "Contacted", color: "bg-amber-500/10 text-amber-400", icon: "📞" },
  QUALIFIED: { value: "Qualified", color: "bg-green-500/10 text-green-400", icon: "✅" },
  LOST: { value: "Lost", color: "bg-red-500/10 text-red-400", icon: "❌" },
  CONVERTED: { value: "Converted", color: "bg-emerald-500/10 text-emerald-400", icon: "🏠" },
};

export const LEAD_TYPES = ["Hostel", "Office", "Shop", "Room", "Desk", "Other"];
export const LEAD_SOURCES = ["Referral", "Website", "Walk-in", "Social Media", "Phone", "Other"];