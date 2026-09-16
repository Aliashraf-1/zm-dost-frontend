"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  DoorOpen,
  User,
  Wallet,
  Calendar,
  Phone,
  CreditCard,
  ShieldCheck,
  Home,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Pencil,
  UserMinus,
  History,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";
import { useBuildings } from "@/context/BuildingContext";
import BuildingSummary from "@/components/buildings/BuildingSummary";
import BuildingUnitTypeChart from "@/components/buildings/BuildingUnitTypeChart";
import RoomTable from "@/components/buildings/RoomTable";

export default function BuildingDetailsPage() {
  const params = useParams();
  const { buildings, loading: buildingsLoading, getBuildingById, loadBuildings } = useBuildings();
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Params ID:", params.id);
    console.log("Buildings:", buildings);
    
    if (params.id) {
      // First try to find building from existing state
      let found = getBuildingById(params.id);
      
      // If not found and buildings is empty, load buildings first
      if (!found && buildings.length === 0) {
        loadBuildings().then(() => {
          const retryFound = getBuildingById(params.id);
          if (retryFound) {
            setBuilding(retryFound);
            setLoading(false);
          }
        });
        return;
      }
      
      if (found) {
        setBuilding(found);
      }
      setLoading(false);
    }
  }, [params.id, buildings, getBuildingById, loadBuildings]);

  if (loading || buildingsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading building details...</div>
      </div>
    );
  }

  if (!building) {
    console.log("Building not found for ID:", params.id);
    notFound();
  }

  const buildingId = building._id || building.id;

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/buildings"
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Buildings
        </Link>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {building.buildingNo}
              </h1>

              <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                building.status === "Active" 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-red-500/10 text-red-400"
              }`}>
                {building.status}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 size={16} />
              {building.address}
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/dashboard/buildings/${buildingId}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition hover:border-border hover:bg-muted hover:text-foreground"
            >
              <Pencil size={17} />
              Edit Building
            </Link>

            <Link
              href={`/dashboard/buildings/${buildingId}/rooms/new`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
            >
              <Plus size={17} />
              Add Unit
            </Link>
          </div>
        </div>
      </div>

      {/* Summary */}
      <BuildingSummary building={building} />

      {/* Donut Chart */}
      <BuildingUnitTypeChart rooms={building.rooms || []} />

      {/* Rooms Table */}
      <div className="mt-6">
        <RoomTable
          rooms={building.rooms || []}
          buildingId={buildingId}
        />
      </div>
    </div>
  );
}