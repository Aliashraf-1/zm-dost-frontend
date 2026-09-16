import Link from "next/link";
import {
  Building2,
  DoorOpen,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import { getImageUrl } from "@/lib/imageHelper";

export default function BuildingCard({ building }) {
  const buildingId = building._id || building.id;
  const rooms = Array.isArray(building?.rooms) ? building.rooms : [];

  const totalRooms = rooms.length;
  const rentedRooms = rooms.filter(
    (room) => room?.status === "Rented"
  ).length;

  const availableRooms = rooms.filter(
    (room) => room?.status === "Available"
  ).length;

  const monthlyRevenue = rooms
    .filter((room) => room?.status === "Rented")
    .reduce(
      (total, room) =>
        total + Number(room?.monthlyRent || 0),
      0
    );

  // ✅ Get first unit image for building thumbnail
  const firstUnitImage = rooms.find((room) => room?.unitImage)?.unitImage;

  console.log("BuildingCard - firstUnitImage:", firstUnitImage);
  console.log("BuildingCard - image URL:", firstUnitImage ? getImageUrl(firstUnitImage) : null);

  return (
    <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-black/20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* ✅ Building Image / Icon */}
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-indigo-500/10 text-indigo-400">
            {firstUnitImage ? (
              <img
                src={getImageUrl(firstUnitImage)}
                alt={building?.buildingNo || "Building"}
                className="h-full w-full rounded-xl object-cover"
                onError={(e) => {
                  console.log("Image failed to load:", e.target.src);
                  e.target.onerror = null;
                  e.target.style.display = "none";
                  // Show fallback icon
                  const parent = e.target.parentElement;
                  parent.innerHTML =
                    '<svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>';
                }}
              />
            ) : (
              <Building2 size={22} />
            )}
          </div>

          <div>
            <h3 className="font-semibold">
              {building?.buildingNo || "Unnamed Building"}
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              {building?.reference || "No reference"}
            </p>
          </div>
        </div>

        <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
          building?.status === "Active" 
            ? "bg-emerald-500/10 text-emerald-400" 
            : "bg-red-500/10 text-red-400"
        }`}>
          {building?.status || "Unknown"}
        </span>
      </div>

      {/* Address */}
      <p className="mt-5 text-sm text-muted-foreground">
        {building?.address || "No address available"}
      </p>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {/* Total Rooms */}
        <div className="rounded-xl bg-input/60 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DoorOpen size={16} />
            <span className="text-xs">Rooms</span>
          </div>
          <p className="mt-2 font-semibold">{totalRooms}</p>
        </div>

        {/* Monthly Revenue */}
        <div className="rounded-xl bg-input/60 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet size={16} />
            <span className="text-xs">Revenue</span>
          </div>
          <p className="mt-2 font-semibold">
            Rs. {monthlyRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="mt-5 flex items-center justify-between text-xs">
        <div className="flex gap-4">
          <span className="text-emerald-400">{rentedRooms} rented</span>
          <span className="text-muted-foreground">{availableRooms} available</span>
        </div>

        {/* View */}
        <Link
          href={`/dashboard/buildings/${buildingId}`}
          className="flex items-center gap-1 font-medium text-indigo-400 transition hover:text-indigo-300"
        >
          View
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}