"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CashCheckWarning } from "@/components/cash-check-warning";
import { DashboardStats } from "@/components/dashboard-stats";
import { ChequeCalendar } from "@/components/cheque-calendar";
import { SupplierPriorityTable } from "@/components/supplier-priority-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, Users } from "lucide-react";
import { useCheques, useSuppliers } from "@/lib/store";
import {
  getChequesClearingTomorrowCount,
  getTotalClearingToday,
  getTotalClearingTomorrow,
  getTotalSupplierDebt,
  getUpcomingChequeCalendar,
} from "@/lib/data";

export default function DashboardPage() {
  const { cheques, isLoading: chequesLoading } = useCheques();
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();

  // Single source of truth for "clearing today" across dashboard components.
  const totalClearingToday = getTotalClearingToday(cheques);
  const totalClearingTomorrow = getTotalClearingTomorrow(cheques);
  const chequesClearingTomorrowCount = getChequesClearingTomorrowCount(cheques);

  const totalSupplierDebt = getTotalSupplierDebt(suppliers);
  const calendar = getUpcomingChequeCalendar(cheques);

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
        totalClearingToday={totalClearingToday}
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
          totalClearingTomorrow={totalClearingTomorrow}
          chequesClearingTomorrowCount={chequesClearingTomorrowCount}
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

            {/* Additional Quick Links */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
