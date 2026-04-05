"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Shield } from "lucide-react";

interface TrustScoreData {
  name: string;
  score: number;
  debt: number;
}

interface TrustScoreChartProps {
  data: TrustScoreData[];
}

const chartConfig = {
  score: {
    label: "Trust Score",
    color: "var(--color-chart-2)",
  },
};

export function TrustScoreChart({ data }: TrustScoreChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">
            Supplier Trust Scores
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                width={80}
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.score >= 80
                        ? "var(--color-success)"
                        : entry.score >= 60
                        ? "var(--color-warning)"
                        : "var(--color-destructive)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="text-muted-foreground">High (80+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span className="text-muted-foreground">Medium (60-79)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Low (&lt;60)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
