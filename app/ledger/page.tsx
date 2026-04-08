"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Calendar,
  CreditCard,
} from "lucide-react";
import {
  useCheques,
  updateChequeStatus,
  updateChequeClearingDate,
  deleteCheque,
} from "@/lib/store";
import {
  formatCurrency,
  formatDate,
  type Cheque,
  getClearingDate,
} from "@/lib/data";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "pending" | "cleared" | "bounced" | "stopped";

export default function LedgerPage() {
  const { cheques, isLoading } = useCheques();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredCheques = cheques.filter((cheque) => {
    const matchesSearch =
      cheque.chequeNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cheque.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cheque.bank.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || cheque.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: Cheque["status"]) => {
    await updateChequeStatus(id, status);
  };

  const handleDeleteCheque = async (id: string) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this cheque? This action cannot be undone.",
    );

    if (!isConfirmed) return;
    await deleteCheque(id);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl text-balance">
              Cheque Ledger
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track and manage all supplier cheques
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/add-cheque">
              <Plus className="mr-2 h-4 w-4" />
              Add Cheque
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by cheque no, supplier, or bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <FilterButton
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            >
              All
            </FilterButton>
            <FilterButton
              active={statusFilter === "pending"}
              onClick={() => setStatusFilter("pending")}
            >
              <Clock className="mr-1 h-3 w-3" />
              Pending
            </FilterButton>
            <FilterButton
              active={statusFilter === "cleared"}
              onClick={() => setStatusFilter("cleared")}
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Cleared
            </FilterButton>
            <FilterButton
              active={statusFilter === "bounced"}
              onClick={() => setStatusFilter("bounced")}
            >
              <XCircle className="mr-1 h-3 w-3" />
              Bounced
            </FilterButton>
            <FilterButton
              active={statusFilter === "stopped"}
              onClick={() => setStatusFilter("stopped")}
            >
              <Clock className="mr-1 h-3 w-3" />
              Stopped
            </FilterButton>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStatCard
            label="Pending"
            value={cheques.filter((c) => c.status === "pending").length}
            color="text-warning"
          />
          <MiniStatCard
            label="Cleared"
            value={cheques.filter((c) => c.status === "cleared").length}
            color="text-success"
          />
          <MiniStatCard
            label="Bounced"
            value={cheques.filter((c) => c.status === "bounced").length}
            color="text-destructive"
          />
          <MiniStatCard
            label="Stopped"
            value={cheques.filter((c) => c.status === "stopped").length}
            color="text-muted-foreground"
          />
        </div>

        {/* Cheque List */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredCheques.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No cheques found
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCheques.map((cheque) => (
              <ChequeCard
                key={cheque.id}
                cheque={cheque}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteCheque}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      )}
    >
      {children}
    </button>
  );
}

function MiniStatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-3">
        <span className={cn("text-2xl font-bold", color)}>{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function ChequeCard({
  cheque,
  onStatusChange,
  onDelete,
}: {
  cheque: Cheque;
  onStatusChange: (id: string, status: Cheque["status"]) => void;
  onDelete: (id: string) => void;
}) {
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const handleReschedule = async () => {
    const newIssueDate = new Date(selectedYear, selectedMonth, selectedDay);
    const newClearingDate = getClearingDate(newIssueDate);
    await updateChequeClearingDate(cheque.id, newClearingDate);
    await onStatusChange(cheque.id, "pending");
    setShowRescheduleDialog(false);
  };
  const statusConfig = {
    pending: {
      badge: "bg-warning/10 text-warning border-warning/30",
      icon: Clock,
      label: "Pending",
    },
    cleared: {
      badge: "bg-success/10 text-success border-success/30",
      icon: CheckCircle2,
      label: "Cleared",
    },
    bounced: {
      badge: "bg-destructive/10 text-destructive border-destructive/30",
      icon: XCircle,
      label: "Bounced",
    },
    stopped: {
      badge: "bg-muted/10 text-muted-foreground border-muted/30",
      icon: Clock,
      label: "Stopped",
    },
  };

  const config = statusConfig[cheque.status];
  const StatusIcon = config.icon;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Status Indicator */}
          <div
            className={cn(
              "w-1 flex-shrink-0",
              cheque.status === "pending" && "bg-warning",
              cheque.status === "cleared" && "bg-success",
              cheque.status === "bounced" && "bg-destructive",
              cheque.status === "stopped" && "bg-muted-foreground",
            )}
          />

          <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Main Info */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {cheque.chequeNo}
                </span>
                <Badge variant="outline" className={config.badge}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {cheque.supplier}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5" />
                  {cheque.bank}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(new Date(cheque.clearingDate))}
                </span>
              </div>
            </div>

            {/* Amount and Actions */}
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(cheque.amount)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {cheque.status !== "cleared" && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(cheque.id, "cleared")}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                      Mark as Cleared
                    </DropdownMenuItem>
                  )}
                  {cheque.status !== "bounced" && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(cheque.id, "bounced")}
                    >
                      <XCircle className="mr-2 h-4 w-4 text-destructive" />
                      Mark as Bounced
                    </DropdownMenuItem>
                  )}
                  {cheque.status !== "stopped" && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(cheque.id, "stopped")}
                    >
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      Stop Cheque
                    </DropdownMenuItem>
                  )}
                  {cheque.status === "stopped" && (
                    <DropdownMenuItem
                      onClick={() => setShowRescheduleDialog(true)}
                    >
                      <Calendar className="mr-2 h-4 w-4 text-primary" />
                      Reschedule
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => onDelete(cheque.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    Delete Cheque
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Reschedule Dialog */}
      <Dialog
        open={showRescheduleDialog}
        onOpenChange={setShowRescheduleDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Cheque</DialogTitle>
            <DialogDescription>
              Select a new issue date for this cheque. The clearing date will be
              calculated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="day">Day</Label>
                <Select
                  value={selectedDay.toString()}
                  onValueChange={(value) => setSelectedDay(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="month">Month</Label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026, 2027, 2028].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              New clearing date:{" "}
              {formatDate(
                getClearingDate(
                  new Date(selectedYear, selectedMonth, selectedDay),
                ),
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRescheduleDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReschedule}>Reschedule Cheque</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
