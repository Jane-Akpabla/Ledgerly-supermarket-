"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/data";

interface CashCheckWarningProps {
  totalClearingToday: number;
  averageDailySales?: number;
}

export function CashCheckWarning({
  totalClearingToday,
  averageDailySales = 50000,
}: CashCheckWarningProps) {
  const isOverLimit = totalClearingToday > averageDailySales;

  if (totalClearingToday <= 0) {
    return null;
  }

  if (!isOverLimit) {
    return (
      <div className="w-full bg-success px-4 py-3 text-white shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-bold sm:text-base">
            All good: {formatCurrency(totalClearingToday)} clearing today is
            within normal range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-destructive px-4 py-3 text-white shadow-lg">
      <div className="flex items-center justify-center gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-bold sm:text-base">
          URGENT: {formatCurrency(totalClearingToday)} clearing today. Ensure
          bank balance is sufficient.
        </p>
      </div>
    </div>
  );
}
