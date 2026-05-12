"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface BudgetVsActualChartProps {
  data: {
    name: string;
    budget: number;
    actual: number;
    color: string;
  }[];
}

export function BudgetVsActualChart({ data }: BudgetVsActualChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No budget data for this month
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        barGap={4}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f3f4f6"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
          }
        />
        <Tooltip
          formatter={(value = 0, name) => [
            `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            name === "budget" ? "Budget" : "Actual Spent",
          ]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
            fontSize: "12px",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {value === "budget" ? "Budget" : "Actual Spent"}
            </span>
          )}
        />
        <Bar
          dataKey="budget"
          fill="#bbf7d0"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="actual"
          fill="#16a34a"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
