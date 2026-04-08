"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CreditCard, Building2, CalendarClock } from "lucide-react";
import { formatCurrency } from "@/lib/data";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  highlighted?: boolean;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  highlighted = false,
  variant = "default",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md",
        highlighted && "ring-2 ring-primary shadow-lg",
        variant === "success" && "border-success/50",
        variant === "warning" && "border-warning/50",
        variant === "destructive" && "border-destructive/50"
      )}
    >
      {highlighted && (
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
      )}
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            variant === "default" && "bg-secondary text-foreground",
            variant === "success" && "bg-success/10 text-success",
            variant === "warning" && "bg-warning/10 text-warning",
            variant === "destructive" && "bg-destructive/10 text-destructive"
          )}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {(description || trendValue) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {trend && trendValue && (
              <span
                className={cn(
                  "flex items-center gap-0.5 font-medium",
                  trend === "up" && "text-success",
                  trend === "down" && "text-destructive"
                )}
              >
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trendValue}
              </span>
            )}
            {description && (
              <span className="text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  totalClearingToday: number;
  chequesClearingTomorrow: number;
  totalSupplierDebt: number;
}

export function DashboardStats({
  totalClearingToday,
  chequesClearingTomorrow,
  totalSupplierDebt,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Cheques clearing today"
        value={formatCurrency(totalClearingToday)}
        description="Due for clearance"
        icon={<CreditCard className="h-5 w-5" />}
        highlighted
        variant="default"
      />
      <StatCard
        title="Cheques Clearing Tomorrow"
        value={chequesClearingTomorrow}
        description="Pending cheques"
        icon={<CalendarClock className="h-5 w-5" />}
        variant="success"
      />
      <StatCard
        title="Total Supplier Debt"
        value={formatCurrency(totalSupplierDebt)}
        description="Outstanding balance"
        icon={<Building2 className="h-5 w-5" />}
        variant="warning"
      />
    </div>
  );
}
