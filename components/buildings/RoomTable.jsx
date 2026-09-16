"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  User,
  CheckCircle2,
  Clock3,
  Eye,
  Wallet,
  UserMinus,
  Pencil,
  CircleAlert,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBuildings } from "@/context/BuildingContext";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import PayRentModal from "@/components/rent/PayRentModal";
import ClearRentalModal from "@/components/rent/ClearRentalModal";
import { getImageUrl } from "@/lib/imageHelper";

export default function RoomTable({
  rooms = [],
  buildingId,
}) {
  const { user } = useAuth();
  const { deleteRoom } = useBuildings();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modal, setModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getPendingMonths = (room) => {
    if (!room?.rentStartDate) return 0;
    const rentHistory = room.rentHistory || [];
    const paidMonths = rentHistory.filter((item) => item.status === "Paid").length;
    const startDate = new Date(room.rentStartDate);
    const today = new Date();
    const monthsPassed =
      (today.getFullYear() - startDate.getFullYear()) * 12 +
      (today.getMonth() - startDate.getMonth()) +
      1;
    return Math.max(monthsPassed - paidMonths, 0);
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const searchValue = search.toLowerCase().trim();
      const unitNumber = String(room.unitNo || "").toLowerCase();
      const tenantName = String(room.tenant?.name || "").toLowerCase();
      const matchesSearch =
        unitNumber.includes(searchValue) || tenantName.includes(searchValue);
      const matchesStatus = status === "All" || room.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [rooms, search, status]);

  const openPayRent = (room) => {
    setSelectedRoom(room);
    setModal("payRent");
  };

  const openClearRental = (room) => {
    setSelectedRoom(room);
    setModal("clearRental");
  };

  const closeModal = () => {
    setSelectedRoom(null);
    setModal(null);
  };

  const getRoomId = (room) => room._id || room.id;

  const handleDeleteClick = (room) => {
    setSelectedRoom(room);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRoom) return;
    setDeleteLoading(true);
    try {
      const roomId = getRoomId(selectedRoom);
      await deleteRoom(buildingId, roomId);
      setShowDeleteModal(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error("Delete room error:", error);
      alert("Failed to delete room. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header */}
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Units</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage units and rental information.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search unit or tenant..."
                  className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500 sm:w-64"
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-card-foreground outline-none focus:border-indigo-500"
              >
                <option value="All">All Units</option>
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Unit</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Tenant</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Purpose</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Monthly Rent</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Security</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rent Status</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Unit Status</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => {
                const roomId = getRoomId(room);
                const rented = room.status === "Rented";
                const security = Number(room.initialPayment?.securityReceived || 0);
                const pendingMonths = rented ? getPendingMonths(room) : 0;
                const rentPending = pendingMonths > 0;
                const pendingAmount = pendingMonths * Number(room.monthlyRent || 0);
                const viewUrl = `/dashboard/buildings/${buildingId}/rooms/${roomId}`;
                const editUrl = `/dashboard/buildings/${buildingId}/rooms/${roomId}/edit`;

                return (
                  <tr key={roomId} className="border-b border-border/70 transition hover:bg-muted">
                    {/* Unit */}
                    <td className="px-6 py-4">
                      <Link href={viewUrl} className="group flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-muted text-xs font-semibold transition group-hover:bg-indigo-500/10 group-hover:text-indigo-400">
                          {room.unitImage ? (
                            <img
                              src={getImageUrl(room.unitImage)}
                              alt={room.unitNo}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                                e.target.parentElement.textContent = room.unitNo;
                              }}
                            />
                          ) : (
                            room.unitNo
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium transition group-hover:text-indigo-400">
                            {room.type} {room.unitNo}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Click to view</p>
                        </div>
                      </Link>
                    </td>

                    {/* Tenant */}
                    <td className="px-6 py-4">
                      {rented ? (
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-indigo-500/10 text-indigo-400">
                            {room.tenant?.image ? (
                              <img
                                src={getImageUrl(room.tenant.image)}
                                alt={room.tenant.name || "Tenant"}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                  e.target.parentElement.innerHTML =
                                    '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>';
                                }}
                              />
                            ) : (
                              <User size={17} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{room.tenant?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{room.tenant?.phone || "No phone"}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No tenant</span>
                      )}
                    </td>

                    {/* Purpose */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{room.purpose || "—"}</span>
                    </td>

                    {/* Rent */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">
                        Rs. {Number(room.monthlyRent || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Security */}
                    <td className="px-6 py-4">
                      {security > 0 ? (
                        <div>
                          <p className="text-sm font-medium text-emerald-400">
                            Rs. {security.toLocaleString()}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Held</p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Rent Status */}
                    <td className="px-6 py-4">
                      {!rented ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : rentPending ? (
                        <button
                          type="button"
                          onClick={() => openPayRent(room)}
                          className="group text-left"
                        >
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition group-hover:bg-red-500/20">
                            <CircleAlert size={14} />
                            Pending
                          </span>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {pendingMonths} {pendingMonths === 1 ? "month" : "months"} · Rs.{" "}
                            {pendingAmount.toLocaleString()}
                          </p>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400">
                          <CheckCircle2 size={14} />
                          Paid
                        </span>
                      )}
                    </td>

                    {/* Unit Status */}
                    <td className="px-6 py-4">
                      {rented ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400">
                          <CheckCircle2 size={14} />
                          Rented
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-400">
                          <Clock3 size={14} />
                          Available
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={viewUrl}
                          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          title="View unit"
                        >
                          <Eye size={17} />
                        </Link>

                        <Link
                          href={editUrl}
                          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          title="Edit unit"
                        >
                          <Pencil size={17} />
                        </Link>

                        {rented && (
                          <>
                            <button
                              type="button"
                              onClick={() => openPayRent(room)}
                              className="rounded-lg p-2 text-muted-foreground transition hover:bg-emerald-500/10 hover:text-emerald-400"
                              title="Pay rent"
                            >
                              <Wallet size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openClearRental(room)}
                              className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400"
                              title="Clear rental"
                            >
                              <UserMinus size={17} />
                            </button>
                          </>
                        )}

                        {/* ✅ Delete Button - Admin only */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(room)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400"
                            title="Delete unit"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRooms.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm font-medium">No units found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try changing your search or filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal === "payRent" && selectedRoom && (
        <PayRentModal
          buildingId={buildingId}
          room={selectedRoom}
          onClose={closeModal}
        />
      )}
      {modal === "clearRental" && selectedRoom && (
        <ClearRentalModal
          buildingId={buildingId}
          room={selectedRoom}
          onClose={closeModal}
        />
      )}
      {showDeleteModal && selectedRoom && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedRoom(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Unit"
          message={`Are you sure you want to delete unit ${selectedRoom.unitNo}? This action cannot be undone and will remove all associated records.`}
          itemName={`${selectedRoom.type} ${selectedRoom.unitNo}`}
          loading={deleteLoading}
        />
      )}
    </>
  );
}