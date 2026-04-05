"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Phone,
  MapPin,
  Package,
  AlertTriangle,
  Shield,
  ArrowUpDown,
  Users,
} from "lucide-react";
import { useSuppliers } from "@/lib/store";
import { formatCurrency, type Supplier } from "@/lib/data";
import { cn } from "@/lib/utils";

type SortOption = "name" | "priority" | "trust" | "debt";

export default function SuppliersPage() {
  const { suppliers, isLoading } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [showHighPriorityOnly, setShowHighPriorityOnly] = useState(false);

  const processedSuppliers = useMemo(() => {
    let filtered = suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.productsSupplied.some((p) =>
          p.toLowerCase().includes(searchQuery.toLowerCase())
        );

      if (showHighPriorityOnly) {
        return matchesSearch && supplier.oldestUnpaidBillDays > 30;
      }

      return matchesSearch;
    });

    // Sort suppliers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          // High priority (unpaid > 30 days) first, then by oldest unpaid days
          const aHighPriority = a.oldestUnpaidBillDays > 30 ? 1 : 0;
          const bHighPriority = b.oldestUnpaidBillDays > 30 ? 1 : 0;
          if (bHighPriority !== aHighPriority) return bHighPriority - aHighPriority;
          return b.oldestUnpaidBillDays - a.oldestUnpaidBillDays;
        case "name":
          return a.name.localeCompare(b.name);
        case "trust":
          return b.trustScore - a.trustScore;
        case "debt":
          return b.totalDebt - a.totalDebt;
        default:
          return 0;
      }
    });

    return filtered;
  }, [suppliers, searchQuery, sortBy, showHighPriorityOnly]);

  const highPriorityCount = suppliers.filter(
    (s) => s.oldestUnpaidBillDays > 30
  ).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl text-balance">
              Supplier Directory
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your supplier relationships
            </p>
          </div>
          {highPriorityCount > 0 && (
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 border-destructive/50 bg-destructive/10 text-destructive self-start sm:self-auto"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {highPriorityCount} High Priority
            </Badge>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={showHighPriorityOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHighPriorityOnly(!showHighPriorityOnly)}
              className="gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              High Priority
            </Button>
            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        </div>

        {/* Supplier Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat
            label="Total Suppliers"
            value={suppliers.length}
            icon={<Users className="h-4 w-4" />}
          />
          <MiniStat
            label="High Priority"
            value={highPriorityCount}
            icon={<AlertTriangle className="h-4 w-4" />}
            className="text-destructive"
          />
          <MiniStat
            label="Avg Trust Score"
            value={`${Math.round(
              suppliers.reduce((sum, s) => sum + s.trustScore, 0) /
                suppliers.length
            )}%`}
            icon={<Shield className="h-4 w-4" />}
            className="text-success"
          />
          <MiniStat
            label="Total Debt"
            value={formatCurrency(
              suppliers.reduce((sum, s) => sum + s.totalDebt, 0)
            )}
            icon={<Package className="h-4 w-4" />}
          />
        </div>

        {/* Supplier List */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : processedSuppliers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No suppliers found
                </p>
              </CardContent>
            </Card>
          ) : (
            processedSuppliers.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function SortDropdown({
  sortBy,
  onSortChange,
}: {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}) {
  const options: { value: SortOption; label: string }[] = [
    { value: "priority", label: "Priority" },
    { value: "name", label: "Name" },
    { value: "trust", label: "Trust Score" },
    { value: "debt", label: "Total Debt" },
  ];

  return (
    <div className="relative">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="h-9 appearance-none rounded-lg border border-input bg-background px-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            Sort: {option.label}
          </option>
        ))}
      </select>
      <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <div className={cn("text-muted-foreground", className)}>{icon}</div>
        <div className="flex flex-col">
          <span className={cn("text-lg font-bold", className)}>{value}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  const isHighPriority = supplier.oldestUnpaidBillDays > 30;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        isHighPriority && "border-destructive/50"
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Priority Indicator */}
          {isHighPriority && (
            <div className="w-1 flex-shrink-0 bg-destructive" />
          )}

          <div className="flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    {supplier.name}
                  </h3>
                  {isHighPriority && (
                    <Badge
                      variant="outline"
                      className="border-destructive/50 bg-destructive/10 text-destructive text-xs"
                    >
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      High Priority
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <a
                    href={`tel:${supplier.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {supplier.phone}
                  </a>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {supplier.location}
                  </span>
                </div>
              </div>

              {/* Trust Score */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <Shield
                    className={cn(
                      "h-4 w-4",
                      supplier.trustScore >= 80
                        ? "text-success"
                        : supplier.trustScore >= 60
                        ? "text-warning"
                        : "text-destructive"
                    )}
                  />
                  <span
                    className={cn(
                      "text-lg font-bold",
                      supplier.trustScore >= 80
                        ? "text-success"
                        : supplier.trustScore >= 60
                        ? "text-warning"
                        : "text-destructive"
                    )}
                  >
                    {supplier.trustScore}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Trust Score</span>
              </div>
            </div>

            {/* Products */}
            <div className="flex flex-wrap gap-1.5">
              {supplier.productsSupplied.map((product) => (
                <Badge
                  key={product}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  <Package className="mr-1 h-3 w-3" />
                  {product}
                </Badge>
              ))}
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Outstanding Debt</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(supplier.totalDebt)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground">Oldest Unpaid</span>
                <span
                  className={cn(
                    "font-semibold",
                    isHighPriority ? "text-destructive" : "text-foreground"
                  )}
                >
                  {supplier.oldestUnpaidBillDays} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
