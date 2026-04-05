"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, ArrowUpDown, Phone } from "lucide-react";
import { formatCurrency, type Supplier } from "@/lib/data";
import { cn } from "@/lib/utils";

interface SupplierPriorityTableProps {
  suppliers: Supplier[];
}

type SortKey = "amount" | "age";

export function SupplierPriorityTable({ suppliers }: SupplierPriorityTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>("amount");

  const getPriority = (daysOld: number): { label: string; color: string } => {
    if (daysOld > 30) {
      return { label: "High", color: "bg-destructive text-white" };
    } else if (daysOld > 14) {
      return { label: "Medium", color: "bg-warning text-warning-foreground" };
    } else {
      return { label: "Low", color: "bg-success text-success-foreground" };
    }
  };

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    if (sortBy === "amount") {
      return b.totalDebt - a.totalDebt;
    } else {
      return b.oldestUnpaidBillDays - a.oldestUnpaidBillDays;
    }
  });

  // Get due date based on oldest unpaid bill
  const getDueDate = (daysOld: number): string => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - daysOld);
    return dueDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">
            Supplier Priority
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === "amount" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSortBy("amount")}
            className="h-8 text-xs"
          >
            <ArrowUpDown className="mr-1 h-3 w-3" />
            Amount
          </Button>
          <Button
            variant={sortBy === "age" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSortBy("age")}
            className="h-8 text-xs"
          >
            <ArrowUpDown className="mr-1 h-3 w-3" />
            Oldest
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <ScrollArea className="h-[280px]">
          <div className="flex flex-col gap-2 px-2">
            {sortedSuppliers.map((supplier) => {
              const priority = getPriority(supplier.oldestUnpaidBillDays);
              return (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">
                        {supplier.name}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                          priority.color
                        )}
                      >
                        {priority.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <a
                        href={`tel:${supplier.phone}`}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        <Phone className="h-3 w-3" />
                        {supplier.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 ml-3">
                    <span className="font-bold text-foreground">
                      {formatCurrency(supplier.totalDebt)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Due: {getDueDate(supplier.oldestUnpaidBillDays)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
