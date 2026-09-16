import {
  Users,
  UserCheck,
  Clock3,
  Wallet,
} from "lucide-react";

function SummaryCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function CustomerSummary({
  customers = [],
}) {
  const totalCustomers =
    customers.length;

  const paidCustomers =
    customers.filter(
      (customer) =>
        customer.status === "Paid"
    ).length;

  const pendingCustomers =
    customers.filter(
      (customer) =>
        customer.status === "Pending" ||
        customer.status === "Overdue"
    ).length;

  const outstanding =
    customers.reduce(
      (total, customer) =>
        total +
        Number(customer.outstanding || 0),
      0
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        icon={Users}
        title="Total Customers"
        value={totalCustomers}
        description="Currently renting units"
      />

      <SummaryCard
        icon={UserCheck}
        title="Rent Paid"
        value={paidCustomers}
        description="Customers with cleared rent"
      />

      <SummaryCard
        icon={Clock3}
        title="Pending Rent"
        value={pendingCustomers}
        description="Pending or overdue customers"
      />

      <SummaryCard
        icon={Wallet}
        title="Outstanding"
        value={`Rs. ${outstanding.toLocaleString()}`}
        description="Total unpaid rent"
      />
    </div>
  );
}