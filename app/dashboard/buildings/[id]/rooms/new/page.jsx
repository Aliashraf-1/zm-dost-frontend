"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { useBuildings } from "@/context/BuildingContext";
import RoomForm from "@/components/buildings/RoomForm";

export default function NewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { buildings, getBuildingById, addRoom, loading: buildingsLoading } = useBuildings();
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const found = getBuildingById(params.id);
      if (found) {
        setBuilding(found);
      }
      setLoading(false);
    }
  }, [params.id, buildings, getBuildingById]);

  const handleSubmit = async (roomData) => {
    try {
      const buildingId = building._id || building.id;
      await addRoom(buildingId, roomData);
      router.push(`/dashboard/buildings/${buildingId}`);
    } catch (error) {
      console.error("Failed to add room:", error);
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

  if (!building) {
    notFound();
  }

  const buildingId = building._id || building.id;

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
        <p className="mb-1 text-sm font-medium text-indigo-400">
          {building.buildingNo}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Add New Unit
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a room, hall, office or other unit to this building.
        </p>
      </div>

      <RoomForm
        initialData={null}
        mode="create"
        buildingId={buildingId}
        building={building}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}