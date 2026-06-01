/**
 * InvestmentChart Component
 * Displays expense trends over time using Recharts
 */

import React from "react";
import Card from "@/components/ui/Card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartDataPoint } from "../hooks/useChartData";

interface InvestmentChartProps {
  data: ChartDataPoint[];
  isLoading: boolean;
}

export const InvestmentChart: React.FC<InvestmentChartProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-80 bg-[var(--border)] rounded"></div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-[var(--text)] font-hind mb-4">
          বিনিয়োগ চার্ট
        </h2>
        <p className="text-sm text-[var(--text)]/60 font-hind">
          কোনো তথ্য নেই
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-[var(--text)] font-hind mb-6">
        মাসিক বিনিয়োগ চার্ট
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            stroke="var(--text)"
            tick={{ fill: "var(--text)" }}
            tickLine={{ stroke: "var(--border)" }}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            stroke="var(--text)"
            tick={{ fill: "var(--text)" }}
            tickLine={{ stroke: "var(--border)" }}
            axisLine={{ stroke: "var(--border)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
            }}
          />
          <Legend
            wrapperStyle={{ color: "var(--text)" }}
            iconType="circle"
          />
          <Bar
            dataKey="খাদ্য (Feed)"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="সার (Fertilizer)"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="অন্যান্য (Other)"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
