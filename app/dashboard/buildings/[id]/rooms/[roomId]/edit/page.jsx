"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { useBuildings } from "@/context/BuildingContext";
import RoomForm from "@/components/buildings/RoomForm";

export default function EditRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { buildings, getBuildingById, updateRoom, loading: buildingsLoading } = useBuildings();
  const [building, setBuilding] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id && params.roomId) {
      const foundBuilding = getBuildingById(params.id);
      if (foundBuilding) {
        setBuilding(foundBuilding);
        const foundRoom = foundBuilding.rooms?.find(
          (item) => item._id === params.roomId || item.id === Number(params.roomId)
        );
        if (foundRoom) {
          setRoom(foundRoom);
        }
      }
      setLoading(false);
    }
  }, [params.id, params.roomId, buildings, getBuildingById]);

  const handleSubmit = async (roomData) => {
    try {
      const buildingId = building._id || building.id;
      const roomId = room._id || room.id;
      await updateRoom(buildingId, roomId, roomData);
      router.push(`/dashboard/buildings/${buildingId}`);
    } catch (error) {
      console.error("Failed to update room:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    const buildingId = building._id || building.id;
    router.push(`/dashboard/buildings/${buildingId}`);
  };

  if (loading || buildingsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!building || !room) {
    notFound();
  }

  const buildingId = building._id || building.id;
  const roomId = room._id || room.id;

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href={`/dashboard/buildings/${buildingId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to {building.buildingNo}
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Building2 size={24} className="text-indigo-400" />
          <div>
            <p className="text-sm font-medium text-indigo-400">
              {building.buildingNo}
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Edit Unit {room.unitNo}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update unit information and rental details.
            </p>
          </div>
        </div>
      </div>

      <RoomForm
        initialData={room}
        mode="edit"
        buildingId={buildingId}
        building={building}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}