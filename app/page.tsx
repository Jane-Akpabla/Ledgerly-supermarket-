"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CashCheckWarning } from "@/components/cash-check-warning";
import { DashboardStats } from "@/components/dashboard-stats";
import { ChequeCalendar } from "@/components/cheque-calendar";
import { SupplierPriorityTable } from "@/components/supplier-priority-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Camera, BookOpen, Users } from "lucide-react";
import { useCheques, useSuppliers } from "@/lib/store";
import { getTotalSupplierDebt, getUpcomingChequeCalendar } from "@/lib/data";

export default function DashboardPage() {
  const { cheques, isLoading: chequesLoading } = useCheques();
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();

  // Helper to get next working day (Mon-Fri)
  const getNextWorkingDay = (): Date => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();

    // If Saturday (6), add 2 days to get Monday
    // If Sunday (0), add 1 day to get Monday
    if (day === 6) {
      date.setDate(date.getDate() + 2);
    } else if (day === 0) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  };

  // For display: "Today" means next working day if weekend
  const displayDate = getNextWorkingDay();

  // Calculate total clearing on next working day (for stats display)
  const totalClearingToday = cheques
    .filter((c) => {
      const clearDate = new Date(c.clearingDate);
      clearDate.setHours(0, 0, 0, 0);
      return (
        clearDate.getTime() === displayDate.getTime() && c.status === "pending"
      );
    })
    .reduce((sum, c) => sum + c.amount, 0);

  // Calculate total clearing in next 24 hours (today + tomorrow) for banner
  const totalClearingNext24Hours = cheques
    .filter((c) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const clearDate = new Date(c.clearingDate);
      clearDate.setHours(0, 0, 0, 0);

      return (
        (clearDate.getTime() === now.getTime() ||
          clearDate.getTime() === tomorrow.getTime()) &&
        c.status === "pending"
      );
    })
    .reduce((sum, c) => sum + c.amount, 0);

  const chequesClearingTomorrow = cheques.filter((c) => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const clearDate = new Date(c.clearingDate);
    clearDate.setHours(0, 0, 0, 0);
    return clearDate.getTime() === tomorrow.getTime() && c.status === "pending";
  }).length;

  const totalSupplierDebt = getTotalSupplierDebt();
  const calendar = getUpcomingChequeCalendar();

  if (chequesLoading || suppliersLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Critical Warning Banner - Always at very top */}
      <CashCheckWarning
        totalClearingToday={totalClearingNext24Hours}
        averageDailySales={50000}
      />

      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl text-balance">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor your supermarket&apos;s financial health
          </p>
        </div>

        {/* Stats Overview */}
        <DashboardStats
          totalClearingToday={totalClearingToday}
          chequesClearingTomorrow={chequesClearingTomorrow}
          totalSupplierDebt={totalSupplierDebt}
        />

        {/* Upcoming Cheque Calendar */}
        <ChequeCalendar calendar={calendar} />

        {/* Two Column Layout for Table and Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Supplier Priority Table */}
          <SupplierPriorityTable suppliers={suppliers} />

          {/* Quick Actions */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground">
              Quick Actions
            </h2>

            {/* Primary Action - Add New Cheque */}
            <Button
              asChild
              size="lg"
              className="h-14 w-full text-base font-semibold"
            >
              <Link href="/add-cheque">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Cheque
              </Link>
            </Button>

            {/* Secondary Action - Scan Ledger */}
            <Button asChild variant="outline" size="lg" className="h-12 w-full">
              <Link href="/scan">
                <Camera className="mr-2 h-5 w-5" />
                Scan Ledger Page
              </Link>
            </Button>

            {/* Additional Quick Links */}
            <div className="grid grid-cols-2 gap-3">
              <QuickActionCard
                title="View Ledger"
                description="Check all cheques"
                href="/ledger"
                icon={<BookOpen className="h-4 w-4" />}
              />
              <QuickActionCard
                title="Suppliers"
                description="Manage vendors"
                href="/suppliers"
                icon={<Users className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-muted-foreground/30 hover:shadow-sm"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="font-medium text-foreground">{title}</span>
      </div>
      <span className="mt-1 text-xs text-muted-foreground">{description}</span>
    </Link>
  );
}
