"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar, ChevronRight } from "lucide-react";
import { formatCurrency, type DailyTotal } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ChequeCalendarProps {
  calendar: DailyTotal[];
}

function formatCalendarDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function ChequeCalendar({ calendar }: ChequeCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Upcoming Cheques</CardTitle>
        </div>
        <Link
          href="/ledger"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View All <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <p className="mb-3 px-2 text-xs text-muted-foreground">
          Working days only (Mon-Fri). Cheques clear on the next business day.
        </p>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 px-2">
            {calendar.map((day, index) => {
              const isToday = day.date.getTime() === today.getTime();
              const hasAmount = day.amount > 0;

              return (
                <div
                  key={index}
                  className={cn(
                    "flex min-w-[120px] flex-col rounded-xl border p-3 transition-all",
                    isToday
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isToday ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {isToday ? "Today" : formatCalendarDate(day.date)}
                  </span>
                  <span
                    className={cn(
                      "mt-1 text-lg font-bold",
                      hasAmount ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {hasAmount ? formatCurrency(day.amount) : "—"}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {day.count} {day.count === 1 ? "cheque" : "cheques"}
                  </span>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
