"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { dashboardAPI } from "@/lib/api";

const Chart = dynamic(
  () => import("react-apexcharts"),
  {
    ssr: false,
  }
);

export default function RevenueChart() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const muted = isDark ? "#94a3b8" : "#64748b";
  const grid = isDark ? "#1e293b" : "#e2e8f0";

  const [chartData, setChartData] = useState({
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    series: [
      {
        name: "Revenue",
        data: [0, 0, 0, 0, 0, 0, 0, 0],
      },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await dashboardAPI.getRevenueChart();
        if (response.data.success) {
          setChartData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load revenue chart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const options = {
    chart: {
      type: "area",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      background: "transparent",
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    grid: {
      borderColor: grid,
      strokeDashArray: 4,
    },

    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: muted,
          fontSize: "11px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },

    yaxis: {
      labels: {
        style: {
          colors: muted,
          fontSize: "11px",
        },
        formatter: (value) =>
          `Rs. ${(value / 1000).toFixed(0)}K`,
      },
    },

    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (value) =>
          `Rs. ${Number(value).toLocaleString()}`,
      },
    },

    colors: ["#6366f1"],

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.03,
        stops: [0, 90, 100],
      },
    },
  };

  const series = chartData.series || [
    {
      name: "Revenue",
      data: [0, 0, 0, 0, 0, 0, 0, 0],
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full w-full flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Monthly Revenue</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Loading chart...</p>
        </div>
        <div className="flex-1 animate-pulse bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Monthly Revenue</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Revenue performance over the current year
        </p>
      </div>

      <div className="flex-1">
        <Chart
          options={options}
          series={series}
          type="area"
          height="100%"
        />
      </div>
    </div>
  );
}