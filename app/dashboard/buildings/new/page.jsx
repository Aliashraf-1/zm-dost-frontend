import BuildingForm from "@/components/buildings/BuildingForm";

export default function NewBuildingPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium text-indigo-400">
          Property Management
        </p>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Add Building
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Add a new building to your property portfolio.
        </p>
      </div>

      <BuildingForm />
    </div>
  );
}