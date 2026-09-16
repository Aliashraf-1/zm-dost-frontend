"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Save,
  X,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { useBuildings } from "@/context/BuildingContext";

function createUnit(buildingId, unitIndex) {
  return {
    unitNo: String(unitIndex).padStart(3, "0"),
    type: "Room",
    reference: "",
    status: "Available",
    purpose: "Room",
    monthlyRent: 999,
    rentStartDate: null,
    unitImage: null,
    tenant: null,
    initialPayment: null,
    rentHistory: [],
    securityHistory: [],
  };
}

function generateUnits(buildingId, totalUnits) {
  return Array.from(
    { length: totalUnits },
    (_, index) => createUnit(buildingId, index + 1)
  );
}

export default function BuildingForm({
  initialData = null,
  mode = "create",
  onCancel,
}) {
  const router = useRouter();
  const { createBuilding, updateBuilding, loading: contextLoading } = useBuildings();
  const isEdit = mode === "edit";

  const existingRooms = Array.isArray(initialData?.rooms) ? initialData.rooms : [];

  const [form, setForm] = useState({
    buildingNo: initialData?.buildingNo || "",
    reference: initialData?.reference || "",
    address: initialData?.address || "",
    totalUnits: isEdit ? existingRooms.length : "",
    status: initialData?.status || "Active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unitWarning, setUnitWarning] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "totalUnits") {
      setUnitWarning("");
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUnitWarning("");

    const totalUnits = Number(form.totalUnits);
    if (!totalUnits || totalUnits < 1) {
      setError("Please enter a valid number of units.");
      return;
    }

    setLoading(true);

    try {
      let buildingData = {
        buildingNo: form.buildingNo.trim(),
        reference: form.reference.trim(),
        address: form.address.trim(),
        status: form.status,
        totalUnits: totalUnits,
      };

      if (mode === "create") {
        // ✅ Create new building with units
        const rooms = generateUnits(null, totalUnits);
        buildingData.rooms = rooms;
        
        const result = await createBuilding(buildingData);
        console.log("Building created:", result);
        
      } else {
        // ✅ Edit existing building
        let rooms = [...existingRooms];
        const currentCount = rooms.length;

        if (totalUnits > currentCount) {
          const newUnits = Array.from(
            { length: totalUnits - currentCount },
            (_, index) => createUnit(initialData._id || initialData.id, currentCount + index + 1)
          );
          rooms = [...rooms, ...newUnits];
        }

        if (totalUnits < currentCount) {
          setUnitWarning(
            `This building currently has ${currentCount} units. The total cannot be reduced automatically because existing units may contain rental and financial records. Manage units individually instead.`
          );
        }

        buildingData.rooms = rooms;
        
        const buildingId = initialData._id || initialData.id;
        const result = await updateBuilding(buildingId, buildingData);
        console.log("Building updated:", result);
      }

      // ✅ Redirect to buildings list
      router.push("/dashboard/buildings");
      
    } catch (error) {
      console.error("Save error:", error);
      setError(error.response?.data?.message || error.message || "Something went wrong while saving the building.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card"
    >
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <Building2 size={22} />
        </div>
        <div>
          <h2 className="font-semibold">
            {isEdit ? "Edit Building" : "Add New Building"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the basic information of this building.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Unit Warning */}
      {unitWarning && (
        <div className="mx-6 mt-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-400">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{unitWarning}</p>
        </div>
      )}

      {/* Fields */}
      <div className="grid gap-5 p-6 md:grid-cols-2">
        {/* Building Number */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Building Number
          </label>
          <input
            name="buildingNo"
            value={form.buildingNo}
            onChange={handleChange}
            placeholder="e.g. Building #04"
            required
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
          />
        </div>

        {/* Reference */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Building Reference
          </label>
          <input
            name="reference"
            value={form.reference}
            onChange={handleChange}
            placeholder="e.g. Faisalabad Road"
            required
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Full Address
          </label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter complete building address"
            required
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
          />
        </div>

        {/* Total Units */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Total Units
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              name="totalUnits"
              value={form.totalUnits}
              onChange={handleChange}
              placeholder="e.g. 12"
              required
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
            />
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Plus size={17} />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {mode === "create"
              ? "The system will automatically create these units with default values."
              : "Increasing this number will create additional units automatically."}
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Building Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Default Units Info */}
      <div className="mx-6 mb-6 rounded-xl border border-border bg-muted p-4">
        <p className="text-sm font-medium text-card-foreground">New Unit Defaults</p>
        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          <span>
            Type:
            <strong className="ml-1 text-muted-foreground">Room</strong>
          </span>
          <span>
            Purpose:
            <strong className="ml-1 text-muted-foreground">Room</strong>
          </span>
          <span>
            Monthly Rent:
            <strong className="ml-1 text-muted-foreground">Rs. 999</strong>
          </span>
          <span>
            Status:
            <strong className="ml-1 text-emerald-400">Available</strong>
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Unit reference, image, tenant and rental information can be added later from the
          unit management screen.
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-border p-6">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X size={17} />
            Cancel
          </button>
        ) : (
          <Link
            href="/dashboard/buildings"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X size={17} />
            Cancel
          </Link>
        )}

        <button
          type="submit"
          disabled={loading || contextLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} />
          {loading || contextLoading
            ? "Saving..."
            : isEdit
            ? "Update Building"
            : "Save Building"}
        </button>
      </div>
    </form>
  );
}