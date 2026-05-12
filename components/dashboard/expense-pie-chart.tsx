"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ExpensePieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No expense data for this month
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value = 0) => [
            `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            "Amount",
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
            <span style={{ fontSize: "12px", color: "#6b7280" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
