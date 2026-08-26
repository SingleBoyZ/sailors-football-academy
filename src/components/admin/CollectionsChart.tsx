"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatSenCompact } from "@/lib/money";

export type CollectionsChartPoint = { month: string; totalSen: number };

export function CollectionsChart({ data }: { data: CollectionsChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#0f0f1015" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5b5b60" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: "#5b5b60" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `RM${(v / 100).toFixed(0)}`}
        />
        <Tooltip
          formatter={(value) => formatSenCompact(Number(value))}
          contentStyle={{ border: "1px solid #0f0f1015", fontSize: 13 }}
        />
        <Bar dataKey="totalSen" fill="#e8232a" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
