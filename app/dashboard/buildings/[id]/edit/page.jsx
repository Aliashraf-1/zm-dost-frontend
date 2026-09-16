import { notFound } from "next/navigation";

import { buildings } from "@/data/buildings";
import BuildingForm from "@/components/buildings/BuildingForm";

export default async function EditBuildingPage({
  params,
}) {
  const { id } = await params;

  const building = buildings.find(
    (item) => item.id === Number(id)
  );

  if (!building) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium text-indigo-400">
          Property Management
        </p>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Edit {building.buildingNo}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Update the building information below.
        </p>
      </div>

      <BuildingForm
        initialData={building}
        mode="edit"
      />
    </div>
  );
}